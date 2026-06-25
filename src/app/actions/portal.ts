"use server";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/content";
import { requireAdmin, requireUser } from "@/lib/portal/auth";
import { requestExternalAiInsight } from "@/lib/portal/ai-providers";
import {
  buildConsultantBrief,
  buildCustomerSafeSummary,
} from "@/lib/portal/automation";
import { applyPortalAutomationRules } from "@/lib/portal/automation-rules";
import { appUrl } from "@/lib/portal/config";
import { sendPortalEmail } from "@/lib/portal/email";
import {
  createProjectForAdmin,
  findUserByEmail,
  getProjectAccess,
  getProjectBundle,
  id,
  listProjectsForUser,
  mutateStore,
  readStore,
  upsertIntelligence,
} from "@/lib/portal/store";
import { createInvoiceCheckoutUrl } from "@/lib/portal/payments";
import { hashPassword } from "@/lib/portal/password";
import { savePortalFile } from "@/lib/portal/storage";
import {
  createFinalReportPdf,
  createProjectBriefPdf,
  createProposalPdf,
} from "@/lib/portal/documents";
import {
  buildChangeRequests,
  buildDecisionCenter,
  buildProjectDiagnosis,
  formatDiagnosisReport,
  shouldSendUserNotification,
  type NotificationPreferenceKey,
  USER_NOTIFICATION_PREFS_MARKER,
} from "@/lib/portal/operations";
import {
  buildTemplatePrompt,
  effectiveConsultingTemplates,
  getEffectiveConsultingTemplate,
  getConsultingTemplate,
  matchConsultingTemplate,
  mergeTemplateIntake,
} from "@/lib/portal/templates";
import type {
  AsdarStage,
  Invoice,
  PortalStore,
  ProjectMilestone,
  ProjectStatus,
  ProjectTask,
  Visibility,
} from "@/lib/portal/types";
import { createAuthToken } from "@/lib/portal/tokens";

function safeLocale(value: FormDataEntryValue | null): Locale {
  const raw = String(value || "de");
  return isLocale(raw) ? raw : "de";
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function visibility(value: string): Visibility {
  return value === "customer" ? "customer" : "internal";
}

function asdar(value: string): AsdarStage {
  if (
    value === "analyse" ||
    value === "structure" ||
    value === "digitize" ||
    value === "automate" ||
    value === "realize"
  ) {
    return value;
  }
  return "analyse";
}

function status(value: string): ProjectStatus {
  if (
    value === "discovery" ||
    value === "analysis" ||
    value === "implementation" ||
    value === "paused" ||
    value === "completed"
  ) {
    return value;
  }
  return "discovery";
}

function taskStatus(value: string): ProjectTask["status"] {
  if (value === "done" || value === "doing" || value === "todo") return value;
  return "todo";
}

function milestoneStatus(value: string): ProjectMilestone["status"] {
  if (value === "done" || value === "active" || value === "planned") {
    return value;
  }
  return "planned";
}

function addAuditUpdate({
  store,
  projectId,
  userId,
  title,
  body,
}: {
  store: PortalStore;
  projectId: string;
  userId: string;
  title: string;
  body: string;
}) {
  const project = store.projects.find((entry) => entry.id === projectId);
  if (!project) return;

  store.updates.push({
    id: id("update"),
    projectId,
    title: `Audit: ${title}`,
    body,
    visibility: "internal",
    asdarStage: project.asdarStage,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  });
}

function addInternalMarker({
  store,
  projectId,
  userId,
  title,
  marker,
  body,
}: {
  store: PortalStore;
  projectId: string;
  userId: string;
  title: string;
  marker: string;
  body: string;
}) {
  const project = store.projects.find((entry) => entry.id === projectId);
  if (!project) return;

  store.updates.push({
    id: id("update"),
    projectId,
    title: `Audit: ${title}`,
    body: `${marker}\n${body}`,
    visibility: "internal",
    asdarStage: project.asdarStage,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  });
}

function cents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function safeFilename(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w. -]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 120);
}

function adminProjectPath(locale: Locale, projectId: string) {
  return `/${locale}/portal/admin/projects/${projectId}`;
}

function customerProjectPath(locale: Locale, projectId: string) {
  return `/${locale}/portal/projects/${projectId}`;
}

function appendNote(existing: string, title: string, body: string) {
  if (!body) return existing;
  return [existing, `${title}\n${body}`].filter(Boolean).join("\n\n");
}

function lines(formData: FormData, key: string) {
  return text(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

function markerLine(marker: string, payload: unknown) {
  return `${marker}:${JSON.stringify(payload)}`;
}

function decisionStatus(value: string) {
  return value === "approved" ||
    value === "rejected" ||
    value === "needs_changes"
    ? value
    : "proposed";
}

function changeRequestStatus(value: string) {
  if (
    value === "scoping" ||
    value === "quoted" ||
    value === "accepted" ||
    value === "in_progress" ||
    value === "done" ||
    value === "rejected"
  ) {
    return value;
  }
  return "new";
}

async function requireProjectAccessForAction(locale: Locale, projectId: string) {
  const user = await requireUser(locale);
  const store = await readStore();
  if (!getProjectAccess(store, user.id, projectId)) {
    redirect(`/${locale}/portal`);
  }
  return user;
}

function revalidateProjectViews(locale: Locale, projectId: string) {
  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(customerProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal`);
}

function randomTemporaryPassword() {
  return `${randomBytes(18).toString("base64url")}!7`;
}

async function notifyProjectCustomers({
  locale,
  projectId,
  subject,
  body,
  kind = "projectUpdates",
}: {
  locale: Locale;
  projectId: string;
  subject: string;
  body: string;
  kind?: NotificationPreferenceKey;
}) {
  const store = await readStore();
  const bundle = getProjectBundle(store, projectId);
  if (!bundle || bundle.customerUsers.length === 0) return;

  const projectUrl = `${appUrl()}/${locale}/portal/projects/${projectId}`;
  await Promise.all(
    bundle.customerUsers.map((customer) => {
      const customerBundles = listProjectsForUser(store, customer.id)
        .map((project) => getProjectBundle(store, project.id))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
      if (!shouldSendUserNotification(customer.id, customerBundles, kind)) {
        return Promise.resolve();
      }

      return sendPortalEmail({
        to: customer.email,
        subject,
        text: [
          `Hallo ${customer.name},`,
          "",
          body,
          "",
          `Projekt öffnen: ${projectUrl}`,
          "",
          "Viele Grüße",
          "Assad Dar",
        ].join("\n"),
      });
    }),
  );
}

export async function createProjectAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);

  const company = text(formData, "company");
  const customerName = text(formData, "customerName");
  const sourceStore = await readStore();
  const template = getEffectiveConsultingTemplate(
    text(formData, "templateId"),
    sourceStore.templateOverrides,
  );
  const industry =
    text(formData, "industry") || template?.industryLabel || "Noch nicht gesetzt";
  const projectName =
    text(formData, "projectName") || template?.projectName || "Neues ASDAR Projekt";
  const summary = text(formData, "summary") || template?.summary || "";
  const customerEmail = text(formData, "customerEmail").toLowerCase();

  if (!company) redirect(`/${locale}/portal/admin?error=company`);

  const projectId = await createProjectForAdmin({
    userId: user.id,
    company,
    industry,
    projectName,
    summary,
    customerEmail,
    template,
  });

  const setupProcess = text(formData, "setupProcess");
  const setupBottleneck = text(formData, "setupBottleneck");
  const setupMetric = text(formData, "setupMetric");
  const setupDecisionMakers = text(formData, "setupDecisionMakers");
  const setupPilot = text(formData, "setupPilot");

  const inviteResult = await mutateStore<{
    rawToken: string;
    email: string;
    name: string;
    projectName: string;
    company: string;
  } | null>((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return null;
    const now = new Date().toISOString();

    if (
      setupProcess ||
      setupBottleneck ||
      setupMetric ||
      setupDecisionMakers ||
      setupPilot
    ) {
      upsertIntelligence(store, projectId, {
        companyContext: appendNote(
          bundle.intelligence.companyContext,
          "Setup Wizard: wichtiger Prozess",
          setupProcess,
        ),
        stakeholders: appendNote(
          bundle.intelligence.stakeholders,
          "Setup Wizard: Entscheider und Stakeholder",
          setupDecisionMakers,
        ),
        issues: appendNote(
          bundle.intelligence.issues,
          "Setup Wizard: Hauptengpass",
          setupBottleneck,
        ),
        goals: appendNote(
          bundle.intelligence.goals,
          "Setup Wizard: messbares Ziel",
          setupMetric,
        ),
        currentTools: bundle.intelligence.currentTools,
        dataSituation: bundle.intelligence.dataSituation,
        constraints: bundle.intelligence.constraints,
        opportunities: appendNote(
          bundle.intelligence.opportunities,
          "Setup Wizard: erster Pilot",
          setupPilot,
        ),
        internalNotes: appendNote(
          bundle.intelligence.internalNotes,
          "Projekt beim Anlegen gefuehrt vorbereitet",
          [
            setupProcess && `Prozess: ${setupProcess}`,
            setupBottleneck && `Engpass: ${setupBottleneck}`,
            setupMetric && `Messziel: ${setupMetric}`,
            setupDecisionMakers && `Stakeholder: ${setupDecisionMakers}`,
            setupPilot && `Pilot: ${setupPilot}`,
          ]
            .filter(Boolean)
            .join("\n"),
        ),
      });

      if (setupPilot) {
        store.tasks.push({
          id: id("task"),
          projectId,
          title: `Pilot vorbereiten: ${setupPilot}`,
          owner: "assad",
          status: "todo",
          visibleToCustomer: true,
          createdAt: now,
        });
      }

      if (setupProcess || setupPilot) {
        store.milestones.push({
          id: id("milestone"),
          projectId,
          title: "Projekt-Setup und erster Beratungsfokus definiert",
          status: "active",
          visibleToCustomer: true,
          createdAt: now,
        });
        store.updates.push({
          id: id("update"),
          projectId,
          title: "Projekt-Setup vorbereitet",
          body: [
            "Das Projekt wurde angelegt und die ersten Informationen wurden strukturiert.",
            setupPilot
              ? `Erster Fokus: ${setupPilot}`
              : setupProcess
                ? `Erster Fokus: ${setupProcess}`
                : "",
            setupMetric ? `Messziel: ${setupMetric}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
          visibility: "customer",
          asdarStage: bundle.project.asdarStage,
          createdBy: user.id,
          createdAt: now,
        });
      }
    }

    if (!customerEmail.includes("@")) return null;

    let customer = findUserByEmail(store, customerEmail);
    if (customer && customer.role !== "customer") return null;

    if (!customer) {
      customer = {
        id: id("user"),
        name: customerName || customerEmail,
        email: customerEmail,
        passwordHash: hashPassword(randomTemporaryPassword()),
        role: "customer",
        createdAt: now,
      };
      store.users.push(customer);
    } else if (customerName && customer.name === customer.email) {
      customer.name = customerName;
    }

    const exists = store.projectMembers.some(
      (member) => member.projectId === projectId && member.userId === customer.id,
    );
    if (!exists) {
      store.projectMembers.push({
        id: id("member"),
        projectId,
        userId: customer.id,
        role: "client_owner",
        createdAt: now,
      });
    }

    const token = createAuthToken(customer.id, "project_invite", 60 * 24 * 7);
    store.authTokens.push(token.record);
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kunde automatisch eingeladen",
      body: `${customer.email} wurde beim Projektstart eingeladen und zugeordnet.`,
    });

    return {
      rawToken: token.rawToken,
      email: customer.email,
      name: customer.name,
      projectName,
      company,
    };
  });

  if (inviteResult) {
    const inviteUrl = `${appUrl()}/${locale}/invite?token=${encodeURIComponent(
      inviteResult.rawToken,
    )}`;
    await sendPortalEmail({
      to: inviteResult.email,
      subject: `Einladung zum Assad Dar Portal: ${inviteResult.projectName}`,
      text: [
        `Hallo ${inviteResult.name},`,
        "",
        `Assad Dar hat ein Projektportal fuer ${inviteResult.company} vorbereitet.`,
        "Bitte legen Sie ueber diesen Link Ihr Passwort fest:",
        inviteUrl,
        "",
        "Der Link ist 7 Tage gueltig.",
        "",
        "Viele Gruesse",
        "Assad Dar",
      ].join("\n"),
    });
  }

  revalidatePath(`/${locale}/portal`);
  redirect(adminProjectPath(locale, projectId));
}

export async function runPortalAutomationsAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const returnTo = text(formData, "returnTo") || `/${locale}/portal/admin`;

  const summary = await mutateStore((store) =>
    applyPortalAutomationRules({ store, userId: user.id }),
  );

  revalidatePath(`/${locale}/portal/admin`);
  revalidatePath(`/${locale}/portal/admin/today`);
  revalidatePath(`/${locale}/portal/admin/drafts`);
  revalidatePath(`/${locale}/portal/admin/pipeline`);
  revalidatePath(`/${locale}/portal`);
  redirect(
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}saved=automation&tasks=${summary.tasksCreated}&insights=${summary.insightsCreated}`,
  );
}

export async function runProjectAutomationsAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const returnTo =
    text(formData, "returnTo") ||
    `${adminProjectPath(locale, projectId)}?view=guidance`;

  const summary = await mutateStore((store) =>
    applyPortalAutomationRules({ store, userId: user.id, projectId }),
  );

  revalidateProjectViews(locale, projectId);
  revalidatePath(`/${locale}/portal/admin`);
  revalidatePath(`/${locale}/portal/admin/today`);
  revalidatePath(`/${locale}/portal/admin/drafts`);
  revalidatePath(`/${locale}/portal/admin/pipeline`);
  redirect(
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}saved=automation&tasks=${summary.tasksCreated}&insights=${summary.insightsCreated}`,
  );
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireUser(locale);

  const saved = await mutateStore((store) => {
    const anchorProject = listProjectsForUser(store, user.id)[0];
    if (!anchorProject) return false;
    const now = new Date().toISOString();

    store.updates.push({
      id: id("update"),
      projectId: anchorProject.id,
      title: "Audit: Notification preferences",
      body: markerLine(USER_NOTIFICATION_PREFS_MARKER, {
        userId: user.id,
        projectUpdates: checkbox(formData, "projectUpdates"),
        tasks: checkbox(formData, "tasks"),
        files: checkbox(formData, "files"),
        invoices: checkbox(formData, "invoices"),
        reminders: checkbox(formData, "reminders"),
        appointments: checkbox(formData, "appointments"),
        weeklySummary: checkbox(formData, "weeklySummary"),
        updatedAt: now,
      }),
      visibility: "internal",
      asdarStage: anchorProject.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    return true;
  });

  revalidatePath(`/${locale}/portal/settings`);
  redirect(
    `/${locale}/portal/settings?${saved ? "saved=notifications" : "error=notifications"}`,
  );
}

export async function saveTemplateOverrideAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const templateId = text(formData, "templateId");
  const sourceStore = await readStore();
  const base = getConsultingTemplate(templateId);
  if (!base) redirect(`/${locale}/portal/admin/templates?error=template`);

  await mutateStore((store) => {
    const now = new Date().toISOString();
    const existing = store.templateOverrides.find(
      (entry) => entry.templateId === templateId,
    );
    const next = {
      id: existing?.id ?? id("template"),
      templateId,
      label: text(formData, "label") || base.label,
      bestFor: text(formData, "bestFor") || base.bestFor,
      kickoffGoal: text(formData, "kickoffGoal") || base.kickoffGoal,
      summary: text(formData, "summary") || base.summary,
      discoveryQuestions: lines(formData, "discoveryQuestions"),
      quickWins: lines(formData, "quickWins"),
      automationIdeas: lines(formData, "automationIdeas"),
      risks: lines(formData, "risks"),
      updatedBy: user.id,
      updatedAt: now,
    };

    if (existing) Object.assign(existing, next);
    else store.templateOverrides.push(next);
  });

  const query = sourceStore.templateOverrides.some(
    (entry) => entry.templateId === templateId,
  )
    ? "updated=template"
    : "created=template";
  revalidatePath(`/${locale}/portal/admin/templates`);
  redirect(`/${locale}/portal/admin/templates?${query}#${templateId}`);
}

export async function markNotificationDoneAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const notificationId = text(formData, "notificationId");
  const returnTo = text(formData, "returnTo") || `/${locale}/portal/admin/today`;

  if (!notificationId) redirect(returnTo);

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    addInternalMarker({
      store,
      projectId,
      userId: user.id,
      title: "Notification erledigt",
      marker: `NOTIFICATION_DONE:${notificationId}`,
      body: `${notificationId} wurde als erledigt markiert.`,
    });
  });

  revalidatePath(`/${locale}/portal/admin`);
  revalidatePath(`/${locale}/portal/admin/today`);
  revalidatePath(adminProjectPath(locale, projectId));
  redirect(returnTo);
}

export async function convertNotificationToTaskAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const notificationId = text(formData, "notificationId");
  const taskTitle = text(formData, "taskTitle") || "Notification nachfassen";
  const returnTo = text(formData, "returnTo") || `/${locale}/portal/admin/today`;

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();

    store.tasks.push({
      id: id("task"),
      projectId,
      title: taskTitle,
      owner: "assad",
      status: "todo",
      visibleToCustomer: false,
      createdAt: now,
    });

    addInternalMarker({
      store,
      projectId,
      userId: user.id,
      title: "Notification in Aufgabe umgewandelt",
      marker: notificationId ? `NOTIFICATION_DONE:${notificationId}` : "NOTIFICATION_DONE:manual",
      body: `${taskTitle} wurde aus einer Notification erzeugt.`,
    });
  });

  revalidatePath(`/${locale}/portal/admin`);
  revalidatePath(`/${locale}/portal/admin/today`);
  revalidatePath(adminProjectPath(locale, projectId));
  redirect(returnTo);
}

export async function assignCustomerAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const email = text(formData, "email").toLowerCase();

  const assigned = await mutateStore((store) => {
    const customer = findUserByEmail(store, email);
    const bundle = getProjectBundle(store, projectId);
    if (!customer || customer.role !== "customer" || !bundle) return false;

    const exists = store.projectMembers.some(
      (member) => member.projectId === projectId && member.userId === customer.id,
    );
    if (!exists) {
      store.projectMembers.push({
        id: id("member"),
        projectId,
        userId: customer.id,
        role: "client_owner",
        createdAt: new Date().toISOString(),
      });
    }
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kunde zugeordnet",
      body: `${customer.email} wurde dem Projekt zugeordnet.`,
    });
    return true;
  });

  revalidatePath(adminProjectPath(locale, projectId));
  redirect(`${adminProjectPath(locale, projectId)}?assigned=${assigned ? "1" : "0"}`);
}

export async function inviteCustomerAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const email = text(formData, "email").toLowerCase();
  const name = text(formData, "name") || email;

  if (!email.includes("@")) {
    redirect(`${adminProjectPath(locale, projectId)}?assigned=0`);
  }

  const result = await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return null;

    const now = new Date().toISOString();
    let customer = findUserByEmail(store, email);
    if (customer && customer.role !== "customer") return null;

    if (!customer) {
      customer = {
        id: id("user"),
        name,
        email,
        passwordHash: hashPassword(randomTemporaryPassword()),
        role: "customer",
        createdAt: now,
      };
      store.users.push(customer);
    } else if (name && customer.name === customer.email) {
      customer.name = name;
    }

    const exists = store.projectMembers.some(
      (member) => member.projectId === projectId && member.userId === customer.id,
    );
    if (!exists) {
      store.projectMembers.push({
        id: id("member"),
        projectId,
        userId: customer.id,
        role: "client_owner",
        createdAt: now,
      });
    }

    const token = createAuthToken(customer.id, "project_invite", 60 * 24 * 7);
    store.authTokens.push(token.record);
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kundeneinladung gesendet",
      body: `${customer.email} wurde eingeladen und dem Projekt zugeordnet.`,
    });
    return {
      rawToken: token.rawToken,
      email: customer.email,
      name: customer.name,
      projectName: bundle.project.name,
      company: bundle.organization.name,
    };
  });

  if (!result) redirect(`${adminProjectPath(locale, projectId)}?assigned=0`);

  const inviteUrl = `${appUrl()}/${locale}/invite?token=${encodeURIComponent(
    result.rawToken,
  )}`;
  await sendPortalEmail({
    to: result.email,
    subject: `Einladung zum Assad Dar Portal: ${result.projectName}`,
    text: [
      `Hallo ${result.name},`,
      "",
      `Assad Dar hat Sie zum Projektportal für ${result.company} eingeladen.`,
      "Bitte legen Sie über diesen Link Ihr Passwort fest:",
      inviteUrl,
      "",
      "Der Link ist 7 Tage gültig.",
      "",
      "Viele Grüße",
      "Assad Dar",
    ].join("\n"),
  });

  revalidatePath(adminProjectPath(locale, projectId));
  redirect(`${adminProjectPath(locale, projectId)}?saved=invite`);
}

export async function updateProjectOverviewAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");

  await mutateStore((store) => {
    const project = store.projects.find((entry) => entry.id === projectId);
    if (!project) return;
    project.name = text(formData, "name") || project.name;
    project.summary = text(formData, "summary");
    project.status = status(text(formData, "status"));
    project.asdarStage = asdar(text(formData, "asdarStage"));
    project.health =
      text(formData, "health") === "red"
        ? "red"
        : text(formData, "health") === "amber"
          ? "amber"
          : "green";
    project.nextStep = text(formData, "nextStep");
    project.updatedAt = new Date().toISOString();

    const org = store.organizations.find(
      (entry) => entry.id === project.organizationId,
    );
    if (org) {
      org.name = text(formData, "company") || org.name;
      org.industry = text(formData, "industry") || org.industry;
      org.website = text(formData, "website") || undefined;
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Projektbasis geändert",
      body: "Projektstatus, ASDAR-Phase, Health oder Stammdaten wurden aktualisiert.",
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=overview`);
}

export async function saveProjectKpiAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const baseline = text(formData, "baseline");
  const target = text(formData, "target");
  const roiHypothesis = text(formData, "roiHypothesis");
  const owner = text(formData, "owner") || "Assad";
  const reviewDate = text(formData, "reviewDate");
  const publishToCustomer = checkbox(formData, "publishToCustomer");

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();
    const snapshot = {
      baseline,
      target,
      roiHypothesis,
      owner,
      reviewDate,
    };

    store.updates.push({
      id: id("update"),
      projectId,
      title: "Audit: KPI und ROI gespeichert",
      body: [
        `KPI_SNAPSHOT:${JSON.stringify(snapshot)}`,
        "",
        `Baseline: ${baseline || "Noch offen"}`,
        `Ziel: ${target || "Noch offen"}`,
        `ROI-Hypothese: ${roiHypothesis || "Noch offen"}`,
        `Owner: ${owner}`,
        reviewDate && `Review: ${reviewDate}`,
      ]
        .filter(Boolean)
        .join("\n"),
      visibility: "internal",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    if (publishToCustomer) {
      store.updates.push({
        id: id("update"),
        projectId,
        title: "Projektziele und Erfolgsmessung aktualisiert",
        body: [
          baseline && `Ausgangslage: ${baseline}`,
          target && `Zielbild: ${target}`,
          roiHypothesis && `Nutzenhypothese: ${roiHypothesis}`,
          reviewDate && `Nächster Review: ${reviewDate}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
        visibility: "customer",
        asdarStage: bundle.project.asdarStage,
        createdBy: user.id,
        createdAt: now,
      });
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "KPI Snapshot aktualisiert",
      body: "Baseline, Ziel, ROI-Hypothese und Review wurden gespeichert.",
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?view=setup&saved=kpi`);
}

export async function saveProjectWorkflowAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const title = text(formData, "title") || "Projekt-Workflow";
  const trigger = text(formData, "trigger");
  const checklist = lines(formData, "checklist");
  const cadence = text(formData, "cadence");
  const automation = lines(formData, "automation");
  const customerPromise = text(formData, "customerPromise");

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();
    const snapshot = {
      id: id("workflow"),
      title,
      trigger,
      checklist,
      cadence,
      automation,
      customerPromise,
      createdAt: now,
      updatedAt: now,
    };

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Workflow: ${title}`,
      body: [
        markerLine("WORKFLOW_SNAPSHOT", snapshot),
        "",
        `Auslöser: ${trigger || "Noch offen"}`,
        checklist.length ? `Checkliste:\n- ${checklist.join("\n- ")}` : "",
        cadence && `Rhythmus: ${cadence}`,
        automation.length
          ? `Automation:\n- ${automation.join("\n- ")}`
          : "",
        customerPromise && `Kundenversprechen: ${customerPromise}`,
      ]
        .filter(Boolean)
        .join("\n"),
      visibility: "internal",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Workflow gespeichert",
      body: `${title} wurde als Beratungsworkflow hinterlegt.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?view=guidance&saved=workflow`);
}

export async function updateIntelligenceAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");

  await mutateStore((store) => {
    upsertIntelligence(store, projectId, {
      companyContext: text(formData, "companyContext"),
      stakeholders: text(formData, "stakeholders"),
      issues: text(formData, "issues"),
      goals: text(formData, "goals"),
      currentTools: text(formData, "currentTools"),
      dataSituation: text(formData, "dataSituation"),
      constraints: text(formData, "constraints"),
      opportunities: text(formData, "opportunities"),
      internalNotes: text(formData, "internalNotes"),
    });
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Private Intelligence aktualisiert",
      body: "ASDAR Intake und interne Beratungsnotizen wurden gespeichert.",
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  redirect(`${adminProjectPath(locale, projectId)}?saved=intelligence`);
}

export async function submitCustomerIntakeAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const user = await requireProjectAccessForAction(locale, projectId);
  if (user.role === "admin") redirect(adminProjectPath(locale, projectId));

  const answers = [
    ["Unternehmenskontext", text(formData, "companyContext")],
    ["Probleme und Engpässe", text(formData, "issues")],
    ["Ziele", text(formData, "goals")],
    ["Aktuelle Tools", text(formData, "currentTools")],
    ["Daten und Dokumente", text(formData, "dataSituation")],
    ["Rahmenbedingungen", text(formData, "constraints")],
  ].filter((entry) => entry[1]);

  const questionLabels = formData.getAll("questionLabel").map(String);
  const questionAnswers = formData.getAll("questionAnswer").map(String);
  const questionnaire = questionLabels
    .map((label, index) => ({
      label: label.trim(),
      answer: (questionAnswers[index] ?? "").trim(),
    }))
    .filter((entry) => entry.label && entry.answer);

  if (answers.length === 0 && questionnaire.length === 0) {
    redirect(`${customerProjectPath(locale, projectId)}?error=intake`);
  }

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;

    const now = new Date().toISOString();
    const answerBlock = [
      `Eingereicht von ${user.name} (${user.email}) am ${now.slice(0, 10)}`,
      "",
      ...answers.map(([label, answer]) => `${label}:\n${answer}`),
      ...questionnaire.map(
        (entry) => `${entry.label}:\n${entry.answer}`,
      ),
    ].join("\n\n");

    upsertIntelligence(store, projectId, {
      companyContext: appendNote(
        bundle.intelligence.companyContext,
        "Kundeninput: Unternehmenskontext",
        text(formData, "companyContext"),
      ),
      stakeholders: bundle.intelligence.stakeholders,
      issues: appendNote(
        bundle.intelligence.issues,
        "Kundeninput: Probleme und Engpässe",
        text(formData, "issues"),
      ),
      goals: appendNote(
        bundle.intelligence.goals,
        "Kundeninput: Ziele",
        text(formData, "goals"),
      ),
      currentTools: appendNote(
        bundle.intelligence.currentTools,
        "Kundeninput: Aktuelle Tools",
        text(formData, "currentTools"),
      ),
      dataSituation: appendNote(
        bundle.intelligence.dataSituation,
        "Kundeninput: Daten und Dokumente",
        text(formData, "dataSituation"),
      ),
      constraints: appendNote(
        bundle.intelligence.constraints,
        "Kundeninput: Rahmenbedingungen",
        text(formData, "constraints"),
      ),
      opportunities: bundle.intelligence.opportunities,
      internalNotes: appendNote(
        bundle.intelligence.internalNotes,
        "Kundenfragebogen",
        answerBlock,
      ),
    });

    store.updates.push({
      id: id("update"),
      projectId,
      title: "Intake: Kundenantworten eingereicht",
      body: [
        "Der geführte Fragebogen wurde eingereicht. Assad nutzt die Antworten für Analyse, Empfehlungen und nächste Schritte.",
        "",
        answerBlock,
      ].join("\n"),
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    const updatedBundle = getProjectBundle(store, projectId);
    if (updatedBundle) {
      store.aiInsights.push({
        id: id("insight"),
        projectId,
        title: `Intake Recommendations: ${now.slice(0, 10)}`,
        body: buildConsultantBrief(updatedBundle),
        kind: "guidance",
        createdAt: now,
      });
    }

    const hasReviewTask = store.tasks.some(
      (task) =>
        task.projectId === projectId &&
        task.title === "Kundenintake auswerten und Beratungsschritte ableiten",
    );
    if (!hasReviewTask) {
      store.tasks.push({
        id: id("task"),
        projectId,
        title: "Kundenintake auswerten und Beratungsschritte ableiten",
        owner: "assad",
        status: "todo",
        visibleToCustomer: false,
        createdAt: now,
      });
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kundenintake eingereicht",
      body: `${user.name} hat den geführten Projektfragebogen eingereicht.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${customerProjectPath(locale, projectId)}?saved=intake`);
}

export async function applyConsultingTemplateAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const sourceStore = await readStore();
  const template =
    getEffectiveConsultingTemplate(
      text(formData, "templateId"),
      sourceStore.templateOverrides,
    ) ??
    matchConsultingTemplate(text(formData, "industry"));

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;

    const now = new Date().toISOString();
    const project = store.projects.find((entry) => entry.id === projectId);
    const organization = store.organizations.find(
      (entry) => entry.id === project?.organizationId,
    );
    const intelligence = store.projectIntelligence.find(
      (entry) => entry.projectId === projectId,
    );

    if (organization && organization.industry === "Noch nicht gesetzt") {
      organization.industry = template.industryLabel;
    }

    if (project) {
      if (!project.summary) project.summary = template.summary;
      project.nextStep = template.kickoffGoal;
      project.updatedAt = now;
    }

    if (intelligence) {
      Object.assign(intelligence, mergeTemplateIntake(intelligence, template), {
        updatedAt: now,
      });
    } else {
      store.projectIntelligence.push({
        projectId,
        ...template.intake,
        updatedAt: now,
      });
    }

    const existingTasks = new Set(
      store.tasks
        .filter((task) => task.projectId === projectId)
        .map((task) => task.title.toLowerCase()),
    );
    for (const task of template.seedTasks) {
      if (existingTasks.has(task.title.toLowerCase())) continue;
      store.tasks.push({
        id: id("task"),
        projectId,
        title: task.title,
        owner: task.owner,
        status: "todo",
        visibleToCustomer: task.visibleToCustomer,
        createdAt: now,
      });
    }

    const existingMilestones = new Set(
      store.milestones
        .filter((milestone) => milestone.projectId === projectId)
        .map((milestone) => milestone.title.toLowerCase()),
    );
    for (const milestone of template.seedMilestones) {
      if (existingMilestones.has(milestone.title.toLowerCase())) continue;
      store.milestones.push({
        id: id("milestone"),
        projectId,
        title: milestone.title,
        status: "planned",
        visibleToCustomer: milestone.visibleToCustomer,
        createdAt: now,
      });
    }

    const hasKickoffUpdate = store.updates.some(
      (update) =>
        update.projectId === projectId &&
        update.title === template.customerKickoffUpdate.title,
    );
    if (!hasKickoffUpdate) {
      store.updates.push({
        id: id("update"),
        projectId,
        title: template.customerKickoffUpdate.title,
        body: template.customerKickoffUpdate.body,
        visibility: "customer",
        asdarStage: "analyse",
        createdBy: user.id,
        createdAt: now,
      });
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Industrie-Template angewendet",
      body: `${template.label} wurde angewendet und fehlende Aufgaben/Meilensteine wurden ergänzt.`,
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=template`);
}

export async function completeSetupWizardAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const process = text(formData, "process");
  const bottleneck = text(formData, "bottleneck");
  const metric = text(formData, "metric");
  const decisionMakers = text(formData, "decisionMakers");
  const firstPilot = text(formData, "firstPilot");

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;

    const now = new Date().toISOString();
    const project = store.projects.find((entry) => entry.id === projectId);
    if (project) {
      project.status = "analysis";
      project.asdarStage = "analyse";
      project.nextStep =
        firstPilot || "Pilotprozess finalisieren und erste Umsetzung planen.";
      project.updatedAt = now;
    }

    upsertIntelligence(store, projectId, {
      companyContext: [
        bundle.intelligence.companyContext,
        process && `Wichtiger Prozess: ${process}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      stakeholders: [
        bundle.intelligence.stakeholders,
        decisionMakers && `Entscheider/Stakeholder: ${decisionMakers}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      issues: [bundle.intelligence.issues, bottleneck && `Engpass: ${bottleneck}`]
        .filter(Boolean)
        .join("\n\n"),
      goals: [bundle.intelligence.goals, metric && `Messziel: ${metric}`]
        .filter(Boolean)
        .join("\n\n"),
      currentTools: bundle.intelligence.currentTools,
      dataSituation: bundle.intelligence.dataSituation,
      constraints: bundle.intelligence.constraints,
      opportunities: [
        bundle.intelligence.opportunities,
        firstPilot && `Erster Pilot: ${firstPilot}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      internalNotes: [
        bundle.intelligence.internalNotes,
        "Setup Wizard abgeschlossen. Im nächsten Termin Pilotumfang, Datenzugang und Erfolgsmessung finalisieren.",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });

    store.tasks.push({
      id: id("task"),
      projectId,
      title: firstPilot
        ? `Pilot vorbereiten: ${firstPilot}`
        : "Pilotprozess konkretisieren",
      owner: "assad",
      status: "todo",
      visibleToCustomer: true,
      createdAt: now,
    });

    store.milestones.push({
      id: id("milestone"),
      projectId,
      title: "Projekt-Setup und erster Pilot definiert",
      status: "active",
      visibleToCustomer: true,
      createdAt: now,
    });

    store.updates.push({
      id: id("update"),
      projectId,
      title: "Projekt-Setup abgeschlossen",
      body:
        firstPilot || metric
          ? `Das Projekt-Setup ist abgeschlossen. Fokus: ${firstPilot || process}. Erfolgsmessung: ${metric || "wird im nächsten Schritt konkretisiert"}.`
          : "Das Projekt-Setup ist abgeschlossen. Der nächste Schritt ist die konkrete Auswahl und Vorbereitung des ersten Piloten.",
      visibility: "customer",
      asdarStage: "analyse",
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Setup Wizard abgeschlossen",
      body: "Projekt-Setup, erste Aufgabe, Meilenstein und Kundenupdate wurden erzeugt.",
    });
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: "Assad Dar Portal: Projekt-Setup abgeschlossen",
    body: "Das Projekt-Setup wurde aktualisiert. Der nächste Schritt ist jetzt im Portal sichtbar.",
    kind: "projectUpdates",
  });
  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=setup`);
}

export async function addMeetingNoteAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const meetingTitle = text(formData, "meetingTitle") || "Meeting Notes";
  const notes = text(formData, "notes");
  const decisions = text(formData, "decisions");
  const nextActions = text(formData, "nextActions");
  const customerSummary = text(formData, "customerSummary");
  const publishSummary = checkbox(formData, "publishSummary");

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    const now = new Date().toISOString();

    store.updates.push({
      id: id("update"),
      projectId,
      title: meetingTitle,
      body: [
        notes && `Notizen:\n${notes}`,
        decisions && `Entscheidungen:\n${decisions}`,
        nextActions && `Nächste Aktionen:\n${nextActions}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      visibility: "internal",
      asdarStage: asdar(text(formData, "asdarStage")),
      createdBy: user.id,
      createdAt: now,
    });

    if (nextActions) {
      for (const entry of nextActions.split("\n").map((line) => line.trim())) {
        if (!entry) continue;
        store.tasks.push({
          id: id("task"),
          projectId,
          title: entry.replace(/^[-*]\s*/, ""),
          owner: "assad",
          status: "todo",
          visibleToCustomer: false,
          createdAt: now,
        });
      }
    }

    if (publishSummary && customerSummary) {
      store.updates.push({
        id: id("update"),
        projectId,
        title: "Meeting-Zusammenfassung",
        body: customerSummary,
        visibility: "customer",
        asdarStage: asdar(text(formData, "asdarStage")),
        createdBy: user.id,
        createdAt: now,
      });
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Meeting gespeichert",
      body: `${meetingTitle} wurde als interne Meeting-Notiz gespeichert.`,
    });
  });

  if (publishSummary && customerSummary) {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Neue Meeting-Zusammenfassung",
      body: customerSummary,
      kind: "projectUpdates",
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=meeting`);
}

export async function scheduleProjectAppointmentAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const appointmentDate = text(formData, "appointmentDate");
  const appointmentTime = text(formData, "appointmentTime");
  const appointmentType = text(formData, "appointmentType") || "Projekttermin";
  const meetingUrl = text(formData, "meetingUrl");
  const notes = text(formData, "notes");
  const publish = checkbox(formData, "publish");

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();
    const dateLine = [appointmentDate, appointmentTime].filter(Boolean).join(" ");
    const body = [
      `Termin: ${dateLine || "wird abgestimmt"}`,
      meetingUrl && `Link: ${meetingUrl}`,
      notes && `Hinweis: ${notes}`,
    ]
      .filter(Boolean)
      .join("\n");

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Termin: ${appointmentType}`,
      body,
      visibility: publish ? "customer" : "internal",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Termin gespeichert",
      body: `${appointmentType} wurde für ${dateLine || "später"} gespeichert.`,
    });
  });

  if (publish) {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Neuer Projekttermin",
      body: `${appointmentType} wurde im Portal gespeichert.`,
      kind: "appointments",
    });
  }

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?view=meeting&saved=appointment`);
}

export async function publishDraftUpdateAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const title = text(formData, "title") || "Projektupdate";
  const body = text(formData, "body");
  const draftId = text(formData, "draftId");
  const returnTo = text(formData, "returnTo") || `${adminProjectPath(locale, projectId)}?view=communication`;

  if (!body) redirect(returnTo);

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();

    store.updates.push({
      id: id("update"),
      projectId,
      title,
      body,
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addInternalMarker({
      store,
      projectId,
      userId: user.id,
      title: "Draft veröffentlicht",
      marker: draftId ? `DRAFT_DONE:${draftId}` : "DRAFT_DONE:manual",
      body: `${title} wurde als Kundenupdate veröffentlicht.`,
    });
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: `Assad Dar Portal: ${title}`,
    body,
  });

  revalidateProjectViews(locale, projectId);
  revalidatePath(`/${locale}/portal/admin/drafts`);
  redirect(returnTo);
}

export async function saveKnowledgeSnapshotAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const store = await readStore();
  const bundle = getProjectBundle(store, projectId);
  if (!bundle) redirect(`/${locale}/portal/admin`);

  const template = matchConsultingTemplate(bundle.organization.industry);
  const similar = store.projects
    .filter((project) => project.id !== projectId)
    .slice(0, 3)
    .map((project) => project.name);

  await mutateStore((nextStore) => {
    if (!getProjectBundle(nextStore, projectId)) return;
    nextStore.aiInsights.push({
      id: id("insight"),
      projectId,
      title: `Knowledge Snapshot: ${template.label}`,
      body: [
        `Industrie: ${bundle.organization.industry}`,
        `Template: ${template.label}`,
        "",
        "Quick Wins:",
        ...template.quickWins.map((item) => `- ${item}`),
        "",
        "Risiken:",
        ...template.risks.map((item) => `- ${item}`),
        "",
        "Nächste Fragen:",
        ...template.discoveryQuestions.map((item) => `- ${item}`),
        "",
        similar.length > 0
          ? `Ähnliche Projektbasis: ${similar.join(", ")}`
          : "Ähnliche Projektbasis: noch zu wenig Projekthistorie",
      ].join("\n"),
      kind: "guidance",
      createdAt: new Date().toISOString(),
    });
    addAuditUpdate({
      store: nextStore,
      projectId,
      userId: user.id,
      title: "Knowledge Snapshot gespeichert",
      body: `Branchen-Snapshot für ${template.label} wurde erzeugt.`,
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  redirect(`${adminProjectPath(locale, projectId)}?saved=knowledge`);
}

export async function generateDiagnosisPackAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const publishSummary = checkbox(formData, "publishSummary");
  const createTasks = checkbox(formData, "createTasks");
  const createMilestones = checkbox(formData, "createMilestones");
  const sourceStore = await readStore();
  const bundle = getProjectBundle(sourceStore, projectId);
  if (!bundle) redirect(`/${locale}/portal/admin`);

  const diagnosis = buildProjectDiagnosis(bundle);
  const report = formatDiagnosisReport(bundle, diagnosis);

  await mutateStore((store) => {
    const nextBundle = getProjectBundle(store, projectId);
    if (!nextBundle) return;
    const now = new Date().toISOString();

    store.aiInsights.push({
      id: id("insight"),
      projectId,
      title: `ASDAR Diagnosis Pack: ${diagnosis.readinessScore}/100`,
      body: report,
      kind: diagnosis.readinessScore >= 70 ? "guidance" : "risk",
      createdAt: now,
    });

    if (createTasks) {
      const existingTitles = new Set(
        store.tasks
          .filter((task) => task.projectId === projectId)
          .map((task) => task.title.toLowerCase()),
      );
      for (const title of diagnosis.recommendedTasks) {
        if (existingTitles.has(title.toLowerCase())) continue;
        store.tasks.push({
          id: id("task"),
          projectId,
          title,
          owner: "assad",
          status: "todo",
          visibleToCustomer: false,
          createdAt: now,
        });
      }
    }

    if (createMilestones) {
      const existingTitles = new Set(
        store.milestones
          .filter((milestone) => milestone.projectId === projectId)
          .map((milestone) => milestone.title.toLowerCase()),
      );
      for (const title of diagnosis.recommendedMilestones) {
        if (existingTitles.has(title.toLowerCase())) continue;
        store.milestones.push({
          id: id("milestone"),
          projectId,
          title,
          status: "planned",
          visibleToCustomer: true,
          createdAt: now,
        });
      }
    }

    if (publishSummary) {
      store.updates.push({
        id: id("update"),
        projectId,
        title: "ASDAR Diagnose aktualisiert",
        body: diagnosis.customerSummary,
        visibility: "customer",
        asdarStage: nextBundle.project.asdarStage,
        createdBy: user.id,
        createdAt: now,
      });
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "ASDAR Diagnosis Pack generiert",
      body: `Readiness ${diagnosis.readinessScore}/100 (${diagnosis.readinessLabel}).`,
    });
  });

  if (publishSummary) {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: ASDAR Diagnose aktualisiert",
      body: diagnosis.customerSummary,
    });
  }

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?saved=diagnosis`);
}

export async function addUpdateAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const updateVisibility = visibility(text(formData, "visibility"));
  const title = text(formData, "title") || "Projektupdate";
  const body = text(formData, "body");
  const stage = asdar(text(formData, "asdarStage"));

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    store.updates.push({
      id: id("update"),
      projectId,
      title,
      body,
      visibility: updateVisibility,
      asdarStage: stage,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Projektupdate erstellt",
      body: `${updateVisibility === "customer" ? "Kundenupdate" : "Internes Update"} "${title}" wurde gespeichert.`,
    });
  });

  if (updateVisibility === "customer") {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: `Assad Dar Portal: ${title}`,
      body: body || "Es gibt ein neues Projektupdate im Portal.",
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=update`);
}

export async function addProjectCommentAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const user = await requireProjectAccessForAction(locale, projectId);
  const message = text(formData, "message");
  const topic = text(formData, "topic") || "Projekt";

  if (!message) {
    redirect(
      user.role === "admin"
        ? `${adminProjectPath(locale, projectId)}?error=comment`
        : `${customerProjectPath(locale, projectId)}?error=comment`,
    );
  }

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;

    const now = new Date().toISOString();
    store.updates.push({
      id: id("update"),
      projectId,
      title: `Kommentar: ${topic}`,
      body: `${user.name}\n\n${message}`,
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kommentar erstellt",
      body: `${user.name} hat einen Kommentar zu "${topic}" geschrieben.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(
    user.role === "admin"
      ? `${adminProjectPath(locale, projectId)}?saved=comment`
      : `${customerProjectPath(locale, projectId)}?saved=comment`,
  );
}

export async function createDecisionAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const title = text(formData, "title") || "Offene Entscheidung";
  const body = text(formData, "body");
  const updateVisibility = visibility(text(formData, "visibility"));
  const nextStatus = decisionStatus(text(formData, "status"));

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();
    const decision = {
      id: id("decision"),
      title,
      body,
      status: nextStatus,
      owner: "assad" as const,
      visibility: updateVisibility,
      createdAt: now,
      updatedAt: now,
    };

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Entscheidung: ${title}`,
      body: [
        markerLine("DECISION_RECORD", decision),
        "",
        body || "Keine Detailbeschreibung hinterlegt.",
        "",
        `Status: ${nextStatus}`,
      ].join("\n"),
      visibility: updateVisibility,
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Entscheidung angelegt",
      body: `${title} wurde mit Status ${nextStatus} gespeichert.`,
    });
  });

  if (updateVisibility === "customer") {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: `Assad Dar Portal: Entscheidung benötigt`,
      body: `${title}\n\n${body || "Bitte prüfen Sie die Entscheidung im Portal."}`,
    });
  }

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?view=communication&saved=decision`);
}

export async function customerDecisionResponseAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const decisionId = text(formData, "decisionId");
  const user = await requireProjectAccessForAction(locale, projectId);
  if (user.role === "admin") redirect(adminProjectPath(locale, projectId));

  const sourceStore = await readStore();
  const sourceBundle = getProjectBundle(sourceStore, projectId);
  const sourceDecision = sourceBundle
    ? buildDecisionCenter(sourceBundle).find((entry) => entry.id === decisionId)
    : undefined;
  if (!sourceDecision || sourceDecision.visibility !== "customer") {
    redirect(`${customerProjectPath(locale, projectId)}?error=decision`);
  }

  const response = text(formData, "response");
  const nextStatus = decisionStatus(text(formData, "status"));

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();
    const decision = {
      ...sourceDecision,
      status: nextStatus,
      response,
      updatedAt: now,
    };

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Entscheidung: ${sourceDecision.title}`,
      body: [
        markerLine("DECISION_RECORD", decision),
        "",
        `${user.name}: ${response || nextStatus}`,
      ].join("\n"),
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kundenentscheidung aktualisiert",
      body: `${sourceDecision.title} wurde durch ${user.name} auf ${nextStatus} gesetzt.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${customerProjectPath(locale, projectId)}?view=overview&saved=decision`);
}

export async function createChangeRequestAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const user = await requireProjectAccessForAction(locale, projectId);
  const title = text(formData, "title") || "Änderungswunsch";
  const body = text(formData, "body");
  const estimate = text(formData, "estimate");
  const dueDate = text(formData, "dueDate");
  const requester = user.role === "admin" ? "assad" : "customer";
  const nextStatus =
    user.role === "admin" ? changeRequestStatus(text(formData, "status")) : "new";

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();
    const request = {
      id: id("change"),
      title,
      body,
      status: nextStatus,
      requestedBy: requester,
      estimate,
      dueDate,
      createdAt: now,
      updatedAt: now,
    };

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Change Request: ${title}`,
      body: [
        markerLine("CHANGE_REQUEST", request),
        "",
        body || "Keine Beschreibung hinterlegt.",
        estimate && `Schätzung: ${estimate}`,
        dueDate && `Zieldatum: ${dueDate}`,
        `Status: ${nextStatus}`,
      ]
        .filter(Boolean)
        .join("\n"),
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    if (user.role === "customer") {
      store.tasks.push({
        id: id("task"),
        projectId,
        title: `Scope Change prüfen: ${title}`,
        owner: "assad",
        status: "todo",
        visibleToCustomer: false,
        createdAt: now,
      });
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Change Request erstellt",
      body: `${title} wurde von ${user.name} angelegt.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(
    user.role === "admin"
      ? `${adminProjectPath(locale, projectId)}?view=billing&saved=change`
      : `${customerProjectPath(locale, projectId)}?view=actions&saved=change`,
  );
}

export async function updateChangeRequestAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const requestId = text(formData, "requestId");
  const sourceStore = await readStore();
  const sourceBundle = getProjectBundle(sourceStore, projectId);
  const sourceRequest = sourceBundle
    ? buildChangeRequests(sourceBundle).find((entry) => entry.id === requestId)
    : undefined;
  if (!sourceRequest) redirect(`${adminProjectPath(locale, projectId)}?view=billing`);

  const nextStatus = changeRequestStatus(text(formData, "status"));
  const estimate = text(formData, "estimate") || sourceRequest.estimate || "";
  const dueDate = text(formData, "dueDate") || sourceRequest.dueDate || "";

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();
    const request = {
      ...sourceRequest,
      status: nextStatus,
      estimate,
      dueDate,
      updatedAt: now,
    };

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Change Request: ${sourceRequest.title}`,
      body: [
        markerLine("CHANGE_REQUEST", request),
        "",
        sourceRequest.body || "Keine Beschreibung hinterlegt.",
        estimate && `Schätzung: ${estimate}`,
        dueDate && `Zieldatum: ${dueDate}`,
        `Status: ${nextStatus}`,
      ]
        .filter(Boolean)
        .join("\n"),
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Change Request aktualisiert",
      body: `${sourceRequest.title} wurde auf ${nextStatus} gesetzt.`,
    });
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: "Assad Dar Portal: Änderungswunsch aktualisiert",
    body: `${sourceRequest.title}\n\nStatus: ${nextStatus}${
      estimate ? `\nSchätzung: ${estimate}` : ""
    }`,
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?view=billing&saved=change`);
}

export async function createFileRequestAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const title = text(formData, "title") || "Datei benötigt";
  const body = text(formData, "body");
  const dueDate = text(formData, "dueDate");

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();
    const taskId = id("task");
    const request = {
      id: id("file_request"),
      title,
      body,
      status: "open" as const,
      dueDate,
      taskId,
      createdAt: now,
      updatedAt: now,
    };

    store.tasks.push({
      id: taskId,
      projectId,
      title,
      owner: "customer",
      status: "todo",
      dueDate: dueDate || undefined,
      visibleToCustomer: true,
      createdAt: now,
    });

    store.updates.push({
      id: id("update"),
      projectId,
      title: `File Request: ${title}`,
      body: [
        markerLine("FILE_REQUEST", request),
        "",
        body || "Bitte Datei im Portal hochladen.",
        dueDate && `Fällig: ${dueDate}`,
      ]
        .filter(Boolean)
        .join("\n"),
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Datei angefragt",
      body: `${title} wurde als Kundenaufgabe angelegt.`,
    });
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: "Assad Dar Portal: Datei benötigt",
    body: `${title}\n\n${body || "Bitte laden Sie die Datei im Portal hoch."}`,
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?view=delivery&saved=file-request`);
}

export async function createCustomerTicketAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const user = await requireProjectAccessForAction(locale, projectId);
  if (user.role === "admin") redirect(adminProjectPath(locale, projectId));

  const title = text(formData, "title") || "Kundenanfrage";
  const body = text(formData, "body");
  if (!body) redirect(`${customerProjectPath(locale, projectId)}?error=comment`);

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;
    const now = new Date().toISOString();

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Ticket: ${title}`,
      body: `${user.name}\n\n${body}`,
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    store.tasks.push({
      id: id("task"),
      projectId,
      title: `Kundenanfrage beantworten: ${title}`,
      owner: "assad",
      status: "todo",
      visibleToCustomer: false,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kundenticket erstellt",
      body: `${user.name} hat eine neue Anfrage erstellt: ${title}.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${customerProjectPath(locale, projectId)}?view=actions&saved=ticket`);
}

export async function addTaskAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const title = text(formData, "title") || "Neue Aufgabe";
  const visibleToCustomer = checkbox(formData, "visibleToCustomer");

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    store.tasks.push({
      id: id("task"),
      projectId,
      title,
      owner: text(formData, "owner") === "customer" ? "customer" : "assad",
      status:
        text(formData, "status") === "done"
          ? "done"
          : text(formData, "status") === "doing"
            ? "doing"
            : "todo",
      dueDate: text(formData, "dueDate") || undefined,
      visibleToCustomer,
      createdAt: new Date().toISOString(),
    });
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Aufgabe erstellt",
      body: `"${title}" wurde angelegt (${visibleToCustomer ? "kundensichtbar" : "intern"}).`,
    });
  });

  if (visibleToCustomer) {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Neue Aufgabe",
      body: `Neue Aufgabe im Projekt: ${title}`,
      kind: "tasks",
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=task`);
}

export async function addMilestoneAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const title = text(formData, "title") || "Neuer Meilenstein";
  const visibleToCustomer = checkbox(formData, "visibleToCustomer");

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    store.milestones.push({
      id: id("milestone"),
      projectId,
      title,
      status:
        text(formData, "status") === "done"
          ? "done"
          : text(formData, "status") === "active"
            ? "active"
            : "planned",
      dueDate: text(formData, "dueDate") || undefined,
      visibleToCustomer,
      createdAt: new Date().toISOString(),
    });
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Meilenstein erstellt",
      body: `"${title}" wurde angelegt (${visibleToCustomer ? "kundensichtbar" : "intern"}).`,
    });
  });

  if (visibleToCustomer) {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Neuer Meilenstein",
      body: `Ein neuer Meilenstein wurde im Projekt hinzugefügt: ${title}`,
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=milestone`);
}

export async function updateTaskStatusAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const taskId = text(formData, "taskId");
  const nextStatus = taskStatus(text(formData, "status"));

  await mutateStore((store) => {
    const task = store.tasks.find(
      (entry) => entry.id === taskId && entry.projectId === projectId,
    );
    if (!task || !getProjectBundle(store, projectId)) return;

    const previousStatus = task.status;
    task.status = nextStatus;
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Aufgabenstatus geändert",
      body: `"${task.title}" wurde von ${previousStatus} auf ${nextStatus} gesetzt.`,
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=task-status`);
}

export async function updateMilestoneStatusAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const milestoneId = text(formData, "milestoneId");
  const nextStatus = milestoneStatus(text(formData, "status"));

  await mutateStore((store) => {
    const milestone = store.milestones.find(
      (entry) => entry.id === milestoneId && entry.projectId === projectId,
    );
    if (!milestone || !getProjectBundle(store, projectId)) return;

    const previousStatus = milestone.status;
    milestone.status = nextStatus;
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Meilensteinstatus geändert",
      body: `"${milestone.title}" wurde von ${previousStatus} auf ${nextStatus} gesetzt.`,
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=milestone-status`);
}

export async function archiveProjectAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const confirmation = text(formData, "confirmation");

  if (confirmation !== "ARCHIVIEREN") {
    redirect(`${adminProjectPath(locale, projectId)}?error=archive`);
  }

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return;

    const now = new Date().toISOString();
    const project = store.projects.find((entry) => entry.id === projectId);
    if (!project) return;

    project.status = "completed";
    project.health = "green";
    project.nextStep =
      "Projekt archiviert. Bestehende Updates, Dateien und Rechnungen bleiben sichtbar.";
    project.updatedAt = now;

    store.updates.push({
      id: id("update"),
      projectId,
      title: "Projekt abgeschlossen",
      body: "Das Projekt wurde abgeschlossen. Bestehende Updates, Dateien und Rechnungen bleiben im Portal sichtbar.",
      visibility: "customer",
      asdarStage: project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Projekt archiviert",
      body: `${bundle.project.name} wurde sicher archiviert und auf abgeschlossen gesetzt.`,
    });
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: "Assad Dar Portal: Projekt abgeschlossen",
    body: "Das Projekt wurde abgeschlossen. Der Projektstand bleibt im Portal weiterhin sichtbar.",
  });
  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=archive`);
}

export async function customerTaskStatusAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const taskId = text(formData, "taskId");
  const user = await requireProjectAccessForAction(locale, projectId);
  if (user.role === "admin") redirect(adminProjectPath(locale, projectId));

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    const task = store.tasks.find(
      (entry) => entry.id === taskId && entry.projectId === projectId,
    );
    if (!bundle || !task || task.owner !== "customer" || !task.visibleToCustomer) {
      return;
    }

    const now = new Date().toISOString();
    const nextStatus = taskStatus(text(formData, "status")) === "todo"
      ? "doing"
      : taskStatus(text(formData, "status"));
    task.status = nextStatus;

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Kommentar: Aufgabe ${task.title}`,
      body:
        nextStatus === "done"
          ? `${user.name}\n\nIch habe diese Aufgabe als erledigt markiert.`
          : `${user.name}\n\nIch arbeite an dieser Aufgabe.`,
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kundenaufgabe aktualisiert",
      body: `${task.title} wurde durch ${user.name} auf ${nextStatus} gesetzt.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${customerProjectPath(locale, projectId)}?saved=task`);
}

export async function customerTaskFileAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const taskId = text(formData, "taskId");
  const user = await requireProjectAccessForAction(locale, projectId);
  if (user.role === "admin") redirect(adminProjectPath(locale, projectId));

  const file = formData.get("file");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    redirect(`${customerProjectPath(locale, projectId)}?error=file`);
  }

  const upload = file as File;
  if (!upload.size) redirect(`${customerProjectPath(locale, projectId)}?error=file`);

  const sourceStore = await readStore();
  const sourceTask = sourceStore.tasks.find(
    (entry) => entry.id === taskId && entry.projectId === projectId,
  );
  if (!sourceTask || sourceTask.owner !== "customer" || !sourceTask.visibleToCustomer) {
    redirect(`${customerProjectPath(locale, projectId)}?error=file`);
  }

  const fileId = id("file");
  const safeName = safeFilename(upload.name || "upload.bin");
  const displayName = text(formData, "name") || upload.name || "Datei";
  const buffer = Buffer.from(await upload.arrayBuffer());
  const storagePath = await savePortalFile({
    projectId,
    fileId,
    filename: safeName,
    bytes: buffer,
    contentType: upload.type || "application/octet-stream",
  });

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    const task = store.tasks.find(
      (entry) => entry.id === taskId && entry.projectId === projectId,
    );
    if (!bundle || !task) return;
    const now = new Date().toISOString();

    store.files.push({
      id: fileId,
      projectId,
      name: displayName,
      description: `Zur Aufgabe "${task.title}" hochgeladen von ${user.name}.`,
      storagePath,
      mimeType: upload.type || "application/octet-stream",
      size: upload.size,
      visibility: "customer",
      category: "customer_upload",
      approvalStatus: "not_required",
      uploadedBy: user.id,
      uploadedAt: now,
    });

    task.status = "done";

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Kommentar: Datei zu ${task.title}`,
      body: `${user.name}\n\nIch habe eine Datei zur Aufgabe hochgeladen: ${displayName}`,
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Kundendatei hochgeladen",
      body: `${displayName} wurde zur Aufgabe "${task.title}" hochgeladen.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${customerProjectPath(locale, projectId)}?saved=file`);
}

export async function approveMilestoneAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const milestoneId = text(formData, "milestoneId");
  const user = await requireProjectAccessForAction(locale, projectId);
  if (user.role === "admin") redirect(adminProjectPath(locale, projectId));

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    const milestone = store.milestones.find(
      (entry) => entry.id === milestoneId && entry.projectId === projectId,
    );
    if (!bundle || !milestone || !milestone.visibleToCustomer) return;
    const now = new Date().toISOString();

    milestone.status = "done";
    store.updates.push({
      id: id("update"),
      projectId,
      title: `Freigabe: ${milestone.title}`,
      body: `APPROVAL_MILESTONE:${milestone.id}\n${user.name} hat diesen Meilenstein freigegeben.`,
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Meilenstein freigegeben",
      body: `${milestone.title} wurde durch ${user.name} freigegeben.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${customerProjectPath(locale, projectId)}?saved=approval`);
}

export async function approveFileAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const fileId = text(formData, "fileId");
  const user = await requireProjectAccessForAction(locale, projectId);
  if (user.role === "admin") redirect(adminProjectPath(locale, projectId));

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    const file = store.files.find(
      (entry) =>
        entry.id === fileId &&
        entry.projectId === projectId &&
        entry.visibility === "customer",
    );
    if (!bundle || !file) return;

    const hasApproval = store.updates.some(
      (update) =>
        update.projectId === projectId &&
        update.title.startsWith("Freigabe:") &&
        update.body.includes(`APPROVAL_FILE:${file.id}`),
    );
    if (hasApproval) return;

    const now = new Date().toISOString();
    file.approvalStatus = "approved";
    file.approvedBy = user.id;
    file.approvedAt = now;

    if (file.category === "proposal") {
      const amountCents = Number(
        file.description.match(/Betrag:\s*(\d+)\s*Cent/i)?.[1] ?? 0,
      );
      const proposalNumber =
        file.description.match(/Proposal-ID:\s*([^\n]+)/i)?.[1] ??
        file.name.replace(/^Proposal\s*/, "");
      const hasInvoice = store.invoices.some(
        (invoice) =>
          invoice.projectId === projectId &&
          (invoice.number.includes(proposalNumber.replace("AD-P", "AD")) ||
            invoice.description.includes(file.name)),
      );
      if (!hasInvoice && Number.isFinite(amountCents) && amountCents > 0) {
        store.invoices.push({
          id: id("invoice"),
          projectId,
          number: proposalNumber.replace("AD-P", "AD"),
          description: `Automatisch erzeugt nach Annahme von ${file.name}`,
          amountCents,
          currency: "EUR",
          status: "sent",
          issuedAt: now.slice(0, 10),
          dueDate: undefined,
          createdAt: now,
        });
      }
    }

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Freigabe: ${file.name}`,
      body: `APPROVAL_FILE:${file.id}\n${user.name} hat ${file.category === "proposal" ? "dieses Angebot angenommen" : "diese Datei / dieses Deliverable freigegeben"}.`,
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: file.category === "proposal" ? "Proposal angenommen" : "Deliverable freigegeben",
      body: `${file.name} wurde durch ${user.name} ${file.category === "proposal" ? "angenommen" : "freigegeben"}.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${customerProjectPath(locale, projectId)}?saved=approval`);
}

export async function requestProposalChangesAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const projectId = text(formData, "projectId");
  const fileId = text(formData, "fileId");
  const message = text(formData, "message");
  const user = await requireProjectAccessForAction(locale, projectId);
  if (user.role === "admin") redirect(adminProjectPath(locale, projectId));

  if (!message) {
    redirect(`${customerProjectPath(locale, projectId)}?view=files&error=comment`);
  }

  await mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    const file = store.files.find(
      (entry) =>
        entry.id === fileId &&
        entry.projectId === projectId &&
        entry.visibility === "customer" &&
        entry.category === "proposal",
    );
    if (!bundle || !file) return;
    const now = new Date().toISOString();

    store.updates.push({
      id: id("update"),
      projectId,
      title: `Kommentar: Änderungswunsch zu ${file.name}`,
      body: `${user.name}\n\n${message}`,
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Proposal Änderung angefragt",
      body: `${user.name} hat Änderungen zu ${file.name} angefragt.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${customerProjectPath(locale, projectId)}?view=files&saved=proposal-change`);
}

export async function addFileAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const file = formData.get("file");

  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    redirect(`${adminProjectPath(locale, projectId)}?error=file`);
  }

  const upload = file as File;
  if (!upload.size) redirect(`${adminProjectPath(locale, projectId)}?error=file`);

  const fileId = id("file");
  const safeName = safeFilename(upload.name || "upload.bin");
  const fileVisibility = visibility(text(formData, "visibility"));
  const displayName = text(formData, "name") || upload.name || "Datei";
  const buffer = Buffer.from(await upload.arrayBuffer());
  const storagePath = await savePortalFile({
    projectId,
    fileId,
    filename: safeName,
    bytes: buffer,
    contentType: upload.type || "application/octet-stream",
  });

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    store.files.push({
      id: fileId,
      projectId,
      name: displayName,
      description: text(formData, "description"),
      storagePath,
      mimeType: upload.type || "application/octet-stream",
      size: upload.size,
      visibility: fileVisibility,
      category:
        fileVisibility === "customer" ? "consultant_deliverable" : "other",
      approvalStatus:
        fileVisibility === "customer" ? "pending" : "not_required",
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
    });
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Datei hochgeladen",
      body: `"${displayName}" wurde hochgeladen (${fileVisibility === "customer" ? "kundensichtbar" : "intern"}).`,
    });
  });

  if (fileVisibility === "customer") {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Neue Datei",
      body: `Eine neue Datei wurde im Projektportal bereitgestellt: ${displayName}`,
      kind: "files",
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=file`);
}

export async function addInvoiceAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const invoiceId = id("invoice");
  const invoice: Invoice = {
    id: invoiceId,
    projectId,
    number: text(formData, "number") || `AD-${new Date().getFullYear()}-NEU`,
    description: text(formData, "description"),
    amountCents: cents(text(formData, "amount")),
    currency: text(formData, "currency") === "USD" ? "USD" : "EUR",
    status:
      text(formData, "status") === "paid"
        ? "paid"
        : text(formData, "status") === "overdue"
          ? "overdue"
          : text(formData, "status") === "draft"
            ? "draft"
            : "sent",
    issuedAt: text(formData, "issuedAt") || new Date().toISOString().slice(0, 10),
    dueDate: text(formData, "dueDate") || undefined,
    paymentUrl: text(formData, "paymentUrl") || undefined,
    createdAt: new Date().toISOString(),
  };

  invoice.paymentUrl = await createInvoiceCheckoutUrl({ invoice, locale });

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    store.invoices.push(invoice);
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Rechnung erstellt",
      body: `Rechnung ${invoice.number} wurde mit Status ${invoice.status} gespeichert.`,
    });
  });

  if (invoice.status !== "draft") {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: `Assad Dar Portal: Rechnung ${invoice.number}`,
      body: `Eine Rechnung wurde im Projektportal bereitgestellt: ${invoice.description || invoice.number}`,
      kind: "invoices",
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=invoice`);
}

export async function updateInvoiceStatusAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const invoiceId = text(formData, "invoiceId");
  const nextStatus =
    text(formData, "status") === "paid"
      ? "paid"
      : text(formData, "status") === "overdue"
        ? "overdue"
        : text(formData, "status") === "draft"
          ? "draft"
          : "sent";

  await mutateStore((store) => {
    const invoice = store.invoices.find(
      (entry) => entry.id === invoiceId && entry.projectId === projectId,
    );
    if (!invoice || !getProjectBundle(store, projectId)) return;

    const previousStatus = invoice.status;
    invoice.status = nextStatus;
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Rechnungsstatus aktualisiert",
      body: `${invoice.number} wurde von ${previousStatus} auf ${nextStatus} gesetzt.`,
    });
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?saved=invoice-status`);
}

export async function sendProjectReminderAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const reminderType = text(formData, "reminderType");
  const entityId = text(formData, "entityId");

  const sourceStore = await readStore();
  const bundle = getProjectBundle(sourceStore, projectId);
  if (!bundle) redirect(`/${locale}/portal/admin`);

  const task = bundle.tasks.find((entry) => entry.id === entityId);
  const invoice = bundle.invoices.find((entry) => entry.id === entityId);
  const customMessage = text(formData, "message");
  const reminder =
    reminderType === "task" && task
        ? {
            title: `Erinnerung: Aufgabe ${task.title}`,
            subject: `Assad Dar Portal: Aufgabe offen`,
            body:
              customMessage ||
            `Bitte prüfen Sie die offene Aufgabe im Projektportal: ${task.title}`,
        }
      : reminderType === "invoice" && invoice
        ? {
            title: `Erinnerung: Rechnung ${invoice.number}`,
            subject: `Assad Dar Portal: Rechnung ${invoice.number}`,
            body:
              customMessage ||
              `Bitte prüfen Sie die Rechnung ${invoice.number} im Projektportal.`,
          }
        : reminderType === "intake"
          ? {
              title: "Erinnerung: Projektfragebogen",
              subject: "Assad Dar Portal: Projektfragebogen",
              body:
                customMessage ||
                "Bitte füllen Sie den geführten Projektfragebogen im Portal aus, damit Assad die Analyse vorbereiten kann.",
            }
          : {
              title: "Erinnerung: Projektinput",
              subject: "Assad Dar Portal: Projektinput",
              body:
                customMessage ||
                "Bitte prüfen Sie das Projektportal. Dort wartet ein nächster Schritt.",
            };

  await mutateStore((store) => {
    const nextBundle = getProjectBundle(store, projectId);
    if (!nextBundle) return;
    const now = new Date().toISOString();
    store.updates.push({
      id: id("update"),
      projectId,
      title: reminder.title,
      body: reminder.body,
      visibility: "customer",
      asdarStage: nextBundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });
    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Reminder gesendet",
      body: reminder.title,
    });
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: reminder.subject,
    body: reminder.body,
    kind: "reminders",
  });
  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?saved=reminder`);
}

export async function generateProjectBriefAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const publishSummary = checkbox(formData, "publishSummary");
  const createActions = checkbox(formData, "createActions");
  const sourceStore = await readStore();
  const bundle = getProjectBundle(sourceStore, projectId);
  if (!bundle) redirect(`/${locale}/portal/admin`);

  const now = new Date();
  const nowIso = now.toISOString();
  const briefText = buildConsultantBrief(bundle);
  const customerSummary = buildCustomerSafeSummary(bundle);
  const briefId = id("brief");
  const filename = `ASDAR-Projektbrief-${nowIso.slice(0, 10)}.pdf`;
  const buffer = createProjectBriefPdf(bundle);
  const storagePath = await savePortalFile({
    projectId,
    fileId: briefId,
    filename,
    bytes: buffer,
    contentType: "application/pdf",
  });

  await mutateStore((store) => {
    const nextBundle = getProjectBundle(store, projectId);
    if (!nextBundle) return;
    const template = matchConsultingTemplate(nextBundle.organization.industry);

    store.aiInsights.push({
      id: id("insight"),
      projectId,
      title: `Consultant Brief: ${nowIso.slice(0, 10)}`,
      body: briefText,
      kind: "guidance",
      createdAt: nowIso,
    });

    store.files.push({
      id: briefId,
      projectId,
      name: `ASDAR Projektbrief ${nowIso.slice(0, 10)}`,
      description: "Interner Consultant Brief als PDF.",
      storagePath,
      mimeType: "application/pdf",
      size: buffer.length,
      visibility: "internal",
      category: "project_brief",
      approvalStatus: "not_required",
      uploadedBy: user.id,
      uploadedAt: nowIso,
    });

    if (publishSummary) {
      store.updates.push({
        id: id("update"),
        projectId,
        title: "Projektbrief aktualisiert",
        body: customerSummary,
        visibility: "customer",
        asdarStage: nextBundle.project.asdarStage,
        createdBy: user.id,
        createdAt: nowIso,
      });
    }

    if (createActions) {
      const existingTitles = new Set(
        store.tasks
          .filter((task) => task.projectId === projectId)
          .map((task) => task.title.toLowerCase()),
      );
      for (const item of template.quickWins.slice(0, 3)) {
        const title = `Quick Win prüfen: ${item}`;
        if (existingTitles.has(title.toLowerCase())) continue;
        store.tasks.push({
          id: id("task"),
          projectId,
          title,
          owner: "assad",
          status: "todo",
          visibleToCustomer: false,
          createdAt: nowIso,
        });
      }
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Projektbrief generiert",
      body: `Interner Brief wurde erzeugt${publishSummary ? " und eine Kundenzusammenfassung wurde veröffentlicht" : ""}.`,
    });
  });

  if (publishSummary) {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Projektbrief aktualisiert",
      body: "Ein neuer Projektbrief wurde im Portal veröffentlicht.",
    });
  }

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?saved=brief`);
}

export async function generateProposalAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const scope = text(formData, "scope");
  const outcomes = text(formData, "outcomes");
  const timeline = text(formData, "timeline");
  const amount = text(formData, "amount");
  const createInvoice = checkbox(formData, "createInvoice");
  const sourceStore = await readStore();
  const bundle = getProjectBundle(sourceStore, projectId);
  if (!bundle) redirect(`/${locale}/portal/admin`);

  const now = new Date();
  const proposalId = id("proposal");
  const proposalNumber = `AD-P-${now.getFullYear()}-${now
    .getTime()
    .toString()
    .slice(-5)}`;
  const amountCents = cents(amount);
  const buffer = createProposalPdf({
    bundle,
    proposalNumber,
    scope,
    outcomes,
    timeline,
    amountCents,
  });
  const storagePath = await savePortalFile({
    projectId,
    fileId: proposalId,
    filename: `${proposalNumber}.pdf`,
    bytes: buffer,
    contentType: "application/pdf",
  });

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    const createdAt = now.toISOString();
    store.files.push({
      id: proposalId,
      projectId,
      name: `Proposal ${proposalNumber}`,
      description: [
        "Kundenangebot als PDF. Bitte prüfen und im Portal freigeben.",
        amountCents > 0 ? `Betrag: ${amountCents} Cent` : "",
        `Proposal-ID: ${proposalNumber}`,
      ]
        .filter(Boolean)
        .join("\n"),
      storagePath,
      mimeType: "application/pdf",
      size: buffer.length,
      visibility: "customer",
      category: "proposal",
      approvalStatus: "pending",
      uploadedBy: user.id,
      uploadedAt: createdAt,
    });

    store.updates.push({
      id: id("update"),
      projectId,
      title: "Proposal bereitgestellt",
      body: "Das Angebot wurde im Projektportal bereitgestellt.",
      visibility: "customer",
      asdarStage: bundle.project.asdarStage,
      createdBy: user.id,
      createdAt,
    });

    if (createInvoice && amountCents > 0) {
      store.invoices.push({
        id: id("invoice"),
        projectId,
        number: proposalNumber.replace("AD-P", "AD"),
        description: scope || "ASDAR Consulting",
        amountCents,
        currency: "EUR",
        status: "sent",
        issuedAt: createdAt.slice(0, 10),
        dueDate: undefined,
        createdAt,
      });
    }

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Proposal erstellt",
      body: `${proposalNumber} wurde als kundensichtbare Datei gespeichert${createInvoice && amountCents > 0 ? " und eine Rechnung wurde erzeugt" : ""}.`,
    });
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: "Assad Dar Portal: Proposal bereitgestellt",
    body: "Ein neues Angebot wurde im Projektportal bereitgestellt.",
  });
  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=proposal`);
}

export async function generateFinalReportAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const sourceStore = await readStore();
  const bundle = getProjectBundle(sourceStore, projectId);
  if (!bundle) redirect(`/${locale}/portal/admin`);

  const now = new Date().toISOString();
  const reportId = id("report");
  const filename = `ASDAR-Abschlussbericht-${now.slice(0, 10)}.pdf`;
  const buffer = createFinalReportPdf(bundle);
  const storagePath = await savePortalFile({
    projectId,
    fileId: reportId,
    filename,
    bytes: buffer,
    contentType: "application/pdf",
  });

  await mutateStore((store) => {
    const nextBundle = getProjectBundle(store, projectId);
    if (!nextBundle) return;

    store.files.push({
      id: reportId,
      projectId,
      name: `ASDAR Abschlussbericht ${now.slice(0, 10)}`,
      description:
        "Kundenbericht mit Projektstand, Deliverables, Chancen und nächsten Schritten.",
      storagePath,
      mimeType: "application/pdf",
      size: buffer.length,
      visibility: "customer",
      category: "final_report",
      approvalStatus: "pending",
      uploadedBy: user.id,
      uploadedAt: now,
    });

    store.updates.push({
      id: id("update"),
      projectId,
      title: "Abschlussbericht bereitgestellt",
      body:
        "Der Abschlussbericht wurde im Portal bereitgestellt. Bitte prüfen Sie den Bericht und geben Sie ihn im Portal frei, wenn alles passt.",
      visibility: "customer",
      asdarStage: nextBundle.project.asdarStage,
      createdBy: user.id,
      createdAt: now,
    });

    addAuditUpdate({
      store,
      projectId,
      userId: user.id,
      title: "Abschlussbericht generiert",
      body: "Ein kundensichtbarer Abschlussbericht wurde als PDF erzeugt.",
    });
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: "Assad Dar Portal: Abschlussbericht bereitgestellt",
    body: "Der Abschlussbericht wurde im Projektportal bereitgestellt.",
  });

  revalidateProjectViews(locale, projectId);
  redirect(`${adminProjectPath(locale, projectId)}?saved=final-report`);
}

export async function runAiScanAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const providers = [
    formData.get("provider_openai") === "on" ? "openai" : "",
    formData.get("provider_gemini") === "on" ? "gemini" : "",
    formData.get("provider_grok") === "on" ? "grok" : "",
  ].filter((provider): provider is "openai" | "gemini" | "grok" =>
    Boolean(provider),
  );

  const sourceStore = await readStore();
  const bundle = getProjectBundle(sourceStore, projectId);
  if (!bundle || providers.length === 0) {
    redirect(`${adminProjectPath(locale, projectId)}?error=ai`);
  }

  const prompt = [
    `Company: ${bundle.organization.name}`,
    `Industry: ${bundle.organization.industry}`,
    `ASDAR stage: ${bundle.project.asdarStage}`,
    `Context: ${bundle.intelligence.companyContext}`,
    `Issues: ${bundle.intelligence.issues}`,
    `Goals: ${bundle.intelligence.goals}`,
    `Tools: ${bundle.intelligence.currentTools}`,
    `Data situation: ${bundle.intelligence.dataSituation}`,
    `Constraints: ${bundle.intelligence.constraints}`,
    `Opportunities: ${bundle.intelligence.opportunities}`,
    "",
    buildTemplatePrompt(bundle, matchConsultingTemplate(bundle.organization.industry)),
    "",
    "Return concise consulting ideas for Assad as the consultant. Do not write a customer-facing strategy.",
    "Use exactly these section headings:",
    "Summary:",
    "Automation ideas:",
    "Risks:",
    "Next questions:",
    "Next actions:",
    "Use short bullet points under each heading. Do not use a table.",
  ].join("\n");

  const system =
    "You support Assad Dar, an AI and digitalization consultant using the ASDAR Method. Be specific, pragmatic, and concise. Do not invent facts beyond the project context.";

  const results = await Promise.all(
    providers.map((provider) =>
      requestExternalAiInsight({ provider, system, prompt }),
    ),
  );

  const savedCount = await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return 0;
    const now = new Date().toISOString();
    for (const result of results) {
      store.aiInsights.push({
        id: id("insight"),
        projectId,
        title: `AI Scan: ${result.provider} (${result.status})`,
        body: result.text,
        kind: result.status === "ok" ? "guidance" : "risk",
        createdAt: now,
      });
    }
    const okResults = results.filter((result) => result.status === "ok");
    if (okResults.length > 0) {
      addAuditUpdate({
        store,
        projectId,
        userId: user.id,
        title: "AI Scan gespeichert",
        body: `Provider: ${okResults.map((result) => result.provider).join(", ")}.`,
      });
    }
    return okResults.length;
  });

  revalidatePath(adminProjectPath(locale, projectId));
  redirect(
    `${adminProjectPath(locale, projectId)}?${
      savedCount > 0 ? "saved=ai" : "error=ai"
    }`,
  );
}
