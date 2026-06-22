import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ExternalLink,
  Layers3,
  Mic2,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";
import { aboutContent } from "@/about";
import { getDict, isLocale, locales, SITE_URL, type Locale } from "@/content";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type ProductStory = {
  logoSrc: string;
  logoAlt: string;
  eyebrow: string;
  headline: string;
  summary: string;
  audience: string;
  core: string[];
  proof: string[];
  icon: typeof Mic2;
};

const PRODUCT_STORIES: Record<Locale, Record<string, ProductStory>> = {
  de: {
    "unmutenow.ai": {
      logoSrc: "/products/unmutenow-logo.png",
      logoAlt: "unmutenow.ai Logo",
      eyebrow: "Voice-first AI Training",
      headline: "Ein sicherer Raum, um echte Gespräche zu üben.",
      summary:
        "unmutenow.ai trainiert Kommunikation nicht abstrakt, sondern in konkreten Situationen: Vorstellungsgespräch, Sales Call, schwieriges Feedback, Networking oder eigene Szenarien. Nutzer sprechen mit AI-Personas, bekommen Coaching und sehen, wo sie besser werden.",
      audience:
        "Für Menschen, die selbstbewusster sprechen, besser reagieren und schwierige Gespräche vorher praktisch trainieren wollen.",
      core: [
        "AI-Rollenspiele mit realistischen Gesprächspartnern und adaptiver Schwierigkeit.",
        "Voice Training mit direktem Feedback zu Klarheit, Struktur und Wirkung.",
        "Learning Paths, Situation Prep, Gamification und Fortschrittsanalyse.",
      ],
      proof: [
        "Zeigt, wie KI nicht nur Text erzeugt, sondern Verhalten trainiert.",
        "Verbindet Voice, Persona-Design, Coaching-Logik und Nutzerdaten zu einem echten Produkt.",
        "Relevanter Beratungsbeweis für Kundenservice, Sales Enablement, HR-Training und interne Schulung.",
      ],
      icon: Mic2,
    },
    "1tab.ai": {
      logoSrc: "/products/1tab-logo.png",
      logoAlt: "1tab.ai Logo",
      eyebrow: "Startup Operating System",
      headline: "Ein Arbeitsraum, der Gründerteams aus Tool-Chaos holt.",
      summary:
        "1tab.ai bündelt die wichtigsten Startup-Workflows in einem System: Strategie, Aufgaben, OKRs, CRM, Research, Pitch Deck, Finance, Docs und Teamarbeit. Ziel ist weniger Kontextwechsel und mehr operative Klarheit.",
      audience:
        "Für Gründer, kleine Teams und Startup-Operatoren, die schneller von Idee zu Umsetzung, Investorengespräch und Wachstum kommen wollen.",
      core: [
        "25+ Module für Strategie, Execution, CRM, Finance, Research und Teamsteuerung.",
        "Credit-basierte Gemini-AI für Gründeraufgaben, Analysen, Texte und operative Workflows.",
        "Offline-first PWA, Realtime-Zusammenarbeit und strukturierte Daten statt verstreuter Tools.",
      ],
      proof: [
        "Zeigt, wie komplexe SaaS-Produkte modular und trotzdem nutzbar aufgebaut werden.",
        "Verbindet Datenmodell, Workflows, AI-Credits, Rollenlogik und Produktivität in einem System.",
        "Relevanter Beratungsbeweis für Prozessplattformen, interne Tools und AI-gestützte Workspaces.",
      ],
      icon: Layers3,
    },
  },
  en: {
    "unmutenow.ai": {
      logoSrc: "/products/unmutenow-logo.png",
      logoAlt: "unmutenow.ai logo",
      eyebrow: "Voice-first AI training",
      headline: "A safe space to practice real conversations.",
      summary:
        "unmutenow.ai trains communication in concrete situations: interviews, sales calls, difficult feedback, networking, or custom scenarios. Users speak with AI personas, receive coaching, and see where they improve.",
      audience:
        "For people who want to speak with more confidence, respond better, and rehearse difficult conversations before they matter.",
      core: [
        "AI roleplays with realistic conversation partners and adaptive difficulty.",
        "Voice training with direct feedback on clarity, structure, and impact.",
        "Learning paths, situation prep, gamification, and progress analytics.",
      ],
      proof: [
        "Shows how AI can train behavior, not only generate text.",
        "Combines voice, persona design, coaching logic, and user data into a real product.",
        "Relevant consulting proof for customer service, sales enablement, HR training, and internal learning.",
      ],
      icon: Mic2,
    },
    "1tab.ai": {
      logoSrc: "/products/1tab-logo.png",
      logoAlt: "1tab.ai logo",
      eyebrow: "Startup operating system",
      headline: "A workspace that gets startup teams out of tool chaos.",
      summary:
        "1tab.ai combines the core workflows of a startup in one system: strategy, tasks, OKRs, CRM, research, pitch deck, finance, docs, and teamwork. The goal is less context switching and more operational clarity.",
      audience:
        "For founders, small teams, and startup operators who want to move faster from idea to execution, investor conversations, and growth.",
      core: [
        "25+ modules for strategy, execution, CRM, finance, research, and team steering.",
        "Credit-based Gemini AI for founder tasks, analysis, writing, and operating workflows.",
        "Offline-first PWA, realtime collaboration, and structured data instead of scattered tools.",
      ],
      proof: [
        "Shows how complex SaaS products can be modular and still usable.",
        "Combines data model, workflows, AI credits, roles, and productivity in one system.",
        "Relevant consulting proof for process platforms, internal tools, and AI-assisted workspaces.",
      ],
      icon: Layers3,
    },
  },
};

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
  const stories = PRODUCT_STORIES[safe];

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

          <header className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              {a.products.map((product) => {
                const story = stories[product.name];

                return (
                  <div
                    key={product.name}
                    className="rounded-xl border border-hairline bg-surface p-5 shadow-card"
                  >
                    <div className="flex h-16 items-center justify-center rounded-lg bg-surface2">
                      <Image
                        src={story.logoSrc}
                        alt={story.logoAlt}
                        width={72}
                        height={72}
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                    <div className="mt-3 text-center text-sm font-medium text-ink">
                      {product.name}
                    </div>
                    <div className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                      {story.eyebrow}
                    </div>
                  </div>
                );
              })}
            </div>
          </header>

          <section className="mt-14 space-y-8">
            {a.products.map((product) => (
              <article
                key={product.name}
                className="overflow-hidden rounded-xl border border-hairline bg-surface shadow-card"
              >
                {(() => {
                  const story = stories[product.name];
                  const Icon = story.icon;

                  return (
                    <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
                      <div className="border-b border-hairline bg-surface2 p-8 lg:border-b-0 lg:border-r">
                        <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-hairline bg-bg shadow-card">
                          <Image
                            src={story.logoSrc}
                            alt={story.logoAlt}
                            width={128}
                            height={128}
                            className="h-20 w-20 object-contain"
                            priority={product.name === "unmutenow.ai"}
                          />
                        </div>
                        <div className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                          {story.eyebrow}
                        </div>
                        <h2 className="mt-3 font-serif text-3xl font-normal leading-tight text-ink">
                          {product.name}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-ink2">
                          {story.audience}
                        </p>
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
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-serif text-2xl font-normal leading-tight text-ink">
                              {story.headline}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink2">
                              {story.summary}
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                          <div>
                            <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                              <Sparkles className="h-3.5 w-3.5" />
                              {isDe ? "Was es kann" : "What it does"}
                            </div>
                            <ul className="mt-4 space-y-2">
                              {story.core.map((item) => (
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

                          <div>
                            <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                              <BrainCircuit className="h-3.5 w-3.5" />
                              {isDe ? "Was es beweist" : "What it proves"}
                            </div>
                            <ul className="mt-4 space-y-2">
                              {story.proof.map((item) => (
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
                        </div>

                      </div>
                    </div>
                  );
                })()}
              </article>
            ))}
          </section>

          <section className="mt-16 grid gap-5 md:grid-cols-3">
            {(isDe
              ? [
                  {
                    icon: Rocket,
                    title: "Vom Konzept zum Produkt",
                    text: "Beide Produkte zeigen, dass ich nicht bei Strategie stehenbleibe, sondern Produktlogik, UX, Datenmodell und Betrieb zusammenbringe.",
                  },
                  {
                    icon: Workflow,
                    title: "Automatisierung im echten Betrieb",
                    text: "Die Systeme arbeiten mit Auth, Datenbanken, AI-APIs, Credits, Realtime-Funktionen und wiederkehrenden Workflows.",
                  },
                  {
                    icon: BrainCircuit,
                    title: "Relevanz für Beratung",
                    text: "Genau diese Erfahrung fließt in Kundenprojekte ein: Prozesse analysieren, sauber strukturieren und erst dann sinnvoll mit KI automatisieren.",
                  },
                ]
              : [
                  {
                    icon: Rocket,
                    title: "From concept to product",
                    text: "Both products show that I do not stop at strategy, but connect product logic, UX, data models, and operations.",
                  },
                  {
                    icon: Workflow,
                    title: "Automation in real operations",
                    text: "The systems use auth, databases, AI APIs, credits, realtime features, and recurring workflows.",
                  },
                  {
                    icon: BrainCircuit,
                    title: "Relevant for consulting",
                    text: "This experience feeds directly into client work: analyze processes, structure them cleanly, then automate with AI where it makes sense.",
                  },
                ]
            ).map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-hairline bg-surface p-6 shadow-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10 text-copper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-medium text-ink">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="mt-16 rounded-xl border border-hairline bg-surface2 p-8 shadow-card">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
                  {isDe
                    ? "Was meine Produkte über meine Beratung sagen"
                    : "What my products say about my consulting"}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink2">
                  {isDe
                    ? "Ich bringe die Perspektive eines Beraters und eines Builders zusammen. Dadurch kann ich nicht nur erklären, was KI leisten könnte, sondern realistisch einschätzen, was technisch, organisatorisch und wirtschaftlich tragfähig ist."
                    : "I combine the perspective of an advisor and a builder. That means I can not only explain what AI could do, but judge what is technically, organizationally, and economically viable."}
                </p>
              </div>
              <Link
                href={`/${safe}/termin`}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-copper"
              >
                {isDe ? "Über ein Projekt sprechen" : "Talk about a project"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
