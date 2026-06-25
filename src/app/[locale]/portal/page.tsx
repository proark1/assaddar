import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  FolderKanban,
  ListChecks,
  WalletCards,
} from "lucide-react";
import { isLocale, type Locale } from "@/content";
import { requireUser } from "@/lib/portal/auth";
import { listProjectBundlesForUser } from "@/lib/portal/store";
import { formatCurrency, formatStage, formatStatus } from "@/lib/portal/format";
import {
  buildCustomerChecklist,
  buildCustomerNextActions,
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
  const customerChecklist =
    user.role === "admin" || bundles.length !== 1
      ? []
      : buildCustomerChecklist(bundles[0]);
  const primaryCustomerAction = customerNextActions[0];
  const customerHighlights =
    user.role === "admin"
      ? []
      : bundles.slice(0, 3).map((bundle) => {
          const latestUpdate = bundle.updates
            .filter((update) => update.visibility === "customer")
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )[0];
          const nextAction = buildCustomerNextActions(bundle)[0];

          return {
            bundle,
            latestUpdate,
            nextAction,
            workingOn:
              bundle.project.nextStep ||
              latestUpdate?.title ||
              "Assad prüft die Projektinformationen und bereitet den nächsten Schritt vor.",
          };
        });
  const latestCustomerUpdate =
    user.role === "admin"
      ? undefined
      : bundles
          .flatMap((bundle) =>
            bundle.updates
              .filter((update) => update.visibility === "customer")
              .map((update) => ({ bundle, update })),
          )
          .sort(
            (a, b) =>
              new Date(b.update.createdAt).getTime() -
              new Date(a.update.createdAt).getTime(),
          )[0];
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
          <PortalSectionTitle
            eyebrow="Home"
            title="Alles Wichtige auf einen Blick"
          >
            Keine Suche im Portal: Status, Arbeit von Assad, Ihre offenen
            Punkte, Termine und Rechnungen stehen direkt hier.
          </PortalSectionTitle>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Link
              href={
                bundles[0]
                  ? `/${safe}/portal/projects/${bundles[0].project.id}`
                  : `/${safe}/portal`
              }
              className="rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
            >
              <FolderKanban className="h-4 w-4 text-copper" />
              <div className="mt-3 text-sm font-medium text-ink">Status</div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                {bundles[0]
                  ? `${formatStage(bundles[0].project.asdarStage)} · ${formatStatus(bundles[0].project.status)}`
                  : "Noch kein Projekt zugeordnet"}
              </p>
            </Link>
            <Link
              href={
                latestCustomerUpdate
                  ? `/${safe}/portal/projects/${latestCustomerUpdate.bundle.project.id}?view=overview`
                  : `/${safe}/portal`
              }
              className="rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
            >
              <Bell className="h-4 w-4 text-copper" />
              <div className="mt-3 text-sm font-medium text-ink">
                Was Assad gemacht hat
              </div>
              <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-muted">
                {latestCustomerUpdate?.update.title ??
                  "Sobald ein Update veröffentlicht wird, steht es hier."}
              </p>
            </Link>
            <Link
              href={
                primaryCustomerAction
                  ? `/${safe}/portal/projects/${primaryCustomerAction.bundle.project.id}?view=${primaryCustomerAction.action.hrefView}`
                  : `/${safe}/portal`
              }
              className="rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
            >
              <ListChecks className="h-4 w-4 text-copper" />
              <div className="mt-3 text-sm font-medium text-ink">
                Was ich tun muss
              </div>
              <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-muted">
                {primaryCustomerAction?.action.title ??
                  "Aktuell keine offenen Punkte für Sie."}
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
              <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-muted">
                {nextAppointment?.update.body || "Termin buchen oder abstimmen."}
              </p>
            </Link>
            <Link
              href={
                bundles[0]
                  ? `/${safe}/portal/projects/${bundles[0].project.id}?view=files`
                  : `/${safe}/portal`
              }
              className="rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-copper"
            >
              <WalletCards className="h-4 w-4 text-copper" />
              <div className="mt-3 text-sm font-medium text-ink">
                Rechnungen
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                {formatCurrency(
                  openInvoices.reduce(
                    (sum, invoice) => sum + invoice.amountCents,
                    0,
                  ),
                )}{" "}
                offen
              </p>
            </Link>
          </div>
        </PortalCard>
      )}

      {user.role !== "admin" && primaryCustomerAction && (
        <PortalCard className="mt-8 border-copper/30 bg-copper/10">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                Heute zuerst
              </div>
              <h2 className="mt-2 text-xl font-medium text-ink">
                {primaryCustomerAction.action.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {primaryCustomerAction.action.body}
              </p>
            </div>
            <Link
              href={`/${safe}/portal/projects/${primaryCustomerAction.bundle.project.id}?view=${primaryCustomerAction.action.hrefView}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-3 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
            >
              {primaryCustomerAction.action.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </PortalCard>
      )}

      {user.role !== "admin" && customerHighlights.length > 0 && (
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <PortalCard>
            <PortalSectionTitle
              eyebrow="Projektstand"
              title="Woran Assad gerade arbeitet"
            >
              Eine kurze, kundenfreundliche Sicht auf den aktuellen
              Beratungsfokus.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {customerHighlights.map(({ bundle, latestUpdate, workingOn }) => (
                <Link
                  key={bundle.project.id}
                  href={`/${safe}/portal/projects/${bundle.project.id}`}
                  className="block rounded-lg border border-hairline bg-bg p-4 transition-colors hover:border-copper"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="copper">
                      {formatStage(bundle.project.asdarStage)}
                    </Badge>
                    {latestUpdate && (
                      <span className="text-[12px] text-muted">
                        Letztes Update:{" "}
                        {new Date(latestUpdate.createdAt).toLocaleDateString(
                          "de-DE",
                        )}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-ink">
                    {bundle.organization.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink2">
                    {workingOn}
                  </p>
                </Link>
              ))}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Termin" title="Nächster Kontakt">
              Wenn kein Termin vereinbart ist, kann direkt ein neuer Slot
              gebucht werden.
            </PortalSectionTitle>
            <div className="mt-5 rounded-lg border border-hairline bg-bg p-4">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-copper" />
                <div>
                  <div className="text-sm font-medium text-ink">
                    Nächster Call wird im Projekt abgestimmt
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Sobald ein Termin oder Meeting-Update veröffentlicht wird,
                    erscheint es im Projektverlauf. Für einen neuen Termin kann
                    jederzeit die Buchungsseite genutzt werden.
                  </p>
                </div>
              </div>
              <Link
                href={`/${safe}/termin`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
              >
                Termin buchen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </PortalCard>
        </div>
      )}

      {user.role !== "admin" && customerChecklist.length > 0 && (
        <PortalCard className="mt-8">
          <PortalSectionTitle
            eyebrow="Projektfahrplan"
            title="Vier einfache Schritte"
          >
            Für dieses Projekt sehen Sie sofort, was erledigt ist, was gerade
            läuft und wo Details liegen.
          </PortalSectionTitle>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {customerChecklist.map((item, index) => (
              <Link
                key={item.id}
                href={`/${safe}/portal/projects/${bundles[0].project.id}?view=${item.hrefView}`}
                className={`rounded-lg border p-4 transition-colors hover:border-copper ${
                  item.status === "done"
                    ? "border-success/25 bg-success/10"
                    : item.status === "current"
                      ? "border-copper/30 bg-copper/10"
                      : "border-hairline bg-bg"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                    Schritt {index + 1}
                  </span>
                  {item.status === "done" && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                </div>
                <h3 className="mt-3 text-sm font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {item.body}
                </p>
              </Link>
            ))}
          </div>
        </PortalCard>
      )}

      {user.role !== "admin" && customerNextActions.length > 1 && (
        <PortalCard className="mt-8">
          <PortalSectionTitle
            eyebrow="Jetzt wichtig"
            title="Weitere offene Punkte"
          >
            Die wichtigsten offenen Punkte aus allen Projekten, damit Sie nicht
            lange suchen müssen.
          </PortalSectionTitle>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {customerNextActions.slice(1, 5).map(({ bundle, action }) => (
              <Link
                key={`${bundle.project.id}-${action.id}`}
                href={`/${safe}/portal/projects/${bundle.project.id}?view=${action.hrefView}`}
                className={`group rounded-lg border p-4 transition-colors hover:border-copper ${
                  action.tone === "red"
                    ? "border-critical/30 bg-critical/10"
                    : action.tone === "green"
                      ? "border-success/25 bg-success/10"
                      : "border-copper/25 bg-copper/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    {action.tone === "green" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <AlertTriangle
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          action.tone === "red" ? "text-critical" : "text-copper"
                        }`}
                      />
                    )}
                    <div>
                      <div className="text-[12px] text-muted">
                        {bundle.organization.name}
                      </div>
                      <h2 className="mt-1 text-sm font-medium text-ink">
                        {action.title}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-ink2">
                        {action.body}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-copper transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
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
