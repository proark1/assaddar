import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  FileText,
  FolderKanban,
  WalletCards,
} from "lucide-react";
import { isLocale, type Locale } from "@/content";
import { requireUser } from "@/lib/portal/auth";
import { formatCurrency, formatStage, formatStatus } from "@/lib/portal/format";
import {
  getPortalDashboardViewModel,
  type PortalDashboardViewModel,
} from "@/lib/portal/view-models";
import {
  Badge,
  EmptyState,
  PortalCard,
  PortalShell,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal | Assad Dar",
  robots: { index: false, follow: false },
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Portal dashboard data timed out.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireUser(safe);
  let dashboard: PortalDashboardViewModel = {
    bundles: [],
    openInvoices: [],
    customerOpenTasks: [],
    customerNextActions: [],
    openInvoiceTotal: 0,
  };
  let loadError = false;

  try {
    dashboard = await withTimeout(getPortalDashboardViewModel(user), 8000);
  } catch {
    loadError = true;
  }

  const dashboardHref = dashboard.dashboardBundle
    ? `/${safe}/portal/projects/${dashboard.dashboardBundle.project.id}`
    : `/${safe}/portal`;

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow={user.role === "admin" ? "Admin-Workspace" : "Kundenportal"}
      activeNav="dashboard"
      title={
        user.role === "admin"
          ? "Projektübersicht"
          : "Ihre Projektübersicht"
      }
      actions={
        user.role === "admin" ? (
          <Link
            href={`/${safe}/portal/admin/today`}
            className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
          >
            <FolderKanban className="h-4 w-4" />
            Heute öffnen
          </Link>
        ) : null
      }
    >
      {user.role === "admin" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <PortalCard>
            <div className="flex items-center gap-3">
              <FolderKanban className="h-5 w-5 text-copper" />
              <div>
                <div className="text-2xl font-medium text-ink">
                  {dashboard.bundles.length}
                </div>
                <div className="text-sm text-muted">Projekte</div>
              </div>
            </div>
          </PortalCard>
          <PortalCard>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-copper" />
              <div>
                <div className="text-2xl font-medium text-ink">
                  {dashboard.customerOpenTasks.length}
                </div>
                <div className="text-sm text-muted">Offene Aufgaben</div>
              </div>
            </div>
          </PortalCard>
          <PortalCard>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-copper" />
              <div>
                <div className="text-2xl font-medium text-ink">
                  {formatCurrency(
                    dashboard.openInvoices.reduce(
                      (sum, invoice) => sum + invoice.amountCents,
                      0,
                    ),
                  )}
                </div>
                <div className="text-sm text-muted">Offene Rechnungen</div>
              </div>
            </div>
          </PortalCard>
        </div>
      ) : (
        <PortalCard className="border-copper/25 bg-copper/10">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-start">
            <div className="min-w-0">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                Heute im Portal
              </div>
              <h2 className="mt-2 text-xl font-medium text-ink">
                {dashboard.primaryCustomerAction?.action.title ??
                  "Aktuell ist nichts von Ihnen offen"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {dashboard.primaryCustomerAction?.action.body ??
                  "Assad arbeitet weiter am Projekt. Sie können Status, Updates, Dateien und Rechnungen jederzeit öffnen."}
              </p>
              <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row">
                <Link
                  href={
                    dashboard.primaryCustomerAction
                      ? `/${safe}/portal/projects/${dashboard.primaryCustomerAction.bundle.project.id}?view=${dashboard.primaryCustomerAction.action.hrefView}`
                      : dashboardHref
                  }
                  data-analytics-event="customer_next_action_click"
                  data-analytics-label={dashboard.primaryCustomerAction?.action.id}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-3 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                >
                  {dashboard.primaryCustomerAction?.action.cta ?? "Projekt öffnen"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={
                    dashboard.dashboardBundle
                      ? `/${safe}/portal/projects/${dashboard.dashboardBundle.project.id}?view=overview`
                      : `/${safe}/portal`
                  }
                  data-analytics-event="customer_status_click"
                  data-analytics-label={dashboard.dashboardBundle?.project.id}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                >
                  Status ansehen
                </Link>
              </div>
              {dashboard.customerNextActions.length > 1 && (
                <div className="mt-6 min-w-0 rounded-lg border border-hairline bg-surface p-4">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                    Danach
                  </div>
                  <div className="mt-3 grid min-w-0 gap-2">
                    {dashboard.customerNextActions.slice(1, 3).map(({ bundle, action }) => (
                      <Link
                        key={`${bundle.project.id}-${action.id}`}
                        href={`/${safe}/portal/projects/${bundle.project.id}?view=${action.hrefView}`}
                        data-analytics-event="customer_next_action_click"
                        data-analytics-label={action.id}
                        className="flex w-full min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden rounded-md border border-hairline bg-bg px-3 py-2 text-sm transition-colors hover:border-copper"
                      >
                        <span className="min-w-0 truncate text-ink2">
                          {action.title}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-copper" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid min-w-0 gap-3">
              <Link
                href={dashboardHref}
                  className="min-w-0 rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
              >
                <FolderKanban className="h-4 w-4 text-copper" />
                <div className="mt-3 text-sm font-medium text-ink">
                  Projektstatus
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {dashboard.dashboardBundle
                    ? `${formatStage(dashboard.dashboardBundle.project.asdarStage)} · ${formatStatus(dashboard.dashboardBundle.project.status)}`
                    : "Noch kein Projekt zugeordnet"}
                </p>
              </Link>
              <Link
                href={
                  dashboard.nextAppointment
                    ? `/${safe}/portal/projects/${dashboard.nextAppointment.bundle.project.id}?view=overview`
                    : `/${safe}/termin`
                }
                  className="min-w-0 rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
              >
                <CalendarDays className="h-4 w-4 text-copper" />
                <div className="mt-3 text-sm font-medium text-ink">
                  Nächster Termin
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                  {dashboard.nextAppointment?.update.body || "Termin buchen oder abstimmen."}
                </p>
              </Link>
              <Link
                href={
                  dashboard.dashboardBundle
                    ? `/${safe}/portal/projects/${dashboard.dashboardBundle.project.id}?view=files`
                    : `/${safe}/portal`
                }
                  className="min-w-0 rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
              >
                <WalletCards className="h-4 w-4 text-copper" />
                <div className="mt-3 text-sm font-medium text-ink">
                  Rechnungen
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {formatCurrency(dashboard.openInvoiceTotal)} offen
                </p>
              </Link>
            </div>
          </div>
        </PortalCard>
      )}

      <div className="mt-8">
        {loadError ? (
          <EmptyState title="Portal-Daten konnten nicht geladen werden">
            Der Login war erfolgreich, aber die Projektübersicht antwortet
            gerade nicht schnell genug. Bitte laden Sie die Seite neu oder
            versuchen Sie es in einem Moment erneut.
          </EmptyState>
        ) : dashboard.bundles.length === 0 ? (
          <EmptyState title="Noch kein Projekt zugeordnet">
            Ihr Konto ist aktiv. Sobald Assad Sie einem Projekt zuordnet, sehen
            Sie hier Status, Updates, Dateien, Aufgaben und Rechnungen.
          </EmptyState>
        ) : (
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            {dashboard.bundles.map((bundle) => {
              const customerUpdates = bundle.updates.filter(
                (update) => update.visibility === "customer",
              );
              const projectHref =
                user.role === "admin"
                  ? `/${safe}/portal/admin/projects/${bundle.project.id}`
                  : `/${safe}/portal/projects/${bundle.project.id}`;

              return (
                <Link
                  key={bundle.project.id}
                  href={projectHref}
                  className="group min-w-0 rounded-lg border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-copper"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="copper">{formatStage(bundle.project.asdarStage)}</Badge>
                    <Badge
                      tone={
                        bundle.project.health === "red"
                          ? "red"
                          : bundle.project.health === "amber"
                            ? "amber"
                            : "green"
                      }
                    >
                      {formatStatus(bundle.project.status)}
                    </Badge>
                  </div>
                  <h2 className="mt-4 text-xl font-medium text-ink">
                    {bundle.project.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {bundle.organization.name} · {bundle.organization.industry}
                  </p>
                  <p className="mt-4 min-h-12 text-sm leading-relaxed text-ink2">
                    {bundle.project.summary || "Noch keine Zusammenfassung."}
                  </p>
                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <div className="font-medium text-ink">
                        {customerUpdates.length}
                      </div>
                      <div className="text-muted">Updates</div>
                    </div>
                    <div>
                      <div className="font-medium text-ink">
                        {
                          bundle.files.filter(
                            (file) =>
                              user.role === "admin" ||
                              file.visibility === "customer",
                          ).length
                        }
                      </div>
                      <div className="text-muted">Dateien</div>
                    </div>
                    <div>
                      <div className="font-medium text-ink">
                        {
                          bundle.tasks.filter(
                            (task) =>
                              task.status !== "done" &&
                              (user.role === "admin" || task.visibleToCustomer),
                          ).length
                        }
                      </div>
                      <div className="text-muted">To-dos</div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-copper">
                    Öffnen
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </PortalShell>
  );
}
