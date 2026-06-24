import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { saveTemplateOverrideAction } from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { asdarStages } from "@/lib/portal/format";
import { readStore } from "@/lib/portal/store";
import { effectiveConsultingTemplates } from "@/lib/portal/templates";
import {
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Template Library | Assad Dar Portal",
  robots: { index: false, follow: false },
};

export default async function AdminTemplatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; created?: string; updated?: string; error?: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const query = await searchParams;
  const store = await readStore();
  const templateOverrides = store.templateOverrides ?? [];
  const effectiveTemplates = effectiveConsultingTemplates(templateOverrides);
  const q = query.q?.trim().toLowerCase() ?? "";
  const templates = effectiveTemplates.filter((template) =>
    [
      template.label,
      template.category,
      template.industryLabel,
      template.bestFor,
      template.summary,
      template.quickWins.join(" "),
      template.automationIdeas.join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Template Library"
      activeNav="templates"
      backHref={`/${safe}/portal/admin`}
      actions={
        <Link
          href={`/${safe}/portal/admin`}
          className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
        >
          Neues Projekt
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <PortalCard>
        <PortalSectionTitle
          eyebrow="Playbooks"
          title="Branchen-Templates verwalten"
        >
          Jede Vorlage enthält Intake, Diagnosefragen, Quick Wins,
          Automatisierungsideen, Risiken, Meeting-Guidance, Aufgaben,
          Meilensteine und einen ASDAR-Phasenplan.
        </PortalSectionTitle>
        <form
          action={`/${safe}/portal/admin/templates`}
          method="get"
          className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"
        >
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Template, Branche, Quick Win suchen..."
            className={fieldClass}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
          >
            Suchen
          </button>
        </form>
        {(query.created || query.updated || query.error) && (
          <div className="mt-4 rounded-lg border border-copper/30 bg-copper/10 px-4 py-3 text-sm text-ink">
            {query.created && "Template-Anpassung gespeichert."}
            {query.updated && "Template-Anpassung aktualisiert."}
            {query.error === "template" && "Template wurde nicht gefunden."}
          </div>
        )}
      </PortalCard>

      <div className="mt-6 grid gap-6">
        {templates.map((template) => {
          const override = templateOverrides.find(
            (entry) => entry.templateId === template.id,
          );
          return (
          <PortalCard key={template.id} className="scroll-mt-24" id={template.id}>
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="copper">{template.category}</Badge>
                  <Badge>{template.industryLabel}</Badge>
                  {override && <Badge tone="green">Bearbeitet</Badge>}
                </div>
                <h2 className="mt-4 text-xl font-medium text-ink">
                  {template.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink2">
                  {template.bestFor}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink">
                  <span className="font-medium">Kickoff-Ziel:</span>{" "}
                  {template.kickoffGoal}
                </p>
                <Link
                  href={`/${safe}/portal/admin?template=${template.id}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                >
                  Für neues Projekt nutzen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Lightbulb className="h-4 w-4 text-copper" />
                    Quick Wins
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                    {template.quickWins.slice(0, 4).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Sparkles className="h-4 w-4 text-copper" />
                    Automatisierung
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                    {template.automationIdeas.slice(0, 4).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <ClipboardList className="h-4 w-4 text-copper" />
                    Diagnosefragen
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                    {template.discoveryQuestions.slice(0, 4).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-copper">?</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <ShieldAlert className="h-4 w-4 text-copper" />
                    Risiken
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                    {template.risks.slice(0, 4).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 border-t border-hairline pt-6 md:grid-cols-5">
              {asdarStages.map((stage) => (
                <div key={stage.value} className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="copper">{stage.letter}</Badge>
                    <div className="text-sm font-medium text-ink">
                      {stage.label}
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-muted">
                    {template.asdarPlan[stage.value].slice(0, 2).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <details className="mt-6 rounded-lg border border-hairline bg-bg p-4">
              <summary className="cursor-pointer text-sm font-medium text-copper">
                Template bearbeiten
              </summary>
              <form
                action={saveTemplateOverrideAction}
                className="mt-5 grid gap-4 lg:grid-cols-2"
              >
                <input type="hidden" name="locale" value={safe} />
                <input type="hidden" name="templateId" value={template.id} />
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Name
                  </label>
                  <input
                    name="label"
                    defaultValue={template.label}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Kickoff-Ziel
                  </label>
                  <input
                    name="kickoffGoal"
                    defaultValue={template.kickoffGoal}
                    className={fieldClass}
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-sm text-ink2">
                    Geeignet für
                  </label>
                  <textarea
                    name="bestFor"
                    defaultValue={template.bestFor}
                    className="min-h-20 w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-sm text-ink2">
                    Zusammenfassung
                  </label>
                  <textarea
                    name="summary"
                    defaultValue={template.summary}
                    className="min-h-20 w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Quick Wins, eine Zeile pro Punkt
                  </label>
                  <textarea
                    name="quickWins"
                    defaultValue={template.quickWins.join("\n")}
                    className="min-h-36 w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Automatisierungsideen
                  </label>
                  <textarea
                    name="automationIdeas"
                    defaultValue={template.automationIdeas.join("\n")}
                    className="min-h-36 w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Diagnosefragen
                  </label>
                  <textarea
                    name="discoveryQuestions"
                    defaultValue={template.discoveryQuestions.join("\n")}
                    className="min-h-36 w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink2">
                    Risiken
                  </label>
                  <textarea
                    name="risks"
                    defaultValue={template.risks.join("\n")}
                    className="min-h-36 w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi lg:col-span-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Template speichern
                </button>
              </form>
            </details>
          </PortalCard>
        );
        })}

        {templates.length === 0 && (
          <PortalCard>
            <div className="flex gap-3 text-sm text-ink2">
              <BookOpen className="h-4 w-4 shrink-0 text-copper" />
              Keine Templates passen zur Suche.
            </div>
          </PortalCard>
        )}
      </div>
    </PortalShell>
  );
}
