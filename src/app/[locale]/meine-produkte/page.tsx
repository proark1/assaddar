import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { aboutContent } from "@/about";
import { getDict, isLocale, locales, SITE_URL, type Locale } from "@/content";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

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
  const a = aboutContent[safe];
  const title =
    safe === "de"
      ? "Meine Produkte — Assad Dar"
      : "My products — Assad Dar";

  return {
    title,
    description:
      safe === "de"
        ? "Eigene KI- und Softwareprodukte von Assad Dar: unmutenow.ai und 1tab.ai."
        : "Assad Dar's own AI and software products: unmutenow.ai and 1tab.ai.",
    alternates: { canonical: `/${safe}/meine-produkte` },
    openGraph: {
      type: "website",
      title,
      description: a.products.map((p) => p.name).join(" · "),
      url: `/${safe}/meine-produkte`,
    },
  };
}

export default async function MeineProduktePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const a = aboutContent[safe];
  const isDe = safe === "de";

  const productsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: a.productsTitle,
    itemListElement: a.products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: product.name,
        url: product.href,
        applicationCategory: product.tagline,
        description: product.text,
        creator: {
          "@type": "Person",
          name: "Assad Dar",
          url: `${SITE_URL}/${safe}/ueber-mich`,
        },
        codeRepository: product.repoHref,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsLd) }}
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
            <span className="text-ink2">{a.productsTitle}</span>
          </nav>

          <header className="mt-6 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
              {a.productsTitle}
            </span>
            <h1 className="mt-5 font-serif text-3xl font-normal leading-[1.15] text-ink md:text-[46px]">
              {isDe
                ? "Produkte, die zeigen, wie ich KI wirklich baue."
                : "Products that show how I actually build AI."}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink2">
              {isDe
                ? "Diese Produkte sind mehr als Referenzen: Sie zeigen, dass ich KI-Systeme, Datenmodelle, Nutzerführung, Automatisierung und Betrieb nicht nur konzeptionell verstehe, sondern selbst umsetze."
                : "These products are more than references: they show that I understand AI systems, data models, user flows, automation, and operations not only conceptually, but from building them myself."}
            </p>
          </header>

          <section className="mt-14 grid gap-5 md:grid-cols-2">
            {a.products.map((product) => (
              <article
                key={product.name}
                className="flex h-full flex-col rounded-xl border border-hairline bg-surface p-6 shadow-card"
              >
                <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                  {product.tagline}
                </div>
                <h2 className="mt-3 font-serif text-2xl font-normal text-ink">
                  {product.name}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink2">
                  {product.text}
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {product.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-2 text-sm leading-relaxed text-ink2"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={product.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-copper transition-colors hover:text-copper-hi"
                  >
                    Website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={product.repoHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink2 transition-colors hover:text-copper"
                  >
                    GitHub: {product.repo}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-16 rounded-xl border border-hairline bg-surface2 p-8 shadow-card">
            <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
              {isDe
                ? "Warum das für Beratung wichtig ist"
                : "Why this matters for consulting"}
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {(isDe
                ? [
                    "Ich denke nicht nur in Folien, sondern in nutzbaren Systemen.",
                    "Ich kenne die technischen und operativen Kompromisse aus eigener Umsetzung.",
                    "Ich kann Kunden helfen, von Idee zu Pilot und Betrieb zu kommen.",
                  ]
                : [
                    "I do not only think in slides, but in usable systems.",
                    "I know the technical and operational tradeoffs from building myself.",
                    "I can help clients move from idea to pilot and operations.",
                  ]
              ).map((point) => (
                <div key={point} className="flex gap-2 text-sm leading-relaxed text-ink2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                  {point}
                </div>
              ))}
            </div>
            <Link
              href={`/${safe}/termin`}
              className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-copper"
            >
              {isDe ? "Über ein Projekt sprechen" : "Talk about a project"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>
        </div>
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
