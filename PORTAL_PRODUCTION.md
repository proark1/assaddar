# Assad Dar Portal Production Setup

The portal runs in two data modes:

- `PORTAL_DATA_BACKEND=local`: development/demo JSON data under `.portal-data`
- `PORTAL_DATA_BACKEND=postgres`: Supabase/Postgres tables from `supabase/migrations`

## Required Production Environment

Set these before using the portal with real customers:

```env
AUTH_SECRET=
APP_URL=https://assad-dar.de
PORTAL_DATA_BACKEND=postgres
DATABASE_URL=
RESEND_API_KEY=
CONTACT_FROM_EMAIL="ASSADDAR Website <hello@assad-dar.de>"
PORTAL_FILE_STORAGE=supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=portal-files
CRON_SECRET=
PORTAL_MAX_UPLOAD_BYTES=12582912
BLOG_HERO_MAX_UPLOAD_BYTES=5242880
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 48
```

Validate the environment before launch:

```bash
pnpm check:production
```

At runtime, production portal routes fail closed if the core portal
configuration is incomplete instead of falling back to local JSON data.

## Database

Create a Supabase project, copy the pooled Postgres connection string into
`DATABASE_URL`, then run:

```bash
psql "$DATABASE_URL" -f supabase/migrations/001_portal_foundation.sql
```

The current app keeps the local demo backend as a fallback. Once
`PORTAL_DATA_BACKEND=postgres` is set, the existing portal store API reads and
writes through Postgres instead.

## Email Verification And Password Reset

Set:

```env
AUTH_REQUIRE_EMAIL_VERIFICATION=true
RESEND_API_KEY=
CONTACT_FROM_EMAIL="ASSADDAR Portal <portal@assad-dar.de>"
```

New customer registrations receive an email verification token. Password reset
links are available from `/de/forgot-password` and `/en/forgot-password`.

## File Storage

Local development stores uploads under `.portal-data/uploads`. For Supabase
Storage, create a private bucket and set:

```env
PORTAL_FILE_STORAGE=supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=portal-files
```

The app stores only metadata in Postgres. File bytes go to the configured
storage provider.

Uploads are validated before being read into memory. Keep
`PORTAL_MAX_UPLOAD_BYTES` and `BLOG_HERO_MAX_UPLOAD_BYTES` intentionally small
for the deployment tier; raise them only when the serverless memory budget can
handle the worst-case concurrent uploads.

## Stripe

Set:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

When an invoice is created without a manual payment URL, the app creates a
Stripe Checkout Session and stores its URL. Configure this webhook endpoint in
Stripe:

```text
https://assad-dar.de/api/stripe/webhook
```

The webhook marks invoices as paid on `checkout.session.completed`.

## Audit And Backups

The portal records customer-visible and internal project events in
`portal_project_updates`; internal entries are used as the operational audit
trail for payments, automation, leads, and admin actions that publish project
state. Keep internal updates private and avoid deleting them during normal
project cleanup.

Before using the portal with real customer data, enable:

- Supabase automated Postgres backups with point-in-time recovery.
- Supabase Storage object backups or replication for the private
  `portal-files` bucket.
- Stripe webhook event retention in Stripe for payment reconciliation.
- A monthly restore drill: restore a recent database backup into a staging
  project and verify one customer project, file metadata, and invoice status.

Keep `CRON_SECRET` configured for reminder endpoints and rotate
`AUTH_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and provider API keys after any
suspected exposure.

## External AI Providers

The admin project page includes a manual Multi-Provider Scan. Configure any
provider you want to use:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
GROK_API_KEY=
GROK_MODEL=
GROK_API_BASE=https://api.x.ai/v1
EXTERNAL_AI_SEND_IDENTIFIERS=false
```

Scan results are saved as internal `aiInsights` on the project and are not
visible to customers unless Assad publishes a separate customer update.
By default, company/project names are replaced before external provider calls;
set `EXTERNAL_AI_SEND_IDENTIFIERS=true` only when the customer and data
processing setup permit it.
