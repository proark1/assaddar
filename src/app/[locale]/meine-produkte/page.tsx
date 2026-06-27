import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  Layers3,
  Mic2,
  Rocket,
  Sparkles,
  Video,
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
    "onepizza.io": {
      logoSrc: "/products/onepizza-logo.svg",
      logoAlt: "onepizza.io Logo",
      eyebrow: "Video Meeting Platform",
      headline: "Eine eigene Meeting-Plattform statt fremder Meeting-Blackbox.",
      summary:
        "onepizza.io ist eine vollständige Videokonferenz-Plattform mit WebRTC, Breakout-Rooms, Broadcast-Modus, Chat, Recording, Live Captions, virtuellen Hintergründen, Polls, Q&A und einer Developer API.",
      audience:
        "Für Teams, Communities und Produkte, die Meetings, Events, Workshops oder integrierbare Video-Funktionen kontrolliert selbst betreiben wollen.",
      core: [
        "Video, Audio, Screensharing, Chat, Recording, Breakouts, Wartelobby, Reactions, Polls und Q&A.",
        "Developer API, Webhooks, MCP-Server, Admin-Analytics, Templates, wiederkehrende Meetings und Billing.",
        "Skalierbare Architektur mit Express, Socket.IO, WebRTC, optionalem LiveKit-SFU, PostgreSQL, Redis und Storage-Anbindung.",
      ],
      proof: [
        "Zeigt, wie komplexe Realtime-Produkte aus UX, Infrastruktur, Datenschutz und Betrieb zusammengebaut werden.",
        "Verbindet Meeting-Erlebnis, Admin-Steuerung, Zahlungslogik, Developer Experience und Automatisierung.",
        "Relevanter Beratungsbeweis für interne Plattformen, Kundenportale, Event-Systeme und AI-Meeting-Workflows.",
      ],
      icon: Video,
    },
    "justheretolisten.io": {
      logoSrc: "/products/justheretolisten-logo.svg",
      logoAlt: "justheretolisten.io Logo",
      eyebrow: "AI Meeting Bot API",
      headline: "Ein Meeting-Bot, der aus Gesprächen verwertbare Arbeit macht.",
      summary:
        "justheretolisten.io sendet Bots in Zoom, Google Meet, Microsoft Teams und onepizza.io Meetings, zeichnet auf, transkribiert und analysiert Gespräche mit Claude oder Gemini.",
      audience:
        "Für Unternehmen, die Meetings automatisch dokumentieren, Entscheidungen sichern, Aufgaben ableiten und Wissen aus Gesprächen nutzbar machen wollen.",
      core: [
        "Bots für Meetings, Transkription, Zusammenfassung, Speaker Analytics, Entscheidungen, Aufgaben und Follow-ups.",
        "Multi-tenant API mit Credits, Business Accounts, SDKs, Webhooks, SSO, Kalenderlogik und Integrationen.",
        "Consent- und Datenschutzfunktionen, Trust-Seite, Löschanfragen, Approval Queues und Auditability.",
      ],
      proof: [
        "Zeigt, wie AI-Agenten in reale Arbeitsabläufe eingebettet werden, ohne Compliance und Kontrolle zu verlieren.",
        "Verbindet API-Design, Bot-Infrastruktur, Meeting-Plattformen, LLM-Auswertung und Business-Prozesse.",
        "Relevanter Beratungsbeweis für Wissensmanagement, Sales Ops, Projektsteuerung und Führungskommunikation.",
      ],
      icon: Bot,
    },
    EduPraxis: {
      logoSrc: "/products/edupraxis-logo.svg",
      logoAlt: "EduPraxis Logo",
      eyebrow: "Schulmanagement-System",
      headline: "Digitale Schulverwaltung für deutsche Realität.",
      summary:
        "EduPraxis ist eine GDPR-first Plattform für deutsche Schulen und Bildungsträger: Verwaltung, Kommunikation, Noten, Stundenplan, Fortbildungen, Elternprozesse und Schulorganisation.",
      audience:
        "Für Schulen, Schulträger und Bildungseinrichtungen, die Verwaltung digitalisieren wollen, ohne Datenschutz, Rollenlogik und deutsche Anforderungen zu unterschätzen.",
      core: [
        "Module für Kommunikation, Noten, Stundenplan, Fortbildungen, Organisation und Elternprozesse.",
        "Schema-per-tenant PostgreSQL, Ory Kratos, Rollen-/Modulrechte, Admin-Tool, API und Worker.",
        "Ausgelegt auf deutsche Datenresidenz, Minderjährigenschutz, Auditlogs und Compliance-Artefakte.",
      ],
      proof: [
        "Zeigt, wie man Software für regulierte, sensible und organisatorisch komplexe Umfelder baut.",
        "Verbindet Produktarchitektur, Identity, Mandantenfähigkeit, Rechte, Compliance und operative Nutzerführung.",
        "Relevanter Beratungsbeweis für öffentliche Einrichtungen, Bildung, Verwaltung und andere regulierte Organisationen.",
      ],
      icon: GraduationCap,
    },
    "Empires of the Near East": {
      logoSrc: "/products/aoeclaude-logo.svg",
      logoAlt: "Empires of the Near East Logo",
      eyebrow: "Browser RTS / Strategy Game",
      headline: "Ein Strategiespiel als Echtzeit-Systembeweis.",
      summary:
        "aoeclaude ist ein browserbasiertes Age-of-Empires-artiges Strategiespiel mit Three.js, WebGPU/WebGL2, Economy, Construction, Combat, Bots, Factions und Multiplayer-Shards.",
      audience:
        "Für alle, die sehen wollen, dass Produktdenken auch Realtime, Simulation, Multiplayer, Rendering und komplexe Zustandsmodelle abdecken kann.",
      core: [
        "Shared Game Core für Browser und autoritativen WebSocket-Server.",
        "Economy, Bau, Kampf, Fog of War, Accounts/PIN, persistente Shards, Bots, Factions und Heroes.",
        "Minigames, Chat, Alliances, Leaderboards, Wallets, Shops und Admin-Content-Tools.",
      ],
      proof: [
        "Zeigt technische Breite jenseits klassischer Business-Software: Simulation, Realtime, Rendering und Multiplayer.",
        "Verbindet Client-Performance, Server-Autorität, Produktlogik, Content-Systeme und Spielbalance.",
        "Relevanter Beratungsbeweis für komplexe Plattformen, Echtzeit-Dashboards und interaktive Workflows.",
      ],
      icon: Gamepad2,
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
    "onepizza.io": {
      logoSrc: "/products/onepizza-logo.svg",
      logoAlt: "onepizza.io logo",
      eyebrow: "Video Meeting Platform",
      headline: "A meeting platform of your own, not a black box.",
      summary:
        "onepizza.io is a full video meeting platform with WebRTC, breakout rooms, broadcast mode, chat, recording, live captions, virtual backgrounds, polls, Q&A, and a developer API.",
      audience:
        "For teams, communities, and products that want to run meetings, events, workshops, or embedded video features under their own control.",
      core: [
        "Video, audio, screen sharing, chat, recording, breakouts, waiting room, reactions, polls, and Q&A.",
        "Developer API, webhooks, MCP server, admin analytics, templates, recurring meetings, and billing.",
        "Scalable architecture with Express, Socket.IO, WebRTC, optional LiveKit SFU, PostgreSQL, Redis, and storage integrations.",
      ],
      proof: [
        "Shows how complex realtime products combine UX, infrastructure, privacy, and operations.",
        "Connects meeting experience, admin control, payment logic, developer experience, and automation.",
        "Relevant consulting proof for internal platforms, client portals, event systems, and AI meeting workflows.",
      ],
      icon: Video,
    },
    "justheretolisten.io": {
      logoSrc: "/products/justheretolisten-logo.svg",
      logoAlt: "justheretolisten.io logo",
      eyebrow: "AI Meeting Bot API",
      headline: "A meeting bot that turns conversations into useful work.",
      summary:
        "justheretolisten.io sends bots into Zoom, Google Meet, Microsoft Teams, and onepizza.io meetings to record, transcribe, and analyze conversations with Claude or Gemini.",
      audience:
        "For companies that want to document meetings automatically, capture decisions, derive tasks, and make meeting knowledge reusable.",
      core: [
        "Meeting bots, transcription, summaries, speaker analytics, decisions, tasks, and follow-ups.",
        "Multi-tenant API with credits, business accounts, SDKs, webhooks, SSO, calendar logic, and integrations.",
        "Consent and privacy features, trust page, deletion requests, approval queues, and auditability.",
      ],
      proof: [
        "Shows how AI agents can be embedded into real workflows without losing compliance and control.",
        "Connects API design, bot infrastructure, meeting platforms, LLM analysis, and business processes.",
        "Relevant consulting proof for knowledge management, sales ops, project steering, and leadership communication.",
      ],
      icon: Bot,
    },
    EduPraxis: {
      logoSrc: "/products/edupraxis-logo.svg",
      logoAlt: "EduPraxis logo",
      eyebrow: "School Management System",
      headline: "Digital school administration for German reality.",
      summary:
        "EduPraxis is a GDPR-first platform for German schools and education providers: administration, communication, grades, timetables, professional development, parent workflows, and school operations.",
      audience:
        "For schools, school operators, and education organizations that want to digitalize administration without underestimating privacy, roles, and German requirements.",
      core: [
        "Modules for communication, grades, timetables, professional development, operations, and parent workflows.",
        "Schema-per-tenant PostgreSQL, Ory Kratos, role/module permissions, admin tool, API, and workers.",
        "Designed for German data residency, minor-data protection, audit logs, and compliance artifacts.",
      ],
      proof: [
        "Shows how to build software for regulated, sensitive, and organizationally complex environments.",
        "Connects product architecture, identity, tenancy, permissions, compliance, and operational UX.",
        "Relevant consulting proof for public institutions, education, administration, and other regulated organizations.",
      ],
      icon: GraduationCap,
    },
    "Empires of the Near East": {
      logoSrc: "/products/aoeclaude-logo.svg",
      logoAlt: "Empires of the Near East logo",
      eyebrow: "Browser RTS / Strategy Game",
      headline: "A strategy game as proof of realtime systems thinking.",
      summary:
        "aoeclaude is a browser-based Age-of-Empires-style strategy game with Three.js, WebGPU/WebGL2, economy, construction, combat, bots, factions, and multiplayer shards.",
      audience:
        "For anyone who wants to see product thinking applied to realtime, simulation, multiplayer, rendering, and complex state models.",
      core: [
        "Shared game core for browser and authoritative WebSocket server.",
        "Economy, building, combat, fog of war, accounts/PIN, persistent shards, bots, factions, and heroes.",
        "Minigames, chat, alliances, leaderboards, wallets, shops, and admin content tools.",
      ],
      proof: [
        "Shows technical range beyond classic business software: simulation, realtime, rendering, and multiplayer.",
        "Connects client performance, server authority, product logic, content systems, and game balance.",
        "Relevant consulting proof for complex platforms, realtime dashboards, and interactive workflows.",
      ],
      icon: Gamepad2,
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
        ? "Eigene KI- und Softwareprodukte von Assad Dar: Training, Startup-OS, Meeting-Plattform, Meeting-Bots, Schulmanagement und Browser-Strategiespiel."
        : "Assad Dar's own AI and software products: training, startup OS, meeting platform, meeting bots, school management, and browser strategy game.",
    alternates: {
      canonical: `/${safe}/meine-produkte`,
      languages: {
        de: "/de/meine-produkte",
        en: "/en/meine-produkte",
        "x-default": "/de/meine-produkte",
      },
    },
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
        ...(product.href ? { url: product.href } : {}),
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
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
                    <div className="mt-3 break-words text-center text-sm font-medium leading-snug text-ink">
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
                            sizes="80px"
                            className="h-20 w-20 object-contain"
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
                        {product.href ? (
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
                        ) : (
                          <div className="mt-6 inline-flex rounded-md border border-hairline bg-surface px-3 py-1.5 text-[12px] font-medium text-muted">
                            {isDe ? "Portfolio-Projekt" : "Portfolio project"}
                          </div>
                        )}
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
                    text: "Diese Produkte zeigen, dass ich nicht bei Strategie stehenbleibe, sondern Produktlogik, UX, Datenmodell und Betrieb zusammenbringe.",
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
                    text: "These products show that I do not stop at strategy, but connect product logic, UX, data models, and operations.",
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
