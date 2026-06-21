import { NextResponse } from "next/server";
import { getSql } from "@/lib/portal/database";

export const dynamic = "force-dynamic";

const entries = [
  {
    id: "update_demo_gp_intake",
    projectId: "project_demo_allgemeinarzt_de",
    customerEmail: "demo.allgemeinarzt@assad-dar.de",
    title: "Intake: Kundenfragebogen eingereicht",
    createdAt: "2026-06-16T14:00:00.000Z",
    body: [
      "Eingereicht von Dr. Anna Weber (demo.allgemeinarzt@assad-dar.de) am 2026-06-16",
      "",
      "Unternehmenskontext:",
      "Hausarztpraxis in NRW mit zwei Aerzten, fuenf MFA und ca. 1.800 Patienten pro Quartal. Wir arbeiten mit Empfang, Sprechzimmern, Labor und Rueckruflisten; besonders wichtig sind Terminsteuerung, Rezeptwuensche, Befunde und Patientenkommunikation.",
      "",
      "Probleme und Engpaesse:",
      "Telefon ist dauerhaft ueberlastet, Rezept- und Ueberweisungswuensche kommen unstrukturiert, Rueckrufe werden manuell verfolgt, Befundnachfragen binden MFA-Zeit, Informationen liegen in PVS, E-Mail und Papierlisten.",
      "",
      "Ziele:",
      "Telefonaufkommen spuerbar senken, wiederkehrende Patientenanfragen schneller beantworten, Rezept- und Rueckrufprozess klar steuern, Team entlasten und datenschutzkonformen Einstieg in KI schaffen.",
      "",
      "Aktuelle Tools:",
      "Praxisverwaltungssystem, Microsoft 365, Telefonanlage, E-Mail, Website-Formular, Papier-Checklisten, lokale Dateiablage.",
      "",
      "Daten und Dokumente:",
      "Anonymisierte Telefonnotizen, Beispiel-E-Mails, Terminarten, FAQ-Liste, Website-Texte, Formularvorlagen und Telefonstatistiken koennen bereitgestellt werden.",
      "",
      "Rahmenbedingungen:",
      "DSGVO, aerztliche Schweigepflicht, keine Verarbeitung medizinischer Entscheidungen durch KI, wenig Zeitfenster im laufenden Praxisbetrieb, Abstimmung mit IT-Dienstleister erforderlich.",
      "",
      "Welche Anfragen blockieren Telefon oder Empfang am staerksten?:",
      "Rezeptwuensche, Terminverschiebungen, Befundnachfragen, Ueberweisungen und wiederkehrende Fragen zu Sprechzeiten oder Formularen.",
      "",
      "Welche Formulare werden immer wieder manuell erklaert?:",
      "Rezeptbestellung, Ueberweisung, Neupatientenbogen, Datenschutzunterlagen und Arbeitsunfaehigkeitsbescheinigungen.",
      "",
      "Welche Dokumentation darf vorbereitet, aber nicht automatisch entschieden werden?:",
      "Administrative Vorlagen fuer Rueckrufe, Terminnotizen, interne Checklisten und FAQ-Antworten. Medizinische Bewertungen bleiben immer beim Arzt.",
      "",
      "Welche Daten duerfen in welchem Tool verarbeitet werden?:",
      "Nicht-medizinische, anonymisierte Beispiele duerfen fuer Analyse genutzt werden; Patientendaten nur im freigegebenen PVS und nach Datenschutzfreigabe.",
    ].join("\n"),
  },
  {
    id: "update_demo_auto_intake",
    projectId: "project_demo_autohaendler_de",
    customerEmail: "demo.autohaus@assad-dar.de",
    title: "Intake: Kundenfragebogen eingereicht",
    createdAt: "2026-06-14T14:00:00.000Z",
    body: [
      "Eingereicht von Max Koenig (demo.autohaus@assad-dar.de) am 2026-06-14",
      "",
      "Unternehmenskontext:",
      "Mittelstaendisches Autohaus in Hessen mit Neu- und Gebrauchtwagen, Werkstatt und Online-Leads ueber Website, mobile.de, AutoScout24, Telefon und E-Mail. Verkauf, Serviceannahme und Marketing arbeiten mit mehreren Systemen.",
      "",
      "Probleme und Engpaesse:",
      "Leads werden manuell aus Portalen uebertragen, Antwortzeiten schwanken, Probefahrt-Follow-ups gehen unter, Fahrzeugdaten sind nicht immer konsistent und Angebotsentwuerfe kosten zu viel Zeit.",
      "",
      "Ziele:",
      "Lead-Reaktionszeit unter 15 Minuten bringen, Probefahrtquote verbessern, weniger verlorene Leads, schnellere Angebots- und Finanzierungsantworten und bessere Transparenz im Vertrieb.",
      "",
      "Aktuelle Tools:",
      "Dealer Management System, CRM, mobile.de, AutoScout24, Website-Formular, E-Mail, Telefon, Excel-Auswertungen.",
      "",
      "Daten und Dokumente:",
      "Anonymisierte Online-Leads, Fahrzeuglisten, Preislisten, Angebotsvorlagen, Probefahrttermine, Follow-up-E-Mails und Beispiel-Inserate koennen genutzt werden.",
      "",
      "Rahmenbedingungen:",
      "Kein kompletter CRM-Wechsel, DSGVO und Einwilligung fuer Kommunikation beachten, Vertrieb darf im Tagesgeschaeft nicht gebremst werden, DMS-Abhaengigkeiten pruefen.",
      "",
      "Welche Supportfragen kommen jeden Tag wieder?:",
      "Verfuegbarkeit, Probefahrt, Finanzierung, Inzahlungnahme, Lieferzeit, Ausstattung und Servicehistorie.",
      "",
      "Welche Produktdaten fehlen oder sind inkonsistent?:",
      "Ausstattungspakete, Servicehistorie, Bilder, Garantieinformationen, Finanzierungsraten und Inzahlungnahme-Informationen sind nicht immer vollstaendig.",
      "",
      "Welche Retourengruende lassen sich operativ beeinflussen?:",
      "Nach Probefahrt entstehen Absagen wegen Finanzierung, Preis, Ausstattung oder fehlender Inzahlungnahme-Bewertung; diese Gruende sollen strukturiert erfasst werden.",
      "",
      "Wo entstehen Kampagnen- oder Produkttexte manuell?:",
      "Fahrzeugbeschreibungen, Inseratstexte, E-Mail-Follow-ups, Aktionsseiten und Social Posts werden oft manuell erstellt.",
    ].join("\n"),
  },
  {
    id: "update_demo_clean_intake",
    projectId: "project_demo_textilreinigung_de",
    customerEmail: "demo.textilreinigung@assad-dar.de",
    title: "Intake: Kundenfragebogen eingereicht",
    createdAt: "2026-06-18T14:00:00.000Z",
    body: [
      "Eingereicht von Leyla Demir (demo.textilreinigung@assad-dar.de) am 2026-06-18",
      "",
      "Unternehmenskontext:",
      "Lokale Textilreinigung mit Filiale, Abhol- und Bringservice fuer Gewerbekunden sowie Hotel-, Praxis- und Privatkundenauftraegen. Das Team arbeitet in Annahme, Sortierung, Reinigung, Lieferung und Abrechnung.",
      "",
      "Probleme und Engpaesse:",
      "Auftragsstatus ist nicht transparent, Kunden rufen haeufig nach, Abholrouten werden manuell geplant, WhatsApp-Notizen sind unuebersichtlich, Reklamationen sind schlecht dokumentiert.",
      "",
      "Ziele:",
      "Weniger Statusanrufe, klarere Auftragsannahme, bessere Tourenkommunikation, schnellere Reklamationsbearbeitung, einfacher Monatsreport fuer B2B-Kunden.",
      "",
      "Aktuelle Tools:",
      "Kassensystem, Papierbelege, WhatsApp Business, Telefon, Excel fuer Gewerbekunden, E-Mail und manuelle Monatsrechnungen.",
      "",
      "Daten und Dokumente:",
      "Beispielauftraege, Tourenlisten, Reklamationsnotizen, B2B-Rechnungslisten, Preislisten und haeufige Kundenfragen koennen anonymisiert bereitgestellt werden.",
      "",
      "Rahmenbedingungen:",
      "Kleines Team, wenig Schulungszeit, Loesung muss mobil funktionieren, keine komplexe ERP-Einfuehrung, einfache Bedienung in Filiale und unterwegs.",
      "",
      "Welche Anfragearten kommen jede Woche wieder?:",
      "Statusfragen zu Abholung und Lieferung, Preise, Reklamationen, Sonderreinigung, B2B-Monatsabrechnung und Abholtermine.",
      "",
      "Wo kopiert das Team Informationen zwischen Tools?:",
      "Papierbeleg zu WhatsApp- oder Telefonnotiz, dann in Excel-Tourenliste, Kundenliste und spaeter in die Rechnungsliste.",
      "",
      "Welche Kundenupdates kosten Zeit, obwohl sie fast immer gleich sind?:",
      "Abholbestaetigungen, Lieferstatus, Fertigmeldung, Verspaetungen, Reklamationsstatus und Hinweise fuer Gewerbekunden.",
      "",
      "Welche Angebotsbausteine koennten standardisiert werden?:",
      "B2B-Pauschalen, Hotelwaesche, Praxiswaesche, Hemdenservice, Sonderreinigung, Abholservice und Monatsreporting.",
    ].join("\n"),
  },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("confirm") !== "fill-demo-questionnaires") {
    return NextResponse.json({ error: "Missing confirmation" }, { status: 400 });
  }

  const sql = getSql();
  const result = await sql.begin(async (tx) => {
    const updated: string[] = [];

    for (const entry of entries) {
      const userRows = await tx`
        select id from portal_users where lower(email) = lower(${entry.customerEmail}) limit 1
      `;
      const projectRows = await tx`
        select asdar_stage from portal_projects where id = ${entry.projectId} limit 1
      `;
      const customerId = userRows[0]?.id;
      const asdarStage = projectRows[0]?.asdar_stage ?? "analyse";
      if (typeof customerId !== "string") continue;

      await tx`
        insert into portal_project_updates (
          id, project_id, title, body, visibility, asdar_stage, created_by, created_at
        )
        values (
          ${entry.id},
          ${entry.projectId},
          ${entry.title},
          ${entry.body},
          'customer',
          ${asdarStage},
          ${customerId},
          ${entry.createdAt}
        )
        on conflict (id) do update set
          title = excluded.title,
          body = excluded.body,
          visibility = excluded.visibility,
          asdar_stage = excluded.asdar_stage,
          created_by = excluded.created_by
      `;
      updated.push(entry.projectId);
    }

    return updated;
  });

  return NextResponse.json({ ok: true, updatedProjects: result });
}
