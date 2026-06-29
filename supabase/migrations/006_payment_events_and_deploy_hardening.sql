alter table portal_invoices
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;

create table if not exists portal_payment_events (
  id text primary key,
  provider text not null check (provider in ('stripe')),
  type text not null,
  entity_id text,
  status text not null check (status in ('processed', 'ignored')),
  reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists portal_payment_events_entity_id_idx
  on portal_payment_events(entity_id);

alter table portal_payment_events enable row level security;

drop policy if exists "portal service role full access" on portal_payment_events;

create policy "portal service role full access"
  on portal_payment_events for all to service_role using (true) with check (true);
