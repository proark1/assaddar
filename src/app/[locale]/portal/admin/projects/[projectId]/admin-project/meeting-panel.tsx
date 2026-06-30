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

export function MeetingPanel({ ctx }: { ctx: AdminPanelContext }) {
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
                  {appointments.slice(0, 4).map((appointment: any) => (
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
                  {meetingMode.agenda.map((item: any, index: number) => (
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
                  {meetingMode.livePrompts.map((item: any) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">
                  Entscheidungscheckliste
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {meetingMode.decisionChecklist.map((item: any) => (
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
                  {asdarStages.map((stage: any) => (
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
    </>
  );
}
