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
import { listProjectBundlesForUser } from "@/lib/portal/store";
import { formatCurrency, formatStage, formatStatus } from "@/lib/portal/format";
import { buildCustomerNextActions } from "@/lib/portal/operations";
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
  let bundles: Awaited<ReturnType<typeof listProjectBundlesForUser>> = [];
  let loadError = false;

  try {
    bundles = await withTimeout(listProjectBundlesForUser(user), 8000);
  } catch {
    loadError = true;
  }

  const openInvoices = bundles.flatMap((bundle) =>
    bundle.invoices.filter((invoice) => invoice.status !== "paid"),
  );
  const visibleTasks = bundles.flatMap((bundle) =>
    bundle.tasks.filter((task) =>
      user.role === "admin" ? task.status !== "done" : task.visibleToCustomer,
    ),
  );
  const customerNextActions =
    user.role === "admin"
      ? []
      : bundles.flatMap((bundle) =>
          buildCustomerNextActions(bundle)
            .slice(0, 2)
            .map((action) => ({ bundle, action })),
        );
  const primaryCustomerAction = customerNextActions[0];
  const nextAppointment =
    user.role === "admin"
      ? undefined
      : bundles
          .flatMap((bundle) =>
            bundle.updates
              .filter(
                (update) =>
                  update.visibility === "customer" &&
                  update.title.startsWith("Termin:"),
              )
              .map((update) => ({ bundle, update })),
          )
          .sort(
            (a, b) =>
              new Date(b.update.createdAt).getTime() -
              new Date(a.update.createdAt).getTime(),
          )[0];
  const customerOpenTasks = visibleTasks.filter(
    (task) => task.status !== "done",
  );
  const openInvoiceTotal = openInvoices.reduce(
    (sum, invoice) => sum + invoice.amountCents,
    0,
  );
  const dashboardBundle =
    user.role === "admin"
      ? undefined
      : (primaryCustomerAction?.bundle ?? bundles[0]);
  const dashboardHref = dashboardBundle
    ? `/${safe}/portal/projects/${dashboardBundle.project.id}`
    : `/${safe}/portal`;

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow={user.role === "admin" ? "Consultant Workspace" : "Kundenportal"}
      activeNav="dashboard"
      title={
        user.role === "admin"
          ? "Alle Beratungsprojekte im Überblick"
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
                  {bundles.length}
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
                  {customerOpenTasks.length}
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
                    openInvoices.reduce(
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
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                Heute im Portal
              </div>
              <h2 className="mt-2 text-xl font-medium text-ink">
                {primaryCustomerAction?.action.title ??
                  "Aktuell ist nichts von Ihnen offen"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {primaryCustomerAction?.action.body ??
                  "Assad arbeitet weiter am Projekt. Sie können Status, Updates, Dateien und Rechnungen jederzeit öffnen."}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={
                    primaryCustomerAction
                      ? `/${safe}/portal/projects/${primaryCustomerAction.bundle.project.id}?view=${primaryCustomerAction.action.hrefView}`
                      : dashboardHref
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-3 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                >
                  {primaryCustomerAction?.action.cta ?? "Projekt öffnen"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={
                    dashboardBundle
                      ? `/${safe}/portal/projects/${dashboardBundle.project.id}?view=overview`
                      : `/${safe}/portal`
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                >
                  Status ansehen
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={dashboardHref}
                className="rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
              >
                <FolderKanban className="h-4 w-4 text-copper" />
                <div className="mt-3 text-sm font-medium text-ink">
                  Projektstatus
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {dashboardBundle
                    ? `${formatStage(dashboardBundle.project.asdarStage)} · ${formatStatus(dashboardBundle.project.status)}`
                    : "Noch kein Projekt zugeordnet"}
                </p>
              </Link>
              <Link
                href={
                  nextAppointment
                    ? `/${safe}/portal/projects/${nextAppointment.bundle.project.id}?view=overview`
                    : `/${safe}/termin`
                }
                className="rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
              >
                <CalendarDays className="h-4 w-4 text-copper" />
                <div className="mt-3 text-sm font-medium text-ink">
                  Nächster Termin
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                  {nextAppointment?.update.body || "Termin buchen oder abstimmen."}
                </p>
              </Link>
              <Link
                href={
                  dashboardBundle
                    ? `/${safe}/portal/projects/${dashboardBundle.project.id}?view=files`
                    : `/${safe}/portal`
                }
                className="rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
              >
                <WalletCards className="h-4 w-4 text-copper" />
                <div className="mt-3 text-sm font-medium text-ink">
                  Rechnungen
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {formatCurrency(openInvoiceTotal)} offen
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
        ) : bundles.length === 0 ? (
          <EmptyState title="Noch kein Projekt zugeordnet">
            Ihr Konto ist aktiv. Sobald Assad Sie einem Projekt zuordnet, sehen
            Sie hier Status, Updates, Dateien, Aufgaben und Rechnungen.
          </EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {bundles.map((bundle) => {
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
                  className="group rounded-lg border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-copper"
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
