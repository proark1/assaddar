import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
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
  requestProposalChangesAction,
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
  buildCustomerChecklist,
  buildFileVersionGroups,
  buildCustomerNextActions,
} from "@/lib/portal/operations";
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

const intakeAnswerAliases: Record<string, string[]> = {
  companyContext: ["Unternehmenskontext"],
  issues: ["Probleme und Engpaesse", "Probleme", "Engpaesse"],
  goals: ["Ziele"],
  currentTools: ["Aktuelle Tools", "Tools", "Systeme"],
  dataSituation: ["Daten und Dokumente", "Daten", "Dokumente"],
  constraints: ["Rahmenbedingungen", "Einschraenkungen", "Constraints"],
};

function customerView(value?: string): CustomerView | null {
  return value === "overview" ||
    value === "input" ||
    value === "actions" ||
    value === "files" ||
    value === "messages"
    ? value
    : null;
}

function normalizeIntakeLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function latestIntakeDefaults(
  updates: Array<{ title: string; body: string; createdAt: string }>,
  questions: Array<{ id: string; prompt: string }>,
) {
  const lookup = new Map<string, string>();
  for (const [field, aliases] of Object.entries(intakeAnswerAliases)) {
    for (const alias of aliases) lookup.set(normalizeIntakeLabel(alias), field);
  }
  for (const question of questions) {
    if (question.id.startsWith("template_")) {
      lookup.set(normalizeIntakeLabel(question.prompt), question.id);
    }
  }

  const intake = updates
    .filter((update) => isCustomerIntake(update.title))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  if (!intake) return {};

  const answers: Record<string, string> = {};
  let activeField = "";
  let buffer: string[] = [];
  const flush = () => {
    if (!activeField) return;
    const value = buffer.join("\n").trim();
    if (value) answers[activeField] = value;
    buffer = [];
  };

  for (const line of intake.body.split(/\r?\n/)) {
    const trimmed = line.trim();
    const separator = trimmed.indexOf(":");
    const key =
      separator >= 0
        ? lookup.get(normalizeIntakeLabel(trimmed.slice(0, separator)))
        : undefined;

    if (key) {
      flush();
      activeField = key;
      buffer = trimmed.slice(separator + 1).trim()
        ? [trimmed.slice(separator + 1).trim()]
        : [];
    } else if (activeField) {
      buffer.push(line);
    }
  }
  flush();

  return answers;
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
  const appointments = allCustomerUpdates
    .filter((update) => update.title.startsWith("Termin:"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const updates = allCustomerUpdates.filter(
    (update) => !isStructuredUpdate(update.title),
  );
  const intakeSubmitted = allCustomerUpdates.some((update) =>
    isCustomerIntake(update.title),
  );
  const intakeQuestions = buildIntakeQuestions(bundle);
  const intakeDefaults = latestIntakeDefaults(
    allCustomerUpdates,
    intakeQuestions,
  );
  const tasks = bundle.tasks.filter((task) => task.visibleToCustomer);
  const milestones = bundle.milestones.filter(
    (milestone) => milestone.visibleToCustomer,
  );
  const files = bundle.files.filter((file) => file.visibility === "customer");
  const fileGroups = buildFileVersionGroups(bundle, "customer");
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
    (file) =>
      file.approvalStatus !== "not_required" &&
      file.approvalStatus !== "approved" &&
      !approvedFileIds.has(file.id),
  );
  const nextActions = buildCustomerNextActions(bundle);
  const customerChecklist = buildCustomerChecklist(bundle);
  const primaryAction = nextActions[0];
  const requiredIntakeQuestions = intakeQuestions.filter((question) =>
    ["companyContext", "issues", "goals"].includes(question.id),
  );
  const requiredIntakeProgress = requiredIntakeQuestions.map((question) => ({
    id: question.id,
    label: question.label,
    done: intakeSubmitted || Boolean(intakeDefaults[question.id]?.trim()),
  }));
  const requiredIntakeDone = requiredIntakeProgress.filter(
    (item) => item.done,
  ).length;
  const optionalIntakeQuestions = intakeQuestions.filter(
    (question) =>
      !question.id.startsWith("template_") &&
      !["companyContext", "issues", "goals"].includes(question.id),
  );
  const templateIntakeQuestions = intakeQuestions.filter((question) =>
    question.id.startsWith("template_"),
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
      body: "Status, Fortschritt und letzte Aktivität.",
      count: timeline.length,
    },
    {
      id: "input",
      eyebrow: "2",
      title: "Fragebogen",
      body: intakeSubmitted
        ? "Ergänzen bei Änderungen."
        : "Zuerst ausfüllen.",
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
      body: "Eine Rückfrage senden.",
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
            " Bitte mindestens ein Intake-Feld ausfüllen."}
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
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-copper/25 bg-copper/10 p-4">
              <div className="text-sm font-medium text-ink">
                Nächster Schritt
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {bundle.project.nextStep ||
                  "Der nächste Schritt wird vorbereitet."}
              </p>
            </div>
            {appointments[0] && (
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Clock3 className="h-4 w-4 text-copper" />
                  Nächster Termin
                </div>
                <div className="mt-2 text-sm font-medium text-ink">
                  {appointments[0].title.replace(/^Termin:\s*/, "")}
                </div>
                <p className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-muted">
                  {appointments[0].body}
                </p>
              </div>
            )}
            {primaryAction && (
              <Link
                href={stepHref(primaryAction.hrefView)}
                className={`group rounded-lg border p-4 transition-colors hover:border-copper ${
                  primaryAction.tone === "green"
                    ? "border-success/25 bg-success/10"
                    : primaryAction.tone === "red"
                      ? "border-critical/30 bg-critical/10"
                      : "border-copper/25 bg-copper/10"
                }`}
              >
                <div className="text-sm font-medium text-ink">
                  Heute zuerst: {primaryAction.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink2">
                  {primaryAction.body}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-copper">
                  {primaryAction.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )}
          </div>
        </PortalCard>

        <PortalCard>
          <PortalSectionTitle
            eyebrow="Einfacher Ablauf"
            title="So läuft dieses Projekt"
          >
            Vier Bereiche reichen aus: Informationen, Analyse, Aufgaben und
            Ergebnisse.
          </PortalSectionTitle>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {customerChecklist.map((item, index) => (
              <Link
                key={item.id}
                href={stepHref(item.hrefView)}
                className={`rounded-lg border p-4 transition-colors hover:border-copper ${
                  item.status === "done"
                    ? "border-success/25 bg-success/10"
                    : item.status === "current"
                      ? "border-copper/30 bg-copper/10"
                      : "border-hairline bg-bg"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                    Schritt {index + 1}
                  </span>
                  {item.status === "done" && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                </div>
                <h3 className="mt-3 text-sm font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {item.body}
                </p>
              </Link>
            ))}
          </div>
        </PortalCard>

        <PortalCard>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
            <div>
              <PortalSectionTitle
                eyebrow="Jetzt wichtig"
                title="Ihre nächsten Schritte"
              >
                Das Portal zeigt zuerst, was von Ihnen gebraucht wird. Alles
                andere bleibt in den Detailbereichen erreichbar.
              </PortalSectionTitle>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="font-medium text-ink">
                    {formatStage(bundle.project.asdarStage)}
                  </div>
                  <div className="mt-1 text-[12px] text-muted">ASDAR Phase</div>
                </div>
                <div className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="font-medium text-ink">
                    {pendingCustomerTasks.length}
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    offene Kundenaufgaben
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="font-medium text-ink">
                    {pendingFileApprovals.length + pendingMilestoneApprovals.length}
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    offene Freigaben
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {nextActions.slice(0, 4).map((action) => (
                <Link
                  key={action.id}
                  href={stepHref(action.hrefView)}
                  className={`group rounded-lg border p-4 transition-colors hover:border-copper ${
                    action.tone === "red"
                      ? "border-critical/30 bg-critical/10"
                      : action.tone === "green"
                        ? "border-success/25 bg-success/10"
                        : "border-copper/25 bg-copper/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      {action.tone === "green" ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <AlertTriangle
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            action.tone === "red" ? "text-critical" : "text-copper"
                          }`}
                        />
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-ink">
                          {action.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink2">
                          {action.body}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-copper">
                      {action.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
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
              title="Geführter Projektfragebogen"
            >
              Ihre Antworten landen direkt in Assads interner Analyse und
              erzeugen automatisch eine erste Beratungsgrundlage.
            </PortalSectionTitle>
            {intakeSubmitted && (
              <div className="mt-4 rounded-lg border border-success/25 bg-success/10 p-3 text-sm text-success">
                Fragebogen wurde bereits eingereicht. Sie können ihn erneut
                senden, wenn sich wichtige Informationen geändert haben.
              </div>
            )}
            <div className="mt-5 rounded-lg border border-hairline bg-bg p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">
                    Pflichtfortschritt: {requiredIntakeDone}/
                    {requiredIntakeProgress.length}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    Diese drei Antworten reichen, damit Assad eine belastbare
                    erste Analyse starten kann. Zusatzfragen bleiben optional.
                  </p>
                </div>
                <Badge
                  tone={
                    requiredIntakeDone === requiredIntakeProgress.length
                      ? "green"
                      : "amber"
                  }
                >
                  {requiredIntakeDone === requiredIntakeProgress.length
                    ? "Startbereit"
                    : "Noch offen"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {requiredIntakeProgress.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3 ${
                      item.done
                        ? "border-success/25 bg-success/10"
                        : "border-copper/25 bg-copper/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                        Schritt {index + 1}
                      </span>
                      {item.done && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <details open={!intakeSubmitted} className="mt-5">
              <summary className="cursor-pointer text-sm font-medium text-copper">
                Fragebogen öffnen
              </summary>
              <form
                action={submitCustomerIntakeAction}
                className="mt-5 space-y-4"
              >
                <input type="hidden" name="locale" value={safe} />
                <input type="hidden" name="projectId" value={projectId} />
                <div className="rounded-lg border border-copper/25 bg-copper/10 p-4 text-sm leading-relaxed text-ink2">
                  Starten Sie mit den drei Pflichtantworten. Alles Weitere ist
                  optional und hilft Assad, die Beratung schneller und genauer
                  vorzubereiten.
                </div>
                <div className="rounded-lg border border-hairline bg-bg p-4">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                    Teil 1 · Pflicht
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-ink">
                    Die drei wichtigsten Antworten
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    Kurz und konkret reicht. Beispiele, Tools und echte Fälle
                    sind hilfreicher als perfekte Formulierungen.
                  </p>
                  <div className="mt-4 space-y-4">
                    {requiredIntakeQuestions.map((question, index) => (
                      <div key={question.id}>
                        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                          Frage {index + 1}
                        </div>
                        <label className="mb-1.5 block text-sm text-ink2">
                          {question.label}
                        </label>
                        <p className="mb-2 text-[12px] leading-relaxed text-muted">
                          {question.prompt}
                        </p>
                        <textarea
                          name={question.id}
                          placeholder={question.placeholder}
                          defaultValue={intakeDefaults[question.id] ?? ""}
                          className={textareaClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <details className="rounded-lg border border-hairline bg-bg p-4">
                  <summary className="cursor-pointer text-sm font-medium text-copper">
                    Teil 2 · Tools, Daten und Rahmenbedingungen
                  </summary>
                  <div className="mt-4 space-y-4">
                    {optionalIntakeQuestions.map((question, index) => (
                      <div key={question.id}>
                        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                          Zusatzfrage {index + 1}
                        </div>
                        <label className="mb-1.5 block text-sm text-ink2">
                          {question.label}
                        </label>
                        <p className="mb-2 text-[12px] leading-relaxed text-muted">
                          {question.prompt}
                        </p>
                        <textarea
                          name={question.id}
                          placeholder={question.placeholder}
                          defaultValue={intakeDefaults[question.id] ?? ""}
                          className={textareaClass}
                        />
                      </div>
                    ))}
                  </div>
                </details>

                {templateIntakeQuestions.length > 0 && (
                  <details className="rounded-lg border border-hairline bg-bg p-4">
                    <summary className="cursor-pointer text-sm font-medium text-copper">
                      Teil 3 · Branchenfragen
                    </summary>
                    <div className="mt-4 space-y-4">
                      {templateIntakeQuestions.map((question, index) => (
                        <div key={question.id}>
                          <input
                            type="hidden"
                            name="questionLabel"
                            value={question.prompt}
                          />
                          <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                            Branchenfrage {index + 1}
                          </div>
                          <label className="mb-1.5 block text-sm text-ink2">
                            {question.prompt}
                          </label>
                          <textarea
                            name="questionAnswer"
                            placeholder={question.placeholder}
                            defaultValue={intakeDefaults[question.id] ?? ""}
                            className={textareaClass}
                          />
                        </div>
                      ))}
                    </div>
                  </details>
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
                {pendingFileApprovals.map((file) => {
                  const isProposal = file.category === "proposal";
                  return (
                    <div
                      key={file.id}
                      className="rounded-lg border border-hairline bg-bg p-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <a
                          href={`/api/portal/files/${file.id}`}
                          className="flex items-start gap-3 text-sm text-ink transition-colors hover:text-copper"
                        >
                          <Download className="mt-0.5 h-4 w-4 text-copper" />
                          <span>
                            <span className="block font-medium">
                              {file.name}
                            </span>
                            <span className="mt-1 block text-[12px] text-muted">
                              {file.description ||
                                "Datei herunterladen und prüfen"}
                            </span>
                          </span>
                        </a>
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
                            {isProposal
                              ? "Angebot annehmen"
                              : "Datei freigeben"}
                          </button>
                        </form>
                      </div>
                      {isProposal && (
                        <details className="mt-3 border-t border-hairline pt-3">
                          <summary className="cursor-pointer text-[12px] font-medium text-copper">
                            Änderung anfragen
                          </summary>
                          <form
                            action={requestProposalChangesAction}
                            className="mt-3 space-y-2"
                          >
                            <input type="hidden" name="locale" value={safe} />
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="fileId"
                              value={file.id}
                            />
                            <textarea
                              name="message"
                              required
                              placeholder="Was soll im Angebot angepasst werden?"
                              className={`${textareaClass} min-h-24`}
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Änderungswunsch senden
                            </button>
                          </form>
                        </details>
                      )}
                    </div>
                  );
                })}
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
                {fileGroups.map((group) => {
                  const file = group.latest;
                  const isProposal = file.category === "proposal";
                  const isApproved =
                    approvedFileIds.has(file.id) ||
                    file.approvalStatus === "approved";
                  return (
                    <div
                      key={group.key}
                      className="rounded-lg border border-hairline bg-bg p-3"
                    >
                      {file.mimeType.startsWith("image/") && (
                        <img
                          src={`/api/portal/files/${file.id}`}
                          alt={file.name}
                          className="mb-3 aspect-video w-full rounded-lg border border-hairline object-cover"
                        />
                      )}
                      <a
                        href={`/api/portal/files/${file.id}`}
                        className="flex items-start gap-3 transition-colors hover:text-copper"
                      >
                        <Download className="mt-0.5 h-4 w-4 text-copper" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-medium text-ink">
                              {file.name}
                            </div>
                            {group.versions.length > 1 && (
                              <Badge tone="copper">
                                {group.versions.length} Versionen
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 text-[12px] text-muted">
                            {file.description || "Datei herunterladen"} ·{" "}
                            {Math.ceil(file.size / 1024)} KB
                          </div>
                        </div>
                      </a>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {isApproved ? (
                          <Badge tone="green">Freigegeben</Badge>
                        ) : file.approvalStatus === "not_required" ? (
                          <Badge>Keine Freigabe nötig</Badge>
                        ) : (
                          <>
                            <Badge tone="amber">
                              {isProposal ? "Annahme offen" : "Freigabe offen"}
                            </Badge>
                            <form action={approveFileAction}>
                              <input
                                type="hidden"
                                name="locale"
                                value={safe}
                              />
                              <input
                                type="hidden"
                                name="projectId"
                                value={projectId}
                              />
                              <input
                                type="hidden"
                                name="fileId"
                                value={file.id}
                              />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {isProposal
                                  ? "Angebot annehmen"
                                  : "Datei freigeben"}
                              </button>
                            </form>
                          </>
                        )}
                      </div>
                      {isProposal && !isApproved && (
                        <details className="mt-3 border-t border-hairline pt-3">
                          <summary className="cursor-pointer text-[12px] font-medium text-copper">
                            Änderung anfragen
                          </summary>
                          <form
                            action={requestProposalChangesAction}
                            className="mt-3 space-y-2"
                          >
                            <input type="hidden" name="locale" value={safe} />
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="fileId"
                              value={file.id}
                            />
                            <textarea
                              name="message"
                              required
                              placeholder="Was soll im Angebot angepasst werden?"
                              className={`${textareaClass} min-h-24`}
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Änderungswunsch senden
                            </button>
                          </form>
                        </details>
                      )}
                      {group.versions.length > 1 && (
                        <details className="mt-3 border-t border-hairline pt-3">
                          <summary className="cursor-pointer text-[12px] font-medium text-copper">
                            Versionshistorie anzeigen
                          </summary>
                          <div className="mt-2 space-y-2">
                            {group.versions.slice(1).map((version) => (
                              <a
                                key={version.id}
                                href={`/api/portal/files/${version.id}`}
                                className="block rounded-md border border-hairline bg-surface px-3 py-2 text-[12px] text-ink2 transition-colors hover:border-copper hover:text-copper"
                              >
                                {version.name} · {formatDate(version.uploadedAt)} ·{" "}
                                {Math.ceil(version.size / 1024)} KB
                              </a>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })}
                {fileGroups.length === 0 && (
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
