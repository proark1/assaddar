import { Resend } from "resend";
import { appUrl, crmFromEmail } from "./config";
import { requestExternalAiInsight } from "./ai-providers";
import {
  sendTelegramAdminAlert,
  sendWhatsAppAdminAlert,
} from "./notifications";
import { id } from "./store";
import type {
  CrmChannel,
  CrmContact,
  CrmEmailDraft,
  CrmInteraction,
  CrmNotificationEvent,
  CrmOpportunity,
  CrmTask,
  Organization,
  PortalStore,
} from "./types";

type InboundEmailInput = {
  providerMessageId?: string;
  from: string;
  fromName?: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  createdAt?: string;
  source?: string;
};

type AiTriage = Pick<
  CrmInteraction,
  "urgency" | "classification" | "sentiment" | "aiSummary"
> & {
  replyDrafts: Array<Pick<CrmEmailDraft, "tone" | "body">>;
  nextTask?: string;
};

const GENERIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "icloud.com",
  "me.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "proton.me",
  "protonmail.com",
  "gmx.de",
  "web.de",
]);

function now() {
  return new Date().toISOString();
}

function clean(value: unknown) {
  return String(value || "").trim();
}

export function normalizeEmail(value: string) {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0].toLowerCase() ?? "";
}

function emailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function preview(value: string, length = 260) {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > length ? `${compact.slice(0, length - 3)}...` : compact;
}

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function personName(input: InboundEmailInput, email: string) {
  if (input.fromName) return input.fromName;
  const withoutEmail = input.from.replace(/<[^>]+>/g, "").trim();
  if (withoutEmail && !withoutEmail.includes("@")) return withoutEmail;
  return email.split("@")[0] || "Unbekannter Kontakt";
}

function safeJsonObject(value: string): Record<string, unknown> | null {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || value;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;

  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function clampProbability(value: number) {
  if (!Number.isFinite(value)) return 20;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function findOrganizationByDomain(store: PortalStore, domain: string) {
  if (!domain || GENERIC_EMAIL_DOMAINS.has(domain)) return undefined;
  return store.organizations.find((organization) => {
    const website = organization.website?.toLowerCase() ?? "";
    return website.includes(domain) || organization.name.toLowerCase().includes(domain.split(".")[0]);
  });
}

function findOrCreateOrganization(store: PortalStore, email: string, source: string) {
  const domain = emailDomain(email);
  const existing = findOrganizationByDomain(store, domain);
  if (existing) return existing;
  if (!domain || GENERIC_EMAIL_DOMAINS.has(domain)) return undefined;

  const organization: Organization = {
    id: id("org"),
    name: domain,
    industry: "CRM Lead",
    website: `https://${domain}`,
    createdAt: now(),
  };
  store.organizations.push(organization);
  return organization;
}

function findCrmContact(store: PortalStore, email: string) {
  if (!email) return undefined;
  return store.crmContacts.find(
    (contact) => contact.email?.toLowerCase() === email.toLowerCase(),
  );
}

function findOrCreateContact(
  store: PortalStore,
  input: InboundEmailInput,
  organization: Organization | undefined,
) {
  const email = normalizeEmail(input.from);
  const existing = findCrmContact(store, email);
  const timestamp = now();

  if (existing) {
    existing.name = existing.name || personName(input, email);
    existing.organizationId = existing.organizationId || organization?.id;
    existing.lastContactedAt = timestamp;
    existing.updatedAt = timestamp;
    return existing;
  }

  const contact: CrmContact = {
    id: id("crm_contact"),
    organizationId: organization?.id,
    name: personName(input, email),
    email,
    source: input.source || "Resend inbound",
    lifecycle: "lead",
    consent: "transactional",
    tags: ["inbound"],
    lastContactedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.crmContacts.push(contact);
  return contact;
}

function findOpenOpportunity(store: PortalStore, contactId: string) {
  return store.crmOpportunities.find(
    (opportunity) =>
      opportunity.contactId === contactId &&
      !["won", "lost"].includes(opportunity.stage),
  );
}

function ensureOpportunity({
  store,
  contact,
  organization,
  subject,
  source,
  classification,
}: {
  store: PortalStore;
  contact: CrmContact;
  organization?: Organization;
  subject: string;
  source: string;
  classification: CrmInteraction["classification"];
}) {
  if (!["lead", "sales", "customer"].includes(classification)) return undefined;
  const existing = findOpenOpportunity(store, contact.id);
  if (existing) return existing;

  const timestamp = now();
  const opportunity: CrmOpportunity = {
    id: id("crm_opp"),
    organizationId: organization?.id,
    contactId: contact.id,
    title: subject || `Neue Chance: ${contact.name}`,
    stage: classification === "customer" ? "qualified" : "new_lead",
    currency: "EUR",
    probability: classification === "customer" ? 45 : 20,
    source,
    nextStep: "Antwort pruefen, Bedarf qualifizieren und naechsten Termin planen.",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.crmOpportunities.push(opportunity);
  return opportunity;
}

function fallbackTriage(body: string): AiTriage {
  const lower = body.toLowerCase();
  const classification: CrmInteraction["classification"] =
    lower.includes("rechnung") || lower.includes("invoice")
      ? "billing"
      : lower.includes("angebot") ||
          lower.includes("projekt") ||
          lower.includes("beratung") ||
          lower.includes("automation")
        ? "sales"
        : "other";
  const urgency: CrmInteraction["urgency"] =
    lower.includes("dringend") || lower.includes("urgent") ? "high" : "normal";

  return {
    urgency,
    classification,
    sentiment: "neutral",
    aiSummary: preview(body, 180) || "Neue Nachricht ohne Textinhalt.",
    replyDrafts: [
      {
        tone: "warm",
        body:
          "Danke fuer die Nachricht. Ich schaue mir das an und melde mich mit dem naechsten sinnvollen Schritt.",
      },
      {
        tone: "direct",
        body:
          "Danke. Ich pruefe die Details und gebe dir kurzfristig eine klare Rueckmeldung.",
      },
    ],
    nextTask:
      classification === "sales"
        ? "Lead pruefen und passenden naechsten Schritt festlegen"
        : "Nachricht pruefen und beantworten",
  };
}

async function triageWithGemini({
  subject,
  body,
  from,
}: {
  subject: string;
  body: string;
  from: string;
}): Promise<AiTriage> {
  const fallback = fallbackTriage(`${subject}\n\n${body}`);
  const result = await requestExternalAiInsight({
    provider: "gemini",
    system:
      "Du triagierst CRM-Nachrichten fuer Assad Dar. Gib nur gueltiges JSON zurueck. Keine Markdown-Erklaerung.",
    prompt: JSON.stringify({
      instruction:
        "Klassifiziere die Nachricht, fasse sie knapp zusammen, schlage eine Follow-up-Aufgabe vor und erstelle 2 kurze Antwortentwuerfe auf Deutsch. Automatisches Senden ist nicht erlaubt.",
      schema: {
        urgency: "low|normal|high",
        classification: "lead|customer|support|billing|sales|other",
        sentiment: "positive|neutral|negative",
        aiSummary: "maximal 2 Saetze",
        nextTask: "kurze Aufgabe",
        replyDrafts: [
          { tone: "warm|direct|follow_up", body: "Antworttext" },
        ],
      },
      from,
      subject,
      body: body.slice(0, 6000),
    }),
  });

  if (result.status !== "ok") return fallback;
  const parsed = safeJsonObject(result.text);
  if (!parsed) return fallback;

  const urgency = ["low", "normal", "high"].includes(clean(parsed.urgency))
    ? clean(parsed.urgency) as CrmInteraction["urgency"]
    : fallback.urgency;
  const classification = [
    "lead",
    "customer",
    "support",
    "billing",
    "sales",
    "other",
  ].includes(clean(parsed.classification))
    ? clean(parsed.classification) as CrmInteraction["classification"]
    : fallback.classification;
  const sentiment = ["positive", "neutral", "negative"].includes(clean(parsed.sentiment))
    ? clean(parsed.sentiment) as CrmInteraction["sentiment"]
    : fallback.sentiment;
  const replyDrafts = Array.isArray(parsed.replyDrafts)
      ? parsed.replyDrafts
          .map((draft) => {
            const value = draft as Record<string, unknown>;
            const tone = clean(value.tone);
            return {
              tone: (["direct", "warm", "follow_up"].includes(tone)
                ? tone
                : "warm") as CrmEmailDraft["tone"],
              body: clean(value.body),
            };
          })
          .filter((draft) => draft.body)
          .slice(0, 3)
      : fallback.replyDrafts;

  return {
    urgency,
    classification,
    sentiment,
    aiSummary: clean(parsed.aiSummary) || fallback.aiSummary,
    nextTask: clean(parsed.nextTask) || fallback.nextTask,
    replyDrafts: replyDrafts.length ? replyDrafts : fallback.replyDrafts,
  };
}

export async function ingestInboundEmail(
  store: PortalStore,
  input: InboundEmailInput,
) {
  if (
    input.providerMessageId &&
    store.crmInteractions.some(
      (interaction) => interaction.providerMessageId === input.providerMessageId,
    )
  ) {
    return null;
  }

  const email = normalizeEmail(input.from);
  const body = input.text || stripHtml(input.html || "");
  const timestamp = input.createdAt || now();
  const source = input.source || "Resend inbound";
  const organization = findOrCreateOrganization(store, email, source);
  const contact = findOrCreateContact(store, input, organization);
  const triage = await triageWithGemini({
    subject: input.subject,
    body,
    from: input.from,
  });
  const opportunity = ensureOpportunity({
    store,
    contact,
    organization,
    subject: input.subject,
    source,
    classification: triage.classification,
  });

  const interaction: CrmInteraction = {
    id: id("crm_interaction"),
    contactId: contact.id,
    organizationId: organization?.id,
    opportunityId: opportunity?.id,
    channel: "email",
    direction: "inbound",
    subject: input.subject || "(ohne Betreff)",
    bodyPreview: preview(body || input.subject),
    body,
    from: input.from,
    to: input.to,
    provider: "resend",
    providerMessageId: input.providerMessageId,
    urgency: triage.urgency,
    classification: triage.classification,
    sentiment: triage.sentiment,
    aiSummary: triage.aiSummary,
    createdAt: timestamp,
  };
  store.crmInteractions.push(interaction);

  for (const draft of triage.replyDrafts.slice(0, 3)) {
    store.crmEmailDrafts.push({
      id: id("crm_draft"),
      interactionId: interaction.id,
      contactId: contact.id,
      channel: "email",
      subject: input.subject.startsWith("Re:") ? input.subject : `Re: ${input.subject}`,
      body: draft.body,
      tone: draft.tone,
      status: "draft",
      createdAt: now(),
    });
  }

  if (triage.nextTask) {
    const due = new Date();
    due.setDate(due.getDate() + (triage.urgency === "high" ? 0 : 1));
    const task: CrmTask = {
      id: id("crm_task"),
      contactId: contact.id,
      opportunityId: opportunity?.id,
      title: triage.nextTask,
      status: "todo",
      dueDate: due.toISOString().slice(0, 10),
      priority: triage.urgency === "high" ? "high" : "normal",
      source,
      createdAt: now(),
    };
    store.crmTasks.push(task);
  }

  return interaction;
}

export async function notifyAdminAboutInteraction(
  store: PortalStore,
  interaction: CrmInteraction,
  locale = "de",
) {
  const contact = interaction.contactId
    ? store.crmContacts.find((entry) => entry.id === interaction.contactId)
    : undefined;
  const url = `${appUrl()}/${locale}/portal/admin/communications?interaction=${encodeURIComponent(
    interaction.id,
  )}`;
  const summary = [
    `Neue CRM-Nachricht (${interaction.channel})`,
    `Von: ${contact?.name || interaction.from}`,
    `Betreff: ${interaction.subject}`,
    interaction.aiSummary ? `Kurz: ${interaction.aiSummary}` : "",
    `Oeffnen: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");

  const telegram = await sendTelegramAdminAlert({
    text: summary,
    replyMarkup: {
      inline_keyboard: [
        ...store.crmEmailDrafts
          .filter(
            (draft) =>
              draft.interactionId === interaction.id && draft.status === "draft",
          )
          .slice(0, 3)
          .map((draft, index) => [
            {
              text: `Send Reply ${index + 1}`,
              callback_data: `crm_send:${draft.id}`,
            },
          ]),
        [
          {
            text: "Mark done",
            callback_data: `crm_done:${interaction.id}`,
          },
        ],
        [
          {
            text: "CRM oeffnen",
            url,
          },
        ],
      ],
    },
  });
  const whatsapp = await sendWhatsAppAdminAlert({ text: summary });
  const createdAt = now();
  const events: CrmNotificationEvent[] = [
    {
      id: id("crm_notify"),
      interactionId: interaction.id,
      channel: "telegram",
      recipient: "admin",
      status: telegram.status,
      summary,
      error: telegram.error,
      createdAt,
    },
    {
      id: id("crm_notify"),
      interactionId: interaction.id,
      channel: "whatsapp",
      recipient: "admin",
      status: whatsapp.status,
      summary,
      error: whatsapp.error,
      createdAt,
    },
  ];
  store.crmNotificationEvents.push(...events);
  return events;
}

export function buildCrmDashboard(store: PortalStore) {
  const openTasks = store.crmTasks.filter((task) => task.status !== "done");
  const openOpportunities = store.crmOpportunities.filter(
    (opportunity) => !["won", "lost"].includes(opportunity.stage),
  );
  const unhandled = store.crmInteractions.filter((entry) => !entry.handledAt);
  const drafts = store.crmEmailDrafts.filter((draft) => draft.status === "draft");

  return {
    stats: {
      contacts: store.crmContacts.length,
      openOpportunities: openOpportunities.length,
      unhandled: unhandled.length,
      drafts: drafts.length,
      openTasks: openTasks.length,
    },
    interactions: [...store.crmInteractions].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    contactsById: new Map(store.crmContacts.map((contact) => [contact.id, contact])),
    opportunitiesById: new Map(
      store.crmOpportunities.map((opportunity) => [opportunity.id, opportunity]),
    ),
    draftsByInteraction: store.crmEmailDrafts.reduce((map, draft) => {
      const existing = map.get(draft.interactionId) ?? [];
      existing.push(draft);
      map.set(draft.interactionId, existing);
      return map;
    }, new Map<string, CrmEmailDraft[]>()),
    openTasks,
    openOpportunities,
    notifications: [...store.crmNotificationEvents].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
  };
}

export function createManualCrmInteraction({
  store,
  channel,
  subject,
  body,
  contactId,
}: {
  store: PortalStore;
  channel: CrmChannel;
  subject: string;
  body: string;
  contactId?: string;
}) {
  const contact = contactId
    ? store.crmContacts.find((entry) => entry.id === contactId)
    : undefined;
  const timestamp = now();
  const interaction: CrmInteraction = {
    id: id("crm_interaction"),
    contactId: contact?.id,
    organizationId: contact?.organizationId,
    channel,
    direction: "internal",
    subject,
    bodyPreview: preview(body),
    body,
    from: "Assad Dar",
    to: contact?.email ? [contact.email] : [],
    provider: "manual",
    urgency: "normal",
    classification: "other",
    sentiment: "neutral",
    createdAt: timestamp,
  };
  store.crmInteractions.push(interaction);
  return interaction;
}

export async function sendCrmEmailDraft(
  store: PortalStore,
  draftId: string,
) {
  const draft = store.crmEmailDrafts.find((entry) => entry.id === draftId);
  if (!draft || draft.status !== "draft") return { ok: false, reason: "draft" };
  const interaction = store.crmInteractions.find(
    (entry) => entry.id === draft.interactionId,
  );
  const contact = draft.contactId
    ? store.crmContacts.find((entry) => entry.id === draft.contactId)
    : undefined;
  const to = contact?.email || normalizeEmail(interaction?.from || "");
  const from = crmFromEmail();
  const key = process.env.RESEND_API_KEY;

  if (!key || !from || !to) return { ok: false, reason: "config" };
  if (contact?.consent === "unsubscribed") return { ok: false, reason: "consent" };

  const resend = new Resend(key);
  const result = await resend.emails.send({
    from,
    to: [to],
    subject: draft.subject,
    text: draft.body,
  });
  if (result.error) return { ok: false, reason: "resend" };

  const timestamp = now();
  draft.status = "sent";
  draft.sentAt = timestamp;
  draft.providerMessageId = result.data?.id;
  if (interaction) {
    interaction.handledAt = interaction.handledAt || timestamp;
  }
  store.crmInteractions.push({
    id: id("crm_interaction"),
    contactId: contact?.id,
    organizationId: contact?.organizationId,
    opportunityId: interaction?.opportunityId,
    channel: draft.channel,
    direction: "outbound",
    subject: draft.subject,
    bodyPreview: preview(draft.body),
    body: draft.body,
    from,
    to: [to],
    provider: "resend",
    providerMessageId: result.data?.id,
    urgency: "normal",
    classification: interaction?.classification || "other",
    sentiment: "neutral",
    createdAt: timestamp,
  });

  return { ok: true, reason: "sent" };
}
