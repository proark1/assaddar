import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDict, isLocale, SITE_URL, type Locale } from "@/content";
import { aboutContent } from "@/about";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

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
  const a = aboutContent[safe];
  const title =
    safe === "de"
      ? "Über Assad Dar — Digital- & KI-Transformation"
      : "About Assad Dar — Digital & AI transformation";
  return {
    title,
    description: a.headline,
    alternates: { canonical: `/${safe}/ueber-mich` },
    openGraph: { type: "profile", title, description: a.headline, url: `/${safe}/ueber-mich` },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const a = aboutContent[safe];

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Assad Dar",
    jobTitle:
      safe === "de"
        ? "Digital- & KI-Transformationsberater"
        : "Digital & AI transformation advisor",
    url: `${SITE_URL}/${safe}/ueber-mich`,
    sameAs: ["https://linkedin.com/in/assaddar"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mönchengladbach",
      addressCountry: "DE",
    },
    alumniOf: "FHDW Bergisch Gladbach",
    knowsLanguage: ["de", "en"],
    worksFor: { "@type": "Organization", name: "OYA Play" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      <Nav t={t.nav} locale={safe} subpage />

      <main id="main" className="outline-none">
        <div className="mx-auto w-full max-w-[1000px] px-6 py-16 md:px-10 md:py-20">
          {/* Hero */}
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
            {a.kicker}
          </span>
          <h1 className="mt-5 max-w-3xl font-serif text-3xl font-normal leading-[1.15] text-ink md:text-[46px]">
            {a.headline}
          </h1>
          <div className="mt-7 max-w-2xl space-y-4">
            {a.lead.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-ink2">
                {p}
              </p>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 border-y border-hairline py-8 md:grid-cols-4">
            {a.stats.map((s, i) => (
              <div key={i}>
                <div className="font-serif text-3xl text-copper md:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-[12.5px] text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Three worlds */}
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
              {a.worldsTitle}
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {a.worlds.map((w) => (
                <div
                  key={w.tag}
                  className="flex h-full flex-col rounded-xl border border-hairline bg-surface p-6 shadow-card"
                >
                  <span className="inline-flex w-fit rounded-md bg-copper/10 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                    {w.tag}
                  </span>
                  <h3 className="mt-4 font-serif text-lg text-ink">{w.title}</h3>
                  <div className="mt-1 text-[12.5px] text-muted">{w.org}</div>
                  <p className="mt-3 text-sm leading-relaxed text-ink2">{w.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
              {a.timelineTitle}
            </h2>
            <div className="mt-8 space-y-8 border-l border-hairline pl-6 md:pl-8">
              {a.timeline.map((e, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-copper bg-bg md:-left-[39px]" />
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    {e.period} · {e.world}
                  </div>
                  <h3 className="mt-1 text-base font-medium text-ink">
                    {e.role}{" "}
                    <span className="text-copper">· {e.org}</span>
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {e.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="flex gap-2 text-sm leading-relaxed text-ink2"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Expertise + reach */}
          <section className="mt-16 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl font-normal text-ink">
                {a.expertiseTitle}
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {a.expertise.map((x) => (
                  <span
                    key={x}
                    className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-[13px] text-ink2"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-normal text-ink">
                {a.reachTitle}
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-ink2">
                {a.reachText}
              </p>
            </div>
          </section>

          {/* Why me */}
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
              {a.whyTitle}
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {a.why.map((w) => (
                <div
                  key={w.title}
                  className="rounded-xl border border-hairline bg-surface p-6 shadow-card"
                >
                  <h3 className="text-base font-medium text-ink">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">{w.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education + languages */}
          <section className="mt-16 grid gap-8 border-t border-hairline pt-10 sm:grid-cols-2">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {a.eduTitle}
              </div>
              <p className="mt-2 text-sm text-ink2">{a.education}</p>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {a.languagesTitle}
              </div>
              <p className="mt-2 text-sm text-ink2">{a.languages}</p>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 rounded-2xl border border-copper/30 bg-surface2 p-8 text-center shadow-card md:p-12">
            <h2 className="mx-auto max-w-2xl font-serif text-2xl font-normal text-ink md:text-3xl">
              {a.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink2">
              {a.ctaText}
            </p>
            <Link
              href={`/${safe}/termin`}
              className="group mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
            >
              {a.ctaButton}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>
        </div>
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
