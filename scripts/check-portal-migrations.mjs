import { readFile } from "node:fs/promises";
import postgres from "postgres";

const migrationChecks = [
  {
    file: "supabase/migrations/001_portal_foundation.sql",
    patterns: ["session_version integer not null default 0"],
  },
  {
    file: "supabase/migrations/003_portal_security_rls.sql",
    patterns: [
      "alter table portal_users enable row level security",
      "create policy \"portal service role full access\"",
      "insert into storage.buckets",
    ],
  },
  {
    file: "supabase/migrations/005_security_hardening.sql",
    patterns: [
      "alter table blog_hero_images enable row level security",
      "blog hero service role full access",
    ],
  },
  {
    file: "supabase/migrations/006_payment_events_and_deploy_hardening.sql",
    patterns: [
      "create table if not exists portal_payment_events",
      "add column if not exists stripe_session_id",
      "alter table portal_payment_events enable row level security",
    ],
  },
  {
    file: "supabase/migrations/008_website_crawl_intelligence.sql",
    patterns: [
      "create table if not exists portal_website_crawl_runs",
      "create table if not exists portal_website_crawl_pages",
      "alter table portal_website_crawl_runs enable row level security",
    ],
  },
  {
    file: "supabase/migrations/009_website_crawl_queue_flags.sql",
    patterns: ["add column if not exists apply_to_intelligence"],
  },
];

const failures = [];

for (const check of migrationChecks) {
  let sql = "";
  try {
    sql = await readFile(check.file, "utf8");
  } catch {
    failures.push(`${check.file} is missing`);
    continue;
  }

  const normalized = sql.toLowerCase();
  for (const pattern of check.patterns) {
    if (!normalized.includes(pattern.toLowerCase())) {
      failures.push(`${check.file} is missing pattern: ${pattern}`);
    }
  }
}

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
if (databaseUrl) {
  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    ssl: process.env.PGSSLMODE === "disable" ? false : "require",
  });

  try {
    const rows = await sql`
      select table_name, column_name
      from information_schema.columns
      where table_schema = 'public'
        and (
          (table_name = 'portal_users' and column_name = 'session_version') or
          (table_name = 'portal_invoices' and column_name in (
            'stripe_session_id',
            'stripe_payment_intent_id',
            'paid_at'
          )) or
          (table_name = 'portal_payment_events') or
          (table_name = 'portal_website_crawl_runs' and column_name in (
            'id',
            'apply_to_intelligence'
          )) or
          (table_name = 'portal_website_crawl_pages')
        )
    `;
    const observed = new Set(rows.map((row) => `${row.table_name}.${row.column_name}`));
    for (const expected of [
      "portal_users.session_version",
      "portal_invoices.stripe_session_id",
      "portal_invoices.stripe_payment_intent_id",
      "portal_invoices.paid_at",
      "portal_payment_events.id",
      "portal_website_crawl_runs.id",
      "portal_website_crawl_runs.apply_to_intelligence",
      "portal_website_crawl_pages.id",
    ]) {
      if (!observed.has(expected)) failures.push(`database missing ${expected}`);
    }

    const rlsRows = await sql`
      select relname, relrowsecurity
      from pg_class
      where relname in (
        'portal_payment_events',
        'blog_hero_images',
        'portal_website_crawl_runs',
        'portal_website_crawl_pages'
      )
    `;
    for (const table of [
      "portal_payment_events",
      "blog_hero_images",
      "portal_website_crawl_runs",
      "portal_website_crawl_pages",
    ]) {
      const row = rlsRows.find((entry) => entry.relname === table);
      if (!row?.relrowsecurity) failures.push(`database RLS is not enabled for ${table}`);
    }
  } catch (error) {
    failures.push(`database migration check failed: ${error.message}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (failures.length > 0) {
  console.error("Portal migration check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  databaseUrl
    ? "Portal migration files and database schema passed."
    : "Portal migration files passed. Set DATABASE_URL to validate the live schema.",
);
