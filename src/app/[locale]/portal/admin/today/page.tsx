import type { Metadata } from "next";
import Link from "next/link";
import {
  convertNotificationToTaskAction,
  markNotificationDoneAction,
  runPortalAutomationsAction,
} from "@/app/actions/portal";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  CreditCard,
  FolderKanban,
  History,
  LayoutDashboard,
} from "lucide-react";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { listProjectBundlesForUser } from "@/lib/portal/store";
import { formatCurrency, formatDate } from "@/lib/portal/format";
import {
  buildAdminCommandCenter,
  buildAdminNotificationCenter,
  buildAdminProjectActions,
  buildProjectTimeline,
} from "@/lib/portal/operations";
import {
  Badge,
  EmptyState,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Heute | Assad Dar Portal",
  robots: { index: false, follow: false },
};

export default async function AdminTodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const bundles = await listProjectBundlesForUser(user);
  const commandCenter = buildAdminCommandCenter(bundles);
  const notifications = buildAdminNotificationCenter(bundles);
  const actionQueue = bundles
    .flatMap((bundle) =>
      buildAdminProjectActions(bundle).slice(0, 2).map((action) => ({
        ...action,
        projectId: bundle.project.id,
        projectName: bundle.project.name,
        organizationName: bundle.organization.name,
      })),
    )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 12);
  const latestActivity = bundles
    .flatMap((bundle) =>
      buildProjectTimeline(bundle)
        .slice(0, 5)
        .map((item) => ({
          ...item,
          organizationName: bundle.organization.name,
        })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  const openInvoiceAmount = bundles
    .flatMap((bundle) =>
      bundle.invoices.filter(
        (invoice) => invoice.status !== "draft" && invoice.status !== "paid",
      ),
    )
    .reduce((sum, invoice) => sum + invoice.amountCents, 0);

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Heute"
      backHref={`/${safe}/portal/admin`}
      actions={
        <>
          <form action={runPortalAutomationsAction}>
            <input type="hidden" name="locale" value={safe} />
            <input
              type="hidden"
              name="returnTo"
              value={`/${safe}/portal/admin/today`}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
            >
              <Bot className="h-4 w-4" />
              Automationen
            </button>
          </form>
          <Link
            href={`/${safe}/portal/admin`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
          >
            <LayoutDashboard className="h-4 w-4" />
            Cockpit
          </Link>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <PortalCard className="border-copper/30 bg-copper/10">
            <PortalSectionTitle eyebrow="Priorität" title="Heute zuerst">
              Der eine Punkt, der den meisten Fortschritt oder die größte
              Entblockung bringt.
            </PortalSectionTitle>
            {commandCenter.focusItems[0] ? (
              <Link
                href={`/${safe}/portal/admin/projects/${commandCenter.focusItems[0].projectId}`}
                className="mt-5 flex flex-col gap-4 rounded-lg border border-copper/30 bg-surface p-4 transition-colors hover:border-copper sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <AlertTriangle
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      commandCenter.focusItems[0].tone === "red"
                        ? "text-critical"
                        : "text-copper"
                    }`}
                  />
                  <div>
                    <h2 className="text-lg font-medium text-ink">
                      {commandCenter.focusItems[0].title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink2">
                      {commandCenter.focusItems[0].body}
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-copper">
                  {commandCenter.focusItems[0].action}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ) : (
              <div className="mt-5">
                <EmptyState title="Keine kritische Priorität">
                  Aktuell gibt es keine rote oder dringende Aktion. Nutze die
                  Action Queue für normale Fortschritte.
                </EmptyState>
              </div>
            )}
          </PortalCard>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PortalCard>
              <FolderKanban className="h-4 w-4 text-copper" />
              <div className="mt-3 text-2xl font-medium text-ink">
                {commandCenter.stats.activeProjects}
              </div>
              <div className="text-sm text-muted">aktive Projekte</div>
            </PortalCard>
            <PortalCard>
              <Clock3 className="h-4 w-4 text-copper" />
              <div className="mt-3 text-2xl font-medium text-ink">
                {commandCenter.stats.staleUpdates}
              </div>
              <div className="text-sm text-muted">Updates fällig</div>
            </PortalCard>
            <PortalCard>
              <AlertTriangle className="h-4 w-4 text-copper" />
              <div className="mt-3 text-2xl font-medium text-ink">
                {commandCenter.stats.overdueCustomerTasks}
              </div>
              <div className="text-sm text-muted">Kunden überfällig</div>
            </PortalCard>
            <PortalCard>
              <CreditCard className="h-4 w-4 text-copper" />
              <div className="mt-3 text-2xl font-medium text-ink">
                {formatCurrency(openInvoiceAmount)}
              </div>
              <div className="text-sm text-muted">offen fakturiert</div>
            </PortalCard>
          </div>

          <PortalCard>
            <PortalSectionTitle eyebrow="Aktionen" title="Action Queue">
              Pro Projekt maximal zwei relevante nächste Aktionen. Von hier
              direkt in den passenden Bereich springen.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {actionQueue.map((item) => (
                <Link
                  key={`${item.projectId}-${item.id}`}
                  href={`/${safe}/portal/admin/projects/${item.projectId}?view=${item.hrefView}`}
                  className={`block rounded-lg border p-4 transition-colors hover:border-copper ${
                    item.tone === "red"
                      ? "border-critical/30 bg-critical/10"
                      : item.tone === "green"
                        ? "border-success/25 bg-success/10"
                        : "border-hairline bg-bg"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                          {item.organizationName}
                        </Badge>
                        <span className="text-[12px] text-muted">
                          {item.projectName}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink2">
                        {item.body}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-copper">
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
              {actionQueue.length === 0 && (
                <EmptyState title="Keine offenen Aktionen">
                  Alle aktiven Projekte haben aktuell keinen dringenden nächsten
                  Schritt.
                </EmptyState>
              )}
            </div>
          </PortalCard>
        </div>

        <aside className="space-y-6">
          <PortalCard>
            <PortalSectionTitle eyebrow="Inbox" title="Kundensignale" />
            <div className="mt-5 space-y-3">
              {notifications.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <Link
                    href={`/${safe}/portal/admin/projects/${item.projectId}?view=${item.hrefView}`}
                    className="flex gap-3 transition-colors hover:text-copper"
                  >
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
                      <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-muted">
                        {item.body}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={markNotificationDoneAction}>
                      <input type="hidden" name="locale" value={safe} />
                      <input type="hidden" name="projectId" value={item.projectId} />
                      <input type="hidden" name="notificationId" value={item.id} />
                      <input
                        type="hidden"
                        name="returnTo"
                        value={`/${safe}/portal/admin/today`}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Erledigt
                      </button>
                    </form>
                    <form action={convertNotificationToTaskAction}>
                      <input type="hidden" name="locale" value={safe} />
                      <input type="hidden" name="projectId" value={item.projectId} />
                      <input type="hidden" name="notificationId" value={item.id} />
                      <input type="hidden" name="taskTitle" value={item.title} />
                      <input
                        type="hidden"
                        name="returnTo"
                        value={`/${safe}/portal/admin/today`}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                      >
                        Aufgabe erstellen
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-muted">Keine neuen Signale.</p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Timeline" title="Heute passiert" />
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
                    <h3 className="mt-2 text-sm font-medium text-ink">
                      {item.organizationName}: {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </Link>
              ))}
              {latestActivity.length === 0 && (
                <p className="text-sm text-muted">Noch keine Aktivität.</p>
              )}
            </div>
          </PortalCard>
        </aside>
      </div>
    </PortalShell>
  );
}
