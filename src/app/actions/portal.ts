"use server";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { requestExternalAiInsight } from "@/lib/portal/ai-providers";
import { appUrl } from "@/lib/portal/config";
import { sendPortalEmail } from "@/lib/portal/email";
import {
  findUserByEmail,
  getProjectBundle,
  id,
  mutateStore,
  readStore,
  upsertIntelligence,
} from "@/lib/portal/store";
import { createInvoiceCheckoutUrl } from "@/lib/portal/payments";
import { hashPassword } from "@/lib/portal/password";
import { savePortalFile } from "@/lib/portal/storage";
import {
  buildTemplatePrompt,
  getConsultingTemplate,
  matchConsultingTemplate,
  mergeTemplateIntake,
} from "@/lib/portal/templates";
import type {
  AsdarStage,
  Invoice,
  ProjectStatus,
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

function randomTemporaryPassword() {
  return `${randomBytes(18).toString("base64url")}!7`;
}

async function notifyProjectCustomers({
  locale,
  projectId,
  subject,
  body,
}: {
  locale: Locale;
  projectId: string;
  subject: string;
  body: string;
}) {
  const store = await readStore();
  const bundle = getProjectBundle(store, projectId);
  if (!bundle || bundle.customerUsers.length === 0) return;

  const projectUrl = `${appUrl()}/${locale}/portal/projects/${projectId}`;
  await Promise.all(
    bundle.customerUsers.map((customer) =>
      sendPortalEmail({
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
      }),
    ),
  );
}

export async function createProjectAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);

  const company = text(formData, "company");
  const template = getConsultingTemplate(text(formData, "templateId"));
  const industry =
    text(formData, "industry") || template?.industryLabel || "Noch nicht gesetzt";
  const projectName =
    text(formData, "projectName") || template?.projectName || "Neues ASDAR Projekt";
  const summary = text(formData, "summary") || template?.summary || "";
  const customerEmail = text(formData, "customerEmail").toLowerCase();

  if (!company) redirect(`/${locale}/portal/admin?error=company`);

  const projectId = await mutateStore((store) => {
    const createdAt = new Date().toISOString();
    const orgId = id("org");
    const nextProjectId = id("project");

    store.organizations.push({
      id: orgId,
      name: company,
      industry,
      createdAt,
    });

    store.projects.push({
      id: nextProjectId,
      organizationId: orgId,
      name: projectName,
      summary,
      status: "discovery",
      asdarStage: "analyse",
      health: "green",
      nextStep:
        template?.kickoffGoal || "Kickoff vorbereiten und Intake vervollständigen.",
      createdAt,
      updatedAt: createdAt,
    });

    store.projectIntelligence.push({
      projectId: nextProjectId,
      companyContext: template?.intake.companyContext ?? "",
      stakeholders: template?.intake.stakeholders ?? "",
      issues: template?.intake.issues ?? "",
      goals: template?.intake.goals ?? "",
      currentTools: template?.intake.currentTools ?? "",
      dataSituation: template?.intake.dataSituation ?? "",
      constraints: template?.intake.constraints ?? "",
      opportunities: template?.intake.opportunities ?? "",
      internalNotes: template?.intake.internalNotes ?? "",
      updatedAt: createdAt,
    });

    if (customerEmail) {
      const customer = findUserByEmail(store, customerEmail);
      if (customer && customer.role === "customer") {
        store.projectMembers.push({
          id: id("member"),
          projectId: nextProjectId,
          userId: customer.id,
          role: "client_owner",
          createdAt,
        });
      }
    }

    if (template) {
      for (const task of template.seedTasks) {
        store.tasks.push({
          id: id("task"),
          projectId: nextProjectId,
          title: task.title,
          owner: task.owner,
          status: "todo",
          visibleToCustomer: task.visibleToCustomer,
          createdAt,
        });
      }

      for (const milestone of template.seedMilestones) {
        store.milestones.push({
          id: id("milestone"),
          projectId: nextProjectId,
          title: milestone.title,
          status: "planned",
          visibleToCustomer: milestone.visibleToCustomer,
          createdAt,
        });
      }

      store.updates.push({
        id: id("update"),
        projectId: nextProjectId,
        title: template.customerKickoffUpdate.title,
        body: template.customerKickoffUpdate.body,
        visibility: "customer",
        asdarStage: "analyse",
        createdBy: user.id,
        createdAt,
      });
    }

    return nextProjectId;
  });

  revalidatePath(`/${locale}/portal`);
  redirect(adminProjectPath(locale, projectId));
}

export async function assignCustomerAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
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
    return true;
  });

  revalidatePath(adminProjectPath(locale, projectId));
  redirect(`${adminProjectPath(locale, projectId)}?assigned=${assigned ? "1" : "0"}`);
}

export async function inviteCustomerAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
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
  await requireAdmin(locale);
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
  });

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=overview`);
}

export async function updateIntelligenceAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
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
  });

  revalidatePath(adminProjectPath(locale, projectId));
  redirect(`${adminProjectPath(locale, projectId)}?saved=intelligence`);
}

export async function applyConsultingTemplateAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");
  const template =
    getConsultingTemplate(text(formData, "templateId")) ??
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
        "Setup Wizard abgeschlossen. Im naechsten Termin Pilotumfang, Datenzugang und Erfolgsmessung finalisieren.",
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
  });

  await notifyProjectCustomers({
    locale,
    projectId,
    subject: "Assad Dar Portal: Projekt-Setup abgeschlossen",
    body: "Das Projekt-Setup wurde aktualisiert. Der nächste Schritt ist jetzt im Portal sichtbar.",
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
        nextActions && `Naechste Aktionen:\n${nextActions}`,
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
  });

  if (publishSummary && customerSummary) {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Neue Meeting-Zusammenfassung",
      body: customerSummary,
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=meeting`);
}

export async function saveKnowledgeSnapshotAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
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
        "Naechste Fragen:",
        ...template.discoveryQuestions.map((item) => `- ${item}`),
        "",
        similar.length > 0
          ? `Aehnliche Projektbasis: ${similar.join(", ")}`
          : "Aehnliche Projektbasis: noch zu wenig Projekthistorie",
      ].join("\n"),
      kind: "guidance",
      createdAt: new Date().toISOString(),
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  redirect(`${adminProjectPath(locale, projectId)}?saved=knowledge`);
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

export async function addTaskAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
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
  });

  if (visibleToCustomer) {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Neue Aufgabe",
      body: `Neue Aufgabe im Projekt: ${title}`,
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=task`);
}

export async function addMilestoneAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
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
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
    });
  });

  if (fileVisibility === "customer") {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: "Assad Dar Portal: Neue Datei",
      body: `Eine neue Datei wurde im Projektportal bereitgestellt: ${displayName}`,
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=file`);
}

export async function addInvoiceAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
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
  });

  if (invoice.status !== "draft") {
    await notifyProjectCustomers({
      locale,
      projectId,
      subject: `Assad Dar Portal: Rechnung ${invoice.number}`,
      body: `Eine Rechnung wurde im Projektportal bereitgestellt: ${invoice.description || invoice.number}`,
    });
  }

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=invoice`);
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
  const proposalText = [
    "Assad Dar - AI & Digitalisierung",
    `Proposal: ${proposalNumber}`,
    "",
    `Kunde: ${bundle.organization.name}`,
    `Projekt: ${bundle.project.name}`,
    `Branche: ${bundle.organization.industry}`,
    "",
    "Ausgangslage",
    bundle.project.summary || bundle.intelligence.companyContext || "Wird im Projekt konkretisiert.",
    "",
    "Leistungsumfang",
    scope || "ASDAR Analyse, Prozessstrukturierung und Pilotdefinition.",
    "",
    "Erwartete Ergebnisse",
    outcomes || "Konkrete Automatisierungshebel, priorisierte Roadmap und naechste Umsetzungsschritte.",
    "",
    "Zeitrahmen",
    timeline || "Nach Abstimmung.",
    "",
    amountCents > 0 ? `Budget: ${amount}` : "Budget: nach Abstimmung",
  ].join("\n");

  const buffer = Buffer.from(proposalText, "utf8");
  const storagePath = await savePortalFile({
    projectId,
    fileId: proposalId,
    filename: `${proposalNumber}.txt`,
    bytes: buffer,
    contentType: "text/plain; charset=utf-8",
  });

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    const createdAt = now.toISOString();
    store.files.push({
      id: proposalId,
      projectId,
      name: `Proposal ${proposalNumber}`,
      description: "Kundenangebot aus dem Portal",
      storagePath,
      mimeType: "text/plain; charset=utf-8",
      size: buffer.length,
      visibility: "customer",
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

export async function runAiScanAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
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
    "Return concise consulting ideas for Assad as the consultant. Focus on practical next steps, automation opportunities, risks, and what to ask the customer next. Do not write a customer-facing strategy.",
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
    const okResults = results.filter((result) => result.status === "ok");
    for (const result of okResults) {
      store.aiInsights.push({
        id: id("insight"),
        projectId,
        title: `AI Scan: ${result.provider}`,
        body: result.text,
        kind: "guidance",
        createdAt: now,
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
