alter table portal_website_crawl_runs
  add column if not exists apply_to_intelligence boolean not null default true;
