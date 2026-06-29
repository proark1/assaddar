import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeRenderedHtml } from "../src/lib/markdown";
import { buildExternalAiScanPrompt } from "../src/lib/portal/ai-scan";
import { parseContactForm } from "../src/lib/portal/contact-validation";
import { clientIpFromHeaders } from "../src/lib/portal/rate-limit";
import { externalAiIdentifier, redactForExternalAi } from "../src/lib/portal/privacy";
import { trustedRequestOrigin } from "../src/lib/portal/security";
import type { ProjectBundle } from "../src/lib/portal/types";
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
