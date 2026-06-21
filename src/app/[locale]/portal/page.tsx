import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, FileText, FolderKanban } from "lucide-react";
import { isLocale, type Locale } from "@/content";
import { requireUser } from "@/lib/portal/auth";
import { listProjectBundlesForUser } from "@/lib/portal/store";
import { formatCurrency, formatStage, formatStatus } from "@/lib/portal/format";
import {
  Badge,
  EmptyState,
  PortalCard,
  PortalSectionTitle,
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

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow={user.role === "admin" ? "Consultant Workspace" : "Kundenportal"}
      title={
        user.role === "admin"
          ? "Alle Beratungsprojekte im Überblick"
          : "Ihre Projektübersicht"
      }
      actions={
        user.role === "admin" ? (
          <Link
            href={`/${safe}/portal/admin`}
            className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
          >
            <FolderKanban className="h-4 w-4" />
            Admin öffnen
          </Link>
        ) : null
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <PortalCard>
          <div className="flex items-center gap-3">
            <FolderKanban className="h-5 w-5 text-copper" />
            <div>
              <div className="text-2xl font-medium text-ink">{bundles.length}</div>
              <div className="text-sm text-muted">Projekte</div>
            </div>
          </div>
        </PortalCard>
        <PortalCard>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-copper" />
            <div>
              <div className="text-2xl font-medium text-ink">
                {visibleTasks.filter((task) => task.status !== "done").length}
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

      <div className="mt-8">
        {loadError ? (
          <EmptyState title="Portal-Daten konnten nicht geladen werden">
            Der Login war erfolgreich, aber die Projektuebersicht antwortet
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

      {user.role !== "admin" && (
        <PortalCard className="mt-8">
          <PortalSectionTitle
            eyebrow="Transparenz"
            title="Was dieses Portal leistet"
          >
            Hier sehen Sie nur projektbezogene Informationen, die für Sie
            freigegeben wurden: Fortschritt, nächste Schritte, Dateien,
            Rechnungen und Aufgaben. Interne Beratungsnotizen bleiben privat.
          </PortalSectionTitle>
        </PortalCard>
      )}
    </PortalShell>
  );
}
