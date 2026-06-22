import type { Locale } from "@/content";

export type AboutStat = { value: string; label: string };
export type AboutWorld = { tag: string; title: string; org: string; text: string };
export type AboutProduct = {
  name: string;
  href: string;
  repo: string;
  repoHref: string;
  tagline: string;
  text: string;
  bullets: string[];
};
export type AboutWhy = { title: string; text: string };

export type AboutContent = {
  kicker: string;
  headline: string;
  lead: string[];
  stats: AboutStat[];
  worldsTitle: string;
  worlds: AboutWorld[];
  productsTitle: string;
  products: AboutProduct[];
  expertiseTitle: string;
  expertise: string[];
  reachTitle: string;
  reachText: string;
  whyTitle: string;
  why: AboutWhy[];
  eduTitle: string;
  education: string;
  languagesTitle: string;
  languages: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  backHome: string;
};

const de: AboutContent = {
  kicker: "Über mich",
  headline:
    "Konzern-Disziplin, Mittelstands-Pragmatismus und Gründer-Mentalität — in einer Person.",
  lead: [
    "Ich bin Assad Dar: Transformations-Executive und Unternehmer mit 19 Jahren internationaler Führungserfahrung — zu Hause an der Schnittstelle von IT und Business. Ich habe als dualer Student im Konzern angefangen, später digitale Transformation dort verantwortet, wo Prozesse reguliert und komplex sind — in globalen Pharma-Konzernen — und ich habe zwei eigene Unternehmen aufgebaut, finanziert und geführt.",
    "Diese Kombination ist selten: Ich kenne die Governance und Methodik des Konzerns, den Pragmatismus und das Budget des Mittelstands und die Geschwindigkeit eines Gründers — weil ich in allen drei Welten selbst gearbeitet habe. Ich weiß, wie sich Ihre Lage anfühlt, und helfe konkret, statt nur zu präsentieren. Genau das brauchen Unternehmen, die KI und Digitalisierung nicht als Spielerei wollen, sondern als messbaren Hebel.",
  ],
  stats: [
    { value: "19", label: "Jahre internationale Führung" },
    { value: "14 Mio. $+", label: "Kapital eingeworben" },
    { value: "2", label: "Unternehmen gegründet & geführt" },
    { value: "12", label: "Jahre globale Pharma-Transformation" },
  ],
  worldsTitle: "Drei Welten, eine Methode",
  worlds: [
    {
      tag: "Konzern",
      title: "Globale Marken bei Bayer",
      org: "Bayer AG",
      text: "Als Digital Lead habe ich die digitale Transformation globaler OTC-Marken wie Aspirin, Bepanthen und Rennie verantwortet — in einem multinationalen, streng regulierten Umfeld mit Berichtslinie bis zur Führungsebene.",
    },
    {
      tag: "Mittelstand",
      title: "Transformation im Mittelstand",
      org: "Bionorica",
      text: "Als Director Global Digital Transformation habe ich die digitale Transformationsfunktion eines mittelständischen Pharmaunternehmens — mit Marken wie Sinupret — aufgebaut und geleitet: Commercial Operating Model, Agile Governance und OKR, E-Commerce und neue digitale Geschäftsmodelle.",
    },
    {
      tag: "Eigene Startups",
      title: "Selbst gegründet, finanziert, skaliert",
      org: "MoonGaming · OYA Play",
      text: "Ich habe zwei internationale Plattform-Unternehmen von null aufgebaut, über 14 Mio. $ eingeworben und KI-gestützte Betriebsarchitekturen selbst entworfen und betrieben — mit voller P&L-Verantwortung.",
    },
  ],
  productsTitle: "Meine Produkte",
  products: [
    {
      name: "unmutenow.ai",
      href: "https://unmutenow.ai",
      repo: "socialpilotai",
      repoHref: "https://github.com/proark1/socialpilotai",
      tagline: "AI Communication Training Platform",
      text:
        "KI-gestuetzte Trainingsplattform fuer reale Kommunikationssituationen: Nutzer ueben Gespraeche mit AI-Personas, erhalten Coaching und sehen messbare Fortschritte.",
      bullets: [
        "Voice-basierte AI-Praxis-Sessions fuer soziale, berufliche und eigene Szenarien.",
        "Coaching-Modi, Rollentausch, adaptive Schwierigkeit und Post-Session-Analytics.",
        "Learning Paths, Voice Training, Situation Prep, Gamification und Credit Wallet.",
      ],
    },
    {
      name: "1tab.ai",
      href: "https://1tab.ai",
      repo: "1tabai",
      repoHref: "https://github.com/proark1/1tabai",
      tagline: "AI-Powered Startup Operating System",
      text:
        "Full-Stack SaaS-Workspace fuer Gruenderteams: Research, Planung, Umsetzung und Launch in einem System statt verteilt ueber Notion, Asana, Miro und weitere Tools.",
      bullets: [
        "25+ Module fuer Strategie, Aufgaben, OKR, CRM, Pitch Deck, Finance, Research und Teamarbeit.",
        "Credit-basierte Gemini-AI ueber Supabase Edge Functions und kollaborative Workflows.",
        "Offline-first PWA mit Supabase Auth, Postgres, Realtime, Storage und Edge Functions.",
      ],
    },
  ],
  expertiseTitle: "Worin ich tief bin",
  expertise: [
    "KI-gestützte Unternehmenstransformation",
    "Prozess- & Systemarchitektur (SAP, Process Governance)",
    "Commercial Operating Model Redesign",
    "Digital- & Datenmonetarisierung",
    "Agile Governance & OKR",
    "P&L-Verantwortung & Performance-Management",
    "Cross-Border-Strukturierung",
    "Kapitalbeschaffung & -allokation",
  ],
  reachTitle: "Deutschland-Kenntnis trifft globale Erfahrung",
  reachText:
    "Ich bin in Deutschland verwurzelt und kenne die Realität regulierter Branchen, des Mittelstands und der DSGVO aus erster Hand. Gleichzeitig habe ich über internationale Märkte hinweg gearbeitet — globale Marken, Cross-Border-Teams, internationale Investoren und mehrstufige Auslandsstrukturen. Lokale Anschlussfähigkeit und globale Skalierung sind für mich kein Widerspruch.",
  whyTitle: "Warum ich der richtige Partner für Digital & KI bin",
  why: [
    {
      title: "Ich habe KI selbst eingesetzt — nicht nur empfohlen",
      text: "In meinen eigenen Unternehmen habe ich KI-gestützte Betriebsmodelle entworfen und betrieben. Ich weiß, was in der Praxis trägt und was nur in der Präsentation gut aussieht.",
    },
    {
      title: "Ich war in allen drei Welten selbst",
      text: "Konzern, Mittelstand und eigenes Startup — ich habe in jeder dieser Welten gearbeitet und ihre Zwänge selbst erlebt. Ich verstehe Ihre Lage, statt sie mir aus Folien herzuleiten — und übersetze Konzern-Methodik in das Tempo und Budget, das Ihr Unternehmen tatsächlich hat.",
    },
    {
      title: "Ich finde, wo Prozesse wirklich Geld kosten",
      text: "Durch tiefe Prozess- und Systemarchitektur (SAP, Process Governance) erkenne ich die Stellen, an denen Automatisierung und KI sich rechnen — bevor ein einziges Tool ausgewählt wird.",
    },
    {
      title: "Ergebnis vor Hype",
      text: "19 Jahre P&L-Verantwortung und KPI-getriebene Steuerung. Es geht um messbaren Wert, nicht um KI als Selbstzweck.",
    },
  ],
  eduTitle: "Ausbildung",
  education:
    "Duales Studium bei Bayer — B.Sc. Information Science for Business, FHDW Bergisch Gladbach (2010–2013)",
  languagesTitle: "Sprachen",
  languages: "Deutsch (Muttersprache), Englisch (verhandlungssicher)",
  ctaTitle: "Lassen Sie uns über Ihr Unternehmen sprechen.",
  ctaText:
    "30 Minuten, keine Slides — wir schauen, wo Digital & KI bei Ihnen den größten Hebel haben.",
  ctaButton: "Erstgespräch buchen",
  backHome: "Zur Startseite",
};

const en: AboutContent = {
  kicker: "About",
  headline:
    "Corporate discipline, Mittelstand pragmatism, and a founder's drive — in one person.",
  lead: [
    "I'm Assad Dar: a transformation executive and entrepreneur with 19 years of international leadership experience — at home at the intersection of IT and business. I started as a dual-study student inside a corporation, went on to lead digital transformation where processes are regulated and complex — inside global pharmaceutical corporations — and I built, funded, and ran two companies of my own.",
    "That combination is rare: I know the governance and method of the corporate world, the pragmatism and budget of the Mittelstand, and the speed of a founder — because I've worked in all three worlds myself. I know what your situation feels like, and I help in concrete terms instead of just presenting. That's exactly what companies need when they want AI and digitalization as a measurable lever, not a gimmick.",
  ],
  stats: [
    { value: "19", label: "years of international leadership" },
    { value: "$14M+", label: "capital raised" },
    { value: "2", label: "companies founded & run" },
    { value: "12", label: "years of global pharma transformation" },
  ],
  worldsTitle: "Three worlds, one method",
  worlds: [
    {
      tag: "Corporate",
      title: "Global brands at Bayer",
      org: "Bayer AG",
      text: "As Digital Lead I owned the digital transformation of global OTC brands like Aspirin, Bepanthen, and Rennie — in a multinational, strictly regulated environment with a reporting line to the top.",
    },
    {
      tag: "Mittelstand",
      title: "Transformation in the Mittelstand",
      org: "Bionorica",
      text: "As Director Global Digital Transformation I built and led the digital transformation function of a mid-sized pharma company — with brands like Sinupret: commercial operating model, Agile governance and OKRs, e-commerce, and new digital business models.",
    },
    {
      tag: "Own startups",
      title: "Founded, funded, scaled myself",
      org: "MoonGaming · OYA Play",
      text: "I built two international platform companies from zero, raised over $14M, and designed and ran AI-enabled operating architectures myself — with full P&L accountability.",
    },
  ],
  productsTitle: "My products",
  products: [
    {
      name: "unmutenow.ai",
      href: "https://unmutenow.ai",
      repo: "socialpilotai",
      repoHref: "https://github.com/proark1/socialpilotai",
      tagline: "AI Communication Training Platform",
      text:
        "AI-powered communication training for real-world confidence: users practice conversations with AI personas, get coaching, and track measurable progress.",
      bullets: [
        "Voice-based AI practice sessions for social, business, and custom scenarios.",
        "Coaching modes, role reversal, adaptive difficulty, and post-session analytics.",
        "Learning paths, voice training, situation prep, gamification, and a credit wallet.",
      ],
    },
    {
      name: "1tab.ai",
      href: "https://1tab.ai",
      repo: "1tabai",
      repoHref: "https://github.com/proark1/1tabai",
      tagline: "AI-Powered Startup Operating System",
      text:
        "A full-stack SaaS workspace for startup teams: research, planning, execution, and launch in one system instead of scattered across Notion, Asana, Miro, and other tools.",
      bullets: [
        "25+ modules for strategy, tasks, OKRs, CRM, pitch deck, finance, research, and teamwork.",
        "Credit-based Gemini AI through Supabase Edge Functions and collaborative workflows.",
        "Offline-first PWA with Supabase Auth, Postgres, Realtime, Storage, and Edge Functions.",
      ],
    },
  ],
  expertiseTitle: "Where I'm deep",
  expertise: [
    "AI-driven enterprise transformation",
    "Process & systems architecture (SAP, process governance)",
    "Commercial operating model redesign",
    "Digital & data monetization",
    "Agile governance & OKRs",
    "P&L accountability & performance management",
    "Cross-border structuring",
    "Capital raising & allocation",
  ],
  reachTitle: "German know-how meets global experience",
  reachText:
    "I'm rooted in Germany and know the reality of regulated industries, the Mittelstand, and GDPR first-hand. At the same time I've worked across international markets — global brands, cross-border teams, international investors, and multi-entity structures abroad. Local relevance and global scale aren't a contradiction for me.",
  whyTitle: "Why I'm the right partner for digital & AI",
  why: [
    {
      title: "I've used AI myself — not just recommended it",
      text: "In my own companies I designed and ran AI-enabled operating models. I know what holds up in practice and what only looks good in a deck.",
    },
    {
      title: "I've been in all three worlds myself",
      text: "Corporate, Mittelstand, and my own startup — I've worked in each and felt their constraints first-hand. I understand your situation instead of inferring it from a deck — and I translate corporate method into the speed and budget your company actually has.",
    },
    {
      title: "I find where processes really cost money",
      text: "Through deep process and systems architecture (SAP, process governance) I spot where automation and AI pay off — before a single tool is chosen.",
    },
    {
      title: "Results before hype",
      text: "19 years of P&L accountability and KPI-driven management. It's about measurable value, not AI for its own sake.",
    },
  ],
  eduTitle: "Education",
  education:
    "Dual study program at Bayer — B.Sc. Information Science for Business, FHDW Bergisch Gladbach (2010–2013)",
  languagesTitle: "Languages",
  languages: "German (native), English (fluent)",
  ctaTitle: "Let's talk about your company.",
  ctaText:
    "30 minutes, no slides — we look at where digital & AI give you the biggest leverage.",
  ctaButton: "Book a call",
  backHome: "Back to home",
};

export const aboutContent: Record<Locale, AboutContent> = { de, en };
