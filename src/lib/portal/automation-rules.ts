import {
  isCustomerIntake,
  isReminder,
  isStructuredUpdate,
} from "./automation";
import {
  buildCustomerUpdateDraft,
  buildProjectDiagnosis,
  formatDiagnosisReport,
} from "./operations";
import { getProjectBundle, id } from "./store";
import { matchConsultingTemplate } from "./templates";
import type { PortalStore, ProjectBundle } from "./types";

export type AutomationOpportunity = {
  id: string;
  projectId: string;
  title: string;
  body: string;
  tone: "red" | "amber" | "green" | "copper";
  category:
    | "intake"
    | "customer_update"
    | "task"
    | "invoice"
    | "proposal"
    | "meeting";
};

export type AutomationRunSummary = {
  projectsChecked: number;
  tasksCreated: number;
  insightsCreated: number;
  updatesCreated: number;
  invoicesUpdated: number;
  skipped: number;
  messages: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dateMs(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function isPast(date?: string) {
  if (!date) return false;
  const due = new Date(`${date}T23:59:59`);
  return Number.isFinite(due.getTime()) && due.getTime() < Date.now();
}

function daysSince(value?: string) {
  const time = dateMs(value);
  if (!time) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - time) / DAY_MS);
}

function marker(rule: string, entityId: string) {
  return `AUTOMATION_RULE:${rule}:${entityId}`;
}

function hasMarker(bundle: ProjectBundle, rule: string, entityId: string) {
  const value = marker(rule, entityId);
  return bundle.updates.some((update) => update.body.includes(value));
}

function addMarkerUpdate({
  store,
  bundle,
  userId,
  rule,
  entityId,
  title,
  body,
}: {
  store: PortalStore;
  bundle: ProjectBundle;
  userId: string;
  rule: string;
  entityId: string;
  title: string;
  body: string;
}) {
  store.updates.push({
    id: id("update"),
    projectId: bundle.project.id,
    title: `Audit: ${title}`,
    body: `${marker(rule, entityId)}\n${body}`,
    visibility: "internal",
    asdarStage: bundle.project.asdarStage,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  });
}

function hasTask(bundle: ProjectBundle, title: string) {
  return bundle.tasks.some(
    (task) => task.title.toLowerCase() === title.toLowerCase(),
  );
}

function latestCustomerUpdateDate(bundle: ProjectBundle) {
  return bundle.updates
    .filter(
      (update) =>
        update.visibility === "customer" && !isStructuredUpdate(update.title),
    )
    .sort((a, b) => dateMs(b.createdAt) - dateMs(a.createdAt))[0]?.createdAt;
}

function hasAppointment(bundle: ProjectBundle) {
  return bundle.updates.some((update) => update.title.startsWith("Termin:"));
}

function hasIntake(bundle: ProjectBundle) {
  return bundle.updates.some((update) => isCustomerIntake(update.title));
}

export function buildAutomationOpportunities(
  bundles: ProjectBundle[],
): AutomationOpportunity[] {
  const items: AutomationOpportunity[] = [];

  for (const bundle of bundles) {
    if (bundle.project.status === "completed") continue;
    const diagnosis = buildProjectDiagnosis(bundle);
    const template = matchConsultingTemplate(bundle.organization.industry);
    const intakeExists = hasIntake(bundle);
    const updateAge = daysSince(latestCustomerUpdateDate(bundle));

    if (intakeExists && !hasMarker(bundle, "intake-review", bundle.project.id)) {
      items.push({
        id: `${bundle.project.id}:intake-review`,
        projectId: bundle.project.id,
        title: `${bundle.organization.name}: Intake automatisch auswerten`,
        body: "Diagnosis Pack, interne Aufgabe und Beratungshinweis vorbereiten.",
        tone: "green",
        category: "intake",
      });
    }

    if (updateAge > 7 && !hasMarker(bundle, "stale-update", bundle.project.id)) {
      items.push({
        id: `${bundle.project.id}:stale-update`,
        projectId: bundle.project.id,
        title: `${bundle.organization.name}: Kundenupdate vorbereiten`,
        body: `Seit ${Number.isFinite(updateAge) ? updateAge : "mehreren"} Tagen kein normales Kundenupdate.`,
        tone: "amber",
        category: "customer_update",
      });
    }

    for (const task of bundle.tasks) {
      if (
        task.owner === "customer" &&
        task.visibleToCustomer &&
        task.status !== "done" &&
        isPast(task.dueDate) &&
        !hasMarker(bundle, "customer-task-followup", task.id)
      ) {
        items.push({
          id: `${task.id}:customer-task-followup`,
          projectId: bundle.project.id,
          title: `${bundle.organization.name}: Kundenaufgabe nachfassen`,
          body: task.title,
          tone: "red",
          category: "task",
        });
      }
    }

    for (const invoice of bundle.invoices) {
      if (
        invoice.status !== "paid" &&
        invoice.status !== "draft" &&
        isPast(invoice.dueDate) &&
        !hasMarker(bundle, "invoice-followup", invoice.id)
      ) {
        items.push({
          id: `${invoice.id}:invoice-followup`,
          projectId: bundle.project.id,
          title: `${bundle.organization.name}: Rechnung nachfassen`,
          body: `${invoice.number} ist faellig oder ueberfaellig.`,
          tone: "red",
          category: "invoice",
        });
      }
    }

    if (
      diagnosis.readinessScore >= 65 &&
      !bundle.files.some((file) => file.category === "proposal") &&
      !hasMarker(bundle, "proposal-ready", bundle.project.id)
    ) {
      items.push({
        id: `${bundle.project.id}:proposal-ready`,
        projectId: bundle.project.id,
        title: `${bundle.organization.name}: Proposal vorbereiten`,
        body: `Readiness ${diagnosis.readinessScore}/100. Scope kann aus Chancen und ${template.label} vorbereitet werden.`,
        tone: "copper",
        category: "proposal",
      });
    }

    if (
      intakeExists &&
      !hasAppointment(bundle) &&
      !hasMarker(bundle, "meeting-needed", bundle.project.id)
    ) {
      items.push({
        id: `${bundle.project.id}:meeting-needed`,
        projectId: bundle.project.id,
        title: `${bundle.organization.name}: naechsten Termin planen`,
        body: "Intake liegt vor. Ein Review-Termin macht Entscheidung, Pilot und Datenbedarf klar.",
        tone: "copper",
        category: "meeting",
      });
    }
  }

  const tonePriority = { red: 4, amber: 3, copper: 2, green: 1 };
  return items.sort((a, b) => tonePriority[b.tone] - tonePriority[a.tone]);
}

export function applyPortalAutomationRules({
  store,
  userId,
  projectId,
}: {
  store: PortalStore;
  userId: string;
  projectId?: string;
}): AutomationRunSummary {
  const projectIds = projectId
    ? [projectId]
    : store.projects
        .filter((project) => project.status !== "completed")
        .map((project) => project.id);

  const summary: AutomationRunSummary = {
    projectsChecked: 0,
    tasksCreated: 0,
    insightsCreated: 0,
    updatesCreated: 0,
    invoicesUpdated: 0,
    skipped: 0,
    messages: [],
  };

  for (const currentProjectId of projectIds) {
    const bundle = getProjectBundle(store, currentProjectId);
    if (!bundle || bundle.project.status === "completed") {
      summary.skipped += 1;
      continue;
    }

    summary.projectsChecked += 1;
    const now = new Date().toISOString();
    const diagnosis = buildProjectDiagnosis(bundle);
    const updateDraft = buildCustomerUpdateDraft(bundle);
    const intakeExists = hasIntake(bundle);
    const updateAge = daysSince(latestCustomerUpdateDate(bundle));

    if (intakeExists && !hasMarker(bundle, "intake-review", bundle.project.id)) {
      store.aiInsights.push({
        id: id("insight"),
        projectId: bundle.project.id,
        title: `Automation: Intake ausgewertet ${now.slice(0, 10)}`,
        body: formatDiagnosisReport(bundle, diagnosis),
        kind: diagnosis.readinessScore >= 70 ? "guidance" : "risk",
        createdAt: now,
      });
      summary.insightsCreated += 1;

      const taskTitle = "Kundenintake auswerten und naechsten Beratungsschritt festlegen";
      if (!hasTask(bundle, taskTitle)) {
        store.tasks.push({
          id: id("task"),
          projectId: bundle.project.id,
          title: taskTitle,
          owner: "assad",
          status: "todo",
          visibleToCustomer: false,
          createdAt: now,
        });
        summary.tasksCreated += 1;
      }

      addMarkerUpdate({
        store,
        bundle,
        userId,
        rule: "intake-review",
        entityId: bundle.project.id,
        title: "Automation Intake Review",
        body: "Intake wurde in ein Diagnosis Pack und eine interne Aufgabe uebersetzt.",
      });
      summary.updatesCreated += 1;
      summary.messages.push(`${bundle.organization.name}: Intake ausgewertet`);
    }

    if (updateAge > 7 && !hasMarker(bundle, "stale-update", bundle.project.id)) {
      store.aiInsights.push({
        id: id("insight"),
        projectId: bundle.project.id,
        title: `Automation Draft: Kundenupdate ${now.slice(0, 10)}`,
        body: [updateDraft.title, "", updateDraft.body].join("\n"),
        kind: "next_step",
        createdAt: now,
      });
      summary.insightsCreated += 1;

      addMarkerUpdate({
        store,
        bundle,
        userId,
        rule: "stale-update",
        entityId: bundle.project.id,
        title: "Automation Kundenupdate vorbereitet",
        body: "Ein kundenfreundlicher Update-Entwurf wurde im Projekt gespeichert.",
      });
      summary.updatesCreated += 1;
      summary.messages.push(`${bundle.organization.name}: Update-Entwurf vorbereitet`);
    }

    for (const task of bundle.tasks) {
      if (
        task.owner !== "customer" ||
        !task.visibleToCustomer ||
        task.status === "done" ||
        !isPast(task.dueDate) ||
        hasMarker(bundle, "customer-task-followup", task.id)
      ) {
        continue;
      }

      const followUpTitle = `Kunden nachfassen: ${task.title}`;
      if (!hasTask(bundle, followUpTitle)) {
        store.tasks.push({
          id: id("task"),
          projectId: bundle.project.id,
          title: followUpTitle,
          owner: "assad",
          status: "todo",
          visibleToCustomer: false,
          createdAt: now,
        });
        summary.tasksCreated += 1;
      }

      addMarkerUpdate({
        store,
        bundle,
        userId,
        rule: "customer-task-followup",
        entityId: task.id,
        title: "Automation Kundenaufgabe nachfassen",
        body: `${task.title} ist offen oder ueberfaellig.`,
      });
      summary.updatesCreated += 1;
      summary.messages.push(`${bundle.organization.name}: Kundenaufgabe nachfassen`);
    }

    for (const invoice of bundle.invoices) {
      if (
        invoice.status === "paid" ||
        invoice.status === "draft" ||
        !isPast(invoice.dueDate) ||
        hasMarker(bundle, "invoice-followup", invoice.id)
      ) {
        continue;
      }

      if (invoice.status !== "overdue") {
        invoice.status = "overdue";
        summary.invoicesUpdated += 1;
      }

      const taskTitle = `Rechnung nachfassen: ${invoice.number}`;
      if (!hasTask(bundle, taskTitle)) {
        store.tasks.push({
          id: id("task"),
          projectId: bundle.project.id,
          title: taskTitle,
          owner: "assad",
          status: "todo",
          visibleToCustomer: false,
          createdAt: now,
        });
        summary.tasksCreated += 1;
      }

      addMarkerUpdate({
        store,
        bundle,
        userId,
        rule: "invoice-followup",
        entityId: invoice.id,
        title: "Automation Rechnung nachfassen",
        body: `${invoice.number} wurde als nachzufassen markiert.`,
      });
      summary.updatesCreated += 1;
      summary.messages.push(`${bundle.organization.name}: Rechnung nachfassen`);
    }

    if (
      diagnosis.readinessScore >= 65 &&
      !bundle.files.some((file) => file.category === "proposal") &&
      !hasMarker(bundle, "proposal-ready", bundle.project.id)
    ) {
      const taskTitle = "Proposal Scope vorbereiten und Angebot generieren";
      if (!hasTask(bundle, taskTitle)) {
        store.tasks.push({
          id: id("task"),
          projectId: bundle.project.id,
          title: taskTitle,
          owner: "assad",
          status: "todo",
          visibleToCustomer: false,
          createdAt: now,
        });
        summary.tasksCreated += 1;
      }

      addMarkerUpdate({
        store,
        bundle,
        userId,
        rule: "proposal-ready",
        entityId: bundle.project.id,
        title: "Automation Proposal bereit",
        body: `Readiness ${diagnosis.readinessScore}/100. Proposal kann vorbereitet werden.`,
      });
      summary.updatesCreated += 1;
      summary.messages.push(`${bundle.organization.name}: Proposal-Aufgabe erzeugt`);
    }

    if (
      intakeExists &&
      !hasAppointment(bundle) &&
      !hasMarker(bundle, "meeting-needed", bundle.project.id)
    ) {
      const taskTitle = "Naechsten Beratungstermin mit Kunde vereinbaren";
      if (!hasTask(bundle, taskTitle)) {
        store.tasks.push({
          id: id("task"),
          projectId: bundle.project.id,
          title: taskTitle,
          owner: "assad",
          status: "todo",
          visibleToCustomer: false,
          createdAt: now,
        });
        summary.tasksCreated += 1;
      }

      addMarkerUpdate({
        store,
        bundle,
        userId,
        rule: "meeting-needed",
        entityId: bundle.project.id,
        title: "Automation Termin vorgeschlagen",
        body: "Intake liegt vor und es ist noch kein Termin gespeichert.",
      });
      summary.updatesCreated += 1;
      summary.messages.push(`${bundle.organization.name}: Termin-Aufgabe erzeugt`);
    }

    if (bundle.updates.some((update) => isReminder(update.title))) {
      summary.messages.push(`${bundle.organization.name}: Reminder-Historie vorhanden`);
    }
  }

  return summary;
}
