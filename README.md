# Assad Dar Website And Portal

Next.js app for the public Assad Dar consulting website, blog, contact flow,
and the customer/admin portal.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Local JSON store for development under `.portal-data`
- Supabase/Postgres and Supabase Storage for production portal data/files
- Resend for email
- Stripe Checkout/webhooks for invoices

## Local Development

```bash
pnpm install
pnpm dev
```

The app normally runs on `http://localhost:3000`. If another Next dev server is
already running for this checkout, reuse that server instead of starting a
second one.

For authenticated portal QA with local JSON data and local file storage:

```bash
pnpm dev:portal
```

Useful checks:

```bash
pnpm typecheck
pnpm test:security
pnpm check:links
pnpm check:migrations
pnpm build
pnpm test:portal
```

`pnpm test:portal` can also run against an existing server:

```bash
PORTAL_SMOKE_BASE_URL=http://127.0.0.1:3000 pnpm test:portal
```

## Environment

Start from `.env.example`. The portal is safe for local demo data with:

```env
PORTAL_DATA_BACKEND=local
PORTAL_FILE_STORAGE=local
AUTH_SECRET=
```

Before using real customer data, follow `PORTAL_PRODUCTION.md` and run:

```bash
pnpm check:production
pnpm check:migrations
```

## Main Areas

- Public pages: `src/app/[locale]`
- Portal pages: `src/app/[locale]/portal`
- API routes: `src/app/api`
- Portal business logic: `src/lib/portal`
- Supabase migrations: `supabase/migrations`
- Operational scripts: `scripts`

## Security Notes

See `docs/security-and-operations.md` for the current threat model, deployed
controls, and remaining operational requirements.

## QA

See `docs/qa-checklist.md` for manual and automated checks before release.
