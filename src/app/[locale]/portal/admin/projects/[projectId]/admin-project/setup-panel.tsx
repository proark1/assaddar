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

export function SetupPanel({ ctx }: { ctx: AdminPanelContext }) {
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
                    {projectStatuses.map((entry: any) => (
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
                    {asdarStages.map((entry: any) => (
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
            <PortalCard>
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
            <PortalCard>
            <PortalSectionTitle
              eyebrow="Timeline"
              title="Projektaktivität auf einen Blick"
            >
              Alles Wichtige aus Updates, Aufgaben, Dateien, Rechnungen,
              Freigaben und internen Aktionen in einer chronologischen Sicht.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {projectTimeline.slice(0, 12).map((item: any) => (
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
    </>
  );
}
