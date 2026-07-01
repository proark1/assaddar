import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeRenderedHtml } from "../src/lib/markdown";
import { buildExternalAiScanPrompt } from "../src/lib/portal/ai-scan";
import { parseContactForm } from "../src/lib/portal/contact-validation";
import { notifyAdminAboutInteraction } from "../src/lib/portal/crm";
import { loginFailureRateLimitKey } from "../src/lib/portal/login-attempts";
import { clientIpFromHeaders } from "../src/lib/portal/rate-limit";
import { externalAiIdentifier, redactForExternalAi } from "../src/lib/portal/privacy";
import { trustedRequestOrigin } from "../src/lib/portal/security";
import type { PortalStore, ProjectBundle } from "../src/lib/portal/types";
import { readPortalUpload } from "../src/lib/portal/uploads";

function headers(values: Record<string, string>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

test("sanitizeRenderedHtml removes scripts and unsafe links", () => {
  const html = sanitizeRenderedHtml(
    '<h2 id="safe">Title</h2><script>alert(1)</script><a href="javascript:alert(1)">bad</a><a href="/de">ok</a>',
  );

  assert.match(html, /<h2 id="safe">Title<\/h2>/);
  assert.doesNotMatch(html, /script/);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /href="\/de"/);
});

test("clientIpFromHeaders ignores malformed forwarded values", () => {
  assert.equal(
    clientIpFromHeaders(headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })),
    "203.0.113.7",
  );
  assert.equal(
    clientIpFromHeaders(headers({ "x-forwarded-for": "not-an-ip" })),
    "unknown",
  );
});

test("login failure limiter uses isolated normalized keys", () => {
  assert.equal(
    loginFailureRateLimitKey(
      headers({ "x-forwarded-for": "203.0.113.7" }),
      " Assad.Dar@Gmail.Com ",
    ),
    "login-failed:203.0.113.7:assad.dar@gmail.com",
  );
});

test("external AI helpers redact direct identifiers", () => {
  const redacted = redactForExternalAi(
    "Email max@example.com, phone +49 170 1234567 and https://example.com",
  );

  assert.equal(
    redacted,
    "Email [redacted-email], phone [redacted-phone] and [redacted-url]",
  );
  assert.equal(externalAiIdentifier("ACME GmbH"), "Customer");
});

test("external AI scan prompt uses redacted customer context", () => {
  const bundle = {
    project: {
      id: "project_1",
      organizationId: "org_1",
      name: "ACME Secret Rollout",
      summary: "",
      status: "analysis",
      asdarStage: "analyse",
      health: "green",
      nextStep: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    organization: {
      id: "org_1",
      name: "ACME GmbH",
      industry: "B2B services",
      createdAt: new Date().toISOString(),
    },
    members: [],
    customerUsers: [],
    intelligence: {
      projectId: "project_1",
      companyContext: "Write to max@example.com at +49 170 1234567",
      stakeholders: "",
      issues: "See https://example.com/private",
      goals: "",
      currentTools: "",
      dataSituation: "",
      constraints: "",
      opportunities: "",
      internalNotes: "",
      updatedAt: new Date().toISOString(),
    },
    updates: [],
    tasks: [],
    milestones: [],
    files: [],
    invoices: [],
    aiInsights: [],
  } satisfies ProjectBundle;

  const prompt = buildExternalAiScanPrompt(bundle);
  assert.doesNotMatch(prompt, /ACME GmbH|ACME Secret|max@example\.com|170 1234567|example\.com\/private/);
  assert.match(prompt, /Customer/);
  assert.match(prompt, /\[redacted-email\]/);
});

test("trustedRequestOrigin rejects cross-site browser posts", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAppUrl = process.env.APP_URL;
  const writableEnv = process.env as Record<string, string | undefined>;
  writableEnv.NODE_ENV = "production";
  process.env.APP_URL = "https://assad-dar.de";

  assert.equal(
    trustedRequestOrigin(
      headers({
        origin: "https://assad-dar.de",
        host: "assad-dar.de",
        "x-forwarded-proto": "https",
      }),
    ),
    true,
  );
  assert.equal(
    trustedRequestOrigin(
      headers({
        origin: "https://evil.example",
        host: "assad-dar.de",
        "x-forwarded-proto": "https",
      }),
    ),
    false,
  );

  writableEnv.NODE_ENV = originalNodeEnv;
  if (originalAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = originalAppUrl;
});

test("parseContactForm rejects invalid and overlong contact input", () => {
  const valid = new FormData();
  valid.set("name", "Assad");
  valid.set("email", "assad@example.com");
  valid.set("message", "Hello");
  valid.set("leadContext", "x".repeat(5500));
  assert.equal(parseContactForm(valid).ok, true);

  const invalid = new FormData();
  invalid.set("name", "Assad");
  invalid.set("email", "not-an-email");
  invalid.set("message", "Hello");
  assert.equal(parseContactForm(invalid).ok, false);

  const overlong = new FormData();
  overlong.set("name", "Assad");
  overlong.set("email", "assad@example.com");
  overlong.set("message", "x".repeat(4001));
  assert.equal(parseContactForm(overlong).ok, false);
});

test("CRM admin alerts include full ASDAR check details", async () => {
  const originalTelegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalTelegramChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const originalWhatsAppToken = process.env.WHATSAPP_BUSINESS_TOKEN;
  const originalWhatsAppPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const originalWhatsAppAdminPhone = process.env.WHATSAPP_ADMIN_PHONE;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_ADMIN_CHAT_ID;
  delete process.env.WHATSAPP_BUSINESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_ADMIN_PHONE;

  try {
    const createdAt = new Date().toISOString();
    const store: PortalStore = {
      users: [],
      organizations: [],
      projects: [],
      projectMembers: [],
      projectIntelligence: [],
      updates: [],
      tasks: [],
      milestones: [],
      files: [],
      invoices: [],
      paymentEvents: [],
      aiInsights: [],
      authTokens: [],
      templateOverrides: [],
      rateLimitBuckets: [],
      crmContacts: [
        {
          id: "contact_asdar",
          name: "ASDAR Lead",
          email: "lead@example.com",
          source: "Website",
          lifecycle: "lead",
          consent: "transactional",
          tags: [],
          createdAt,
          updatedAt: createdAt,
        },
      ],
      crmOpportunities: [],
      crmInteractions: [],
      crmTasks: [],
      crmEmailDrafts: [],
      crmNotificationEvents: [],
    };
    const interaction = {
      id: "interaction_asdar",
      contactId: "contact_asdar",
      channel: "website",
      direction: "inbound",
      subject: "Website Anfrage: ASDAR Check",
      bodyPreview: "ASDAR Potenzial-Check Score 60/100",
      body: [
        "ASDAR Potenzial-Check",
        "Score: 60/100",
        "Alle Antworten:",
        "1. Prozessklarheit: 2/5 (Kaum)",
        "2. Daten & Dokumente: 4/5 (Ueberwiegend)",
        "Zeitwert-Annahmen",
        "Manuelle Stunden pro Person/Woche: 5",
      ].join("\n"),
      from: "Lead <lead@example.com>",
      to: ["kontakt@assad-dar.de"],
      provider: "website",
      urgency: "normal",
      classification: "lead",
      sentiment: "positive",
      aiSummary: "ASDAR Check Lead.",
      createdAt,
    } satisfies PortalStore["crmInteractions"][number];
    store.crmInteractions.push(interaction);

    const events = await notifyAdminAboutInteraction(store, interaction);

    assert.equal(events.length, 2);
    assert.match(events[0].summary, /Check-Details:/);
    assert.match(events[0].summary, /Prozessklarheit: 2\/5/);
    assert.match(events[0].summary, /Manuelle Stunden pro Person\/Woche: 5/);
  } finally {
    if (originalTelegramToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalTelegramToken;
    if (originalTelegramChat === undefined) delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    else process.env.TELEGRAM_ADMIN_CHAT_ID = originalTelegramChat;
    if (originalWhatsAppToken === undefined) delete process.env.WHATSAPP_BUSINESS_TOKEN;
    else process.env.WHATSAPP_BUSINESS_TOKEN = originalWhatsAppToken;
    if (originalWhatsAppPhoneId === undefined) delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    else process.env.WHATSAPP_PHONE_NUMBER_ID = originalWhatsAppPhoneId;
    if (originalWhatsAppAdminPhone === undefined) delete process.env.WHATSAPP_ADMIN_PHONE;
    else process.env.WHATSAPP_ADMIN_PHONE = originalWhatsAppAdminPhone;
  }
});

test("CRM admin alerts include next task and draft context", async () => {
  const originalTelegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalTelegramChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const originalWhatsAppToken = process.env.WHATSAPP_BUSINESS_TOKEN;
  const originalWhatsAppPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const originalWhatsAppAdminPhone = process.env.WHATSAPP_ADMIN_PHONE;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_ADMIN_CHAT_ID;
  delete process.env.WHATSAPP_BUSINESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_ADMIN_PHONE;

  try {
    const createdAt = new Date().toISOString();
    const store: PortalStore = {
      users: [],
      organizations: [],
      projects: [],
      projectMembers: [],
      projectIntelligence: [],
      updates: [],
      tasks: [],
      milestones: [],
      files: [],
      invoices: [],
      paymentEvents: [],
      aiInsights: [],
      authTokens: [],
      templateOverrides: [],
      rateLimitBuckets: [],
      crmContacts: [
        {
          id: "contact_1",
          name: "Max Anfrage",
          email: "max@example.com",
          source: "Website",
          lifecycle: "lead",
          consent: "transactional",
          tags: [],
          createdAt,
          updatedAt: createdAt,
        },
      ],
      crmOpportunities: [],
      crmInteractions: [],
      crmTasks: [
        {
          id: "task_1",
          contactId: "contact_1",
          title: "Erstgespraech vorbereiten",
          status: "todo",
          priority: "high",
          source: "CRM automation",
          createdAt,
        },
      ],
      crmEmailDrafts: [
        {
          id: "draft_1",
          interactionId: "interaction_1",
          contactId: "contact_1",
          channel: "email",
          subject: "Re: Anfrage",
          body: "Danke fuer die Anfrage.",
          tone: "warm",
          status: "draft",
          createdAt,
        },
      ],
      crmNotificationEvents: [],
    };
    const interaction = {
      id: "interaction_1",
      contactId: "contact_1",
      channel: "email",
      direction: "inbound",
      subject: "Anfrage",
      bodyPreview: "Ich brauche Hilfe mit Automatisierung.",
      body: "Ich brauche Hilfe mit Automatisierung.",
      from: "Max <max@example.com>",
      to: ["kontakt@assad-dar.de"],
      provider: "resend",
      urgency: "high",
      classification: "sales",
      sentiment: "positive",
      aiSummary: "Interessierter Lead mit konkretem Automatisierungsbedarf.",
      createdAt,
    } satisfies PortalStore["crmInteractions"][number];
    store.crmInteractions.push(interaction);

    const events = await notifyAdminAboutInteraction(store, interaction);

    assert.equal(events.length, 2);
    assert.equal(store.crmNotificationEvents.length, 2);
    assert.equal(events[0].status, "skipped");
    assert.match(events[0].summary, /Idee: Erstgespraech vorbereiten/);
    assert.match(events[0].summary, /Gemini: 1 Antwortentwurf bereit/);
    assert.match(events[0].summary, /Prioritaet: high \/ sales/);
  } finally {
    if (originalTelegramToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalTelegramToken;
    if (originalTelegramChat === undefined) delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    else process.env.TELEGRAM_ADMIN_CHAT_ID = originalTelegramChat;
    if (originalWhatsAppToken === undefined) delete process.env.WHATSAPP_BUSINESS_TOKEN;
    else process.env.WHATSAPP_BUSINESS_TOKEN = originalWhatsAppToken;
    if (originalWhatsAppPhoneId === undefined) delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    else process.env.WHATSAPP_PHONE_NUMBER_ID = originalWhatsAppPhoneId;
    if (originalWhatsAppAdminPhone === undefined) delete process.env.WHATSAPP_ADMIN_PHONE;
    else process.env.WHATSAPP_ADMIN_PHONE = originalWhatsAppAdminPhone;
  }
});

test("readPortalUpload rejects unsupported or oversized files", async () => {
  const originalLimit = process.env.PORTAL_MAX_UPLOAD_BYTES;
  process.env.PORTAL_MAX_UPLOAD_BYTES = "4";

  await assert.rejects(
    () => readPortalUpload(new File(["hello"], "note.txt", { type: "text/plain" })),
    /UPLOAD_TOO_LARGE/,
  );

  process.env.PORTAL_MAX_UPLOAD_BYTES = "100";
  await assert.rejects(
    () =>
      readPortalUpload(
        new File(["<svg></svg>"], "icon.svg", { type: "image/svg+xml" }),
      ),
    /UPLOAD_TYPE/,
  );

  if (originalLimit === undefined) delete process.env.PORTAL_MAX_UPLOAD_BYTES;
  else process.env.PORTAL_MAX_UPLOAD_BYTES = originalLimit;
});

test("readPortalUpload rejects spoofed file signatures", async () => {
  const originalLimit = process.env.PORTAL_MAX_UPLOAD_BYTES;
  process.env.PORTAL_MAX_UPLOAD_BYTES = "100";

  await assert.rejects(
    () =>
      readPortalUpload(
        new File(["not a pdf"], "document.pdf", { type: "application/pdf" }),
      ),
    /UPLOAD_SIGNATURE/,
  );

  const validPdf = await readPortalUpload(
    new File(["%PDF-1.7\n"], "document.pdf", { type: "application/pdf" }),
  );
  assert.equal(validPdf.contentType, "application/pdf");

  if (originalLimit === undefined) delete process.env.PORTAL_MAX_UPLOAD_BYTES;
  else process.env.PORTAL_MAX_UPLOAD_BYTES = originalLimit;
});
