import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  Bell,
  BrainCircuit,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  FileUp,
  Lightbulb,
  MessagesSquare,
  Plus,
  Send,
  Sparkles,
  UserPlus,
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
  generateProposalAction,
  generateProjectBriefAction,
  inviteCustomerAction,
  addMeetingNoteAction,
  runAiScanAction,
  saveKnowledgeSnapshotAction,
  sendProjectReminderAction,
  updateIntelligenceAction,
  updateInvoiceStatusAction,
  updateMilestoneStatusAction,
  updateProjectOverviewAction,
  updateTaskStatusAction,
} from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { buildConsultantGuidance, findSimilarProjects } from "@/lib/portal/ai";
import {
  isApproval,
  isCustomerComment,
  isCustomerIntake,
  isReminder,
  isStructuredUpdate,
} from "@/lib/portal/automation";
import { getProjectBundle, readStore } from "@/lib/portal/store";
import {
  consultingTemplates,
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
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  textareaClass,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projekt Admin | Assad Dar Portal",
  robots: { index: false, follow: false },
};

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
  searchParams: Promise<{ saved?: string; assigned?: string; error?: string }>;
}) {
  const { locale, projectId } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const store = await readStore();
  const bundle = getProjectBundle(store, projectId);
  if (!bundle) notFound();

  const query = await searchParams;
  const guidance = buildConsultantGuidance(bundle);
  const similar = findSimilarProjects(store, bundle);
  const template = matchConsultingTemplate(bundle.organization.industry);
  const auditUpdates = bundle.updates.filter((update) =>
    update.title.startsWith("Audit:"),
  );
  const comments = bundle.updates.filter((update) =>
    isCustomerComment(update.title),
  );
  const approvals = bundle.updates.filter((update) => isApproval(update.title));
  const reminders = bundle.updates.filter((update) => isReminder(update.title));
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

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow={`${bundle.organization.name} · Admin`}
      title={bundle.project.name}
      backHref={`/${safe}/portal/admin`}
      actions={
        <Link
          href={`/${safe}/portal/projects/${bundle.project.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
        >
          <Eye className="h-4 w-4" />
          Kundenansicht
        </Link>
      }
    >
      {(query.saved || query.assigned || query.error) && (
        <div className="mb-6 rounded-lg border border-copper/30 bg-copper/10 px-4 py-3 text-sm text-ink">
          {query.saved && "Gespeichert."}
          {query.assigned === "1" && " Kunde wurde zugeordnet."}
          {query.assigned === "0" &&
            " Kein passender registrierter Kunde gefunden."}
          {query.error === "file" && " Datei konnte nicht hochgeladen werden."}
          {query.error === "ai" &&
            " AI Scan konnte nicht gespeichert werden. Prüfen Sie Provider-Key und Modell."}
          {query.error === "archive" &&
            " Zum Archivieren bitte ARCHIVIEREN exakt eingeben."}
          {query.error === "comment" && " Bitte einen Kommentar eintragen."}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <PortalCard>
            <PortalSectionTitle
              eyebrow="Projektsteuerung"
              title="Öffentliche Projektbasis"
            >
              Diese Felder sind Grundlage für Dashboard, Kundenansicht und
              interne ASDAR-Guidance.
            </PortalSectionTitle>
            <form action={updateProjectOverviewAction} className="mt-5 space-y-4">
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
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    name="confirmation"
                    placeholder="ARCHIVIEREN"
                    className={fieldClass}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-critical/40 px-4 py-2.5 text-sm font-medium text-critical transition-colors hover:bg-critical/10"
                  >
                    <Archive className="h-4 w-4" />
                    Archivieren
                  </button>
                </div>
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

          <PortalCard>
            <PortalSectionTitle
              eyebrow="Kundenkommunikation"
              title="Update veröffentlichen"
            >
              Interne Updates bleiben privat. Kundenupdates erscheinen direkt
              im Kundenportal.
            </PortalSectionTitle>
            <form action={addUpdateAction} className="mt-5 space-y-4">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm text-ink2">Titel</label>
                  <input name="title" className={fieldClass} />
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
                <textarea name="body" className={textareaClass} />
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
                    <Badge tone={update.visibility === "customer" ? "green" : "neutral"}>
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
              eyebrow="Nachrichten"
              title="Kundenkommentare"
            >
              Kurze Rueckfragen und Antworten, ohne daraus ein formales
              Statusupdate zu machen.
            </PortalSectionTitle>
            <form action={addProjectCommentAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input name="topic" placeholder="Thema" className={fieldClass} />
              <textarea
                name="message"
                required
                placeholder="Antwort oder Rueckfrage"
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
                      <Badge>{comment.title.replace(/^Kommentar:\s*/, "")}</Badge>
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
        </div>

        <aside className="space-y-6">
          <PortalCard>
            <PortalSectionTitle
              eyebrow="Industry Playbook"
              title="Template fuer dieses Projekt"
            >
              Branchenbezogene Diagnose, Quick Wins und ASDAR-Schritte fuer
              den Beratungsablauf.
            </PortalSectionTitle>
            <form action={applyConsultingTemplateAction} className="mt-5 space-y-3">
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
                  Meeting-Moves fuer Assad
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

          <PortalCard>
            <PortalSectionTitle
              eyebrow="Branchen-ASDAR"
              title="Phasenplan aus dem Template"
            />
            <div className="mt-5 space-y-4">
              {asdarStages.map((stage) => (
                <div key={stage.value} className="rounded-lg border border-hairline bg-bg p-3">
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

          <PortalCard>
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
                    <h3 className="text-sm font-medium text-ink">{item.title}</h3>
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
                Meeting-Fokus und Quick-Win-Ideen aus dem aktuellen Projektstand.
              </p>
              <div className="mt-3 space-y-2 text-sm text-ink2">
                <label className="flex items-center gap-2">
                  <input
                    name="publishSummary"
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-copper)]"
                  />
                  Kundensichere Zusammenfassung veroeffentlichen
                </label>
                <label className="flex items-center gap-2">
                  <input
                    name="createActions"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 accent-[var(--color-copper)]"
                  />
                  Quick-Win-Aufgaben fuer Assad anlegen
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

          <PortalCard>
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

          <PortalCard>
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

          <PortalCard>
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

          <PortalCard>
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
                <p className="text-sm text-muted">Noch kein Kunde zugeordnet.</p>
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

          <PortalCard>
            <PortalSectionTitle eyebrow="Dateien" title="Upload" />
            <form
              action={addFileAction}
              encType="multipart/form-data"
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
              {bundle.files.map((file) => (
                <a
                  key={file.id}
                  href={`/api/portal/files/${file.id}`}
                  className="flex items-start gap-3 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
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
                    </div>
                    <div className="mt-1 text-[12px] text-muted">
                      {file.visibility} · {Math.ceil(file.size / 1024)} KB
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Aufgaben" title="Tasks" />
            <form action={addTaskAction} className="mt-5 space-y-3">
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <input name="title" placeholder="Aufgabe" className={fieldClass} />
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
                      <HiddenProjectFields locale={safe} projectId={projectId} />
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
                        <HiddenProjectFields locale={safe} projectId={projectId} />
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
                      <HiddenProjectFields locale={safe} projectId={projectId} />
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

          <PortalCard>
            <PortalSectionTitle eyebrow="Rechnungen" title="Payment" />
            <form action={generateProposalAction} className="mt-5 space-y-3">
              <div className="rounded-lg border border-copper/25 bg-copper/10 p-3">
                <div className="text-sm font-medium text-ink">
                  Proposal Generator
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                  Erstellt ein kunden sichtbares Angebot als Datei und optional
                  eine Rechnung.
                </p>
              </div>
              <HiddenProjectFields locale={safe} projectId={projectId} />
              <textarea
                name="scope"
                placeholder="Leistungsumfang"
                className={textareaClass}
              />
              <textarea
                name="outcomes"
                placeholder="Ergebnisse / Deliverables"
                className={textareaClass}
              />
              <input
                name="timeline"
                placeholder="Zeitrahmen"
                className={fieldClass}
              />
              <input name="amount" placeholder="2900,00" className={fieldClass} />
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
                <input name="amount" placeholder="2900,00" className={fieldClass} />
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
                      <HiddenProjectFields locale={safe} projectId={projectId} />
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
                    {invoice.status !== "paid" && invoice.status !== "draft" && (
                      <form action={sendProjectReminderAction}>
                        <HiddenProjectFields locale={safe} projectId={projectId} />
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
