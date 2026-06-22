-- Portal data is accessed by the Next.js server through a privileged database
-- connection. These policies prevent accidental browser/client access through
-- Supabase anon/authenticated APIs while preserving service-role/server access.

alter table portal_users enable row level security;
alter table portal_organizations enable row level security;
alter table portal_projects enable row level security;
alter table portal_project_members enable row level security;
alter table portal_project_intelligence enable row level security;
alter table portal_project_updates enable row level security;
alter table portal_project_tasks enable row level security;
alter table portal_project_milestones enable row level security;
alter table portal_project_files enable row level security;
alter table portal_invoices enable row level security;
alter table portal_ai_insights enable row level security;
alter table portal_auth_tokens enable row level security;

drop policy if exists "portal service role full access" on portal_users;
drop policy if exists "portal service role full access" on portal_organizations;
drop policy if exists "portal service role full access" on portal_projects;
drop policy if exists "portal service role full access" on portal_project_members;
drop policy if exists "portal service role full access" on portal_project_intelligence;
drop policy if exists "portal service role full access" on portal_project_updates;
drop policy if exists "portal service role full access" on portal_project_tasks;
drop policy if exists "portal service role full access" on portal_project_milestones;
drop policy if exists "portal service role full access" on portal_project_files;
drop policy if exists "portal service role full access" on portal_invoices;
drop policy if exists "portal service role full access" on portal_ai_insights;
drop policy if exists "portal service role full access" on portal_auth_tokens;

create policy "portal service role full access"
  on portal_users for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_organizations for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_projects for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_project_members for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_project_intelligence for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_project_updates for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_project_tasks for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_project_milestones for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_project_files for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_invoices for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_ai_insights for all to service_role using (true) with check (true);
create policy "portal service role full access"
  on portal_auth_tokens for all to service_role using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('portal-files', 'portal-files', false)
on conflict (id) do update set public = false;

drop policy if exists "portal files service role full access" on storage.objects;

create policy "portal files service role full access"
  on storage.objects for all to service_role
  using (bucket_id = 'portal-files')
  with check (bucket_id = 'portal-files');
