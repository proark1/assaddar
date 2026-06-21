import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";
import { isLocale, type Locale } from "@/content";
import { requireUser } from "@/lib/portal/auth";
import {
  getProjectAccess,
  getProjectBundle,
  readStore,
} from "@/lib/portal/store";
import {
  formatCurrency,
  formatDate,
  formatStage,
  formatStatus,
} from "@/lib/portal/format";
import {
  Badge,
  EmptyState,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projekt | Assad Dar Portal",
  robots: { index: false, follow: false },
};

export default async function CustomerProjectPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireUser(safe);
  if (user.role === "admin") {
    redirect(`/${safe}/portal/admin/projects/${projectId}`);
  }

  const store = await readStore();
  if (!getProjectAccess(store, user.id, projectId)) redirect(`/${safe}/portal`);
  const bundle = getProjectBundle(store, projectId);
  if (!bundle) notFound();

  const updates = bundle.updates.filter(
    (update) => update.visibility === "customer",
  );
  const tasks = bundle.tasks.filter((task) => task.visibleToCustomer);
  const milestones = bundle.milestones.filter(
    (milestone) => milestone.visibleToCustomer,
  );
  const files = bundle.files.filter((file) => file.visibility === "customer");
  const invoices = bundle.invoices.filter(
    (invoice) => invoice.status !== "draft",
  );
  const timeline = [
    ...updates.map((update) => ({
      id: update.id,
      date: update.createdAt,
      type: "Update",
      title: update.title,
      body: update.body,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      date: task.createdAt,
      type: "Aufgabe",
      title: task.title,
      body: `Owner: ${task.owner === "assad" ? "Assad" : "Kunde"} · ${task.status}`,
    })),
    ...milestones.map((milestone) => ({
      id: milestone.id,
      date: milestone.createdAt,
      type: "Meilenstein",
      title: milestone.title,
      body: `${milestone.status} · ${formatDate(milestone.dueDate)}`,
    })),
    ...files.map((file) => ({
      id: file.id,
      date: file.uploadedAt,
      type: "Datei",
      title: file.name,
      body: file.description || "Neue Datei im Portal",
    })),
    ...invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.createdAt,
      type: "Rechnung",
      title: invoice.number,
      body: `${formatCurrency(invoice.amountCents, invoice.currency)} · ${invoice.status}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow={`${bundle.organization.name} · Kundenansicht`}
      title={bundle.project.name}
      backHref={`/${safe}/portal`}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <PortalCard>
            <div className="flex flex-wrap gap-2">
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
            <p className="mt-5 text-base leading-relaxed text-ink2">
              {bundle.project.summary || "Die Projektbeschreibung folgt."}
            </p>
            <div className="mt-6 rounded-lg border border-copper/25 bg-copper/10 p-4">
              <div className="text-sm font-medium text-ink">Nächster Schritt</div>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {bundle.project.nextStep || "Der nächste Schritt wird vorbereitet."}
              </p>
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle
              eyebrow="Timeline"
              title="Was gerade im Projekt passiert"
            >
              Eine chronologische Sicht auf freigegebene Updates, Aufgaben,
              Dateien, Meilensteine und Rechnungen.
            </PortalSectionTitle>
            <div className="mt-5 space-y-4">
              {timeline.length === 0 ? (
                <EmptyState title="Noch keine Aktivität">
                  Sobald im Projekt etwas für Sie freigegeben wird, erscheint
                  es hier.
                </EmptyState>
              ) : (
                timeline.slice(0, 12).map((item) => (
                  <article
                    key={`${item.type}-${item.id}`}
                    className="flex gap-4 rounded-lg border border-hairline bg-bg p-4"
                  >
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-copper" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{item.type}</Badge>
                        <span className="text-[12px] text-muted">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink2">
                        {item.body}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Updates" title="Projektfortschritt">
              Kurze Statusmeldungen, die Assad für Sie freigegeben hat.
            </PortalSectionTitle>
            <div className="mt-5 space-y-4">
              {updates.length === 0 ? (
                <EmptyState title="Noch keine Updates">
                  Sobald ein Update veröffentlicht wird, erscheint es hier.
                </EmptyState>
              ) : (
                updates.map((update) => (
                  <article
                    key={update.id}
                    className="border-l-2 border-copper pl-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
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
                ))
              )}
            </div>
          </PortalCard>

          <div className="grid gap-6 md:grid-cols-2">
            <PortalCard>
              <PortalSectionTitle eyebrow="Meilensteine" title="Roadmap" />
              <div className="mt-5 space-y-3">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="flex items-start gap-3">
                      {milestone.status === "done" ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                      ) : (
                        <Clock3 className="mt-0.5 h-4 w-4 text-copper" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-ink">
                          {milestone.title}
                        </div>
                        <div className="mt-1 text-[12px] text-muted">
                          {formatDate(milestone.dueDate)} · {milestone.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && (
                  <p className="text-sm text-muted">Noch keine Meilensteine.</p>
                )}
              </div>
            </PortalCard>

            <PortalCard>
              <PortalSectionTitle eyebrow="Aufgaben" title="To-dos" />
              <div className="mt-5 space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="text-sm font-medium text-ink">
                      {task.title}
                    </div>
                    <div className="mt-1 text-[12px] text-muted">
                      Owner: {task.owner === "assad" ? "Assad" : "Kunde"} ·{" "}
                      {task.status} · {formatDate(task.dueDate)}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-sm text-muted">Keine offenen Aufgaben.</p>
                )}
              </div>
            </PortalCard>
          </div>
        </div>

        <aside className="space-y-6">
          <PortalCard>
            <PortalSectionTitle eyebrow="Dateien" title="Deliverables" />
            <div className="mt-5 space-y-3">
              {files.map((file) => (
                <a
                  key={file.id}
                  href={`/api/portal/files/${file.id}`}
                  className="flex items-start gap-3 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                >
                  <Download className="mt-0.5 h-4 w-4 text-copper" />
                  <div>
                    <div className="text-sm font-medium text-ink">{file.name}</div>
                    <div className="mt-1 text-[12px] text-muted">
                      {file.description || "Datei herunterladen"}
                    </div>
                  </div>
                </a>
              ))}
              {files.length === 0 && (
                <p className="text-sm text-muted">Noch keine Dateien.</p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Rechnungen" title="Payment" />
            <div className="mt-5 space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-ink">
                      <CreditCard className="h-4 w-4 text-copper" />
                      {invoice.number}
                    </div>
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
                  <p className="mt-2 text-sm text-ink2">{invoice.description}</p>
                  <div className="mt-2 text-sm font-medium text-ink">
                    {formatCurrency(invoice.amountCents, invoice.currency)}
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    Fällig: {formatDate(invoice.dueDate)}
                  </div>
                  {invoice.paymentUrl && (
                    <Link
                      href={invoice.paymentUrl}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-copper"
                    >
                      Zahlung öffnen
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ))}
              {invoices.length === 0 && (
                <p className="text-sm text-muted">Keine Rechnungen sichtbar.</p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Hinweis" title="Interne Arbeit" />
            <div className="mt-4 flex gap-3 text-sm leading-relaxed text-ink2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
              <p>
                Sie sehen freigegebene Inhalte. Interne Analysen, Hypothesen und
                Beratungsnotizen bleiben in Assads Arbeitsbereich.
              </p>
            </div>
          </PortalCard>
        </aside>
      </div>
    </PortalShell>
  );
}
