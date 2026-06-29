import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/content";
import { requireAdmin, requireUser } from "@/lib/portal/auth";
import { appUrl } from "@/lib/portal/config";
import { sendPortalEmail } from "@/lib/portal/email";
import {
  getProjectAccess,
  getProjectBundle,
  id,
  listProjectsForUser,
  readStore,
} from "@/lib/portal/store";
import { rejectUntrustedOrigin } from "@/lib/portal/security";
import {
  shouldSendUserNotification,
  type NotificationPreferenceKey,
} from "@/lib/portal/operations";
import type {
  AsdarStage,
  PortalStore,
  ProjectMilestone,
  ProjectStatus,
  ProjectTask,
  Visibility,
} from "@/lib/portal/types";

export function safeLocale(value: FormDataEntryValue | null): Locale {
  const raw = String(value || "de");
  return isLocale(raw) ? raw : "de";
}

export function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function visibility(value: string): Visibility {
  return value === "customer" ? "customer" : "internal";
}

export function asdar(value: string): AsdarStage {
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

export function status(value: string): ProjectStatus {
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

async function ensureTrustedActionOrigin(locale: Locale) {
  const requestHeaders = await headers();
  if (rejectUntrustedOrigin(requestHeaders)) {
    redirect(`/${locale}/login?error=origin`);
  }
}

export async function requireUserAction(locale: Locale) {
  await ensureTrustedActionOrigin(locale);
  return requireUser(locale);
}

export async function requireAdminAction(locale: Locale) {
  await ensureTrustedActionOrigin(locale);
  return requireAdmin(locale);
}

export function taskStatus(value: string): ProjectTask["status"] {
  if (value === "done" || value === "doing" || value === "todo") return value;
  return "todo";
}

export function milestoneStatus(value: string): ProjectMilestone["status"] {
  if (value === "done" || value === "active" || value === "planned") {
    return value;
  }
  return "planned";
}

export function addAuditUpdate({
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

export function addInternalMarker({
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

export function cents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function adminProjectPath(locale: Locale, projectId: string) {
  return `/${locale}/portal/admin/projects/${projectId}`;
}

export function customerProjectPath(locale: Locale, projectId: string) {
  return `/${locale}/portal/projects/${projectId}`;
}

export function appendNote(existing: string, title: string, body: string) {
  if (!body) return existing;
  return [existing, `${title}\n${body}`].filter(Boolean).join("\n\n");
}

export function lines(formData: FormData, key: string) {
  return text(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

export function markerLine(marker: string, payload: unknown) {
  return `${marker}:${JSON.stringify(payload)}`;
}

export function decisionStatus(value: string) {
  return value === "approved" ||
    value === "rejected" ||
    value === "needs_changes"
    ? value
    : "proposed";
}

export function changeRequestStatus(value: string) {
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

export async function requireProjectAccessForAction(
  locale: Locale,
  projectId: string,
) {
  const user = await requireUserAction(locale);
  const store = await readStore();
  if (!getProjectAccess(store, user.id, projectId)) {
    redirect(`/${locale}/portal`);
  }
  return user;
}

export function revalidateProjectViews(locale: Locale, projectId: string) {
  revalidatePath(adminProjectPath(locale, projectId));
  revalidatePath(customerProjectPath(locale, projectId));
  revalidatePath(`/${locale}/portal`);
}

export function randomTemporaryPassword() {
  return `${randomBytes(18).toString("base64url")}!7`;
}

export async function notifyProjectCustomers({
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
