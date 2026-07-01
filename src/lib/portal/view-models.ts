import { cache } from "react";
import {
  buildConsultantGuidance,
  findSimilarProjectBundles,
} from "./ai";
import {
  buildAttentionItems,
  buildIntakeQuestions,
  isApproval,
  isCustomerComment,
  isCustomerIntake,
  isReminder,
  isStructuredUpdate,
} from "./automation";
import { buildAutomationOpportunities } from "./automation-rules";
import {
  buildAiProviderComparison,
  buildAdminCommandCenter,
  buildAdminNotificationCenter,
  buildAdminProjectActions,
  buildAutomationHistory,
  buildChangeRequests,
  buildClientAnalytics,
  buildConsultingCopilotBrief,
  buildConsultantCopyTemplates,
  buildConsultantWorkflow,
  buildCustomerNextActions,
  buildCustomerUpdateDraft,
  buildDecisionCenter,
  buildFileRequests,
  buildFileVersionGroups,
  buildLeadPipeline,
  buildMeetingModePlan,
  buildProjectCopilotPanel,
  buildProjectDiagnosis,
  buildProjectHealthScore,
  buildProjectKpiSnapshot,
  buildProjectTimeline,
  buildWorkflowSnapshots,
  latestOrBuildOfferRecommendation,
} from "./operations";
import { listProjectBundlesForUser, listTemplateOverrides } from "./store";
import {
  effectiveConsultingTemplates,
  matchConsultingTemplate,
} from "./templates";
import type { Locale } from "@/content";
import type { ProjectBundle, User } from "./types";
import {
  formatCurrency,
  formatDate,
  formatInvoiceStatus,
  formatMilestoneStatus,
  formatTaskOwner,
  formatTaskStatus,
} from "./format";

export type CustomerDashboardAction = {
  bundle: ProjectBundle;
  action: ReturnType<typeof buildCustomerNextActions>[number];
};

export type PortalDashboardViewModel = {
  bundles: ProjectBundle[];
  openInvoices: ProjectBundle["invoices"];
  customerOpenTasks: ProjectBundle["tasks"];
  customerNextActions: CustomerDashboardAction[];
  primaryCustomerAction?: CustomerDashboardAction;
  nextAppointment?: {
    bundle: ProjectBundle;
    update: ProjectBundle["updates"][number];
  };
  dashboardBundle?: ProjectBundle;
  openInvoiceTotal: number;
};

export type AdminDashboardQuery = {
  q?: string;
  status?: string;
  health?: string;
  template?: string;
};

export type AdminProjectCardViewModel = {
  bundle: ProjectBundle;
  nextBestAction?: ReturnType<typeof buildAdminProjectActions>[number];
  healthScore: ReturnType<typeof buildProjectHealthScore>;
};

export type AdminProjectView =
  | "setup"
  | "guidance"
  | "meeting"
  | "communication"
  | "delivery"
  | "billing"
  | "access";

export function adminProjectView(value?: string): AdminProjectView | null {
  return value === "setup" ||
    value === "guidance" ||
    value === "meeting" ||
    value === "communication" ||
    value === "delivery" ||
    value === "billing" ||
    value === "access"
    ? value
    : null;
}

const EMPTY_COPILOT_BRIEF = {
  summary: "",
  missingInformation: [],
  nextActions: [],
  suggestedQuestions: [],
  automationIdeas: [],
  quickWins: [],
  nextCustomerUpdate: { title: "", body: "" },
} as ReturnType<typeof buildConsultingCopilotBrief>;

const EMPTY_MEETING_MODE = {
  focus: "",
  agenda: [],
  livePrompts: [],
  decisionChecklist: [],
  afterCallActions: "",
  customerSummaryDraft: "",
} as unknown as ReturnType<typeof buildMeetingModePlan>;

const EMPTY_CLIENT_ANALYTICS = {
  engagementLabel: "",
  engagementTone: "amber",
  latestCustomerSignal: "",
  latestCustomerSignalAt: "",
  openCustomerTasks: 0,
  overdueCustomerTasks: 0,
  pendingDecisions: 0,
  pendingFileRequests: 0,
  visibleUpdates: 0,
  pendingInvoices: 0,
  customerFiles: 0,
  nextNudge: "",
} as ReturnType<typeof buildClientAnalytics>;

const EMPTY_OFFER_RECOMMENDATION = {
  packageLabel: "",
  recommendedPriceCents: 0,
  priceMinCents: 0,
  priceMaxCents: 0,
  effortDays: [0, 0],
  confidenceLabel: "",
  complexityScore: 0,
  deliverables: [],
  assumptions: [],
  nextQuestions: [],
  scope: "",
  outcomes: "",
} as unknown as ReturnType<typeof latestOrBuildOfferRecommendation>;

export type CustomerProjectView = "overview" | "actions" | "files";

const intakeAnswerAliases: Record<string, string[]> = {
  companyContext: ["Unternehmenskontext"],
  issues: ["Probleme und Engpaesse", "Probleme", "Engpaesse"],
  goals: ["Ziele"],
  teamSize: ["Team und Nutzer", "Team", "Nutzer", "Teamgroesse"],
  processVolume: ["Prozessvolumen", "Volumen", "Anfragen", "Vorgaenge"],
  manualHours: ["Manueller Aufwand", "Zeitaufwand", "Zeitverlust", "Stunden"],
  budgetTiming: ["Budget und Timing", "Budget", "Timing", "Deadline"],
  currentTools: ["Aktuelle Tools", "Tools", "Systeme"],
  dataSituation: ["Daten und Dokumente", "Daten", "Dokumente"],
  constraints: ["Rahmenbedingungen", "Einschraenkungen", "Constraints"],
};

function customerProjectView(value?: string): CustomerProjectView | null {
  if (value === "files") return "files";
  if (value === "input" || value === "actions") return "actions";
  if (value === "overview" || value === "messages") return "overview";
  return null;
}

function normalizeIntakeLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function latestIntakeDefaults(
  updates: Array<{ title: string; body: string; createdAt: string }>,
  questions: Array<{ id: string; prompt: string }>,
) {
  const lookup = new Map<string, string>();
  for (const [field, aliases] of Object.entries(intakeAnswerAliases)) {
    for (const alias of aliases) lookup.set(normalizeIntakeLabel(alias), field);
  }
  for (const question of questions) {
    if (question.id.startsWith("template_")) {
      lookup.set(normalizeIntakeLabel(question.prompt), question.id);
    }
  }

  const intake = updates
    .filter((update) => isCustomerIntake(update.title))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  if (!intake) return {};

  const answers: Record<string, string> = {};
  let activeField = "";
  let buffer: string[] = [];
  const flush = () => {
    if (!activeField) return;
    const value = buffer.join("\n").trim();
    if (value) answers[activeField] = value;
    buffer = [];
  };

  for (const line of intake.body.split(/\r?\n/)) {
    const trimmed = line.trim();
    const separator = trimmed.indexOf(":");
    const key =
      separator >= 0
        ? lookup.get(normalizeIntakeLabel(trimmed.slice(0, separator)))
        : undefined;

    if (key) {
      flush();
      activeField = key;
      buffer = trimmed.slice(separator + 1).trim()
        ? [trimmed.slice(separator + 1).trim()]
        : [];
    } else if (activeField) {
      buffer.push(line);
    }
  }
  flush();

  return answers;
}

export function buildCustomerProjectViewModel(
  bundle: ProjectBundle,
  requestedView?: string,
) {
  const allCustomerUpdates = bundle.updates.filter(
    (update) => update.visibility === "customer",
  );
  const comments = allCustomerUpdates.filter((update) =>
    isCustomerComment(update.title),
  );
  const approvals = allCustomerUpdates.filter((update) =>
    isApproval(update.title),
  );
  const reminders = allCustomerUpdates.filter((update) =>
    isReminder(update.title),
  );
  const tickets = allCustomerUpdates.filter((update) =>
    update.title.startsWith("Ticket:"),
  );
  const appointments = allCustomerUpdates
    .filter((update) => update.title.startsWith("Termin:"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const updates = allCustomerUpdates.filter(
    (update) => !isStructuredUpdate(update.title),
  );
  const intakeSubmitted = allCustomerUpdates.some((update) =>
    isCustomerIntake(update.title),
  );
  const intakeQuestions = buildIntakeQuestions(bundle);
  const intakeDefaults = latestIntakeDefaults(
    allCustomerUpdates,
    intakeQuestions,
  );
  const tasks = bundle.tasks.filter((task) => task.visibleToCustomer);
  const milestones = bundle.milestones.filter(
    (milestone) => milestone.visibleToCustomer,
  );
  const files = bundle.files.filter((file) => file.visibility === "customer");
  const fileGroups = buildFileVersionGroups(bundle, "customer");
  const invoices = bundle.invoices.filter(
    (invoice) => invoice.status !== "draft",
  );
  const approvedFileIds = new Set(
    approvals
      .map((update) => update.body.match(/APPROVAL_FILE:([^\n]+)/)?.[1])
      .filter((value): value is string => Boolean(value)),
  );
  const approvedMilestoneIds = new Set(
    approvals
      .map((update) => update.body.match(/APPROVAL_MILESTONE:([^\n]+)/)?.[1])
      .filter((value): value is string => Boolean(value)),
  );
  const timeline = [
    ...updates.map((update) => ({
      id: update.id,
      date: update.createdAt,
      type: "Update",
      title: update.title,
      body: update.body,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      date: task.createdAt,
      type: "Aufgabe",
      title: task.title,
      body: `Verantwortlich: ${formatTaskOwner(task.owner)} · ${formatTaskStatus(task.status)}`,
    })),
    ...milestones.map((milestone) => ({
      id: milestone.id,
      date: milestone.createdAt,
      type: "Meilenstein",
      title: milestone.title,
      body: `${formatMilestoneStatus(milestone.status)} · ${formatDate(milestone.dueDate)}`,
    })),
    ...files.map((file) => ({
      id: file.id,
      date: file.uploadedAt,
      type: "Datei",
      title: file.name,
      body: file.description || "Neue Datei im Portal",
    })),
    ...invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.createdAt,
      type: "Rechnung",
      title: invoice.number,
      body: `${formatCurrency(invoice.amountCents, invoice.currency)} · ${formatInvoiceStatus(invoice.status)}`,
    })),
    ...comments.map((comment) => ({
      id: comment.id,
      date: comment.createdAt,
      type: "Kommentar",
      title: comment.title.replace(/^Kommentar:\s*/, ""),
      body: comment.body,
    })),
    ...approvals.map((approval) => ({
      id: approval.id,
      date: approval.createdAt,
      type: "Freigabe",
      title: approval.title.replace(/^Freigabe:\s*/, ""),
      body: approval.body.replace(/^APPROVAL_[A-Z]+:[^\n]+\n/, ""),
    })),
    ...reminders.map((reminder) => ({
      id: reminder.id,
      date: reminder.createdAt,
      type: "Reminder",
      title: reminder.title.replace(/^Erinnerung:\s*/, ""),
      body: reminder.body,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pendingCustomerTasks = tasks.filter(
    (task) => task.owner === "customer" && task.status !== "done",
  );
  const pendingMilestoneApprovals = milestones.filter(
    (milestone) => !approvedMilestoneIds.has(milestone.id),
  );
  const pendingFileApprovals = files.filter(
    (file) =>
      file.approvalStatus !== "not_required" &&
      file.approvalStatus !== "approved" &&
      !approvedFileIds.has(file.id),
  );
  const nextActions = buildCustomerNextActions(bundle);
  const kpiSnapshot = buildProjectKpiSnapshot(bundle);
  const decisions = buildDecisionCenter(bundle).filter(
    (decision) => decision.visibility === "customer",
  );
  const pendingDecisions = decisions.filter(
    (decision) => decision.status === "proposed",
  );
  const changeRequests = buildChangeRequests(bundle);
  const fileRequests = buildFileRequests(bundle);
  const primaryAction = nextActions[0];
  const assadWorkItems = [
    ...tasks
      .filter((task) => task.owner === "assad" && task.status !== "done")
      .map((task) => ({
        id: task.id,
        title: task.title,
        body: task.dueDate ? `Geplant bis ${formatDate(task.dueDate)}` : "In Arbeit",
      })),
    ...milestones
      .filter((milestone) => milestone.status === "active")
      .map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        body: milestone.dueDate
          ? `Meilenstein bis ${formatDate(milestone.dueDate)}`
          : "Aktiver Meilenstein",
      })),
  ].slice(0, 3);
  const requiredIntakeQuestions = intakeQuestions.filter((question) =>
    ["companyContext", "issues", "goals"].includes(question.id),
  );
  const requiredIntakeProgress = requiredIntakeQuestions.map((question) => ({
    id: question.id,
    label: question.label,
    done: intakeSubmitted || Boolean(intakeDefaults[question.id]?.trim()),
  }));
  const requiredIntakeDone = requiredIntakeProgress.filter(
    (item) => item.done,
  ).length;
  const optionalIntakeQuestions = intakeQuestions.filter(
    (question) =>
      !question.id.startsWith("template_") &&
      !["companyContext", "issues", "goals"].includes(question.id),
  );
  const templateIntakeQuestions = intakeQuestions.filter((question) =>
    question.id.startsWith("template_"),
  );
  const hasPendingCustomerAction =
    pendingCustomerTasks.length ||
    pendingMilestoneApprovals.length ||
    pendingFileApprovals.length ||
    pendingDecisions.length ||
    fileRequests.some((request) => request.status === "open");
  const defaultView: CustomerProjectView = !intakeSubmitted
    ? "actions"
    : hasPendingCustomerAction
      ? "actions"
      : "overview";
  const activeView = customerProjectView(requestedView) ?? defaultView;

  return {
    activeView,
    allCustomerUpdates,
    appointments,
    approvals,
    approvedFileIds,
    approvedMilestoneIds,
    assadWorkItems,
    changeRequests,
    comments,
    decisions,
    files,
    fileGroups,
    fileRequests,
    intakeDefaults,
    intakeQuestions,
    intakeSubmitted,
    invoices,
    kpiSnapshot,
    milestones,
    nextActions,
    optionalIntakeQuestions,
    pendingCustomerTasks,
    pendingDecisions,
    pendingFileApprovals,
    pendingMilestoneApprovals,
    primaryAction,
    reminders,
    requiredIntakeDone,
    requiredIntakeProgress,
    requiredIntakeQuestions,
    tasks,
    templateIntakeQuestions,
    tickets,
    timeline,
    updates,
  };
}

export const getPortalDashboardViewModel = cache(
  async (user: User): Promise<PortalDashboardViewModel> => {
    const bundles = await listProjectBundlesForUser(user);
    const openInvoices = bundles.flatMap((bundle) =>
      bundle.invoices.filter((invoice) => invoice.status !== "paid"),
    );
    const visibleTasks = bundles.flatMap((bundle) =>
      bundle.tasks.filter((task) =>
        user.role === "admin" ? task.status !== "done" : task.visibleToCustomer,
      ),
    );
    const customerNextActions =
      user.role === "admin"
        ? []
        : bundles.flatMap((bundle) =>
            buildCustomerNextActions(bundle)
              .slice(0, 2)
              .map((action) => ({ bundle, action })),
          );
    const primaryCustomerAction = customerNextActions[0];
    const nextAppointment =
      user.role === "admin"
        ? undefined
        : bundles
            .flatMap((bundle) =>
              bundle.updates
                .filter(
                  (update) =>
                    update.visibility === "customer" &&
                    update.title.startsWith("Termin:"),
                )
                .map((update) => ({ bundle, update })),
            )
            .sort(
              (a, b) =>
                new Date(b.update.createdAt).getTime() -
                new Date(a.update.createdAt).getTime(),
            )[0];
    const customerOpenTasks = visibleTasks.filter(
      (task) => task.status !== "done",
    );
    const openInvoiceTotal = openInvoices.reduce(
      (sum, invoice) => sum + invoice.amountCents,
      0,
    );
    const dashboardBundle =
      user.role === "admin"
        ? undefined
        : (primaryCustomerAction?.bundle ?? bundles[0]);

    return {
      bundles,
      openInvoices,
      customerOpenTasks,
      customerNextActions,
      primaryCustomerAction,
      nextAppointment,
      dashboardBundle,
      openInvoiceTotal,
    };
  },
);

export const getAdminProjectViewModel = cache(
  async (
    user: User,
    projectId: string,
    activeView: AdminProjectView = "setup",
  ) => {
    const [bundles, templateOverrides] = await Promise.all([
      listProjectBundlesForUser(user),
      listTemplateOverrides(),
    ]);
    const consultingTemplates = effectiveConsultingTemplates(templateOverrides);
    const bundle = bundles.find((entry) => entry.project.id === projectId);
    if (!bundle) return null;

    const matchedTemplate = matchConsultingTemplate(bundle.organization.industry);
    const template =
      consultingTemplates.find((entry) => entry.id === matchedTemplate.id) ??
      matchedTemplate;
    const needsGuidance = activeView === "guidance";
    const needsMeeting = activeView === "meeting";
    const needsCommunication = activeView === "communication";
    const needsDelivery = activeView === "delivery";
    const needsBilling = activeView === "billing";
    const needsAccess = activeView === "access";

    return {
      bundles,
      consultingTemplates,
      bundle,
      guidance: needsGuidance ? buildConsultantGuidance(bundle) : [],
      diagnosis: buildProjectDiagnosis(bundle),
      healthScore: buildProjectHealthScore(bundle),
      kpiSnapshot: buildProjectKpiSnapshot(bundle),
      adminActions: buildAdminProjectActions(bundle),
      copilotBrief: needsGuidance
        ? buildConsultingCopilotBrief(bundle)
        : EMPTY_COPILOT_BRIEF,
      meetingMode: needsMeeting
        ? buildMeetingModePlan(bundle)
        : EMPTY_MEETING_MODE,
      consultantWorkflow: needsGuidance
        ? buildConsultantWorkflow(bundle)
        : [],
      consultantCopyTemplates: needsGuidance
        ? buildConsultantCopyTemplates(bundle)
        : [],
      customerUpdateDraft: needsCommunication
        ? buildCustomerUpdateDraft(bundle)
        : { title: "", body: "" },
      aiComparison: needsGuidance ? buildAiProviderComparison(bundle) : [],
      projectTimeline: buildProjectTimeline(bundle),
      automationHistory: needsGuidance ? buildAutomationHistory(bundle) : [],
      fileGroups: needsDelivery ? buildFileVersionGroups(bundle) : [],
      decisions: needsCommunication ? buildDecisionCenter(bundle) : [],
      changeRequests: needsBilling ? buildChangeRequests(bundle) : [],
      fileRequests: needsDelivery ? buildFileRequests(bundle) : [],
      workflowSnapshots: needsGuidance ? buildWorkflowSnapshots(bundle) : [],
      clientAnalytics: needsCommunication
        ? buildClientAnalytics(bundle)
        : EMPTY_CLIENT_ANALYTICS,
      projectCopilot: buildProjectCopilotPanel(bundle),
      offerRecommendation: needsBilling
        ? latestOrBuildOfferRecommendation(bundle)
        : EMPTY_OFFER_RECOMMENDATION,
      similar: needsGuidance ? findSimilarProjectBundles(bundles, bundle) : [],
      template,
    };
  },
);

export const getAdminDashboardViewModel = cache(
  async (user: User, locale: Locale, query: AdminDashboardQuery) => {
    const projectQuery = query.q?.trim().toLowerCase() ?? "";
    const statusFilter = query.status ?? "all";
    const healthFilter = query.health ?? "all";
    const [allBundles, templateOverrides] = await Promise.all([
      listProjectBundlesForUser(user),
      listTemplateOverrides(),
    ]);
    const consultingTemplates = effectiveConsultingTemplates(templateOverrides);
    const selectedTemplateId =
      consultingTemplates.some((template) => template.id === query.template)
        ? query.template
        : "";
    const bundles = allBundles.filter((bundle) => {
      const matchesQuery =
        !projectQuery ||
        [
          bundle.project.name,
          bundle.project.summary,
          bundle.organization.name,
          bundle.organization.industry,
        ]
          .join(" ")
          .toLowerCase()
          .includes(projectQuery);
      const matchesStatus =
        statusFilter === "all" || bundle.project.status === statusFilter;
      const matchesHealth =
        healthFilter === "all" || bundle.project.health === healthFilter;

      return matchesQuery && matchesStatus && matchesHealth;
    });
    const projectCards = bundles.map((bundle) => ({
      bundle,
      nextBestAction: buildAdminProjectActions(bundle)[0],
      healthScore: buildProjectHealthScore(bundle),
    }));
    const latestActivity = allBundles
      .flatMap((bundle) =>
        buildProjectTimeline(bundle)
          .slice(0, 4)
          .map((item) => ({
            ...item,
            organizationName: bundle.organization.name,
          })),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
    const commands = [
      {
        label: "Automationen ausführen",
        href: `/${locale}/portal/admin#automation`,
        group: "Workflow",
        keywords: "automation next best action task reminder draft",
      },
      {
        label: "Heute öffnen",
        href: `/${locale}/portal/admin/today`,
        group: "Workflow",
        keywords: "today inbox action queue notification",
      },
      {
        label: "Pipeline öffnen",
        href: `/${locale}/portal/admin/pipeline`,
        group: "Workflow",
        keywords: "kanban status projekt flow",
      },
      {
        label: "Entwürfe prüfen",
        href: `/${locale}/portal/admin/drafts`,
        group: "Workflow",
        keywords: "updates kommunikation meeting proposal",
      },
      {
        label: "Kunden verwalten",
        href: `/${locale}/portal/admin/customers`,
        group: "Admin",
        keywords: "kunden account login zugriff",
      },
      {
        label: "Vorlagen bearbeiten",
        href: `/${locale}/portal/admin/templates`,
        group: "Admin",
        keywords: "branchen playbook industry",
      },
      ...allBundles.map((bundle) => ({
        label: `${bundle.organization.name} öffnen`,
        href: `/${locale}/portal/admin/projects/${bundle.project.id}`,
        group: "Projekt",
        keywords: [
          bundle.project.name,
          bundle.organization.industry,
          bundle.project.status,
          bundle.project.asdarStage,
        ].join(" "),
      })),
    ];

    return {
      allBundles,
      attentionItems: allBundles.flatMap(buildAttentionItems),
      automationOpportunities: buildAutomationOpportunities(allBundles),
      commandCenter: buildAdminCommandCenter(allBundles),
      commands,
      consultingTemplates,
      healthFilter,
      latestActivity,
      leadPipeline: buildLeadPipeline(allBundles),
      notifications: buildAdminNotificationCenter(allBundles),
      projectCards,
      projectQuery,
      selectedTemplateId,
      statusFilter,
    };
  },
);
