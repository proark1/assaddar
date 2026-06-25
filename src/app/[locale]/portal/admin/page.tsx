import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  FolderKanban,
  Gauge,
  History,
  PencilLine,
  Search,
  Users,
} from "lucide-react";
import {
  createProjectAction,
  runPortalAutomationsAction,
} from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { buildAttentionItems } from "@/lib/portal/automation";
import { buildAutomationOpportunities } from "@/lib/portal/automation-rules";
import { requireAdmin } from "@/lib/portal/auth";
import { listProjectBundlesForUser, readStore } from "@/lib/portal/store";
import {
  formatDate,
  formatStage,
  formatStatus,
  projectStatuses,
} from "@/lib/portal/format";
import {
  buildAdminCommandCenter,
  buildAdminNotificationCenter,
  buildAdminProjectActions,
  buildLeadPipeline,
  buildProjectHealthScore,
  buildProjectTimeline,
} from "@/lib/portal/operations";
import { effectiveConsultingTemplates } from "@/lib/portal/templates";
import {
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  textareaClass,
} from "@/components/portal/chrome";
import { AdminCommandPalette } from "@/components/portal/admin-command-palette";
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
    saved?: string;
    tasks?: string;
    insights?: string;
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
  const portalStore = await readStore();
  const consultingTemplates = effectiveConsultingTemplates(
    portalStore.templateOverrides,
  );
  const attentionItems = allBundles.flatMap(buildAttentionItems);
  const automationOpportunities = buildAutomationOpportunities(allBundles);
  const commandCenter = buildAdminCommandCenter(allBundles);
  const notifications = buildAdminNotificationCenter(allBundles);
  const leadPipeline = buildLeadPipeline(allBundles);
  const commands = [
    {
      label: "Automationen ausführen",
      href: `/${safe}/portal/admin#automation`,
      group: "Workflow",
      keywords: "automation next best action task reminder draft",
    },
    {
      label: "Heute öffnen",
      href: `/${safe}/portal/admin/today`,
      group: "Workflow",
      keywords: "today inbox action queue notification",
    },
    {
      label: "Pipeline öffnen",
      href: `/${safe}/portal/admin/pipeline`,
      group: "Workflow",
      keywords: "kanban status projekt flow",
    },
    {
      label: "Draft Review öffnen",
      href: `/${safe}/portal/admin/drafts`,
      group: "Workflow",
      keywords: "updates kommunikation meeting proposal",
    },
    {
      label: "Kunden verwalten",
      href: `/${safe}/portal/admin/customers`,
      group: "Admin",
      keywords: "kunden account login zugriff",
    },
    {
      label: "Templates bearbeiten",
      href: `/${safe}/portal/admin/templates`,
      group: "Admin",
      keywords: "branchen playbook industry",
    },
    ...allBundles.map((bundle) => ({
      label: `${bundle.organization.name} öffnen`,
      href: `/${safe}/portal/admin/projects/${bundle.project.id}`,
      group: "Projekt",
      keywords: [
        bundle.project.name,
        bundle.organization.industry,
        bundle.project.status,
        bundle.project.asdarStage,
      ].join(" "),
    })),
  ];
  const latestActivity = allBundles
    .flatMap((bundle) =>
      buildProjectTimeline(bundle)
        .slice(0, 4)
        .map((item) => ({
          ...item,
          organizationName: bundle.organization.name,
        })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);
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
      activeNav="admin"
      backHref={`/${safe}/portal`}
      actions={
        <>
          <AdminCommandPalette commands={commands} />
          <Link
            href={`/${safe}/portal/admin/today`}
            className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
          >
            <Clock3 className="h-4 w-4" />
            Heute
          </Link>
          <Link
            href={`/${safe}/portal/admin/pipeline`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
          >
            <FolderKanban className="h-4 w-4" />
            Pipeline
          </Link>
          <Link
            href={`/${safe}/portal/admin/drafts`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
          >
            <PencilLine className="h-4 w-4" />
            Drafts
          </Link>
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
      {query.saved === "automation" && (
        <div className="mb-6 rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
          Automation abgeschlossen: {query.tasks ?? "0"} Aufgaben und{" "}
          {query.insights ?? "0"} Insights vorbereitet.
        </div>
      )}
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
            {commandCenter.focusItems[0] && (
              <Link
                href={`/${safe}/portal/admin/projects/${commandCenter.focusItems[0].projectId}?view=${commandCenter.focusItems[0].action === "Reminder senden" ? "communication" : "guidance"}`}
                className={`mt-5 block rounded-lg border p-4 transition-colors hover:border-copper ${
                  commandCenter.focusItems[0].tone === "red"
                    ? "border-critical/30 bg-critical/10"
                    : "border-copper/30 bg-copper/10"
                }`}
              >
                <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                  Heute zuerst
                </div>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-ink">
                      {commandCenter.focusItems[0].title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink2">
                      {commandCenter.focusItems[0].body}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-copper">
                    {commandCenter.focusItems[0].action}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <FolderKanban className="h-4 w-4 text-copper" />
                <div className="mt-3 text-2xl font-medium text-ink">
                  {commandCenter.stats.activeProjects}
                </div>
                <div className="text-sm text-muted">Aktive Projekte</div>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <Gauge className="h-4 w-4 text-copper" />
                <div className="mt-3 text-2xl font-medium text-ink">
                  {commandCenter.stats.riskyProjects}
                </div>
                <div className="text-sm text-muted">Riskante Projekte</div>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <AlertTriangle className="h-4 w-4 text-copper" />
                <div className="mt-3 text-2xl font-medium text-ink">
                  {commandCenter.stats.missingIntake}
                </div>
                <div className="text-sm text-muted">Intakes offen</div>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <Clock3 className="h-4 w-4 text-copper" />
                <div className="mt-3 text-2xl font-medium text-ink">
                  {commandCenter.stats.staleUpdates}
                </div>
                <div className="text-sm text-muted">Updates fällig</div>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <Users className="h-4 w-4 text-copper" />
                <div className="mt-3 text-2xl font-medium text-ink">
                  {commandCenter.stats.overdueCustomerTasks}
                </div>
                <div className="text-sm text-muted">Kunden überfällig</div>
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

          <PortalCard id="automation" className="border-copper/30 bg-copper/10">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <PortalSectionTitle
                eyebrow="Automation"
                title="Assad Assist laufen lassen"
              >
                Prüft alle aktiven Projekte und erzeugt interne Aufgaben,
                Diagnosis-Insights, Proposal-Hinweise, Rechnungsnachfassungen
                und Update-Entwürfe. Nichts Kritisches wird automatisch an
                Kunden gesendet.
              </PortalSectionTitle>
              <form action={runPortalAutomationsAction}>
                <input type="hidden" name="locale" value={safe} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/${safe}/portal/admin`}
                />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi lg:w-auto"
                >
                  <Bot className="h-4 w-4" />
                  Automationen ausführen
                </button>
              </form>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
                <div className="text-xl font-medium text-ink">
                  {automationOpportunities.length}
                </div>
                <div className="text-[12px] text-muted">erkannte Chancen</div>
              </div>
              <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
                <div className="text-xl font-medium text-ink">
                  {
                    automationOpportunities.filter((item) => item.tone === "red")
                      .length
                  }
                </div>
                <div className="text-[12px] text-muted">dringend</div>
              </div>
              <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
                <div className="text-xl font-medium text-ink">
                  {
                    automationOpportunities.filter(
                      (item) => item.category === "customer_update",
                    ).length
                  }
                </div>
                <div className="text-[12px] text-muted">Update-Entwürfe</div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {automationOpportunities.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/${safe}/portal/admin/projects/${item.projectId}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-hairline bg-surface p-3 transition-colors hover:border-copper"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          item.tone === "red"
                            ? "red"
                            : item.tone === "green"
                              ? "green"
                              : "copper"
                        }
                      >
                        {item.category}
                      </Badge>
                      <div className="text-sm font-medium text-ink">
                        {item.title}
                      </div>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                </Link>
              ))}
              {automationOpportunities.length === 0 && (
                <p className="text-sm text-muted">
                  Keine neuen Automationen erkannt.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Lead CRM" title="Neue Anfragen">
              Kontakte aus der Website werden automatisch als interne
              Lead-Projekte angelegt, damit Qualifizierung, Erstgespräch und
              Follow-up im gleichen System bleiben.
            </PortalSectionTitle>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {leadPipeline.slice(0, 6).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/${safe}/portal/admin/projects/${lead.projectId}?view=setup`}
                  className="rounded-lg border border-hairline bg-bg p-4 transition-colors hover:border-copper"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {lead.organizationName}
                      </div>
                      <div className="mt-1 text-[12px] text-muted">
                        {lead.contactName ?? "Kontakt offen"}
                        {lead.email ? ` · ${lead.email}` : ""}
                      </div>
                    </div>
                    <Badge tone={lead.score >= 70 ? "green" : "amber"}>
                      {lead.score}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink2">
                    {lead.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-muted">
                    <span>{lead.source}</span>
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </Link>
              ))}
              {leadPipeline.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine Website-Leads im Portal.
                </p>
              )}
            </div>
          </PortalCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <PortalCard>
              <PortalSectionTitle
                eyebrow="Inbox"
                title="Notification Center"
              >
                Neue Kundensignale, offene Rechnungen und Projekte, die ein
                sichtbares Update brauchen.
              </PortalSectionTitle>
              <div className="mt-5 space-y-3">
                {notifications.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={`/${safe}/portal/admin/projects/${item.projectId}?view=${item.hrefView}`}
                    className={`block rounded-lg border p-3 transition-colors hover:border-copper ${
                      item.tone === "red"
                        ? "border-critical/30 bg-critical/10"
                        : item.tone === "green"
                          ? "border-success/25 bg-success/10"
                          : "border-hairline bg-bg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        {item.tone === "green" ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        ) : (
                          <Bell
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              item.tone === "red" ? "text-critical" : "text-copper"
                            }`}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-ink">
                            {item.title}
                          </div>
                          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                            {item.body}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[12px] font-medium text-copper">
                        {item.cta}
                      </span>
                    </div>
                  </Link>
                ))}
                {notifications.length === 0 && (
                  <p className="text-sm text-muted">
                    Keine neuen Benachrichtigungen.
                  </p>
                )}
              </div>
            </PortalCard>

            <PortalCard>
              <PortalSectionTitle
                eyebrow="Timeline"
                title="Letzte Aktivität"
              >
                Der schnellste Blick darauf, wo in den Projekten zuletzt etwas
                passiert ist.
              </PortalSectionTitle>
              <div className="mt-5 space-y-3">
                {latestActivity.map((item) => (
                  <Link
                    key={`${item.projectId}-${item.type}-${item.id}`}
                    href={`/${safe}/portal/admin/projects/${item.projectId}`}
                    className="flex gap-3 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                  >
                    <History className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={item.tone === "red" ? "red" : "neutral"}>
                          {item.type}
                        </Badge>
                        <span className="text-[12px] text-muted">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-ink">
                        {item.organizationName}: {item.title}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                        {item.body}
                      </p>
                    </div>
                  </Link>
                ))}
                {latestActivity.length === 0 && (
                  <p className="text-sm text-muted">
                    Noch keine Aktivität vorhanden.
                  </p>
                )}
              </div>
            </PortalCard>
          </div>

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

          {bundles.map((bundle) => {
            const nextBestAction = buildAdminProjectActions(bundle)[0];
            const healthScore = buildProjectHealthScore(bundle);
            return (
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
                      healthScore.tone === "red"
                        ? "red"
                        : healthScore.tone === "amber"
                          ? "amber"
                          : "green"
                    }
                  >
                    Health {healthScore.score}
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
              <div className="mt-4 rounded-lg border border-hairline bg-bg p-3 text-sm">
                <div className="font-medium text-ink">Nächster Schritt</div>
                <p className="mt-1 leading-relaxed text-muted">
                  {bundle.project.nextStep ||
                    "Noch keinen nächsten Schritt definiert."}
                </p>
              </div>
              {nextBestAction && (
                <div
                  className={`mt-3 rounded-lg border p-3 text-sm ${
                    nextBestAction.tone === "red"
                      ? "border-critical/30 bg-critical/10"
                      : nextBestAction.tone === "green"
                        ? "border-success/25 bg-success/10"
                        : "border-copper/25 bg-copper/10"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-ink">
                      Next Best Action
                    </div>
                    <span className="text-[12px] font-medium text-copper">
                      {nextBestAction.cta}
                    </span>
                  </div>
                  <p className="mt-1 leading-relaxed text-muted">
                    {nextBestAction.title} · {nextBestAction.body}
                  </p>
                  {nextBestAction.reason && (
                    <p className="mt-2 text-[12px] leading-relaxed text-muted">
                      Warum: {nextBestAction.reason}
                    </p>
                  )}
                </div>
              )}
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
            );
          })}
          {bundles.length === 0 && (
            <PortalCard>
              <p className="text-sm text-muted">
                Keine Projekte passen zu diesen Filtern.
              </p>
            </PortalCard>
          )}
        </div>

        <PortalCard>
          <PortalSectionTitle eyebrow="Neu" title="Projekt in 4 Schritten anlegen">
            Der Wizard führt vom Kunden über das Branchen-Template zum ersten
            messbaren Pilot. Danach sind Aufgaben, Meilensteine und ein
            Kundenupdate vorbereitet.
          </PortalSectionTitle>
          {query.error === "company" && (
            <p className="mt-4 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Bitte mindestens den Unternehmensnamen eintragen.
            </p>
          )}
          <div className="mt-5 grid grid-cols-4 gap-2 text-center text-[11px] text-muted">
            {["Kunde", "Template", "Problem", "Start"].map((step, index) => (
              <div key={step} className="rounded-md border border-hairline bg-bg px-2 py-2">
                <span className="font-mono text-copper">{index + 1}</span>{" "}
                {step}
              </div>
            ))}
          </div>
          <form action={createProjectAction} className="mt-5 space-y-5">
            <input type="hidden" name="locale" value={safe} />
            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                Schritt 1
              </div>
              <div className="mt-2 text-sm font-medium text-ink">
                Kunde und Unternehmen
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Ein Kunde kann direkt eingeladen oder später zugeordnet werden.
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Unternehmen
                  </label>
                  <input name="company" required className={fieldClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Kunden-E-Mail
                  </label>
                  <input
                    name="customerEmail"
                    type="email"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Kundenname
                  </label>
                  <input
                    name="customerName"
                    placeholder="Name für Einladung und Portal"
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                Schritt 2
              </div>
              <label className="mt-2 block text-sm font-medium text-ink">
                Branche und Industrie-Template
              </label>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Das Template füllt später Intake, Tasks, Meilensteine und
                Meeting-Fragen vor.
              </p>
              <input
                name="industry"
                placeholder="Branche, falls kein Template passt"
                className={`${fieldClass} mt-3`}
              />
              <select
                name="templateId"
                defaultValue={selectedTemplateId}
                className={`${fieldClass} mt-2`}
              >
                <option value="">Kein Template / manuell</option>
                {consultingTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                Schritt 3
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Projektname
                  </label>
                  <input name="projectName" className={fieldClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Kurzbeschreibung
                  </label>
                  <textarea name="summary" className={textareaClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Wichtigster Prozess
                  </label>
                  <input
                    name="setupProcess"
                    placeholder="z.B. Anfrage bis Angebot"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Hauptengpass
                  </label>
                  <textarea
                    name="setupBottleneck"
                    placeholder="Wo verliert das Team Zeit, Qualität oder Transparenz?"
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Messbares Ziel
                  </label>
                  <input
                    name="setupMetric"
                    placeholder="z.B. 30% weniger manuelle Angebotszeit"
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-copper/25 bg-copper/10 p-4">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                Schritt 4
              </div>
              <div className="mt-2 text-sm font-medium text-ink">
                Start vorbereiten
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                Diese Felder erzeugen direkt interne Beratungshinweise,
                Kundenupdate, Aufgabe und Meilenstein.
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Entscheider und Stakeholder
                  </label>
                  <textarea
                    name="setupDecisionMakers"
                    placeholder="Geschäftsführung, Fachbereich, IT, Power User..."
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Erster Pilot
                  </label>
                  <textarea
                    name="setupPilot"
                    placeholder="Welcher kleine Pilot soll zuerst vorbereitet werden?"
                    className={textareaClass}
                  />
                </div>
              </div>
            </div>
            <ProjectCreateSubmit />
          </form>
        </PortalCard>
      </div>
    </PortalShell>
  );
}
