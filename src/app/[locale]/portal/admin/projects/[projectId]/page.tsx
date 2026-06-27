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
  buildConsultantGuidance,
  findSimilarProjectBundles,
} from "@/lib/portal/ai";
import {
  isApproval,
  isCustomerComment,
  isCustomerIntake,
  isReminder,
  isStructuredUpdate,
} from "@/lib/portal/automation";
import { listProjectBundlesForUser, readStore } from "@/lib/portal/store";
import {
  effectiveConsultingTemplates,
  matchConsultingTemplate,
} from "@/lib/portal/templates";
import {
  asdarStages,
  formatCurrency,
  formatDate,
  formatStage,
  projectStatuses,
} from "@/lib/portal/format";
import {
  buildAiProviderComparison,
  buildAdminProjectActions,
  buildAutomationHistory,
  buildChangeRequests,
  buildClientAnalytics,
  buildConsultingCopilotBrief,
  buildConsultantCopyTemplates,
  buildConsultantWorkflow,
  buildCustomerUpdateDraft,
  buildDecisionCenter,
  buildFileVersionGroups,
  buildFileRequests,
  buildMeetingModePlan,
  buildProjectDiagnosis,
  buildProjectCopilotPanel,
  buildProjectHealthScore,
  buildProjectKpiSnapshot,
  latestOrBuildOfferRecommendation,
  buildProjectTimeline,
  buildWorkflowSnapshots,
} from "@/lib/portal/operations";
import {
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  textareaClass,
} from "@/components/portal/chrome";
import { ArchiveProjectConfirm } from "@/components/portal/destructive-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projekt Admin | Assad Dar Portal",
  robots: { index: false, follow: false },
};

type AdminProjectView =
  | "setup"
  | "guidance"
  | "meeting"
  | "communication"
  | "delivery"
  | "billing"
  | "access";

function adminProjectView(value?: string): AdminProjectView | null {
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
  const bundles = await listProjectBundlesForUser(user);
  const portalStore = await readStore();
  const consultingTemplates = effectiveConsultingTemplates(
    portalStore.templateOverrides,
  );
  const bundle = bundles.find((entry) => entry.project.id === projectId);
  if (!bundle) notFound();

  const query = await searchParams;
  const guidance = buildConsultantGuidance(bundle);
  const diagnosis = buildProjectDiagnosis(bundle);
  const healthScore = buildProjectHealthScore(bundle);
  const kpiSnapshot = buildProjectKpiSnapshot(bundle);
  const adminActions = buildAdminProjectActions(bundle);
  const copilotBrief = buildConsultingCopilotBrief(bundle);
  const meetingMode = buildMeetingModePlan(bundle);
  const consultantWorkflow = buildConsultantWorkflow(bundle);
  const consultantCopyTemplates = buildConsultantCopyTemplates(bundle);
  const customerUpdateDraft = buildCustomerUpdateDraft(bundle);
  const aiComparison = buildAiProviderComparison(bundle);
  const projectTimeline = buildProjectTimeline(bundle);
  const automationHistory = buildAutomationHistory(bundle);
  const fileGroups = buildFileVersionGroups(bundle);
  const decisions = buildDecisionCenter(bundle);
  const changeRequests = buildChangeRequests(bundle);
  const fileRequests = buildFileRequests(bundle);
  const workflowSnapshots = buildWorkflowSnapshots(bundle);
  const clientAnalytics = buildClientAnalytics(bundle);
  const projectCopilot = buildProjectCopilotPanel(bundle);
  const offerRecommendation = latestOrBuildOfferRecommendation(bundle);
  const similar = findSimilarProjectBundles(bundles, bundle);
  const matchedTemplate = matchConsultingTemplate(bundle.organization.industry);
  const template =
    consultingTemplates.find((entry) => entry.id === matchedTemplate.id) ??
    matchedTemplate;
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
  const activeView = adminProjectView(query.view) ?? "setup";
  const viewClass = (view: AdminProjectView) =>
    activeView === view ? "" : "hidden";
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

      <nav
        className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-7"
        aria-label="Admin-Projekt-Schritte"
      >
        {steps.map((step) => {
          const active = step.id === activeView;
          return (
            <Link
              key={step.id}
              href={stepHref(step.id)}
              className={`rounded-lg border p-4 transition-colors ${
                active
                  ? "border-copper bg-copper/10 text-ink"
                  : "border-hairline bg-surface text-ink2 hover:border-copper hover:text-ink"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                  Schritt {step.eyebrow}
                </span>
                {typeof step.count === "number" && step.count > 0 && (
                  <Badge tone={active ? "copper" : "neutral"}>
                    {step.count}
                  </Badge>
                )}
              </div>
              <div className="mt-2 text-sm font-medium text-ink">
                {step.title}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                {step.body}
              </p>
            </Link>
          );
        })}
      </nav>

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
          <PortalCard className={viewClass("setup")}>
            <PortalSectionTitle
              eyebrow="Projektsteuerung"
              title="Öffentliche Projektbasis"
            >
              Diese Felder sind Grundlage für Dashboard, Kundenansicht und
              interne ASDAR-Guidance.
            </PortalSectionTitle>
            <form
              action={updateProjectOverviewAction}
              className="mt-5 space-y-4"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Unternehmen
                  </label>
                  <input
                    name="company"
                    defaultValue={bundle.organization.name}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Branche
                  </label>
                  <input
                    name="industry"
                    defaultValue={bundle.organization.industry}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Website
                  </label>
                  <input
                    name="website"
                    defaultValue={bundle.organization.website ?? ""}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Projektname
                  </label>
                  <input
                    name="name"
                    defaultValue={bundle.project.name}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-ink2">
                  Projektzusammenfassung
                </label>
                <textarea
                  name="summary"
                  defaultValue={bundle.project.summary}
                  className={textareaClass}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={bundle.project.status}
                    className={fieldClass}
                  >
                    {projectStatuses.map((entry) => (
                      <option key={entry.value} value={entry.value}>
                        {entry.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    ASDAR Phase
                  </label>
                  <select
                    name="asdarStage"
                    defaultValue={bundle.project.asdarStage}
                    className={fieldClass}
                  >
                    {asdarStages.map((entry) => (
                      <option key={entry.value} value={entry.value}>
                        {entry.letter} · {entry.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Health
                  </label>
                  <select
                    name="health"
                    defaultValue={bundle.project.health}
                    className={fieldClass}
                  >
                    <option value="green">Green</option>
                    <option value="amber">Amber</option>
                    <option value="red">Red</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-ink2">
                  Nächster Schritt für den Kunden
                </label>
                <input
                  name="nextStep"
                  defaultValue={bundle.project.nextStep}
                  className={fieldClass}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <CheckCircle2 className="h-4 w-4" />
                Basis speichern
              </button>
            </form>
            <form
              action={saveProjectKpiAction}
              className="mt-6 rounded-lg border border-copper/25 bg-copper/10 p-4"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">
                    KPI, Ziel und ROI-Hypothese
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                    Macht den Nutzen messbar und kann als kundenfreundliches
                    Update veröffentlicht werden.
                  </p>
                </div>
                {kpiSnapshot.updatedAt && (
                  <Badge tone="green">
                    Aktualisiert {formatDate(kpiSnapshot.updatedAt)}
                  </Badge>
                )}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Baseline / aktueller Zustand
                  </label>
                  <textarea
                    name="baseline"
                    defaultValue={kpiSnapshot.baseline}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Zielbild / messbare Verbesserung
                  </label>
                  <textarea
                    name="target"
                    defaultValue={kpiSnapshot.target}
                    className={textareaClass}
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px_180px]">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    ROI- oder Nutzenhypothese
                  </label>
                  <input
                    name="roiHypothesis"
                    defaultValue={kpiSnapshot.roiHypothesis}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Owner
                  </label>
                  <input
                    name="owner"
                    defaultValue={kpiSnapshot.owner}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Review
                  </label>
                  <input
                    name="reviewDate"
                    type="date"
                    defaultValue={kpiSnapshot.reviewDate}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm text-ink2">
                  <input
                    name="publishToCustomer"
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-copper)]"
                  />
                  als Kundenupdate veröffentlichen
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  KPI speichern
                </button>
              </div>
            </form>
            <form
              action={archiveProjectAction}
              className="mt-6 border-t border-hairline pt-5"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="rounded-lg border border-critical/25 bg-critical/10 p-4">
                <div className="text-sm font-medium text-ink">
                  Projekt sicher archivieren
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                  Setzt das Projekt auf abgeschlossen. Kunden behalten Zugriff
                  auf bestehende Updates, Dateien und Rechnungen.
                </p>
                <ArchiveProjectConfirm />
              </div>
            </form>
          </PortalCard>

          <PortalCard className={viewClass("setup")}>
            <PortalSectionTitle
              eyebrow="Setup Wizard"
              title="5-Minuten Projekt-Setup"
            >
              Nutzt die wichtigsten Intake-Antworten, um interne Notizen,
              Kundenupdate, erste Aufgabe und Meilenstein anzulegen.
            </PortalSectionTitle>
            <form action={completeSetupWizardAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div>
                <label className="mb-1.5 block text-sm text-ink2">
                  Wichtigster Prozess
                </label>
                <input
                  name="process"
                  placeholder="z.B. Anfrage bis Angebot, Ticket bis Lösung, Auftrag bis Lieferung"
                  className={fieldClass}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Hauptengpass
                  </label>
                  <textarea
                    name="bottleneck"
                    placeholder="Wo verliert das Team Zeit, Qualität oder Transparenz?"
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Messbares Ziel
                  </label>
                  <textarea
                    name="metric"
                    placeholder="z.B. 30% weniger manuelle E-Mail-Zeit, schnellere Angebotsdauer"
                    className={textareaClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Entscheider und Stakeholder
                  </label>
                  <textarea name="decisionMakers" className={textareaClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Erster Pilot
                  </label>
                  <textarea
                    name="firstPilot"
                    placeholder="Welcher kleine Pilot soll zuerst umgesetzt werden?"
                    className={textareaClass}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <CheckCircle2 className="h-4 w-4" />
                Setup speichern und Projekt starten
              </button>
            </form>
          </PortalCard>

          <PortalCard className={viewClass("setup")}>
            <PortalSectionTitle
              eyebrow="Timeline"
              title="Projektaktivität auf einen Blick"
            >
              Alles Wichtige aus Updates, Aufgaben, Dateien, Rechnungen,
              Freigaben und internen Aktionen in einer chronologischen Sicht.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {projectTimeline.slice(0, 12).map((item) => (
                <article
                  key={`${item.type}-${item.id}`}
                  className="flex gap-3 rounded-lg border border-hairline bg-bg p-3"
                >
                  <History
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      item.tone === "red"
                        ? "text-critical"
                        : item.tone === "green"
                          ? "text-success"
                          : "text-copper"
                    }`}
                  />
                  <div>
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
                      <span className="text-[12px] text-muted">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink2">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
              {projectTimeline.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine Aktivität vorhanden.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Workflow Builder"
              title="Projektablauf als Playbook speichern"
            >
              Definiert Trigger, Checkliste, Reminder-Rhythmus und
              Automationsideen für dieses Projekt.
            </PortalSectionTitle>
            <form action={saveProjectWorkflowAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Workflow
                  </label>
                  <input
                    name="title"
                    placeholder="z.B. Intake bis Quick-Win Pilot"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Auslöser
                  </label>
                  <input
                    name="trigger"
                    placeholder="z.B. Intake eingereicht, Meeting abgeschlossen"
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Checkliste
                  </label>
                  <textarea
                    name="checklist"
                    placeholder="Je Zeile ein Schritt"
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Automation
                  </label>
                  <textarea
                    name="automation"
                    placeholder="Je Zeile eine Automation oder Reminder-Idee"
                    className={textareaClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="cadence"
                  placeholder="Reminder-Rhythmus, z.B. alle 3 Tage"
                  className={fieldClass}
                />
                <input
                  name="customerPromise"
                  placeholder="Was der Kunde dadurch zuverlässig sieht"
                  className={fieldClass}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <CheckCircle2 className="h-4 w-4" />
                Workflow speichern
              </button>
            </form>
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {workflowSnapshots.slice(0, 4).map((snapshot) => (
                <article
                  key={snapshot.id}
                  className="rounded-lg border border-hairline bg-bg p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="copper">Workflow</Badge>
                    <span className="text-[12px] text-muted">
                      {formatDate(snapshot.updatedAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-ink">
                    {snapshot.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {snapshot.trigger || "Kein Trigger hinterlegt."}
                  </p>
                  {snapshot.checklist.length > 0 && (
                    <ul className="mt-3 space-y-1 text-[12px] leading-relaxed text-ink2">
                      {snapshot.checklist.slice(0, 4).map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
              {workflowSnapshots.length === 0 && (
                <p className="text-sm text-muted">
                  Noch kein projektspezifischer Workflow gespeichert.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="AI Copilot"
              title="Beratungsbrief für den nächsten Schritt"
            >
              Kompakte, projektbezogene Beratungshilfe aus Intake,
              Projektstand, Playbook, Aufgaben und Kundensignalen.
            </PortalSectionTitle>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-copper/25 bg-copper/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <BrainCircuit className="h-4 w-4 text-copper" />
                  Copilot Summary
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink2">
                  {copilotBrief.summary}
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-lg border border-hairline bg-bg p-4">
                  <div className="text-sm font-medium text-ink">
                    Fehlende Informationen
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {copilotBrief.missingInformation.length ? (
                      copilotBrief.missingInformation.slice(0, 8).map((item) => (
                        <Badge key={item} tone="amber">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <Badge tone="green">Keine kritischen Lücken</Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-bg p-4">
                  <div className="text-sm font-medium text-ink">
                    Nächste Aktionen
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                    {copilotBrief.nextActions.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">
                  Fragen im nächsten Call
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {copilotBrief.suggestedQuestions.slice(0, 5).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">Quick Wins</div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {copilotBrief.quickWins.slice(0, 5).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">
                  Automatisierungsideen
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {copilotBrief.automationIdeas.slice(0, 5).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Beratungsmodus"
              title="Was Assad vor, während und nach dem Termin tut"
            >
              Ein praktischer Ablauf, damit jeder Call zu klaren Entscheidungen,
              Aufgaben und sichtbarem Kundenfortschritt führt.
            </PortalSectionTitle>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {consultantWorkflow.map((block) => (
                <div
                  key={block.title}
                  className="rounded-lg border border-hairline bg-bg p-4"
                >
                  <h3 className="text-sm font-medium text-ink">
                    {block.title}
                  </h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted">
                    {block.body}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Private Intelligence"
              title="ASDAR Intake und Beratungsnotizen"
            >
              Dieser Bereich ist nur intern sichtbar und steuert die
              Beratungslogik.
            </PortalSectionTitle>
            <form action={updateIntelligenceAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div>
                <label className="mb-1.5 block text-sm text-ink2">
                  Unternehmenskontext
                </label>
                <textarea
                  name="companyContext"
                  defaultValue={bundle.intelligence.companyContext}
                  className={textareaClass}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Stakeholder
                  </label>
                  <textarea
                    name="stakeholders"
                    defaultValue={bundle.intelligence.stakeholders}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Ziele
                  </label>
                  <textarea
                    name="goals"
                    defaultValue={bundle.intelligence.goals}
                    className={textareaClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-ink2">
                  Probleme, Engpässe, Reibung
                </label>
                <textarea
                  name="issues"
                  defaultValue={bundle.intelligence.issues}
                  className={textareaClass}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Aktuelle Tools
                  </label>
                  <textarea
                    name="currentTools"
                    defaultValue={bundle.intelligence.currentTools}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Daten- und Dokumentenlage
                  </label>
                  <textarea
                    name="dataSituation"
                    defaultValue={bundle.intelligence.dataSituation}
                    className={textareaClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Constraints und Risiken
                  </label>
                  <textarea
                    name="constraints"
                    defaultValue={bundle.intelligence.constraints}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Chancen und Automatisierungsideen
                  </label>
                  <textarea
                    name="opportunities"
                    defaultValue={bundle.intelligence.opportunities}
                    className={textareaClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-ink2">
                  Interne Notizen
                </label>
                <textarea
                  name="internalNotes"
                  defaultValue={bundle.intelligence.internalNotes}
                  className={textareaClass}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <BrainCircuit className="h-4 w-4" />
                Intelligence speichern
              </button>
            </form>
          </PortalCard>

          <PortalCard className={viewClass("meeting")}>
            <PortalSectionTitle
              eyebrow="Meeting Mode"
              title="Live-Call führen und direkt in Projektfortschritt verwandeln"
            >
              Eine fokussierte Arbeitsfläche für Calls: Agenda, Fragen,
              Entscheidungen, Notizen, Aufgaben und kundenfreundlicher
              Update-Entwurf.
            </PortalSectionTitle>
            <div className="mt-5 rounded-lg border border-copper/25 bg-copper/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <Video className="h-4 w-4 text-copper" />
                Fokus für diesen Termin
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {meetingMode.focus}
              </p>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <form
                action={scheduleProjectAppointmentAction}
                className="rounded-lg border border-hairline bg-bg p-4"
              >
                <HiddenProjectFields locale={safe} projectId={projectId} />
                <div className="text-sm font-medium text-ink">
                  Nächsten Termin planen
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  Optional im Kundenportal veröffentlichen und per E-Mail
                  ankündigen.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    name="appointmentDate"
                    type="date"
                    className={fieldClass}
                  />
                  <input
                    name="appointmentTime"
                    type="time"
                    className={fieldClass}
                  />
                </div>
                <input
                  name="appointmentType"
                  defaultValue="Projekt-Call"
                  className={`${fieldClass} mt-3`}
                />
                <input
                  name="meetingUrl"
                  placeholder="Meeting-Link"
                  className={`${fieldClass} mt-3`}
                />
                <textarea
                  name="notes"
                  placeholder="Hinweis für den Kunden"
                  className={`${textareaClass} mt-3 min-h-24`}
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-ink2">
                  <input
                    name="publish"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 accent-[var(--color-copper)]"
                  />
                  Termin im Kundenportal anzeigen
                </label>
                <button
                  type="submit"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                >
                  <Video className="h-4 w-4" />
                  Termin speichern
                </button>
              </form>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">
                  Geplante Termine
                </div>
                <div className="mt-4 space-y-3">
                  {appointments.slice(0, 4).map((appointment) => (
                    <article
                      key={appointment.id}
                      className="rounded-lg border border-hairline bg-surface p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          tone={
                            appointment.visibility === "customer"
                              ? "green"
                              : "neutral"
                          }
                        >
                          {appointment.visibility === "customer"
                            ? "Kunde"
                            : "Intern"}
                        </Badge>
                        <span className="text-[12px] text-muted">
                          {formatDate(appointment.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-ink">
                        {appointment.title.replace(/^Termin:\s*/, "")}
                      </div>
                      <p className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-muted">
                        {appointment.body}
                      </p>
                    </article>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-sm text-muted">
                      Noch kein Termin gespeichert.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">Agenda</div>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {meetingMode.agenda.map((item, index) => (
                    <li key={item} className="flex gap-2">
                      <span className="font-mono text-[12px] text-copper">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">Live-Fragen</div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {meetingMode.livePrompts.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">
                  Entscheidungscheckliste
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {meetingMode.decisionChecklist.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <form action={addMeetingNoteAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="meetingTitle"
                  defaultValue={`Meeting: ${meetingMode.focus}`}
                  className={fieldClass}
                />
                <select
                  name="asdarStage"
                  defaultValue={bundle.project.asdarStage}
                  className={fieldClass}
                >
                  {asdarStages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <textarea
                  name="notes"
                  placeholder="Live-Notizen, Beobachtungen, Beispiele"
                  className={textareaClass}
                />
                <textarea
                  name="decisions"
                  placeholder="Entscheidungen, offene Punkte, Risiken"
                  className={textareaClass}
                />
              </div>
              <textarea
                name="nextActions"
                defaultValue={meetingMode.afterCallActions.join("\n")}
                className={textareaClass}
              />
              <textarea
                name="customerSummary"
                defaultValue={meetingMode.customerSummaryDraft}
                className={textareaClass}
              />
              <label className="flex items-center gap-2 text-sm text-ink2">
                <input
                  name="publishSummary"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                Zusammenfassung nach dem Call im Kundenportal veröffentlichen
              </label>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <MessagesSquare className="h-4 w-4" />
                Meeting speichern und nächste Schritte erzeugen
              </button>
            </form>
          </PortalCard>

          <PortalCard className={viewClass("communication")}>
            <PortalSectionTitle
              eyebrow="Kundenkommunikation"
              title="Update veröffentlichen"
            >
              Interne Updates bleiben privat. Kundenupdates erscheinen direkt im
              Kundenportal.
            </PortalSectionTitle>
            <div className="mt-5 rounded-lg border border-copper/25 bg-copper/10 p-4">
              <div className="text-sm font-medium text-ink">
                Vorschlag aus Projektstand
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink2">
                {customerUpdateDraft.body}
              </p>
            </div>
            <form action={addUpdateAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm text-ink2">
                    Titel
                  </label>
                  <input
                    name="title"
                    defaultValue={customerUpdateDraft.title}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Sichtbarkeit
                  </label>
                  <select name="visibility" className={fieldClass}>
                    <option value="customer">Kunde</option>
                    <option value="internal">Intern</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-ink2">
                  ASDAR Phase
                </label>
                <select
                  name="asdarStage"
                  defaultValue={bundle.project.asdarStage}
                  className={fieldClass}
                >
                  {asdarStages.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-ink2">Text</label>
                <textarea
                  name="body"
                  defaultValue={customerUpdateDraft.body}
                  className={textareaClass}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <Send className="h-4 w-4" />
                Update speichern
              </button>
            </form>

            <div className="mt-6 space-y-4">
              {projectUpdates.map((update) => (
                <article
                  key={update.id}
                  className="rounded-lg border border-hairline bg-bg p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        update.visibility === "customer" ? "green" : "neutral"
                      }
                    >
                      {update.visibility === "customer" ? "Kunde" : "Intern"}
                    </Badge>
                    <Badge>{formatStage(update.asdarStage)}</Badge>
                    <span className="text-[12px] text-muted">
                      {formatDate(update.createdAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium text-ink">{update.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink2">
                    {update.body}
                  </p>
                </article>
              ))}
              {projectUpdates.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine Projektupdates gespeichert.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("communication")}>
            <PortalSectionTitle
              eyebrow="Decision Center"
              title="Entscheidungen klar freigeben lassen"
            >
              Lege Entscheidungen als eigene Einträge an. Kundensichtbare
              Entscheidungen können direkt im Portal angenommen oder kommentiert
              werden.
            </PortalSectionTitle>
            <form action={createDecisionAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="grid gap-4 md:grid-cols-[1fr_180px_180px]">
                <input
                  name="title"
                  placeholder="Entscheidung, z.B. Pilot-Prozess freigeben"
                  className={fieldClass}
                />
                <select name="status" className={fieldClass}>
                  <option value="proposed">Vorgeschlagen</option>
                  <option value="approved">Freigegeben</option>
                  <option value="needs_changes">Änderungen nötig</option>
                  <option value="rejected">Abgelehnt</option>
                </select>
                <select name="visibility" className={fieldClass}>
                  <option value="customer">Kunde</option>
                  <option value="internal">Intern</option>
                </select>
              </div>
              <textarea
                name="body"
                placeholder="Kontext, Optionen, Empfehlung und gewünschte Entscheidung"
                className={textareaClass}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <CheckCircle2 className="h-4 w-4" />
                Entscheidung speichern
              </button>
            </form>
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {decisions.map((decision) => (
                <article
                  key={decision.id}
                  className="rounded-lg border border-hairline bg-bg p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        decision.status === "approved"
                          ? "green"
                          : decision.status === "rejected"
                            ? "red"
                            : "amber"
                      }
                    >
                      {decision.status}
                    </Badge>
                    <Badge
                      tone={
                        decision.visibility === "customer"
                          ? "green"
                          : "neutral"
                      }
                    >
                      {decision.visibility === "customer" ? "Kunde" : "Intern"}
                    </Badge>
                    <span className="text-[12px] text-muted">
                      {formatDate(decision.updatedAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-ink">
                    {decision.title}
                  </h3>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink2">
                    {decision.body}
                  </p>
                  {decision.response && (
                    <div className="mt-3 rounded-lg border border-success/25 bg-success/10 p-3 text-[12px] leading-relaxed text-success">
                      {decision.response}
                    </div>
                  )}
                </article>
              ))}
              {decisions.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine formalen Entscheidungen gespeichert.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("communication")}>
            <PortalSectionTitle eyebrow="Nachrichten" title="Kundenkommentare">
              Kurze Rückfragen und Antworten, ohne daraus ein formales
              Statusupdate zu machen.
            </PortalSectionTitle>
            <form action={addProjectCommentAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input name="topic" placeholder="Thema" className={fieldClass} />
              <textarea
                name="message"
                required
                placeholder="Antwort oder Rückfrage"
                className={textareaClass}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <MessagesSquare className="h-4 w-4" />
                Kommentar senden
              </button>
            </form>
            <div className="mt-5 space-y-3">
              {comments.map((comment) => {
                const [author, ...messageParts] = comment.body.split("\n\n");
                return (
                  <article
                    key={comment.id}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>
                        {comment.title.replace(/^Kommentar:\s*/, "")}
                      </Badge>
                      <span className="text-[12px] text-muted">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink">
                      {author}
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink2">
                      {messageParts.join("\n\n")}
                    </p>
                  </article>
                );
              })}
              {comments.length === 0 && (
                <p className="text-sm text-muted">Noch keine Kommentare.</p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("communication")}>
            <PortalSectionTitle
              eyebrow="Vorlagen"
              title="Schnelle Texte für Beratung und Kunde"
            >
              Nutzbare Entwürfe für Kickoff, Meeting-Zusammenfassung,
              Angebot, Prozessanalyse und Abschlussbericht.
            </PortalSectionTitle>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {consultantCopyTemplates.map((templateEntry) => (
                <details
                  key={templateEntry.id}
                  className="rounded-lg border border-hairline bg-bg p-4"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start gap-3">
                      <Copy className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                      <div>
                        <div className="text-sm font-medium text-ink">
                          {templateEntry.title}
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-muted">
                          {templateEntry.body}
                        </p>
                      </div>
                    </div>
                  </summary>
                  <textarea
                    readOnly
                    value={templateEntry.content}
                    className={`${textareaClass} mt-4 min-h-56 font-mono text-[12px] leading-relaxed`}
                  />
                </details>
              ))}
            </div>
          </PortalCard>
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
          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Industry Playbook"
              title="Template für dieses Projekt"
            >
              Branchenbezogene Diagnose, Quick Wins und ASDAR-Schritte für den
              Beratungsablauf.
            </PortalSectionTitle>
            <form
              action={applyConsultingTemplateAction}
              className="mt-5 space-y-3"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input
                type="hidden"
                name="industry"
                value={bundle.organization.industry}
              />
              <select
                name="templateId"
                defaultValue={template.id}
                className={fieldClass}
              >
                {consultingTemplates.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <WandSparkles className="h-4 w-4" />
                Playbook anwenden
              </button>
            </form>

            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-hairline bg-bg p-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-copper" />
                  <div className="text-sm font-medium text-ink">
                    {template.label}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink2">
                  {template.bestFor}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink">
                  <span className="font-medium">Kickoff-Ziel:</span>{" "}
                  {template.kickoffGoal}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-ink">Quick Wins</h3>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink2">
                  {template.quickWins.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-ink">
                  Automatisierungsideen
                </h3>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink2">
                  {template.automationIdeas.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Meeting Copilot"
              title="Call- und Workshop-Guidance"
            >
              Nutze diese Punkte live im Termin, um schneller von Problem zu
              Pilot zu kommen.
            </PortalSectionTitle>
            <form action={addMeetingNoteAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input
                name="meetingTitle"
                placeholder="Meeting-Titel"
                className={fieldClass}
              />
              <select
                name="asdarStage"
                defaultValue={bundle.project.asdarStage}
                className={fieldClass}
              >
                {asdarStages.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
              <textarea
                name="notes"
                placeholder="Live-Notizen, Beobachtungen, Zitate"
                className={textareaClass}
              />
              <textarea
                name="decisions"
                placeholder="Entscheidungen und offene Punkte"
                className={textareaClass}
              />
              <textarea
                name="nextActions"
                placeholder="Nächste Aktionen, je Zeile eine Aufgabe"
                className={textareaClass}
              />
              <textarea
                name="customerSummary"
                placeholder="Kurze kundenfreundliche Zusammenfassung"
                className={textareaClass}
              />
              <label className="flex items-center gap-2 text-sm text-ink2">
                <input
                  name="publishSummary"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                Zusammenfassung im Kundenportal veröffentlichen
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <MessagesSquare className="h-4 w-4" />
                Meeting speichern
              </button>
            </form>
            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <ClipboardList className="h-4 w-4 text-copper" />
                  Agenda
                </div>
                <ol className="mt-2 space-y-2 text-sm leading-relaxed text-ink2">
                  {template.callAgenda.map((item, index) => (
                    <li key={item} className="flex gap-2">
                      <span className="font-mono text-[12px] text-copper">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <MessagesSquare className="h-4 w-4 text-copper" />
                  Diagnosefragen
                </div>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink2">
                  {template.discoveryQuestions.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-copper">?</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-ink">
                  Meeting-Moves für Assad
                </h3>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink2">
                  {template.meetingMoves.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Branchen-ASDAR"
              title="Phasenplan aus dem Template"
            />
            <div className="mt-5 space-y-4">
              {asdarStages.map((stage) => (
                <div
                  key={stage.value}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        bundle.project.asdarStage === stage.value
                          ? "copper"
                          : "neutral"
                      }
                    >
                      {stage.letter}
                    </Badge>
                    <div className="text-sm font-medium text-ink">
                      {stage.label}
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink2">
                    {template.asdarPlan[stage.value].map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="ASDAR Guidance"
              title="Nächste Beratungsimpulse"
            >
              Regelbasierte Guidance aus den Projektfeldern. Später kann hier
              ein Multi-Provider-AI-Adapter übernehmen.
            </PortalSectionTitle>
            <div className="mt-5 space-y-4">
              {guidance.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                  <div>
                    <h3 className="text-sm font-medium text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink2">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Automation"
              title="ASDAR Diagnosis Pack"
            >
              Erzeugt aus dem aktuellen Projektstand einen strukturierten
              Beratungsbefund mit Readiness, Risiken, Chancen, Aufgaben,
              Meilensteinen und optionalem Kundenupdate.
            </PortalSectionTitle>
            <div className="mt-5 rounded-lg border border-copper/25 bg-copper/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-ink">
                    Readiness {diagnosis.readinessScore}/100
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    {diagnosis.readinessLabel}
                  </div>
                </div>
                <Badge
                  tone={
                    diagnosis.readinessScore >= 80
                      ? "green"
                      : diagnosis.readinessScore >= 55
                        ? "amber"
                        : "red"
                  }
                >
                  {diagnosis.missingInputs.length} Lücken
                </Badge>
              </div>
              {diagnosis.missingInputs.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-ink">
                    Noch ergänzen
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {diagnosis.missingInputs.slice(0, 6).map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <form
              action={generateDiagnosisPackAction}
              className="mt-4 space-y-3"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <label className="flex items-center gap-2 text-sm text-ink2">
                <input
                  name="createTasks"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                empfohlene Aufgaben für Assad anlegen
              </label>
              <label className="flex items-center gap-2 text-sm text-ink2">
                <input
                  name="createMilestones"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                Roadmap-Meilensteine erzeugen
              </label>
              <label className="flex items-center gap-2 text-sm text-ink2">
                <input
                  name="publishSummary"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                kundenfreundliche Zusammenfassung veröffentlichen
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <WandSparkles className="h-4 w-4" />
                Diagnosis Pack generieren
              </button>
            </form>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Automation History"
              title="Was Assad Assist bereits erledigt hat"
            >
              Zeigt automatisch erzeugte Aufgaben, Insights und Nachfassungen,
              damit Automationen nachvollziehbar bleiben.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {automationHistory.slice(0, 8).map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="copper">{item.rule ?? "automation"}</Badge>
                    <span className="text-[12px] text-muted">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-ink">
                    {item.title}
                  </div>
                  <p className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-muted">
                    {item.body}
                  </p>
                </article>
              ))}
              {automationHistory.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine Automation für dieses Projekt ausgeführt.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="External AI"
              title="Multi-Provider Scan"
            >
              Nutzt konfigurierte Provider und speichert gute Ergebnisse als
              interne Projektinsights.
            </PortalSectionTitle>
            <form action={runAiScanAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="grid gap-2 text-sm text-ink2">
                <label className="flex items-center gap-2">
                  <input
                    name="provider_openai"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 accent-[var(--color-copper)]"
                  />
                  OpenAI
                </label>
                <label className="flex items-center gap-2">
                  <input
                    name="provider_gemini"
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-copper)]"
                  />
                  Gemini
                </label>
                <label className="flex items-center gap-2">
                  <input
                    name="provider_grok"
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-copper)]"
                  />
                  Grok
                </label>
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <Sparkles className="h-4 w-4" />
                Scan starten
              </button>
            </form>
            <form action={saveKnowledgeSnapshotAction} className="mt-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
              >
                <BrainCircuit className="h-4 w-4" />
                Knowledge Snapshot speichern
              </button>
            </form>
            <form
              action={generateProjectBriefAction}
              className="mt-3 rounded-lg border border-copper/25 bg-copper/10 p-3"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="text-sm font-medium text-ink">
                Projektbrief Generator
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                Erzeugt internen Consultant Brief, Kunden-Zusammenfassung,
                Meeting-Fokus und Quick-Win-Ideen aus dem aktuellen
                Projektstand.
              </p>
              <div className="mt-3 space-y-2 text-sm text-ink2">
                <label className="flex items-center gap-2">
                  <input
                  name="publishSummary"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                  Kundensichere Zusammenfassung veröffentlichen
                </label>
                <label className="flex items-center gap-2">
                  <input
                  name="createActions"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                  Quick-Win-Aufgaben für Assad anlegen
                </label>
              </div>
              <button
                type="submit"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <BrainCircuit className="h-4 w-4" />
                Projektbrief generieren
              </button>
            </form>
            {aiComparison.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="text-sm font-medium text-ink">
                  Provider-Vergleich
                </div>
                {aiComparison.map((entry) => (
                  <div
                    key={entry.provider}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium capitalize text-ink">
                        {entry.provider}
                      </div>
                      <Badge
                        tone={
                          entry.status === "ok"
                            ? "green"
                            : entry.status === "not_configured"
                              ? "amber"
                              : "red"
                        }
                      >
                        {entry.status}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-3 text-[12px] leading-relaxed text-ink2 md:grid-cols-2">
                      <div>
                        <div className="font-medium text-ink">Summary</div>
                        <ul className="mt-1 space-y-1">
                          {(entry.summary.length
                            ? entry.summary
                            : [entry.raw.slice(0, 180)]).map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-ink">Automation</div>
                        <ul className="mt-1 space-y-1">
                          {entry.automationIdeas.slice(0, 3).map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-ink">Risiken</div>
                        <ul className="mt-1 space-y-1">
                          {entry.risks.slice(0, 3).map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-ink">Nächste Schritte</div>
                        <ul className="mt-1 space-y-1">
                          {entry.nextActions.slice(0, 3).map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 space-y-3">
              {bundle.aiInsights.map((insight) => (
                <article
                  key={insight.id}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="text-sm font-medium text-ink">
                    {insight.title}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink2">
                    {insight.body}
                  </p>
                </article>
              ))}
              {bundle.aiInsights.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine externen AI-Insights gespeichert.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("guidance")}>
            <PortalSectionTitle
              eyebrow="Similarity Scan"
              title="Ähnliche Projekte"
            >
              Lokaler Vergleich über Branche, Probleme, Ziele und Chancen.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {similar.map((entry) => (
                <Link
                  key={entry.project.id}
                  href={`/${safe}/portal/admin/projects/${entry.project.id}`}
                  className="block rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                >
                  <div className="text-sm font-medium text-ink">
                    {entry.project.name}
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    {entry.organization?.name ?? "Unbekannt"} · Score{" "}
                    {entry.score}
                  </div>
                  {entry.overlap.length > 0 && (
                    <div className="mt-2 text-[12px] text-copper">
                      {entry.overlap.join(", ")}
                    </div>
                  )}
                </Link>
              ))}
              {similar.length === 0 && (
                <p className="text-sm leading-relaxed text-muted">
                  Noch keine ähnlichen Projekte gefunden. Das wird wertvoller,
                  sobald mehrere Projekte gepflegt sind.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("communication")}>
            <PortalSectionTitle
              eyebrow="Customer Signals"
              title="Input, Freigaben, Reminder"
            >
              Schneller Blick darauf, was vom Kunden gekommen ist und wo Assad
              nachfassen sollte.
            </PortalSectionTitle>
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-hairline bg-bg p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-ink">
                      Kunden-Intake
                    </div>
                    <div className="mt-1 text-[12px] text-muted">
                      {intakeUpdates.length > 0
                        ? `Eingereicht: ${formatDate(intakeUpdates[0].createdAt)}`
                        : "Noch nicht eingereicht"}
                    </div>
                  </div>
                  <Badge tone={intakeUpdates.length > 0 ? "green" : "amber"}>
                    {intakeUpdates.length > 0 ? "Vorhanden" : "Offen"}
                  </Badge>
                </div>
                {intakeUpdates.length === 0 && (
                  <form action={sendProjectReminderAction} className="mt-3">
                    <HiddenProjectFields locale={safe} projectId={projectId} />
                    <input type="hidden" name="reminderType" value="intake" />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                    >
                      <Bell className="h-3.5 w-3.5" />
                      Intake Reminder senden
                    </button>
                  </form>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-ink">Freigaben</h3>
                <div className="mt-2 space-y-2">
                  {approvals.slice(0, 4).map((approval) => (
                    <div
                      key={approval.id}
                      className="rounded-lg border border-hairline bg-bg p-3"
                    >
                      <div className="text-sm font-medium text-ink">
                        {approval.title.replace(/^Freigabe:\s*/, "")}
                      </div>
                      <div className="mt-1 text-[12px] text-muted">
                        {formatDate(approval.createdAt)}
                      </div>
                    </div>
                  ))}
                  {approvals.length === 0 && (
                    <p className="text-sm text-muted">Noch keine Freigaben.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-ink">Reminder</h3>
                <div className="mt-2 space-y-2">
                  {reminders.slice(0, 4).map((reminder) => (
                    <div
                      key={reminder.id}
                      className="rounded-lg border border-hairline bg-bg p-3"
                    >
                      <div className="text-sm font-medium text-ink">
                        {reminder.title.replace(/^Erinnerung:\s*/, "")}
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted">
                        {reminder.body}
                      </p>
                    </div>
                  ))}
                  {reminders.length === 0 && (
                    <p className="text-sm text-muted">Noch keine Reminder.</p>
                  )}
                </div>
              </div>
            </div>
          </PortalCard>

          <PortalCard className={viewClass("access")}>
            <PortalSectionTitle
              eyebrow="Client Analytics"
              title="Kundenaktivität und nächster Nudge"
            >
              Verdichtet Kundensignale, offene To-dos, Freigaben, Dateien und
              Rechnungen zu einer einfachen Handlungsempfehlung.
            </PortalSectionTitle>
            <div className="mt-5 rounded-lg border border-hairline bg-bg p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {clientAnalytics.engagementLabel}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink2">
                    {clientAnalytics.nextNudge}
                  </p>
                </div>
                <Badge
                  tone={
                    clientAnalytics.engagementTone === "red"
                      ? "red"
                      : clientAnalytics.engagementTone === "green"
                        ? "green"
                        : "amber"
                  }
                >
                  Engagement
                </Badge>
              </div>
              {clientAnalytics.latestCustomerSignal && (
                <div className="mt-3 text-[12px] text-muted">
                  Letztes Signal: {clientAnalytics.latestCustomerSignal} ·{" "}
                  {formatDate(clientAnalytics.latestCustomerSignalAt)}
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Kunden-To-dos", clientAnalytics.openCustomerTasks],
                ["Überfällig", clientAnalytics.overdueCustomerTasks],
                ["Entscheidungen", clientAnalytics.pendingDecisions],
                ["Dateiwünsche", clientAnalytics.pendingFileRequests],
                ["Updates", clientAnalytics.visibleUpdates],
                ["Rechnungen", clientAnalytics.pendingInvoices],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="text-xl font-medium text-ink">{value}</div>
                  <div className="mt-1 text-[12px] text-muted">{label}</div>
                </div>
              ))}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("access")}>
            <PortalSectionTitle eyebrow="Audit" title="Interner Verlauf">
              Automatische Spur der wichtigsten Admin-Aktionen in diesem
              Projekt.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {auditUpdates.slice(0, 12).map((update) => (
                <article
                  key={update.id}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{formatStage(update.asdarStage)}</Badge>
                    <span className="text-[12px] text-muted">
                      {formatDate(update.createdAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-ink">
                    {update.title.replace(/^Audit:\s*/, "")}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink2">
                    {update.body}
                  </p>
                </article>
              ))}
              {auditUpdates.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine Audit-Einträge vorhanden.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("access")}>
            <PortalSectionTitle eyebrow="Kunden" title="Zugriff verwalten" />
            <div className="mt-4 space-y-2">
              {bundle.customerUsers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="text-sm font-medium text-ink">
                    {customer.name}
                  </div>
                  <div className="text-[12px] text-muted">{customer.email}</div>
                </div>
              ))}
              {bundle.customerUsers.length === 0 && (
                <p className="text-sm text-muted">
                  Noch kein Kunde zugeordnet.
                </p>
              )}
            </div>
            <form action={assignCustomerAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input
                name="email"
                type="email"
                placeholder="kunde@example.com"
                className={fieldClass}
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
              >
                <UserPlus className="h-4 w-4" />
                Kunde zuordnen
              </button>
            </form>
            <form action={inviteCustomerAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="border-t border-hairline pt-5">
                <div className="text-sm font-medium text-ink">
                  Neuen Kunden einladen
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  Erstellt bei Bedarf ein Kundenkonto, ordnet es diesem Projekt
                  zu und sendet einen Passwort-Link.
                </p>
              </div>
              <input name="name" placeholder="Name" className={fieldClass} />
              <input
                name="email"
                type="email"
                required
                placeholder="kunde@example.com"
                className={fieldClass}
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <UserPlus className="h-4 w-4" />
                Einladung senden
              </button>
            </form>
          </PortalCard>

          <PortalCard className={viewClass("delivery")}>
            <PortalSectionTitle eyebrow="Dateien" title="Upload" />
            <form
              action={createFileRequestAction}
              className="mt-5 rounded-lg border border-copper/25 bg-copper/10 p-4"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="text-sm font-medium text-ink">
                Datei vom Kunden anfragen
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                Erstellt automatisch eine kundensichtbare Aufgabe mit
                Upload-Möglichkeit.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px]">
                <input
                  name="title"
                  placeholder="z.B. Prozessbeispiel, Export, Rechnungsvorlage"
                  className={fieldClass}
                />
                <input name="dueDate" type="date" className={fieldClass} />
              </div>
              <textarea
                name="body"
                placeholder="Was genau soll hochgeladen werden und worauf soll der Kunde achten?"
                className={`${textareaClass} mt-3`}
              />
              <button
                type="submit"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <FileUp className="h-4 w-4" />
                Datei anfragen
              </button>
            </form>
            {fileRequests.length > 0 && (
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {fileRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          request.status === "done"
                            ? "green"
                            : request.status === "uploaded"
                              ? "amber"
                              : "copper"
                        }
                      >
                        {request.status}
                      </Badge>
                      {request.dueDate && (
                        <span className="text-[12px] text-muted">
                          fällig {formatDate(request.dueDate)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink">
                      {request.title}
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">
                      {request.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <form
              action={generateFinalReportAction}
              className="mt-5 rounded-lg border border-copper/25 bg-copper/10 p-3"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="text-sm font-medium text-ink">
                Abschlussbericht PDF
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                Erstellt einen kundensichtbaren Abschlussbericht aus
                Projektstand, Deliverables, Chancen und nächsten Schritten.
              </p>
              <button
                type="submit"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <FileUp className="h-4 w-4" />
                Abschlussbericht erstellen
              </button>
            </form>
            <form
              action={addFileAction}
              className="mt-5 space-y-3"
            >
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input
                name="name"
                placeholder="Anzeigename"
                className={fieldClass}
              />
              <input
                name="description"
                placeholder="Beschreibung"
                className={fieldClass}
              />
              <select name="visibility" className={fieldClass}>
                <option value="customer">Kunde</option>
                <option value="internal">Intern</option>
              </select>
              <input
                name="file"
                type="file"
                required
                className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-2 file:text-sm file:font-medium file:text-oncopper"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <FileUp className="h-4 w-4" />
                Datei hochladen
              </button>
            </form>
            <div className="mt-5 space-y-3">
              {fileGroups.map((group) => {
                const file = group.latest;
                return (
                  <div
                    key={group.key}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <a
                      href={`/api/portal/files/${file.id}`}
                      className="flex items-start gap-3 transition-colors hover:text-copper"
                    >
                      <Download className="mt-0.5 h-4 w-4 text-copper" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium text-ink">
                            {file.name}
                          </div>
                          {approvedFileIds.has(file.id) && (
                            <Badge tone="green">Freigegeben</Badge>
                          )}
                          {group.versions.length > 1 && (
                            <Badge tone="copper">
                              {group.versions.length} Versionen
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-[12px] text-muted">
                          {file.visibility} · {file.category ?? "other"} ·{" "}
                          {file.approvalStatus ?? "not_required"} ·{" "}
                          {Math.ceil(file.size / 1024)} KB
                        </div>
                        {file.description && (
                          <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                            {file.description}
                          </p>
                        )}
                      </div>
                    </a>
                    {group.versions.length > 1 && (
                      <details className="mt-3 border-t border-hairline pt-3">
                        <summary className="cursor-pointer text-[12px] font-medium text-copper">
                          Versionshistorie anzeigen
                        </summary>
                        <div className="mt-2 space-y-2">
                          {group.versions.slice(1).map((version) => (
                            <a
                              key={version.id}
                              href={`/api/portal/files/${version.id}`}
                              className="block rounded-md border border-hairline bg-surface px-3 py-2 text-[12px] text-ink2 transition-colors hover:border-copper hover:text-copper"
                            >
                              {version.name} · {formatDate(version.uploadedAt)} ·{" "}
                              {Math.ceil(version.size / 1024)} KB
                            </a>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
              {fileGroups.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine Dateien hochgeladen.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("delivery")}>
            <PortalSectionTitle eyebrow="Aufgaben" title="Tasks" />
            <form action={addTaskAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input
                name="title"
                placeholder="Aufgabe"
                className={fieldClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <select name="owner" className={fieldClass}>
                  <option value="assad">Assad</option>
                  <option value="customer">Kunde</option>
                </select>
                <select name="status" className={fieldClass}>
                  <option value="todo">Todo</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <input name="dueDate" type="date" className={fieldClass} />
              <label className="flex items-center gap-2 text-sm text-ink2">
                <input
                  name="visibleToCustomer"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                Für Kunden sichtbar
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
              >
                <Plus className="h-4 w-4" />
                Aufgabe hinzufügen
              </button>
            </form>
            <div className="mt-5 space-y-2">
              {bundle.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-hairline bg-bg p-3 text-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium text-ink">{task.title}</div>
                      <div className="mt-1 text-[12px] text-muted">
                        {task.owner} · {formatDate(task.dueDate)} ·{" "}
                        {task.visibleToCustomer ? "Kunde" : "Intern"}
                      </div>
                    </div>
                    <form
                      action={updateTaskStatusAction}
                      className="flex items-center gap-2"
                    >
                      <HiddenProjectFields
                        locale={safe}
                        projectId={projectId}
                      />
                      <input type="hidden" name="taskId" value={task.id} />
                      <select
                        name="status"
                        defaultValue={task.status}
                        className={`${fieldClass} min-w-28`}
                      >
                        <option value="todo">Todo</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        type="submit"
                        aria-label="Aufgabenstatus speichern"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline text-ink2 transition-colors hover:border-copper hover:text-copper"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                  {task.owner === "customer" &&
                    task.visibleToCustomer &&
                    task.status !== "done" && (
                      <form action={sendProjectReminderAction} className="mt-3">
                        <HiddenProjectFields
                          locale={safe}
                          projectId={projectId}
                        />
                        <input type="hidden" name="reminderType" value="task" />
                        <input type="hidden" name="entityId" value={task.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                        >
                          <Bell className="h-3.5 w-3.5" />
                          Kunden erinnern
                        </button>
                      </form>
                    )}
                </div>
              ))}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("delivery")}>
            <PortalSectionTitle eyebrow="Meilensteine" title="Roadmap" />
            <form action={addMilestoneAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input
                name="title"
                placeholder="Meilenstein"
                className={fieldClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <select name="status" className={fieldClass}>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="done">Done</option>
                </select>
                <input name="dueDate" type="date" className={fieldClass} />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink2">
                <input
                  name="visibleToCustomer"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                Für Kunden sichtbar
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
              >
                <Plus className="h-4 w-4" />
                Meilenstein hinzufügen
              </button>
            </form>
            <div className="mt-5 space-y-2">
              {bundle.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="rounded-lg border border-hairline bg-bg p-3 text-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium text-ink">
                        {milestone.title}
                      </div>
                      <div className="mt-1 text-[12px] text-muted">
                        {formatDate(milestone.dueDate)} ·{" "}
                        {milestone.visibleToCustomer ? "Kunde" : "Intern"}
                      </div>
                    </div>
                    <form
                      action={updateMilestoneStatusAction}
                      className="flex items-center gap-2"
                    >
                      <HiddenProjectFields
                        locale={safe}
                        projectId={projectId}
                      />
                      <input
                        type="hidden"
                        name="milestoneId"
                        value={milestone.id}
                      />
                      <select
                        name="status"
                        defaultValue={milestone.status}
                        className={`${fieldClass} min-w-32`}
                      >
                        <option value="planned">Planned</option>
                        <option value="active">Active</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        type="submit"
                        aria-label="Meilensteinstatus speichern"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline text-ink2 transition-colors hover:border-copper hover:text-copper"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </PortalCard>

          <PortalCard className={viewClass("billing")}>
            <PortalSectionTitle eyebrow="Rechnungen" title="Payment" />
            <div className="mt-5 rounded-lg border border-copper/25 bg-copper/10 p-4">
              <div className="text-sm font-medium text-ink">
                Scope & Change Requests
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                Änderungswünsche transparent erfassen, schätzen und für den
                Kunden sichtbar auf Status setzen.
              </p>
              <form action={createChangeRequestAction} className="mt-4 space-y-3">
                <HiddenProjectFields locale={safe} projectId={projectId} />
                <input
                  name="title"
                  placeholder="Änderung oder Zusatzwunsch"
                  className={fieldClass}
                />
                <textarea
                  name="body"
                  placeholder="Beschreibung, Nutzen und Abgrenzung"
                  className={textareaClass}
                />
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    name="estimate"
                    placeholder="Schätzung, z.B. 4h / 750 EUR"
                    className={fieldClass}
                  />
                  <input name="dueDate" type="date" className={fieldClass} />
                  <select name="status" className={fieldClass}>
                    <option value="new">Neu</option>
                    <option value="scoping">In Schätzung</option>
                    <option value="quoted">Angeboten</option>
                    <option value="accepted">Angenommen</option>
                    <option value="in_progress">In Umsetzung</option>
                    <option value="done">Erledigt</option>
                    <option value="rejected">Abgelehnt</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                >
                  <Plus className="h-4 w-4" />
                  Change Request speichern
                </button>
              </form>
            </div>
            {changeRequests.length > 0 && (
              <div className="mt-5 space-y-3">
                {changeRequests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-lg border border-hairline bg-bg p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          request.status === "done"
                            ? "green"
                            : request.status === "rejected"
                              ? "red"
                              : "amber"
                        }
                      >
                        {request.status}
                      </Badge>
                      <Badge>
                        {request.requestedBy === "customer"
                          ? "Kunde"
                          : "Assad"}
                      </Badge>
                      <span className="text-[12px] text-muted">
                        {formatDate(request.updatedAt)}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-ink">
                      {request.title}
                    </h3>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink2">
                      {request.body}
                    </p>
                    <form
                      action={updateChangeRequestAction}
                      className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_160px_auto]"
                    >
                      <HiddenProjectFields locale={safe} projectId={projectId} />
                      <input
                        type="hidden"
                        name="requestId"
                        value={request.id}
                      />
                      <input
                        name="estimate"
                        defaultValue={request.estimate ?? ""}
                        placeholder="Schätzung"
                        className={fieldClass}
                      />
                      <input
                        name="dueDate"
                        type="date"
                        defaultValue={request.dueDate ?? ""}
                        className={fieldClass}
                      />
                      <select
                        name="status"
                        defaultValue={request.status}
                        className={fieldClass}
                      >
                        <option value="new">Neu</option>
                        <option value="scoping">In Schätzung</option>
                        <option value="quoted">Angeboten</option>
                        <option value="accepted">Angenommen</option>
                        <option value="in_progress">In Umsetzung</option>
                        <option value="done">Erledigt</option>
                        <option value="rejected">Abgelehnt</option>
                      </select>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                      >
                        Speichern
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            )}
            <div className="mt-5 rounded-lg border border-copper/25 bg-copper/10 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <CreditCard className="h-4 w-4 text-copper" />
                    Offer Studio
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    Empfehlung aus Intake, Template, Readiness,
                    Komplexitätsfaktoren und Projektstand. Bitte prüfen, dann
                    als Proposal erzeugen.
                  </p>
                </div>
                <form action={generateOfferRecommendationAction}>
                  <HiddenProjectFields locale={safe} projectId={projectId} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                  >
                    <WandSparkles className="h-4 w-4" />
                    Neu berechnen
                  </button>
                </form>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-[11px] text-muted">Paket</div>
                  <div className="mt-1 text-sm font-medium text-ink">
                    {offerRecommendation.packageLabel}
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-[11px] text-muted">Preis</div>
                  <div className="mt-1 text-sm font-medium text-ink">
                    {formatCurrency(offerRecommendation.recommendedPriceCents)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {formatCurrency(offerRecommendation.priceMinCents)} -{" "}
                    {formatCurrency(offerRecommendation.priceMaxCents)}
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-[11px] text-muted">Zeitrahmen</div>
                  <div className="mt-1 text-sm font-medium text-ink">
                    {offerRecommendation.timeline}
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {offerRecommendation.effortDays[0]}-
                    {offerRecommendation.effortDays[1]} Beratungstage
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-[11px] text-muted">Sicherheit</div>
                  <div className="mt-1 text-sm font-medium text-ink">
                    {offerRecommendation.confidence}/100
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {offerRecommendation.confidenceLabel} · Komplexität{" "}
                    {offerRecommendation.complexityScore}/100
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-sm font-medium text-ink">Deliverables</div>
                  <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-muted">
                    {offerRecommendation.deliverables.slice(0, 5).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-sm font-medium text-ink">Annahmen</div>
                  <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-muted">
                    {offerRecommendation.assumptions.slice(0, 5).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-sm font-medium text-ink">Noch klären</div>
                  <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-muted">
                    {offerRecommendation.nextQuestions.slice(0, 5).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <form action={generateProposalAction} className="mt-5 space-y-3">
              <div className="rounded-lg border border-hairline bg-bg p-3">
                <div className="text-sm font-medium text-ink">
                  Proposal aus Empfehlung erstellen
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                  Felder sind vorgefüllt. Assad kann Scope, Ergebnis,
                  Zeitrahmen und Preis vor dem Senden anpassen.
                </p>
              </div>
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <textarea
                name="scope"
                placeholder="Leistungsumfang"
                defaultValue={offerRecommendation.scope}
                className={textareaClass}
              />
              <textarea
                name="outcomes"
                placeholder="Ergebnisse / Deliverables"
                defaultValue={offerRecommendation.outcomes}
                className={textareaClass}
              />
              <input
                name="timeline"
                placeholder="Zeitrahmen"
                defaultValue={offerRecommendation.timeline}
                className={fieldClass}
              />
              <input
                name="amount"
                placeholder="2900,00"
                defaultValue={amountInputValue(
                  offerRecommendation.recommendedPriceCents,
                )}
                className={fieldClass}
              />
              <label className="flex items-center gap-2 text-sm text-ink2">
                <input
                  name="createInvoice"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                Rechnung aus Proposal erzeugen
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
              >
                <FileUp className="h-4 w-4" />
                Proposal erstellen
              </button>
            </form>

            <form action={addInvoiceAction} className="mt-5 space-y-3">
              <div className="border-t border-hairline pt-5 text-sm font-medium text-ink">
                Rechnung manuell hinzufügen
              </div>
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input
                name="number"
                placeholder="Rechnungsnummer"
                className={fieldClass}
              />
              <input
                name="description"
                placeholder="Beschreibung"
                className={fieldClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="amount"
                  placeholder="2900,00"
                  className={fieldClass}
                />
                <select name="currency" className={fieldClass}>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="status" className={fieldClass}>
                  <option value="sent">Sent</option>
                  <option value="draft">Draft</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <input name="issuedAt" type="date" className={fieldClass} />
              </div>
              <input name="dueDate" type="date" className={fieldClass} />
              <input
                name="paymentUrl"
                placeholder="Stripe/Payment Link"
                className={fieldClass}
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <CreditCard className="h-4 w-4" />
                Rechnung hinzufügen
              </button>
            </form>
            <div className="mt-5 space-y-2">
              {bundle.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-lg border border-hairline bg-bg p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-ink">{invoice.number}</div>
                    <Badge
                      tone={
                        invoice.status === "paid"
                          ? "green"
                          : invoice.status === "overdue"
                            ? "red"
                            : "amber"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-ink2">
                    {formatCurrency(invoice.amountCents, invoice.currency)}
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    Fällig: {formatDate(invoice.dueDate)}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <form
                      action={updateInvoiceStatusAction}
                      className="flex items-center gap-2"
                    >
                      <HiddenProjectFields
                        locale={safe}
                        projectId={projectId}
                      />
                      <input
                        type="hidden"
                        name="invoiceId"
                        value={invoice.id}
                      />
                      <select
                        name="status"
                        defaultValue={invoice.status}
                        className={fieldClass}
                      >
                        <option value="sent">Sent</option>
                        <option value="draft">Draft</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <button
                        type="submit"
                        aria-label="Rechnungsstatus speichern"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline text-ink2 transition-colors hover:border-copper hover:text-copper"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </form>
                    {invoice.status !== "paid" &&
                      invoice.status !== "draft" && (
                        <form action={sendProjectReminderAction}>
                          <HiddenProjectFields
                            locale={safe}
                            projectId={projectId}
                          />
                          <input
                            type="hidden"
                            name="reminderType"
                            value="invoice"
                          />
                          <input
                            type="hidden"
                            name="entityId"
                            value={invoice.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-hairline px-3 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                          >
                            <Bell className="h-3.5 w-3.5" />
                            Reminder
                          </button>
                        </form>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </PortalCard>
        </aside>
      </div>
    </PortalShell>
  );
}
