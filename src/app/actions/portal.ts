"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { requestExternalAiInsight } from "@/lib/portal/ai-providers";
import {
  findUserByEmail,
  getProjectBundle,
  id,
  mutateStore,
  readStore,
  upsertIntelligence,
} from "@/lib/portal/store";
import { createInvoiceCheckoutUrl } from "@/lib/portal/payments";
import { savePortalFile } from "@/lib/portal/storage";
import type {
  AsdarStage,
  Invoice,
  ProjectStatus,
  Visibility,
} from "@/lib/portal/types";

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

export async function createProjectAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);

  const company = text(formData, "company");
  const industry = text(formData, "industry") || "Noch nicht gesetzt";
  const projectName = text(formData, "projectName") || "Neues ASDAR Projekt";
  const summary = text(formData, "summary");
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
      nextStep: "Kickoff vorbereiten und Intake vervollständigen.",
      createdAt,
      updatedAt: createdAt,
    });

    store.projectIntelligence.push({
      projectId: nextProjectId,
      companyContext: "",
      stakeholders: "",
      issues: "",
      goals: "",
      currentTools: "",
      dataSituation: "",
      constraints: "",
      opportunities: "",
      internalNotes: "",
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

export async function addUpdateAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const user = await requireAdmin(locale);
  const projectId = text(formData, "projectId");

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    store.updates.push({
      id: id("update"),
      projectId,
      title: text(formData, "title") || "Projektupdate",
      body: text(formData, "body"),
      visibility: visibility(text(formData, "visibility")),
      asdarStage: asdar(text(formData, "asdarStage")),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=update`);
}

export async function addTaskAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
  const projectId = text(formData, "projectId");

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    store.tasks.push({
      id: id("task"),
      projectId,
      title: text(formData, "title") || "Neue Aufgabe",
      owner: text(formData, "owner") === "customer" ? "customer" : "assad",
      status:
        text(formData, "status") === "done"
          ? "done"
          : text(formData, "status") === "doing"
            ? "doing"
            : "todo",
      dueDate: text(formData, "dueDate") || undefined,
      visibleToCustomer: checkbox(formData, "visibleToCustomer"),
      createdAt: new Date().toISOString(),
    });
  });

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=task`);
}

export async function addMilestoneAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  await requireAdmin(locale);
  const projectId = text(formData, "projectId");

  await mutateStore((store) => {
    if (!getProjectBundle(store, projectId)) return;
    store.milestones.push({
      id: id("milestone"),
      projectId,
      title: text(formData, "title") || "Neuer Meilenstein",
      status:
        text(formData, "status") === "done"
          ? "done"
          : text(formData, "status") === "active"
            ? "active"
            : "planned",
      dueDate: text(formData, "dueDate") || undefined,
      visibleToCustomer: checkbox(formData, "visibleToCustomer"),
      createdAt: new Date().toISOString(),
    });
  });

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
      name: text(formData, "name") || upload.name || "Datei",
      description: text(formData, "description"),
      storagePath,
      mimeType: upload.type || "application/octet-stream",
      size: upload.size,
      visibility: visibility(text(formData, "visibility")),
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
    });
  });

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

  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal/projects/${projectId}`);
  redirect(`${adminProjectPath(locale, projectId)}?saved=invoice`);
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
