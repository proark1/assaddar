import type { Metadata } from "next";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  MessageCircle,
  Search,
  Send,
  Smartphone,
  Workflow,
} from "lucide-react";
import {
  completeCrmTaskAction,
  createCrmNoteAction,
  createCrmTaskFromInteractionAction,
  markCrmInteractionHandledAction,
  processCrmAutomationQueueAction,
  saveCrmDraftAction,
  sendCrmDraftAction,
  snoozeCrmInteractionAction,
  updateCrmOpportunityStageAction,
} from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import {
  buildCrmContactTimeline,
  buildCrmDashboard,
  buildCrmDiagnostics,
  crmActionStatus,
  type CrmInboxQuery,
} from "@/lib/portal/crm";
import { readStore } from "@/lib/portal/store";
import { formatDate } from "@/lib/portal/format";
import type { CrmChannel, CrmInteraction } from "@/lib/portal/types";
import {
  Badge,
  EmptyState,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  fieldClass,
  textareaClass,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kommunikation | Assad Dar Portal",
  robots: { index: false, follow: false },
};

const opportunityStages = [
  ["new_lead", "New Lead"],
  ["qualified", "Qualified"],
  ["discovery_scheduled", "Discovery Scheduled"],
  ["discovery_done", "Discovery Done"],
  ["proposal_needed", "Proposal Needed"],
  ["proposal_sent", "Proposal Sent"],
  ["negotiation", "Negotiation"],
  ["won", "Won"],
  ["lost", "Lost"],
  ["nurture", "Nurture"],
] as const;

const channels: Array<"all" | CrmChannel> = [
  "all",
  "email",
  "whatsapp",
  "telegram",
  "website",
  "portal",
  "phone",
  "meeting",
  "note",
];

function toneForUrgency(value: string): "red" | "amber" | "green" | "neutral" {
  if (value === "high") return "red";
  if (value === "normal") return "amber";
  if (value === "low") return "green";
  return "neutral";
}

function actionTone(value: ReturnType<typeof crmActionStatus>) {
  if (value === "high") return "red";
  if (value === "draft_ready") return "green";
  if (value === "needs_reply") return "amber";
  return "neutral";
}

function providerStatus(configured: boolean, status?: string) {
  if (!configured) return <Badge>nicht konfiguriert</Badge>;
  return <Badge tone={status === "failed" ? "red" : "green"}>{status || "aktiv"}</Badge>;
}

function parseInboxQuery(query: {
  q?: string;
  status?: string;
  channel?: string;
  classification?: string;
}): CrmInboxQuery {
  return {
    q: query.q || "",
    status:
      query.status === "all" ||
      query.status === "handled" ||
      query.status === "needs_reply" ||
      query.status === "draft_ready" ||
      query.status === "high"
        ? query.status
        : "open",
    channel: channels.includes(query.channel as CrmChannel)
      ? (query.channel as CrmInboxQuery["channel"])
      : "all",
    classification:
      query.classification === "lead" ||
      query.classification === "customer" ||
      query.classification === "support" ||
      query.classification === "billing" ||
      query.classification === "sales" ||
      query.classification === "other"
        ? query.classification
        : "all",
  };
}

function selectedLink({
  safe,
  status,
  count,
  label,
}: {
  safe: Locale;
  status: string;
  count: number;
  label: string;
}) {
  return (
    <Link
      href={`/${safe}/portal/admin/communications?status=${status}`}
      className="rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
    >
      <div className="text-xl font-medium text-ink">{count}</div>
      <div className="mt-1 text-[12px] text-muted">{label}</div>
    </Link>
  );
}

function interactionHref(safe: Locale, interaction: CrmInteraction, query: CrmInboxQuery) {
  const params = new URLSearchParams();
  params.set("interaction", interaction.id);
  if (query.status) params.set("status", query.status);
  if (query.channel) params.set("channel", query.channel);
  if (query.classification) params.set("classification", query.classification);
  if (query.q) params.set("q", query.q);
  return `/${safe}/portal/admin/communications?${params.toString()}`;
}

export default async function AdminCommunicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    interaction?: string;
    saved?: string;
    error?: string;
    q?: string;
    status?: string;
    channel?: string;
    classification?: string;
    triaged?: string;
    notified?: string;
  }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const store = await readStore();
  const inboxQuery = parseInboxQuery(query);
  const dashboard = buildCrmDashboard(store, inboxQuery);
  const diagnostics = buildCrmDiagnostics(store);
  const selectedInteraction =
    dashboard.allInteractions.find((entry) => entry.id === query.interaction) ??
    dashboard.interactions[0] ??
    dashboard.allInteractions[0];
  const selectedContact = selectedInteraction?.contactId
    ? dashboard.contactsById.get(selectedInteraction.contactId)
    : undefined;
  const selectedOpportunity = selectedInteraction?.opportunityId
    ? dashboard.opportunitiesById.get(selectedInteraction.opportunityId)
    : undefined;
  const selectedDrafts = selectedInteraction
    ? dashboard.draftsByInteraction.get(selectedInteraction.id) ?? []
    : [];
  const timeline = buildCrmContactTimeline(store, selectedContact?.id);
  const returnTo = `/${safe}/portal/admin/communications${
    selectedInteraction ? `?interaction=${selectedInteraction.id}` : ""
  }`;

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Kommunikation & CRM Inbox"
      activeNav="communications"
      backHref={`/${safe}/portal/admin`}
      actions={
        <>
          <form action={processCrmAutomationQueueAction}>
            <input type="hidden" name="locale" value={safe} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
            >
              <Bot className="h-4 w-4" />
              Queue verarbeiten
            </button>
          </form>
          <Link
            href={`/${safe}/portal/admin/crm/opportunities`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
          >
            <Workflow className="h-4 w-4" />
            Chancen
          </Link>
        </>
      }
    >
      {(query.saved || query.error) && (
        <div
          className={`mb-5 rounded-lg border p-3 text-sm ${
            query.error
              ? "border-critical/30 bg-critical/10 text-critical"
              : "border-success/30 bg-success/10 text-success"
          }`}
        >
          {query.error
            ? `Aktion konnte nicht ausgefuehrt werden: ${query.error}`
            : query.saved === "queue"
              ? `Queue verarbeitet: ${query.triaged ?? "0"} triagiert, ${query.notified ?? "0"} Benachrichtigungen.`
              : "Aktion gespeichert."}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {selectedLink({
          safe,
          status: "high",
          count: dashboard.actionBuckets.high.length,
          label: "hoch priorisiert",
        })}
        {selectedLink({
          safe,
          status: "draft_ready",
          count: dashboard.actionBuckets.draftReady.length,
          label: "Draft bereit",
        })}
        {selectedLink({
          safe,
          status: "needs_reply",
          count: dashboard.actionBuckets.needsReply.length,
          label: "Antwort offen",
        })}
        <PortalCard>
          <Clock3 className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">
            {dashboard.stats.pendingTriage}
          </div>
          <div className="text-sm text-muted">Queue</div>
        </PortalCard>
        <PortalCard>
          <Mail className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">
            {dashboard.stats.drafts}
          </div>
          <div className="text-sm text-muted">Entwuerfe</div>
        </PortalCard>
        <PortalCard>
          <Workflow className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">
            {dashboard.stats.openOpportunities}
          </div>
          <div className="text-sm text-muted">Chancen</div>
        </PortalCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.35fr_0.85fr]">
        <div className="space-y-4">
          <PortalCard>
            <PortalSectionTitle eyebrow="Action Inbox" title="Nachrichten" />
            <form className="mt-5 grid gap-2">
              <input type="hidden" name="status" value={inboxQuery.status || "open"} />
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
                <input
                  name="q"
                  defaultValue={inboxQuery.q}
                  className={`${fieldClass} pl-9`}
                  placeholder="Suchen..."
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <select name="status" defaultValue={inboxQuery.status} className={fieldClass}>
                  <option value="open">Offen</option>
                  <option value="high">High</option>
                  <option value="draft_ready">Draft bereit</option>
                  <option value="needs_reply">Antwort offen</option>
                  <option value="handled">Erledigt</option>
                  <option value="all">Alle</option>
                </select>
                <select name="channel" defaultValue={inboxQuery.channel} className={fieldClass}>
                  {channels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
                <select
                  name="classification"
                  defaultValue={inboxQuery.classification}
                  className={fieldClass}
                >
                  <option value="all">alle Typen</option>
                  <option value="lead">lead</option>
                  <option value="customer">customer</option>
                  <option value="sales">sales</option>
                  <option value="support">support</option>
                  <option value="billing">billing</option>
                  <option value="other">other</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
              >
                Filtern
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {dashboard.interactions.slice(0, 30).map((interaction) => {
                const contact = interaction.contactId
                  ? dashboard.contactsById.get(interaction.contactId)
                  : undefined;
                const active = selectedInteraction?.id === interaction.id;
                const action = crmActionStatus(store, interaction);
                return (
                  <Link
                    key={interaction.id}
                    href={interactionHref(safe, interaction, inboxQuery)}
                    className={`block rounded-lg border p-3 transition-colors hover:border-copper ${
                      active ? "border-copper bg-copper/10" : "border-hairline bg-bg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-ink">
                          {contact?.name || interaction.from}
                        </div>
                        <div className="mt-1 line-clamp-1 text-[12px] text-muted">
                          {interaction.subject}
                        </div>
                      </div>
                      <Badge tone={actionTone(action)}>{action}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink2">
                      {interaction.aiSummary || interaction.bodyPreview}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge>{interaction.channel}</Badge>
                      <Badge>{interaction.classification}</Badge>
                      <Badge tone={toneForUrgency(interaction.urgency)}>
                        {interaction.urgency}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
              {dashboard.interactions.length === 0 && (
                <EmptyState title="Keine passenden Nachrichten">
                  Passe Filter oder Suche an, um weitere CRM Signale zu sehen.
                </EmptyState>
              )}
            </div>
          </PortalCard>
        </div>

        <div className="space-y-4">
          {selectedInteraction && (
            <PortalCard>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PortalSectionTitle
                  eyebrow={selectedInteraction.channel}
                  title={selectedInteraction.subject}
                >
                  {selectedInteraction.aiSummary || selectedInteraction.bodyPreview}
                </PortalSectionTitle>
                <div className="flex flex-wrap gap-2">
                  <form action={snoozeCrmInteractionAction}>
                    <input type="hidden" name="locale" value={safe} />
                    <input type="hidden" name="interactionId" value={selectedInteraction.id} />
                    <input type="hidden" name="days" value="1" />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper">
                      <Clock3 className="h-4 w-4" />
                      1d
                    </button>
                  </form>
                  <form action={snoozeCrmInteractionAction}>
                    <input type="hidden" name="locale" value={safe} />
                    <input type="hidden" name="interactionId" value={selectedInteraction.id} />
                    <input type="hidden" name="days" value="3" />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper">
                      <Clock3 className="h-4 w-4" />
                      3d
                    </button>
                  </form>
                  <form action={markCrmInteractionHandledAction}>
                    <input type="hidden" name="locale" value={safe} />
                    <input type="hidden" name="interactionId" value={selectedInteraction.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper">
                      <CheckCircle2 className="h-4 w-4" />
                      Erledigt
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="text-[12px] text-muted">Von</div>
                  <div className="mt-1 break-words text-sm text-ink">
                    {selectedInteraction.from}
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="text-[12px] text-muted">Kontakt</div>
                  <div className="mt-1 text-sm text-ink">
                    {selectedContact?.name || "nicht zugeordnet"}
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="text-[12px] text-muted">Chance</div>
                  <div className="mt-1 text-sm text-ink">
                    {selectedOpportunity?.stage || "keine"}
                  </div>
                </div>
              </div>

              <pre className="mt-5 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg border border-hairline bg-bg p-4 text-sm leading-relaxed text-ink2">
                {selectedInteraction.body || selectedInteraction.bodyPreview}
              </pre>
            </PortalCard>
          )}

          {selectedDrafts.length > 0 && (
            <PortalCard>
              <PortalSectionTitle eyebrow="AI" title="Antworten bearbeiten & senden" />
              <div className="mt-5 space-y-4">
                {selectedDrafts.map((draft, index) => (
                  <form
                    key={draft.id}
                    action={saveCrmDraftAction}
                    className="rounded-lg border border-hairline bg-bg p-4"
                  >
                    <input type="hidden" name="locale" value={safe} />
                    <input type="hidden" name="draftId" value={draft.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={draft.status === "sent" ? "green" : "copper"}>
                          Antwort {index + 1}: {draft.status}
                        </Badge>
                        <select name="tone" defaultValue={draft.tone} className={fieldClass}>
                          <option value="warm">warm</option>
                          <option value="direct">direct</option>
                          <option value="follow_up">follow_up</option>
                        </select>
                      </div>
                      {draft.status === "draft" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                          >
                            Speichern
                          </button>
                          <button
                            formAction={sendCrmDraftAction}
                            className="inline-flex items-center gap-2 rounded-lg bg-copper px-3 py-2 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                          >
                            <Send className="h-4 w-4" />
                            Senden
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      name="subject"
                      defaultValue={draft.subject}
                      className={`${fieldClass} mt-3`}
                    />
                    <textarea
                      name="body"
                      defaultValue={draft.body}
                      className={`${textareaClass} mt-3 min-h-44`}
                    />
                  </form>
                ))}
              </div>
            </PortalCard>
          )}

          {selectedInteraction && (
            <PortalCard>
              <PortalSectionTitle eyebrow="Follow-up" title="Aufgabe erstellen" />
              <form action={createCrmTaskFromInteractionAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_auto]">
                <input type="hidden" name="locale" value={safe} />
                <input type="hidden" name="interactionId" value={selectedInteraction.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <input
                  name="title"
                  className={fieldClass}
                  defaultValue={`Antwort vorbereiten: ${selectedInteraction.subject}`}
                />
                <input name="dueDate" type="date" className={fieldClass} />
                <button className="inline-flex items-center justify-center rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper">
                  Aufgabe
                </button>
              </form>
            </PortalCard>
          )}

          <PortalCard>
            <PortalSectionTitle eyebrow="Manuell" title="CRM Notiz" />
            <form action={createCrmNoteAction} className="mt-5 space-y-3">
              <input type="hidden" name="locale" value={safe} />
              <input type="hidden" name="returnTo" value={returnTo} />
              {selectedContact && <input type="hidden" name="contactId" value={selectedContact.id} />}
              <input
                name="subject"
                className={fieldClass}
                defaultValue={selectedContact ? `Notiz: ${selectedContact.name}` : "CRM Notiz"}
              />
              <textarea
                name="body"
                className={textareaClass}
                placeholder="Notiz, Call-Zusammenfassung oder naechster Schritt..."
              />
              <button className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi">
                <CheckCircle2 className="h-4 w-4" />
                Speichern
              </button>
            </form>
          </PortalCard>
        </div>

        <aside className="space-y-4">
          <PortalCard>
            <PortalSectionTitle eyebrow="Admin Alerts" title="Benachrichtigungen" />
            <div className="mt-5 space-y-3">
              {dashboard.notifications.slice(0, 8).map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{event.channel}</Badge>
                    <Badge
                      tone={
                        event.status === "sent"
                          ? "green"
                          : event.status === "failed"
                            ? "red"
                            : "neutral"
                      }
                    >
                      {event.status}
                    </Badge>
                    <span className="text-[12px] text-muted">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-5 whitespace-pre-line text-[12px] leading-relaxed text-ink2">
                    {event.summary}
                  </p>
                  {event.error && (
                    <p className="mt-2 text-[12px] text-critical">
                      {event.error}
                    </p>
                  )}
                </div>
              ))}
              {dashboard.notifications.length === 0 && (
                <p className="text-sm text-muted">
                  Noch keine Admin-Benachrichtigungen.
                </p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Provider" title="Diagnostik" />
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Resend", Mail, diagnostics.resend],
                ["Gemini", Bot, diagnostics.gemini],
                ["Telegram", MessageCircle, diagnostics.telegram],
                ["WhatsApp", Smartphone, diagnostics.whatsapp],
              ].map(([label, Icon, data]) => {
                const diagnostic = data as {
                  configured: boolean;
                  lastEventAt?: string;
                  lastStatus?: string;
                };
                const IconComponent = Icon as typeof Mail;
                return (
                  <div key={String(label)} className="rounded-lg border border-hairline bg-bg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-ink">
                        <IconComponent className="h-4 w-4 text-copper" />
                        {String(label)}
                      </span>
                      {providerStatus(diagnostic.configured, diagnostic.lastStatus)}
                    </div>
                    <div className="mt-2 text-[12px] text-muted">
                      {diagnostic.lastEventAt
                        ? `Letztes Signal: ${formatDate(diagnostic.lastEventAt)}`
                        : "Noch kein Signal"}
                    </div>
                  </div>
                );
              })}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Follow-up" title="Aufgaben" />
            <div className="mt-5 space-y-3">
              {dashboard.openTasks.slice(0, 10).map((task) => (
                <div key={task.id} className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-ink">{task.title}</div>
                      <div className="mt-1 text-[12px] text-muted">
                        {task.dueDate ? `Faellig ${task.dueDate}` : formatDate(task.createdAt)}
                      </div>
                    </div>
                    <Badge tone={task.priority === "high" ? "red" : "amber"}>
                      {task.priority}
                    </Badge>
                  </div>
                  <form action={completeCrmTaskAction} className="mt-3">
                    <input type="hidden" name="locale" value={safe} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Erledigt
                    </button>
                  </form>
                </div>
              ))}
              {dashboard.openTasks.length === 0 && (
                <p className="text-sm text-muted">Keine offenen CRM Follow-ups.</p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Kontakt" title="Timeline" />
            <div className="mt-5 space-y-3">
              {timeline.slice(0, 8).map((item) => (
                <div key={`${item.kind}-${item.id}`} className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge>{item.kind}</Badge>
                    <span className="text-[12px] text-muted">{formatDate(item.date)}</span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-ink">{item.title}</div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              ))}
              {timeline.length === 0 && (
                <p className="text-sm text-muted">Noch keine Kontakt-Historie.</p>
              )}
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Sales" title="Chancen" />
            <div className="mt-5 space-y-3">
              {dashboard.openOpportunities.slice(0, 6).map((opportunity) => (
                <form
                  key={opportunity.id}
                  action={updateCrmOpportunityStageAction}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <input type="hidden" name="locale" value={safe} />
                  <input type="hidden" name="opportunityId" value={opportunity.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <div className="text-sm font-medium text-ink">{opportunity.title}</div>
                  <select name="stage" defaultValue={opportunity.stage} className={`${fieldClass} mt-3`}>
                    {opportunityStages.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper">
                    Speichern
                  </button>
                </form>
              ))}
              {dashboard.openOpportunities.length === 0 && (
                <p className="text-sm text-muted">Keine offenen Chancen.</p>
              )}
            </div>
          </PortalCard>
        </aside>
      </div>
    </PortalShell>
  );
}
