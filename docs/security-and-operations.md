# Security And Operations

## Current Controls

- Sessions are signed, HTTP-only cookies with `sameSite=lax` and a server-side
  `sessionVersion` invalidation check.
- Server actions and JSON login reject untrusted browser origins.
- Login, registration, password reset, and contact forms are rate limited.
- Passwords use salted `scrypt` hashes.
- Email verification, password reset, and invite tokens are random raw tokens
  stored only as SHA-256 hashes.
- Customer files are served through authenticated API routes with project
  access checks, `private, no-store`, and `nosniff`.
- Uploads have size limits, MIME allowlists, safe filenames, and content
  signature checks for supported file classes.
- Stripe webhooks require a valid Stripe signature, deduplicate event IDs, and
  verify paid amount/currency before marking invoices paid.
- Production portal routes fail closed unless Postgres and Supabase Storage are
  configured.
- Supabase migrations enable RLS and expose portal tables/storage only to the
  service role.
- External AI scan prompts redact direct identifiers unless explicitly enabled.
- Website Intelligence crawls run as queued internal jobs, respect robots.txt
  and same-site crawl limits, and store source pages as admin-only evidence.

## Production Requirements

Before real customer data:

1. Use `PORTAL_DATA_BACKEND=postgres` and `PORTAL_FILE_STORAGE=supabase`.
2. Store files in a private Supabase Storage bucket.
3. Set a long random `AUTH_SECRET`; rotate after suspected exposure.
4. Set `CRON_SECRET`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and production
   `APP_URL=https://...`.
5. Configure Stripe webhook secrets if invoice payment links are enabled.
6. Enable Supabase backups and document one restore drill.
7. Keep `EXTERNAL_AI_SEND_IDENTIFIERS=false` unless the customer agreement and
   data-processing setup explicitly permit identifiers.
8. Run Supabase migrations through `010_project_task_priority_matrix.sql`.
9. Schedule `/api/cron/website-crawls` with `Authorization: Bearer $CRON_SECRET`.
   Vercel uses `vercel.json`; Railway needs a scheduler or monitor to call the
   endpoint.
10. Leave `WEBSITE_CRAWL_RENDERED_FALLBACK=false` unless the deployment has a
    working Chromium runtime and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Remaining Hardening Backlog

- Add malware scanning for uploads before customer-visible publication.
- Add archive inspection limits for ZIP/Office files: entry count, nested
  archive detection, total uncompressed size, and path traversal checks.
- Add an append-only security event table for failed login bursts, origin
  rejects, upload rejects, password resets, invite acceptance, and admin
  publishing actions.
- Add a small admin-facing audit view for security events and webhook outcomes.
- Add automated browser checks for public pages and the authenticated customer
  portal.
- Add dependency and secret scanning to CI.

## Incident Checklist

1. Rotate `AUTH_SECRET`, Supabase service role key, Stripe webhook secret, and
   provider API keys if exposure is suspected.
2. Invalidate active sessions by bumping `sessionVersion` for affected users.
3. Review `portal_payment_events`, internal audit updates, and server logs.
4. Disable external AI scans if data leakage is suspected.
5. Restore from backup only after identifying the last known-good point.
