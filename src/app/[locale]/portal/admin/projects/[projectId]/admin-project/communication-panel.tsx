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

export function CommunicationMainPanel({ ctx }: { ctx: AdminPanelContext }) {
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
                  {asdarStages.map((entry: any) => (
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
              {projectUpdates.map((update: any) => (
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
            <PortalCard>
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
              {decisions.map((decision: any) => (
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
            <PortalCard>
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
              {comments.map((comment: any) => {
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
            <PortalCard>
            <PortalSectionTitle
              eyebrow="Vorlagen"
              title="Schnelle Texte für Beratung und Kunde"
            >
              Nutzbare Entwürfe für Kickoff, Meeting-Zusammenfassung,
              Angebot, Prozessanalyse und Abschlussbericht.
            </PortalSectionTitle>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {consultantCopyTemplates.map((templateEntry: any) => (
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
    </>
  );
}

export function CommunicationSidePanel({ ctx }: { ctx: AdminPanelContext }) {
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
              eyebrow="Kundensignale"
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
                  {approvals.slice(0, 4).map((approval: any) => (
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
                  {reminders.slice(0, 4).map((reminder: any) => (
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
    </>
  );
}
