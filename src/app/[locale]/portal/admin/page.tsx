import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock3,
  CreditCard,
  Gauge,
  Search,
  Users,
} from "lucide-react";
import { createProjectAction } from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { buildAttentionItems } from "@/lib/portal/automation";
import { requireAdmin } from "@/lib/portal/auth";
import { listProjectBundlesForUser } from "@/lib/portal/store";
import {
  formatStage,
  formatStatus,
  projectStatuses,
} from "@/lib/portal/format";
import { buildAdminCommandCenter } from "@/lib/portal/operations";
import { consultingTemplates } from "@/lib/portal/templates";
import {
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  textareaClass,
} from "@/components/portal/chrome";
import { ProjectCreateSubmit } from "@/components/portal/project-create-submit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Portal | Assad Dar",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    q?: string;
    status?: string;
    health?: string;
    template?: string;
  }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const query = await searchParams;
  const projectQuery = query.q?.trim().toLowerCase() ?? "";
  const statusFilter = query.status ?? "all";
  const healthFilter = query.health ?? "all";
  const allBundles = await listProjectBundlesForUser(user);
  const attentionItems = allBundles.flatMap(buildAttentionItems);
  const commandCenter = buildAdminCommandCenter(allBundles);
  const selectedTemplateId =
    consultingTemplates.some((template) => template.id === query.template)
      ? query.template
      : "";
  const bundles = allBundles.filter((bundle) => {
    const matchesQuery =
      !projectQuery ||
      [
        bundle.project.name,
        bundle.project.summary,
        bundle.organization.name,
        bundle.organization.industry,
      ]
        .join(" ")
        .toLowerCase()
        .includes(projectQuery);
    const matchesStatus =
      statusFilter === "all" || bundle.project.status === statusFilter;
    const matchesHealth =
      healthFilter === "all" || bundle.project.health === healthFilter;

    return matchesQuery && matchesStatus && matchesHealth;
  });

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Consulting Cockpit"
      backHref={`/${safe}/portal`}
      actions={
        <>
          <Link
            href={`/${safe}/portal/admin/templates`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
          >
            <BookOpen className="h-4 w-4" />
            Templates
          </Link>
          <Link
            href={`/${safe}/portal/admin/customers`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
          >
            <Users className="h-4 w-4" />
            Kunden
          </Link>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-5">
          <PortalCard>
            <PortalSectionTitle
              eyebrow="Heute"
              title="Command Center"
            >
              Der schnelle Überblick darüber, wo Assad jetzt handeln,
              nachfassen oder ein Update veröffentlichen sollte.
            </PortalSectionTitle>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <Gauge className="h-4 w-4 text-copper" />
                <div className="mt-3 text-2xl font-medium text-ink">
                  {commandCenter.stats.riskyProjects}
                </div>
                <div className="text-sm text-muted">Riskante Projekte</div>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <Clock3 className="h-4 w-4 text-copper" />
                <div className="mt-3 text-2xl font-medium text-ink">
                  {commandCenter.stats.staleUpdates}
                </div>
                <div className="text-sm text-muted">Updates fällig</div>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <CreditCard className="h-4 w-4 text-copper" />
                <div className="mt-3 text-2xl font-medium text-ink">
                  {new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(commandCenter.stats.unpaidInvoiceAmount / 100)}
                </div>
                <div className="text-sm text-muted">Offen fakturiert</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {commandCenter.focusItems.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href={`/${safe}/portal/admin/projects/${item.projectId}`}
                  className="flex items-start justify-between gap-4 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                >
                  <div className="flex gap-3">
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        item.tone === "red" ? "text-critical" : "text-copper"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {item.title}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-ink2">
                        {item.body}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] font-medium text-copper">
                    {item.action}
                  </span>
                </Link>
              ))}
              {commandCenter.focusItems.length === 0 && (
                <p className="text-sm text-muted">
                  Keine dringenden Punkte erkannt.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle
              eyebrow="Heute"
              title="Needs Attention"
            >
              Automatisch erkannte Punkte, bei denen Assad nachfassen,
              erinnern oder den nächsten Beratungsschritt setzen sollte.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {attentionItems.slice(0, 8).map((item) => (
                <Link
                  key={item.id}
                  href={`/${safe}/portal/admin/projects/${item.projectId}`}
                  className="flex items-start gap-3 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                >
                  <AlertTriangle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      item.tone === "red" ? "text-critical" : "text-copper"
                    }`}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium text-ink">
                        {item.title}
                      </div>
                      <Badge tone={item.tone}>{item.tone}</Badge>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink2">
                      {item.body}
                    </p>
                  </div>
                </Link>
              ))}
              {attentionItems.length === 0 && (
                <p className="text-sm text-muted">
                  Keine dringenden Punkte erkannt.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle
              eyebrow="Playbook Library"
              title="Industrie-Templates für schnelle Beratung"
            >
              Jede Vorlage bringt Intake-Felder, Diagnosefragen, Quick Wins,
              Aufgaben, Meilensteine und Meeting-Guidance für den Admin mit.
            </PortalSectionTitle>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {consultingTemplates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-lg border border-hairline bg-bg p-4"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {template.label}
                      </div>
                      <div className="mt-1 text-[12px] text-copper">
                        {template.category}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink2">
                        {template.bestFor}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle
              eyebrow="Projektübersicht"
              title="Suchen und filtern"
            >
              Schneller Zugriff auf aktive, pausierte oder abgeschlossene
              Mandate.
            </PortalSectionTitle>
            <form
              action={`/${safe}/portal/admin`}
              method="get"
              className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_150px_auto]"
            >
              <input
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Projekt, Kunde, Branche..."
                className={fieldClass}
              />
              <select
                name="status"
                defaultValue={statusFilter}
                className={fieldClass}
              >
                <option value="all">Alle Status</option>
                {projectStatuses.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
              <select
                name="health"
                defaultValue={healthFilter}
                className={fieldClass}
              >
                <option value="all">Alle Health</option>
                <option value="green">Green</option>
                <option value="amber">Amber</option>
                <option value="red">Red</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <Search className="h-4 w-4" />
                Filtern
              </button>
            </form>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
              <span>
                {bundles.length} von {allBundles.length} Projekten
              </span>
              {(projectQuery || statusFilter !== "all" || healthFilter !== "all") && (
                <Link
                  href={`/${safe}/portal/admin`}
                  className="text-copper hover:underline"
                >
                  Filter zurücksetzen
                </Link>
              )}
            </div>
          </PortalCard>

          {bundles.map((bundle) => (
            <Link
              key={bundle.project.id}
              href={`/${safe}/portal/admin/projects/${bundle.project.id}`}
              className="group block rounded-lg border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-copper"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="copper">{formatStage(bundle.project.asdarStage)}</Badge>
                  <Badge>{formatStatus(bundle.project.status)}</Badge>
                  <Badge
                    tone={
                      bundle.project.health === "red"
                        ? "red"
                        : bundle.project.health === "amber"
                          ? "amber"
                          : "green"
                    }
                  >
                    Health {bundle.project.health}
                  </Badge>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-copper">
                  Bearbeiten
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <h2 className="mt-4 text-xl font-medium text-ink">
                {bundle.project.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {bundle.organization.name} · {bundle.organization.industry}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink2">
                {bundle.project.summary || "Noch keine Zusammenfassung."}
              </p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
                <div>
                  <div className="font-medium text-ink">
                    {bundle.customerUsers.length}
                  </div>
                  <div className="text-muted">Kunden</div>
                </div>
                <div>
                  <div className="font-medium text-ink">
                    {
                      bundle.updates.filter(
                        (update) => !update.title.startsWith("Audit:"),
                      ).length
                    }
                  </div>
                  <div className="text-muted">Updates</div>
                </div>
                <div>
                  <div className="font-medium text-ink">{bundle.files.length}</div>
                  <div className="text-muted">Dateien</div>
                </div>
                <div>
                  <div className="font-medium text-ink">
                    {bundle.invoices.length}
                  </div>
                  <div className="text-muted">Rechnungen</div>
                </div>
              </div>
            </Link>
          ))}
          {bundles.length === 0 && (
            <PortalCard>
              <p className="text-sm text-muted">
                Keine Projekte passen zu diesen Filtern.
              </p>
            </PortalCard>
          )}
        </div>

        <PortalCard>
          <PortalSectionTitle eyebrow="Neu" title="Projekt anlegen">
            Ein Kunde muss zuerst registriert sein. Danach kann die E-Mail hier
            zugeordnet werden.
          </PortalSectionTitle>
          {query.error === "company" && (
            <p className="mt-4 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Bitte mindestens den Unternehmensnamen eintragen.
            </p>
          )}
          <form action={createProjectAction} className="mt-5 space-y-4">
            <input type="hidden" name="locale" value={safe} />
            <div>
              <label className="mb-1.5 block text-sm text-ink2">
                Industrie-Template
              </label>
              <select
                name="templateId"
                defaultValue={selectedTemplateId}
                className={fieldClass}
              >
                <option value="">Kein Template / manuell</option>
                {consultingTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Füllt ASDAR Intake, erste Aufgaben, Meilensteine und ein
                Kunden-Kickoff-Update vor.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink2">
                Unternehmen
              </label>
              <input name="company" required className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink2">Branche</label>
              <input name="industry" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink2">
                Projektname
              </label>
              <input name="projectName" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink2">
                Kunden-E-Mail
              </label>
              <input name="customerEmail" type="email" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink2">
                Kurzbeschreibung
              </label>
              <textarea name="summary" className={textareaClass} />
            </div>
            <ProjectCreateSubmit />
          </form>
        </PortalCard>
      </div>
    </PortalShell>
  );
}
