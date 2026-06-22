alter table portal_project_files
  add column if not exists category text
    check (
      category is null or category in (
        'customer_upload',
        'consultant_deliverable',
        'proposal',
        'project_brief',
        'final_report',
        'invoice',
        'other'
      )
    ),
  add column if not exists approval_status text
    check (
      approval_status is null or approval_status in (
        'not_required',
        'pending',
        'approved'
      )
    ),
  add column if not exists approved_by text references portal_users(id),
  add column if not exists approved_at timestamptz;

create table if not exists portal_template_overrides (
  id text primary key,
  template_id text not null unique,
  label text not null,
  best_for text not null default '',
  kickoff_goal text not null default '',
  summary text not null default '',
  discovery_questions jsonb not null default '[]'::jsonb,
  quick_wins jsonb not null default '[]'::jsonb,
  automation_ideas jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  updated_by text not null references portal_users(id),
  updated_at timestamptz not null default now()
);

create table if not exists portal_rate_limits (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists portal_project_files_category_idx
  on portal_project_files(category);
create index if not exists portal_rate_limits_reset_at_idx
  on portal_rate_limits(reset_at);

alter table portal_template_overrides enable row level security;
alter table portal_rate_limits enable row level security;

drop policy if exists "portal service role full access" on portal_template_overrides;
drop policy if exists "portal service role full access" on portal_rate_limits;

create policy "portal service role full access"
  on portal_template_overrides for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_rate_limits for all to service_role using (true) with check (true);
