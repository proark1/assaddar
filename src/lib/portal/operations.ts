import {
  isApproval,
  isCustomerComment,
  isCustomerIntake,
  isReminder,
  isStructuredUpdate,
} from "./automation";
import { formatCurrency, formatDate, formatStage } from "./format";
import { matchConsultingTemplate } from "./templates";
import type { ProjectBundle } from "./types";

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
      hrefView: "guidance",
      cta: "Guidance öffnen",
      priority: 1,
    });
  }

  return actions.sort((a, b) => b.priority - a.priority);
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

export function buildAdminNotificationCenter(
  bundles: ProjectBundle[],
): PortalNotification[] {
  const notifications: PortalNotification[] = [];

  for (const bundle of bundles) {
    if (bundle.project.status === "completed") continue;

    for (const comment of bundle.updates.filter((update) =>
      isCustomerComment(update.title),
    )) {
      notifications.push({
        id: `comment-${comment.id}`,
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
      notifications.push({
        id: `intake-${intake.id}`,
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
      notifications.push({
        id: `approval-${approval.id}`,
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
      notifications.push({
        id: `file-${file.id}`,
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
      notifications.push({
        id: `stale-${bundle.project.id}`,
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
      notifications.push({
        id: `invoice-${invoice.id}`,
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
