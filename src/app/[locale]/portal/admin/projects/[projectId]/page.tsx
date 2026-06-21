import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileUp,
  Lightbulb,
  Plus,
  Send,
  UserPlus,
} from "lucide-react";
import {
  addFileAction,
  addInvoiceAction,
  addMilestoneAction,
  addTaskAction,
  addUpdateAction,
  assignCustomerAction,
  updateIntelligenceAction,
  updateProjectOverviewAction,
} from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { buildConsultantGuidance, findSimilarProjects } from "@/lib/portal/ai";
import { getProjectBundle, readStore } from "@/lib/portal/store";
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
              {bundle.updates.map((update) => (
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
            </div>
          </PortalCard>
        </div>

        <aside className="space-y-6">
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
                    <div className="text-sm font-medium text-ink">{file.name}</div>
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
                  <div className="font-medium text-ink">{task.title}</div>
                  <div className="mt-1 text-[12px] text-muted">
                    {task.owner} · {task.status} · {formatDate(task.dueDate)} ·{" "}
                    {task.visibleToCustomer ? "Kunde" : "Intern"}
                  </div>
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
                  <div className="font-medium text-ink">{milestone.title}</div>
                  <div className="mt-1 text-[12px] text-muted">
                    {milestone.status} · {formatDate(milestone.dueDate)} ·{" "}
                    {milestone.visibleToCustomer ? "Kunde" : "Intern"}
                  </div>
                </div>
              ))}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Rechnungen" title="Payment" />
            <form action={addInvoiceAction} className="mt-5 space-y-3">
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
                </div>
              ))}
            </div>
          </PortalCard>
        </aside>
      </div>
    </PortalShell>
  );
}
