import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDict, isLocale, locales, SITE_URL, type Locale } from "@/content";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { FinalCta } from "@/components/sections-server";

const OFFER_DETAILS = {
  de: [
    [
      "Strukturierter Einstieg mit klarer Einordnung von Prozessen, Tools und Daten.",
      "Erste Potenziale, Risiken und schnelle Verbesserungen werden sichtbar.",
      "Sie gehen mit 3 bis 5 konkreten nächsten Schritten aus dem Termin.",
    ],
    [
      "Vollständige ASDAR-Analyse mit Score, Prozessblick und Priorisierung.",
      "Roadmap mit Nutzen, Aufwand, Risiken und realistischer Umsetzungsreihenfolge.",
      "Ideal, wenn mehrere Abteilungen oder Systeme betroffen sind.",
    ],
    [
      "Ein konkreter Use Case wird von Analyse bis Pilot umgesetzt.",
      "Automatisierung, Tool-Setup, Datenstruktur und Team-Einweisung werden verbunden.",
      "Erfolg wird an Zeitgewinn, Qualität oder Durchlaufzeit gemessen.",
    ],
    [
      "Laufendes Sparring für Entscheidungen, Backlog, Umsetzung und Qualität.",
      "Regelmäßige Priorisierung neuer Automatisierungs- und KI-Potenziale.",
      "Geeignet, wenn KI und Digitalisierung dauerhaft in den Betrieb sollen.",
    ],
  ],
  en: [
    [
      "Structured starting point with a clear view of processes, tools, and data.",
      "First opportunities, risks, and quick improvements become visible.",
      "You leave with 3 to 5 concrete next steps.",
    ],
    [
      "Full ASDAR analysis with score, process view, and prioritization.",
      "Roadmap with value, effort, risks, and a realistic implementation sequence.",
      "Ideal when several departments or systems are involved.",
    ],
    [
      "One concrete use case is implemented from analysis to pilot.",
      "Automation, tool setup, data structure, and team onboarding are connected.",
      "Success is measured by time saved, quality, or throughput.",
    ],
    [
      "Ongoing sparring for decisions, backlog, implementation, and quality.",
      "Regular prioritization of new automation and AI opportunities.",
      "Best when AI and digitalization should become part of operations.",
    ],
  ],
} as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const title =
    safe === "de"
      ? "Angebote — KI- & Automatisierungsberatung | Assad Dar"
      : "Services — AI & automation consulting | Assad Dar";

  return {
    title,
    description: t.angebote.sub,
    alternates: {
      canonical: `/${safe}/angebote`,
      languages: {
        de: "/de/angebote",
        en: "/en/angebote",
        "x-default": "/de/angebote",
      },
    },
    openGraph: {
      type: "website",
      title,
      description: t.angebote.sub,
      url: `/${safe}/angebote`,
    },
  };
}

export default async function AngebotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const details = OFFER_DETAILS[safe];
  const isDe = safe === "de";

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isDe ? "Assad Dar Angebote" : "Assad Dar services",
    itemListElement: t.angebote.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: item.product,
        serviceType: item.methodik,
        description: item.purpose,
        provider: {
          "@type": "Person",
          name: "Assad Dar",
          url: `${SITE_URL}/${safe}/ueber-mich`,
        },
        offers: {
          "@type": "Offer",
          price: item.price.replace(/[^\d]/g, ""),
          priceCurrency: "EUR",
        },
      },
    })),
  };

  return (
    <>
      <JsonLd data={serviceLd} />
      <Nav t={t.nav} locale={safe} subpage />

      <main id="main" className="outline-none">
        <div className="mx-auto w-full max-w-[1120px] px-6 py-16 md:px-10 md:py-20">
          <nav
            aria-label={isDe ? "Brotkrumen" : "Breadcrumb"}
            className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted"
          >
            <Link href={`/${safe}`} className="transition-colors hover:text-ink">
              Home
            </Link>
            <span className="text-strong">/</span>
            <span className="text-ink2">{t.angebote.kicker}</span>
          </nav>

          <header className="mt-6 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
              {t.angebote.kicker}
            </span>
            <h1 className="mt-5 font-serif text-3xl font-normal leading-[1.15] text-ink md:text-[46px]">
              {t.angebote.heading}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink2">
              {t.angebote.sub}
            </p>
          </header>

          <section className="mt-14 grid gap-5 md:grid-cols-2">
            {t.angebote.items.map((item, index) => (
              <article
                key={item.product}
                className={`flex h-full flex-col rounded-xl border p-6 shadow-card ${
                  item.featured
                    ? "border-copper bg-surface2"
                    : "border-hairline bg-surface"
                }`}
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                  {t.angebote.methodLabel}: {item.methodik}
                </span>
                <h2 className="mt-3 font-serif text-2xl font-normal text-ink">
                  {item.product}
                </h2>
                <div className="mt-1 text-lg font-medium text-copper">
                  {item.price}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink2">
                  {item.purpose}
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {details[index].map((detail) => (
                    <li
                      key={detail}
                      className="flex gap-2 text-sm leading-relaxed text-ink2"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${safe}/termin`}
                  className="group mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-copper"
                >
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </article>
            ))}
          </section>

          <section className="mt-16 border-t border-hairline pt-10">
            <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
              {isDe ? "So läuft die Zusammenarbeit" : "How the work runs"}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-5">
              {t.method.phases.map((phase) => (
                <div
                  key={phase.letter + phase.title}
                  className="rounded-xl border border-hairline bg-surface p-5"
                >
                  <div className="font-serif text-3xl text-copper">
                    {phase.letter}
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-ink">
                    {phase.title}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                    {phase.result}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <FinalCta t={t.finalCta} />
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
