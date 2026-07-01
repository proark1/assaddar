import {
  buildTaskPriorityMatrix,
  formatPriorityMatrixLevel,
  getTaskPriorityQuadrant,
  type PriorityMatrixQuadrantKey,
} from "@/lib/portal/priority-matrix";
import {
  formatDate,
  formatTaskOwner,
  formatTaskStatus,
} from "@/lib/portal/format";
import type { ProjectTask } from "@/lib/portal/types";
import { Badge } from "./chrome";

const cellStyles: Record<PriorityMatrixQuadrantKey, string> = {
  start: "bg-copper/10",
  plan: "bg-surface2",
  later: "bg-bg",
  avoid: "bg-critical/10",
};

const dotStyles: Record<PriorityMatrixQuadrantKey, string> = {
  start: "bg-copper",
  plan: "bg-slate",
  later: "bg-muted",
  avoid: "bg-critical",
};

const badgeTones: Record<
  PriorityMatrixQuadrantKey,
  "neutral" | "copper" | "red"
> = {
  start: "copper",
  plan: "neutral",
  later: "neutral",
  avoid: "red",
};

function MatrixTask({
  task,
  showOwner,
}: {
  task: ProjectTask;
  showOwner: boolean;
}) {
  const quadrant = getTaskPriorityQuadrant(task);

  return (
    <div className="rounded-md border border-hairline bg-surface/85 px-3 py-2">
      <div className="break-words text-sm font-medium leading-snug text-ink">
        {task.title}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {quadrant && <Badge tone={badgeTones[quadrant.key]}>{quadrant.shortLabel}</Badge>}
        <span className="text-[11px] text-muted">
          {formatTaskStatus(task.status)}
        </span>
        {showOwner && (
          <span className="text-[11px] text-muted">
            - {formatTaskOwner(task.owner)}
          </span>
        )}
        {task.dueDate && (
          <span className="text-[11px] text-muted">
            - {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProcessPriorityMatrix({
  tasks,
  showOwner = true,
  showUnrated = false,
}: {
  tasks: ProjectTask[];
  showOwner?: boolean;
  showUnrated?: boolean;
}) {
  const matrix = buildTaskPriorityMatrix(tasks);

  if (matrix.rated.length === 0 && (!showUnrated || matrix.unrated.length === 0)) {
    return (
      <div className="rounded-lg border border-dashed border-strong bg-bg p-5 text-sm text-muted">
        Noch keine Prozesse priorisiert.
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <div className="grid grid-cols-[22px_minmax(0,1fr)] gap-2">
          <div className="flex items-center justify-center">
            <span className="-rotate-90 whitespace-nowrap font-mono text-[10px] uppercase text-muted">
              Nutzen
            </span>
          </div>
          <div className="min-w-0">
            <div className="grid overflow-hidden rounded-lg border border-hairline md:grid-cols-2">
              {matrix.cells.map((cell) => (
                <div
                  key={cell.key}
                  className={`min-h-44 border-b border-hairline p-3 md:border-r [&:nth-child(2n)]:md:border-r-0 [&:nth-last-child(-n+2)]:md:border-b-0 ${cellStyles[cell.key]}`}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-mono text-[10.5px] uppercase text-copper">
                        {cell.label}
                      </div>
                      <div className="mt-1 text-[12px] text-muted">
                        {cell.description}
                      </div>
                    </div>
                    <Badge tone={badgeTones[cell.key]}>{cell.tasks.length}</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {cell.tasks.length ? (
                      cell.tasks.map((task) => (
                        <MatrixTask
                          key={task.id}
                          task={task}
                          showOwner={showOwner}
                        />
                      ))
                    ) : (
                      <p className="rounded-md border border-dashed border-strong px-3 py-2 text-[12px] text-muted">
                        Noch leer
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-center font-mono text-[10px] uppercase text-muted">
              Aufwand -&gt;
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <div className="font-medium text-ink">Prioritätslogik</div>
          <div className="mt-3 space-y-3">
            {matrix.cells.map((cell) => (
              <div key={`legend-${cell.key}`} className="flex gap-3">
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${dotStyles[cell.key]}`}
                />
                <div>
                  <div className="font-medium text-ink">{cell.label}</div>
                  <div className="text-[12px] leading-relaxed text-muted">
                    {cell.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-copper/25 bg-copper/10 p-3 text-[12px] font-medium text-copper">
            Faustregel: oben links zuerst.
          </div>
        </div>

        {showUnrated && matrix.unrated.length > 0 && (
          <details className="rounded-lg border border-hairline bg-bg p-3">
            <summary className="cursor-pointer text-[12px] font-medium text-copper">
              Ohne Matrixwertung ({matrix.unrated.length})
            </summary>
            <div className="mt-3 space-y-2">
              {matrix.unrated.map((task) => (
                <div
                  key={`unrated-${task.id}`}
                  className="rounded-md border border-hairline bg-surface px-3 py-2"
                >
                  <div className="text-sm font-medium text-ink">
                    {task.title}
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {formatPriorityMatrixLevel("benefit", task.benefit)} -{" "}
                    {formatPriorityMatrixLevel("effort", task.effort)}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
