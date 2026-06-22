import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDict, isLocale, locales, SITE_URL, type Locale } from "@/content";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FinalCta } from "@/components/sections-server";

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
      ? "ASDAR Method — KI-Potenziale strukturiert finden | Assad Dar"
      : "ASDAR Method — find AI potential systematically | Assad Dar";

  return {
    title,
    description: t.method.sub,
    alternates: { canonical: `/${safe}/asdar-method` },
    openGraph: {
      type: "website",
      title,
      description: t.method.sub,
      url: `/${safe}/asdar-method`,
    },
  };
}

export default async function AsdarMethodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const isDe = safe === "de";

  const methodLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "ASDAR Method",
    description: t.method.sub,
    url: `${SITE_URL}/${safe}/asdar-method`,
    step: t.method.phases.map((phase, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: phase.title,
      text: phase.meaning,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(methodLd) }}
      />
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
            <span className="text-ink2">{t.method.kicker}</span>
          </nav>

          <header className="mt-6 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
              {t.method.kicker} {t.method.by}
            </span>
            <h1 className="mt-5 font-serif text-3xl font-normal leading-[1.15] text-ink md:text-[46px]">
              {t.method.heading}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink2">
              {t.method.sub}
            </p>
          </header>

          <section className="mt-12 grid gap-5 md:grid-cols-3">
            {t.method.copy.map((copy, index) => (
              <div
                key={copy}
                className={`rounded-xl border p-6 shadow-card ${
                  index === 2
                    ? "border-copper bg-surface2"
                    : "border-hairline bg-surface"
                }`}
              >
                <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                  {isDe ? `Prinzip ${index + 1}` : `Principle ${index + 1}`}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink2">{copy}</p>
              </div>
            ))}
          </section>

          <section className="mt-16">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
                  {isDe
                    ? "Die fünf Schritte der Methode"
                    : "The five method steps"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink2">
                  {t.method.tagline}
                </p>
              </div>
              <Link
                href={`/${safe}/angebote`}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-copper"
              >
                {isDe ? "Passendes Angebot ansehen" : "View matching service"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5">
              {t.method.phases.map((phase, index) => (
                <article
                  key={`${phase.letter}-${phase.title}`}
                  className="grid gap-5 rounded-xl border border-hairline bg-surface p-6 shadow-card md:grid-cols-[96px_1fr_220px] md:items-center"
                >
                  <div className="flex items-center gap-4 md:block">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-copper/10 font-serif text-3xl text-copper">
                      {phase.letter}
                    </div>
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted md:mt-3">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-ink">
                      {phase.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink2">
                      {phase.meaning}
                    </p>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface2 px-4 py-3 text-sm text-ink2">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                      {isDe ? "Ergebnis" : "Result"}
                    </span>
                    <div className="mt-1">{phase.result}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-hairline bg-surface p-6 shadow-card">
              <h2 className="font-serif text-2xl font-normal text-ink">
                {t.score.heading}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink2">
                {t.score.intro}
              </p>
              <Link
                href={`/${safe}#score`}
                className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-copper"
              >
                {isDe ? "ASDAR Score auf Home nutzen" : "Use ASDAR Score on Home"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="rounded-xl border border-copper/30 bg-surface2 p-6 shadow-card">
              <h2 className="font-serif text-2xl font-normal text-ink">
                {isDe ? "Was am Ende klar ist" : "What is clear at the end"}
              </h2>
              <ul className="mt-5 space-y-2">
                {(isDe
                  ? [
                      "Welche Prozesse wirklich Zeit, Qualität oder Umsatz kosten.",
                      "Welche Daten und Systeme zuerst strukturiert werden müssen.",
                      "Welche KI- und Automatisierungsfälle realistisch starten sollten.",
                    ]
                  : [
                      "Which processes really cost time, quality, or revenue.",
                      "Which data and systems need structure first.",
                      "Which AI and automation use cases should realistically start.",
                    ]
                ).map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-ink2"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <FinalCta t={t.finalCta} />
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
