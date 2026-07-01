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
  runWebsiteCrawlAction,
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

export function GuidanceMainPanel({ ctx }: { ctx: AdminPanelContext }) {
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
              {workflowSnapshots.slice(0, 4).map((snapshot: any) => (
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
                      {snapshot.checklist.slice(0, 4).map((item: any) => (
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
            <PortalCard>
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
                      copilotBrief.missingInformation.slice(0, 8).map((item: any) => (
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
                    {copilotBrief.nextActions.map((item: any) => (
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
                  {copilotBrief.suggestedQuestions.slice(0, 5).map((item: any) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">Quick Wins</div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {copilotBrief.quickWins.slice(0, 5).map((item: any) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="text-sm font-medium text-ink">
                  Automatisierungsideen
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                  {copilotBrief.automationIdeas.slice(0, 5).map((item: any) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </PortalCard>
            <PortalCard>
            <PortalSectionTitle
              eyebrow="Beratungsmodus"
              title="Was Assad vor, während und nach dem Termin tut"
            >
              Ein praktischer Ablauf, damit jeder Call zu klaren Entscheidungen,
              Aufgaben und sichtbarem Kundenfortschritt führt.
            </PortalSectionTitle>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {consultantWorkflow.map((block: any) => (
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
                    {block.items.map((item: any) => (
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
            <PortalCard>
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
    </>
  );
}

export function GuidanceSidePanel({ ctx }: { ctx: AdminPanelContext }) {
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

  const latestWebsiteCrawl = bundle.websiteCrawlRuns[0];
  const latestWebsitePages = latestWebsiteCrawl
    ? bundle.websiteCrawlPages
        .filter((page: any) => page.runId === latestWebsiteCrawl.id)
        .slice(0, 6)
    : bundle.websiteCrawlPages.slice(0, 6);

  return (
    <>
            <PortalCard>
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
                {consultingTemplates.map((entry: any) => (
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
                  {template.quickWins.map((item: any) => (
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
                  {template.automationIdeas.map((item: any) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PortalCard>
            <PortalCard>
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
                {asdarStages.map((stage: any) => (
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
                  {template.callAgenda.map((item: any, index: number) => (
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
                  {template.discoveryQuestions.map((item: any) => (
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
                  {template.meetingMoves.map((item: any) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PortalCard>
            <PortalCard>
            <PortalSectionTitle
              eyebrow="Branchen-ASDAR"
              title="Phasenplan aus dem Template"
            />
            <div className="mt-5 space-y-4">
              {asdarStages.map((stage: any) => (
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
                    {template.asdarPlan[stage.value].map((item: any) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </PortalCard>
            <PortalCard>
            <PortalSectionTitle
              eyebrow="ASDAR Guidance"
              title="Nächste Beratungsimpulse"
            >
              Regelbasierte Guidance aus den Projektfeldern. Später kann hier
              ein Multi-Provider-AI-Adapter übernehmen.
            </PortalSectionTitle>
            <div className="mt-5 space-y-4">
              {guidance.map((item: any) => (
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
            <PortalCard>
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
                    {diagnosis.missingInputs.slice(0, 6).map((item: any) => (
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
            <PortalCard>
            <PortalSectionTitle
              eyebrow="Automation History"
              title="Was Assad Assist bereits erledigt hat"
            >
              Zeigt automatisch erzeugte Aufgaben, Insights und Nachfassungen,
              damit Automationen nachvollziehbar bleiben.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {automationHistory.slice(0, 8).map((item: any) => (
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
            <PortalCard>
            <PortalSectionTitle
              eyebrow="Website Intelligence"
              title="Website als Business-Signal scannen"
            >
              Crawlt die Kundenseite, extrahiert Business-Kontext und speichert
              die Quellen als interne Projektintelligenz.
            </PortalSectionTitle>
            <form action={runWebsiteCrawlAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div>
                <label className="mb-1.5 block text-sm text-ink2">
                  Website
                </label>
                <input
                  name="website"
                  defaultValue={bundle.organization.website ?? ""}
                  placeholder="https://kunde.de"
                  className={fieldClass}
                />
              </div>
              <label className="flex items-start gap-2 rounded-lg border border-hairline bg-bg p-3 text-[12px] leading-relaxed text-muted">
                <input
                  name="applyWebsiteIntelligence"
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 h-4 w-4 accent-[var(--color-copper)]"
                />
                Findings in Private Intelligence uebernehmen
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <Eye className="h-4 w-4" />
                Website scannen
              </button>
            </form>
            {latestWebsiteCrawl && (
              <div className="mt-5 rounded-lg border border-hairline bg-bg p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-ink">
                    Letzter Scan
                  </div>
                  <Badge
                    tone={
                      latestWebsiteCrawl.status === "completed"
                        ? "green"
                        : latestWebsiteCrawl.status === "failed"
                          ? "red"
                          : "amber"
                    }
                  >
                    {latestWebsiteCrawl.status}
                  </Badge>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  {latestWebsiteCrawl.websiteUrl} Â·{" "}
                  {latestWebsiteCrawl.pageCount} Seiten Â·{" "}
                  {formatDate(
                    latestWebsiteCrawl.completedAt ??
                      latestWebsiteCrawl.createdAt,
                  )}
                </p>
                {latestWebsiteCrawl.summary && (
                  <p className="mt-3 whitespace-pre-line text-[12px] leading-relaxed text-ink2">
                    {latestWebsiteCrawl.summary}
                  </p>
                )}
                {latestWebsiteCrawl.error && (
                  <p className="mt-3 text-[12px] leading-relaxed text-critical">
                    {latestWebsiteCrawl.error}
                  </p>
                )}
              </div>
            )}
            <div className="mt-4 space-y-2">
              {latestWebsitePages.map((page: any) => (
                <a
                  key={page.id}
                  href={page.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="line-clamp-1 text-sm font-medium text-ink">
                      {page.title || page.url}
                    </div>
                    <Badge tone="neutral">{page.pageType}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                    {page.description || page.textExcerpt || page.error}
                  </p>
                </a>
              ))}
              {!latestWebsiteCrawl && (
                <p className="text-sm leading-relaxed text-muted">
                  Noch kein Website-Scan fuer dieses Projekt gespeichert.
                </p>
              )}
            </div>
          </PortalCard>
            <PortalCard>
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
                    name="provider_claude"
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-copper)]"
                  />
                  Claude
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
                <label className="flex items-start gap-2 rounded-lg border border-hairline bg-bg p-3 text-[12px] leading-relaxed text-muted">
                  <input
                    name="confirmExternalAi"
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 accent-[var(--color-copper)]"
                  />
                  Ich bestätige, dass der redigierte Projektkontext an die
                  ausgewählten externen KI-Provider gesendet werden darf.
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
                {aiComparison.map((entry: any) => (
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
                            : [entry.raw.slice(0, 180)]).map((item: any) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-ink">Automation</div>
                        <ul className="mt-1 space-y-1">
                          {entry.automationIdeas.slice(0, 3).map((item: any) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-ink">Risiken</div>
                        <ul className="mt-1 space-y-1">
                          {entry.risks.slice(0, 3).map((item: any) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-ink">Nächste Schritte</div>
                        <ul className="mt-1 space-y-1">
                          {entry.nextActions.slice(0, 3).map((item: any) => (
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
              {bundle.aiInsights.map((insight: any) => (
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
            <PortalCard>
            <PortalSectionTitle
              eyebrow="Similarity Scan"
              title="Ähnliche Projekte"
            >
              Lokaler Vergleich über Branche, Probleme, Ziele und Chancen.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {similar.map((entry: any) => (
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
    </>
  );
}
