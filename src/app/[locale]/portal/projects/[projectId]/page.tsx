import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  MessageCircle,
  Send,
  Upload,
} from "lucide-react";
import {
  addProjectCommentAction,
  approveFileAction,
  approveMilestoneAction,
  customerTaskFileAction,
  customerTaskStatusAction,
  submitCustomerIntakeAction,
} from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireUser } from "@/lib/portal/auth";
import {
  buildIntakeQuestions,
  isApproval,
  isCustomerComment,
  isCustomerIntake,
  isReminder,
  isStructuredUpdate,
} from "@/lib/portal/automation";
import { getProjectBundleForUser } from "@/lib/portal/store";
import {
  formatCurrency,
  formatDate,
  formatStage,
  formatStatus,
} from "@/lib/portal/format";
import {
  Badge,
  EmptyState,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  textareaClass,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projekt | Assad Dar Portal",
  robots: { index: false, follow: false },
};

type CustomerView = "overview" | "input" | "actions" | "files" | "messages";

function customerView(value?: string): CustomerView | null {
  return value === "overview" ||
    value === "input" ||
    value === "actions" ||
    value === "files" ||
    value === "messages"
    ? value
    : null;
}

export default async function CustomerProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; projectId: string }>;
  searchParams: Promise<{ saved?: string; error?: string; view?: string }>;
}) {
  const { locale, projectId } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireUser(safe);
  if (user.role === "admin") {
    redirect(`/${safe}/portal/admin/projects/${projectId}`);
  }

  const bundle = await getProjectBundleForUser(user, projectId);
  if (!bundle) redirect(`/${safe}/portal`);

  const query = await searchParams;
  const allCustomerUpdates = bundle.updates.filter(
    (update) => update.visibility === "customer",
  );
  const comments = allCustomerUpdates.filter((update) =>
    isCustomerComment(update.title),
  );
  const approvals = allCustomerUpdates.filter((update) =>
    isApproval(update.title),
  );
  const reminders = allCustomerUpdates.filter((update) =>
    isReminder(update.title),
  );
  const updates = allCustomerUpdates.filter(
    (update) => !isStructuredUpdate(update.title),
  );
  const intakeSubmitted = allCustomerUpdates.some((update) =>
    isCustomerIntake(update.title),
  );
  const intakeQuestions = buildIntakeQuestions(bundle);
  const tasks = bundle.tasks.filter((task) => task.visibleToCustomer);
  const milestones = bundle.milestones.filter(
    (milestone) => milestone.visibleToCustomer,
  );
  const files = bundle.files.filter((file) => file.visibility === "customer");
  const invoices = bundle.invoices.filter(
    (invoice) => invoice.status !== "draft",
  );
  const approvedFileIds = new Set(
    approvals
      .map((update) => update.body.match(/APPROVAL_FILE:([^\n]+)/)?.[1])
      .filter((value): value is string => Boolean(value)),
  );
  const approvedMilestoneIds = new Set(
    approvals
      .map((update) => update.body.match(/APPROVAL_MILESTONE:([^\n]+)/)?.[1])
      .filter((value): value is string => Boolean(value)),
  );
  const timeline = [
    ...updates.map((update) => ({
      id: update.id,
      date: update.createdAt,
      type: "Update",
      title: update.title,
      body: update.body,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      date: task.createdAt,
      type: "Aufgabe",
      title: task.title,
      body: `Owner: ${task.owner === "assad" ? "Assad" : "Kunde"} · ${task.status}`,
    })),
    ...milestones.map((milestone) => ({
      id: milestone.id,
      date: milestone.createdAt,
      type: "Meilenstein",
      title: milestone.title,
      body: `${milestone.status} · ${formatDate(milestone.dueDate)}`,
    })),
    ...files.map((file) => ({
      id: file.id,
      date: file.uploadedAt,
      type: "Datei",
      title: file.name,
      body: file.description || "Neue Datei im Portal",
    })),
    ...invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.createdAt,
      type: "Rechnung",
      title: invoice.number,
      body: `${formatCurrency(invoice.amountCents, invoice.currency)} · ${invoice.status}`,
    })),
    ...comments.map((comment) => ({
      id: comment.id,
      date: comment.createdAt,
      type: "Kommentar",
      title: comment.title.replace(/^Kommentar:\s*/, ""),
      body: comment.body,
    })),
    ...approvals.map((approval) => ({
      id: approval.id,
      date: approval.createdAt,
      type: "Freigabe",
      title: approval.title.replace(/^Freigabe:\s*/, ""),
      body: approval.body.replace(/^APPROVAL_[A-Z]+:[^\n]+\n/, ""),
    })),
    ...reminders.map((reminder) => ({
      id: reminder.id,
      date: reminder.createdAt,
      type: "Reminder",
      title: reminder.title.replace(/^Erinnerung:\s*/, ""),
      body: reminder.body,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pendingCustomerTasks = tasks.filter(
    (task) => task.owner === "customer" && task.status !== "done",
  );
  const pendingMilestoneApprovals = milestones.filter(
    (milestone) => !approvedMilestoneIds.has(milestone.id),
  );
  const pendingFileApprovals = files.filter(
    (file) => !approvedFileIds.has(file.id),
  );
  const defaultView: CustomerView = !intakeSubmitted
    ? "input"
    : pendingCustomerTasks.length ||
        pendingMilestoneApprovals.length ||
        pendingFileApprovals.length
      ? "actions"
      : "overview";
  const activeView = customerView(query.view) ?? defaultView;
  const stepHref = (view: CustomerView) =>
    `/${safe}/portal/projects/${projectId}?view=${view}`;
  const steps: Array<{
    id: CustomerView;
    eyebrow: string;
    title: string;
    body: string;
    count?: number;
  }> = [
    {
      id: "overview",
      eyebrow: "1",
      title: "Überblick",
      body: "Status, Fortschritt und letzte Aktivitaet.",
      count: timeline.length,
    },
    {
      id: "input",
      eyebrow: "2",
      title: "Fragebogen",
      body: intakeSubmitted
        ? "Ergaenzen bei Aenderungen."
        : "Zuerst ausfuellen.",
    },
    {
      id: "actions",
      eyebrow: "3",
      title: "To-dos",
      body: "Aufgaben und Freigaben.",
      count:
        pendingCustomerTasks.length +
        pendingMilestoneApprovals.length +
        pendingFileApprovals.length,
    },
    {
      id: "files",
      eyebrow: "4",
      title: "Dateien",
      body: "Deliverables und Rechnungen.",
      count: files.length + invoices.length,
    },
    {
      id: "messages",
      eyebrow: "5",
      title: "Nachricht",
      body: "Eine Rueckfrage senden.",
      count: comments.length,
    },
  ];

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow={`${bundle.organization.name} · Kundenansicht`}
      title={bundle.project.name}
      backHref={`/${safe}/portal`}
    >
      {(query.saved || query.error) && (
        <div className="mb-6 rounded-lg border border-copper/30 bg-copper/10 px-4 py-3 text-sm text-ink">
          {query.saved && "Gespeichert."}
          {query.error === "intake" &&
            " Bitte mindestens ein Intake-Feld ausfuellen."}
          {query.error === "file" && " Datei konnte nicht hochgeladen werden."}
          {query.error === "comment" && " Bitte einen Kommentar eintragen."}
        </div>
      )}

      <div className="space-y-6">
        <PortalCard>
          <div className="flex flex-wrap gap-2">
            <Badge tone="copper">
              {formatStage(bundle.project.asdarStage)}
            </Badge>
            <Badge
              tone={
                bundle.project.health === "red"
                  ? "red"
                  : bundle.project.health === "amber"
                    ? "amber"
                    : "green"
              }
            >
              {formatStatus(bundle.project.status)}
            </Badge>
          </div>
          <p className="mt-5 text-base leading-relaxed text-ink2">
            {bundle.project.summary || "Die Projektbeschreibung folgt."}
          </p>
          <div className="mt-6 rounded-lg border border-copper/25 bg-copper/10 p-4">
            <div className="text-sm font-medium text-ink">Nächster Schritt</div>
            <p className="mt-2 text-sm leading-relaxed text-ink2">
              {bundle.project.nextStep ||
                "Der nächste Schritt wird vorbereitet."}
            </p>
          </div>
        </PortalCard>

        <nav
          className="grid gap-3 md:grid-cols-5"
          aria-label="Projekt-Schritte"
        >
          {steps.map((step) => {
            const active = step.id === activeView;
            return (
              <Link
                key={step.id}
                href={stepHref(step.id)}
                className={`rounded-lg border p-4 transition-colors ${
                  active
                    ? "border-copper bg-copper/10 text-ink"
                    : "border-hairline bg-surface text-ink2 hover:border-copper hover:text-ink"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                    Schritt {step.eyebrow}
                  </span>
                  {typeof step.count === "number" && step.count > 0 && (
                    <Badge tone={active ? "copper" : "neutral"}>
                      {step.count}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-sm font-medium text-ink">
                  {step.title}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </Link>
            );
          })}
        </nav>

        {activeView === "input" && (
          <PortalCard>
            <PortalSectionTitle
              eyebrow="Ihr Input"
              title="Gefuehrter Projektfragebogen"
            >
              Ihre Antworten landen direkt in Assads interner Analyse und
              erzeugen automatisch eine erste Beratungsgrundlage.
            </PortalSectionTitle>
            {intakeSubmitted && (
              <div className="mt-4 rounded-lg border border-success/25 bg-success/10 p-3 text-sm text-success">
                Fragebogen wurde bereits eingereicht. Sie koennen ihn erneut
                senden, wenn sich wichtige Informationen geaendert haben.
              </div>
            )}
            <details open={!intakeSubmitted} className="mt-5">
              <summary className="cursor-pointer text-sm font-medium text-copper">
                Fragebogen oeffnen
              </summary>
              <form
                action={submitCustomerIntakeAction}
                className="mt-5 space-y-4"
              >
                <input type="hidden" name="locale" value={safe} />
                <input type="hidden" name="projectId" value={projectId} />
                {intakeQuestions.map((question) =>
                  question.id.startsWith("template_") ? (
                    <div key={question.id}>
                      <input
                        type="hidden"
                        name="questionLabel"
                        value={question.prompt}
                      />
                      <label className="mb-1.5 block text-sm text-ink2">
                        {question.prompt}
                      </label>
                      <textarea
                        name="questionAnswer"
                        placeholder={question.placeholder}
                        className={textareaClass}
                      />
                    </div>
                  ) : (
                    <div key={question.id}>
                      <label className="mb-1.5 block text-sm text-ink2">
                        {question.label}
                      </label>
                      <p className="mb-2 text-[12px] leading-relaxed text-muted">
                        {question.prompt}
                      </p>
                      <textarea
                        name={question.id}
                        placeholder={question.placeholder}
                        className={textareaClass}
                      />
                    </div>
                  ),
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                >
                  <Send className="h-4 w-4" />
                  Antworten senden
                </button>
              </form>
            </details>
          </PortalCard>
        )}

        {activeView === "overview" && (
          <div className="space-y-6">
            <PortalCard>
              <PortalSectionTitle
                eyebrow="Timeline"
                title="Was gerade im Projekt passiert"
              >
                Eine chronologische Sicht auf freigegebene Updates, Aufgaben,
                Dateien, Meilensteine und Rechnungen.
              </PortalSectionTitle>
              <div className="mt-5 space-y-4">
                {timeline.length === 0 ? (
                  <EmptyState title="Noch keine Aktivität">
                    Sobald im Projekt etwas für Sie freigegeben wird, erscheint
                    es hier.
                  </EmptyState>
                ) : (
                  timeline.slice(0, 12).map((item) => (
                    <article
                      key={`${item.type}-${item.id}`}
                      className="flex gap-4 rounded-lg border border-hairline bg-bg p-4"
                    >
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-copper" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{item.type}</Badge>
                          <span className="text-[12px] text-muted">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-ink">
                          {item.title}
                        </h3>
                        <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink2">
                          {item.body}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </PortalCard>

            <PortalCard>
              <PortalSectionTitle eyebrow="Updates" title="Projektfortschritt">
                Kurze Statusmeldungen, die Assad für Sie freigegeben hat.
              </PortalSectionTitle>
              <div className="mt-5 space-y-4">
                {updates.length === 0 ? (
                  <EmptyState title="Noch keine Updates">
                    Sobald ein Update veröffentlicht wird, erscheint es hier.
                  </EmptyState>
                ) : (
                  updates.map((update) => (
                    <article
                      key={update.id}
                      className="border-l-2 border-copper pl-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{formatStage(update.asdarStage)}</Badge>
                        <span className="text-[12px] text-muted">
                          {formatDate(update.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-2 font-medium text-ink">
                        {update.title}
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink2">
                        {update.body}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </PortalCard>
          </div>
        )}

        {activeView === "actions" && (
          <div className="grid gap-6 md:grid-cols-2">
            <PortalCard>
              <PortalSectionTitle eyebrow="Meilensteine" title="Roadmap" />
              <div className="mt-5 space-y-3">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="flex items-start gap-3">
                      {milestone.status === "done" ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                      ) : (
                        <Clock3 className="mt-0.5 h-4 w-4 text-copper" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-ink">
                          {milestone.title}
                        </div>
                        <div className="mt-1 text-[12px] text-muted">
                          {formatDate(milestone.dueDate)} · {milestone.status}
                        </div>
                        {approvedMilestoneIds.has(milestone.id) ? (
                          <div className="mt-3">
                            <Badge tone="green">Freigegeben</Badge>
                          </div>
                        ) : (
                          <form
                            action={approveMilestoneAction}
                            className="mt-3"
                          >
                            <input type="hidden" name="locale" value={safe} />
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="milestoneId"
                              value={milestone.id}
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Freigeben
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && (
                  <p className="text-sm text-muted">Noch keine Meilensteine.</p>
                )}
              </div>
            </PortalCard>

            <PortalCard>
              <PortalSectionTitle eyebrow="Aufgaben" title="To-dos" />
              <div className="mt-5 space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="text-sm font-medium text-ink">
                      {task.title}
                    </div>
                    <div className="mt-1 text-[12px] text-muted">
                      Owner: {task.owner === "assad" ? "Assad" : "Kunde"} ·{" "}
                      {task.status} · {formatDate(task.dueDate)}
                    </div>
                    {task.owner === "customer" && task.status !== "done" && (
                      <div className="mt-3 space-y-3">
                        <form action={customerTaskStatusAction}>
                          <input type="hidden" name="locale" value={safe} />
                          <input
                            type="hidden"
                            name="projectId"
                            value={projectId}
                          />
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="status" value="done" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Als erledigt markieren
                          </button>
                        </form>
                        <form
                          action={customerTaskFileAction}
                          encType="multipart/form-data"
                          className="space-y-2 border-t border-hairline pt-3"
                        >
                          <input type="hidden" name="locale" value={safe} />
                          <input
                            type="hidden"
                            name="projectId"
                            value={projectId}
                          />
                          <input type="hidden" name="taskId" value={task.id} />
                          <input
                            name="name"
                            placeholder="Dateiname / Hinweis"
                            className={fieldClass}
                          />
                          <input
                            name="file"
                            type="file"
                            required
                            className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-2 file:text-sm file:font-medium file:text-oncopper"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Datei zur Aufgabe hochladen
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-sm text-muted">Keine offenen Aufgaben.</p>
                )}
              </div>
            </PortalCard>

            <PortalCard className="md:col-span-2">
              <PortalSectionTitle
                eyebrow="Freigaben"
                title="Dateien zur Prüfung"
              />
              <div className="mt-5 space-y-3">
                {pendingFileApprovals.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col gap-3 rounded-lg border border-hairline bg-bg p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <a
                      href={`/api/portal/files/${file.id}`}
                      className="flex items-start gap-3 text-sm text-ink transition-colors hover:text-copper"
                    >
                      <Download className="mt-0.5 h-4 w-4 text-copper" />
                      <span>
                        <span className="block font-medium">{file.name}</span>
                        <span className="mt-1 block text-[12px] text-muted">
                          {file.description || "Datei herunterladen und prüfen"}
                        </span>
                      </span>
                    </a>
                    <form action={approveFileAction}>
                      <input type="hidden" name="locale" value={safe} />
                      <input type="hidden" name="projectId" value={projectId} />
                      <input type="hidden" name="fileId" value={file.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Datei freigeben
                      </button>
                    </form>
                  </div>
                ))}
                {pendingFileApprovals.length === 0 && (
                  <p className="text-sm text-muted">
                    Keine offenen Dateifreigaben.
                  </p>
                )}
              </div>
            </PortalCard>
          </div>
        )}

        {activeView === "messages" && (
          <PortalCard>
            <PortalSectionTitle eyebrow="Nachrichten" title="Kommentare" />
            <form action={addProjectCommentAction} className="mt-5 space-y-3">
              <input type="hidden" name="locale" value={safe} />
              <input type="hidden" name="projectId" value={projectId} />
              <input name="topic" placeholder="Thema" className={fieldClass} />
              <textarea
                name="message"
                required
                placeholder="Ihre Nachricht an Assad"
                className={textareaClass}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <MessageCircle className="h-4 w-4" />
                Kommentar senden
              </button>
            </form>
            <div className="mt-5 space-y-3">
              {comments.map((comment) => {
                const [author, ...messageParts] = comment.body.split("\n\n");
                return (
                  <article
                    key={comment.id}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>
                        {comment.title.replace(/^Kommentar:\s*/, "")}
                      </Badge>
                      <span className="text-[12px] text-muted">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink">
                      {author}
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink2">
                      {messageParts.join("\n\n")}
                    </p>
                  </article>
                );
              })}
              {comments.length === 0 && (
                <p className="text-sm text-muted">Noch keine Kommentare.</p>
              )}
            </div>
          </PortalCard>
        )}

        {activeView === "files" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <PortalCard>
              <PortalSectionTitle eyebrow="Dateien" title="Deliverables" />
              <div className="mt-5 space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="space-y-2">
                    <a
                      href={`/api/portal/files/${file.id}`}
                      className="flex items-start gap-3 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                    >
                      <Download className="mt-0.5 h-4 w-4 text-copper" />
                      <div>
                        <div className="text-sm font-medium text-ink">
                          {file.name}
                        </div>
                        <div className="mt-1 text-[12px] text-muted">
                          {file.description || "Datei herunterladen"}
                        </div>
                      </div>
                    </a>
                    {approvedFileIds.has(file.id) ? (
                      <Badge tone="green">Freigegeben</Badge>
                    ) : (
                      <form action={approveFileAction}>
                        <input type="hidden" name="locale" value={safe} />
                        <input
                          type="hidden"
                          name="projectId"
                          value={projectId}
                        />
                        <input type="hidden" name="fileId" value={file.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Datei freigeben
                        </button>
                      </form>
                    )}
                  </div>
                ))}
                {files.length === 0 && (
                  <p className="text-sm text-muted">Noch keine Dateien.</p>
                )}
              </div>
            </PortalCard>

            {reminders.length > 0 && (
              <PortalCard>
                <PortalSectionTitle
                  eyebrow="Reminder"
                  title="Offene Hinweise"
                />
                <div className="mt-5 space-y-3">
                  {reminders.slice(0, 4).map((reminder) => (
                    <div
                      key={reminder.id}
                      className="rounded-lg border border-copper/25 bg-copper/10 p-3"
                    >
                      <div className="text-sm font-medium text-ink">
                        {reminder.title.replace(/^Erinnerung:\s*/, "")}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-ink2">
                        {reminder.body}
                      </p>
                    </div>
                  ))}
                </div>
              </PortalCard>
            )}

            <PortalCard>
              <PortalSectionTitle eyebrow="Rechnungen" title="Payment" />
              <div className="mt-5 space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-lg border border-hairline bg-bg p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-ink">
                        <CreditCard className="h-4 w-4 text-copper" />
                        {invoice.number}
                      </div>
                      <Badge
                        tone={
                          invoice.status === "paid"
                            ? "green"
                            : invoice.status === "overdue"
                              ? "red"
                              : "amber"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink2">
                      {invoice.description}
                    </p>
                    <div className="mt-2 text-sm font-medium text-ink">
                      {formatCurrency(invoice.amountCents, invoice.currency)}
                    </div>
                    <div className="mt-1 text-[12px] text-muted">
                      Fällig: {formatDate(invoice.dueDate)}
                    </div>
                    {invoice.paymentUrl && (
                      <Link
                        href={invoice.paymentUrl}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-copper"
                      >
                        Zahlung öffnen
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
                {invoices.length === 0 && (
                  <p className="text-sm text-muted">
                    Keine Rechnungen sichtbar.
                  </p>
                )}
              </div>
            </PortalCard>

            <PortalCard>
              <PortalSectionTitle eyebrow="Hinweis" title="Interne Arbeit" />
              <div className="mt-4 flex gap-3 text-sm leading-relaxed text-ink2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                <p>
                  Sie sehen freigegebene Inhalte. Interne Analysen, Hypothesen
                  und Beratungsnotizen bleiben in Assads Arbeitsbereich.
                </p>
              </div>
            </PortalCard>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
