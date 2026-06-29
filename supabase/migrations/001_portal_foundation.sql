create table if not exists portal_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'customer')),
  email_verified_at timestamptz,
  session_version integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists portal_organizations (
  id text primary key,
  name text not null,
  industry text not null default '',
  website text,
  created_at timestamptz not null default now()
);

create table if not exists portal_projects (
  id text primary key,
  organization_id text not null references portal_organizations(id) on delete cascade,
  name text not null,
  summary text not null default '',
  status text not null check (status in ('discovery', 'analysis', 'implementation', 'paused', 'completed')),
  asdar_stage text not null check (asdar_stage in ('analyse', 'structure', 'digitize', 'automate', 'realize')),
  health text not null check (health in ('green', 'amber', 'red')),
  next_step text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists portal_project_members (
  id text primary key,
  project_id text not null references portal_projects(id) on delete cascade,
  user_id text not null references portal_users(id) on delete cascade,
  role text not null check (role in ('client_owner', 'client_viewer')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists portal_project_intelligence (
  project_id text primary key references portal_projects(id) on delete cascade,
  company_context text not null default '',
  stakeholders text not null default '',
  issues text not null default '',
  goals text not null default '',
  current_tools text not null default '',
  data_situation text not null default '',
  constraints text not null default '',
  opportunities text not null default '',
  internal_notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists portal_project_updates (
  id text primary key,
  project_id text not null references portal_projects(id) on delete cascade,
  title text not null,
  body text not null default '',
  visibility text not null check (visibility in ('internal', 'customer')),
  asdar_stage text not null check (asdar_stage in ('analyse', 'structure', 'digitize', 'automate', 'realize')),
  created_by text not null references portal_users(id),
  created_at timestamptz not null default now()
);

create table if not exists portal_project_tasks (
  id text primary key,
  project_id text not null references portal_projects(id) on delete cascade,
  title text not null,
  owner text not null check (owner in ('assad', 'customer')),
  status text not null check (status in ('todo', 'doing', 'done')),
  due_date date,
  visible_to_customer boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists portal_project_milestones (
  id text primary key,
  project_id text not null references portal_projects(id) on delete cascade,
  title text not null,
  status text not null check (status in ('planned', 'active', 'done')),
  due_date date,
  visible_to_customer boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists portal_project_files (
  id text primary key,
  project_id text not null references portal_projects(id) on delete cascade,
  name text not null,
  description text not null default '',
  storage_path text not null,
  mime_type text not null default 'application/octet-stream',
  size bigint not null default 0,
  visibility text not null check (visibility in ('internal', 'customer')),
  uploaded_by text not null references portal_users(id),
  uploaded_at timestamptz not null default now()
);

create table if not exists portal_invoices (
  id text primary key,
  project_id text not null references portal_projects(id) on delete cascade,
  number text not null,
  description text not null default '',
  amount_cents integer not null default 0,
  currency text not null check (currency in ('EUR', 'USD')),
  status text not null check (status in ('draft', 'sent', 'paid', 'overdue')),
  issued_at date not null,
  due_date date,
  payment_url text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists portal_payment_events (
  id text primary key,
  provider text not null check (provider in ('stripe')),
  type text not null,
  entity_id text,
  status text not null check (status in ('processed', 'ignored')),
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists portal_ai_insights (
  id text primary key,
  project_id text not null references portal_projects(id) on delete cascade,
  title text not null,
  body text not null default '',
  kind text not null check (kind in ('guidance', 'similar_project', 'risk', 'next_step')),
  created_at timestamptz not null default now()
);

create table if not exists portal_auth_tokens (
  id text primary key,
  user_id text not null references portal_users(id) on delete cascade,
  token_hash text not null unique,
  purpose text not null check (purpose in ('email_verification', 'password_reset', 'project_invite')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists portal_projects_organization_id_idx on portal_projects(organization_id);
create index if not exists portal_project_members_user_id_idx on portal_project_members(user_id);
create index if not exists portal_project_updates_project_id_idx on portal_project_updates(project_id);
create index if not exists portal_project_tasks_project_id_idx on portal_project_tasks(project_id);
create index if not exists portal_project_files_project_id_idx on portal_project_files(project_id);
create index if not exists portal_invoices_project_id_idx on portal_invoices(project_id);
create index if not exists portal_payment_events_entity_id_idx on portal_payment_events(entity_id);
create index if not exists portal_auth_tokens_user_id_idx on portal_auth_tokens(user_id);

alter table portal_users
  add column if not exists email_verified_at timestamptz;
alter table portal_users
  add column if not exists session_version integer not null default 0;
