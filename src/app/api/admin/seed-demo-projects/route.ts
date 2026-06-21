import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/portal/password";
import { getSql } from "@/lib/portal/database";
import type {
  AiInsight,
  Invoice,
  Organization,
  Project,
  ProjectFile,
  ProjectIntelligence,
  ProjectMilestone,
  ProjectTask,
  ProjectUpdate,
  User,
} from "@/lib/portal/types";

export const dynamic = "force-dynamic";

const demoPassword = "DemoKunde2026!";
const baseDate = "2026-06-21";

type DemoDefinition = {
  key: string;
  customer: Pick<User, "id" | "name" | "email">;
  organization: Organization;
  project: Project;
  intelligence: ProjectIntelligence;
  updates: Array<
    Omit<ProjectUpdate, "createdBy" | "createdAt"> & {
      by: "admin" | "customer";
      createdAt: string;
    }
  >;
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  files: Array<
    Omit<ProjectFile, "storagePath" | "mimeType" | "size" | "uploadedBy"> & {
      content: string;
    }
  >;
  invoices: Invoice[];
  insights: AiInsight[];
};

function iso(daysOffset: number, hour = 10) {
  const date = new Date(`${baseDate}T${String(hour).padStart(2, "0")}:00:00Z`);
  date.setUTCDate(date.getUTCDate() + daysOffset);
  return date.toISOString();
}

function date(daysOffset: number) {
  return iso(daysOffset).slice(0, 10);
}

const demos: DemoDefinition[] = [
  {
    key: "allgemeinarzt",
    customer: {
      id: "user_demo_allgemeinarzt_de",
      name: "Dr. Anna Weber",
      email: "demo.allgemeinarzt@assad-dar.de",
    },
    organization: {
      id: "org_demo_allgemeinarzt_de",
      name: "Praxis Dr. Weber & Kollegen",
      industry: "Allgemeinmedizin / Healthcare Deutschland",
      website: "https://praxis-dr-weber.example",
      createdAt: iso(-10),
    },
    project: {
      id: "project_demo_allgemeinarzt_de",
      organizationId: "org_demo_allgemeinarzt_de",
      name: "Digitalisierung Allgemeinarztpraxis",
      summary:
        "Allgemeinarztpraxis in Deutschland mit zwei Aerzten, fuenf MFA und hohem Telefon-, Termin- und Dokumentationsaufwand. Ziel ist ein pragmatischer Digitalisierungsfahrplan fuer Patientenkommunikation, Terminsteuerung und interne Wissensablaeufe.",
      status: "analysis",
      asdarStage: "structure",
      health: "green",
      nextStep:
        "Telefon- und Terminprozess final priorisieren und daraus einen kleinen Pilot fuer digitale Rueckrufe und FAQ-Antworten definieren.",
      createdAt: iso(-10),
      updatedAt: iso(0, 12),
    },
    intelligence: {
      projectId: "project_demo_allgemeinarzt_de",
      companyContext:
        "Hausarztpraxis in NRW mit ca. 1.800 Patienten pro Quartal. Das Team arbeitet mit PVS, Telefonanlage, E-Mail, Papierformularen und vielen wiederkehrenden Patientenanfragen.",
      stakeholders:
        "Dr. Anna Weber als Inhaberin, Praxismanagerin Frau Schmitz, zwei MFA als Power User, externer IT-Dienstleister, Datenschutzbeauftragter.",
      issues:
        "Telefon ist dauerhaft ueberlastet, Terminwuensche und Rezeptanfragen laufen ueber mehrere Kanaele, Befundnachfragen werden manuell verfolgt, Informationen liegen verstreut.",
      goals:
        "Telefonaufkommen um 25 Prozent senken, Rezept- und Terminprozesse klarer steuern, Patienten schneller informieren und einen datenschutzkonformen AI-Fahrplan erstellen.",
      currentTools:
        "Praxisverwaltungssystem, Microsoft 365, Telefonanlage, E-Mail, Website-Formular, Papier-Checklisten, lokale Dateiablage.",
      dataSituation:
        "Anonymisierte Telefonnotizen, Beispiel-E-Mails, Terminarten, FAQ-Liste, Website-Texte, Formularvorlagen und Telefonstatistiken.",
      constraints:
        "DSGVO, aerztliche Schweigepflicht, sehr begrenzte Zeitfenster des Praxisteams, keine grosse IT-Migration im laufenden Quartal.",
      opportunities:
        "Digitaler Anfrage-Intake, FAQ-/Antwortentwuerfe fuer MFA, Rueckruf-Triage, strukturierte Rezept- und Ueberweisungsanfragen, interne Wissenssuche.",
      internalNotes:
        "Nicht mit AI in Patientendaten starten. Erster Hebel: Volumen und Kategorien der Anfragen messen, dann sicheren Intake und Antwortbausteine bauen.",
      updatedAt: iso(0, 12),
    },
    updates: [
      {
        id: "update_demo_gp_customer_kickoff",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Kickoff abgeschlossen: Praxisprozesse priorisiert",
        body:
          "Wir haben die wichtigsten Reibungspunkte im Praxisalltag aufgenommen. Der erste Fokus liegt auf Telefonentlastung, Rezeptanfragen und klaren digitalen Rueckmeldewegen fuer Patienten.",
        visibility: "customer",
        asdarStage: "analyse",
        by: "admin",
        createdAt: iso(-6, 10),
      },
      {
        id: "update_demo_gp_customer_next",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Status: Termin- und Telefonfluss wird strukturiert",
        body:
          "Assad erstellt aktuell eine Prozesslandkarte fuer Terminarten, Rueckrufe, Rezeptwuensche und wiederkehrende Patientenfragen. Daraus entsteht der erste Pilotvorschlag.",
        visibility: "customer",
        asdarStage: "structure",
        by: "admin",
        createdAt: iso(-2, 10),
      },
      {
        id: "update_demo_gp_intake",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Intake: Kundenfragebogen eingereicht",
        body:
          "Dr. Anna Weber\n\nUnternehmenskontext: Hausarztpraxis mit hohem Telefonaufkommen und vielen wiederkehrenden Patientenanliegen.\n\nProbleme: Telefon blockiert MFA, Rezept- und Terminwuensche sind unstrukturiert, Informationen liegen an mehreren Orten.\n\nZiele: Weniger Telefonstress, bessere Patientenkommunikation, sicherer Einstieg in KI und Automatisierung.\n\nTools: PVS, Microsoft 365, Telefonanlage, E-Mail und Website.",
        visibility: "customer",
        asdarStage: "analyse",
        by: "customer",
        createdAt: iso(-5, 14),
      },
      {
        id: "update_demo_gp_comment",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Kommentar: Dr. Anna Weber",
        body:
          "Dr. Anna Weber\n\nBitte den Rezeptprozess und die taeglichen Rueckrufe zuerst betrachten. Das ist fuer das Team aktuell die groesste Belastung.",
        visibility: "customer",
        asdarStage: "structure",
        by: "customer",
        createdAt: iso(-1, 14),
      },
      {
        id: "update_demo_gp_audit",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Audit: Demo-Projekt vollstaendig angelegt",
        body:
          "Admin-Intelligence, Kundenintake, Aufgaben, Meilensteine, Dateien, Rechnung und AI-Hinweise wurden fuer die Allgemeinarzt-Demo erstellt.",
        visibility: "internal",
        asdarStage: "structure",
        by: "admin",
        createdAt: iso(0, 10),
      },
    ],
    tasks: [
      {
        id: "task_demo_gp_1",
        projectId: "project_demo_allgemeinarzt_de",
        title:
          "Anonymisierte Beispiele fuer Rezept-, Termin- und Rueckrufanfragen bereitstellen",
        owner: "customer",
        status: "doing",
        dueDate: date(3),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
      {
        id: "task_demo_gp_2",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Telefon- und Anfragekategorien in Prozesslandkarte strukturieren",
        owner: "assad",
        status: "doing",
        dueDate: date(5),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
      {
        id: "task_demo_gp_3",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Datenschutzsichere Pilotvariante fuer digitalen Anfrage-Intake skizzieren",
        owner: "assad",
        status: "todo",
        dueDate: date(10),
        visibleToCustomer: false,
        createdAt: iso(-10),
      },
    ],
    milestones: [
      {
        id: "mile_demo_gp_1",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Intake und Praxis-Workshop abgeschlossen",
        status: "done",
        dueDate: date(-5),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
      {
        id: "mile_demo_gp_2",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Prozesslandkarte und Quick-Win-Liste freigegeben",
        status: "active",
        dueDate: date(4),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
      {
        id: "mile_demo_gp_3",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Pilot fuer digitale Patientenanfragen entschieden",
        status: "planned",
        dueDate: date(14),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
    ],
    files: [
      {
        id: "file_demo_gp_process",
        projectId: "project_demo_allgemeinarzt_de",
        name: "Praxis-Prozesslandkarte.md",
        description: "Erste Prozesslandkarte fuer Telefon, Termin, Rezept und Rueckruf.",
        visibility: "customer",
        uploadedAt: iso(-1, 11),
        content:
          "# Praxis-Prozesslandkarte\n\n## Fokus\nTelefonentlastung, Rezeptanfragen, Terminsteuerung, Rueckrufe.\n\n## Naechster Pilot\nDigitaler Anfrage-Intake mit MFA-Freigabe und klaren Antwortbausteinen.\n",
      },
      {
        id: "file_demo_gp_quickwins",
        projectId: "project_demo_allgemeinarzt_de",
        name: "Patientenkommunikation-Quick-Wins.md",
        description: "Kundenfreundliche Quick-Wins fuer die Praxis.",
        visibility: "customer",
        uploadedAt: iso(-1, 11),
        content:
          "# Quick Wins\n\n- Website-Hinweise fuer Rezept, Ueberweisung und Rueckruf vereinheitlichen.\n- Anfrageformular mit Pflichtfeldern einfuehren.\n- Antwortbausteine fuer haeufige Anliegen vorbereiten.\n",
      },
    ],
    invoices: [
      {
        id: "invoice_demo_gp_1",
        projectId: "project_demo_allgemeinarzt_de",
        number: "AD-DEMO-2026-001",
        description: "ASDAR Analysepaket Allgemeinarztpraxis",
        amountCents: 290000,
        currency: "EUR",
        status: "sent",
        issuedAt: date(-2),
        dueDate: date(12),
        paymentUrl: "",
        createdAt: iso(-2, 9),
      },
    ],
    insights: [
      {
        id: "insight_demo_gp_1",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Beratungsfokus: Telefonentlastung ohne Patientendatenrisiko",
        body:
          "Der erste Hebel sollte ein strukturierter Anfrage-Intake mit MFA-Freigabe sein. So entsteht Entlastung, ohne medizinische Entscheidungen zu automatisieren.",
        kind: "guidance",
        createdAt: iso(0, 13),
      },
      {
        id: "insight_demo_gp_2",
        projectId: "project_demo_allgemeinarzt_de",
        title: "Risiko: Datenschutz und Akzeptanz",
        body:
          "Jede Automatisierung muss klar zwischen administrativer Triage und medizinischer Bewertung trennen.",
        kind: "risk",
        createdAt: iso(0, 13),
      },
    ],
  },
  {
    key: "autohaendler",
    customer: {
      id: "user_demo_autohaendler_de",
      name: "Max Koenig",
      email: "demo.autohaus@assad-dar.de",
    },
    organization: {
      id: "org_demo_autohaendler_de",
      name: "Autohaus Koenig GmbH",
      industry: "Autohandel / Automotive Retail Deutschland",
      website: "https://autohaus-koenig.example",
      createdAt: iso(-10),
    },
    project: {
      id: "project_demo_autohaendler_de",
      organizationId: "org_demo_autohaendler_de",
      name: "KI-gestuetzte Lead- und Fahrzeugprozesse",
      summary:
        "Autohaendler in Deutschland mit mehreren Leadquellen, Fahrzeugboersen, Probefahrten und Angebotsprozessen. Ziel ist, Leads schneller zu qualifizieren, Antwortzeiten zu senken und Fahrzeugdaten konsistent zu nutzen.",
      status: "implementation",
      asdarStage: "digitize",
      health: "amber",
      nextStep:
        "Leadquellen und Fahrzeugdatenexport zusammenfuehren, danach Prototyp fuer schnelle Erstantworten und Probefahrt-Follow-ups bauen.",
      createdAt: iso(-10),
      updatedAt: iso(0, 12),
    },
    intelligence: {
      projectId: "project_demo_autohaendler_de",
      companyContext:
        "Mittelstaendisches Autohaus in Hessen mit Neu- und Gebrauchtwagen, Werkstatt und Online-Leads ueber Website, mobile.de, AutoScout24, Telefon und E-Mail.",
      stakeholders:
        "Geschaeftsfuehrer Max Koenig, Verkaufsleitung, zwei Verkaufsberater, Marketing/Website, Serviceannahme, CRM-/DMS-Verantwortlicher.",
      issues:
        "Leads werden manuell aus Portalen uebertragen, Antwortzeiten schwanken, Probefahrt-Follow-ups gehen unter, Fahrzeugdaten sind nicht immer konsistent.",
      goals:
        "Lead-Reaktionszeit unter 15 Minuten bringen, Probefahrtquote verbessern, Angebots- und Finanzierungsanfragen schneller beantworten.",
      currentTools:
        "Dealer Management System, CRM, mobile.de, AutoScout24, Website-Formular, E-Mail, Telefon, Excel-Auswertungen.",
      dataSituation:
        "Leads, Fahrzeuglisten, Preislisten, Angebotsvorlagen, Probefahrttermine und E-Mail-Verlaeufe koennen anonymisiert exportiert werden.",
      constraints:
        "Schneller Vertrieb darf nicht gebremst werden, DSGVO und Einwilligung fuer Kommunikation beachten, kein kompletter CRM-Wechsel.",
      opportunities:
        "Lead-Triage, automatische Erstantworten, Probefahrt-Erinnerungen, Fahrzeugdaten-QA, Angebotsentwuerfe und Follow-up-Sequenzen.",
      internalNotes:
        "Health amber wegen Datenfragmentierung und DMS-Abhaengigkeit. Erst Leadfluss sichtbar machen, dann einen Kanal automatisieren und messen.",
      updatedAt: iso(0, 12),
    },
    updates: [
      {
        id: "update_demo_auto_kickoff",
        projectId: "project_demo_autohaendler_de",
        title: "Kickoff abgeschlossen: Leadfluss und Fahrzeugdaten im Fokus",
        body:
          "Wir haben die wichtigsten Leadquellen und Uebergaben aufgenommen. Der erste Pilot konzentriert sich auf schnelle Erstreaktion und Follow-ups nach Probefahrten.",
        visibility: "customer",
        asdarStage: "analyse",
        by: "admin",
        createdAt: iso(-8, 10),
      },
      {
        id: "update_demo_auto_status",
        projectId: "project_demo_autohaendler_de",
        title: "Status: Datenexport und Antwortlogik vorbereitet",
        body:
          "Assad prueft aktuell, wie Leadquelle, Fahrzeuginteresse, Dringlichkeit und naechste Aktion in eine einfache Vertriebslogik ueberfuehrt werden koennen.",
        visibility: "customer",
        asdarStage: "digitize",
        by: "admin",
        createdAt: iso(-3, 10),
      },
      {
        id: "update_demo_auto_intake",
        projectId: "project_demo_autohaendler_de",
        title: "Intake: Kundenfragebogen eingereicht",
        body:
          "Max Koenig\n\nUnternehmenskontext: Autohaus mit vielen Online-Leads und hohem Follow-up-Aufwand.\n\nProbleme: Leadquellen sind verteilt, Reaktionszeiten schwanken, Fahrzeugdaten muessen mehrfach gepflegt werden.\n\nZiele: Schnellere Antworten, bessere Probefahrtquote, weniger verlorene Leads.\n\nTools: DMS, CRM, mobile.de, AutoScout24, Website, E-Mail.",
        visibility: "customer",
        asdarStage: "analyse",
        by: "customer",
        createdAt: iso(-7, 14),
      },
      {
        id: "update_demo_auto_comment",
        projectId: "project_demo_autohaendler_de",
        title: "Kommentar: Max Koenig",
        body:
          "Max Koenig\n\nBitte den mobile.de Leadflow zuerst betrachten. Dort verlieren wir aus meiner Sicht die meisten Chancen durch spaete Rueckmeldung.",
        visibility: "customer",
        asdarStage: "digitize",
        by: "customer",
        createdAt: iso(-2, 14),
      },
      {
        id: "update_demo_auto_reminder",
        projectId: "project_demo_autohaendler_de",
        title: "Erinnerung: Fahrzeugdatenexport",
        body:
          "Bitte bis zum naechsten Workshop einen anonymisierten Export mit 20 Fahrzeugen und 10 Beispiel-Leads bereitstellen.",
        visibility: "customer",
        asdarStage: "digitize",
        by: "admin",
        createdAt: iso(-1, 10),
      },
    ],
    tasks: [
      {
        id: "task_demo_auto_1",
        projectId: "project_demo_autohaendler_de",
        title: "10 anonymisierte Online-Leads und aktuellen Fahrzeugdatenexport bereitstellen",
        owner: "customer",
        status: "todo",
        dueDate: date(2),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
      {
        id: "task_demo_auto_2",
        projectId: "project_demo_autohaendler_de",
        title: "Leadqualifizierungslogik fuer Website und Boersen skizzieren",
        owner: "assad",
        status: "doing",
        dueDate: date(5),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
    ],
    milestones: [
      {
        id: "mile_demo_auto_1",
        projectId: "project_demo_autohaendler_de",
        title: "Leadquellen und Datenfelder dokumentiert",
        status: "done",
        dueDate: date(-4),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
      {
        id: "mile_demo_auto_2",
        projectId: "project_demo_autohaendler_de",
        title: "Erstreaktions-Prototyp fuer Online-Leads",
        status: "active",
        dueDate: date(7),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
    ],
    files: [
      {
        id: "file_demo_auto_leadmap",
        projectId: "project_demo_autohaendler_de",
        name: "Autohaus-Leadprozess.md",
        description: "Leadquellen, Statuslogik und naechste Aktionen.",
        visibility: "customer",
        uploadedAt: iso(-1, 11),
        content:
          "# Autohaus Leadprozess\n\n## Leadquellen\nWebsite, mobile.de, AutoScout24, Telefon, E-Mail.\n\n## Pilot\nErstantwort und Follow-up fuer mobile.de Leads.\n",
      },
      {
        id: "file_demo_auto_playbook",
        projectId: "project_demo_autohaendler_de",
        name: "Probefahrt-Follow-up-Playbook.md",
        description: "Kundenfreundliche Follow-up-Struktur fuer Vertrieb.",
        visibility: "customer",
        uploadedAt: iso(-1, 11),
        content:
          "# Probefahrt Follow-up\n\n- Direkt nach Termin: Danke und naechster Schritt.\n- Nach 24 Stunden: Entscheidungshilfe und Finanzierungsoption.\n- Nach 72 Stunden: Alternativfahrzeug oder Inzahlungnahme klaeren.\n",
      },
    ],
    invoices: [
      {
        id: "invoice_demo_auto_1",
        projectId: "project_demo_autohaendler_de",
        number: "AD-DEMO-2026-002",
        description: "ASDAR Lead-Automation Sprint Autohaus",
        amountCents: 420000,
        currency: "EUR",
        status: "sent",
        issuedAt: date(-4),
        dueDate: date(10),
        paymentUrl: "",
        createdAt: iso(-4, 9),
      },
    ],
    insights: [
      {
        id: "insight_demo_auto_1",
        projectId: "project_demo_autohaendler_de",
        title: "Beratungsfokus: Reaktionszeit messbar senken",
        body:
          "Der Autohaus-Pilot sollte sich auf einen Leadkanal konzentrieren und Antwortzeit, Probefahrtquote und Abschlusschance messen.",
        kind: "guidance",
        createdAt: iso(0, 13),
      },
      {
        id: "insight_demo_auto_2",
        projectId: "project_demo_autohaendler_de",
        title: "Risiko: Datenqualitaet Fahrzeugbestand",
        body:
          "Wenn Fahrzeugdaten nicht konsistent sind, erzeugt AI falsche Antworten. Vor Automatisierung braucht es Pflichtfelder und Datenpruefung.",
        kind: "risk",
        createdAt: iso(0, 13),
      },
    ],
  },
  {
    key: "textilreinigung",
    customer: {
      id: "user_demo_textilreinigung_de",
      name: "Leyla Demir",
      email: "demo.textilreinigung@assad-dar.de",
    },
    organization: {
      id: "org_demo_textilreinigung_de",
      name: "Textilreinigung Klar & Sauber",
      industry: "Textilreinigung / Dienstleistung Deutschland",
      website: "https://klar-und-sauber.example",
      createdAt: iso(-10),
    },
    project: {
      id: "project_demo_textilreinigung_de",
      organizationId: "org_demo_textilreinigung_de",
      name: "Digitale Auftragsannahme und Tourenkommunikation",
      summary:
        "Textilreinigung in Deutschland mit Ladenkundschaft, B2B-Abholung, Hotel-/Praxiswaesche und vielen telefonischen Statusfragen. Ziel ist eine einfache digitale Auftrags- und Kommunikationsstruktur.",
      status: "discovery",
      asdarStage: "analyse",
      health: "green",
      nextStep:
        "Auftragsarten, Abholrouten und haeufige Kundenfragen sammeln, danach Quick-Win-Plan fuer digitale Statuskommunikation erstellen.",
      createdAt: iso(-10),
      updatedAt: iso(0, 12),
    },
    intelligence: {
      projectId: "project_demo_textilreinigung_de",
      companyContext:
        "Lokale Textilreinigung mit Filiale, Abhol-/Bringservice fuer Gewerbekunden und wachsendem Anteil an WhatsApp- und Telefonanfragen.",
      stakeholders:
        "Inhaberin Leyla Demir, Filialleitung, Fahrer fuer Abholrouten, zwei Mitarbeitende in Annahme/Sortierung, Buchhaltung.",
      issues:
        "Auftragsstatus ist nicht transparent, Kunden rufen haeufig nach, Abholrouten werden manuell geplant, Reklamationen sind schlecht dokumentiert.",
      goals:
        "Weniger Statusanrufe, klarere Auftragsannahme, bessere Tourenkommunikation, schnellere Reklamationsbearbeitung und einfacher Monatsreport.",
      currentTools:
        "Kassensystem, Papierbelege, WhatsApp Business, Telefon, Excel fuer Gewerbekunden, E-Mail und manuelle Monatsrechnungen.",
      dataSituation:
        "Beispielauftraege, Tourenlisten, Reklamationsnotizen, B2B-Rechnungslisten und haeufige Kundenfragen koennen anonymisiert genutzt werden.",
      constraints:
        "Kleines Team, wenig Zeit fuer Schulung, Loesung muss mobil funktionieren, keine komplexe ERP-Einfuehrung.",
      opportunities:
        "Digitaler Auftragsstatus, WhatsApp-Antwortbausteine, Tourenchecklisten, Reklamationserfassung, B2B-Monatsreport.",
      internalNotes:
        "Sehr guter Quick-Win-Case. Erst Statuskommunikation und Tourenliste digitalisieren, dann Rechnungs-/B2B-Reporting.",
      updatedAt: iso(0, 12),
    },
    updates: [
      {
        id: "update_demo_clean_kickoff",
        projectId: "project_demo_textilreinigung_de",
        title: "Projekt gestartet: Auftragsstatus und Touren im Fokus",
        body:
          "Wir starten mit einer kompakten Analyse der wichtigsten Auftragsarten, Statusfragen und Abholrouten. Ziel ist ein einfacher Plan, der im Tagesgeschaeft funktioniert.",
        visibility: "customer",
        asdarStage: "analyse",
        by: "admin",
        createdAt: iso(-4, 10),
      },
      {
        id: "update_demo_clean_status",
        projectId: "project_demo_textilreinigung_de",
        title: "Status: Quick-Win-Liste in Arbeit",
        body:
          "Assad strukturiert aktuell Annahme, Bearbeitung, Abholung und Reklamationen. Daraus entsteht eine erste Liste mit digitalen Quick Wins.",
        visibility: "customer",
        asdarStage: "analyse",
        by: "admin",
        createdAt: iso(-1, 10),
      },
      {
        id: "update_demo_clean_intake",
        projectId: "project_demo_textilreinigung_de",
        title: "Intake: Kundenfragebogen eingereicht",
        body:
          "Leyla Demir\n\nUnternehmenskontext: Textilreinigung mit Filiale, Gewerbekunden und Abholservice.\n\nProbleme: Statusfragen, Papierlisten, WhatsApp-Chaos, manuelle Touren und unklare Reklamationen.\n\nZiele: Weniger Anrufe, bessere Uebersicht, einfache digitale Kommunikation.\n\nTools: Kassensystem, WhatsApp Business, Excel, Telefon, E-Mail.",
        visibility: "customer",
        asdarStage: "analyse",
        by: "customer",
        createdAt: iso(-3, 14),
      },
      {
        id: "update_demo_clean_comment",
        projectId: "project_demo_textilreinigung_de",
        title: "Kommentar: Leyla Demir",
        body:
          "Leyla Demir\n\nDer Status fuer B2B-Kunden ist besonders wichtig. Hotels fragen oft an, ob Abholung und Lieferung planmaessig laufen.",
        visibility: "customer",
        asdarStage: "analyse",
        by: "customer",
        createdAt: iso(-1, 14),
      },
    ],
    tasks: [
      {
        id: "task_demo_clean_1",
        projectId: "project_demo_textilreinigung_de",
        title: "5 Beispielauftraege und aktuelle Tourenliste anonymisiert hochladen",
        owner: "customer",
        status: "todo",
        dueDate: date(4),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
      {
        id: "task_demo_clean_2",
        projectId: "project_demo_textilreinigung_de",
        title: "Status- und Reklamationsfragen in Kategorien clustern",
        owner: "assad",
        status: "doing",
        dueDate: date(6),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
    ],
    milestones: [
      {
        id: "mile_demo_clean_1",
        projectId: "project_demo_textilreinigung_de",
        title: "Auftragsarten und Tourenlogik verstanden",
        status: "active",
        dueDate: date(5),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
      {
        id: "mile_demo_clean_2",
        projectId: "project_demo_textilreinigung_de",
        title: "Statuskommunikation als Quick Win definiert",
        status: "planned",
        dueDate: date(10),
        visibleToCustomer: true,
        createdAt: iso(-10),
      },
    ],
    files: [
      {
        id: "file_demo_clean_status",
        projectId: "project_demo_textilreinigung_de",
        name: "Textilreinigung-Statusprozess.md",
        description: "Auftragsstatus, Abholung und Kundenkommunikation.",
        visibility: "customer",
        uploadedAt: iso(-1, 11),
        content:
          "# Statusprozess Textilreinigung\n\n## Schritte\nAnnahme, Sortierung, Reinigung, Qualitaetscheck, Abholbereit, Ausgeliefert.\n\n## Quick Win\nStatusantworten und Tourenhinweise als einfache Vorlagen fuer WhatsApp Business.\n",
      },
      {
        id: "file_demo_clean_b2b",
        projectId: "project_demo_textilreinigung_de",
        name: "B2B-Kundenreport-Idee.md",
        description: "Erster Ansatz fuer Gewerbekunden-Reporting.",
        visibility: "customer",
        uploadedAt: iso(-1, 11),
        content:
          "# B2B Kundenreport\n\nMonatliche Uebersicht: Abholungen, Lieferungen, Mengen, Reklamationen, offene Rechnungen. Start mit Excel-Export und klarer Vorlage.\n",
      },
    ],
    invoices: [
      {
        id: "invoice_demo_clean_1",
        projectId: "project_demo_textilreinigung_de",
        number: "AD-DEMO-2026-003",
        description: "ASDAR Quick-Win Analyse Textilreinigung",
        amountCents: 180000,
        currency: "EUR",
        status: "draft",
        issuedAt: date(0),
        dueDate: date(14),
        paymentUrl: "",
        createdAt: iso(0, 9),
      },
    ],
    insights: [
      {
        id: "insight_demo_clean_1",
        projectId: "project_demo_textilreinigung_de",
        title: "Beratungsfokus: einfache Statuskommunikation",
        body:
          "Der groesste Nutzen entsteht wahrscheinlich durch klare Statuskategorien und schnelle Antwortbausteine statt durch ein grosses neues System.",
        kind: "guidance",
        createdAt: iso(0, 13),
      },
      {
        id: "insight_demo_clean_2",
        projectId: "project_demo_textilreinigung_de",
        title: "Risiko: Zu viel Tool-Komplexitaet",
        body:
          "Das Team braucht mobile, einfache Ablaeufe. Eine schwere ERP-Einfuehrung wuerde die Akzeptanz gefaehrden.",
        kind: "risk",
        createdAt: iso(0, 13),
      },
    ],
  },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("confirm") !== "seed-demo-projects") {
    return NextResponse.json({ error: "Missing confirmation" }, { status: 400 });
  }

  const passwordHash = hashPassword(demoPassword);
  const sql = getSql();
  const result = await sql.begin(async (tx) => {
    const adminRows = await tx`
      select id from portal_users where role = 'admin' order by created_at asc limit 1
    `;
    const admin = adminRows[0] as { id?: unknown } | undefined;
    const adminId = typeof admin?.id === "string" ? admin.id : "";
    if (!adminId) return { error: "No admin user found" };

    for (const demo of demos) {
      const existingCustomerRows = await tx`
        select id, created_at
        from portal_users
        where id = ${demo.customer.id} or lower(email) = lower(${demo.customer.email})
        limit 1
      `;
      const existingCustomer = existingCustomerRows[0] as
        | { id?: unknown; created_at?: unknown }
        | undefined;
      const customerId =
        typeof existingCustomer?.id === "string" ? existingCustomer.id : demo.customer.id;
      const customerCreatedAt =
        typeof existingCustomer?.created_at === "string"
          ? existingCustomer.created_at
          : iso(-10);

      await tx`
        insert into portal_users (id, name, email, password_hash, role, email_verified_at, created_at)
        values (
          ${customerId},
          ${demo.customer.name},
          ${demo.customer.email},
          ${passwordHash},
          'customer',
          ${iso(0)},
          ${customerCreatedAt}
        )
        on conflict (id) do update set
          name = excluded.name,
          email = excluded.email,
          password_hash = excluded.password_hash,
          role = excluded.role,
          email_verified_at = excluded.email_verified_at
      `;

      await tx`
        insert into portal_organizations (id, name, industry, website, created_at)
        values (
          ${demo.organization.id},
          ${demo.organization.name},
          ${demo.organization.industry},
          ${demo.organization.website ?? null},
          ${demo.organization.createdAt}
        )
        on conflict (id) do update set
          name = excluded.name,
          industry = excluded.industry,
          website = excluded.website
      `;

      await tx`
        insert into portal_projects (
          id, organization_id, name, summary, status, asdar_stage,
          health, next_step, created_at, updated_at
        )
        values (
          ${demo.project.id},
          ${demo.project.organizationId},
          ${demo.project.name},
          ${demo.project.summary},
          ${demo.project.status},
          ${demo.project.asdarStage},
          ${demo.project.health},
          ${demo.project.nextStep},
          ${demo.project.createdAt},
          ${demo.project.updatedAt}
        )
        on conflict (id) do update set
          organization_id = excluded.organization_id,
          name = excluded.name,
          summary = excluded.summary,
          status = excluded.status,
          asdar_stage = excluded.asdar_stage,
          health = excluded.health,
          next_step = excluded.next_step,
          updated_at = excluded.updated_at
      `;

      await tx`
        insert into portal_project_members (id, project_id, user_id, role, created_at)
        values (${`member_demo_${demo.key}`}, ${demo.project.id}, ${customerId}, 'client_owner', ${iso(-10)})
        on conflict (project_id, user_id) do update set role = excluded.role
      `;

      await tx`
        insert into portal_project_intelligence (
          project_id, company_context, stakeholders, issues, goals,
          current_tools, data_situation, constraints, opportunities,
          internal_notes, updated_at
        )
        values (
          ${demo.intelligence.projectId},
          ${demo.intelligence.companyContext},
          ${demo.intelligence.stakeholders},
          ${demo.intelligence.issues},
          ${demo.intelligence.goals},
          ${demo.intelligence.currentTools},
          ${demo.intelligence.dataSituation},
          ${demo.intelligence.constraints},
          ${demo.intelligence.opportunities},
          ${demo.intelligence.internalNotes},
          ${demo.intelligence.updatedAt}
        )
        on conflict (project_id) do update set
          company_context = excluded.company_context,
          stakeholders = excluded.stakeholders,
          issues = excluded.issues,
          goals = excluded.goals,
          current_tools = excluded.current_tools,
          data_situation = excluded.data_situation,
          constraints = excluded.constraints,
          opportunities = excluded.opportunities,
          internal_notes = excluded.internal_notes,
          updated_at = excluded.updated_at
      `;

      for (const update of demo.updates) {
        await tx`
          insert into portal_project_updates (
            id, project_id, title, body, visibility, asdar_stage, created_by, created_at
          )
          values (
            ${update.id},
            ${update.projectId},
            ${update.title},
            ${update.body},
            ${update.visibility},
            ${update.asdarStage},
            ${update.by === "customer" ? customerId : adminId},
            ${update.createdAt}
          )
          on conflict (id) do update set
            title = excluded.title,
            body = excluded.body,
            visibility = excluded.visibility,
            asdar_stage = excluded.asdar_stage,
            created_by = excluded.created_by
        `;
      }

      for (const task of demo.tasks) {
        await tx`
          insert into portal_project_tasks (
            id, project_id, title, owner, status, due_date, visible_to_customer, created_at
          )
          values (
            ${task.id},
            ${task.projectId},
            ${task.title},
            ${task.owner},
            ${task.status},
            ${task.dueDate ?? null},
            ${task.visibleToCustomer},
            ${task.createdAt}
          )
          on conflict (id) do update set
            title = excluded.title,
            owner = excluded.owner,
            status = excluded.status,
            due_date = excluded.due_date,
            visible_to_customer = excluded.visible_to_customer
        `;
      }

      for (const milestone of demo.milestones) {
        await tx`
          insert into portal_project_milestones (
            id, project_id, title, status, due_date, visible_to_customer, created_at
          )
          values (
            ${milestone.id},
            ${milestone.projectId},
            ${milestone.title},
            ${milestone.status},
            ${milestone.dueDate ?? null},
            ${milestone.visibleToCustomer},
            ${milestone.createdAt}
          )
          on conflict (id) do update set
            title = excluded.title,
            status = excluded.status,
            due_date = excluded.due_date,
            visible_to_customer = excluded.visible_to_customer
        `;
      }

      for (const invoice of demo.invoices) {
        await tx`
          insert into portal_invoices (
            id, project_id, number, description, amount_cents,
            currency, status, issued_at, due_date, payment_url, created_at
          )
          values (
            ${invoice.id},
            ${invoice.projectId},
            ${invoice.number},
            ${invoice.description},
            ${invoice.amountCents},
            ${invoice.currency},
            ${invoice.status},
            ${invoice.issuedAt},
            ${invoice.dueDate ?? null},
            ${invoice.paymentUrl ?? null},
            ${invoice.createdAt}
          )
          on conflict (id) do update set
            number = excluded.number,
            description = excluded.description,
            amount_cents = excluded.amount_cents,
            currency = excluded.currency,
            status = excluded.status,
            issued_at = excluded.issued_at,
            due_date = excluded.due_date,
            payment_url = excluded.payment_url
        `;
      }

      for (const insight of demo.insights) {
        await tx`
          insert into portal_ai_insights (id, project_id, title, body, kind, created_at)
          values (
            ${insight.id},
            ${insight.projectId},
            ${insight.title},
            ${insight.body},
            ${insight.kind},
            ${insight.createdAt}
          )
          on conflict (id) do update set
            title = excluded.title,
            body = excluded.body,
            kind = excluded.kind
        `;
      }
    }

    return {
      projects: demos.map((demo) => demo.project.id),
      customers: demos.map((demo) => demo.customer.email),
      files: 0,
    };
  });

  return NextResponse.json({
    ok: true,
    ...result,
    demoPassword,
  });
}
