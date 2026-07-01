create table if not exists portal_website_crawl_runs (
  id text primary key,
  project_id text not null references portal_projects(id) on delete cascade,
  website_url text not null,
  status text not null check (status in ('queued', 'running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  page_count integer not null default 0,
  summary text not null default '',
  error text,
  created_by text not null references portal_users(id),
  created_at timestamptz not null default now()
);

create table if not exists portal_website_crawl_pages (
  id text primary key,
  run_id text not null references portal_website_crawl_runs(id) on delete cascade,
  project_id text not null references portal_projects(id) on delete cascade,
  url text not null,
  title text not null default '',
  description text not null default '',
  page_type text not null default 'page',
  status_code integer not null default 0,
  depth integer not null default 0,
  word_count integer not null default 0,
  text_excerpt text not null default '',
  discovered_from text,
  crawled_at timestamptz not null default now(),
  error text,
  unique (run_id, url)
);

create index if not exists portal_website_crawl_runs_project_id_idx
  on portal_website_crawl_runs(project_id, created_at desc);

create index if not exists portal_website_crawl_pages_project_id_idx
  on portal_website_crawl_pages(project_id, crawled_at desc);

create index if not exists portal_website_crawl_pages_run_id_idx
  on portal_website_crawl_pages(run_id);

alter table portal_website_crawl_runs enable row level security;
alter table portal_website_crawl_pages enable row level security;

drop policy if exists "portal service role full access"
  on portal_website_crawl_runs;
drop policy if exists "portal service role full access"
  on portal_website_crawl_pages;

create policy "portal service role full access"
  on portal_website_crawl_runs for all to service_role using (true) with check (true);

create policy "portal service role full access"
  on portal_website_crawl_pages for all to service_role using (true) with check (true);
