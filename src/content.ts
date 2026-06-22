export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const SITE_URL = "https://assad-dar.de";

// Cal.com booking link, e.g. "assaddar/erstgespraech". Empty = booking button hidden.
export const CAL_LINK = "";

const MAILTO =
  "mailto:assad.dar@gmail.com?subject=ASDAR%20Analyse%20%E2%80%93%20Anfrage";

const de = {
  meta: {
    title: "Assad Dar — KI & Automatisierung für effizientere Unternehmen",
    description:
      "Mit der ASDAR Method analysiert Assad Dar Ihre Abläufe, findet Automatisierungspotenziale und entwickelt eine klare Roadmap für digitale Effizienz.",
  },
  nav: {
    links: [
      { label: "Home", href: "/de" },
      { label: "ASDAR Method", href: "/de/asdar-method" },
      { label: "Angebote", href: "/de/angebote" },
      { label: "Branchen", href: "/de/branchen" },
      { label: "Blog", href: "/de/blog" },
      { label: "Über mich", href: "/de/ueber-mich" },
      { label: "Meine Produkte", href: "/de/meine-produkte" },
    ],
    cta: "Erstgespräch buchen",
    portal: "Portal",
    menu: "Menü",
    close: "Schließen",
    themeToDark: "Dunkles Design",
    themeToLight: "Helles Design",
    skip: "Zum Inhalt springen",
  },
  hero: {
    kicker: "KI & Automatisierung für effizientere Unternehmen",
    line1: "Weniger manuelle Arbeit. Bessere Prozesse.",
    line2: "KI dort, wo sie echten Nutzen bringt.",
    sub: "Mit der ASDAR Method analysiert Assad Dar Ihre Abläufe, findet Automatisierungspotenziale und entwickelt eine klare Roadmap für digitale Effizienz — für Unternehmen mit gewachsenen Prozessen und dem Wunsch nach mehr Effizienz.",
    ctaPrimary: "ASDAR Analyse anfragen",
    ctaPrimaryHref: "/de/termin",
    ctaSecondary: "ASDAR Score berechnen",
    ctaSecondaryHref: "#score",
    ctaSecondaryHint: "5 Fragen, 1 Minute — Ihr KI-Reifegrad.",
  },
  market: {
    kicker: "Warum jetzt",
    heading: "KI ist kein Zukunftsthema mehr.",
    intro:
      "Der Markt braucht nicht nur Inspiration, sondern Struktur und Umsetzung.",
    stats: [
      {
        value: "54,5 %",
        label:
          "der Unternehmen in Deutschland nutzen KI in ihren Geschäftsprozessen",
        source: "ifo Institut, Mai 2026",
      },
      {
        value: "16 %",
        label: "planen den Einsatz von KI konkret",
        source: "ifo Institut, Mai 2026",
      },
      {
        value: "30 %",
        label:
          "haben zuletzt Digitalisierungsprojekte umgesetzt — die digitale Kluft bleibt",
        source: "KfW",
      },
    ],
    note: "Genau hier setzt die ASDAR Method an: erst Prozesse verstehen, dann digitalisieren, dann automatisieren.",
  },
  method: {
    kicker: "ASDAR Method",
    by: "by Assad Dar",
    heading:
      "Der einfache Weg von manueller Arbeit zu smarter Automatisierung.",
    sub: "Ein strukturierter Analyseprozess, der zeigt, wo KI, Automatisierung und digitale Transformation in Ihrem Unternehmen wirklich Nutzen bringen.",
    copy: [
      "Viele Unternehmen arbeiten täglich mit gewachsenen Prozessen, manuellen Aufgaben, E-Mails, Excel-Listen, verstreuten Dokumenten und wiederkehrenden Kundenanfragen. Genau dort liegt oft das größte Potenzial für KI und Automatisierung.",
      "Mit der ASDAR Method analysiert Assad Dar Ihre bestehenden Abläufe, identifiziert Engpässe und entwickelt daraus konkrete Maßnahmen für effizientere Prozesse, bessere Datenstrukturen und sinnvolle KI-Nutzung.",
      "Das Ziel ist nicht, einfach neue Tools einzuführen. Das Ziel ist, Arbeit einfacher, schneller und messbarer zu machen.",
    ],
    phases: [
      {
        letter: "A",
        title: "Analysieren",
        meaning:
          "Bestehende Abläufe, Tools, Daten, Dokumente und Kommunikationswege verstehen.",
        result: "Klarer Ist-Zustand",
      },
      {
        letter: "S",
        title: "Strukturieren",
        meaning:
          "Prozesse vereinfachen, Engpässe sichtbar machen und unnötige Schritte entfernen.",
        result: "Prozessübersicht",
      },
      {
        letter: "D",
        title: "Digitalisieren",
        meaning:
          "Daten, Dokumente und Workflows so aufsetzen, dass sie digital nutzbar werden.",
        result: "Digitale Basis",
      },
      {
        letter: "A",
        title: "Automatisieren",
        meaning:
          "Wiederkehrende Aufgaben mit KI, Automatisierung und besseren Tools reduzieren.",
        result: "Use-Case-Liste",
      },
      {
        letter: "R",
        title: "Realisieren",
        meaning:
          "Umsetzung planen, Mitarbeiter mitnehmen und messbare Ergebnisse schaffen.",
        result: "Roadmap & nächste Schritte",
      },
    ],
    tagline:
      "Analysieren. Strukturieren. Digitalisieren. Automatisieren. Realisieren.",
  },
  score: {
    kicker: "ASDAR Score",
    heading: "Wie bereit ist Ihr Unternehmen für KI und Automatisierung?",
    intro:
      "Bewerten Sie fünf Bereiche mit je 0–20 Punkten. Ihr Gesamtwert zeigt, wo Sie stehen — und wo der Hebel am größten ist.",
    areas: [
      {
        label: "Prozessklarheit",
        question: "Sind die wichtigsten Abläufe klar dokumentiert?",
      },
      {
        label: "Digitale Basis",
        question: "Sind Daten, Dokumente und Systeme nutzbar verbunden?",
      },
      {
        label: "Automatisierungspotenzial",
        question: "Welche wiederkehrenden Aufgaben können reduziert werden?",
      },
      {
        label: "KI-Nutzbarkeit",
        question:
          "Wo kann KI konkret helfen: Text, Daten, Kundenservice, Planung, Reporting?",
      },
      {
        label: "Umsetzungsfähigkeit",
        question: "Sind Team, Tools und Verantwortlichkeiten bereit?",
      },
    ],
    bands: [
      { max: 30, label: "Viele manuelle Abläufe, hohe Reibung" },
      { max: 60, label: "Gute Potenziale, aber fehlende Struktur" },
      { max: 80, label: "Klare Quick Wins und gute Umsetzungsbasis" },
      { max: 100, label: "Sehr gute Grundlage für Skalierung" },
    ],
    resultLabel: "Ihr ASDAR Score",
    ofLabel: "von 100",
    hint: "0 = trifft nicht zu · 20 = voll erfüllt",
    cta: "Ergebnis im Erstgespräch besprechen",
    ctaHref: "#kontakt",
  },
  examples: {
    kicker: "KI in der Praxis",
    heading: "Konkret: Wo KI in Unternehmen heute Zeit spart.",
    intro:
      "Keine Theorie, keine Roboter-Bilder. Acht Abläufe, die fast jedes Unternehmen hat — vorher von Hand, nachher mit KI.",
    labels: {
      before: "Vorher",
      after: "Nachher (mit KI)",
      tools: "Eingesetzte Werkzeuge",
      saves: "Zeitersparnis",
      select: "Ablauf wählen",
    },
    items: [
      {
        icon: "FileText",
        title: "Angebote erstellen",
        before:
          "Der Vertrieb kopiert Angebote aus alten Word-Dateien zusammen, sucht Preise im ERP und formatiert von Hand.",
        beforeTime: "~45 Min / Angebot",
        after:
          "KI erstellt den Entwurf aus CRM-Daten und Ihren Vorlagen. Der Mitarbeiter prüft und versendet.",
        afterTime: "~6 Min / Angebot",
        saves: "≈ 7 Std./Woche bei 10 Angeboten",
        tools: ["GPT-4o", "CRM / ERP", "n8n"],
      },
      {
        icon: "ReceiptText",
        title: "Rechnungen verarbeiten",
        before:
          "Eingangsrechnungen werden von Hand ins System getippt und mit Bestellungen abgeglichen.",
        beforeTime: "~8 Min / Rechnung",
        after:
          "KI liest den Beleg per OCR, bucht vor und markiert nur Abweichungen zur Prüfung.",
        afterTime: "~1 Min / Rechnung",
        saves: "≈ 6 Std./Woche bei 50 Rechnungen",
        tools: ["OCR + LLM", "DATEV / ERP", "Azure (EU)"],
      },
      {
        icon: "Inbox",
        title: "Anfragen & E-Mails sortieren",
        before:
          "Kundenanfragen landen in einem Sammelpostfach und werden manuell verteilt und beantwortet.",
        beforeTime: "Stunden täglich",
        after:
          "KI kategorisiert, schlägt Antwortentwürfe vor und eskaliert nur echte Ausnahmen an einen Menschen.",
        afterTime: "Minuten täglich",
        saves: "≈ 5–8 Std./Woche im Team",
        tools: ["LLM-Klassifikation", "Helpdesk", "Make"],
      },
      {
        icon: "BarChart3",
        title: "Wöchentliches Reporting",
        before:
          "Zahlen werden aus mehreren Tools in Excel zusammenkopiert und von Hand kommentiert.",
        beforeTime: "~3 Std./Woche",
        after:
          "Der Report entsteht automatisch — inklusive Klartext-Zusammenfassung der wichtigsten Veränderungen.",
        afterTime: "~15 Min Prüfung",
        saves: "≈ 2,5 Std./Woche",
        tools: ["API-Anbindung", "LLM", "Dashboard"],
      },
      {
        icon: "BookOpen",
        title: "Wissen & Einarbeitung",
        before:
          "Mitarbeiter suchen Informationen in Ordnern und Wikis und fragen ständig erfahrene Kollegen.",
        beforeTime: "20+ Min / Suche",
        after:
          "Ein KI-Assistent beantwortet Fragen aus Ihren eigenen Dokumenten — DSGVO-konform, EU-gehostet, mit Quellenangabe.",
        afterTime: "Sekunden",
        saves: "≈ 3–5 Std./Woche je erfahrenem Kollegen",
        tools: ["RAG", "Vektor-Datenbank", "EU-Hosting"],
      },
      {
        icon: "FileSearch",
        title: "Verträge & AGB prüfen",
        before:
          "Verträge, Angebote und AGB werden von Hand auf Fristen, Klauseln und Risiken durchgesehen.",
        beforeTime: "Stunden pro Vertrag",
        after:
          "KI extrahiert Fristen und kritische Klauseln, markiert Abweichungen und fasst Risiken zur Prüfung zusammen.",
        afterTime: "Minuten pro Vertrag",
        saves: "≈ 4 Std./Woche im Backoffice",
        tools: ["LLM", "RAG", "DMS / Vertragsablage"],
      },
      {
        icon: "Users",
        title: "Bewerbungen vorsortieren",
        before:
          "Eingehende Bewerbungen werden manuell gesichtet, mit dem Profil abgeglichen und vorsortiert.",
        beforeTime: "Tage bis zur Shortlist",
        after:
          "KI gleicht Lebensläufe mit den Anforderungen ab und erstellt eine begründete Shortlist — die Entscheidung bleibt beim Menschen.",
        afterTime: "Minuten bis zur Shortlist",
        saves: "≈ 70 % schnelleres Screening",
        tools: ["LLM", "Bewerber-System (ATS)", "DSGVO-Filter"],
      },
      {
        icon: "Languages",
        title: "Übersetzen & Inhalte erstellen",
        before:
          "Produkttexte, Angebote und Dokumente werden extern übersetzt und mühsam an die Markenstimme angepasst.",
        beforeTime: "Tage Vorlauf",
        after:
          "KI liefert Erstübersetzungen und Textvarianten in Ihrer Markenstimme; der Mensch lektoriert nur noch.",
        afterTime: "Minuten pro Text",
        saves: "≈ 60 % weniger Aufwand und Kosten",
        tools: ["LLM", "Glossar / Termbase", "CMS"],
      },
    ],
  },
  angebote: {
    kicker: "Angebote",
    heading: "Vier Wege, mit der ASDAR Method zu starten.",
    sub: "Alle Angebote basieren auf der ASDAR Method — einem klaren Prozess zur Analyse, Strukturierung, Digitalisierung, Automatisierung und Umsetzung.",
    methodLabel: "Methodik",
    note: "Vom schnellen Einstieg bis zur laufenden Begleitung.",
    items: [
      {
        product: "Assad Dar Basic",
        methodik: "ASDAR Snapshot",
        price: "ab 490 €",
        purpose: "Schneller Einstieg und erste Potenziale.",
        cta: "Anfragen",
        featured: false,
      },
      {
        product: "Assad Dar Pro",
        methodik: "ASDAR Audit",
        price: "ab 2.900 €",
        purpose: "Vollständige Analyse mit ASDAR Score und Roadmap.",
        cta: "Anfragen",
        featured: true,
      },
      {
        product: "Assad Dar Scale",
        methodik: "ASDAR Sprint",
        price: "ab 5.900 €",
        purpose: "Umsetzung eines konkreten Use Cases.",
        cta: "Anfragen",
        featured: false,
      },
      {
        product: "Assad Dar Partner",
        methodik: "ASDAR Advisory",
        price: "ab 2.500 €/Monat",
        purpose: "Laufende Begleitung und Optimierung.",
        cta: "Anfragen",
        featured: false,
      },
    ],
  },
  branchen: {
    kicker: "Branchen",
    heading: "Branchen, in denen KI sofort Wirkung zeigt.",
    intro:
      "Jede Branche ist anders. Aber viele Probleme ähneln sich: zu viele manuelle Aufgaben, zu viele E-Mails, zu viele Excel-Listen, zu wenig Transparenz und zu wenig Zeit. Mit der ASDAR Method finden wir, welche Prozesse sich durch KI und Digitalisierung verbessern lassen.",
    items: [
      {
        icon: "HeartPulse",
        title: "Pflege & Betreuung",
        copy: "Mehr Zeit für Menschen, weniger Zeit für Administration. KI vereinfacht Dokumentation, strukturiert Übergaben, verbessert die Einsatzplanung und bereitet wiederkehrende Kommunikation vor.",
      },
      {
        icon: "Car",
        title: "Autohandel & Werkstätten",
        copy: "Schneller von der Anfrage zum Termin. Automatisierte Lead-Erfassung, Fahrzeugbeschreibungen, Follow-ups und Werkstatttermine bearbeiten Anfragen spürbar schneller.",
      },
      {
        icon: "Building2",
        title: "Immobilien & Hausverwaltung",
        copy: "Weniger Aufwand bei Exposés, Anfragen und Besichtigungen. KI strukturiert Objektinformationen, bereitet Exposé-Texte vor, qualifiziert Interessenten und koordiniert Termine.",
      },
      {
        icon: "SprayCan",
        title: "Reinigung & Facility",
        copy: "Bessere Planung, bessere Qualität, weniger Koordination. Digitale Checklisten, Tourenplanung und automatische Kundenmeldungen reduzieren den Abstimmungsaufwand.",
      },
      {
        icon: "HardHat",
        title: "Handwerk & Bau",
        copy: "Weniger Büroarbeit nach Feierabend. Angebote, Baustellenberichte, Fotodokumentation und Kundenupdates werden deutlich einfacher.",
      },
      {
        icon: "Stethoscope",
        title: "Praxen & Therapie",
        copy: "Entlastung für Empfang und Team. Terminprozesse, Patientenfragen, Erinnerungen und interne Abläufe lassen sich besser strukturieren und teilweise automatisieren.",
      },
      {
        icon: "Landmark",
        title: "Steuer, Buchhaltung & Kanzleien",
        copy: "Dokumente, Fristen und Mandantenkommunikation besser im Griff. KI unterstützt bei Vorsortierung, Zusammenfassungen, Standardantworten und Wissensmanagement.",
      },
      {
        icon: "UtensilsCrossed",
        title: "Gastronomie & Hotellerie",
        copy: "Operative Abläufe stabiler steuern. Reservierungen, Bewertungen, Schichtplanung und Marketing laufen mit digitalen Workflows effizienter.",
      },
      {
        icon: "ShoppingCart",
        title: "Handel & E-Commerce",
        copy: "Mehr Geschwindigkeit bei Produktdaten, Kundenservice und Kampagnen. KI beschleunigt Produkttexte, Antworten, Retourenanalysen und Marketing.",
      },
      {
        icon: "Briefcase",
        title: "Agenturen & Dienstleister",
        copy: "Mehr Output ohne mehr Chaos. Briefings, Angebote, Recherchen, Protokolle und Reportings lassen sich standardisieren und automatisieren.",
      },
      {
        icon: "Factory",
        title: "Produktion & Industrie",
        copy: "Stabilere Abläufe auf Shopfloor und im Backoffice. KI hilft bei Qualitätsdokumentation, Schichtübergaben, Wartung, Arbeitsanweisungen und Produktionsreporting.",
      },
      {
        icon: "Truck",
        title: "Logistik & Transport",
        copy: "Weniger manuelle Koordination bei Touren, Sendungen und Kundenupdates. Digitale Workflows verbessern Disposition, Statusmeldungen und Ausnahmemanagement.",
      },
      {
        icon: "GraduationCap",
        title: "Bildung & Weiterbildung",
        copy: "Lerninhalte, Kursorganisation und Teilnehmerkommunikation effizienter steuern. KI unterstützt bei Materialien, Feedback, Planung und Wissenszugang.",
      },
      {
        icon: "ShieldCheck",
        title: "Finanzen & Versicherungen",
        copy: "Anfragen, Dokumente und Prüfprozesse sauberer strukturieren. KI unterstützt bei Vorqualifizierung, Zusammenfassungen, Standardkommunikation und Compliance-naher Dokumentation.",
      },
      {
        icon: "UsersRound",
        title: "HR & Recruiting",
        copy: "Bewerbungen, Onboarding und interne HR-Anfragen schneller bearbeiten. KI hilft bei Vorsortierung, Kommunikation, Wissensmanagement und Mitarbeiterprozessen.",
      },
      {
        icon: "Building",
        title: "Kommunen & Verwaltung",
        copy: "Bürgeranfragen, Formulare und interne Vorgänge verständlicher und schneller bearbeiten. KI unterstützt bei Vorsortierung, Textentwürfen, Wissensdatenbanken und Prozessklarheit.",
      },
    ],
  },
  proof: {
    kicker: "Ehrlich gesagt",
    heading: "Sie wären unter den Ersten — und das ist Ihr Vorteil.",
    body: "Ich baue diese Beratung gerade gezielt aus. Deshalb nehme ich die ersten Projekte zum Gründungspreis — gegen ein dokumentiertes Ergebnis. Was Sie hier sehen, ist die Methode aus 19 Jahren Transformation, nicht eine Wand erfundener Logos.",
  },
  about: {
    kicker: "Über mich",
    more: "Mehr über mich",
    heading: "Von Bayers globalen Marken zu Ihren Abläufen.",
    paragraphs: [
      "19 Jahre lang habe ich Transformation dort geführt, wo Prozesse heilig und reguliert sind: als Digital Lead bei Bayer für globale Marken wie Aspirin und Bepanthen, danach als Director Global Digital Transformation bei Bionorica.",
      "Dann habe ich zwei eigene Unternehmen aufgebaut und geführt — mit voller P&L-Verantwortung und über 14 Mio. $ eingeworbenem Kapital. Ich weiß, wie es ist, selbst die Gehälter zu zahlen.",
      "Was bei Bayer sechs Monate Gremien brauchte, dauert hier zwei Wochen — gleiche Disziplin, kein Gremium.",
    ],
    signature: "Assad Dar · Mönchengladbach",
  },
  blog: {
    kicker: "Blog",
    heading:
      "Wissen für bessere Prozesse, sinnvolle KI und digitale Effizienz.",
    intro:
      "Praktische Artikel zu KI, Automatisierung, digitaler Transformation und Prozessverbesserung. Keine Theorie, kein Tool-Hype — konkrete Beispiele, wie Unternehmen Zeit sparen und KI sinnvoll einsetzen.",
    readMore: "Artikel lesen",
    viewAll: "Alle Artikel ansehen",
    posts: [
      {
        title: "KI im Unternehmen einführen: Wo fängt man sinnvoll an?",
        category: "KI verstehen",
        teaser:
          "Warum einzelne Tools nicht reichen — und welche Prozesse Sie zuerst analysieren sollten.",
      },
      {
        title:
          "10 Prozesse, die fast jedes Unternehmen mit KI automatisieren kann",
        category: "Prozesse verbessern",
        teaser:
          "Von E-Mail-Antworten bis Reporting: konkrete Use Cases mit echtem Nutzen.",
      },
      {
        title:
          "Die ASDAR Method: So finden Unternehmen ihre besten KI-Potenziale",
        category: "ASDAR Method",
        teaser:
          "Warum Analyse vor Tool-Auswahl kommt — und wie der ASDAR Score funktioniert.",
      },
      {
        title: "KI in der Pflege: Wie digitale Prozesse Teams entlasten",
        category: "Branchenlösungen",
        teaser:
          "Dokumentation, Dienstplanung und Kommunikation einfacher und schneller machen.",
      },
      {
        title:
          "KI im Autohandel: Mehr Leads, bessere Follow-ups, weniger manuelle Arbeit",
        category: "Branchenlösungen",
        teaser:
          "Lead-Erfassung, Fahrzeugtexte und Werkstatttermine automatisieren.",
      },
      {
        title:
          "KI für Immobilienmakler: Exposés, Anfragen und Besichtigungen automatisieren",
        category: "Branchenlösungen",
        teaser:
          "Objektinfos strukturieren, Interessenten vorqualifizieren, Termine koordinieren.",
      },
      {
        title:
          "KI für Reinigungsservices: Einsatzplanung, Qualität und Kommunikation",
        category: "Branchenlösungen",
        teaser:
          "Digitale Checklisten, Tourenplanung und automatische Kundenmeldungen.",
      },
      {
        title:
          "KI und Datenschutz: Was Unternehmen vor dem Einsatz beachten sollten",
        category: "Datenschutz & AI Act",
        teaser:
          "Kritische Daten, Tool-Freigaben und einfache interne KI-Regeln.",
      },
      {
        title:
          "AI Act und KI-Kompetenz: Was Unternehmen praktisch tun sollten",
        category: "Datenschutz & AI Act",
        teaser:
          "Was AI Literacy bedeutet und wie eine schlanke Guideline aussieht.",
      },
      {
        title:
          "Warum KI-Projekte scheitern: Tools sind nicht das Problem, Prozesse schon",
        category: "Prozesse verbessern",
        teaser: "Die häufigsten Fehler — und wie ASDAR sie vermeidet.",
      },
    ],
  },
  faq: {
    kicker: "Häufige Fragen",
    heading: "Was Mittelständler mich zuerst fragen.",
    items: [
      {
        q: "Ist KI nicht einfach nur Hype?",
        a: "Das meiste schon. Genau deshalb beginne ich mit Ihren Prozessen, nicht mit der Technik. Wenn ein Mensch oder ein 20-€-Tool besser ist, sage ich Ihnen das.",
      },
      {
        q: "Wir sind zu klein für so etwas.",
        a: "Gerade kleiner geht KI am schnellsten: weniger Systeme, weniger Freigaben, Sie entscheiden. Ich kenne die Konzern-Variante — die inhabergeführte ist schneller und günstiger.",
      },
      {
        q: "Was ist mit Datenschutz und DSGVO?",
        a: "Ich komme aus der regulierten Pharma — Datengovernance ist für mich der Normalfall. EU-gehostete Optionen, Ihre Daten außerhalb öffentlicher Modelle, dokumentiert und betriebsratsfest.",
      },
      {
        q: "Wir haben Tools probiert — es ist nicht hängengeblieben.",
        a: "Tools sind selten das Problem, Adoption schon. Meine Laufbahn ist Change-Management an Orten, die sich wehren. Ich bleibe, bis es ohne mich läuft.",
      },
      {
        q: "Was kostet das Audit genau?",
        a: "Die KI-Prozessanalyse kostet fest €4.500. Sie erhalten die Effizienz-Karte mit mindestens fünf bewerteten Prozessschritten und einem kalkulierten 90-Tage-Plan — schriftlich, fester Umfang.",
      },
      {
        q: "Wie schnell sehen wir Ergebnisse?",
        a: "Die Effizienz-Karte liegt nach zwei Wochen vor. Die ersten Quick Wins sind meist innerhalb von 30 Tagen umsetzbar.",
      },
      {
        q: "Wie viel Zeit kostet das Audit mein Team?",
        a: "Wenig. Ein 90-minütiger Workshop plus zwei, drei kurze Rückfragen. Die Analysearbeit mache ich, nicht Ihr Team.",
      },
      {
        q: "Sie haben noch keine Mittelstands-Referenzen — warum sollte ich der Erste sein?",
        a: "Weil Sie dafür den Gründungspreis und meine volle Aufmerksamkeit bekommen. Die Methode ist erprobt — in 19 Jahren Konzern-Transformation. Neu ist nur das Format für inhabergeführte Unternehmen.",
      },
    ],
  },
  finalCta: {
    kicker: "Nächster Schritt",
    heading: "Bereit, manuelle Arbeit zu reduzieren?",
    sub: "Fragen Sie eine ASDAR Analyse an oder buchen Sie ein 30-Minuten-Erstgespräch — keine Slides, kein Druck, auf Deutsch oder Englisch.",
    cta: "ASDAR Analyse anfragen",
    ctaHref: MAILTO,
    or: "oder schreiben Sie direkt an",
    email: "assad.dar@gmail.com",
    reassure:
      "Antwort meist innerhalb eines Werktags — direkt von mir, nicht von einem Vertriebsteam.",
  },
  termin: {
    title: "Erstgespräch buchen",
    intro:
      "Schreiben Sie mir kurz, worum es geht — oder buchen Sie direkt einen Termin. 30 Minuten, keine Slides, kein Druck, auf Deutsch oder Englisch.",
    formTitle: "Nachricht senden",
    name: "Name",
    email: "E-Mail",
    company: "Unternehmen (optional)",
    message: "Worum geht es?",
    consent:
      "Ich habe die Datenschutzerklärung gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage einverstanden.",
    privacyLink: "Datenschutzerklärung",
    submit: "Nachricht senden",
    sending: "Wird gesendet …",
    success:
      "Danke! Ihre Nachricht ist angekommen — ich melde mich meist innerhalb eines Werktags.",
    errorTitle: "Senden gerade nicht möglich",
    fallback: "bitte schreiben Sie mir direkt an",
    validation:
      "Bitte füllen Sie Name, E-Mail und Nachricht aus und bestätigen Sie den Datenschutz.",
    directTitle: "Lieber direkt?",
    directNote: "Per E-Mail oder Telefon erreichen Sie mich am schnellsten.",
    phone: "+49 173 8665472",
    calTitle: "Online-Termin buchen",
    calNote: "Öffnet die Terminbuchung bei Cal.com in einem neuen Tab.",
    calCta: "Termin wählen",
    backHome: "Zur Startseite",
  },
  footer: {
    tagline: "KI und Automatisierung für effizientere Unternehmen.",
    legal: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
    linkedin: "LinkedIn",
    linkedinHref: "https://linkedin.com/in/assaddar",
    rights: "© 2026 Assad Dar · Mönchengladbach",
  },
};

export type Dict = typeof de;

const en: Dict = {
  meta: {
    title: "Assad Dar — AI & automation for more efficient companies",
    description:
      "With the ASDAR Method, Assad Dar analyzes your workflows, finds automation potential, and builds a clear roadmap for digital efficiency.",
  },
  nav: {
    links: [
      { label: "Home", href: "/en" },
      { label: "ASDAR Method", href: "/en/asdar-method" },
      { label: "Services", href: "/en/angebote" },
      { label: "Industries", href: "/en/branchen" },
      { label: "Blog", href: "/de/blog" },
      { label: "About", href: "/en/ueber-mich" },
      { label: "Products", href: "/en/meine-produkte" },
    ],
    cta: "Book a call",
    portal: "Portal",
    menu: "Menu",
    close: "Close",
    themeToDark: "Dark theme",
    themeToLight: "Light theme",
    skip: "Skip to content",
  },
  hero: {
    kicker: "AI & automation for more efficient companies",
    line1: "Less manual work. Better processes.",
    line2: "AI where it actually creates value.",
    sub: "With the ASDAR Method, Assad Dar analyzes your workflows, finds automation potential, and builds a clear roadmap for digital efficiency — for companies with grown-over processes that want to work more efficiently.",
    ctaPrimary: "Request an ASDAR analysis",
    ctaPrimaryHref: "/en/termin",
    ctaSecondary: "Calculate your ASDAR Score",
    ctaSecondaryHref: "#score",
    ctaSecondaryHint: "5 questions, 1 minute — your AI readiness.",
  },
  market: {
    kicker: "Why now",
    heading: "AI is no longer a topic for the future.",
    intro:
      "The market needs not just inspiration, but structure and execution.",
    stats: [
      {
        value: "54.5%",
        label: "of companies in Germany use AI in their business processes",
        source: "ifo Institute, May 2026",
      },
      {
        value: "16%",
        label: "are concretely planning to adopt AI",
        source: "ifo Institute, May 2026",
      },
      {
        value: "30%",
        label:
          "recently ran digitalization projects — the digital divide persists",
        source: "KfW",
      },
    ],
    note: "This is exactly where the ASDAR Method starts: understand the processes first, then digitize, then automate.",
  },
  method: {
    kicker: "ASDAR Method",
    by: "by Assad Dar",
    heading: "The simple path from manual work to smart automation.",
    sub: "A structured analysis process that shows where AI, automation, and digital transformation genuinely pay off in your company.",
    copy: [
      "Many companies work every day with processes that have grown over time: manual tasks, emails, Excel lists, scattered documents, and recurring customer inquiries. That is often exactly where the greatest potential for AI and automation lies.",
      "With the ASDAR Method, Assad Dar analyzes your existing workflows, identifies bottlenecks, and turns them into concrete measures for more efficient processes, better data structures, and sensible use of AI.",
      "The goal is not simply to introduce new tools. The goal is to make work simpler, faster, and more measurable.",
    ],
    phases: [
      {
        letter: "A",
        title: "Analyze",
        meaning:
          "Understand existing workflows, tools, data, documents, and communication channels.",
        result: "A clear current state",
      },
      {
        letter: "S",
        title: "Structure",
        meaning:
          "Simplify processes, surface bottlenecks, and remove unnecessary steps.",
        result: "Process overview",
      },
      {
        letter: "D",
        title: "Digitize",
        meaning:
          "Set up data, documents, and workflows so they become digitally usable.",
        result: "A digital foundation",
      },
      {
        letter: "A",
        title: "Automate",
        meaning:
          "Reduce recurring tasks with AI, automation, and better tools.",
        result: "Use-case list",
      },
      {
        letter: "R",
        title: "Realize",
        meaning:
          "Plan the rollout, bring the team along, and create measurable results.",
        result: "Roadmap & next steps",
      },
    ],
    tagline: "Analyze. Structure. Digitize. Automate. Realize.",
  },
  score: {
    kicker: "ASDAR Score",
    heading: "How ready is your company for AI and automation?",
    intro:
      "Rate five areas from 0–20 points each. Your total shows where you stand — and where the biggest leverage is.",
    areas: [
      {
        label: "Process clarity",
        question: "Are your most important workflows clearly documented?",
      },
      {
        label: "Digital foundation",
        question: "Are data, documents, and systems usefully connected?",
      },
      {
        label: "Automation potential",
        question: "Which recurring tasks can be reduced?",
      },
      {
        label: "AI usability",
        question:
          "Where can AI concretely help: text, data, customer service, planning, reporting?",
      },
      {
        label: "Readiness to execute",
        question: "Are team, tools, and responsibilities ready?",
      },
    ],
    bands: [
      { max: 30, label: "Lots of manual work, high friction" },
      { max: 60, label: "Good potential, but missing structure" },
      { max: 80, label: "Clear quick wins and a good basis to execute" },
      { max: 100, label: "Very strong foundation to scale" },
    ],
    resultLabel: "Your ASDAR Score",
    ofLabel: "of 100",
    hint: "0 = not at all · 20 = fully in place",
    cta: "Discuss your result in a call",
    ctaHref: "#kontakt",
  },
  examples: {
    kicker: "AI in practice",
    heading: "Concretely: where AI saves companies time today.",
    intro:
      "No theory, no robot clip art. Eight workflows almost every company has — manual before, AI-assisted after.",
    labels: {
      before: "Before",
      after: "After (with AI)",
      tools: "Tools used",
      saves: "Time saved",
      select: "Choose a workflow",
    },
    items: [
      {
        icon: "FileText",
        title: "Drafting quotes",
        before:
          "Sales copies quotes together from old Word files, looks up prices in the ERP, and formats by hand.",
        beforeTime: "~45 min / quote",
        after:
          "AI drafts the quote from CRM data and your templates. The rep reviews and sends.",
        afterTime: "~6 min / quote",
        saves: "≈ 7 hrs/week at 10 quotes",
        tools: ["GPT-4o", "CRM / ERP", "n8n"],
      },
      {
        icon: "ReceiptText",
        title: "Processing invoices",
        before:
          "Incoming invoices are typed into the system by hand and matched against orders.",
        beforeTime: "~8 min / invoice",
        after:
          "AI reads the document via OCR, pre-books it, and flags only the exceptions for review.",
        afterTime: "~1 min / invoice",
        saves: "≈ 6 hrs/week at 50 invoices",
        tools: ["OCR + LLM", "Accounting / ERP", "Azure (EU)"],
      },
      {
        icon: "Inbox",
        title: "Triaging inquiries & email",
        before:
          "Customer inquiries land in a shared inbox and are sorted and answered manually.",
        beforeTime: "hours daily",
        after:
          "AI categorizes, drafts replies, and escalates only the genuine exceptions to a human.",
        afterTime: "minutes daily",
        saves: "≈ 5–8 hrs/week across the team",
        tools: ["LLM classification", "Helpdesk", "Make"],
      },
      {
        icon: "BarChart3",
        title: "Weekly reporting",
        before:
          "Numbers are copied from several tools into Excel and commented on by hand.",
        beforeTime: "~3 hrs/week",
        after:
          "The report is generated automatically — including a plain-language summary of the key changes.",
        afterTime: "~15 min review",
        saves: "≈ 2.5 hrs/week",
        tools: ["API integration", "LLM", "Dashboard"],
      },
      {
        icon: "BookOpen",
        title: "Knowledge & onboarding",
        before:
          "Staff hunt for information across folders and wikis and constantly ask senior colleagues.",
        beforeTime: "20+ min / search",
        after:
          "An AI assistant answers questions from your own documents — GDPR-compliant, EU-hosted, with sources.",
        afterTime: "seconds",
        saves: "≈ 3–5 hrs/week per senior colleague",
        tools: ["RAG", "Vector database", "EU hosting"],
      },
      {
        icon: "FileSearch",
        title: "Reviewing contracts & terms",
        before:
          "Contracts, quotes, and terms are reviewed by hand for deadlines, clauses, and risks.",
        beforeTime: "hours per contract",
        after:
          "AI extracts deadlines and critical clauses, flags deviations, and summarizes risks for review.",
        afterTime: "minutes per contract",
        saves: "≈ 4 hrs/week in back office",
        tools: ["LLM", "RAG", "Document store"],
      },
      {
        icon: "Users",
        title: "Pre-screening applications",
        before:
          "Incoming applications are reviewed manually, matched to the profile, and pre-sorted.",
        beforeTime: "days to a shortlist",
        after:
          "AI matches CVs against the requirements and produces a justified shortlist — the decision stays with a human.",
        afterTime: "minutes to a shortlist",
        saves: "≈ 70% faster screening",
        tools: ["LLM", "ATS", "GDPR filter"],
      },
      {
        icon: "Languages",
        title: "Translating & creating content",
        before:
          "Product copy, quotes, and documents are translated externally and laboriously fitted to the brand voice.",
        beforeTime: "days of lead time",
        after:
          "AI delivers first-draft translations and copy variants in your brand voice; a human just edits.",
        afterTime: "minutes per text",
        saves: "≈ 60% less effort and cost",
        tools: ["LLM", "Glossary / termbase", "CMS"],
      },
    ],
  },
  angebote: {
    kicker: "Services",
    heading: "Four ways to start with the ASDAR Method.",
    sub: "Every offer is built on the ASDAR Method — a clear process to analyze, structure, digitize, automate, and execute.",
    methodLabel: "Method",
    note: "From a fast start to ongoing guidance.",
    items: [
      {
        product: "Assad Dar Basic",
        methodik: "ASDAR Snapshot",
        price: "from €490",
        purpose: "A fast start and first potential.",
        cta: "Inquire",
        featured: false,
      },
      {
        product: "Assad Dar Pro",
        methodik: "ASDAR Audit",
        price: "from €2,900",
        purpose: "A full analysis with ASDAR Score and roadmap.",
        cta: "Inquire",
        featured: true,
      },
      {
        product: "Assad Dar Scale",
        methodik: "ASDAR Sprint",
        price: "from €5,900",
        purpose: "Implementation of one concrete use case.",
        cta: "Inquire",
        featured: false,
      },
      {
        product: "Assad Dar Partner",
        methodik: "ASDAR Advisory",
        price: "from €2,500/month",
        purpose: "Ongoing guidance and optimization.",
        cta: "Inquire",
        featured: false,
      },
    ],
  },
  branchen: {
    kicker: "Industries",
    heading: "Industries where AI delivers right away.",
    intro:
      "Every industry is different. But many problems look alike: too many manual tasks, too many emails, too many Excel lists, too little transparency, and too little time. With the ASDAR Method, we find which processes AI and digitalization can improve.",
    items: [
      {
        icon: "HeartPulse",
        title: "Care & nursing",
        copy: "More time for people, less time for administration. AI simplifies documentation, structures handovers, improves shift planning, and prepares recurring communication.",
      },
      {
        icon: "Car",
        title: "Car dealerships & garages",
        copy: "Faster from inquiry to appointment. Automated lead capture, vehicle descriptions, follow-ups, and workshop bookings handle inquiries noticeably faster.",
      },
      {
        icon: "Building2",
        title: "Real estate & property management",
        copy: "Less effort on listings, inquiries, and viewings. AI structures property information, prepares listing copy, qualifies prospects, and coordinates appointments.",
      },
      {
        icon: "SprayCan",
        title: "Cleaning & facility",
        copy: "Better planning, better quality, less coordination. Digital checklists, route planning, and automatic customer updates reduce the coordination effort.",
      },
      {
        icon: "HardHat",
        title: "Trades & construction",
        copy: "Less office work after hours. Quotes, site reports, photo documentation, and customer updates become much simpler.",
      },
      {
        icon: "Stethoscope",
        title: "Practices & therapy",
        copy: "Relief for reception and the team. Appointment processes, patient questions, reminders, and internal workflows can be better structured and partly automated.",
      },
      {
        icon: "Landmark",
        title: "Tax, accounting & law firms",
        copy: "Documents, deadlines, and client communication better under control. AI helps with pre-sorting, summaries, standard replies, and knowledge management.",
      },
      {
        icon: "UtensilsCrossed",
        title: "Hospitality & hotels",
        copy: "Steer operations more reliably. Reservations, reviews, shift planning, and marketing run more efficiently with digital workflows.",
      },
      {
        icon: "ShoppingCart",
        title: "Retail & e-commerce",
        copy: "More speed on product data, customer service, and campaigns. AI speeds up product copy, replies, returns analysis, and marketing.",
      },
      {
        icon: "Briefcase",
        title: "Agencies & service providers",
        copy: "More output without more chaos. Briefings, quotes, research, minutes, and reporting can be standardized and automated.",
      },
      {
        icon: "Factory",
        title: "Manufacturing & industry",
        copy: "More stable workflows on the shop floor and in the back office. AI supports quality documentation, shift handovers, maintenance, work instructions, and production reporting.",
      },
      {
        icon: "Truck",
        title: "Logistics & transport",
        copy: "Less manual coordination around routes, shipments, and customer updates. Digital workflows improve dispatching, status messages, and exception management.",
      },
      {
        icon: "GraduationCap",
        title: "Education & training",
        copy: "Run learning content, course organization, and participant communication more efficiently. AI supports materials, feedback, planning, and knowledge access.",
      },
      {
        icon: "ShieldCheck",
        title: "Finance & insurance",
        copy: "Structure inquiries, documents, and review processes more cleanly. AI supports pre-qualification, summaries, standard communication, and compliance-adjacent documentation.",
      },
      {
        icon: "UsersRound",
        title: "HR & recruiting",
        copy: "Handle applications, onboarding, and internal HR questions faster. AI helps with pre-sorting, communication, knowledge management, and employee workflows.",
      },
      {
        icon: "Building",
        title: "Municipalities & administration",
        copy: "Process citizen inquiries, forms, and internal cases more clearly and quickly. AI supports triage, draft replies, knowledge bases, and process clarity.",
      },
    ],
  },
  proof: {
    kicker: "Honestly",
    heading: "You'd be among the first — and that's your advantage.",
    body: "I'm deliberately building out this consulting practice right now. That's why I take the first projects at a founding rate — in exchange for a documented result. What you see here is the method from 19 years of transformation, not a wall of invented logos.",
  },
  about: {
    kicker: "About",
    more: "More about me",
    heading: "From Bayer's global brands to your operations.",
    paragraphs: [
      "For 19 years I led transformation where processes are sacred and regulated: as Digital Lead at Bayer for global brands like Aspirin and Bepanthen, then as Director Global Digital Transformation at Bionorica.",
      "Then I built and ran two companies of my own — with full P&L accountability and over $14M raised. I know what it's like to make payroll yourself.",
      "What took six months of committees at Bayer takes two weeks here — same rigor, no committee.",
    ],
    signature: "Assad Dar · Mönchengladbach",
  },
  blog: {
    kicker: "Blog",
    heading:
      "Insights for better processes, sensible AI, and digital efficiency.",
    intro:
      "Practical articles on AI, automation, digital transformation, and process improvement. No theory, no tool hype — concrete examples of how companies save time and use AI sensibly.",
    readMore: "Read article",
    viewAll: "View all articles",
    posts: [
      {
        title: "Introducing AI in your company: where do you sensibly start?",
        category: "Understanding AI",
        teaser:
          "Why individual tools aren't enough — and which processes to analyze first.",
      },
      {
        title: "10 processes almost every company can automate with AI",
        category: "Better processes",
        teaser:
          "From email replies to reporting: concrete use cases with real value.",
      },
      {
        title: "The ASDAR Method: how companies find their best AI potential",
        category: "ASDAR Method",
        teaser:
          "Why analysis comes before tool selection — and how the ASDAR Score works.",
      },
      {
        title: "AI in care: how digital processes take the load off teams",
        category: "Industry solutions",
        teaser:
          "Making documentation, shift planning, and communication simpler and faster.",
      },
      {
        title:
          "AI in car sales: more leads, better follow-ups, less manual work",
        category: "Industry solutions",
        teaser:
          "Automating lead capture, vehicle copy, and workshop appointments.",
      },
      {
        title:
          "AI for real estate agents: automate listings, inquiries, and viewings",
        category: "Industry solutions",
        teaser:
          "Structure property info, pre-qualify prospects, coordinate appointments.",
      },
      {
        title:
          "AI for cleaning services: scheduling, quality, and communication",
        category: "Industry solutions",
        teaser:
          "Digital checklists, route planning, and automatic customer updates.",
      },
      {
        title: "AI and data privacy: what companies should consider before use",
        category: "Privacy & AI Act",
        teaser:
          "Sensitive data, tool approvals, and simple internal AI rules.",
      },
      {
        title: "The AI Act and AI literacy: what companies should do in practice",
        category: "Privacy & AI Act",
        teaser:
          "What AI literacy means and what a lean guideline looks like.",
      },
      {
        title:
          "Why AI projects fail: tools aren't the problem, processes are",
        category: "Better processes",
        teaser: "The most common mistakes — and how ASDAR avoids them.",
      },
    ],
  },
  faq: {
    kicker: "FAQ",
    heading: "What SMB owners ask me first.",
    items: [
      {
        q: "Isn't AI just hype?",
        a: "Most of it is. That's exactly why I start with your processes, not the tech. If a human or a €20 tool is better, I'll tell you.",
      },
      {
        q: "We're too small for this.",
        a: "Smaller is where AI moves fastest: fewer systems, fewer approvals, you decide. I've done the corporate version — the owner-led one is faster and cheaper.",
      },
      {
        q: "What about data privacy and GDPR?",
        a: "I come from regulated pharma — data governance is the default for me. EU-hosted options, your data out of public models, documented and works-council-proof.",
      },
      {
        q: "We tried tools — nothing stuck.",
        a: "Tools are rarely the problem; adoption is. My career is change management in places that resist it. I stay until it runs without me.",
      },
      {
        q: "What exactly does the audit cost?",
        a: "The AI Process Audit is a fixed €4,500. You get the Efficiency Map with at least five scored process steps and a costed 90-day plan — in writing, fixed scope.",
      },
      {
        q: "How fast do we see results?",
        a: "The Efficiency Map is ready in two weeks. The first quick wins are usually actionable within 30 days.",
      },
      {
        q: "How much of my team's time does the audit take?",
        a: "Little. A 90-minute workshop plus two or three short follow-up questions. I do the analysis, not your team.",
      },
      {
        q: "You have no SMB references yet — why should I be the first?",
        a: "Because you get the founding rate and my full attention for it. The method is proven — across 19 years of enterprise transformation. Only the format for owner-led companies is new.",
      },
    ],
  },
  finalCta: {
    kicker: "Next step",
    heading: "Ready to reduce manual work?",
    sub: "Request an ASDAR analysis or book a 30-minute intro call — no slides, no pressure, in German or English.",
    cta: "Request an ASDAR analysis",
    ctaHref: MAILTO,
    or: "or write directly to",
    email: "assad.dar@gmail.com",
    reassure:
      "Usually a reply within one business day — directly from me, not a sales team.",
  },
  termin: {
    title: "Book a call",
    intro:
      "Tell me briefly what it's about — or book a slot directly. 30 minutes, no slides, no pressure, in German or English.",
    formTitle: "Send a message",
    name: "Name",
    email: "E-mail",
    company: "Company (optional)",
    message: "What's it about?",
    consent:
      "I have read the privacy policy and consent to the processing of my data to handle this request.",
    privacyLink: "privacy policy",
    submit: "Send message",
    sending: "Sending …",
    success:
      "Thank you! Your message arrived — I usually reply within one business day.",
    errorTitle: "Sending isn't possible right now",
    fallback: "please write to me directly at",
    validation:
      "Please fill in name, e-mail and message, and confirm the privacy consent.",
    directTitle: "Prefer direct?",
    directNote: "E-mail or phone is the fastest way to reach me.",
    phone: "+49 173 8665472",
    calTitle: "Book online",
    calNote: "Opens the booking page on Cal.com in a new tab.",
    calCta: "Choose a slot",
    backHome: "Back to home",
  },
  footer: {
    tagline: "AI and automation for more efficient companies.",
    legal: [
      { label: "Imprint", href: "/impressum" },
      { label: "Privacy", href: "/datenschutz" },
    ],
    linkedin: "LinkedIn",
    linkedinHref: "https://linkedin.com/in/assaddar",
    rights: "© 2026 Assad Dar · Mönchengladbach",
  },
};

const dictionaries: Record<Locale, Dict> = { de, en };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
