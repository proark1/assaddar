import type { Metadata } from "next";
import { ArrowRight, Calendar, Mail, Phone } from "lucide-react";
import { CAL_LINK, getDict, isLocale, type Locale } from "@/content";
import { ContactForm } from "@/components/contact-form";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { landingToolsContent } from "@/lib/landing-tools-content";

function splitActions(value?: string) {
  return value
    ? value
        .split("|")
        .map((action) => action.trim())
        .filter(Boolean)
    : [];
}

function parseReadiness(value?: string) {
  return value
    ? value
        .split(",")
        .map((item) => Number.parseInt(item, 10))
        .filter((item) => item >= 1 && item <= 5)
    : [];
}

function numbered(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

export function generateStaticParams() {
  return [{ locale: "de" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  return {
    title: t.termin.title,
    description: t.termin.intro,
    alternates: {
      canonical: `/${safe}/termin`,
      languages: {
        de: "/de/termin",
        en: "/en/termin",
        "x-default": "/de/termin",
      },
    },
  };
}

export default async function TerminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    source?: string;
    score?: string;
    band?: string;
    phase?: string;
    bandBody?: string;
    nextStep?: string;
    industryKey?: string;
    industry?: string;
    industryFocus?: string;
    readiness?: string;
    bottleneckIndex?: string;
    bottleneck?: string;
    lever?: string;
    actions?: string;
    people?: string;
    manualHours?: string;
    hourlyRate?: string;
    automationRate?: string;
    monthlyHours?: string;
    monthlyValue?: string;
    annualValue?: string;
  }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const tt = t.termin;
  const email = t.finalCta.email;
  const isDe = safe === "de";
  const tools = landingToolsContent[safe];
  const actions = splitActions(query.actions);
  const readiness = parseReadiness(query.readiness);
  const selectedIndustry = tools.industries.find(
    (industry) => industry.key === query.industryKey,
  );
  const score = Number.parseInt(query.score || "", 10);
  const band = Number.isFinite(score)
    ? tools.bands.find((entry) => score <= entry.max)
    : undefined;
  const readinessLines =
    readiness.length === tools.areas.length
      ? tools.areas.map((area, index) => {
          const value = readiness[index] ?? 1;
          const answer = tools.scale[value - 1];
          return [
            `${index + 1}. ${area.label}: ${value}/5 (${answer})`,
            `   ${isDe ? "Frage" : "Question"}: ${area.description}`,
            `   ${isDe ? "Hebel" : "Lever"}: ${area.lever}`,
          ].join("\n");
        })
      : [];
  const leadContext =
    query.source === "asdar-check"
      ? [
          isDe ? "ASDAR Potenzial-Check" : "ASDAR potential check",
          query.score && `Score: ${query.score}/100`,
          query.band && `${isDe ? "Einordnung" : "Assessment"}: ${query.band}`,
          query.industry && `${isDe ? "Profil" : "Profile"}: ${query.industry}`,
          query.bottleneck &&
            `${isDe ? "Engpass" : "Bottleneck"}: ${query.bottleneck}`,
          query.lever &&
            `${isDe ? "Erster Automatisierungshebel" : "First automation lever"}: ${query.lever}`,
          actions.length > 0 &&
            `${isDe ? "Nächste Aktionen" : "Next actions"}:\n${actions
              .map((action, index) => `${index + 1}. ${action}`)
              .join("\n")}`,
          query.monthlyHours &&
            `${isDe ? "Geschätzte freie Stunden/Monat" : "Estimated free hours/month"}: ${query.monthlyHours}`,
          query.monthlyValue &&
            `${isDe ? "Geschätzter Wert/Monat" : "Estimated value/month"}: ${query.monthlyValue} EUR`,
          query.annualValue &&
            `${isDe ? "Geschätzter Wert/Jahr" : "Estimated value/year"}: ${query.annualValue} EUR`,
        ]
          .filter(Boolean)
          .join("\n")
      : "";
  const checkLeadContext =
    query.source === "asdar-check"
      ? [
          isDe ? "ASDAR Potenzial-Check" : "ASDAR potential check",
          isDe ? "Ergebnis" : "Result",
          query.score && `Score: ${query.score}/100`,
          query.band && `${isDe ? "Einordnung" : "Assessment"}: ${query.band}`,
          (band?.phase || query.phase) &&
            `${isDe ? "ASDAR Phase" : "ASDAR phase"}: ${band?.phase || query.phase}`,
          (band?.body || query.bandBody) &&
            `${isDe ? "Einordnungstext" : "Assessment text"}: ${band?.body || query.bandBody}`,
          (band?.nextStep || query.nextStep) &&
            `${isDe ? "Beratungsschritt" : "Consulting step"}: ${band?.nextStep || query.nextStep}`,
          isDe ? "Geklicktes Profil" : "Clicked profile",
          `${isDe ? "Profil" : "Profile"}: ${
            selectedIndustry?.label || query.industry || "-"
          }`,
          `${isDe ? "Fokus" : "Focus"}: ${
            selectedIndustry?.focus || query.industryFocus || "-"
          }`,
          readinessLines.length > 0 &&
            `${isDe ? "Alle Antworten" : "All answers"}:\n${readinessLines.join("\n")}`,
          query.bottleneck &&
            `${isDe ? "Engpass" : "Bottleneck"}: ${query.bottleneck}`,
          query.lever &&
            `${isDe ? "Erster Automatisierungshebel" : "First automation lever"}: ${query.lever}`,
          actions.length > 0 &&
            `${isDe ? "Naechste Aktionen" : "Next actions"}:\n${numbered(actions)}`,
          isDe ? "Zeitwert-Annahmen" : "Time value assumptions",
          query.people &&
            `${isDe ? "Beteiligte Personen" : "People involved"}: ${query.people}`,
          query.manualHours &&
            `${isDe ? "Manuelle Stunden pro Person/Woche" : "Manual hours per person/week"}: ${query.manualHours}`,
          query.hourlyRate &&
            `${isDe ? "Interner Stundensatz" : "Internal hourly rate"}: ${query.hourlyRate} EUR`,
          query.automationRate &&
            `${isDe ? "Reduzierbarer Anteil" : "Reducible share"}: ${query.automationRate}%`,
          isDe ? "Berechneter Zeitwert" : "Calculated time value",
          query.monthlyHours &&
            `${isDe ? "Geschaetzte freie Stunden/Monat" : "Estimated free hours/month"}: ${query.monthlyHours}`,
          query.monthlyValue &&
            `${isDe ? "Geschaetzter Wert/Monat" : "Estimated value/month"}: ${query.monthlyValue} EUR`,
          query.annualValue &&
            `${isDe ? "Geschaetzter Wert/Jahr" : "Estimated value/year"}: ${query.annualValue} EUR`,
        ]
          .filter((line): line is string => typeof line === "string" && line.length > 0)
          .join("\n")
      : leadContext;
  const initialMessage =
    query.source === "asdar-check"
      ? isDe
        ? "Ich möchte den ASDAR Check besprechen und klären, welcher Prozess zuerst vereinfacht werden sollte."
        : "I would like to discuss the ASDAR check and clarify which process should be simplified first."
      : "";

  return (
    <>
      <Nav t={t.nav} locale={safe} subpage />

      <main id="main" className="outline-none">
        <section className="mx-auto w-full max-w-[760px] px-6 py-16 md:px-10 md:py-20">
          <h1 className="font-serif text-3xl font-normal leading-tight text-ink md:text-[44px]">
            {tt.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink2">
            {tt.intro}
          </p>

          <div className="mt-10 rounded-2xl border border-hairline bg-surface p-6 shadow-card md:p-8">
            <h2 className="mb-6 font-serif text-xl font-normal text-ink">
              {tt.formTitle}
            </h2>
            <ContactForm
              t={tt}
              email={email}
              locale={safe}
              leadContext={checkLeadContext}
              initialMessage={initialMessage}
            />
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-hairline bg-surface2 p-6">
              <h3 className="text-base font-medium text-ink">{tt.directTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {tt.directNote}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 text-copper hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {email}
                </a>
                <div className="flex items-center gap-2 text-ink2">
                  <Phone className="h-4 w-4 text-copper" />
                  {tt.phone}
                </div>
              </div>
            </div>

            {CAL_LINK && (
              <div className="flex flex-col rounded-xl border border-copper/30 bg-surface2 p-6">
                <h3 className="text-base font-medium text-ink">{tt.calTitle}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink2">
                  {tt.calNote}
                </p>
                <a
                  href={`https://cal.com/${CAL_LINK}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
                >
                  <Calendar className="h-4 w-4" />
                  {tt.calCta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
