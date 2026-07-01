import { Resend } from "resend";
import { appUrl } from "./config";
import { requestExternalAiInsight } from "./ai-providers";
import {
  resolveIntegrationValues,
  resolveIntegrationValuesFromStore,
} from "./integration-settings";
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
  channel?: CrmChannel;
  provider?: CrmInteraction["provider"];
};

type IngestOptions = {
  deferAi?: boolean;
};

export type CrmInboxQuery = {
  q?: string;
  status?: "all" | "open" | "handled" | "needs_reply" | "draft_ready" | "high";
  channel?: "all" | CrmChannel;
  classification?: "all" | CrmInteraction["classification"];
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

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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

function notificationDetail(value: string, length = 3200) {
  const trimmed = value.trim();
  if (trimmed.length <= length) return trimmed;
  return `${trimmed.slice(0, length - 44).trimEnd()}\n...[gekuerzt, vollstaendig im CRM]`;
}

function isAsdarCheckInteraction(interaction: CrmInteraction) {
  const text = `${interaction.subject}\n${interaction.body || interaction.bodyPreview}`.toLowerCase();
  return text.includes("asdar potenzial-check") || text.includes("asdar potential check");
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

function pendingAiSummary() {
  return "AI triage queued. Summary and reply drafts will be generated by the CRM automation processor.";
}

function createDraftsForInteraction({
  store,
  interaction,
  triage,
  subject,
}: {
  store: PortalStore;
  interaction: CrmInteraction;
  triage: AiTriage;
  subject: string;
}) {
  for (const draft of triage.replyDrafts.slice(0, 3)) {
    store.crmEmailDrafts.push({
      id: id("crm_draft"),
      interactionId: interaction.id,
      contactId: interaction.contactId,
      channel: "email",
      subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
      body: draft.body,
      tone: draft.tone,
      status: "draft",
      createdAt: now(),
    });
  }
}

function createTriageTask({
  store,
  interaction,
  triage,
  source,
}: {
  store: PortalStore;
  interaction: CrmInteraction;
  triage: AiTriage;
  source: string;
}) {
  if (!triage.nextTask) return;
  store.crmTasks.push({
    id: id("crm_task"),
    contactId: interaction.contactId,
    opportunityId: interaction.opportunityId,
    projectId: interaction.projectId,
    title: triage.nextTask,
    status: "todo",
    dueDate: addDays(triage.urgency === "high" ? 0 : 1),
    priority: triage.urgency === "high" ? "high" : "normal",
    source,
    createdAt: now(),
  });
}

async function applyTriageToInteraction({
  store,
  interaction,
  source,
}: {
  store: PortalStore;
  interaction: CrmInteraction;
  source: string;
}) {
  const triage = await triageWithGemini({
    subject: interaction.subject,
    body: interaction.body || interaction.bodyPreview,
    from: interaction.from,
  });
  interaction.urgency = triage.urgency;
  interaction.classification = triage.classification;
  interaction.sentiment = triage.sentiment;
  interaction.aiSummary = triage.aiSummary;

  const contact = interaction.contactId
    ? store.crmContacts.find((entry) => entry.id === interaction.contactId)
    : undefined;
  const organization = interaction.organizationId
    ? store.organizations.find((entry) => entry.id === interaction.organizationId)
    : undefined;
  if (contact && !interaction.opportunityId) {
    const opportunity = ensureOpportunity({
      store,
      contact,
      organization,
      subject: interaction.subject,
      source,
      classification: triage.classification,
    });
    interaction.opportunityId = opportunity?.id;
  }

  if (
    !store.crmEmailDrafts.some((draft) => draft.interactionId === interaction.id)
  ) {
    createDraftsForInteraction({
      store,
      interaction,
      triage,
      subject: interaction.subject,
    });
  }
  if (
    !store.crmTasks.some(
      (task) =>
        task.contactId === interaction.contactId &&
        task.source === source &&
        task.createdAt >= interaction.createdAt,
    )
  ) {
    createTriageTask({ store, interaction, triage, source });
  }
}

export async function ingestInboundEmail(
  store: PortalStore,
  input: InboundEmailInput,
  options: IngestOptions = {},
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
  const triage = options.deferAi
    ? undefined
    : await triageWithGemini({
        subject: input.subject,
        body,
        from: input.from,
      });
  const opportunity = triage
    ? ensureOpportunity({
        store,
        contact,
        organization,
        subject: input.subject,
        source,
        classification: triage.classification,
      })
    : undefined;

  const interaction: CrmInteraction = {
    id: id("crm_interaction"),
    contactId: contact.id,
    organizationId: organization?.id,
    opportunityId: opportunity?.id,
    channel: input.channel ?? "email",
    direction: "inbound",
    subject: input.subject || "(ohne Betreff)",
    bodyPreview: preview(body || input.subject),
    body,
    from: input.from,
    to: input.to,
    provider: input.provider ?? "resend",
    providerMessageId: input.providerMessageId,
    urgency: triage?.urgency ?? "normal",
    classification: triage?.classification ?? "other",
    sentiment: triage?.sentiment ?? "neutral",
    aiSummary: triage?.aiSummary ?? pendingAiSummary(),
    createdAt: timestamp,
  };
  store.crmInteractions.push(interaction);

  if (triage) {
    createDraftsForInteraction({
      store,
      interaction,
      triage,
      subject: input.subject,
    });
    createTriageTask({ store, interaction, triage, source });
  } else if (options.deferAi) {
    store.crmTasks.push({
      id: id("crm_task"),
      contactId: contact.id,
      title: `CRM triage vorbereiten: ${input.subject || contact.name}`,
      status: "todo",
      dueDate: addDays(0),
      priority: "normal",
      source: `${source} queue`,
      createdAt: now(),
    });
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
  const drafts = store.crmEmailDrafts.filter(
    (draft) =>
      draft.interactionId === interaction.id && draft.status === "draft",
  );
  const nextTask = store.crmTasks
    .filter(
      (task) =>
        task.contactId === interaction.contactId &&
        task.createdAt >= interaction.createdAt &&
        task.status !== "done",
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const checkDetails = isAsdarCheckInteraction(interaction)
    ? notificationDetail(interaction.body || interaction.bodyPreview)
    : "";
  const summary = [
    `Neue CRM-Nachricht (${interaction.channel})`,
    `Von: ${contact?.name || interaction.from}`,
    `Betreff: ${interaction.subject}`,
    `Prioritaet: ${interaction.urgency} / ${interaction.classification}`,
    interaction.aiSummary ? `Kurz: ${interaction.aiSummary}` : "",
    checkDetails ? `Check-Details:\n${checkDetails}` : "",
    nextTask ? `Idee: ${nextTask.title}` : "",
    drafts.length
      ? `Gemini: ${drafts.length} Antwortentwurf${drafts.length === 1 ? "" : "e"} bereit.`
      : "",
    `Oeffnen: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");

  const telegram = await sendTelegramAdminAlert({
    text: summary,
    replyMarkup: {
      inline_keyboard: [
        ...drafts
          .slice(0, 3)
          .map((draft, index) => [
            {
              text: `Send Reply ${index + 1}`,
              callback_data: `crm_send:${draft.id}`,
            },
          ]),
        [
          {
            text: "Snooze 1d",
            callback_data: `crm_snooze:1:${interaction.id}`,
          },
        ],
        [
          {
            text: "Create task",
            callback_data: `crm_task:${interaction.id}`,
          },
          {
            text: "Done",
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

function draftStatus(
  store: PortalStore,
  interaction: CrmInteraction,
): "none" | "draft" | "sent" {
  const drafts = store.crmEmailDrafts.filter(
    (draft) => draft.interactionId === interaction.id,
  );
  if (drafts.some((draft) => draft.status === "draft")) return "draft";
  if (drafts.some((draft) => draft.status === "sent")) return "sent";
  return "none";
}

export function crmActionStatus(store: PortalStore, interaction: CrmInteraction) {
  const draft = draftStatus(store, interaction);
  if (interaction.urgency === "high" && !interaction.handledAt) return "high";
  if (!interaction.handledAt && draft === "draft") return "draft_ready";
  if (!interaction.handledAt) return "needs_reply";
  return "handled";
}

function matchesQuery({
  store,
  interaction,
  query,
}: {
  store: PortalStore;
  interaction: CrmInteraction;
  query: CrmInboxQuery;
}) {
  const status = query.status || "open";
  const actionStatus = crmActionStatus(store, interaction);
  if (status === "open" && interaction.handledAt) return false;
  if (status === "handled" && !interaction.handledAt) return false;
  if (status === "needs_reply" && actionStatus !== "needs_reply") return false;
  if (status === "draft_ready" && actionStatus !== "draft_ready") return false;
  if (status === "high" && interaction.urgency !== "high") return false;
  if (query.channel && query.channel !== "all" && interaction.channel !== query.channel) {
    return false;
  }
  if (
    query.classification &&
    query.classification !== "all" &&
    interaction.classification !== query.classification
  ) {
    return false;
  }
  const q = clean(query.q).toLowerCase();
  if (!q) return true;
  const contact = interaction.contactId
    ? store.crmContacts.find((entry) => entry.id === interaction.contactId)
    : undefined;
  return [
    interaction.subject,
    interaction.from,
    interaction.bodyPreview,
    interaction.body,
    interaction.aiSummary,
    contact?.name,
    contact?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function buildCrmDashboard(store: PortalStore, query: CrmInboxQuery = {}) {
  const openTasks = store.crmTasks.filter((task) => task.status !== "done");
  const openOpportunities = store.crmOpportunities.filter(
    (opportunity) => !["won", "lost"].includes(opportunity.stage),
  );
  const unhandled = store.crmInteractions.filter((entry) => !entry.handledAt);
  const drafts = store.crmEmailDrafts.filter((draft) => draft.status === "draft");
  const sortedInteractions = [...store.crmInteractions].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const filteredInteractions = sortedInteractions.filter((interaction) =>
    matchesQuery({ store, interaction, query }),
  );
  const pendingTriage = store.crmInteractions.filter(
    (interaction) =>
      interaction.direction === "inbound" &&
      interaction.aiSummary === pendingAiSummary() &&
      !store.crmEmailDrafts.some((draft) => draft.interactionId === interaction.id),
  );

  return {
    stats: {
      contacts: store.crmContacts.length,
      openOpportunities: openOpportunities.length,
      unhandled: unhandled.length,
      drafts: drafts.length,
      openTasks: openTasks.length,
      pendingTriage: pendingTriage.length,
    },
    interactions: filteredInteractions,
    allInteractions: sortedInteractions,
    actionBuckets: {
      high: sortedInteractions.filter(
        (interaction) => crmActionStatus(store, interaction) === "high",
      ),
      draftReady: sortedInteractions.filter(
        (interaction) => crmActionStatus(store, interaction) === "draft_ready",
      ),
      needsReply: sortedInteractions.filter(
        (interaction) => crmActionStatus(store, interaction) === "needs_reply",
      ),
      handled: sortedInteractions.filter(
        (interaction) => crmActionStatus(store, interaction) === "handled",
      ),
    },
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
    pendingTriage,
    notifications: [...store.crmNotificationEvents].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
  };
}

export function buildCrmContactTimeline(store: PortalStore, contactId?: string) {
  if (!contactId) return [];
  const interactions = store.crmInteractions
    .filter((interaction) => interaction.contactId === contactId)
    .map((interaction) => ({
      id: interaction.id,
      kind: "interaction" as const,
      title: interaction.subject,
      body: interaction.aiSummary || interaction.bodyPreview,
      date: interaction.createdAt,
      tone: interaction.direction,
    }));
  const tasks = store.crmTasks
    .filter((task) => task.contactId === contactId)
    .map((task) => ({
      id: task.id,
      kind: "task" as const,
      title: task.title,
      body: task.status,
      date: task.completedAt || task.createdAt,
      tone: task.priority,
    }));
  return [...interactions, ...tasks].sort((a, b) => b.date.localeCompare(a.date));
}

export async function buildCrmDiagnostics(store: PortalStore) {
  const latestInbound = store.crmInteractions.find(
    (interaction) => interaction.direction === "inbound",
  );
  const latestTelegram = store.crmNotificationEvents.find(
    (event) => event.channel === "telegram",
  );
  const latestWhatsApp = store.crmNotificationEvents.find(
    (event) => event.channel === "whatsapp",
  );
  const latestDraft = store.crmEmailDrafts[0];
  const {
    resend_api_key: resendKey,
    resend_webhook_secret: resendSecret,
    gemini_api_key: geminiKey,
    gemini_model: geminiModel,
  } = await resolveIntegrationValues([
    "resend_api_key",
    "resend_webhook_secret",
    "gemini_api_key",
    "gemini_model",
  ]);
  return {
    resend: {
      configured: Boolean(resendKey || resendSecret),
      lastEventAt: latestInbound?.createdAt,
      lastStatus: latestInbound ? "received" : "none",
    },
    gemini: {
      configured: Boolean(geminiKey && geminiModel),
      lastEventAt: latestDraft?.createdAt,
      lastStatus: latestDraft ? "drafted" : "none",
    },
    telegram: {
      configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID),
      lastEventAt: latestTelegram?.createdAt,
      lastStatus: latestTelegram?.status ?? "none",
    },
    whatsapp: {
      configured: Boolean(
        process.env.WHATSAPP_BUSINESS_TOKEN &&
          process.env.WHATSAPP_PHONE_NUMBER_ID &&
          process.env.WHATSAPP_ADMIN_PHONE,
      ),
      lastEventAt: latestWhatsApp?.createdAt,
      lastStatus: latestWhatsApp?.status ?? "none",
    },
  };
}

export async function processCrmAutomationQueue({
  store,
  limit = 10,
  locale = "de",
}: {
  store: PortalStore;
  limit?: number;
  locale?: string;
}) {
  let triaged = 0;
  let notified = 0;
  const candidates = store.crmInteractions
    .filter(
      (interaction) =>
        interaction.direction === "inbound" &&
        interaction.aiSummary === pendingAiSummary(),
    )
    .slice(0, limit);

  for (const interaction of candidates) {
    await applyTriageToInteraction({
      store,
      interaction,
      source: "CRM automation",
    });
    triaged += 1;
    await notifyAdminAboutInteraction(store, interaction, locale);
    notified += 1;
  }

  return { triaged, notified };
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
  const {
    resend_api_key: key,
    crm_from_email: crmFrom,
    contact_from_email: contactFrom,
  } = resolveIntegrationValuesFromStore(store, [
    "resend_api_key",
    "crm_from_email",
    "contact_from_email",
  ]);
  const from = crmFrom || contactFrom;

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

export function updateCrmDraft({
  store,
  draftId,
  subject,
  body,
  tone,
}: {
  store: PortalStore;
  draftId: string;
  subject: string;
  body: string;
  tone: CrmEmailDraft["tone"];
}) {
  const draft = store.crmEmailDrafts.find((entry) => entry.id === draftId);
  if (!draft || draft.status !== "draft") return false;
  draft.subject = subject || draft.subject;
  draft.body = body || draft.body;
  draft.tone = tone;
  return true;
}

export function snoozeCrmInteraction({
  store,
  interactionId,
  days,
}: {
  store: PortalStore;
  interactionId: string;
  days: number;
}) {
  const interaction = store.crmInteractions.find((entry) => entry.id === interactionId);
  if (!interaction) return false;
  const date = addDays(days);
  interaction.handledAt = interaction.handledAt || now();
  store.crmTasks.push({
    id: id("crm_task"),
    contactId: interaction.contactId,
    opportunityId: interaction.opportunityId,
    projectId: interaction.projectId,
    title: `Follow-up: ${interaction.subject}`,
    status: "todo",
    dueDate: date,
    priority: interaction.urgency === "high" ? "high" : "normal",
    source: `Snooze ${days}d`,
    createdAt: now(),
  });
  return true;
}

export function createCrmTaskFromInteraction({
  store,
  interactionId,
  title,
  dueDate,
}: {
  store: PortalStore;
  interactionId: string;
  title?: string;
  dueDate?: string;
}) {
  const interaction = store.crmInteractions.find((entry) => entry.id === interactionId);
  if (!interaction) return false;
  store.crmTasks.push({
    id: id("crm_task"),
    contactId: interaction.contactId,
    opportunityId: interaction.opportunityId,
    projectId: interaction.projectId,
    title: title || `Antwort vorbereiten: ${interaction.subject}`,
    status: "todo",
    dueDate: dueDate || addDays(1),
    priority: interaction.urgency === "high" ? "high" : "normal",
    source: "Manual CRM action",
    createdAt: now(),
  });
  return true;
}
