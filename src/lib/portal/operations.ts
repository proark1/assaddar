import {
  isApproval,
  isCustomerComment,
  isCustomerIntake,
  isReminder,
  isStructuredUpdate,
} from "./automation";
import { formatCurrency, formatDate, formatStage } from "./format";
import {
  getConsultingCommercialModel,
  matchConsultingTemplate,
  type ConsultingOfferTier,
} from "./templates";
import type { ProjectBundle, User } from "./types";

export type PortalActionTone = "red" | "amber" | "green" | "copper";

export type CustomerNextAction = {
  id: string;
  tone: PortalActionTone;
  title: string;
  body: string;
  hrefView: "input" | "actions" | "files" | "messages" | "overview";
  cta: string;
  priority: number;
};

export type AdminFocusItem = {
  id: string;
  projectId: string;
  tone: PortalActionTone;
  title: string;
  body: string;
  action: string;
  priority: number;
};

export type CustomerChecklistItem = {
  id: string;
  title: string;
  body: string;
  status: "done" | "current" | "open";
  hrefView: CustomerNextAction["hrefView"];
};

export type AdminProjectAction = {
  id: string;
  tone: PortalActionTone;
  title: string;
  body: string;
  reason?: string;
  hrefView:
    | "setup"
    | "guidance"
    | "meeting"
    | "communication"
    | "delivery"
    | "billing"
    | "access";
  cta: string;
  priority: number;
};

export type ConsultantWorkflowBlock = {
  title: string;
  body: string;
  items: string[];
};

export type ProjectTimelineItem = {
  id: string;
  projectId: string;
  date: string;
  type: string;
  title: string;
  body: string;
  tone: PortalActionTone;
};

export type PortalNotification = {
  id: string;
  projectId: string;
  tone: PortalActionTone;
  title: string;
  body: string;
  cta: string;
  hrefView: AdminProjectAction["hrefView"];
  createdAt: string;
  priority: number;
};

export type ProjectPipelineColumn = {
  id:
    | "discovery"
    | "analysis"
    | "implementation"
    | "waiting"
    | "billing"
    | "completed";
  title: string;
  body: string;
  bundles: ProjectBundle[];
};

export type DraftReviewItem = {
  id: string;
  projectId: string;
  title: string;
  type:
    | "customer_update"
    | "meeting_summary"
    | "proposal"
    | "final_report"
    | "invoice_reminder"
    | "next_call_agenda";
  body: string;
  hrefView: AdminProjectAction["hrefView"];
  priority: number;
};

export type FileVersionGroup = {
  key: string;
  latest: ProjectBundle["files"][number];
  versions: ProjectBundle["files"];
};

export type ConsultantCopyTemplate = {
  id: string;
  title: string;
  body: string;
  content: string;
};

export type ConsultingCopilotBrief = {
  summary: string;
  missingInformation: string[];
  suggestedQuestions: string[];
  quickWins: string[];
  automationIdeas: string[];
  nextActions: string[];
  nextCustomerUpdate: {
    title: string;
    body: string;
  };
};

export type MeetingModePlan = {
  focus: string;
  agenda: string[];
  livePrompts: string[];
  decisionChecklist: string[];
  afterCallActions: string[];
  customerSummaryDraft: string;
};

export type AiProviderComparison = {
  provider: string;
  status: "ok" | "not_configured" | "error" | "unknown";
  createdAt: string;
  summary: string[];
  automationIdeas: string[];
  risks: string[];
  nextQuestions: string[];
  nextActions: string[];
  raw: string;
};

export type ProjectDiagnosis = {
  readinessScore: number;
  readinessLabel: string;
  missingInputs: string[];
  risks: string[];
  opportunities: string[];
  recommendedTasks: string[];
  recommendedMilestones: string[];
  customerSummary: string;
};

export type ProjectHealthScore = {
  score: number;
  tone: PortalActionTone;
  label: string;
  recommendedAction: string;
  factors: Array<{
    label: string;
    body: string;
    tone: PortalActionTone;
  }>;
};

export type ProjectKpiSnapshot = {
  baseline: string;
  target: string;
  roiHypothesis: string;
  owner: string;
  reviewDate: string;
  updatedAt?: string;
};

export type ProjectOfferRecommendation = {
  id: string;
  projectId: string;
  status: "draft" | "reviewed" | "sent" | "accepted";
  source: "rules" | "saved";
  packageId: ConsultingOfferTier["id"];
  packageLabel: string;
  title: string;
  scope: string;
  outcomes: string;
  deliverables: string[];
  assumptions: string[];
  risks: string[];
  priceMinCents: number;
  priceMaxCents: number;
  recommendedPriceCents: number;
  currency: "EUR";
  timeline: string;
  timelineWeeks: [number, number];
  effortDays: [number, number];
  complexityScore: number;
  confidence: number;
  confidenceLabel: string;
  reasoning: string[];
  nextQuestions: string[];
  createdAt: string;
  updatedAt: string;
};

export type AutomationHistoryItem = {
  id: string;
  title: string;
  body: string;
  rule?: string;
  createdAt: string;
};

export type DecisionRecord = {
  id: string;
  title: string;
  body: string;
  status: "proposed" | "approved" | "rejected" | "needs_changes";
  owner: "assad" | "customer";
  visibility: "internal" | "customer";
  response?: string;
  createdAt: string;
  updatedAt: string;
  sourceUpdateId: string;
};

export type ChangeRequestRecord = {
  id: string;
  title: string;
  body: string;
  status:
    | "new"
    | "scoping"
    | "quoted"
    | "accepted"
    | "in_progress"
    | "done"
    | "rejected";
  requestedBy: "assad" | "customer";
  estimate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  sourceUpdateId: string;
};

export type FileRequestRecord = {
  id: string;
  title: string;
  body: string;
  status: "open" | "uploaded" | "done";
  dueDate?: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
  sourceUpdateId: string;
};

export type WorkflowSnapshot = {
  id: string;
  title: string;
  trigger: string;
  checklist: string[];
  cadence: string;
  automation: string[];
  customerPromise: string;
  createdAt: string;
  updatedAt: string;
  sourceUpdateId: string;
};

export type LeadPipelineItem = {
  id: string;
  projectId: string;
  organizationName: string;
  projectName: string;
  email?: string;
  contactName?: string;
  source: string;
  summary: string;
  createdAt: string;
  score: number;
};

export type ClientAnalytics = {
  engagementLabel: string;
  engagementTone: PortalActionTone;
  latestCustomerSignal?: string;
  latestCustomerSignalAt?: string;
  openCustomerTasks: number;
  overdueCustomerTasks: number;
  pendingDecisions: number;
  pendingFileRequests: number;
  visibleUpdates: number;
  pendingInvoices: number;
  customerFiles: number;
  nextNudge: string;
};

export type ProjectCopilotPanel = {
  headline: string;
  summary: string;
  metrics: Array<{
    label: string;
    value: string;
    tone: PortalActionTone;
  }>;
  actions: Array<{
    id: string;
    title: string;
    body: string;
    hrefView: AdminProjectAction["hrefView"];
    tone: PortalActionTone;
  }>;
};

export type NotificationPreferenceKey =
  | "projectUpdates"
  | "tasks"
  | "files"
  | "invoices"
  | "reminders"
  | "appointments"
  | "weeklySummary";

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export type UserNotificationHistoryItem = {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  title: string;
  body: string;
  kind: "update" | "task" | "file" | "invoice" | "reminder" | "appointment";
  tone: PortalActionTone;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  projectUpdates: true,
  tasks: true,
  files: true,
  invoices: true,
  reminders: true,
  appointments: true,
  weeklySummary: true,
};

export const USER_NOTIFICATION_PREFS_MARKER = "USER_NOTIFICATION_PREFS";
export const OFFER_RECOMMENDATION_MARKER = "OFFER_RECOMMENDATION";

const DAY_MS = 24 * 60 * 60 * 1000;

function dateMs(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function isPast(date?: string) {
  if (!date) return false;
  const due = new Date(`${date}T23:59:59`);
  return Number.isFinite(due.getTime()) && due.getTime() < Date.now();
}

function daysSince(value?: string) {
  const time = dateMs(value);
  if (!time) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - time) / DAY_MS);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseJsonMarker<T>(body: string, marker: string): T | null {
  const match = body.match(new RegExp(`${marker}:(\\{[^\\n]*\\})`));
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]) as T;
  } catch {
    return null;
  }
}

function parseUserNotificationPreferences(
  body: string,
): (Partial<NotificationPreferences> & { userId?: string }) | null {
  return parseJsonMarker<Partial<NotificationPreferences> & { userId?: string }>(
    body,
    USER_NOTIFICATION_PREFS_MARKER,
  );
}

export function buildUserNotificationPreferences(
  userId: string,
  bundles: ProjectBundle[],
): NotificationPreferences {
  const latest = bundles
    .flatMap((bundle) => bundle.updates)
    .filter((update) => update.title === "Audit: Notification preferences")
    .map((update) => ({
      update,
      prefs: parseUserNotificationPreferences(update.body),
    }))
    .filter((entry) => entry.prefs?.userId === userId)
    .sort(
      (a, b) =>
        dateMs(b.update.createdAt) - dateMs(a.update.createdAt),
    )[0]?.prefs;

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...latest,
  };
}

export function shouldSendUserNotification(
  userId: string,
  bundles: ProjectBundle[],
  key: NotificationPreferenceKey,
) {
  return buildUserNotificationPreferences(userId, bundles)[key];
}

export function buildUserNotificationHistory(
  user: User,
  bundles: ProjectBundle[],
): UserNotificationHistoryItem[] {
  const history: UserNotificationHistoryItem[] = [];

  for (const bundle of bundles) {
    for (const update of bundle.updates) {
      if (update.title.startsWith("Audit:")) continue;
      if (user.role !== "admin" && update.visibility !== "customer") continue;
      const isAppointment = update.title.startsWith("Termin:");
      const reminder = isReminder(update.title);
      history.push({
        id: update.id,
        projectId: bundle.project.id,
        projectName: bundle.project.name,
        date: update.createdAt,
        title: update.title,
        body: update.body,
        kind: isAppointment ? "appointment" : reminder ? "reminder" : "update",
        tone: reminder ? "amber" : "copper",
      });
    }

    for (const task of bundle.tasks) {
      if (user.role !== "admin" && !task.visibleToCustomer) continue;
      history.push({
        id: task.id,
        projectId: bundle.project.id,
        projectName: bundle.project.name,
        date: task.createdAt,
        title: `Aufgabe: ${task.title}`,
        body:
          task.status === "done"
            ? "Aufgabe wurde erledigt."
            : task.owner === "customer"
              ? "Diese Aufgabe liegt beim Kunden."
              : "Assad arbeitet an dieser Aufgabe.",
        kind: "task",
        tone: task.status === "done" ? "green" : "amber",
      });
    }

    for (const file of bundle.files) {
      if (user.role !== "admin" && file.visibility !== "customer") continue;
      history.push({
        id: file.id,
        projectId: bundle.project.id,
        projectName: bundle.project.name,
        date: file.uploadedAt,
        title: `Datei: ${file.name}`,
        body: file.description || "Eine Datei wurde im Projektportal bereitgestellt.",
        kind: "file",
        tone: "copper",
      });
    }

    for (const invoice of bundle.invoices) {
      if (invoice.status === "draft" && user.role !== "admin") continue;
      history.push({
        id: invoice.id,
        projectId: bundle.project.id,
        projectName: bundle.project.name,
        date: invoice.createdAt,
        title: `Rechnung ${invoice.number}`,
        body: `${formatCurrency(invoice.amountCents, invoice.currency)} · ${invoice.status}`,
        kind: "invoice",
        tone:
          invoice.status === "paid"
            ? "green"
            : invoice.status === "overdue"
              ? "red"
              : "amber",
      });
    }
  }

  return history.sort((a, b) => dateMs(b.date) - dateMs(a.date));
}

function markerRecords<T extends { id?: string; updatedAt?: string; createdAt?: string }>(
  bundle: ProjectBundle,
  marker: string,
) {
  const records = new Map<string, T & { sourceUpdateId: string }>();

  for (const update of [...bundle.updates].sort(
    (a, b) => dateMs(a.createdAt) - dateMs(b.createdAt),
  )) {
    const parsed = parseJsonMarker<T>(update.body, marker);
    const recordId = parsed?.id;
    if (!parsed || !recordId) continue;
    records.set(recordId, {
      ...parsed,
      sourceUpdateId: update.id,
      createdAt: parsed.createdAt ?? update.createdAt,
      updatedAt: parsed.updatedAt ?? update.createdAt,
    });
  }

  return [...records.values()].sort(
    (a, b) => dateMs(b.updatedAt) - dateMs(a.updatedAt),
  );
}

function customerUpdates(bundle: ProjectBundle) {
  return bundle.updates
    .filter(
      (update) =>
        update.visibility === "customer" && !isStructuredUpdate(update.title),
    )
    .sort((a, b) => dateMs(b.createdAt) - dateMs(a.createdAt));
}

function sortTimeline(items: ProjectTimelineItem[]) {
  return items.sort((a, b) => dateMs(b.date) - dateMs(a.date));
}

function approvalIds(bundle: ProjectBundle, type: "FILE" | "MILESTONE") {
  return new Set(
    bundle.updates
      .filter((update) => isApproval(update.title))
      .map((update) => update.body.match(new RegExp(`APPROVAL_${type}:([^\\n]+)`))?.[1])
      .filter((value): value is string => Boolean(value)),
  );
}

export function hasCustomerIntake(bundle: ProjectBundle) {
  return bundle.updates.some((update) => isCustomerIntake(update.title));
}

export function latestCustomerUpdateDate(bundle: ProjectBundle) {
  return customerUpdates(bundle)[0]?.createdAt;
}

export function buildProjectTimeline(
  bundle: ProjectBundle,
  scope: "admin" | "customer" = "admin",
): ProjectTimelineItem[] {
  const customerScope = scope === "customer";
  const visibleUpdates = bundle.updates.filter((update) =>
    customerScope ? update.visibility === "customer" : true,
  );
  const visibleTasks = bundle.tasks.filter((task) =>
    customerScope ? task.visibleToCustomer : true,
  );
  const visibleMilestones = bundle.milestones.filter((milestone) =>
    customerScope ? milestone.visibleToCustomer : true,
  );
  const visibleFiles = bundle.files.filter((file) =>
    customerScope ? file.visibility === "customer" : true,
  );
  const visibleInvoices = bundle.invoices.filter((invoice) =>
    customerScope ? invoice.status !== "draft" : true,
  );

  const timeline: ProjectTimelineItem[] = [
    ...visibleUpdates.map((update) => ({
      id: update.id,
      projectId: bundle.project.id,
      date: update.createdAt,
      type: isCustomerComment(update.title)
        ? "Kommentar"
        : isCustomerIntake(update.title)
          ? "Intake"
          : isApproval(update.title)
            ? "Freigabe"
          : isReminder(update.title)
            ? "Reminder"
            : update.title.startsWith("Termin:")
              ? "Termin"
              : update.visibility === "customer"
                ? "Kundenupdate"
                : "Intern",
      title: update.title
        .replace(/^Audit:\s*/, "")
        .replace(/^Kommentar:\s*/, "")
        .replace(/^Intake:\s*/, "")
        .replace(/^Freigabe:\s*/, "")
        .replace(/^Erinnerung:\s*/, ""),
      body: update.body.replace(/^APPROVAL_[A-Z]+:[^\n]+\n/, ""),
      tone: (update.visibility === "customer" ? "green" : "copper") as PortalActionTone,
    })),
    ...visibleTasks.map((task) => ({
      id: task.id,
      projectId: bundle.project.id,
      date: task.createdAt,
      type: "Aufgabe",
      title: task.title,
      body: `Owner: ${task.owner === "assad" ? "Assad" : "Kunde"} · Status: ${task.status}${
        task.dueDate ? ` · fällig ${formatDate(task.dueDate)}` : ""
      }`,
      tone: (task.status === "done"
        ? "green"
        : isPast(task.dueDate)
          ? "red"
          : "amber") as PortalActionTone,
    })),
    ...visibleMilestones.map((milestone) => ({
      id: milestone.id,
      projectId: bundle.project.id,
      date: milestone.createdAt,
      type: "Meilenstein",
      title: milestone.title,
      body: `${milestone.status}${milestone.dueDate ? ` · ${formatDate(milestone.dueDate)}` : ""}`,
      tone: (milestone.status === "done" ? "green" : "copper") as PortalActionTone,
    })),
    ...visibleFiles.map((file) => ({
      id: file.id,
      projectId: bundle.project.id,
      date: file.uploadedAt,
      type: "Datei",
      title: file.name,
      body: file.description || `${file.visibility} · ${Math.ceil(file.size / 1024)} KB`,
      tone: (file.visibility === "customer" ? "green" : "copper") as PortalActionTone,
    })),
    ...visibleInvoices.map((invoice) => ({
      id: invoice.id,
      projectId: bundle.project.id,
      date: invoice.createdAt,
      type: "Rechnung",
      title: invoice.number,
      body: `${formatCurrency(invoice.amountCents, invoice.currency)} · ${invoice.status}${
        invoice.dueDate ? ` · fällig ${formatDate(invoice.dueDate)}` : ""
      }`,
      tone: (
        invoice.status === "paid"
          ? "green"
          : invoice.status === "overdue" || isPast(invoice.dueDate)
            ? "red"
            : "amber"
      ) as PortalActionTone,
    })),
  ];

  return sortTimeline(timeline);
}

export function buildCustomerNextActions(bundle: ProjectBundle): CustomerNextAction[] {
  const actions: CustomerNextAction[] = [];
  const fileApprovals = approvalIds(bundle, "FILE");
  const milestoneApprovals = approvalIds(bundle, "MILESTONE");
  const pendingCustomerTasks = bundle.tasks.filter(
    (task) => task.visibleToCustomer && task.owner === "customer" && task.status !== "done",
  );
  const pendingFiles = bundle.files.filter(
    (file) =>
      file.visibility === "customer" &&
      file.approvalStatus !== "not_required" &&
      file.approvalStatus !== "approved" &&
      !fileApprovals.has(file.id),
  );
  const pendingMilestones = bundle.milestones.filter(
    (milestone) =>
      milestone.visibleToCustomer &&
      milestone.status !== "done" &&
      !milestoneApprovals.has(milestone.id),
  );
  const openInvoices = bundle.invoices.filter(
    (invoice) => invoice.status !== "draft" && invoice.status !== "paid",
  );

  if (!hasCustomerIntake(bundle)) {
    actions.push({
      id: "intake",
      tone: "amber",
      title: "Projektfragebogen ausfüllen",
      body: "Assad braucht diese Antworten, um Analyse, Empfehlungen und nächste Schritte sauber vorzubereiten.",
      hrefView: "input",
      cta: "Fragebogen öffnen",
      priority: 10,
    });
  }

  for (const task of pendingCustomerTasks.slice(0, 3)) {
    actions.push({
      id: `task-${task.id}`,
      tone: isPast(task.dueDate) ? "red" : "copper",
      title: task.title,
      body: `Kundenaufgabe${task.dueDate ? ` · fällig ${formatDate(task.dueDate)}` : ""}.`,
      hrefView: "actions",
      cta: "Aufgabe bearbeiten",
      priority: isPast(task.dueDate) ? 9 : 7,
    });
  }

  if (pendingFiles.length > 0) {
    actions.push({
      id: "file-approval",
      tone: "amber",
      title: `${pendingFiles.length} Datei${pendingFiles.length === 1 ? "" : "en"} prüfen`,
      body: "Neue Deliverables warten auf Download, Prüfung oder Freigabe.",
      hrefView: "files",
      cta: "Dateien prüfen",
      priority: 8,
    });
  }

  if (pendingMilestones.length > 0) {
    actions.push({
      id: "milestone-approval",
      tone: "copper",
      title: `${pendingMilestones.length} Meilenstein${pendingMilestones.length === 1 ? "" : "e"} prüfen`,
      body: "Bestätigen Sie den aktuellen Projektfortschritt oder senden Sie eine Rückfrage.",
      hrefView: "actions",
      cta: "Roadmap öffnen",
      priority: 6,
    });
  }

  if (openInvoices.length > 0) {
    const total = openInvoices.reduce((sum, invoice) => sum + invoice.amountCents, 0);
    actions.push({
      id: "invoice",
      tone: openInvoices.some((invoice) => invoice.status === "overdue" || isPast(invoice.dueDate))
        ? "red"
        : "amber",
      title: "Offene Rechnung",
      body: `${formatCurrency(total, openInvoices[0]?.currency ?? "EUR")} sind aktuell offen.`,
      hrefView: "files",
      cta: "Rechnung ansehen",
      priority: 5,
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "no-action",
      tone: "green",
      title: "Aktuell ist nichts von Ihnen offen",
      body: bundle.project.nextStep || "Assad arbeitet am nächsten Projektschritt und informiert Sie im Portal.",
      hrefView: "overview",
      cta: "Status ansehen",
      priority: 1,
    });
  }

  return actions.sort((a, b) => b.priority - a.priority);
}

export function buildCustomerChecklist(
  bundle: ProjectBundle,
): CustomerChecklistItem[] {
  const hasIntake = hasCustomerIntake(bundle);
  const customerTaskOpen = bundle.tasks.some(
    (task) =>
      task.visibleToCustomer &&
      task.owner === "customer" &&
      task.status !== "done",
  );
  const customerFiles = bundle.files.some(
    (file) => file.visibility === "customer",
  );
  const hasVisibleUpdate = customerUpdates(bundle).length > 0;
  const paidOrNoInvoices = bundle.invoices
    .filter((invoice) => invoice.status !== "draft")
    .every((invoice) => invoice.status === "paid");

  return [
    {
      id: "intake",
      title: "Informationen bereitstellen",
      body: hasIntake
        ? "Der Projektfragebogen liegt vor und kann bei Änderungen ergänzt werden."
        : "Füllen Sie den kurzen Fragebogen aus, damit Assad fundiert starten kann.",
      status: hasIntake ? "done" : "current",
      hrefView: "input",
    },
    {
      id: "analysis",
      title: "Analyse und Priorisierung",
      body: hasVisibleUpdate
        ? "Assad hat erste Informationen oder Statusupdates für Sie freigegeben."
        : "Assad prüft die Eingaben und bereitet die nächsten Schritte vor.",
      status: hasIntake ? (hasVisibleUpdate ? "done" : "current") : "open",
      hrefView: "overview",
    },
    {
      id: "actions",
      title: "Aufgaben und Freigaben",
      body: customerTaskOpen
        ? "Es gibt noch mindestens eine Aufgabe oder Rückmeldung von Ihrer Seite."
        : "Aktuell blockiert keine Kundenaufgabe den Projektfortschritt.",
      status: customerTaskOpen ? "current" : hasIntake ? "done" : "open",
      hrefView: "actions",
    },
    {
      id: "delivery",
      title: "Deliverables und Rechnung",
      body: customerFiles
        ? "Dateien, Ergebnisse und Rechnungen sind im Portal gebündelt."
        : "Sobald Ergebnisse bereitstehen, erscheinen sie hier klar getrennt von Aufgaben.",
      status: customerFiles || paidOrNoInvoices ? "done" : "open",
      hrefView: "files",
    },
  ];
}

export function buildAdminProjectActions(
  bundle: ProjectBundle,
): AdminProjectAction[] {
  const actions: AdminProjectAction[] = [];
  const diagnosis = buildProjectDiagnosis(bundle);
  const latestUpdateAge = daysSince(latestCustomerUpdateDate(bundle));
  const hasCustomer = bundle.customerUsers.length > 0;
  const customerTaskOverdue = bundle.tasks.filter(
    (task) =>
      task.visibleToCustomer &&
      task.owner === "customer" &&
      task.status !== "done" &&
      isPast(task.dueDate),
  );
  const openAssadTasks = bundle.tasks.filter(
    (task) => task.owner === "assad" && task.status !== "done",
  );
  const openInvoices = bundle.invoices.filter(
    (invoice) =>
      invoice.status !== "draft" &&
      invoice.status !== "paid" &&
      (invoice.status === "overdue" || isPast(invoice.dueDate)),
  );

  if (!hasCustomer) {
    actions.push({
      id: "customer-access",
      tone: "red",
      title: "Kundenkonto fehlt",
      body: "Ohne zugeordneten Kunden sieht niemand Status, Aufgaben oder Dateien.",
      reason: "Projektzugriff ist die Basis für transparente Zusammenarbeit.",
      hrefView: "access",
      cta: "Kunden einladen",
      priority: 10,
    });
  }

  if (!hasCustomerIntake(bundle)) {
    actions.push({
      id: "missing-intake",
      tone: "amber",
      title: "Intake fehlt",
      body: "Der Kunde sollte zuerst den Fragebogen ausfüllen oder einen Reminder erhalten.",
      reason: "Ohne Kundeninput bleiben Analyse und Empfehlungen zu allgemein.",
      hrefView: "communication",
      cta: "Reminder senden",
      priority: 9,
    });
  }

  if (diagnosis.missingInputs.length > 0) {
    actions.push({
      id: "missing-diagnosis-input",
      tone: diagnosis.readinessScore < 55 ? "red" : "amber",
      title: `${diagnosis.missingInputs.length} Analysefelder fehlen`,
      body: `Ergänzen: ${diagnosis.missingInputs.slice(0, 3).join(", ")}.`,
      reason: "Die Readiness sinkt, wenn Kontext, Ziele, Daten oder Constraints fehlen.",
      hrefView: "guidance",
      cta: "Intelligence ergänzen",
      priority: diagnosis.readinessScore < 55 ? 8 : 6,
    });
  }

  if (customerTaskOverdue.length > 0) {
    actions.push({
      id: "overdue-customer-task",
      tone: "red",
      title: "Kundenaufgabe überfällig",
      body: `${customerTaskOverdue.length} offene Aufgabe(n) brauchen Nachfassung.`,
      reason: "Überfällige Kundentasks blockieren Analyse, Umsetzung oder Freigaben.",
      hrefView: "delivery",
      cta: "Nachfassen",
      priority: 9,
    });
  }

  if (latestUpdateAge > 7) {
    actions.push({
      id: "customer-update",
      tone: "amber",
      title: "Kundenupdate fällig",
      body: "Seit mehr als sieben Tagen gibt es kein normales Kundenupdate.",
      reason: "Regelmäßige Updates halten Vertrauen und Projekttempo hoch.",
      hrefView: "communication",
      cta: "Update schreiben",
      priority: 7,
    });
  }

  if (openAssadTasks.length === 0) {
    actions.push({
      id: "assad-task",
      tone: "copper",
      title: "Nächste Assad-Aufgabe definieren",
      body: "Ein klares internes To-do macht den nächsten Beratungsschritt sichtbar.",
      reason: "Ohne internes To-do gibt es keinen operativen Anker für den nächsten Fortschritt.",
      hrefView: "delivery",
      cta: "Aufgabe anlegen",
      priority: 5,
    });
  }

  if (openInvoices.length > 0) {
    actions.push({
      id: "invoice-overdue",
      tone: "red",
      title: "Rechnung nachfassen",
      body: `${openInvoices.length} Rechnung(en) sind offen oder überfällig.`,
      reason: "Offene Zahlungen sollten sichtbar vom Projektfortschritt getrennt gesteuert werden.",
      hrefView: "billing",
      cta: "Billing öffnen",
      priority: 8,
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "healthy",
      tone: "green",
      title: "Projekt ist operativ sauber",
      body: "Keine kritischen Lücken erkannt. Nutze den nächsten Termin für Priorisierung und Umsetzung.",
      reason: "Health, Intake, Updates, Aufgaben und Rechnungen zeigen keine dringende Blockade.",
      hrefView: "guidance",
      cta: "Guidance öffnen",
      priority: 1,
    });
  }

  return actions.sort((a, b) => b.priority - a.priority);
}

export function buildProjectHealthScore(
  bundle: ProjectBundle,
): ProjectHealthScore {
  const diagnosis = buildProjectDiagnosis(bundle);
  const factors: ProjectHealthScore["factors"] = [];
  let score = 100;

  const addFactor = ({
    penalty,
    label,
    body,
    tone,
  }: {
    penalty: number;
    label: string;
    body: string;
    tone: PortalActionTone;
  }) => {
    score -= penalty;
    factors.push({ label, body, tone });
  };

  if (bundle.customerUsers.length === 0) {
    addFactor({
      penalty: 20,
      label: "Kein Kundenzugriff",
      body: "Der Kunde kann Status, Aufgaben und Dateien noch nicht sehen.",
      tone: "red",
    });
  }

  if (!hasCustomerIntake(bundle)) {
    addFactor({
      penalty: 15,
      label: "Intake offen",
      body: "Der geführte Fragebogen fehlt noch oder wurde noch nicht eingereicht.",
      tone: "amber",
    });
  }

  if (diagnosis.missingInputs.length > 0) {
    addFactor({
      penalty: clamp(diagnosis.missingInputs.length * 7, 7, 28),
      label: "Analyse-Lücken",
      body: diagnosis.missingInputs.slice(0, 4).join(", "),
      tone: diagnosis.readinessScore < 55 ? "red" : "amber",
    });
  }

  const updateAge = daysSince(latestCustomerUpdateDate(bundle));
  if (updateAge > 14) {
    addFactor({
      penalty: 24,
      label: "Update sehr alt",
      body: `Seit ${Number.isFinite(updateAge) ? updateAge : "mehreren"} Tagen kein Kundenupdate.`,
      tone: "red",
    });
  } else if (updateAge > 7) {
    addFactor({
      penalty: 12,
      label: "Update fällig",
      body: `Seit ${updateAge} Tagen kein normales Kundenupdate.`,
      tone: "amber",
    });
  }

  const overdueCustomerTasks = bundle.tasks.filter(
    (task) =>
      task.owner === "customer" &&
      task.visibleToCustomer &&
      task.status !== "done" &&
      isPast(task.dueDate),
  );
  if (overdueCustomerTasks.length > 0) {
    addFactor({
      penalty: clamp(overdueCustomerTasks.length * 10, 10, 25),
      label: "Kundenaufgaben überfällig",
      body: `${overdueCustomerTasks.length} Aufgabe(n) blockieren den nächsten Schritt.`,
      tone: "red",
    });
  }

  const overdueInvoices = bundle.invoices.filter(
    (invoice) =>
      invoice.status !== "draft" &&
      invoice.status !== "paid" &&
      (invoice.status === "overdue" || isPast(invoice.dueDate)),
  );
  if (overdueInvoices.length > 0) {
    addFactor({
      penalty: clamp(overdueInvoices.length * 8, 8, 20),
      label: "Rechnung offen",
      body: `${overdueInvoices.length} Rechnung(en) müssen nachgefasst werden.`,
      tone: "red",
    });
  }

  if (bundle.project.health === "red") {
    addFactor({
      penalty: 15,
      label: "Manuell kritisch markiert",
      body: "Das Projekt ist im Admin als rot markiert.",
      tone: "red",
    });
  } else if (bundle.project.health === "amber") {
    addFactor({
      penalty: 8,
      label: "Manuell beobachtet",
      body: "Das Projekt ist im Admin als amber markiert.",
      tone: "amber",
    });
  }

  const nextAction = buildAdminProjectActions(bundle)[0];
  const normalized = clamp(score, 0, 100);
  const tone: PortalActionTone =
    normalized < 50 ? "red" : normalized < 75 ? "amber" : "green";

  return {
    score: normalized,
    tone,
    label:
      tone === "green"
        ? "Stabil"
        : tone === "amber"
          ? "Aufmerksamkeit nötig"
          : "Kritisch",
    recommendedAction:
      nextAction?.title ?? "Projekt prüfen und nächsten Schritt festlegen.",
    factors:
      factors.length > 0
        ? factors
        : [
            {
              label: "Keine Blockade",
              body: "Zugriff, Intake, Updates, Aufgaben und Rechnungen wirken sauber.",
              tone: "green",
            },
          ],
  };
}

export function buildAutomationHistory(
  bundle: ProjectBundle,
): AutomationHistoryItem[] {
  return bundle.updates
    .filter(
      (update) =>
        update.title.startsWith("Audit:") &&
        update.body.includes("AUTOMATION_RULE:"),
    )
    .map((update) => ({
      id: update.id,
      title: update.title.replace(/^Audit:\s*/, ""),
      body: update.body.replace(/^AUTOMATION_RULE:[^\n]+\n?/, "").trim(),
      rule: update.body.match(/AUTOMATION_RULE:([^\s\n]+)/)?.[1],
      createdAt: update.createdAt,
    }))
    .sort((a, b) => dateMs(b.createdAt) - dateMs(a.createdAt));
}

export function buildDecisionCenter(bundle: ProjectBundle): DecisionRecord[] {
  return markerRecords<DecisionRecord>(bundle, "DECISION_RECORD").filter(
    (decision) =>
      decision.visibility === "customer" ||
      decision.visibility === "internal",
  );
}

export function buildChangeRequests(
  bundle: ProjectBundle,
): ChangeRequestRecord[] {
  return markerRecords<ChangeRequestRecord>(bundle, "CHANGE_REQUEST");
}

export function buildFileRequests(bundle: ProjectBundle): FileRequestRecord[] {
  const records = markerRecords<FileRequestRecord>(bundle, "FILE_REQUEST");
  return records.map((record) => {
    const linkedTask = record.taskId
      ? bundle.tasks.find((task) => task.id === record.taskId)
      : undefined;
    const uploaded = linkedTask?.status === "done";
    return {
      ...record,
      status:
        record.status === "done" || uploaded
          ? "done"
          : record.status === "uploaded"
            ? "uploaded"
            : "open",
    };
  });
}

export function buildWorkflowSnapshots(
  bundle: ProjectBundle,
): WorkflowSnapshot[] {
  return markerRecords<WorkflowSnapshot>(bundle, "WORKFLOW_SNAPSHOT");
}

export function buildLeadPipeline(
  bundles: ProjectBundle[],
): LeadPipelineItem[] {
  const leads: LeadPipelineItem[] = [];

  for (const bundle of bundles) {
    const leadUpdate = bundle.updates.find(
      (update) =>
        update.title.startsWith("Lead:") ||
        update.body.includes("LEAD_RECORD:"),
    );
    const parsed = leadUpdate
      ? parseJsonMarker<{
          id?: string;
          name?: string;
          email?: string;
          company?: string;
          message?: string;
          leadContext?: string;
          source?: string;
          createdAt?: string;
        }>(leadUpdate.body, "LEAD_RECORD")
      : null;
    const isLead =
      Boolean(leadUpdate) ||
      bundle.project.name.toLowerCase().startsWith("lead:");
    if (!isLead) continue;

    const filledSignals = [
      parsed?.email,
      parsed?.message,
      parsed?.leadContext,
      bundle.intelligence.issues,
      bundle.intelligence.goals,
      bundle.organization.website,
    ].filter(Boolean).length;

    leads.push({
      id: parsed?.id ?? leadUpdate?.id ?? bundle.project.id,
      projectId: bundle.project.id,
      organizationName: parsed?.company || bundle.organization.name,
      projectName: bundle.project.name.replace(/^Lead:\s*/i, ""),
      ...(parsed?.email ? { email: parsed.email } : {}),
      ...(parsed?.name ? { contactName: parsed.name } : {}),
      source: parsed?.source ?? "Website / Portal",
      summary:
        parsed?.message ||
        bundle.project.summary ||
        bundle.intelligence.companyContext ||
        "Lead prüfen und Erstgespräch vorbereiten.",
      createdAt:
        parsed?.createdAt ?? leadUpdate?.createdAt ?? bundle.project.createdAt,
      score: clamp(35 + filledSignals * 10, 35, 95),
    });
  }

  return leads.sort((a, b) => dateMs(b.createdAt) - dateMs(a.createdAt));
}

export function buildClientAnalytics(bundle: ProjectBundle): ClientAnalytics {
  const customerSignal = [...bundle.updates]
    .filter(
      (update) =>
        update.visibility === "customer" &&
        (isCustomerComment(update.title) ||
          isCustomerIntake(update.title) ||
          isApproval(update.title) ||
          update.title.startsWith("Ticket:")),
    )
    .sort((a, b) => dateMs(b.createdAt) - dateMs(a.createdAt))[0];
  const openCustomerTasks = bundle.tasks.filter(
    (task) =>
      task.owner === "customer" &&
      task.visibleToCustomer &&
      task.status !== "done",
  );
  const overdueCustomerTasks = openCustomerTasks.filter((task) =>
    isPast(task.dueDate),
  );
  const pendingDecisions = buildDecisionCenter(bundle).filter(
    (decision) =>
      decision.visibility === "customer" && decision.status === "proposed",
  );
  const pendingFileRequests = buildFileRequests(bundle).filter(
    (request) => request.status === "open",
  );
  const pendingInvoices = bundle.invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "draft",
  );
  const visibleUpdates = customerUpdates(bundle).length;
  const customerFiles = bundle.files.filter(
    (file) => file.category === "customer_upload",
  ).length;
  const stale = daysSince(customerUpdates(bundle)[0]?.createdAt) > 7;
  const engagementTone: PortalActionTone =
    overdueCustomerTasks.length > 0 || pendingInvoices.some((invoice) => isPast(invoice.dueDate))
      ? "red"
      : pendingDecisions.length > 0 || pendingFileRequests.length > 0 || stale
        ? "amber"
        : "green";
  const engagementLabel =
    engagementTone === "green"
      ? "Aktiv"
      : engagementTone === "amber"
        ? "Nachfassen"
        : "Blockiert";

  let nextNudge = "Kein dringender Kundennudge nötig.";
  if (pendingDecisions.length > 0) {
    nextNudge = `Entscheidung nachfassen: ${pendingDecisions[0].title}`;
  } else if (pendingFileRequests.length > 0) {
    nextNudge = `Datei anfragen: ${pendingFileRequests[0].title}`;
  } else if (overdueCustomerTasks.length > 0) {
    nextNudge = `Überfällige Aufgabe erinnern: ${overdueCustomerTasks[0].title}`;
  } else if (stale) {
    nextNudge = "Kundenupdate veröffentlichen, damit Fortschritt sichtbar bleibt.";
  }

  return {
    engagementLabel,
    engagementTone,
    latestCustomerSignal: customerSignal?.title,
    latestCustomerSignalAt: customerSignal?.createdAt,
    openCustomerTasks: openCustomerTasks.length,
    overdueCustomerTasks: overdueCustomerTasks.length,
    pendingDecisions: pendingDecisions.length,
    pendingFileRequests: pendingFileRequests.length,
    visibleUpdates,
    pendingInvoices: pendingInvoices.length,
    customerFiles,
    nextNudge,
  };
}

export function buildProjectCopilotPanel(
  bundle: ProjectBundle,
): ProjectCopilotPanel {
  const diagnosis = buildProjectDiagnosis(bundle);
  const health = buildProjectHealthScore(bundle);
  const analytics = buildClientAnalytics(bundle);
  const decisions = buildDecisionCenter(bundle);
  const changes = buildChangeRequests(bundle);
  const files = buildFileRequests(bundle);
  const actions = buildAdminProjectActions(bundle).slice(0, 3).map((action) => ({
    id: action.id,
    title: action.title,
    body: action.body,
    hrefView: action.hrefView,
    tone: action.tone,
  }));

  if (decisions.some((decision) => decision.status === "proposed")) {
    actions.unshift({
      id: "decision-pending",
      title: "Entscheidung aktiv klären",
      body: "Mindestens eine Entscheidung wartet auf Freigabe oder Rückmeldung.",
      hrefView: "communication",
      tone: "amber",
    });
  }

  if (files.some((request) => request.status === "open")) {
    actions.unshift({
      id: "file-request-pending",
      title: "Datenbedarf nachfassen",
      body: "Ein Dateiwunsch ist offen. Ohne Input wird die Beratung langsamer.",
      hrefView: "delivery",
      tone: "amber",
    });
  }

  if (changes.some((request) => request.status === "new")) {
    actions.unshift({
      id: "scope-new",
      title: "Scope Change bewerten",
      body: "Ein neuer Änderungswunsch braucht Schätzung, Entscheidung oder Ablehnung.",
      hrefView: "billing",
      tone: "copper",
    });
  }

  return {
    headline:
      health.tone === "green"
        ? "Projekt läuft sauber. Nächsten Nutzen sichtbar machen."
        : health.recommendedAction,
    summary: [
      `Readiness ${diagnosis.readinessScore}/100.`,
      `Kundenengagement: ${analytics.engagementLabel}.`,
      diagnosis.missingInputs.length
        ? `Noch offen: ${diagnosis.missingInputs.slice(0, 3).join(", ")}.`
        : "Die wichtigsten Beratungsgrundlagen sind vorhanden.",
    ].join(" "),
    metrics: [
      {
        label: "Health",
        value: String(health.score),
        tone: health.tone,
      },
      {
        label: "Entscheidungen",
        value: String(decisions.filter((item) => item.status === "proposed").length),
        tone: decisions.some((item) => item.status === "proposed")
          ? "amber"
          : "green",
      },
      {
        label: "Change Requests",
        value: String(
          changes.filter((item) => item.status !== "done" && item.status !== "rejected")
            .length,
        ),
        tone: changes.some((item) => item.status === "new") ? "copper" : "green",
      },
      {
        label: "Dateiwünsche",
        value: String(files.filter((item) => item.status === "open").length),
        tone: files.some((item) => item.status === "open") ? "amber" : "green",
      },
    ],
    actions: actions.slice(0, 5),
  };
}

export function buildProjectKpiSnapshot(
  bundle: ProjectBundle,
): ProjectKpiSnapshot {
  const latest = bundle.updates.find((update) =>
    update.body.includes("KPI_SNAPSHOT:"),
  );
  if (latest) {
    const raw = latest.body.match(/KPI_SNAPSHOT:(\{.*\})/)?.[1];
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<ProjectKpiSnapshot>;
        return {
          baseline: parsed.baseline?.trim() || "Noch nicht festgelegt",
          target: parsed.target?.trim() || "Noch nicht festgelegt",
          roiHypothesis: parsed.roiHypothesis?.trim() || "Noch nicht berechnet",
          owner: parsed.owner?.trim() || "Assad",
          reviewDate: parsed.reviewDate?.trim() || "",
          updatedAt: latest.createdAt,
        };
      } catch {
        // Ignore malformed historical snapshots and fall through to defaults.
      }
    }
  }

  return {
    baseline:
      bundle.intelligence.issues ||
      bundle.project.summary ||
      "Noch nicht festgelegt",
    target: bundle.intelligence.goals || "Noch nicht festgelegt",
    roiHypothesis:
      bundle.intelligence.opportunities ||
      "Noch keine ROI-Hypothese gespeichert.",
    owner: "Assad",
    reviewDate: "",
    updatedAt: undefined,
  };
}

export function buildConsultantWorkflow(
  bundle: ProjectBundle,
): ConsultantWorkflowBlock[] {
  const template = matchConsultingTemplate(bundle.organization.industry);
  const diagnosis = buildProjectDiagnosis(bundle);
  const firstQuickWin = diagnosis.opportunities[0] ?? template.quickWins[0];

  return [
    {
      title: "Vor dem nächsten Termin",
      body: "Klären, was noch fehlt, und den Call mit einem konkreten Ziel starten.",
      items: [
        diagnosis.missingInputs.length
          ? `Fehlende Inputs prüfen: ${diagnosis.missingInputs.slice(0, 3).join(", ")}`
          : "Keine kritischen Intake-Lücken offen.",
        `Call-Fokus setzen: ${template.callAgenda[0]}`,
        `Quick Win vorbereiten: ${firstQuickWin}`,
      ],
    },
    {
      title: "Während des Termins",
      body: "Nicht zu breit werden: Problem, Daten, Entscheidung und Pilot festhalten.",
      items: [
        template.meetingMoves[0],
        "Eine echte Situation live durchgehen: Auslöser, Tool, Daten, Entscheidung, Output.",
        "Am Ende einen nächsten Schritt mit Owner und Datum festlegen.",
      ],
    },
    {
      title: "Nach dem Termin",
      body: "Sofort sichtbaren Fortschritt erzeugen, damit der Kunde merkt, dass gearbeitet wird.",
      items: [
        "Meeting-Notiz speichern und relevante Aufgaben erzeugen.",
        "Kurzes Kundenupdate veröffentlichen: Fortschritt, nächster Schritt, benötigter Input.",
        "Diagnosis Pack aktualisieren, wenn neue Informationen eingegangen sind.",
      ],
    },
  ];
}

export function buildConsultingCopilotBrief(
  bundle: ProjectBundle,
): ConsultingCopilotBrief {
  const template = matchConsultingTemplate(bundle.organization.industry);
  const diagnosis = buildProjectDiagnosis(bundle);
  const customerAction = buildCustomerNextActions(bundle)[0];
  const adminAction = buildAdminProjectActions(bundle)[0];
  const context =
    bundle.project.summary ||
    bundle.intelligence.companyContext ||
    `${bundle.organization.name} wird in der Branche ${bundle.organization.industry} beraten.`;
  const summary = [
    context,
    `Readiness: ${diagnosis.readinessScore}/100 (${diagnosis.readinessLabel}).`,
    `Aktuelle Phase: ${formatStage(bundle.project.asdarStage)}.`,
    bundle.project.nextStep
      ? `Nächster sichtbarer Schritt: ${bundle.project.nextStep}`
      : `Empfohlener Startpunkt: ${template.kickoffGoal}`,
  ].join("\n\n");

  const suggestedQuestions = [
    ...diagnosis.missingInputs.map(
      (item) => `Was müssen wir zu "${item}" konkret wissen, um entscheiden zu können?`,
    ),
    ...template.discoveryQuestions,
  ].slice(0, 7);

  const nextActions = [
    adminAction
      ? `${adminAction.cta}: ${adminAction.title}`
      : "Projektstand prüfen und nächste Beratungshandlung festlegen.",
    customerAction && customerAction.id !== "no-action"
      ? `Kunde: ${customerAction.title}`
      : "Kunde: aktuell nichts Dringendes offen.",
    diagnosis.recommendedTasks[0] ?? `Quick Win prüfen: ${template.quickWins[0]}`,
    "Nach dem nächsten Kontakt ein kurzes Kundenupdate veröffentlichen.",
  ].filter(Boolean);

  return {
    summary,
    missingInformation: diagnosis.missingInputs,
    suggestedQuestions,
    quickWins: diagnosis.opportunities.slice(0, 5),
    automationIdeas: template.automationIdeas.slice(0, 5),
    nextActions,
    nextCustomerUpdate: buildCustomerUpdateDraft(bundle),
  };
}

export function buildMeetingModePlan(bundle: ProjectBundle): MeetingModePlan {
  const template = matchConsultingTemplate(bundle.organization.industry);
  const diagnosis = buildProjectDiagnosis(bundle);
  const copilot = buildConsultingCopilotBrief(bundle);
  const primaryGap = diagnosis.missingInputs[0];
  const primaryQuickWin = diagnosis.opportunities[0] ?? template.quickWins[0];

  return {
    focus: primaryGap
      ? `Heute klären: ${primaryGap}`
      : `Heute entscheiden: erster Pilot für ${primaryQuickWin}`,
    agenda: [
      `Projektstand in ${formatStage(bundle.project.asdarStage)} kurz bestätigen.`,
      ...template.callAgenda.slice(0, 3),
      "Nächsten Schritt mit Owner, Datum und Erfolgskriterium festlegen.",
    ],
    livePrompts: [
      "Bitte zeigen Sie ein echtes Beispiel aus der letzten Woche.",
      "Welche Entscheidung musste jemand treffen, und welche Information hat gefehlt?",
      "Was würde passieren, wenn dieser Schritt morgen halbautomatisch läuft?",
      ...copilot.suggestedQuestions.slice(0, 3),
    ].slice(0, 6),
    decisionChecklist: [
      "Problem konkret beschrieben",
      "Datenquelle oder Dokumentbeispiel bekannt",
      "Owner beim Kunden benannt",
      "Quick Win oder Pilot eingegrenzt",
      "Nächstes Datum festgelegt",
    ],
    afterCallActions: [
      "Meeting-Notiz speichern",
      "Kundenupdate veröffentlichen",
      "Aufgaben und Meilenstein aktualisieren",
      "Falls nötig Reminder oder Datei-Anfrage senden",
    ],
    customerSummaryDraft: copilot.nextCustomerUpdate.body,
  };
}

export function buildCustomerUpdateDraft(bundle: ProjectBundle) {
  const diagnosis = buildProjectDiagnosis(bundle);
  const nextAction = buildCustomerNextActions(bundle)[0];
  const title =
    diagnosis.readinessScore >= 80
      ? "Update: Priorisierung der nächsten Umsetzungsschritte"
      : "Update: Analyse und nächste Schritte";
  const body = [
    `Aktueller Stand: Das Projekt ist in der ASDAR Phase ${formatStage(
      bundle.project.asdarStage,
    )}.`,
    diagnosis.customerSummary,
    nextAction && nextAction.id !== "no-action"
      ? `Was wir von Ihnen brauchen: ${nextAction.title}.`
      : "Von Kundenseite ist aktuell nichts Dringendes offen.",
    bundle.project.nextStep
      ? `Nächster Schritt: ${bundle.project.nextStep}`
      : "Nächster Schritt: Assad bereitet die nächste Priorisierung vor.",
  ].join("\n\n");

  return { title, body };
}

function cleanBullet(value: string) {
  return value.trim().replace(/^[-*•]\s*/, "").trim();
}

function parseAiSection(text: string, heading: string) {
  const headings = [
    "Summary",
    "Automation ideas",
    "Risks",
    "Next questions",
    "Next actions",
  ];
  const pattern = new RegExp(
    `${heading}:\\s*([\\s\\S]*?)(?=\\n(?:${headings
      .filter((item) => item !== heading)
      .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")}):|$)`,
    "i",
  );
  const match = text.match(pattern)?.[1] ?? "";
  return match
    .split(/\r?\n/)
    .map(cleanBullet)
    .filter(Boolean)
    .slice(0, 6);
}

export function buildAiProviderComparison(
  bundle: ProjectBundle,
): AiProviderComparison[] {
  const latestByProvider = new Map<string, AiProviderComparison>();

  for (const insight of bundle.aiInsights) {
    const match = insight.title.match(/^AI Scan:\s*([a-z]+)(?:\s*\(([^)]+)\))?/i);
    if (!match) continue;
    const provider = match[1].toLowerCase();
    if (latestByProvider.has(provider)) continue;
    const statusValue = match[2] ?? "unknown";
    const status =
      statusValue === "ok" ||
      statusValue === "not_configured" ||
      statusValue === "error"
        ? statusValue
        : "unknown";

    latestByProvider.set(provider, {
      provider,
      status,
      createdAt: insight.createdAt,
      summary: parseAiSection(insight.body, "Summary"),
      automationIdeas: parseAiSection(insight.body, "Automation ideas"),
      risks: parseAiSection(insight.body, "Risks"),
      nextQuestions: parseAiSection(insight.body, "Next questions"),
      nextActions: parseAiSection(insight.body, "Next actions"),
      raw: insight.body,
    });
  }

  return ["openai", "gemini", "grok"]
    .map((provider) => latestByProvider.get(provider))
    .filter((entry): entry is AiProviderComparison => Boolean(entry));
}

export function buildAdminCommandCenter(bundles: ProjectBundle[]) {
  const active = bundles.filter((bundle) => bundle.project.status !== "completed");
  const staleUpdates = active.filter(
    (bundle) => daysSince(latestCustomerUpdateDate(bundle)) > 7,
  );
  const missingIntake = active.filter((bundle) => !hasCustomerIntake(bundle));
  const risky = active.filter((bundle) => bundle.project.health !== "green");
  const overdueTasks = active.flatMap((bundle) =>
    bundle.tasks
      .filter(
        (task) =>
          task.visibleToCustomer &&
          task.owner === "customer" &&
          task.status !== "done" &&
          isPast(task.dueDate),
      )
      .map((task) => ({ bundle, task })),
  );
  const unpaidInvoices = active.flatMap((bundle) =>
    bundle.invoices
      .filter((invoice) => invoice.status !== "draft" && invoice.status !== "paid")
      .map((invoice) => ({ bundle, invoice })),
  );

  const focusItems: AdminFocusItem[] = [
    ...risky.map((bundle) => ({
      id: `risk-${bundle.project.id}`,
      projectId: bundle.project.id,
      tone: (bundle.project.health === "red" ? "red" : "amber") as PortalActionTone,
      title: `${bundle.organization.name}: Health ${bundle.project.health}`,
      body: bundle.project.nextStep || "Projekt braucht einen klaren nächsten Schritt.",
      action: "Projekt öffnen",
      priority: bundle.project.health === "red" ? 10 : 8,
    })),
    ...missingIntake.map((bundle) => ({
      id: `intake-${bundle.project.id}`,
      projectId: bundle.project.id,
      tone: "amber" as const,
      title: `${bundle.organization.name}: Intake fehlt`,
      body: "Kunde hat den geführten Fragebogen noch nicht eingereicht.",
      action: "Reminder senden",
      priority: 7,
    })),
    ...overdueTasks.map(({ bundle, task }) => ({
      id: `task-${task.id}`,
      projectId: bundle.project.id,
      tone: "red" as const,
      title: `${bundle.organization.name}: Aufgabe überfällig`,
      body: task.title,
      action: "Nachfassen",
      priority: 9,
    })),
    ...staleUpdates.map((bundle) => ({
      id: `update-${bundle.project.id}`,
      projectId: bundle.project.id,
      tone: "amber" as const,
      title: `${bundle.organization.name}: Update fällig`,
      body: "Seit mehr als 7 Tagen wurde kein normales Kundenupdate veröffentlicht.",
      action: "Update schreiben",
      priority: 6,
    })),
    ...unpaidInvoices
      .filter(({ invoice }) => invoice.status === "overdue" || isPast(invoice.dueDate))
      .map(({ bundle, invoice }) => ({
        id: `invoice-${invoice.id}`,
        projectId: bundle.project.id,
        tone: "red" as const,
        title: `${bundle.organization.name}: Rechnung überfällig`,
        body: `${invoice.number} · ${formatCurrency(invoice.amountCents, invoice.currency)}`,
        action: "Reminder senden",
        priority: 8,
      })),
  ].sort((a, b) => b.priority - a.priority);

  return {
    stats: {
      activeProjects: active.length,
      riskyProjects: risky.length,
      missingIntake: missingIntake.length,
      staleUpdates: staleUpdates.length,
      overdueCustomerTasks: overdueTasks.length,
      unpaidInvoiceAmount: unpaidInvoices.reduce(
        (sum, entry) => sum + entry.invoice.amountCents,
        0,
      ),
    },
    focusItems,
  };
}

function handledNotificationIds(bundle: ProjectBundle) {
  return new Set(
    bundle.updates
      .flatMap((update) =>
        [...update.body.matchAll(/NOTIFICATION_DONE:([^\s\n]+)/g)].map(
          (match) => match[1],
        ),
      )
      .filter(Boolean),
  );
}

function handledDraftIds(bundle: ProjectBundle) {
  return new Set(
    bundle.updates
      .flatMap((update) =>
        [...update.body.matchAll(/DRAFT_DONE:([^\s\n]+)/g)].map(
          (match) => match[1],
        ),
      )
      .filter(Boolean),
  );
}

function hasProjectAppointment(bundle: ProjectBundle) {
  return bundle.updates.some((update) => update.title.startsWith("Termin:"));
}

export function buildAdminNotificationCenter(
  bundles: ProjectBundle[],
): PortalNotification[] {
  const notifications: PortalNotification[] = [];

  for (const bundle of bundles) {
    if (bundle.project.status === "completed") continue;
    const handled = handledNotificationIds(bundle);

    for (const comment of bundle.updates.filter((update) =>
      isCustomerComment(update.title),
    )) {
      const notificationId = `comment-${comment.id}`;
      if (handled.has(notificationId)) continue;
      notifications.push({
        id: notificationId,
        projectId: bundle.project.id,
        tone: "copper",
        title: `${bundle.organization.name}: neue Kundenfrage`,
        body: comment.body.split("\n\n").slice(1).join("\n\n") || comment.body,
        cta: "Antworten",
        hrefView: "communication",
        createdAt: comment.createdAt,
        priority: 7,
      });
    }

    for (const intake of bundle.updates.filter((update) =>
      isCustomerIntake(update.title),
    )) {
      const notificationId = `intake-${intake.id}`;
      if (handled.has(notificationId)) continue;
      notifications.push({
        id: notificationId,
        projectId: bundle.project.id,
        tone: "green",
        title: `${bundle.organization.name}: Fragebogen eingereicht`,
        body: "Die Antworten können jetzt in die interne Analyse übernommen werden.",
        cta: "Analyse öffnen",
        hrefView: "guidance",
        createdAt: intake.createdAt,
        priority: 6,
      });
    }

    for (const approval of bundle.updates.filter((update) =>
      isApproval(update.title),
    )) {
      const notificationId = `approval-${approval.id}`;
      if (handled.has(notificationId)) continue;
      notifications.push({
        id: notificationId,
        projectId: bundle.project.id,
        tone: "green",
        title: `${bundle.organization.name}: Freigabe erhalten`,
        body: approval.title.replace(/^Freigabe:\s*/, ""),
        cta: "Projekt prüfen",
        hrefView: "delivery",
        createdAt: approval.createdAt,
        priority: 5,
      });
    }

    for (const file of bundle.files.filter(
      (entry) => entry.visibility === "customer" && entry.category === "customer_upload",
    )) {
      const notificationId = `file-${file.id}`;
      if (handled.has(notificationId)) continue;
      notifications.push({
        id: notificationId,
        projectId: bundle.project.id,
        tone: "copper",
        title: `${bundle.organization.name}: Kundendatei hochgeladen`,
        body: file.name,
        cta: "Dateien öffnen",
        hrefView: "delivery",
        createdAt: file.uploadedAt,
        priority: 5,
      });
    }

    const staleAge = daysSince(latestCustomerUpdateDate(bundle));
    if (staleAge > 7) {
      const notificationId = `stale-${bundle.project.id}`;
      if (handled.has(notificationId)) continue;
      notifications.push({
        id: notificationId,
        projectId: bundle.project.id,
        tone: "amber",
        title: `${bundle.organization.name}: Kundenupdate fällig`,
        body: `Seit ${Number.isFinite(staleAge) ? staleAge : "mehreren"} Tagen kein normales Kundenupdate.`,
        cta: "Update schreiben",
        hrefView: "communication",
        createdAt: bundle.project.updatedAt,
        priority: 8,
      });
    }

    for (const invoice of bundle.invoices.filter(
      (entry) =>
        entry.status !== "draft" &&
        entry.status !== "paid" &&
        (entry.status === "overdue" || isPast(entry.dueDate)),
    )) {
      const notificationId = `invoice-${invoice.id}`;
      if (handled.has(notificationId)) continue;
      notifications.push({
        id: notificationId,
        projectId: bundle.project.id,
        tone: "red",
        title: `${bundle.organization.name}: Rechnung offen`,
        body: `${invoice.number} · ${formatCurrency(invoice.amountCents, invoice.currency)}`,
        cta: "Reminder senden",
        hrefView: "billing",
        createdAt: invoice.dueDate ?? invoice.createdAt,
        priority: 9,
      });
    }
  }

  return notifications.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return dateMs(b.createdAt) - dateMs(a.createdAt);
  });
}

export function buildProjectPipeline(
  bundles: ProjectBundle[],
): ProjectPipelineColumn[] {
  const active = bundles.filter((bundle) => bundle.project.status !== "completed");
  const waiting = active.filter(
    (bundle) =>
      !hasCustomerIntake(bundle) ||
      bundle.tasks.some(
        (task) =>
          task.owner === "customer" &&
          task.visibleToCustomer &&
          task.status !== "done",
      ),
  );
  const billing = active.filter((bundle) =>
    bundle.invoices.some(
      (invoice) => invoice.status !== "draft" && invoice.status !== "paid",
    ),
  );
  const waitingIds = new Set(waiting.map((bundle) => bundle.project.id));
  const billingWithoutWaiting = billing.filter(
    (bundle) => !waitingIds.has(bundle.project.id),
  );
  const billingIds = new Set(
    billingWithoutWaiting.map((bundle) => bundle.project.id),
  );
  const remaining = active.filter(
    (bundle) =>
      !waitingIds.has(bundle.project.id) && !billingIds.has(bundle.project.id),
  );

  return [
    {
      id: "discovery",
      title: "Discovery",
      body: "Neue Projekte, Intake, erste Orientierung.",
      bundles: remaining.filter((bundle) => bundle.project.status === "discovery"),
    },
    {
      id: "analysis",
      title: "Analysis",
      body: "Analyse, Copilot, Playbook und Priorisierung.",
      bundles: remaining.filter((bundle) => bundle.project.status === "analysis"),
    },
    {
      id: "implementation",
      title: "Implementation",
      body: "Umsetzung, Aufgaben, Dateien und Roadmap.",
      bundles: remaining.filter(
        (bundle) => bundle.project.status === "implementation",
      ),
    },
    {
      id: "waiting",
      title: "Waiting for Customer",
      body: "Kundeninput, Freigaben oder Aufgaben fehlen.",
      bundles: waiting,
    },
    {
      id: "billing",
      title: "Billing",
      body: "Offene Proposal-, Rechnungs- oder Zahlungsarbeit.",
      bundles: billingWithoutWaiting,
    },
    {
      id: "completed",
      title: "Completed",
      body: "Abgeschlossene oder archivierte Projekte.",
      bundles: bundles.filter((bundle) => bundle.project.status === "completed"),
    },
  ];
}

export function buildDraftReviewItems(bundles: ProjectBundle[]): DraftReviewItem[] {
      return bundles
    .filter((bundle) => bundle.project.status !== "completed")
    .flatMap((bundle) => {
      const handled = handledDraftIds(bundle);
      const copilot = buildConsultingCopilotBrief(bundle);
      const diagnosis = buildProjectDiagnosis(bundle);
      const offerRecommendation = latestOrBuildOfferRecommendation(bundle);
      const proposalNeeded =
        diagnosis.readinessScore >= 55 &&
        !bundle.files.some((file) => file.category === "proposal");
      const finalReportNeeded =
        bundle.project.status === "implementation" &&
        !bundle.files.some((file) => file.category === "final_report");
      const overdueInvoices = bundle.invoices.filter(
        (invoice) =>
          invoice.status !== "paid" &&
          invoice.status !== "draft" &&
          isPast(invoice.dueDate),
      );
      const needsCallAgenda =
        hasCustomerIntake(bundle) && !hasProjectAppointment(bundle);

      const items: Array<DraftReviewItem | null> = [
        handled.has(`${bundle.project.id}:customer-update`)
          ? null
          : {
              id: `${bundle.project.id}:customer-update`,
              projectId: bundle.project.id,
              title: `${bundle.organization.name}: Kundenupdate prüfen`,
              type: "customer_update" as const,
              body: copilot.nextCustomerUpdate.body,
              hrefView: "communication" as const,
              priority: daysSince(latestCustomerUpdateDate(bundle)) > 7 ? 9 : 5,
            },
        handled.has(`${bundle.project.id}:meeting-summary`)
          ? null
          : {
              id: `${bundle.project.id}:meeting-summary`,
              projectId: bundle.project.id,
              title: `${bundle.organization.name}: Meeting Summary vorbereiten`,
              type: "meeting_summary" as const,
              body: buildMeetingModePlan(bundle).customerSummaryDraft,
              hrefView: "meeting" as const,
              priority: 6,
            },
        proposalNeeded && !handled.has(`${bundle.project.id}:proposal`)
          ? {
              id: `${bundle.project.id}:proposal`,
              projectId: bundle.project.id,
              title: `${bundle.organization.name}: Proposal Draft`,
              type: "proposal" as const,
              body: [
                `${offerRecommendation.packageLabel} · ${formatCurrency(
                  offerRecommendation.recommendedPriceCents,
                )} · ${offerRecommendation.timeline}`,
                "",
                "Scope:",
                offerRecommendation.scope,
                "",
                "Deliverables:",
                ...offerRecommendation.deliverables
                  .slice(0, 5)
                  .map((item) => `- ${item}`),
              ].join("\n"),
              hrefView: "billing" as const,
              priority: 7,
            }
          : null,
        finalReportNeeded && !handled.has(`${bundle.project.id}:final-report`)
          ? {
              id: `${bundle.project.id}:final-report`,
              projectId: bundle.project.id,
              title: `${bundle.organization.name}: Abschlussbericht Draft`,
              type: "final_report" as const,
              body: formatDiagnosisReport(bundle, diagnosis),
              hrefView: "delivery" as const,
              priority: 4,
            }
          : null,
        overdueInvoices[0] &&
        !handled.has(`${bundle.project.id}:invoice-reminder:${overdueInvoices[0].id}`)
          ? {
              id: `${bundle.project.id}:invoice-reminder:${overdueInvoices[0].id}`,
              projectId: bundle.project.id,
              title: `${bundle.organization.name}: Rechnungsreminder pruefen`,
              type: "invoice_reminder" as const,
              body: [
                `Kurzer Hinweis zur Rechnung ${overdueInvoices[0].number}:`,
                "",
                "die Rechnung ist im Portal noch offen. Bitte pruefen Sie die Zahlung oder geben Sie kurz Rueckmeldung, falls etwas fehlt.",
                "",
                "Vielen Dank.",
              ].join("\n"),
              hrefView: "billing" as const,
              priority: 8,
            }
          : null,
        needsCallAgenda && !handled.has(`${bundle.project.id}:next-call-agenda`)
          ? {
              id: `${bundle.project.id}:next-call-agenda`,
              projectId: bundle.project.id,
              title: `${bundle.organization.name}: naechste Call-Agenda`,
              type: "next_call_agenda" as const,
              body: [
                "Vorschlag fuer den naechsten Termin:",
                "",
                ...buildMeetingModePlan(bundle).agenda.map((item) => `- ${item}`),
                "",
                "Ziel: Entscheidungen, Datenbedarf und ersten Pilot konkret festlegen.",
              ].join("\n"),
              hrefView: "meeting" as const,
              priority: 6,
            }
          : null,
      ];

      return items.filter((item): item is DraftReviewItem => item !== null);
    })
    .sort((a, b) => b.priority - a.priority);
}

function fileVersionKey(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/\b(v|version|final|draft|entwurf|neu|new)[-_\s]*\d*$/i, "")
    .replace(/[-_\s]+/g, " ")
    .trim();
}

export function buildFileVersionGroups(
  bundle: ProjectBundle,
  scope: "admin" | "customer" = "admin",
): FileVersionGroup[] {
  const files = bundle.files.filter((file) =>
    scope === "customer" ? file.visibility === "customer" : true,
  );
  const groups = new Map<string, ProjectBundle["files"]>();

  for (const file of files) {
    const key = fileVersionKey(file.name) || file.id;
    groups.set(key, [...(groups.get(key) ?? []), file]);
  }

  return [...groups.entries()]
    .map(([key, versions]) => {
      const sorted = versions.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
      return {
        key,
        latest: sorted[0],
        versions: sorted,
      };
    })
    .sort((a, b) => b.latest.uploadedAt.localeCompare(a.latest.uploadedAt));
}

export function buildConsultantCopyTemplates(
  bundle: ProjectBundle,
): ConsultantCopyTemplate[] {
  const template = matchConsultingTemplate(bundle.organization.industry);
  const diagnosis = buildProjectDiagnosis(bundle);
  const nextAction = buildCustomerNextActions(bundle)[0];
  const primaryOpportunity = diagnosis.opportunities[0] ?? template.quickWins[0];
  const nextStep = bundle.project.nextStep || template.kickoffGoal;

  return [
    {
      id: "kickoff",
      title: "Kickoff E-Mail",
      body: "Für neue Kunden direkt nach Projektstart.",
      content: [
        `Hallo ${bundle.organization.name},`,
        "",
        `wir starten mit ${bundle.project.name}. Ziel ist, die wichtigsten Prozesse, Engpässe und Automatisierungschancen strukturiert zu erfassen.`,
        "",
        "Als nächstes bitte den Projektfragebogen im Portal ausfüllen. Danach priorisiere ich die ersten Quick Wins und bereite den nächsten Beratungsschritt vor.",
        "",
        "Viele Grüße",
        "Assad",
      ].join("\n"),
    },
    {
      id: "meeting-summary",
      title: "Meeting-Zusammenfassung",
      body: "Nach einem Call als kundenfreundliches Update nutzbar.",
      content: [
        "Kurzes Update zum Termin:",
        "",
        `Aktueller Fokus: ${primaryOpportunity}`,
        `ASDAR Phase: ${formatStage(bundle.project.asdarStage)}`,
        `Nächster Schritt: ${nextStep}`,
        "",
        nextAction && nextAction.id !== "no-action"
          ? `Von Kundenseite offen: ${nextAction.title}`
          : "Von Kundenseite ist aktuell nichts Dringendes offen.",
      ].join("\n"),
    },
    {
      id: "proposal",
      title: "Angebotsstruktur",
      body: "Schneller Scope für Proposal oder PDF-Angebot.",
      content: [
        `Projekt: ${bundle.project.name}`,
        `Ausgangslage: ${bundle.project.summary || bundle.intelligence.companyContext || "Noch zu konkretisieren."}`,
        "",
        "Leistungsumfang:",
        `- Analyse und Priorisierung nach ASDAR`,
        `- Quick-Win-Konzept: ${primaryOpportunity}`,
        "- Umsetzungsfahrplan mit Aufgaben, Meilensteinen und Kundentransparenz",
        "",
        "Ergebnis:",
        "- klare Prozessdiagnose",
        "- priorisierte Automatisierungschancen",
        "- nächster Pilot mit Owner, Datenbedarf und Erfolgskriterium",
      ].join("\n"),
    },
    {
      id: "process-analysis",
      title: "Prozessanalyse",
      body: "Interne Struktur für Analyse oder Workshop.",
      content: [
        "Prozessanalyse:",
        "",
        "1. Auslöser: Wann startet der Prozess?",
        "2. Input: Welche Daten, Dokumente oder Nachrichten kommen rein?",
        "3. Entscheidung: Wer entscheidet anhand welcher Kriterien?",
        "4. Tooling: Welche Systeme werden genutzt?",
        "5. Output: Was muss am Ende entstehen?",
        "6. Reibung: Wo entstehen Wartezeit, Fehler oder doppelte Eingaben?",
        "",
        `Branchenfragen: ${template.discoveryQuestions.slice(0, 3).join(" · ")}`,
      ].join("\n"),
    },
    {
      id: "final-report",
      title: "Abschlussbericht-Outline",
      body: "Struktur für den letzten Kundenbericht.",
      content: [
        `Abschlussbericht: ${bundle.project.name}`,
        "",
        "1. Ausgangslage und Ziel",
        "2. Wichtigste Erkenntnisse",
        "3. Quick Wins und priorisierte Automatisierungen",
        "4. Empfohlene Roadmap",
        "5. Risiken, Voraussetzungen und nächste Entscheidungen",
        "",
        `Readiness: ${diagnosis.readinessScore}/100 (${diagnosis.readinessLabel})`,
      ].join("\n"),
    },
  ];
}

function projectText(bundle: ProjectBundle) {
  return [
    bundle.organization.industry,
    bundle.project.name,
    bundle.project.summary,
    bundle.project.nextStep,
    bundle.intelligence.companyContext,
    bundle.intelligence.issues,
    bundle.intelligence.goals,
    bundle.intelligence.currentTools,
    bundle.intelligence.dataSituation,
    bundle.intelligence.constraints,
    bundle.intelligence.opportunities,
    bundle.intelligence.internalNotes,
    ...bundle.updates
      .filter((update) => isCustomerIntake(update.title))
      .slice(0, 3)
      .flatMap((update) => [update.title, update.body]),
    ...bundle.aiInsights
      .filter((insight) => insight.title.startsWith("AI Scan:"))
      .slice(0, 3)
      .flatMap((insight) => [insight.title, insight.body]),
  ].join("\n");
}

function hasAny(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function firstNumberNear(value: string, labels: string[]) {
  const decimalText = value.replace(/\r/g, "\n").replace(/,/g, ".");
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const block = decimalText.match(new RegExp(`${escaped}[\\s\\S]{0,160}`, "i"))?.[0];
    const match = block?.match(/\d+(?:\.\d+)?/);
    if (match) {
      const parsed = Number.parseFloat(match[0]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  const normalized = decimalText.split(/\n+/);
  for (const line of normalized) {
    const lower = line.toLowerCase();
    if (!labels.some((label) => lower.includes(label))) continue;
    const match = line.match(/\d+(?:\.\d+)?/);
    if (match) {
      const parsed = Number.parseFloat(match[0]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function uniqueList(items: Array<string | undefined>) {
  const seen = new Set<string>();
  return items
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item))
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function roundToFiftyEuros(cents: number) {
  return Math.max(0, Math.round(cents / 5000) * 5000);
}

function scaleRange([min, max]: [number, number], factor: number) {
  return [
    Math.max(1, Math.round(min * factor)),
    Math.max(1, Math.round(max * factor)),
  ] as [number, number];
}

function chooseOfferTier(
  tiers: ConsultingOfferTier[],
  defaultTierId: ConsultingOfferTier["id"],
  readinessScore: number,
  complexityScore: number,
  text: string,
) {
  const tier = (id: ConsultingOfferTier["id"]) =>
    tiers.find((entry) => entry.id === id) ?? tiers[0];

  if (readinessScore < 55) return tier("snapshot");
  if (complexityScore >= 78 && readinessScore >= 70) return tier("pilot");
  if (
    complexityScore >= 58 ||
    hasAny(text, ["pilot", "umsetzung", "automatis", "integration", "schnittstelle"])
  ) {
    return tier("sprint");
  }
  return tier(defaultTierId);
}

export function buildProjectOfferRecommendation(
  bundle: ProjectBundle,
  options: Partial<Pick<ProjectOfferRecommendation, "id" | "createdAt" | "status">> = {},
): ProjectOfferRecommendation {
  const template = matchConsultingTemplate(bundle.organization.industry);
  const commercial = getConsultingCommercialModel(template);
  const diagnosis = buildProjectDiagnosis(bundle);
  const text = projectText(bundle);
  const hasIntake = hasCustomerIntake(bundle);
  const teamSize = firstNumberNear(text, [
    "team",
    "mitarbeiter",
    "personen",
    "users",
    "nutzer",
  ]);
  const manualHours = firstNumberNear(text, [
    "stunden",
    "hours",
    "zeitverlust",
    "aufwand",
    "pro woche",
  ]);
  const processVolume = firstNumberNear(text, [
    "volumen",
    "anzahl",
    "fälle",
    "faelle",
    "tickets",
    "anfragen",
    "angebote",
    "vorgänge",
    "vorgaenge",
  ]);
  const toolCount = uniqueList(
    bundle.intelligence.currentTools
      .split(/[,;\n]/)
      .map((item) => item.trim()),
  ).length;

  const complexityScore = clamp(
    Math.round(
      28 * commercial.complexityMultiplier +
        (teamSize >= 50 ? 18 : teamSize >= 20 ? 10 : teamSize >= 8 ? 5 : 0) +
        (manualHours >= 30 ? 18 : manualHours >= 10 ? 10 : manualHours >= 4 ? 5 : 0) +
        (processVolume >= 200 ? 16 : processVolume >= 50 ? 9 : processVolume >= 10 ? 4 : 0) +
        (toolCount >= 5 ? 10 : toolCount >= 3 ? 5 : 0) +
        (hasAny(text, ["api", "schnittstelle", "integration", "erp", "crm"]) ? 10 : 0) +
        (hasAny(text, ["dsgvo", "datenschutz", "patient", "mandant", "sensibel"]) ? 9 : 0) +
        (hasAny(text, ["mehrere standorte", "schicht", "legacy", "fachsoftware"]) ? 8 : 0),
    ),
    20,
    100,
  );

  const tier = chooseOfferTier(
    commercial.tiers,
    commercial.defaultTierId,
    diagnosis.readinessScore,
    complexityScore,
    text,
  );
  const complexityFactor = clamp(0.85 + complexityScore / 100, 1, 1.85);
  const readinessFactor = diagnosis.readinessScore < 55 ? 0.8 : 1;
  const priceFactor = commercial.complexityMultiplier * complexityFactor * readinessFactor;
  const priceMinCents = roundToFiftyEuros(tier.minPriceCents * priceFactor);
  const priceMaxCents = roundToFiftyEuros(tier.maxPriceCents * priceFactor);
  const recommendedPriceCents = clamp(
    roundToFiftyEuros(tier.basePriceCents * priceFactor),
    priceMinCents,
    priceMaxCents,
  );
  const timelineFactor =
    complexityScore >= 78 ? 1.45 : complexityScore >= 58 ? 1.25 : 1;
  const missingInputDelay = diagnosis.missingInputs.length >= 4 ? 1 : 0;
  const timelineWeeks = scaleRange(tier.timelineWeeks, timelineFactor);
  timelineWeeks[1] += missingInputDelay;
  const effortDays = scaleRange(tier.effortDays, timelineFactor);
  const confidence = clamp(
    Math.round(
      diagnosis.readinessScore * 0.55 +
        (hasIntake ? 25 : 0) +
        (teamSize || manualHours || processVolume ? 10 : 0) -
        diagnosis.missingInputs.length * 3,
    ),
    20,
    95,
  );
  const confidenceLabel =
    confidence >= 80 ? "hoch" : confidence >= 60 ? "mittel" : "niedrig";
  const primaryOpportunity =
    diagnosis.opportunities[0] ?? template.quickWins[0] ?? template.kickoffGoal;
  const deliverables = uniqueList([
    ...tier.deliverables,
    ...diagnosis.recommendedMilestones.slice(0, 2),
    "kundenfähige Zusammenfassung im Portal",
  ]).slice(0, 7);
  const assumptions = uniqueList([
    hasIntake
      ? "Der Kundenfragebogen wurde als Grundlage berücksichtigt."
      : "Der Kundenfragebogen fehlt noch; Preis und Scope sind vorläufig.",
    teamSize
      ? `Team-/Nutzergröße wurde grob mit ${Math.round(teamSize)} berücksichtigt.`
      : "Teamgröße muss für die finale Schätzung bestätigt werden.",
    manualHours
      ? `Manueller Aufwand wurde grob mit ${manualHours} Stunden berücksichtigt.`
      : "Wöchentlicher manueller Aufwand sollte noch quantifiziert werden.",
    processVolume
      ? `Prozessvolumen wurde grob mit ${Math.round(processVolume)} Vorgängen berücksichtigt.`
      : "Prozessvolumen sollte noch mit echten Zahlen belegt werden.",
    ...commercial.pricingNotes.slice(0, 2),
  ]);
  const risks = uniqueList([
    ...diagnosis.risks.slice(0, 4),
    confidence < 60
      ? "Schätzung hat niedrige Sicherheit, weil zentrale kaufmännische Informationen fehlen."
      : "",
  ]);
  const nextQuestions = uniqueList([
    ...diagnosis.missingInputs
      .slice(0, 4)
      .map((item) => `Bitte ${item} konkretisieren.`),
    !manualHours ? "Wie viele Stunden pro Woche kostet der wichtigste manuelle Prozess?" : "",
    !processVolume ? "Wie oft läuft dieser Prozess pro Woche oder Monat?" : "",
    !teamSize ? "Wie viele Personen arbeiten mit dem Prozess oder Ergebnis?" : "",
    "Welche Systeme müssen im ersten Schritt wirklich angebunden werden?",
  ]).slice(0, 6);
  const reasoning = uniqueList([
    `Readiness ${diagnosis.readinessScore}/100 (${diagnosis.readinessLabel}).`,
    `Komplexität ${complexityScore}/100 aus Branche, Tools, Volumen, Datenschutz und Integrationen.`,
    `Empfohlenes Paket: ${tier.label}, weil ${tier.bestFor}`,
    `Primärer Nutzenhebel: ${primaryOpportunity}`,
  ]);
  const timeline =
    timelineWeeks[0] === timelineWeeks[1]
      ? `${timelineWeeks[0]} Woche`
      : `${timelineWeeks[0]}-${timelineWeeks[1]} Wochen`;
  const now = new Date().toISOString();

  return {
    id: options.id ?? `offer_${bundle.project.id}_${now.slice(0, 10)}`,
    projectId: bundle.project.id,
    status: options.status ?? "draft",
    source: "rules",
    packageId: tier.id,
    packageLabel: tier.label,
    title: `${tier.label}: ${bundle.organization.name}`,
    scope: [
      `${tier.label} für ${bundle.organization.name}.`,
      `Fokus: ${primaryOpportunity}`,
      `ASDAR Phase: ${formatStage(bundle.project.asdarStage)}.`,
    ].join("\n"),
    outcomes: [
      `Konkrete Empfehlung, welche Prozesse zuerst verbessert oder automatisiert werden.`,
      `Priorisierte Roadmap mit Aufwand, Nutzen, Datenbedarf und Risiken.`,
      `Nächster umsetzbarer Pilot oder klarer Entscheidungspunkt für ${bundle.organization.name}.`,
    ].join("\n"),
    deliverables,
    assumptions,
    risks,
    priceMinCents,
    priceMaxCents,
    recommendedPriceCents,
    currency: "EUR",
    timeline,
    timelineWeeks,
    effortDays,
    complexityScore,
    confidence,
    confidenceLabel,
    reasoning,
    nextQuestions,
    createdAt: options.createdAt ?? now,
    updatedAt: now,
  };
}

export function parseOfferRecommendation(value: string) {
  return parseJsonMarker<ProjectOfferRecommendation>(
    value,
    OFFER_RECOMMENDATION_MARKER,
  );
}

export function latestSavedOfferRecommendation(
  bundle: ProjectBundle,
): ProjectOfferRecommendation | null {
  for (const insight of bundle.aiInsights) {
    if (!insight.title.startsWith("Offer Recommendation:")) continue;
    const parsed = parseOfferRecommendation(insight.body);
    if (parsed) return { ...parsed, source: "saved" };
  }
  return null;
}

export function latestOrBuildOfferRecommendation(bundle: ProjectBundle) {
  return latestSavedOfferRecommendation(bundle) ?? buildProjectOfferRecommendation(bundle);
}

export function formatOfferRecommendationReport(
  recommendation: ProjectOfferRecommendation,
) {
  return [
    `${OFFER_RECOMMENDATION_MARKER}:${JSON.stringify(recommendation)}`,
    "",
    `Offer Recommendation: ${recommendation.title}`,
    "",
    `Status: ${recommendation.status}`,
    `Paket: ${recommendation.packageLabel}`,
    `Preisempfehlung: ${formatCurrency(recommendation.recommendedPriceCents, recommendation.currency)}`,
    `Preisrange: ${formatCurrency(recommendation.priceMinCents, recommendation.currency)} - ${formatCurrency(recommendation.priceMaxCents, recommendation.currency)}`,
    `Zeitrahmen: ${recommendation.timeline}`,
    `Effort: ${recommendation.effortDays[0]}-${recommendation.effortDays[1]} Beratungstage`,
    `Confidence: ${recommendation.confidence}/100 (${recommendation.confidenceLabel})`,
    `Komplexität: ${recommendation.complexityScore}/100`,
    "",
    "Scope",
    recommendation.scope,
    "",
    "Erwartete Ergebnisse",
    recommendation.outcomes,
    "",
    "Deliverables",
    ...recommendation.deliverables.map((item) => `- ${item}`),
    "",
    "Annahmen",
    ...recommendation.assumptions.map((item) => `- ${item}`),
    "",
    "Risiken",
    ...recommendation.risks.map((item) => `- ${item}`),
    "",
    "Warum diese Empfehlung",
    ...recommendation.reasoning.map((item) => `- ${item}`),
    "",
    "Nächste Fragen",
    ...recommendation.nextQuestions.map((item) => `- ${item}`),
  ].join("\n");
}

function textFilled(value: string) {
  return value.trim().length > 20;
}

export function buildProjectDiagnosis(bundle: ProjectBundle): ProjectDiagnosis {
  const template = matchConsultingTemplate(bundle.organization.industry);
  const checks = [
    ["Unternehmenskontext", textFilled(bundle.intelligence.companyContext)],
    ["Stakeholder", textFilled(bundle.intelligence.stakeholders)],
    ["Probleme und Engpässe", textFilled(bundle.intelligence.issues)],
    ["messbare Ziele", textFilled(bundle.intelligence.goals)],
    ["Tool-Landschaft", textFilled(bundle.intelligence.currentTools)],
    ["Daten- und Dokumentenlage", textFilled(bundle.intelligence.dataSituation)],
    ["Constraints und Risiken", textFilled(bundle.intelligence.constraints)],
    ["Automatisierungschancen", textFilled(bundle.intelligence.opportunities)],
    ["Kundenintake", hasCustomerIntake(bundle)],
    ["sichtbarer nächster Schritt", Boolean(bundle.project.nextStep.trim())],
  ] as const;
  const passed = checks.filter(([, ok]) => ok).length;
  const missingInputs = checks.filter(([, ok]) => !ok).map(([label]) => label);
  const readinessScore = Math.round((passed / checks.length) * 100);
  const readinessLabel =
    readinessScore >= 80
      ? "umsetzungsbereit"
      : readinessScore >= 55
        ? "analysebereit"
        : "intake offen";
  const openCustomerTasks = bundle.tasks.filter(
    (task) => task.visibleToCustomer && task.owner === "customer" && task.status !== "done",
  );
  const openAssadTasks = bundle.tasks.filter(
    (task) => task.owner === "assad" && task.status !== "done",
  );

  const risks = [
    ...template.risks.slice(0, 3),
    ...missingInputs.slice(0, 3).map((item) => `${item} ist noch nicht ausreichend geklärt.`),
    openCustomerTasks.length > 2
      ? "Mehrere Kundenaufgaben sind offen; das kann die Analyse verzögern."
      : "",
  ].filter(Boolean);

  const opportunities = [
    ...(bundle.intelligence.opportunities
      ? bundle.intelligence.opportunities
          .split(/\n|;/)
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 3)
      : []),
    ...template.quickWins.slice(0, 3),
  ].slice(0, 5);

  const recommendedTasks = [
    missingInputs.length
      ? `Fehlende Intake-Punkte klären: ${missingInputs.slice(0, 3).join(", ")}`
      : "",
    `Quick Win bewerten: ${template.quickWins[0]}`,
    `Kundenupdate schreiben: ${formatStage(bundle.project.asdarStage)} Fortschritt und nächster Schritt`,
    openAssadTasks.length === 0 ? "Interne nächste Assad-Aufgabe definieren" : "",
  ].filter(Boolean);

  const recommendedMilestones = [
    "ASDAR Diagnose und Priorisierung abgeschlossen",
    "Erster Automatisierungs-Pilot definiert",
    "Kundenfreigabe für Roadmap erhalten",
  ];

  const customerSummary = [
    `Aktueller Stand: Das Projekt befindet sich in der ASDAR Phase ${formatStage(
      bundle.project.asdarStage,
    )}.`,
    bundle.project.nextStep
      ? `Nächster Schritt: ${bundle.project.nextStep}`
      : `Nächster Schritt: ${template.kickoffGoal}`,
    readinessScore >= 80
      ? "Die Grundlage ist gut genug, um konkrete Umsetzungsschritte zu priorisieren."
      : "Wir ergänzen aktuell noch wichtige Informationen, damit die Empfehlungen belastbar werden.",
  ].join("\n\n");

  return {
    readinessScore,
    readinessLabel,
    missingInputs,
    risks: risks.slice(0, 6),
    opportunities,
    recommendedTasks,
    recommendedMilestones,
    customerSummary,
  };
}

export function formatDiagnosisReport(bundle: ProjectBundle, diagnosis: ProjectDiagnosis) {
  return [
    `ASDAR Diagnosis Pack: ${bundle.project.name}`,
    "",
    `Kunde: ${bundle.organization.name}`,
    `Branche: ${bundle.organization.industry}`,
    `Readiness: ${diagnosis.readinessScore}/100 (${diagnosis.readinessLabel})`,
    `Phase: ${formatStage(bundle.project.asdarStage)}`,
    "",
    "Fehlende Inputs",
    ...(diagnosis.missingInputs.length
      ? diagnosis.missingInputs.map((item) => `- ${item}`)
      : ["- Keine kritischen Lücken erkannt."]),
    "",
    "Risiken",
    ...diagnosis.risks.map((item) => `- ${item}`),
    "",
    "Chancen und Quick Wins",
    ...diagnosis.opportunities.map((item) => `- ${item}`),
    "",
    "Empfohlene Aufgaben",
    ...diagnosis.recommendedTasks.map((item) => `- ${item}`),
    "",
    "Empfohlene Meilensteine",
    ...diagnosis.recommendedMilestones.map((item) => `- ${item}`),
    "",
    "Kundensichere Zusammenfassung",
    diagnosis.customerSummary,
  ].join("\n");
}
