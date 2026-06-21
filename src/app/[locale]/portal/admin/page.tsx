import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import { createProjectAction } from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { getProjectBundle, readStore } from "@/lib/portal/store";
import { formatStage, formatStatus } from "@/lib/portal/format";
import { consultingTemplates } from "@/lib/portal/templates";
import {
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  textareaClass,
} from "@/components/portal/chrome";

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
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const store = await readStore();
  const query = await searchParams;
  const bundles = store.projects
    .map((project) => getProjectBundle(store, project.id))
    .filter((bundle): bundle is NonNullable<typeof bundle> => Boolean(bundle));

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Consulting Cockpit"
      backHref={`/${safe}/portal`}
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-5">
          <PortalCard>
            <PortalSectionTitle
              eyebrow="Playbook Library"
              title="Industrie-Templates fuer schnelle Beratung"
            >
              Jede Vorlage bringt Intake-Felder, Diagnosefragen, Quick Wins,
              Aufgaben, Meilensteine und Meeting-Guidance fuer den Admin mit.
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
                  <div className="font-medium text-ink">{bundle.updates.length}</div>
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
              <select name="templateId" className={fieldClass}>
                <option value="">Kein Template / manuell</option>
                {consultingTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Fuellt ASDAR Intake, erste Aufgaben, Meilensteine und ein
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
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-3 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
            >
              <Plus className="h-4 w-4" />
              Projekt erstellen
            </button>
          </form>
        </PortalCard>
      </div>
    </PortalShell>
  );
}
