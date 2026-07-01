# QA Checklist

## Automated Checks

Run before merging or deploying:

```bash
pnpm typecheck
pnpm test:security
pnpm check:links
pnpm check:migrations
pnpm build
pnpm test:portal
pnpm audit --audit-level moderate
```

If a dev server is already running:

```bash
PORTAL_SMOKE_BASE_URL=http://127.0.0.1:3000 pnpm test:portal
```

## Public Website

- `/de` and `/en` render without console errors.
- Desktop and mobile navigation open and close correctly.
- Hero CTAs are visible and point to the correct routes.
- Market stats show source/date context.
- Contact form validates required fields and shows the privacy note.
- Contact form has a working fallback email when email is not configured.
- Blog list and blog detail pages render hero images or fallback figures.
- Legal pages are reachable from the footer.

## Customer Portal

- Unauthenticated `/de/portal` redirects to `/de/login`.
- Login succeeds for an expected test user and lands on `/de/portal`.
- Login failures show a generic error and do not disclose account existence.
- Mobile portal navigation stays horizontally scrollable without page overflow.
- Customer dashboard shows the next required action first.
- Project page defaults to action view when intake/tasks/approvals are open.
- Questionnaire labels focus their matching textareas.
- Files route denies unauthenticated users and users without project access.
- Customer cannot download internal files.
- Invoice statuses use customer-safe labels.

## Admin Portal

- Admin dashboard loads command center, automation, leads, inbox, timeline, and
  project filters.
- Admin project creation validates required company data.
- Creating a project with a website creates a queued Website Intelligence run
  without blocking project creation.
- Admin project guidance can process the website crawl queue and then shows
  completed/failed crawl status plus source pages.
- Competitor/process research accepts competitor URLs and stores an internal
  Research Scan insight.
- Customer invite and assignment flows create internal audit updates.
- Publishing customer updates sends notification only when preference allows.
- Blog hero generation and compression require admin access.

## Security Regression Checks

- Cross-origin POSTs to login and server actions are rejected.
- Rate limits fail closed for auth/contact flows when the backing store fails.
- Spoofed uploads, unsupported uploads, empty uploads, and oversized uploads
  are rejected.
- Stripe webhook rejects missing/invalid signatures.
- Cron endpoint rejects missing `CRON_SECRET` in production.
- `/api/cron/website-crawls` processes queued crawls only with the cron secret
  in production.
