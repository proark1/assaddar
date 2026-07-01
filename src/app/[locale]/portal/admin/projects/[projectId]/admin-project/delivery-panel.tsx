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
import { ProcessPriorityMatrix } from "@/components/portal/priority-matrix";
import { ArchiveProjectConfirm } from "@/components/portal/destructive-actions";
import { amountInputValue, HiddenProjectFields, type AdminPanelContext } from "./shared";

export function DeliveryPanel({ ctx }: { ctx: AdminPanelContext }) {
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
              eyebrow="Priorisierung"
              title="Aufwand gegen Nutzen"
            >
              Kundensichtbare Prozesse erscheinen auch in der Kundenansicht.
            </PortalSectionTitle>
            <div className="mt-5">
              <ProcessPriorityMatrix tasks={bundle.tasks} showUnrated />
            </div>
          </PortalCard>
            <PortalCard>
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
                {fileRequests.map((request: any) => (
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
              {fileGroups.map((group: any) => {
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
                          {group.versions.slice(1).map((version: any) => (
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
            <PortalCard>
            <PortalSectionTitle eyebrow="Aufgaben" title="Prozesse & Tasks" />
            <form action={addTaskAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input
                name="title"
                placeholder="Prozess, Use Case oder Aufgabe"
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
              <div className="grid grid-cols-2 gap-3">
                <select name="benefit" defaultValue="high" className={fieldClass}>
                  <option value="high">Hoher Nutzen</option>
                  <option value="low">Wenig Nutzen</option>
                </select>
                <select name="effort" defaultValue="low" className={fieldClass}>
                  <option value="low">Wenig Aufwand</option>
                  <option value="high">Hoher Aufwand</option>
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
              {bundle.tasks.map((task: any) => (
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
                      className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px]"
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
                      <select
                        name="benefit"
                        defaultValue={task.benefit ?? ""}
                        className={fieldClass}
                      >
                        <option value="">Keine Matrix</option>
                        <option value="high">Hoher Nutzen</option>
                        <option value="low">Wenig Nutzen</option>
                      </select>
                      <select
                        name="effort"
                        defaultValue={task.effort ?? ""}
                        className={fieldClass}
                      >
                        <option value="">Keine Matrix</option>
                        <option value="low">Wenig Aufwand</option>
                        <option value="high">Hoher Aufwand</option>
                      </select>
                      <button
                        type="submit"
                        aria-label="Aufgabe speichern"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline text-ink2 transition-colors hover:border-copper hover:text-copper"
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
            <PortalCard>
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
              {bundle.milestones.map((milestone: any) => (
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
    </>
  );
}
