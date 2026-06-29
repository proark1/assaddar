import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeRenderedHtml } from "../src/lib/markdown";
import { clientIpFromHeaders } from "../src/lib/portal/rate-limit";
import { externalAiIdentifier, redactForExternalAi } from "../src/lib/portal/privacy";
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
