import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  PencilLine,
} from "lucide-react";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { listProjectBundlesForUser } from "@/lib/portal/store";
import { formatDate, formatStage, formatStatus } from "@/lib/portal/format";
import {
  buildAdminProjectActions,
  buildProjectPipeline,
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
  title: "Pipeline | Assad Dar Portal",
  robots: { index: false, follow: false },
};

function columnTone(id: string): "amber" | "red" | "green" | "copper" {
  if (id === "waiting") return "amber";
  if (id === "billing") return "red";
  if (id === "completed") return "green";
  return "copper";
}

export default async function AdminPipelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const bundles = await listProjectBundlesForUser(user);
  const columns = buildProjectPipeline(bundles);
  const activeCount = bundles.filter(
    (bundle) => bundle.project.status !== "completed",
  ).length;

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Projekt Pipeline"
      activeNav="pipeline"
      backHref={`/${safe}/portal/admin`}
      actions={
        <>
          <Link
            href={`/${safe}/portal/admin`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
          >
            <LayoutDashboard className="h-4 w-4" />
            Cockpit
          </Link>
          <Link
            href={`/${safe}/portal/admin/drafts`}
            className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
          >
            <PencilLine className="h-4 w-4" />
            Drafts
          </Link>
        </>
      }
    >
      <PortalCard className="mb-6 border-copper/30 bg-copper/10">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <PortalSectionTitle
            eyebrow="Flow"
            title={`${activeCount} aktive Projekte sauber steuern`}
          >
            Projekte sind nach operativer Situation sortiert: neue Analyse,
            Umsetzung, Kundenblocker, Billing und Abschluss.
          </PortalSectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
              <div className="text-xl font-medium text-ink">{activeCount}</div>
              <div className="text-[12px] text-muted">aktiv</div>
            </div>
            <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
              <div className="text-xl font-medium text-ink">
                {columns.find((column) => column.id === "waiting")?.bundles.length ?? 0}
              </div>
              <div className="text-[12px] text-muted">blockiert</div>
            </div>
            <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
              <div className="text-xl font-medium text-ink">
                {columns.find((column) => column.id === "billing")?.bundles.length ?? 0}
              </div>
              <div className="text-[12px] text-muted">billing</div>
            </div>
          </div>
        </div>
      </PortalCard>

      <div className="grid gap-5 xl:grid-cols-3">
        {columns.map((column) => (
          <PortalCard key={column.id} className="min-h-80">
            <div className="flex items-start justify-between gap-3">
              <PortalSectionTitle eyebrow="Pipeline" title={column.title}>
                {column.body}
              </PortalSectionTitle>
              <Badge tone={columnTone(column.id)}>
                {column.bundles.length}
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              {column.bundles.map((bundle) => {
                const action = buildAdminProjectActions(bundle)[0];
                const customerOpen = bundle.tasks.filter(
                  (task) =>
                    task.owner === "customer" &&
                    task.visibleToCustomer &&
                    task.status !== "done",
                ).length;
                const unpaid = bundle.invoices.filter(
                  (invoice) =>
                    invoice.status !== "draft" && invoice.status !== "paid",
                ).length;

                return (
                  <Link
                    key={bundle.project.id}
                    href={`/${safe}/portal/admin/projects/${bundle.project.id}?view=${action.hrefView}`}
                    className="block rounded-lg border border-hairline bg-bg p-4 transition-colors hover:border-copper"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-medium text-ink">
                          {bundle.organization.name}
                        </h2>
                        <p className="mt-1 text-[12px] leading-relaxed text-muted">
                          {bundle.project.name}
                        </p>
                      </div>
                      {bundle.project.health === "green" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <AlertTriangle
                          className={`h-4 w-4 shrink-0 ${
                            bundle.project.health === "red"
                              ? "text-critical"
                              : "text-copper"
                          }`}
                        />
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge>{formatStatus(bundle.project.status)}</Badge>
                      <Badge tone="copper">
                        {formatStage(bundle.project.asdarStage)}
                      </Badge>
                      {customerOpen > 0 && (
                        <Badge tone="amber">{customerOpen} Kunden-To-dos</Badge>
                      )}
                      {unpaid > 0 && <Badge tone="red">{unpaid} Rechnung</Badge>}
                    </div>
                    <div className="mt-3 rounded-lg border border-hairline bg-surface p-3">
                      <div className="flex items-center gap-2 text-[12px] font-medium text-ink">
                        <FolderKanban className="h-3.5 w-3.5 text-copper" />
                        {action.title}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                        {action.body}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatDate(bundle.project.updatedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-copper">
                        Öffnen
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
              {column.bundles.length === 0 && (
                <EmptyState title="Keine Projekte">
                  In dieser Spalte gibt es aktuell nichts zu tun.
                </EmptyState>
              )}
            </div>
          </PortalCard>
        ))}
      </div>
    </PortalShell>
  );
}
