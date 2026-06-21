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
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 48
```

## Database

Create a Supabase project, copy the pooled Postgres connection string into
`DATABASE_URL`, then run:

```bash
psql "$DATABASE_URL" -f supabase/migrations/001_portal_foundation.sql
```

The current app keeps the local demo backend as a fallback. Once
`PORTAL_DATA_BACKEND=postgres` is set, the existing portal store API reads and
writes through Postgres instead.

## Still To Connect

The database foundation is ready. Remaining production integrations are:

- Supabase Storage/S3 file storage
- audit logging and backup policy

## Email Verification And Password Reset

Set:

```env
AUTH_REQUIRE_EMAIL_VERIFICATION=true
RESEND_API_KEY=
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
```

Scan results are saved as internal `aiInsights` on the project and are not
visible to customers unless Assad publishes a separate customer update.
