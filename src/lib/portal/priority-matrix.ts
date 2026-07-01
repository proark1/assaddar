import type { ProjectTask } from "./types";

export type PriorityMatrixQuadrantKey =
  | "start"
  | "plan"
  | "later"
  | "avoid";

export type PriorityMatrixQuadrant = {
  key: PriorityMatrixQuadrantKey;
  label: string;
  shortLabel: string;
  description: string;
  benefit: "low" | "high";
  effort: "low" | "high";
  order: number;
};

export const priorityMatrixQuadrants: PriorityMatrixQuadrant[] = [
  {
    key: "start",
    label: "Jetzt starten",
    shortLabel: "Starten",
    description: "Viel Nutzen, wenig Aufwand",
    benefit: "high",
    effort: "low",
    order: 0,
  },
  {
    key: "plan",
    label: "Einplanen",
    shortLabel: "Planen",
    description: "Viel Nutzen, hoher Aufwand",
    benefit: "high",
    effort: "high",
    order: 1,
  },
  {
    key: "later",
    label: "Nebenbei",
    shortLabel: "Nebenbei",
    description: "Wenig Nutzen, wenig Aufwand",
    benefit: "low",
    effort: "low",
    order: 2,
  },
  {
    key: "avoid",
    label: "Vermeiden",
    shortLabel: "Vermeiden",
    description: "Wenig Nutzen, hoher Aufwand",
    benefit: "low",
    effort: "high",
    order: 3,
  },
];

const quadrantByKey = new Map(
  priorityMatrixQuadrants.map((quadrant) => [quadrant.key, quadrant]),
);

export function getTaskPriorityQuadrant(task: ProjectTask) {
  if (!task.benefit || !task.effort) return null;
  if (task.benefit === "high" && task.effort === "low") {
    return quadrantByKey.get("start") ?? null;
  }
  if (task.benefit === "high" && task.effort === "high") {
    return quadrantByKey.get("plan") ?? null;
  }
  if (task.benefit === "low" && task.effort === "low") {
    return quadrantByKey.get("later") ?? null;
  }
  return quadrantByKey.get("avoid") ?? null;
}

export function hasTaskPriorityMatrixItems(tasks: ProjectTask[]) {
  return tasks.some((task) => Boolean(getTaskPriorityQuadrant(task)));
}

export function formatPriorityMatrixLevel(
  axis: "benefit" | "effort",
  value?: "low" | "high",
) {
  if (!value) return "Nicht bewertet";
  if (axis === "benefit") {
    return value === "high" ? "Hoher Nutzen" : "Wenig Nutzen";
  }
  return value === "high" ? "Hoher Aufwand" : "Wenig Aufwand";
}

function statusOrder(status: ProjectTask["status"]) {
  if (status === "doing") return 0;
  if (status === "todo") return 1;
  return 2;
}

export function sortPriorityMatrixTasks(tasks: ProjectTask[]) {
  return [...tasks].sort((a, b) => {
    const aQuadrant = getTaskPriorityQuadrant(a);
    const bQuadrant = getTaskPriorityQuadrant(b);
    const quadrantDelta = (aQuadrant?.order ?? 99) - (bQuadrant?.order ?? 99);
    if (quadrantDelta !== 0) return quadrantDelta;

    const statusDelta = statusOrder(a.status) - statusOrder(b.status);
    if (statusDelta !== 0) return statusDelta;

    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;

    return a.title.localeCompare(b.title, "de");
  });
}

export function buildTaskPriorityMatrix(tasks: ProjectTask[]) {
  const rated = sortPriorityMatrixTasks(
    tasks.filter((task) => Boolean(getTaskPriorityQuadrant(task))),
  );
  const unrated = sortPriorityMatrixTasks(
    tasks.filter((task) => !getTaskPriorityQuadrant(task)),
  );

  return {
    rated,
    unrated,
    cells: priorityMatrixQuadrants.map((quadrant) => ({
      ...quadrant,
      tasks: rated.filter(
        (task) => getTaskPriorityQuadrant(task)?.key === quadrant.key,
      ),
    })),
  };
}
