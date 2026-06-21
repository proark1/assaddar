import type { AsdarStage, ProjectStatus } from "./types";

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
