import Link from "next/link";
import {
  AlertTriangle,
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
  ExternalLink,
  Eye,
  FileText,
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
import {
  asdarStages,
  formatCurrency,
  formatDate,
  formatStage,
  projectStatuses,
} from "@/lib/portal/format";
import {
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  textareaClass,
} from "@/components/portal/chrome";
import { ArchiveProjectConfirm } from "@/components/portal/destructive-actions";
import { amountInputValue, HiddenProjectFields, type AdminPanelContext } from "./shared";

export function AccessPanel({ ctx }: { ctx: AdminPanelContext }) {
  const {
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
  } = ctx;

  return (
    <>
            <PortalCard>
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
            <PortalCard>
            <PortalSectionTitle eyebrow="Audit" title="Interner Verlauf">
              Automatische Spur der wichtigsten Admin-Aktionen in diesem
              Projekt.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {auditUpdates.slice(0, 12).map((update: any) => (
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
            <PortalCard>
            <PortalSectionTitle eyebrow="Kunden" title="Zugriff verwalten" />
            <div className="mt-4 space-y-2">
              {bundle.customerUsers.map((customer: any) => (
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
    </>
  );
}
