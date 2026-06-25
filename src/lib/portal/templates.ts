import type {
  AsdarStage,
  PortalTemplateOverride,
  ProjectBundle,
  ProjectIntelligence,
} from "./types";

type TemplateTask = {
  title: string;
  owner: "assad" | "customer";
  visibleToCustomer: boolean;
};

type TemplateMilestone = {
  title: string;
  visibleToCustomer: boolean;
};

export type ConsultingTemplate = {
  id: string;
  label: string;
  category: string;
  industryLabel: string;
  bestFor: string;
  projectName: string;
  summary: string;
  kickoffGoal: string;
  intake: Omit<ProjectIntelligence, "projectId" | "updatedAt">;
  callAgenda: string[];
  discoveryQuestions: string[];
  quickWins: string[];
  automationIdeas: string[];
  risks: string[];
  meetingMoves: string[];
  asdarPlan: Record<AsdarStage, string[]>;
  seedTasks: TemplateTask[];
  seedMilestones: TemplateMilestone[];
  customerKickoffUpdate: {
    title: string;
    body: string;
  };
};

export type ConsultingOfferTier = {
  id: "snapshot" | "audit" | "sprint" | "pilot" | "advisory";
  label: string;
  bestFor: string;
  basePriceCents: number;
  minPriceCents: number;
  maxPriceCents: number;
  timelineWeeks: [number, number];
  effortDays: [number, number];
  deliverables: string[];
};

export type ConsultingCommercialModel = {
  templateId: string;
  defaultTierId: ConsultingOfferTier["id"];
  complexityMultiplier: number;
  pricingNotes: string[];
  tiers: ConsultingOfferTier[];
};

const genericIntake = {
  companyContext:
    "Geschaeftsmodell, Teamgroesse, Kernprozesse, Kundensegmente und aktuelle Wachstumssituation erfassen.",
  stakeholders:
    "Geschaeftsfuehrung, operative Prozessverantwortliche, IT/Tool-Verantwortliche und ein bis zwei Power User.",
  issues:
    "Manuelle Uebergaben, doppelte Datenerfassung, unklare Verantwortlichkeiten, fehlende Transparenz und Medienbrueche.",
  goals:
    "Messbare Zeitersparnis, bessere Qualitaet, schnellere Reaktionszeiten und ein pragmatischer Automatisierungsfahrplan.",
  currentTools:
    "CRM/ERP, E-Mail, Tabellen, Dokumentenablage, Kalender, Buchhaltung und branchenspezifische Fachsoftware.",
  dataSituation:
    "Datenquellen, Dokumenttypen, Schnittstellen, Zugriffsrechte, Datenqualitaet und Datenschutzanforderungen pruefen.",
  constraints:
    "Budget, Datenschutz, Legacy-Systeme, Akzeptanz im Team, laufender Betrieb und begrenzte IT-Kapazitaet.",
  opportunities:
    "Intake, Reporting, Dokumentensuche, Angebots-/Antwortentwuerfe, Statuskommunikation und Aufgabensteuerung automatisieren.",
  internalNotes:
    "Im ersten Call nicht zu frueh loesen. Erst Volumen, Frequenz, Fehlerkosten und Entscheidungslogik quantifizieren.",
};

export const consultingTemplates: ConsultingTemplate[] = [
  {
    id: "b2b-services",
    label: "B2B Services / Agentur",
    category: "Services",
    industryLabel: "B2B Services",
    bestFor:
      "Dienstleister, Agenturen, Beratungen und kleine Teams mit vielen E-Mails, Angeboten und Kundenupdates.",
    projectName: "ASDAR Service-Operations Analyse",
    summary:
      "Analyse von Anfrage-, Angebots-, Kundenkommunikations- und Reporting-Prozessen mit Fokus auf schnelle Automatisierungshebel.",
    kickoffGoal:
      "Top 3 wiederholbare Kundenprozesse identifizieren und je Prozess Zeitaufwand, Fehlerquellen und Automatisierungspotenzial quantifizieren.",
    intake: {
      ...genericIntake,
      issues:
        "Anfragen werden manuell qualifiziert, Angebote entstehen aus alten Dokumenten, Statusupdates sind uneinheitlich, Wissen liegt in E-Mails.",
      goals:
        "Schneller qualifizieren, Angebote konsistenter erstellen, Kunden proaktiv informieren und interne Uebergaben vereinfachen.",
      opportunities:
        "Lead-Intake, Angebotsentwuerfe, Meeting-Zusammenfassungen, Follow-ups, Kundenstatus und Knowledge Base automatisieren.",
    },
    callAgenda: [
      "Pipeline vom Erstkontakt bis Angebot skizzieren.",
      "Wiederkehrende Kundenfragen und Dokumente sammeln.",
      "Reporting- und Update-Rhythmus klaeren.",
      "Entscheiden, welcher Workflow zuerst messbar verbessert wird.",
    ],
    discoveryQuestions: [
      "Welche Anfragearten kommen jede Woche wieder?",
      "Wo kopiert das Team Informationen zwischen Tools?",
      "Welche Kundenupdates kosten Zeit, obwohl sie fast immer gleich sind?",
      "Welche Angebotsbausteine koennten standardisiert werden?",
    ],
    quickWins: [
      "Standardisierter Intake-Fragebogen mit automatischer Zusammenfassung.",
      "Angebots- und Follow-up-Templates auf Basis vorhandener Leistungsbausteine.",
      "Woechentliches Kundenupdate aus Aufgaben, Notizen und Meilensteinen.",
    ],
    automationIdeas: [
      "E-Mail-Triage nach Anfrageart, Dringlichkeit und naechstem Schritt.",
      "Meeting-Notizen in Aufgaben, Risiken und Kundenupdate umwandeln.",
      "Projektstatus aus internen Tasks automatisch fuer Kunden verdichten.",
    ],
    risks: [
      "Zu viele Sonderfaelle ohne klare Servicepakete.",
      "AI erzeugt unpassende Versprechen, wenn Leistungsgrenzen fehlen.",
      "Kundenkommunikation wird automatisiert, bevor Freigabeprozesse stehen.",
    ],
    meetingMoves: [
      "Live eine echte Kundenanfrage nehmen und den aktuellen Weg Schritt fuer Schritt mappen.",
      "Nach jedem Prozessschritt fragen: Wer entscheidet, welches Tool, welche Daten, welcher Output?",
      "Am Ende einen 7-Tage-Prototypen definieren, nicht eine grosse Plattform.",
    ],
    asdarPlan: {
      analyse: [
        "Anfrage- und Angebotsvolumen erfassen.",
        "Top 10 wiederkehrende Kundenfragen clustern.",
      ],
      structure: [
        "Servicebausteine, Entscheidungskriterien und Statuslogik standardisieren.",
        "Kundenupdate-Format festlegen.",
      ],
      digitize: [
        "Zentrale Projektakte und Template-Bibliothek aufsetzen.",
        "CRM/Task/Datei-Ablage verbinden.",
      ],
      automate: [
        "AI-Drafts fuer Angebote, Follow-ups und Statusupdates einfuehren.",
        "Reminder und Aufgaben aus Meetings generieren.",
      ],
      realize: [
        "Zeitersparnis pro Anfrage messen.",
        "Template-Qualitaet monatlich nachschaerfen.",
      ],
    },
    seedTasks: [
      {
        title: "3 echte Kundenanfragen als Prozessbeispiele sammeln",
        owner: "customer",
        visibleToCustomer: true,
      },
      {
        title: "Angebots- und Follow-up-Bausteine strukturieren",
        owner: "assad",
        visibleToCustomer: false,
      },
      {
        title: "Ersten Kundenupdate-Entwurf automatisiert erzeugen",
        owner: "assad",
        visibleToCustomer: true,
      },
    ],
    seedMilestones: [
      { title: "Intake und Prozesslandkarte abgeschlossen", visibleToCustomer: true },
      { title: "Erster Service-Automation-Prototyp getestet", visibleToCustomer: true },
    ],
    customerKickoffUpdate: {
      title: "Projekt gestartet: Service-Prozesse und Automatisierung",
      body:
        "Wir starten mit einer strukturierten Analyse der wichtigsten wiederkehrenden Kundenprozesse. Ziel ist, schnell sichtbare Automatisierungspotenziale zu finden und daraus konkrete naechste Schritte abzuleiten.",
    },
  },
  {
    id: "manufacturing",
    label: "Produktion / Industrie",
    category: "Operations",
    industryLabel: "Produktion",
    bestFor:
      "Produzierende Unternehmen mit Auftragsabwicklung, Schichtkommunikation, Qualitaetsdokumentation und ERP-Prozessen.",
    projectName: "ASDAR Produktions- und Prozessdigitalisierung",
    summary:
      "Analyse von Auftragsfluss, Qualitaetsdokumentation, Wartung, Reporting und ERP-Schnittstellen fuer pragmatische Digitalisierung.",
    kickoffGoal:
      "Den groessten manuellen Engpass zwischen Auftrag, Produktion, Qualitaet und Reporting sichtbar machen.",
    intake: {
      ...genericIntake,
      stakeholders:
        "Geschaeftsfuehrung, Produktionsleitung, Qualitaet, Arbeitsvorbereitung, Einkauf/Disposition und ERP-Key-User.",
      issues:
        "Papierlisten, Excel-Parallelwelten, manuelle Rueckmeldungen, verspaetete Kennzahlen, Medienbrueche zwischen Shopfloor und ERP.",
      goals:
        "Bessere Transparenz, weniger Nacharbeit, schnellere Rueckmeldungen, belastbare Kennzahlen und weniger manuelle Dokumentation.",
      currentTools:
        "ERP/MES, Excel, Papierformulare, SharePoint/Dateiserver, E-Mail, Wartungs- und Qualitaetssysteme.",
      opportunities:
        "Digitale Checklisten, Abweichungsberichte, Wartungs-Triage, Produktionsreporting und Dokumentensuche automatisieren.",
    },
    callAgenda: [
      "Auftragsfluss vom Auftragseingang bis Auslieferung skizzieren.",
      "Manuelle Listen und doppelte Erfassung identifizieren.",
      "Qualitaets- und Wartungsdokumentation pruefen.",
      "Pilotbereich mit klarer Kennzahl auswaehlen.",
    ],
    discoveryQuestions: [
      "Welche Informationen kommen zu spaet bei Produktion oder Qualitaet an?",
      "Welche Excel-Listen existieren parallel zum ERP?",
      "Wo entsteht Nacharbeit wegen fehlender oder falscher Daten?",
      "Welche Reports werden manuell gebaut?",
    ],
    quickWins: [
      "Digitale Schicht- oder Qualitaetscheckliste mit Standardauswertung.",
      "AI-Suche ueber Arbeitsanweisungen, Spezifikationen und Reklamationen.",
      "Automatisiertes Wochenreporting aus ERP-Exporten und Produktionsnotizen.",
    ],
    automationIdeas: [
      "Abweichungen automatisch klassifizieren und naechste Schritte vorschlagen.",
      "Wartungs- und Stoerungsmeldungen priorisieren.",
      "ERP-Export in Management-Report und Kundenstatus uebersetzen.",
    ],
    risks: [
      "Shopfloor-Akzeptanz sinkt, wenn digitale Loesung mehr Eingabeaufwand erzeugt.",
      "ERP-Daten sind nicht sauber genug fuer sofortige Automatisierung.",
      "Zu grosser Pilotbereich verhindert schnelle Ergebnisse.",
    ],
    meetingMoves: [
      "Nach einem realen Auftrag fragen und den Informationsfluss live rekonstruieren.",
      "Papier/Excel-Artefakte zeigen lassen, nicht nur abstrakt beschreiben lassen.",
      "Eine Kennzahl fuer den Piloten definieren: Zeit, Fehler, Rueckfrage oder Durchlauf.",
    ],
    asdarPlan: {
      analyse: [
        "Top Engpass im Auftragsfluss bestimmen.",
        "Manuelle Datenquellen und Wiederholaufgaben inventarisieren.",
      ],
      structure: [
        "Soll-Prozess und Datenfelder fuer Pilotbereich definieren.",
        "Rollen fuer Freigabe, Pflege und Eskalation klaeren.",
      ],
      digitize: [
        "Digitale Checkliste oder Reporting-Quelle aufsetzen.",
        "ERP-Export/API in den Pilotprozess einbinden.",
      ],
      automate: [
        "Abweichungen, Reports und Rueckfragen automatisch vorstrukturieren.",
        "Benachrichtigungen und Aufgaben bei Grenzwerten ausloesen.",
      ],
      realize: [
        "Pilot-KPI vor/nach vergleichen.",
        "Rollout-Plan fuer naechsten Produktionsbereich erstellen.",
      ],
    },
    seedTasks: [
      {
        title: "Aktuelle Shopfloor-Listen und ERP-Exporte bereitstellen",
        owner: "customer",
        visibleToCustomer: true,
      },
      {
        title: "Pilotprozess mit groesstem manuellen Engpass modellieren",
        owner: "assad",
        visibleToCustomer: true,
      },
      {
        title: "Digitale Checklisten-/Reporting-Skizze erstellen",
        owner: "assad",
        visibleToCustomer: false,
      },
    ],
    seedMilestones: [
      { title: "Pilotprozess und KPI bestaetigt", visibleToCustomer: true },
      { title: "Digitaler Prototyp fuer Produktion/Qualitaet bereit", visibleToCustomer: true },
    ],
    customerKickoffUpdate: {
      title: "Projekt gestartet: Produktionsprozesse und Digitalisierung",
      body:
        "Wir analysieren den Informationsfluss zwischen Auftrag, Produktion, Qualitaet und Reporting. Der Fokus liegt auf einem klar abgegrenzten Pilotprozess mit messbarem Nutzen.",
    },
  },
  {
    id: "healthcare",
    label: "Praxis / Gesundheit",
    category: "Regulated Services",
    industryLabel: "Gesundheit",
    bestFor:
      "Arztpraxen, Therapie, Pflege, Labore und Gesundheitsdienstleister mit Termin-, Dokumentations- und Kommunikationsaufwand.",
    projectName: "ASDAR Praxis- und Dokumentationsentlastung",
    summary:
      "Analyse von Patientenkommunikation, Terminlogik, Dokumentation, Formularen und interner Organisation unter Datenschutzfokus.",
    kickoffGoal:
      "Administrative Entlastung finden, ohne medizinische Verantwortung oder Datenschutz zu gefaehrden.",
    intake: {
      ...genericIntake,
      stakeholders:
        "Praxisleitung, Empfang/Backoffice, Fachpersonal, Datenschutzverantwortliche und Software-Key-User.",
      issues:
        "Telefonlast, manuelle Terminabstimmung, Formularchaos, Dokumentationsdruck, Rueckfragen und Medienbrueche.",
      goals:
        "Administrative Zeit reduzieren, Erreichbarkeit verbessern, Dokumentation strukturieren und Patientenerlebnis verbessern.",
      currentTools:
        "Praxissoftware, Telefonanlage, E-Mail, Terminbuchung, Formulare, DMS, Abrechnung und Messenger/Portale.",
      dataSituation:
        "Patientendaten und Gesundheitsinformationen nur mit strenger Zweckbindung, Rollenrechten und Datenschutzpruefung nutzen.",
      constraints:
        "DSGVO, Schweigepflicht, medizinische Haftung, Fachsoftware-Grenzen und hohes Vertrauen der Patienten.",
      opportunities:
        "Anfrage-Triage, Formularvorbereitung, Terminregeln, interne Checklisten und Wissenssuche automatisieren.",
    },
    callAgenda: [
      "Administrative Kontaktpunkte vor/nach Termin erfassen.",
      "Dokumentations- und Formulararten clustern.",
      "Datenschutzgrenzen und No-Go-Bereiche festlegen.",
      "Unkritischen Pilotprozess waehlen.",
    ],
    discoveryQuestions: [
      "Welche Anfragen blockieren Telefon oder Empfang am staerksten?",
      "Welche Formulare werden immer wieder manuell erklaert?",
      "Welche Dokumentation darf vorbereitet, aber nicht automatisch entschieden werden?",
      "Welche Daten duerfen in welchem Tool verarbeitet werden?",
    ],
    quickWins: [
      "FAQ- und Formularassistent fuer nicht-medizinische Standardfragen.",
      "Interne Checklisten fuer Terminarten und Vorbereitungen.",
      "Vorstrukturierte Dokumentationsnotizen mit menschlicher Freigabe.",
    ],
    automationIdeas: [
      "Anfragen nach Termin, Rezept, Befund, Verwaltung und Dringlichkeit sortieren.",
      "Patienteninformationen in sichere Formularprozesse lenken.",
      "Interne Wissenssuche ueber SOPs, Formulare und Ablaeufe.",
    ],
    risks: [
      "AI darf keine medizinische Diagnose oder Behandlungsempfehlung ersetzen.",
      "Falsche Datenhaltung kann Datenschutz- und Vertrauensrisiken erzeugen.",
      "Automatisierung darf das Team nicht mit zusaetzlichen Systemen belasten.",
    ],
    meetingMoves: [
      "Explizit trennen: medizinische Entscheidung, administrative Vorbereitung, reine Information.",
      "Nach groesstem Telefon-/Backoffice-Zeitfresser fragen.",
      "Jeden Use Case mit Datenschutzampel bewerten: gruen, gelb, rot.",
    ],
    asdarPlan: {
      analyse: [
        "Anfragearten und Dokumentationslast quantifizieren.",
        "Datenschutzkritische Datenfluesse markieren.",
      ],
      structure: [
        "Administrative Use Cases von medizinischen Entscheidungen trennen.",
        "Freigabe- und Rollenmodell definieren.",
      ],
      digitize: [
        "Sicheren Formular-/Checklistenprozess fuer Pilot aufsetzen.",
        "Wissensbasis aus nicht-sensiblen SOPs strukturieren.",
      ],
      automate: [
        "Nicht-medizinische Anfragen vorqualifizieren.",
        "Dokumentationsentwuerfe mit Pflichtfreigabe erstellen.",
      ],
      realize: [
        "Entlastung am Empfang und Dokumentationszeit messen.",
        "Datenschutzreview vor Erweiterung durchfuehren.",
      ],
    },
    seedTasks: [
      {
        title: "Top 20 administrative Anfragen der letzten Wochen sammeln",
        owner: "customer",
        visibleToCustomer: true,
      },
      {
        title: "Datenschutzampel fuer erste Use Cases erstellen",
        owner: "assad",
        visibleToCustomer: false,
      },
      {
        title: "Pilot fuer nicht-medizinische Anfrage-Triage definieren",
        owner: "assad",
        visibleToCustomer: true,
      },
    ],
    seedMilestones: [
      { title: "Datenschutzgrenzen und Pilotprozess bestaetigt", visibleToCustomer: true },
      { title: "Administrative Entlastung messbar getestet", visibleToCustomer: true },
    ],
    customerKickoffUpdate: {
      title: "Projekt gestartet: Praxisentlastung und sichere Digitalisierung",
      body:
        "Wir starten mit administrativen Prozessen, die das Team entlasten koennen, ohne medizinische Verantwortung oder Datenschutz zu gefaehrden.",
    },
  },
  {
    id: "ecommerce",
    label: "E-Commerce / Handel",
    category: "Commerce",
    industryLabel: "E-Commerce",
    bestFor:
      "Online-Shops, Retailer und Handelsunternehmen mit Support, Produktdaten, Retouren und Kampagnenprozessen.",
    projectName: "ASDAR Commerce Automation Sprint",
    summary:
      "Analyse von Produktdaten, Kundenservice, Retouren, Kampagnen und operativen Shop-Prozessen fuer AI-gestuetzte Entlastung.",
    kickoffGoal:
      "Einen Commerce-Prozess mit hohem Volumen und klarer Qualitaetslogik fuer einen schnellen Pilot auswaehlen.",
    intake: {
      ...genericIntake,
      issues:
        "Produktdaten sind uneinheitlich, Supportfragen wiederholen sich, Retouren kosten Zeit, Kampagnencontent entsteht manuell.",
      goals:
        "Support entlasten, Produktcontent verbessern, Retourengrundlagen verstehen und Kampagnen schneller erstellen.",
      currentTools:
        "Shop-System, PIM/ERP, Helpdesk, E-Mail, Warenwirtschaft, Analytics, Ads und Newsletter-Tools.",
      opportunities:
        "Produkttext-Optimierung, Support-Triage, Retourenanalyse, Kampagnenbriefings und FAQ-Automatisierung.",
    },
    callAgenda: [
      "Bestell-, Support- und Retourenfluss skizzieren.",
      "Produktdatenquellen und Content-Prozess pruefen.",
      "Top Kundenfragen und Retourengruende clustern.",
      "Pilot mit messbarer Conversion-/Zeit-KPI waehlen.",
    ],
    discoveryQuestions: [
      "Welche Supportfragen kommen jeden Tag wieder?",
      "Welche Produktdaten fehlen oder sind inkonsistent?",
      "Welche Retourengruende lassen sich operativ beeinflussen?",
      "Wo entstehen Kampagnen- oder Produkttexte manuell?",
    ],
    quickWins: [
      "FAQ- und Supportantworten aus echten Tickets strukturieren.",
      "Produktdaten-Checkliste plus AI-Entwuerfe fuer Beschreibungen.",
      "Retourencluster fuer operative Verbesserungen auswerten.",
    ],
    automationIdeas: [
      "Tickets nach Thema, Dringlichkeit, Bestellstatus und naechstem Schritt routen.",
      "Produktbeschreibungen aus Attributen und Markenregeln erzeugen.",
      "Kampagnenbriefings aus Sortiment, Zielgruppe und Lagerstatus vorbereiten.",
    ],
    risks: [
      "Falsche Produktclaims koennen Retouren oder rechtliche Probleme erzeugen.",
      "Support-Automation ohne Eskalationslogik verschlechtert Kundenerlebnis.",
      "Schlechte Produktdaten erzeugen schlechte AI-Ergebnisse.",
    ],
    meetingMoves: [
      "Top 10 Tickets oder Retouren mitbringen lassen und live clustern.",
      "Produktdatenqualitaet an drei Beispielartikeln pruefen.",
      "Eskalationsgrenzen fuer Supportantworten festlegen.",
    ],
    asdarPlan: {
      analyse: [
        "Ticket-, Retouren- und Produktdatenvolumen erheben.",
        "Wiederkehrende Themen und Kostenhebel clustern.",
      ],
      structure: [
        "Antwortlogik, Produktdatenfelder und Eskalationsregeln definieren.",
        "Marken- und Compliance-Regeln fuer Texte festlegen.",
      ],
      digitize: [
        "Produktdaten- und Ticketquellen verbinden.",
        "Wissensbasis fuer Support und Produktcontent strukturieren.",
      ],
      automate: [
        "Supportantworten und Produkttextentwuerfe generieren.",
        "Retourenanalyse und Kampagnenbriefings automatisieren.",
      ],
      realize: [
        "Antwortzeit, Conversion, Retourenquote oder Content-Durchsatz messen.",
        "Pilot auf weitere Kategorien skalieren.",
      ],
    },
    seedTasks: [
      {
        title: "Top 30 Supporttickets und Retourengruende exportieren",
        owner: "customer",
        visibleToCustomer: true,
      },
      {
        title: "Produktdatenqualitaet fuer Pilotkategorie bewerten",
        owner: "assad",
        visibleToCustomer: false,
      },
      {
        title: "Support- oder Produktcontent-Pilot definieren",
        owner: "assad",
        visibleToCustomer: true,
      },
    ],
    seedMilestones: [
      { title: "Commerce-Pilotprozess ausgewaehlt", visibleToCustomer: true },
      { title: "Erster AI-gestuetzter Content-/Supportflow getestet", visibleToCustomer: true },
    ],
    customerKickoffUpdate: {
      title: "Projekt gestartet: Commerce-Prozesse und AI-Potenziale",
      body:
        "Wir analysieren Support, Produktdaten und wiederkehrende Shop-Prozesse, um schnell einen messbaren Automatisierungspiloten zu definieren.",
    },
  },
  {
    id: "legal-tax",
    label: "Kanzlei / Steuer / Recht",
    category: "Knowledge Work",
    industryLabel: "Kanzlei",
    bestFor:
      "Steuerberater, Rechtsanwaelte, Kanzleien und Expertenorganisationen mit Dokumenten, Fristen, Mandantenkommunikation und Recherche.",
    projectName: "ASDAR Kanzlei- und Wissensprozess Analyse",
    summary:
      "Analyse von Mandantenaufnahme, Dokumentenfluss, Fristen, Wissenssuche und wiederkehrender Kommunikation mit strenger Freigabelogik.",
    kickoffGoal:
      "Wiederkehrende Mandanten- und Dokumentenprozesse identifizieren, bei denen AI vorbereiten darf, aber Experten final entscheiden.",
    intake: {
      ...genericIntake,
      stakeholders:
        "Partner/Inhaber, Assistenz, fachliche Experten, Datenschutz/IT und operative Mandatsverantwortliche.",
      issues:
        "Dokumente kommen unstrukturiert, Fristen werden manuell ueberwacht, Mandantenfragen wiederholen sich, Recherche und Entwuerfe kosten Zeit.",
      goals:
        "Mandantenaufnahme strukturieren, Dokumentensuche beschleunigen, Entwuerfe vorbereiten und Fristen transparenter machen.",
      dataSituation:
        "Mandanten- und vertrauliche Dokumente nur mit klaren Rollen, Verschwiegenheit, Auditierbarkeit und Freigabeprozessen nutzen.",
      opportunities:
        "Dokumentencheck, Mandanten-Intake, Wissenssuche, Entwurfsassistenz und Fristen-/Aufgabenuebersicht automatisieren.",
    },
    callAgenda: [
      "Mandantenaufnahme und Dokumentenanforderungen skizzieren.",
      "Wiederkehrende Fragen, Dokumenttypen und Fristen clustern.",
      "Freigabe- und Haftungsgrenzen festlegen.",
      "Pilot fuer interne Vorarbeit definieren.",
    ],
    discoveryQuestions: [
      "Welche Dokumente fehlen bei Mandanten am haeufigsten?",
      "Welche Fragen beantwortet das Team jede Woche erneut?",
      "Welche Entwuerfe duerfen vorbereitet, aber nie ungeprueft versendet werden?",
      "Welche Fristen oder Aufgaben gehen durch Medienbrueche verloren?",
    ],
    quickWins: [
      "Mandanten-Intake-Checkliste mit automatischer Vollstaendigkeitspruefung.",
      "Interne Wissenssuche ueber Vorlagen, FAQs und Arbeitsanweisungen.",
      "Entwurfsassistenz fuer E-Mails und Dokumentanforderungen mit Freigabe.",
    ],
    automationIdeas: [
      "Dokumente nach Mandat, Typ, Zeitraum und Vollstaendigkeit klassifizieren.",
      "Mandantenmails in Aufgaben und Rueckfragen umwandeln.",
      "Fristen- und fehlende-Unterlagen-Reminder erzeugen.",
    ],
    risks: [
      "Fachliche Beratung darf nicht ungeprueft automatisiert werden.",
      "Vertraulichkeit und Mandantendaten erfordern strenge Toolauswahl.",
      "AI-Ausgaben brauchen Zitier-/Quellenlogik und Freigabe.",
    ],
    meetingMoves: [
      "Zwischen interner Vorarbeit und fachlicher Entscheidung unterscheiden.",
      "Ein Beispielmandat nehmen und alle Dokumente, Fristen und Rueckfragen mappen.",
      "Freigabepunkte als Pflicht-Gates definieren.",
    ],
    asdarPlan: {
      analyse: [
        "Mandanten- und Dokumentenprozess mit Volumen aufnehmen.",
        "Risiko- und Vertraulichkeitsklassen definieren.",
      ],
      structure: [
        "Dokumenttypen, Pflichtfelder und Freigabe-Gates standardisieren.",
        "Wissensquellen fuer interne Suche festlegen.",
      ],
      digitize: [
        "Strukturierte Mandantenakte und Vorlagenbibliothek aufsetzen.",
        "Sichere Such-/DMS-Struktur fuer Pilot vorbereiten.",
      ],
      automate: [
        "Intake-Checks, Rueckfragen und Entwuerfe vorbereiten.",
        "Fristen- und Aufgabenhinweise aus Dokumentenstatus ableiten.",
      ],
      realize: [
        "Bearbeitungszeit und Rueckfragenquote messen.",
        "Governance fuer weitere Mandatsarten dokumentieren.",
      ],
    },
    seedTasks: [
      {
        title: "Beispielmandat mit Dokumentenanforderungen bereitstellen",
        owner: "customer",
        visibleToCustomer: true,
      },
      {
        title: "Freigabe- und Haftungsgrenzen fuer AI-Vorarbeit definieren",
        owner: "assad",
        visibleToCustomer: false,
      },
      {
        title: "Mandanten-Intake-Checkliste skizzieren",
        owner: "assad",
        visibleToCustomer: true,
      },
    ],
    seedMilestones: [
      { title: "Mandantenprozess und Governance geklaert", visibleToCustomer: true },
      { title: "Interner Wissens-/Intake-Prototyp getestet", visibleToCustomer: true },
    ],
    customerKickoffUpdate: {
      title: "Projekt gestartet: Kanzlei- und Wissensprozesse",
      body:
        "Wir starten mit strukturierten Mandanten- und Dokumentenprozessen. Der Fokus liegt auf sicherer AI-Vorarbeit mit klarer fachlicher Freigabe.",
    },
  },
  {
    id: "construction-real-estate",
    label: "Bau / Immobilien",
    category: "Project Operations",
    industryLabel: "Bau und Immobilien",
    bestFor:
      "Bauunternehmen, Handwerk, Immobilienverwaltung und Projektentwickler mit Angeboten, Baustellenkommunikation, Dokumentation und Mängeln.",
    projectName: "ASDAR Bau- und Immobilienprozess Analyse",
    summary:
      "Analyse von Anfrage, Angebot, Projektkoordination, Baustellendokumentation, Maengeln und Kunden-/Mieterkommunikation.",
    kickoffGoal:
      "Den Prozess mit den meisten Rueckfragen, Nacharbeiten oder Dokumentationsluecken fuer einen Pilot auswaehlen.",
    intake: {
      ...genericIntake,
      stakeholders:
        "Geschaeftsfuehrung, Projektleitung, Bauleitung, Verwaltung, Disposition, Objektbetreuung und Buchhaltung.",
      issues:
        "Informationen liegen in Fotos, E-Mails, WhatsApp, Plaenen und PDFs verteilt; Angebote und Maengelberichte entstehen manuell.",
      goals:
        "Bessere Baustellen-/Objekttransparenz, schnellere Angebote, weniger Rueckfragen und strukturierte Dokumentation.",
      currentTools:
        "E-Mail, Telefon/WhatsApp, Excel, Projektsoftware, DMS, Buchhaltung, Planablage und CRM.",
      opportunities:
        "Foto-/Maengelstruktur, Angebotsvorbereitung, Objektkommunikation, Baustellenupdates und Dokumentensuche automatisieren.",
    },
    callAgenda: [
      "Anfrage bis Angebot oder Maengel bis Erledigung skizzieren.",
      "Dokumente, Fotos und Kommunikationskanaele sammeln.",
      "Rueckfragen und Verantwortlichkeiten klaeren.",
      "Pilot fuer Dokumentations- oder Angebotsprozess definieren.",
    ],
    discoveryQuestions: [
      "Wo gehen Informationen zwischen Baustelle/Objekt und Buero verloren?",
      "Welche Fotos, Plaene oder PDFs werden immer wieder gesucht?",
      "Welche Angebote oder Maengelberichte sind stark wiederholbar?",
      "Welche Updates muessen Kunden, Mieter oder Eigentuemern regelmaessig bekommen?",
    ],
    quickWins: [
      "Strukturierter Maengel-/Baustellenbericht aus Fotos und Notizen.",
      "Angebotsvorlage mit Leistungsbausteinen und Rueckfragenliste.",
      "Woechentliches Projektupdate fuer Kunden/Eigentuemer.",
    ],
    automationIdeas: [
      "Fotos und Notizen in Maengelliste, Aufgaben und Kundenupdate umwandeln.",
      "Anfragen anhand Objekt, Gewerk, Dringlichkeit und fehlender Infos sortieren.",
      "PDFs/Plaene/Vertraege durchsuchbar fuer interne Rueckfragen machen.",
    ],
    risks: [
      "Unvollstaendige Baustellendaten fuehren zu falschen Schlussfolgerungen.",
      "Haftungsrelevante Aussagen brauchen Freigabe.",
      "Mobile Nutzung scheitert, wenn Eingabe auf der Baustelle zu aufwaendig ist.",
    ],
    meetingMoves: [
      "Ein reales Objekt/Projekt nehmen und alle Kommunikationskanaele auflisten.",
      "Nach dem letzten Fall fragen, der wegen fehlender Infos teuer wurde.",
      "Auf einen mobilen, einfachen Pilot dringen.",
    ],
    asdarPlan: {
      analyse: [
        "Informationsfluss zwischen vor Ort und Buero mappen.",
        "Rueckfragen, Nacharbeit und Suchzeiten quantifizieren.",
      ],
      structure: [
        "Standardfelder fuer Maengel, Angebote oder Objektupdates definieren.",
        "Verantwortlichkeiten und Freigaben klaeren.",
      ],
      digitize: [
        "Zentrale Objekt-/Projektakte mit Foto- und Dokumentstruktur aufsetzen.",
        "Mobile Erfassung fuer Pilotprozess vorbereiten.",
      ],
      automate: [
        "Berichte, Aufgaben und Updates aus Fotos/Notizen vorbereiten.",
        "Rueckfragenlisten fuer unvollstaendige Anfragen erzeugen.",
      ],
      realize: [
        "Rueckfragen und Dokumentationszeit messen.",
        "Pilot auf weitere Gewerke/Objekte ausrollen.",
      ],
    },
    seedTasks: [
      {
        title: "Beispielprojekt mit Fotos, Plaenen und E-Mail-Verlauf bereitstellen",
        owner: "customer",
        visibleToCustomer: true,
      },
      {
        title: "Maengel-/Angebotsprozess als Pilot auswaehlen",
        owner: "assad",
        visibleToCustomer: true,
      },
      {
        title: "Mobile Erfassungsstruktur fuer Pilot skizzieren",
        owner: "assad",
        visibleToCustomer: false,
      },
    ],
    seedMilestones: [
      { title: "Pilotprozess und Datenquellen definiert", visibleToCustomer: true },
      { title: "Erster automatisierter Bericht/Update getestet", visibleToCustomer: true },
    ],
    customerKickoffUpdate: {
      title: "Projekt gestartet: Bau-/Immobilienprozesse strukturieren",
      body:
        "Wir analysieren, wo Informationen zwischen Objekt, Baustelle und Buero verloren gehen, und definieren daraus einen klaren Automatisierungspiloten.",
    },
  },
  {
    id: "logistics",
    label: "Logistik / Transport",
    category: "Operations",
    industryLabel: "Logistik",
    bestFor:
      "Logistik-, Speditions- und Fuhrparkbetriebe mit Disposition, Statuskommunikation, Dokumenten und Abweichungen.",
    projectName: "ASDAR Logistik- und Dispositionsanalyse",
    summary:
      "Analyse von Disposition, Sendungsstatus, Dokumenten, Abweichungen und Kundenkommunikation fuer operative Automatisierung.",
    kickoffGoal:
      "Den groessten manuellen Kommunikations- oder Dokumentationsaufwand in der Disposition quantifizieren.",
    intake: {
      ...genericIntake,
      stakeholders:
        "Disposition, Operations, Kundenservice, Fahrpersonal/Fuhrpark, Abrechnung und IT/TMS-Key-User.",
      issues:
        "Statusanfragen, fehlende Dokumente, manuelle Avisierung, Abweichungen und Excel-Listen belasten Disposition und Service.",
      goals:
        "Weniger Rueckfragen, bessere Statusqualitaet, schnellere Dokumentenverarbeitung und klarere Eskalationen.",
      currentTools:
        "TMS, Telematik, E-Mail, Telefon, Kundenportale, Excel, DMS, Scanner und Abrechnung.",
      opportunities:
        "Status-Triage, Dokumentenerkennung, Abweichungsmanagement, Kundenupdates und Dispo-Assistenz automatisieren.",
    },
    callAgenda: [
      "Sendungsfluss und Statuspunkte skizzieren.",
      "Top Abweichungen und Kundenrueckfragen clustern.",
      "Dokumentenfluss von POD, Lieferschein, Rechnung pruefen.",
      "Pilot fuer Status oder Dokumente auswaehlen.",
    ],
    discoveryQuestions: [
      "Welche Statusfragen kommen am haeufigsten?",
      "Welche Dokumente fehlen oder muessen manuell geprueft werden?",
      "Welche Abweichungen brauchen immer dieselbe Entscheidung?",
      "Wo pflegt das Team Daten doppelt?",
    ],
    quickWins: [
      "Kundenstatus aus TMS-Export und Dispo-Notizen verdichten.",
      "Dokumentencheck fuer fehlende POD/Lieferscheine.",
      "Abweichungskategorien mit Standardreaktionen definieren.",
    ],
    automationIdeas: [
      "E-Mails nach Sendung, Dringlichkeit und Abweichung klassifizieren.",
      "Fehlende Dokumente automatisch erkennen und nachfassen.",
      "Verspaetungen in Kundenupdate und interne Aufgabe uebersetzen.",
    ],
    risks: [
      "Falsche Statuskommunikation schadet Vertrauen sofort.",
      "TMS-Daten koennen unvollstaendig oder zu spaet sein.",
      "Automatisierung ohne Eskalationslogik ueberfordert Disposition.",
    ],
    meetingMoves: [
      "Eine problematische Sendung live rekonstruieren.",
      "Zwischen Datenproblem, Kommunikationsproblem und Entscheidungsproblem trennen.",
      "Kundenupdate zuerst als Entwurf mit Freigabe planen.",
    ],
    asdarPlan: {
      analyse: [
        "Status- und Dokumentenvolumen erfassen.",
        "Top Abweichungsarten und Rueckfragen clustern.",
      ],
      structure: [
        "Statuslogik, Eskalationsregeln und Dokumentenpflichten definieren.",
        "Pilotkunden oder Pilotroute auswaehlen.",
      ],
      digitize: [
        "TMS-/Dokumentenquellen fuer Pilot nutzbar machen.",
        "Zentrale Sicht fuer Status, Dokumente und Aufgaben schaffen.",
      ],
      automate: [
        "Statusupdates, Dokumentenchecks und Abweichungsaufgaben vorbereiten.",
        "Dispo-E-Mails automatisch sortieren.",
      ],
      realize: [
        "Rueckfragen, Reaktionszeit und fehlende Dokumente messen.",
        "Pilot auf weitere Kunden/Routen erweitern.",
      ],
    },
    seedTasks: [
      {
        title: "Top Statusanfragen und Abweichungen der letzten Woche exportieren",
        owner: "customer",
        visibleToCustomer: true,
      },
      {
        title: "Status-/Dokumentenpilot mit klarer KPI definieren",
        owner: "assad",
        visibleToCustomer: true,
      },
      {
        title: "Eskalationslogik fuer automatische Kundenupdates skizzieren",
        owner: "assad",
        visibleToCustomer: false,
      },
    ],
    seedMilestones: [
      { title: "Pilotroute oder Pilotkunde festgelegt", visibleToCustomer: true },
      { title: "Status-/Dokumentenautomation getestet", visibleToCustomer: true },
    ],
    customerKickoffUpdate: {
      title: "Projekt gestartet: Logistikprozesse und Statusautomation",
      body:
        "Wir analysieren Statuskommunikation, Dokumentenfluss und Abweichungen, um einen operativen Pilot mit messbarer Entlastung zu definieren.",
    },
  },
  {
    id: "education-training",
    label: "Bildung / Training",
    category: "Education",
    industryLabel: "Bildung",
    bestFor:
      "Akademien, Coaches, Weiterbildungsanbieter und interne Trainingsabteilungen mit Content, Teilnehmerkommunikation und Lernprozessen.",
    projectName: "ASDAR Lern- und Trainingsprozess Analyse",
    summary:
      "Analyse von Kurscontent, Teilnehmerkommunikation, Lernmaterial, Feedback und administrativen Trainingsablaeufen.",
    kickoffGoal:
      "Wiederkehrende Content- und Teilnehmerprozesse finden, die AI vorbereiten und skalieren kann.",
    intake: {
      ...genericIntake,
      stakeholders:
        "Leitung, Trainer, Content-Verantwortliche, Teilnehmerbetreuung, Vertrieb und LMS/Admin.",
      issues:
        "Material wird manuell angepasst, Teilnehmerfragen wiederholen sich, Feedback wird nicht ausgewertet, Follow-ups fehlen.",
      goals:
        "Content schneller anpassen, Teilnehmer besser begleiten, Feedback verwerten und Adminaufwand reduzieren.",
      currentTools:
        "LMS, Slides, PDFs, E-Mail, Kalender, CRM, Umfragetools, Community/Chat und Abrechnung.",
      opportunities:
        "Lernassistent, Content-Adaption, FAQ, Feedbackanalyse, Aufgaben und Follow-ups automatisieren.",
    },
    callAgenda: [
      "Teilnehmerreise von Buchung bis Follow-up skizzieren.",
      "Contentquellen und Varianten erfassen.",
      "Wiederkehrende Fragen und Feedback clustern.",
      "Pilot fuer FAQ, Content oder Feedback waehlen.",
    ],
    discoveryQuestions: [
      "Welche Teilnehmerfragen werden immer wieder beantwortet?",
      "Welche Inhalte muessen pro Zielgruppe angepasst werden?",
      "Welches Feedback bleibt ungenutzt?",
      "Wo entstehen manuelle Follow-ups oder Zertifikatsprozesse?",
    ],
    quickWins: [
      "FAQ-/Lernassistent auf Basis freigegebener Materialien.",
      "Feedbackzusammenfassung mit Verbesserungslog.",
      "Content-Varianten fuer Zielgruppen aus Mastermaterial vorbereiten.",
    ],
    automationIdeas: [
      "Teilnehmerfragen mit Quellen aus Kursmaterial beantworten.",
      "Feedback in Themen, Risiken und Verbesserungsaufgaben clustern.",
      "Follow-up-Mails und Lernaufgaben personalisiert vorbereiten.",
    ],
    risks: [
      "AI darf keine falschen Lerninhalte halluzinieren.",
      "Urheberrechte und Materialfreigaben muessen geklaert sein.",
      "Zu viel Automatisierung kann persoenliche Betreuung schwaechen.",
    ],
    meetingMoves: [
      "Eine konkrete Trainingseinheit nehmen und Teilnehmerreise mappen.",
      "Mastercontent und Varianten nebeneinander pruefen.",
      "Quellenpflicht fuer Lernassistenten festlegen.",
    ],
    asdarPlan: {
      analyse: [
        "Teilnehmerfragen, Contentvarianten und Feedbackvolumen erfassen.",
        "Wiederholbare Admin- und Lernprozesse identifizieren.",
      ],
      structure: [
        "Contentmodule, Zielgruppen und Quellenregeln definieren.",
        "Feedback- und Verbesserungslogik strukturieren.",
      ],
      digitize: [
        "Freigegebene Wissensbasis fuer Kursmaterial aufsetzen.",
        "Teilnehmer- und Feedbackdaten nutzbar machen.",
      ],
      automate: [
        "FAQ, Contentvarianten und Feedbackauswertung automatisieren.",
        "Follow-ups und Lernaufgaben vorbereiten.",
      ],
      realize: [
        "Supportaufwand, Contentdurchsatz und Zufriedenheit messen.",
        "Pilot auf weitere Kurse ausrollen.",
      ],
    },
    seedTasks: [
      {
        title: "Mastermaterial und Top Teilnehmerfragen bereitstellen",
        owner: "customer",
        visibleToCustomer: true,
      },
      {
        title: "Quellen- und Freigabelogik fuer Lernassistent definieren",
        owner: "assad",
        visibleToCustomer: false,
      },
      {
        title: "Pilot fuer FAQ, Feedback oder Contentvariante waehlen",
        owner: "assad",
        visibleToCustomer: true,
      },
    ],
    seedMilestones: [
      { title: "Kursprozess und Wissensbasis strukturiert", visibleToCustomer: true },
      { title: "Erster Trainingsassistent/Feedbackflow getestet", visibleToCustomer: true },
    ],
    customerKickoffUpdate: {
      title: "Projekt gestartet: Lern- und Trainingsprozesse",
      body:
        "Wir analysieren Content, Teilnehmerkommunikation und Feedback, um einen konkreten AI-Piloten fuer Entlastung und bessere Lernerfahrung zu definieren.",
    },
  },
];

const baseOfferTiers: ConsultingOfferTier[] = [
  {
    id: "snapshot",
    label: "ASDAR Snapshot",
    bestFor: "Noch unklarer Bedarf, niedrige Datenlage oder ein erster Einstieg.",
    basePriceCents: 49000,
    minPriceCents: 49000,
    maxPriceCents: 150000,
    timelineWeeks: [1, 1],
    effortDays: [1, 2],
    deliverables: [
      "kompakter Readiness-Check",
      "Top-3 Engpässe",
      "erste Automatisierungs-Hypothese",
      "nächste Fragen und Datenbedarf",
    ],
  },
  {
    id: "audit",
    label: "ASDAR Audit",
    bestFor: "Analysebereiter Kunde mit konkreten Problemen und offenem Lösungsraum.",
    basePriceCents: 290000,
    minPriceCents: 240000,
    maxPriceCents: 490000,
    timelineWeeks: [1, 2],
    effortDays: [3, 5],
    deliverables: [
      "ASDAR Diagnosis Pack",
      "Prozess- und Datenanalyse",
      "priorisierte Quick Wins",
      "Roadmap mit Aufwand, Nutzen und Risiken",
    ],
  },
  {
    id: "sprint",
    label: "ASDAR Sprint",
    bestFor: "Klarer Pilot oder Quick Win, der direkt umgesetzt werden soll.",
    basePriceCents: 590000,
    minPriceCents: 490000,
    maxPriceCents: 1200000,
    timelineWeeks: [2, 4],
    effortDays: [6, 12],
    deliverables: [
      "konkreter Automatisierungs-Pilot",
      "Workflow-Design und Umsetzungsplan",
      "Tool-/Datenstruktur",
      "Pilot-Test mit Kundenfeedback",
    ],
  },
  {
    id: "pilot",
    label: "ASDAR Pilot Build",
    bestFor: "Umsetzung mit mehreren Systemen, Datenquellen oder Teamrollen.",
    basePriceCents: 950000,
    minPriceCents: 750000,
    maxPriceCents: 1800000,
    timelineWeeks: [4, 8],
    effortDays: [10, 22],
    deliverables: [
      "Pilot-Workflow im Betrieb",
      "Integrations- und Datenkonzept",
      "Rollen, Freigaben und Schulung",
      "Messung gegen Vorher/Nachher-KPI",
    ],
  },
  {
    id: "advisory",
    label: "ASDAR Advisory",
    bestFor: "Laufende Begleitung nach Analyse oder Pilot.",
    basePriceCents: 250000,
    minPriceCents: 250000,
    maxPriceCents: 650000,
    timelineWeeks: [4, 12],
    effortDays: [2, 6],
    deliverables: [
      "monatliche Priorisierung",
      "Review von AI-/Digitalisierungsinitiativen",
      "Sparring für Umsetzung und Change",
      "kontinuierliche Roadmap-Pflege",
    ],
  },
];

const commercialModels: Record<string, Omit<ConsultingCommercialModel, "templateId">> = {
  "b2b-services": {
    defaultTierId: "audit",
    complexityMultiplier: 1,
    pricingNotes: [
      "Angebots-, E-Mail- und Reportingprozesse sind oft schnell analysierbar.",
      "Preis steigt bei vielen Servicevarianten, CRM-Anbindung oder Angebotslogik.",
    ],
    tiers: baseOfferTiers,
  },
  manufacturing: {
    defaultTierId: "audit",
    complexityMultiplier: 1.25,
    pricingNotes: [
      "Shopfloor-, ERP- und Qualitätsprozesse brauchen mehr Stakeholder-Abstimmung.",
      "Pilotpreise steigen bei MES/ERP-Schnittstellen oder Schichtbetrieb.",
    ],
    tiers: baseOfferTiers,
  },
  healthcare: {
    defaultTierId: "audit",
    complexityMultiplier: 1.2,
    pricingNotes: [
      "Datenschutz, Patientendaten und Fachsoftware erhöhen Prüfaufwand.",
      "Erster Scope sollte eng bleiben: Telefon, Dokumentation oder Terminfluss.",
    ],
    tiers: baseOfferTiers,
  },
  ecommerce: {
    defaultTierId: "sprint",
    complexityMultiplier: 1.05,
    pricingNotes: [
      "Produktdaten, Support und Kampagnen lassen sich oft schnell pilotieren.",
      "Preis steigt bei großen Sortimenten, mehreren Shops oder PIM/ERP-Anbindung.",
    ],
    tiers: baseOfferTiers,
  },
  "legal-tax": {
    defaultTierId: "audit",
    complexityMultiplier: 1.25,
    pricingNotes: [
      "Dokumente, Fristen und Mandatsdaten brauchen klare Freigabe- und Datenschutzlogik.",
      "Keine Rechts- oder Steuerberatung automatisieren, sondern Arbeitsvorbereitung.",
    ],
    tiers: baseOfferTiers,
  },
  "construction-real-estate": {
    defaultTierId: "sprint",
    complexityMultiplier: 1.1,
    pricingNotes: [
      "Fotos, Baustellenberichte und Angebote eignen sich gut für schnelle Piloten.",
      "Preis steigt bei mobiler Nutzung, vielen Objektarten oder Projektteams.",
    ],
    tiers: baseOfferTiers,
  },
  logistics: {
    defaultTierId: "audit",
    complexityMultiplier: 1.2,
    pricingNotes: [
      "Disposition, Statuskommunikation und Dokumente brauchen Echtzeitnähe.",
      "Preis steigt bei Transportmanagement-Systemen, Schnittstellen und mehreren Standorten.",
    ],
    tiers: baseOfferTiers,
  },
  "education-training": {
    defaultTierId: "audit",
    complexityMultiplier: 1.1,
    pricingNotes: [
      "Kommunikation, Verwaltung und Lern-/Teilnehmerdaten müssen sauber getrennt werden.",
      "Preis steigt bei sensiblen Daten, mehreren Rollen oder Schulträger-Strukturen.",
    ],
    tiers: baseOfferTiers,
  },
};

export function getConsultingCommercialModel(template: ConsultingTemplate) {
  const model = commercialModels[template.id] ?? commercialModels["b2b-services"];
  return {
    templateId: template.id,
    ...model,
  } satisfies ConsultingCommercialModel;
}

export function applyTemplateOverride(
  template: ConsultingTemplate,
  override?: PortalTemplateOverride,
): ConsultingTemplate {
  if (!override) return template;

  return {
    ...template,
    label: override.label || template.label,
    bestFor: override.bestFor || template.bestFor,
    kickoffGoal: override.kickoffGoal || template.kickoffGoal,
    summary: override.summary || template.summary,
    discoveryQuestions: override.discoveryQuestions.length
      ? override.discoveryQuestions
      : template.discoveryQuestions,
    quickWins: override.quickWins.length ? override.quickWins : template.quickWins,
    automationIdeas: override.automationIdeas.length
      ? override.automationIdeas
      : template.automationIdeas,
    risks: override.risks.length ? override.risks : template.risks,
  };
}

export function effectiveConsultingTemplates(
  overrides: PortalTemplateOverride[] = [],
) {
  return consultingTemplates.map((template) =>
    applyTemplateOverride(
      template,
      overrides.find((override) => override.templateId === template.id),
    ),
  );
}

export function getEffectiveConsultingTemplate(
  templateId: string,
  overrides: PortalTemplateOverride[] = [],
) {
  const template = getConsultingTemplate(templateId);
  if (!template) return undefined;
  return applyTemplateOverride(
    template,
    overrides.find((override) => override.templateId === template.id),
  );
}

export function getConsultingTemplate(id?: string | null) {
  if (!id) return undefined;
  return consultingTemplates.find((template) => template.id === id);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const industryAliases: Record<string, string[]> = {
  "b2b-services": [
    "agentur",
    "beratung",
    "consulting",
    "dienstleistung",
    "service",
    "b2b",
  ],
  manufacturing: [
    "produktion",
    "industrie",
    "fertigung",
    "manufacturing",
    "maschinenbau",
  ],
  healthcare: ["gesundheit", "praxis", "arzt", "pflege", "labor", "healthcare"],
  ecommerce: ["e commerce", "ecommerce", "handel", "retail", "shop", "commerce"],
  "legal-tax": ["kanzlei", "steuer", "recht", "law", "tax", "anwalt"],
  "construction-real-estate": [
    "bau",
    "immobilien",
    "handwerk",
    "real estate",
    "construction",
  ],
  logistics: ["logistik", "transport", "spedition", "fuhrpark", "logistics"],
  "education-training": [
    "bildung",
    "training",
    "akademie",
    "education",
    "coach",
  ],
};

export function matchConsultingTemplate(industry?: string) {
  const normalized = normalize(industry || "");
  if (!normalized) return consultingTemplates[0];

  const exact = consultingTemplates.find((template) =>
    normalize(template.industryLabel).includes(normalized),
  );
  if (exact) return exact;

  const match = Object.entries(industryAliases).find(([, aliases]) =>
    aliases.some((alias) => normalized.includes(alias)),
  );
  return getConsultingTemplate(match?.[0]) ?? consultingTemplates[0];
}

export function mergeTemplateIntake(
  current: ProjectIntelligence,
  template: ConsultingTemplate,
) {
  return {
    companyContext: current.companyContext || template.intake.companyContext,
    stakeholders: current.stakeholders || template.intake.stakeholders,
    issues: current.issues || template.intake.issues,
    goals: current.goals || template.intake.goals,
    currentTools: current.currentTools || template.intake.currentTools,
    dataSituation: current.dataSituation || template.intake.dataSituation,
    constraints: current.constraints || template.intake.constraints,
    opportunities: current.opportunities || template.intake.opportunities,
    internalNotes: [current.internalNotes, template.intake.internalNotes]
      .filter(Boolean)
      .join("\n\n"),
  };
}

export function buildTemplatePrompt(bundle: ProjectBundle, template: ConsultingTemplate) {
  return [
    `Industry playbook: ${template.label}`,
    `Best for: ${template.bestFor}`,
    `Kickoff goal: ${template.kickoffGoal}`,
    `Quick wins: ${template.quickWins.join("; ")}`,
    `Automation ideas: ${template.automationIdeas.join("; ")}`,
    `Risks: ${template.risks.join("; ")}`,
    `Meeting moves: ${template.meetingMoves.join("; ")}`,
    `Current project: ${bundle.project.name} / ${bundle.organization.name}`,
  ].join("\n");
}
