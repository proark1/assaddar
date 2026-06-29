import type {
  AsdarStage,
  Invoice,
  ProjectMilestone,
  ProjectStatus,
  ProjectTask,
} from "./types";

export const asdarStages: { value: AsdarStage; label: string; letter: string }[] =
  [
    { value: "analyse", label: "Analysieren", letter: "A" },
    { value: "structure", label: "Strukturieren", letter: "S" },
    { value: "digitize", label: "Digitalisieren", letter: "D" },
    { value: "automate", label: "Automatisieren", letter: "A" },
    { value: "realize", label: "Realisieren", letter: "R" },
  ];

export const projectStatuses: { value: ProjectStatus; label: string }[] = [
  { value: "discovery", label: "Aufnahme" },
  { value: "analysis", label: "Analyse" },
  { value: "implementation", label: "Umsetzung" },
  { value: "paused", label: "Pausiert" },
  { value: "completed", label: "Abgeschlossen" },
];

export function formatStage(stage: AsdarStage) {
  return asdarStages.find((entry) => entry.value === stage)?.label ?? stage;
}

export function formatStatus(status: ProjectStatus) {
  return projectStatuses.find((entry) => entry.value === status)?.label ?? status;
}

export function formatTaskStatus(status: ProjectTask["status"]) {
  const labels: Record<ProjectTask["status"], string> = {
    todo: "Offen",
    doing: "In Arbeit",
    done: "Erledigt",
  };
  return labels[status] ?? status;
}

export function formatTaskOwner(owner: ProjectTask["owner"]) {
  return owner === "assad" ? "Assad" : "Kunde";
}

export function formatMilestoneStatus(status: ProjectMilestone["status"]) {
  const labels: Record<ProjectMilestone["status"], string> = {
    planned: "Geplant",
    active: "Aktiv",
    done: "Erledigt",
  };
  return labels[status] ?? status;
}

export function formatInvoiceStatus(status: Invoice["status"]) {
  const labels: Record<Invoice["status"], string> = {
    draft: "Entwurf",
    sent: "Offen",
    paid: "Bezahlt",
    overdue: "Überfällig",
  };
  return labels[status] ?? status;
}

export function formatDecisionStatus(status: string) {
  const labels: Record<string, string> = {
    proposed: "Zur Entscheidung",
    approved: "Freigegeben",
    rejected: "Abgelehnt",
    needs_changes: "Rückfrage",
  };
  return labels[status] ?? status;
}

export function formatRequestStatus(status: string) {
  const labels: Record<string, string> = {
    open: "Offen",
    new: "Neu",
    scoping: "In Klärung",
    quoted: "Angeboten",
    accepted: "Angenommen",
    in_progress: "In Arbeit",
    done: "Erledigt",
    rejected: "Abgelehnt",
  };
  return labels[status] ?? status;
}

export function formatCurrency(amountCents: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

export function formatDate(value?: string) {
  if (!value) return "Noch offen";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
