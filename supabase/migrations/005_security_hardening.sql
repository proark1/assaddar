alter table portal_users
  add column if not exists session_version integer not null default 0;

alter table blog_hero_images enable row level security;

drop policy if exists "blog hero service role full access" on blog_hero_images;

create policy "blog hero service role full access"
  on blog_hero_images for all to service_role using (true) with check (true);
