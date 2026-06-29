-- Hero images generated for blog articles (admin "Generieren" action).
-- Decoupled from portal_* tables (no FK to projects). The app also creates
-- this table lazily via CREATE TABLE IF NOT EXISTS, so applying this migration
-- is optional but recommended for clarity.
create table if not exists blog_hero_images (
  slug text primary key,
  storage_path text not null,
  mime_type text not null default 'image/png',
  width integer not null default 1536,
  height integer not null default 1024,
  alt text not null default '',
  caption text,
  prompt text not null default '',
  provider text not null default 'openai',
  size bigint not null default 0,
  created_by text,
  generated_at timestamptz not null default now()
);

alter table blog_hero_images enable row level security;

drop policy if exists "blog hero service role full access" on blog_hero_images;

create policy "blog hero service role full access"
  on blog_hero_images for all to service_role using (true) with check (true);
