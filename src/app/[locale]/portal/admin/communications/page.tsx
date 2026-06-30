import type { Metadata } from "next";
import {
  Bot,
  CheckCircle2,
  Inbox,
  Mail,
  MessageCircle,
  Send,
  Smartphone,
  Workflow,
} from "lucide-react";
import {
  completeCrmTaskAction,
  createCrmNoteAction,
  markCrmInteractionHandledAction,
  sendCrmDraftAction,
  updateCrmOpportunityStageAction,
} from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { buildCrmDashboard } from "@/lib/portal/crm";
import { readStore } from "@/lib/portal/store";
import { formatDate } from "@/lib/portal/format";
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

function toneForUrgency(value: string): "red" | "amber" | "green" | "neutral" {
  if (value === "high") return "red";
  if (value === "normal") return "amber";
  if (value === "low") return "green";
  return "neutral";
}

function providerStatus(configured: boolean) {
  return configured ? <Badge tone="green">aktiv</Badge> : <Badge>nicht konfiguriert</Badge>;
}

export default async function AdminCommunicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ interaction?: string; saved?: string; error?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const store = await readStore();
  const dashboard = buildCrmDashboard(store);
  const selectedInteraction =
    dashboard.interactions.find((entry) => entry.id === query.interaction) ??
    dashboard.interactions[0];
  const selectedContact = selectedInteraction?.contactId
    ? dashboard.contactsById.get(selectedInteraction.contactId)
    : undefined;
  const selectedDrafts = selectedInteraction
    ? dashboard.draftsByInteraction.get(selectedInteraction.id) ?? []
    : [];
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
            : "Aktion gespeichert."}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <PortalCard>
          <Inbox className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">
            {dashboard.stats.unhandled}
          </div>
          <div className="text-sm text-muted">offene Nachrichten</div>
        </PortalCard>
        <PortalCard>
          <Mail className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">
            {dashboard.stats.drafts}
          </div>
          <div className="text-sm text-muted">Antwortentwuerfe</div>
        </PortalCard>
        <PortalCard>
          <Workflow className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">
            {dashboard.stats.openOpportunities}
          </div>
          <div className="text-sm text-muted">offene Chancen</div>
        </PortalCard>
        <PortalCard>
          <CheckCircle2 className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">
            {dashboard.stats.openTasks}
          </div>
          <div className="text-sm text-muted">Follow-ups</div>
        </PortalCard>
        <PortalCard>
          <Bot className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">
            {dashboard.stats.contacts}
          </div>
          <div className="text-sm text-muted">CRM Kontakte</div>
        </PortalCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.4fr_0.8fr]">
        <div className="space-y-4">
          <PortalCard>
            <PortalSectionTitle eyebrow="Inbox" title="Nachrichten">
              Resend-Inbound, Website-Leads und spaeter WhatsApp/Telegram laufen
              hier admin-only zusammen.
            </PortalSectionTitle>
            <div className="mt-5 space-y-3">
              {dashboard.interactions.slice(0, 25).map((interaction) => {
                const contact = interaction.contactId
                  ? dashboard.contactsById.get(interaction.contactId)
                  : undefined;
                const active = selectedInteraction?.id === interaction.id;
                return (
                  <a
                    key={interaction.id}
                    href={`/${safe}/portal/admin/communications?interaction=${interaction.id}`}
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
                      <Badge tone={toneForUrgency(interaction.urgency)}>
                        {interaction.urgency}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink2">
                      {interaction.aiSummary || interaction.bodyPreview}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge>{interaction.channel}</Badge>
                      <Badge>{interaction.classification}</Badge>
                      {interaction.handledAt && <Badge tone="green">erledigt</Badge>}
                    </div>
                  </a>
                );
              })}
              {dashboard.interactions.length === 0 && (
                <EmptyState title="Keine CRM Nachrichten">
                  Sobald Resend oder das Kontaktformular eine Nachricht liefert,
                  erscheint sie hier.
                </EmptyState>
              )}
            </div>
          </PortalCard>
        </div>

        <div className="space-y-4">
          {selectedInteraction ? (
            <PortalCard>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PortalSectionTitle
                  eyebrow={selectedInteraction.channel}
                  title={selectedInteraction.subject}
                >
                  {selectedInteraction.aiSummary || selectedInteraction.bodyPreview}
                </PortalSectionTitle>
                <form action={markCrmInteractionHandledAction}>
                  <input type="hidden" name="locale" value={safe} />
                  <input
                    type="hidden"
                    name="interactionId"
                    value={selectedInteraction.id}
                  />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Erledigt
                  </button>
                </form>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="text-[12px] text-muted">Von</div>
                  <div className="mt-1 text-sm text-ink">{selectedInteraction.from}</div>
                </div>
                <div className="rounded-lg border border-hairline bg-bg p-3">
                  <div className="text-[12px] text-muted">Kontakt</div>
                  <div className="mt-1 text-sm text-ink">
                    {selectedContact
                      ? `${selectedContact.name}${selectedContact.email ? ` · ${selectedContact.email}` : ""}`
                      : "nicht zugeordnet"}
                  </div>
                </div>
              </div>

              <pre className="mt-5 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-hairline bg-bg p-4 text-sm leading-relaxed text-ink2">
                {selectedInteraction.body || selectedInteraction.bodyPreview}
              </pre>
            </PortalCard>
          ) : null}

          {selectedDrafts.length > 0 && (
            <PortalCard>
              <PortalSectionTitle eyebrow="AI" title="Antwortentwuerfe">
                Gemini erstellt Entwuerfe. Gesendet wird erst nach deiner
                ausdruecklichen Aktion.
              </PortalSectionTitle>
              <div className="mt-5 space-y-3">
                {selectedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-lg border border-hairline bg-bg p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={draft.status === "sent" ? "green" : "copper"}>
                          {draft.status}
                        </Badge>
                        <Badge>{draft.tone}</Badge>
                      </div>
                      {draft.status === "draft" && (
                        <form action={sendCrmDraftAction}>
                          <input type="hidden" name="locale" value={safe} />
                          <input type="hidden" name="draftId" value={draft.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-copper px-3 py-2 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                          >
                            <Send className="h-4 w-4" />
                            Senden
                          </button>
                        </form>
                      )}
                    </div>
                    <div className="mt-3 text-sm font-medium text-ink">
                      {draft.subject}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink2">
                      {draft.body}
                    </p>
                  </div>
                ))}
              </div>
            </PortalCard>
          )}

          <PortalCard>
            <PortalSectionTitle eyebrow="Manuell" title="CRM Notiz" />
            <form action={createCrmNoteAction} className="mt-5 space-y-3">
              <input type="hidden" name="locale" value={safe} />
              <input type="hidden" name="returnTo" value={returnTo} />
              {selectedContact && (
                <input type="hidden" name="contactId" value={selectedContact.id} />
              )}
              <input
                name="subject"
                className={fieldClass}
                placeholder="Betreff"
                defaultValue={
                  selectedContact ? `Notiz: ${selectedContact.name}` : "CRM Notiz"
                }
              />
              <textarea
                name="body"
                className={textareaClass}
                placeholder="Notiz, Call-Zusammenfassung oder naechster Schritt..."
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
              >
                <CheckCircle2 className="h-4 w-4" />
                Speichern
              </button>
            </form>
          </PortalCard>
        </div>

        <aside className="space-y-4">
          <PortalCard>
            <PortalSectionTitle eyebrow="Provider" title="Automationen" />
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-bg p-3">
                <span className="inline-flex items-center gap-2 text-ink">
                  <Mail className="h-4 w-4 text-copper" />
                  Resend Inbound
                </span>
                {providerStatus(Boolean(process.env.RESEND_WEBHOOK_SECRET))}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-bg p-3">
                <span className="inline-flex items-center gap-2 text-ink">
                  <Bot className="h-4 w-4 text-copper" />
                  Gemini
                </span>
                {providerStatus(Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL))}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-bg p-3">
                <span className="inline-flex items-center gap-2 text-ink">
                  <MessageCircle className="h-4 w-4 text-copper" />
                  Telegram
                </span>
                {providerStatus(Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID))}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-bg p-3">
                <span className="inline-flex items-center gap-2 text-ink">
                  <Smartphone className="h-4 w-4 text-copper" />
                  WhatsApp
                </span>
                {providerStatus(Boolean(process.env.WHATSAPP_BUSINESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ADMIN_PHONE))}
              </div>
            </div>
          </PortalCard>

          <PortalCard>
            <PortalSectionTitle eyebrow="Follow-up" title="Aufgaben" />
            <div className="mt-5 space-y-3">
              {dashboard.openTasks.slice(0, 8).map((task) => (
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
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                    >
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
            <PortalSectionTitle eyebrow="Sales" title="Chancen" />
            <div className="mt-5 space-y-3">
              {dashboard.openOpportunities.slice(0, 8).map((opportunity) => (
                <form
                  key={opportunity.id}
                  action={updateCrmOpportunityStageAction}
                  className="rounded-lg border border-hairline bg-bg p-3"
                >
                  <input type="hidden" name="locale" value={safe} />
                  <input type="hidden" name="opportunityId" value={opportunity.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <div className="text-sm font-medium text-ink">
                    {opportunity.title}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                    {opportunity.nextStep}
                  </p>
                  <select
                    name="stage"
                    defaultValue={opportunity.stage}
                    className={`${fieldClass} mt-3`}
                  >
                    {opportunityStages.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                  >
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
