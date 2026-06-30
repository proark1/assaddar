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

export function BillingPanel({ ctx }: { ctx: AdminPanelContext }) {
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
                {changeRequests.map((request: any) => (
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
                    {offerRecommendation.deliverables.slice(0, 5).map((item: any) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-sm font-medium text-ink">Annahmen</div>
                  <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-muted">
                    {offerRecommendation.assumptions.slice(0, 5).map((item: any) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="text-sm font-medium text-ink">Noch klären</div>
                  <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-muted">
                    {offerRecommendation.nextQuestions.slice(0, 5).map((item: any) => (
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
              {bundle.invoices.map((invoice: any) => (
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
    </>
  );
}
