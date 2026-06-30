create table if not exists crm_contacts (
  id text primary key,
  organization_id text references portal_organizations(id) on delete set null,
  name text not null,
  email text,
  phone text,
  telegram_chat_id text,
  whatsapp_phone text,
  source text not null default '',
  lifecycle text not null check (lifecycle in ('lead', 'prospect', 'customer', 'partner', 'archived')),
  consent text not null check (consent in ('unknown', 'transactional', 'marketing', 'unsubscribed')),
  tags jsonb not null default '[]'::jsonb,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists crm_opportunities (
  id text primary key,
  organization_id text references portal_organizations(id) on delete set null,
  contact_id text references crm_contacts(id) on delete set null,
  title text not null,
  stage text not null check (
    stage in (
      'new_lead',
      'qualified',
      'discovery_scheduled',
      'discovery_done',
      'proposal_needed',
      'proposal_sent',
      'negotiation',
      'won',
      'lost',
      'nurture'
    )
  ),
  value_cents integer,
  currency text not null check (currency in ('EUR', 'USD')),
  probability integer not null default 0,
  expected_close_date date,
  source text not null default '',
  next_step text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists crm_interactions (
  id text primary key,
  contact_id text references crm_contacts(id) on delete set null,
  organization_id text references portal_organizations(id) on delete set null,
  opportunity_id text references crm_opportunities(id) on delete set null,
  project_id text references portal_projects(id) on delete set null,
  channel text not null check (channel in ('email', 'whatsapp', 'telegram', 'website', 'portal', 'phone', 'meeting', 'note')),
  direction text not null check (direction in ('inbound', 'outbound', 'internal')),
  subject text not null default '',
  body_preview text not null default '',
  body text,
  from_value text not null default '',
  to_values jsonb not null default '[]'::jsonb,
  provider text not null check (provider in ('resend', 'gmail', 'telegram', 'whatsapp', 'manual', 'website')),
  provider_message_id text,
  urgency text not null check (urgency in ('low', 'normal', 'high')),
  classification text not null check (classification in ('lead', 'customer', 'support', 'billing', 'sales', 'other')),
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  ai_summary text,
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

create table if not exists crm_tasks (
  id text primary key,
  contact_id text references crm_contacts(id) on delete set null,
  opportunity_id text references crm_opportunities(id) on delete set null,
  project_id text references portal_projects(id) on delete set null,
  title text not null,
  status text not null check (status in ('todo', 'doing', 'done')),
  due_date date,
  priority text not null check (priority in ('low', 'normal', 'high')),
  source text not null default '',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists crm_email_drafts (
  id text primary key,
  interaction_id text not null references crm_interactions(id) on delete cascade,
  contact_id text references crm_contacts(id) on delete set null,
  channel text not null check (channel in ('email', 'whatsapp', 'telegram')),
  subject text not null default '',
  body text not null default '',
  tone text not null check (tone in ('direct', 'warm', 'follow_up')),
  status text not null check (status in ('draft', 'approved', 'sent', 'discarded')),
  provider_message_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists crm_notification_events (
  id text primary key,
  interaction_id text references crm_interactions(id) on delete set null,
  channel text not null check (channel in ('telegram', 'whatsapp')),
  recipient text not null default '',
  status text not null check (status in ('sent', 'skipped', 'failed')),
  summary text not null default '',
  error text,
  created_at timestamptz not null default now()
);

create index if not exists crm_contacts_email_idx on crm_contacts(lower(email));
create index if not exists crm_contacts_organization_id_idx on crm_contacts(organization_id);
create index if not exists crm_opportunities_contact_id_idx on crm_opportunities(contact_id);
create index if not exists crm_opportunities_stage_idx on crm_opportunities(stage);
create index if not exists crm_interactions_contact_id_idx on crm_interactions(contact_id);
create index if not exists crm_interactions_created_at_idx on crm_interactions(created_at desc);
create unique index if not exists crm_interactions_provider_message_id_idx
  on crm_interactions(provider_message_id)
  where provider_message_id is not null;
create index if not exists crm_tasks_status_idx on crm_tasks(status);
create index if not exists crm_email_drafts_interaction_id_idx on crm_email_drafts(interaction_id);

alter table crm_contacts enable row level security;
alter table crm_opportunities enable row level security;
alter table crm_interactions enable row level security;
alter table crm_tasks enable row level security;
alter table crm_email_drafts enable row level security;
alter table crm_notification_events enable row level security;

drop policy if exists "portal service role full access" on crm_contacts;
drop policy if exists "portal service role full access" on crm_opportunities;
drop policy if exists "portal service role full access" on crm_interactions;
drop policy if exists "portal service role full access" on crm_tasks;
drop policy if exists "portal service role full access" on crm_email_drafts;
drop policy if exists "portal service role full access" on crm_notification_events;

create policy "portal service role full access"
  on crm_contacts for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on crm_opportunities for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on crm_interactions for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on crm_tasks for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on crm_email_drafts for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on crm_notification_events for all to service_role using (true) with check (true);
