import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeRenderedHtml } from "../src/lib/markdown";
import { buildExternalAiScanPrompt } from "../src/lib/portal/ai-scan";
import { portalProductionConfigErrors } from "../src/lib/portal/config";
import { parseContactForm } from "../src/lib/portal/contact-validation";
import { notifyAdminAboutInteraction } from "../src/lib/portal/crm";
import { loginFailureRateLimitKey } from "../src/lib/portal/login-attempts";
import { clientIpFromHeaders } from "../src/lib/portal/rate-limit";
import { externalAiIdentifier, redactForExternalAi } from "../src/lib/portal/privacy";
import { trustedRequestOrigin } from "../src/lib/portal/security";
import type { PortalStore, ProjectBundle } from "../src/lib/portal/types";
import { readPortalUpload } from "../src/lib/portal/uploads";
import {
  buildWebsiteIntelligence,
  normalizeWebsiteUrl,
  type ScrapedWebsitePage,
} from "../src/lib/portal/website-scraper";

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
    websiteCrawlRuns: [],
    websiteCrawlPages: [],
  } satisfies ProjectBundle;

  const prompt = buildExternalAiScanPrompt(bundle);
  assert.doesNotMatch(prompt, /ACME GmbH|ACME Secret|max@example\.com|170 1234567|example\.com\/private/);
  assert.match(prompt, /Customer/);
  assert.match(prompt, /\[redacted-email\]/);
});

test("website intelligence normalizes URLs and builds ASDAR context", () => {
  assert.equal(
    normalizeWebsiteUrl("example.com/?utm_source=test#team"),
    "https://example.com/",
  );

  const crawledAt = new Date().toISOString();
  const pages: ScrapedWebsitePage[] = [
    {
      url: "https://example.com/",
      title: "ACME Automation Consulting",
      description: "AI automation for service teams.",
      pageType: "home",
      statusCode: 200,
      depth: 0,
      wordCount: 12,
      textExcerpt:
        "AI automation for service teams with contact forms, booking and customer portal.",
      links: [],
      signals: ["contact form or contact workflow", "appointment booking"],
      crawledAt,
    },
    {
      url: "https://example.com/services",
      title: "Services",
      description: "Workflow automation and reporting.",
      pageType: "services",
      statusCode: 200,
      depth: 1,
      wordCount: 8,
      textExcerpt: "Workflow automation and reporting.",
      links: [],
      signals: ["integration/API signal"],
      crawledAt,
    },
  ];

  const intelligence = buildWebsiteIntelligence("https://example.com/", pages);
  assert.match(intelligence.companyContext, /ACME Automation Consulting/);
  assert.match(intelligence.currentTools, /appointment booking/);
  assert.match(intelligence.opportunities, /lead-qualification/);
  assert.equal(intelligence.sourcePages.length, 2);
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

test("portal production readiness does not require CRM automation integrations", () => {
  const keys = [
    "NODE_ENV",
    "AUTH_SECRET",
    "NEXTAUTH_SECRET",
    "PORTAL_DATA_BACKEND",
    "DATABASE_URL",
    "POSTGRES_URL",
    "PORTAL_FILE_STORAGE",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_STORAGE_BUCKET",
    "RESEND_API_KEY",
    "CONTACT_FROM_EMAIL",
    "RESEND_WEBHOOK_SECRET",
    "GEMINI_API_KEY",
    "GEMINI_MODEL",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_ADMIN_CHAT_ID",
    "WHATSAPP_BUSINESS_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_ADMIN_PHONE",
  ] as const;
  const original = new Map(keys.map((key) => [key, process.env[key]]));
  const writableEnv = process.env as Record<string, string | undefined>;

  try {
    writableEnv.NODE_ENV = "production";
    process.env.AUTH_SECRET = "x".repeat(32);
    delete process.env.NEXTAUTH_SECRET;
    process.env.PORTAL_DATA_BACKEND = "postgres";
    process.env.DATABASE_URL = "postgres://example";
    delete process.env.POSTGRES_URL;
    process.env.PORTAL_FILE_STORAGE = "supabase";
    process.env.SUPABASE_URL = "https://supabase.example";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.SUPABASE_STORAGE_BUCKET = "portal-files";
    process.env.RESEND_API_KEY = "resend";
    process.env.CONTACT_FROM_EMAIL = "Assad Dar <portal@assad-dar.de>";
    delete process.env.RESEND_WEBHOOK_SECRET;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    delete process.env.WHATSAPP_BUSINESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_ADMIN_PHONE;

    assert.deepEqual(portalProductionConfigErrors(), []);
  } finally {
    for (const key of keys) {
      const value = original.get(key);
      if (value === undefined) delete writableEnv[key];
      else writableEnv[key] = value;
    }
  }
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
      websiteCrawlRuns: [],
      websiteCrawlPages: [],
      authTokens: [],
      templateOverrides: [],
      integrationSettings: [],
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
      websiteCrawlRuns: [],
      websiteCrawlPages: [],
      authTokens: [],
      templateOverrides: [],
      integrationSettings: [],
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
