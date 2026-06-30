import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Bot,
  BrainCircuit,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileUp,
  History,
  Lightbulb,
  MessagesSquare,
  Plus,
  Send,
  Sparkles,
  UserPlus,
  Video,
  WandSparkles,
} from "lucide-react";
import {
  addFileAction,
  addInvoiceAction,
  addMilestoneAction,
  addProjectCommentAction,
  addTaskAction,
  addUpdateAction,
  applyConsultingTemplateAction,
  archiveProjectAction,
  assignCustomerAction,
  completeSetupWizardAction,
  createChangeRequestAction,
  createDecisionAction,
  createFileRequestAction,
  generateDiagnosisPackAction,
  generateFinalReportAction,
  generateOfferRecommendationAction,
  generateProposalAction,
  generateProjectBriefAction,
  inviteCustomerAction,
  addMeetingNoteAction,
  runAiScanAction,
  runProjectAutomationsAction,
  saveProjectKpiAction,
  saveProjectWorkflowAction,
  saveKnowledgeSnapshotAction,
  scheduleProjectAppointmentAction,
  sendProjectReminderAction,
  updateChangeRequestAction,
  updateIntelligenceAction,
  updateInvoiceStatusAction,
  updateMilestoneStatusAction,
  updateProjectOverviewAction,
  updateTaskStatusAction,
} from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import {
  isApproval,
  isCustomerComment,
  isCustomerIntake,
  isReminder,
  isStructuredUpdate,
} from "@/lib/portal/automation";
import {
  asdarStages,
  formatCurrency,
  formatDate,
  formatStage,
  projectStatuses,
} from "@/lib/portal/format";
import {
  adminProjectView,
  getAdminProjectViewModel,
  type AdminProjectView,
} from "@/lib/portal/view-models";
import {
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  PortalStepNav,
  textareaClass,
} from "@/components/portal/chrome";
import { ArchiveProjectConfirm } from "@/components/portal/destructive-actions";
import { AccessPanel } from "./admin-project/access-panel";
import { BillingPanel } from "./admin-project/billing-panel";
import {
  CommunicationMainPanel,
  CommunicationSidePanel,
} from "./admin-project/communication-panel";
import { DeliveryPanel } from "./admin-project/delivery-panel";
import {
  GuidanceMainPanel,
  GuidanceSidePanel,
} from "./admin-project/guidance-panel";
import { MeetingPanel } from "./admin-project/meeting-panel";
import { SetupPanel } from "./admin-project/setup-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projekt Admin | Assad Dar Portal",
  robots: { index: false, follow: false },
};

function amountInputValue(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function HiddenProjectFields({
  locale,
  projectId,
}: {
  locale: Locale;
  projectId: string;
}) {
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="projectId" value={projectId} />
    </>
  );
}

export default async function AdminProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; projectId: string }>;
  searchParams: Promise<{
    saved?: string;
    assigned?: string;
    error?: string;
    view?: string;
  }>;
}) {
  const { locale, projectId } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const query = await searchParams;
  const activeView = adminProjectView(query.view) ?? "setup";
  const viewModel = await getAdminProjectViewModel(user, projectId, activeView);
  if (!viewModel) notFound();
  const {
    bundle,
    consultingTemplates,
    guidance,
    diagnosis,
    healthScore,
    kpiSnapshot,
    adminActions,
    copilotBrief,
    meetingMode,
    consultantWorkflow,
    consultantCopyTemplates,
    customerUpdateDraft,
    aiComparison,
    projectTimeline,
    automationHistory,
    fileGroups,
    decisions,
    changeRequests,
    fileRequests,
    workflowSnapshots,
    clientAnalytics,
    projectCopilot,
    offerRecommendation,
    similar,
    template,
  } = viewModel;

  const auditUpdates = bundle.updates.filter((update) =>
    update.title.startsWith("Audit:"),
  );
  const comments = bundle.updates.filter((update) =>
    isCustomerComment(update.title),
  );
  const approvals = bundle.updates.filter((update) => isApproval(update.title));
  const reminders = bundle.updates.filter((update) => isReminder(update.title));
  const appointments = bundle.updates
    .filter((update) => update.title.startsWith("Termin:"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const intakeUpdates = bundle.updates.filter((update) =>
    isCustomerIntake(update.title),
  );
  const projectUpdates = bundle.updates.filter(
    (update) =>
      !update.title.startsWith("Audit:") && !isStructuredUpdate(update.title),
  );
  const approvedFileIds = new Set(
    approvals
      .map((update) => update.body.match(/APPROVAL_FILE:([^\n]+)/)?.[1])
      .filter((value): value is string => Boolean(value)),
  );
  const stepHref = (view: AdminProjectView) =>
    `/${safe}/portal/admin/projects/${projectId}?view=${view}`;
  const primaryAdminAction = adminActions[0];
  const openCustomerTasks = bundle.tasks.filter(
    (task) => task.owner === "customer" && task.status !== "done",
  ).length;
  const openInvoices = bundle.invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "draft",
  ).length;
  const steps: Array<{
    id: AdminProjectView;
    eyebrow: string;
    title: string;
    body: string;
    count?: number;
  }> = [
    {
      id: "setup",
      eyebrow: "1",
      title: "Setup",
      body: "Basis, Wizard und interne Projektfelder.",
    },
    {
      id: "guidance",
      eyebrow: "2",
      title: "Beratung",
      body: "Copilot, Playbook und AI-Scans.",
      count: bundle.aiInsights.length + similar.length + workflowSnapshots.length,
    },
    {
      id: "meeting",
      eyebrow: "3",
      title: "Meeting",
      body: "Live-Call, Notizen und Entscheidungen.",
    },
    {
      id: "communication",
      eyebrow: "4",
      title: "Kunde",
      body: "Updates, Kommentare und Kundensignale.",
      count: comments.length + reminders.length + decisions.length,
    },
    {
      id: "delivery",
      eyebrow: "5",
      title: "Umsetzung",
      body: "Dateien, Aufgaben und Roadmap.",
      count:
        bundle.files.length +
        openCustomerTasks +
        bundle.milestones.length +
        fileRequests.length,
    },
    {
      id: "billing",
      eyebrow: "6",
      title: "Abrechnung",
      body: "Proposal, Rechnungen und Reminder.",
      count: openInvoices + changeRequests.length,
    },
    {
      id: "access",
      eyebrow: "7",
      title: "Zugriff",
      body: "Kunden, Einladungen und Audit.",
      count: bundle.customerUsers.length,
    },
  ];
  const adminPanelContext = {
    safe,
    projectId,
    bundle,
    consultingTemplates,
    guidance,
    diagnosis,
    healthScore,
    kpiSnapshot,
    adminActions,
    copilotBrief,
    meetingMode,
    consultantWorkflow,
    consultantCopyTemplates,
    customerUpdateDraft,
    aiComparison,
    projectTimeline,
    automationHistory,
    fileGroups,
    decisions,
    changeRequests,
    fileRequests,
    workflowSnapshots,
    clientAnalytics,
    projectCopilot,
    offerRecommendation,
    similar,
    template,
    query,
    auditUpdates,
    comments,
    approvals,
    reminders,
    appointments,
    intakeUpdates,
    projectUpdates,
    approvedFileIds,
    activeView,
    stepHref,
    primaryAdminAction,
    openCustomerTasks,
    openInvoices,
    steps,
    user,
  };

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow={`${bundle.organization.name} · Admin`}
      title={bundle.project.name}
      activeNav="admin"
      backHref={`/${safe}/portal/admin`}
      actions={
        <>
          <form action={runProjectAutomationsAction}>
            <HiddenProjectFields locale={safe} projectId={projectId} />
            <input
              type="hidden"
              name="returnTo"
              value={`/${safe}/portal/admin/projects/${projectId}`}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
            >
              <Bot className="h-4 w-4" />
              Automationen
            </button>
          </form>
          <Link
            href={`/${safe}/portal/projects/${bundle.project.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
          >
            <Eye className="h-4 w-4" />
            Kundenansicht
          </Link>
        </>
      }
    >
      {(query.saved || query.assigned === "1") && (
        <p
          role="status"
          aria-live="polite"
          className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {query.saved && "Gespeichert."}
          {query.assigned === "1" && " Kunde wurde zugeordnet."}
        </p>
      )}
      {query.assigned === "0" && (
        <p
          role="status"
          aria-live="polite"
          className="mb-6 rounded-lg border border-strong bg-surface2 px-4 py-3 text-sm text-ink2"
        >
          Kein passender registrierter Kunde gefunden.
        </p>
      )}
      {query.error && (
        <p
          role="alert"
          aria-live="assertive"
          className="mb-6 rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical"
        >
          {query.error === "file" && "Datei konnte nicht hochgeladen werden."}
          {query.error === "ai" &&
            "AI Scan konnte nicht gespeichert werden. Prüfen Sie Provider-Key und Modell."}
          {query.error === "archive" &&
            "Zum Archivieren bitte ARCHIVIEREN exakt eingeben."}
          {query.error === "comment" && "Bitte einen Kommentar eintragen."}
        </p>
      )}

      <PortalCard className="mb-6 border-copper/30 bg-copper/10">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr] lg:items-center">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
              Projekt Cockpit
            </div>
            <h2 className="mt-2 text-xl font-medium text-ink">
              {primaryAdminAction.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink2">
              {primaryAdminAction.body}
            </p>
            <Link
              href={stepHref(primaryAdminAction.hrefView)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
            >
              {primaryAdminAction.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-hairline bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xl font-medium text-ink">
                  {healthScore.score}
                </div>
                <Badge
                  tone={
                    healthScore.tone === "red"
                      ? "red"
                      : healthScore.tone === "green"
                        ? "green"
                        : "amber"
                  }
                >
                  {healthScore.label}
                </Badge>
              </div>
              <div className="mt-1 text-[12px] text-muted">Project Health</div>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-3">
              <div className="text-xl font-medium text-ink">
                {diagnosis.readinessScore}
              </div>
              <div className="mt-1 text-[12px] text-muted">Readiness</div>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-3">
              <div className="text-xl font-medium text-ink">
                {openCustomerTasks}
              </div>
              <div className="mt-1 text-[12px] text-muted">Kunden-To-dos</div>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-3">
              <div className="text-xl font-medium text-ink">{openInvoices}</div>
              <div className="mt-1 text-[12px] text-muted">Rechnungen</div>
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-hairline bg-surface p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm font-medium text-ink">
                Warum diese Priorität?
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink2">
                {primaryAdminAction.reason ||
                  "Die Aktion ergibt sich aus Health, Intake, Aufgaben, Updates und Rechnungen."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {healthScore.factors.slice(0, 4).map((factor) => (
                <Badge
                  key={factor.label}
                  tone={
                    factor.tone === "red"
                      ? "red"
                      : factor.tone === "green"
                        ? "green"
                        : "amber"
                  }
                >
                  {factor.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </PortalCard>

      <PortalCard className="mb-6">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <PortalSectionTitle eyebrow="Project Copilot" title={projectCopilot.headline}>
              {projectCopilot.summary}
            </PortalSectionTitle>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {projectCopilot.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xl font-medium text-ink">
                      {metric.value}
                    </div>
                    <Badge
                      tone={
                        metric.tone === "red"
                          ? "red"
                          : metric.tone === "green"
                            ? "green"
                            : metric.tone === "amber"
                              ? "amber"
                              : "copper"
                      }
                    >
                      {metric.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {projectCopilot.actions.map((action) => (
              <Link
                key={action.id}
                href={stepHref(action.hrefView)}
                className="flex items-start justify-between gap-4 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
              >
                <div>
                  <div className="text-sm font-medium text-ink">
                    {action.title}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {action.body}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-copper" />
              </Link>
            ))}
          </div>
        </div>
      </PortalCard>

      <PortalStepNav
        ariaLabel="Admin-Projekt-Schritte"
        className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-7"
        steps={steps.map((step) => ({
          ...step,
          eyebrow: `Schritt ${step.eyebrow}`,
          href: stepHref(step.id),
          active: step.id === activeView,
        }))}
      />

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px] xl:items-start">
        <aside className="hidden xl:sticky xl:top-6 xl:block">
          <PortalCard>
            <PortalSectionTitle eyebrow="Timeline" title="Projektverlauf" />
            <div className="mt-5 space-y-3">
              {projectTimeline.slice(0, 9).map((item) => (
                <Link
                  key={`rail-${item.type}-${item.id}`}
                  href={stepHref(
                    item.type === "Rechnung"
                      ? "billing"
                      : item.type === "Datei"
                        ? "delivery"
                        : item.type === "Aufgabe" || item.type === "Meilenstein"
                          ? "delivery"
                          : "communication",
                  )}
                  className="block rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        item.tone === "red"
                          ? "red"
                          : item.tone === "green"
                            ? "green"
                            : "neutral"
                      }
                    >
                      {item.type}
                    </Badge>
                    <span className="text-[11px] text-muted">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <div className="mt-2 line-clamp-2 text-[12px] font-medium leading-snug text-ink">
                    {item.title}
                  </div>
                </Link>
              ))}
              {projectTimeline.length === 0 && (
                <p className="text-sm text-muted">Noch keine Aktivität.</p>
              )}
            </div>
          </PortalCard>
        </aside>
        <div className="space-y-6">
          {activeView === "setup" && <SetupPanel ctx={adminPanelContext} />}
          {activeView === "guidance" && (
            <GuidanceMainPanel ctx={adminPanelContext} />
          )}
          {activeView === "meeting" && <MeetingPanel ctx={adminPanelContext} />}
          {activeView === "communication" && (
            <CommunicationMainPanel ctx={adminPanelContext} />
          )}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6">
          <PortalCard className="border-copper/25 bg-copper/10">
            <PortalSectionTitle
              eyebrow="Assad Copilot"
              title={projectCopilot.headline}
            >
              {projectCopilot.summary}
            </PortalSectionTitle>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {projectCopilot.metrics.slice(0, 4).map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-hairline bg-surface p-3"
                >
                  <div className="text-lg font-medium text-ink">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              {projectCopilot.actions.slice(0, 4).map((action) => (
                <Link
                  key={`sticky-${action.id}`}
                  href={stepHref(action.hrefView)}
                  className="flex items-start justify-between gap-3 rounded-lg border border-hairline bg-surface p-3 transition-colors hover:border-copper"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {action.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[12px] leading-relaxed text-muted">
                      {action.body}
                    </span>
                  </span>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                </Link>
              ))}
            </div>
          </PortalCard>
          {activeView === "guidance" && (
            <GuidanceSidePanel ctx={adminPanelContext} />
          )}
          {activeView === "communication" && (
            <CommunicationSidePanel ctx={adminPanelContext} />
          )}
          {activeView === "access" && <AccessPanel ctx={adminPanelContext} />}
          {activeView === "delivery" && (
            <DeliveryPanel ctx={adminPanelContext} />
          )}
          {activeView === "billing" && <BillingPanel ctx={adminPanelContext} />}
        </aside>
      </div>
    </PortalShell>
  );
}
