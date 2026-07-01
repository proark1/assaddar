import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  PencilLine,
  Send,
} from "lucide-react";
import { publishDraftUpdateAction } from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { listProjectBundlesForUser } from "@/lib/portal/store";
import {
  buildDraftReviewItems,
  buildProjectPipeline,
} from "@/lib/portal/operations";
import {
  Badge,
  EmptyState,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  textareaClass,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entwürfe prüfen | Assad Dar Portal",
  robots: { index: false, follow: false },
};

const typeLabels = {
  customer_update: "Kundenupdate",
  meeting_summary: "Meeting-Zusammenfassung",
  proposal: "Angebot",
  final_report: "Abschlussbericht",
  invoice_reminder: "Rechnungserinnerung",
  next_call_agenda: "Call-Agenda",
};

const publishTitles = {
  customer_update: "Update: Analyse und nächste Schritte",
  meeting_summary: "Meeting-Zusammenfassung",
  proposal: "Angebotsentwurf und empfohlener Scope",
  final_report: "Abschlussbericht Entwurf",
  invoice_reminder: "Hinweis zur offenen Rechnung",
  next_call_agenda: "Vorschlag für den nächsten Termin",
};

export default async function AdminDraftsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const bundles = await listProjectBundlesForUser(user);
  const drafts = buildDraftReviewItems(bundles);
  const pipeline = buildProjectPipeline(bundles);
  const waitingCount =
    pipeline.find((column) => column.id === "waiting")?.bundles.length ?? 0;

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Entwürfe prüfen"
      activeNav="drafts"
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
            href={`/${safe}/portal/admin/pipeline`}
            className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
          >
            <FolderKanban className="h-4 w-4" />
            Pipeline
          </Link>
        </>
      }
    >
      <PortalCard className="mb-6 border-copper/30 bg-copper/10">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <PortalSectionTitle
            eyebrow="Review"
            title="Kundenkommunikation schneller freigeben"
          >
            Assad bekommt vorbereitete Updates, Meeting-Zusammenfassungen und
            Angebotsideen als editierbare Entwürfe. Erst nach Klick wird etwas
            im Kundenportal veröffentlicht.
          </PortalSectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
              <div className="text-xl font-medium text-ink">{drafts.length}</div>
              <div className="text-[12px] text-muted">offene Entwürfe</div>
            </div>
            <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
              <div className="text-xl font-medium text-ink">{waitingCount}</div>
              <div className="text-[12px] text-muted">Kundenblocker</div>
            </div>
          </div>
        </div>
      </PortalCard>

      {drafts.length === 0 ? (
        <EmptyState title="Keine Entwürfe offen">
          Aktuell gibt es keine vorbereiteten Updates, die geprüft werden
          müssen.
        </EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {drafts.map((draft) => (
            <PortalCard key={draft.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="copper">{typeLabels[draft.type]}</Badge>
                    <Badge>{draft.priority >= 8 ? "hoch" : "normal"}</Badge>
                  </div>
                  <h2 className="mt-3 text-lg font-medium text-ink">
                    {draft.title}
                  </h2>
                </div>
                <Link
                  href={`/${safe}/portal/admin/projects/${draft.projectId}?view=${draft.hrefView}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-copper"
                >
                  Projekt öffnen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <form action={publishDraftUpdateAction} className="mt-5 space-y-4">
                <input type="hidden" name="locale" value={safe} />
                <input type="hidden" name="projectId" value={draft.projectId} />
                <input type="hidden" name="draftId" value={draft.id} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/${safe}/portal/admin/drafts`}
                />
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Titel
                  </label>
                  <input
                    name="title"
                    defaultValue={publishTitles[draft.type]}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Entwurf
                  </label>
                  <textarea
                    name="body"
                    defaultValue={draft.body}
                    className={`${textareaClass} min-h-64`}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                  >
                    <Send className="h-4 w-4" />
                    Als Kundenupdate veröffentlichen
                  </button>
                  <Link
                    href={`/${safe}/portal/admin/projects/${draft.projectId}?view=${draft.hrefView}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                  >
                    <PencilLine className="h-4 w-4" />
                    Im Projekt bearbeiten
                  </Link>
                </div>
              </form>
            </PortalCard>
          ))}
        </div>
      )}

      {drafts.length > 0 && (
        <div className="mt-6 rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Jeder veröffentlichte Draft verschwindet automatisch aus dieser
            Review-Liste.
          </span>
        </div>
      )}
    </PortalShell>
  );
}
