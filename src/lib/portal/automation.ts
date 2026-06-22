import { matchConsultingTemplate } from "./templates";
import type { ProjectBundle } from "./types";

export type IntakeQuestion = {
  id: string;
  label: string;
  prompt: string;
  placeholder?: string;
};

export type AttentionItem = {
  id: string;
  projectId: string;
  tone: "red" | "amber" | "green";
  title: string;
  body: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function isStructuredUpdate(title: string) {
  return (
    title.startsWith("Audit:") ||
    title.startsWith("Kommentar:") ||
    title.startsWith("Intake:") ||
    title.startsWith("Freigabe:") ||
    title.startsWith("Erinnerung:") ||
    title.startsWith("Termin:")
  );
}

export function isCustomerComment(title: string) {
  return title.startsWith("Kommentar:");
}

export function isCustomerIntake(title: string) {
  return title.startsWith("Intake:");
}

export function isApproval(title: string) {
  return title.startsWith("Freigabe:");
}

export function isReminder(title: string) {
  return title.startsWith("Erinnerung:");
}

export function buildIntakeQuestions(bundle: ProjectBundle): IntakeQuestion[] {
  const template = matchConsultingTemplate(bundle.organization.industry);

  return [
    {
      id: "companyContext",
      label: "Unternehmenskontext",
      prompt:
        "Was macht Ihr Unternehmen, wie arbeitet Ihr Team, und welche Bereiche sind für das Projekt wichtig?",
      placeholder: "Geschäftsmodell, Teamgröße, Standorte, wichtige Abläufe...",
    },
    {
      id: "issues",
      label: "Probleme und Engpässe",
      prompt:
        "Wo verlieren Sie aktuell Zeit, Qualität, Transparenz oder Umsatz?",
      placeholder: "Manuelle Arbeit, doppelte Eingaben, Wartezeiten, Fehler...",
    },
    {
      id: "goals",
      label: "Ziele",
      prompt:
        "Was soll nach der Beratung messbar besser sein?",
      placeholder: "Zeit sparen, schneller reagieren, bessere Daten, mehr Automatisierung...",
    },
    {
      id: "currentTools",
      label: "Aktuelle Tools",
      prompt:
        "Welche Tools, Tabellen, Systeme und Dokumentenablagen nutzen Sie heute?",
      placeholder: "Microsoft 365, CRM, ERP, DATEV, Excel, Fachsoftware...",
    },
    {
      id: "dataSituation",
      label: "Daten und Dokumente",
      prompt:
        "Welche Daten, Dokumente oder Beispiele koennen fuer die Analyse genutzt werden?",
      placeholder: "Angebote, Tickets, Reports, Prozessdokumente, Exporte...",
    },
    {
      id: "constraints",
      label: "Rahmenbedingungen",
      prompt:
        "Welche Einschränkungen muss Assad beachten?",
      placeholder: "Datenschutz, Budget, IT-Kapazität, Timeline, interne Freigaben...",
    },
    ...template.discoveryQuestions.map((question, index) => ({
      id: `template_${index}`,
      label: `Branchenfrage ${index + 1}`,
      prompt: question,
      placeholder: "Ihre Antwort...",
    })),
  ];
}

function isPast(date?: string) {
  if (!date) return false;
  const due = new Date(`${date}T23:59:59`);
  return Number.isFinite(due.getTime()) && due.getTime() < Date.now();
}

function daysSince(value?: string) {
  if (!value) return Number.POSITIVE_INFINITY;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - time) / DAY_MS);
}

export function buildAttentionItems(bundle: ProjectBundle): AttentionItem[] {
  const items: AttentionItem[] = [];
  const hasIntake = bundle.updates.some((update) => isCustomerIntake(update.title));
  const customerUpdates = bundle.updates.filter(
    (update) => update.visibility === "customer" && !isStructuredUpdate(update.title),
  );
  const latestCustomerUpdate = customerUpdates[0]?.createdAt;

  if (!hasIntake) {
    items.push({
      id: `${bundle.project.id}:intake`,
      projectId: bundle.project.id,
      tone: "amber",
      title: "Kunden-Intake fehlt",
      body: `${bundle.organization.name} hat den gefuehrten Fragebogen noch nicht eingereicht.`,
    });
  }

  if (bundle.project.health === "red" || bundle.project.health === "amber") {
    items.push({
      id: `${bundle.project.id}:health`,
      projectId: bundle.project.id,
      tone: bundle.project.health === "red" ? "red" : "amber",
      title: `Projekt Health ${bundle.project.health}`,
      body: bundle.project.nextStep || "Naechsten Schritt aktiv klaeren.",
    });
  }

  for (const task of bundle.tasks) {
    if (
      task.owner === "customer" &&
      task.visibleToCustomer &&
      task.status !== "done" &&
      isPast(task.dueDate)
    ) {
      items.push({
        id: `${task.id}:task-overdue`,
        projectId: bundle.project.id,
        tone: "red",
        title: "Kundenaufgabe ueberfaellig",
        body: task.title,
      });
    }
  }

  for (const invoice of bundle.invoices) {
    if (invoice.status !== "paid" && invoice.status !== "draft" && isPast(invoice.dueDate)) {
      items.push({
        id: `${invoice.id}:invoice-overdue`,
        projectId: bundle.project.id,
        tone: "red",
        title: "Rechnung ueberfaellig",
        body: `${invoice.number} ist faellig.`,
      });
    }
  }

  if (daysSince(latestCustomerUpdate) > 7 && bundle.project.status !== "completed") {
    items.push({
      id: `${bundle.project.id}:stale-update`,
      projectId: bundle.project.id,
      tone: "amber",
      title: "Kundenupdate faellig",
      body: "Seit mehr als 7 Tagen wurde kein normales Kundenupdate veroeffentlicht.",
    });
  }

  return items;
}

export function buildConsultantBrief(bundle: ProjectBundle) {
  const template = matchConsultingTemplate(bundle.organization.industry);
  const openCustomerTasks = bundle.tasks.filter(
    (task) => task.owner === "customer" && task.visibleToCustomer && task.status !== "done",
  );
  const openAssadTasks = bundle.tasks.filter(
    (task) => task.owner === "assad" && task.status !== "done",
  );

  return [
    `Consultant Brief: ${bundle.project.name}`,
    "",
    `Kunde: ${bundle.organization.name}`,
    `Branche: ${bundle.organization.industry}`,
    `ASDAR Phase: ${bundle.project.asdarStage}`,
    `Projektstatus: ${bundle.project.status} / Health ${bundle.project.health}`,
    "",
    "Ausgangslage",
    bundle.project.summary || bundle.intelligence.companyContext || "Noch zu konkretisieren.",
    "",
    "Wichtigste Probleme",
    bundle.intelligence.issues || "Noch keine klaren Probleme erfasst.",
    "",
    "Ziele",
    bundle.intelligence.goals || "Ziele mit Kunde quantifizieren.",
    "",
    "Empfohlener Beratungsfokus",
    `- ${template.kickoffGoal}`,
    ...template.meetingMoves.slice(0, 3).map((item) => `- ${item}`),
    "",
    "Quick Wins",
    ...template.quickWins.map((item) => `- ${item}`),
    "",
    "Automatisierungsideen",
    ...template.automationIdeas.map((item) => `- ${item}`),
    "",
    "Risiken",
    ...template.risks.map((item) => `- ${item}`),
    "",
    "Naechste Call-Fragen",
    ...template.discoveryQuestions.map((item) => `- ${item}`),
    "",
    "Offene Kundenaufgaben",
    ...(openCustomerTasks.length
      ? openCustomerTasks.map((task) => `- ${task.title}`)
      : ["- Keine offenen Kundenaufgaben."]),
    "",
    "Offene Assad-Aufgaben",
    ...(openAssadTasks.length
      ? openAssadTasks.map((task) => `- ${task.title}`)
      : ["- Keine offenen internen Aufgaben."]),
  ].join("\n");
}

export function buildCustomerSafeSummary(bundle: ProjectBundle) {
  const template = matchConsultingTemplate(bundle.organization.industry);

  return [
    "Aktueller Projektbrief",
    "",
    bundle.project.summary || "Das Projekt wird anhand der eingereichten Informationen weiter konkretisiert.",
    "",
    `Aktuelle ASDAR Phase: ${bundle.project.asdarStage}`,
    `Naechster Schritt: ${bundle.project.nextStep || template.kickoffGoal}`,
    "",
    "Fokus fuer die naechsten Schritte:",
    ...template.quickWins.slice(0, 3).map((item) => `- ${item}`),
  ].join("\n");
}
