alter table portal_project_tasks
  add column if not exists benefit text;

alter table portal_project_tasks
  add column if not exists effort text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'portal_project_tasks_benefit_check'
  ) then
    alter table portal_project_tasks
      add constraint portal_project_tasks_benefit_check
      check (benefit is null or benefit in ('low', 'high'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'portal_project_tasks_effort_check'
  ) then
    alter table portal_project_tasks
      add constraint portal_project_tasks_effort_check
      check (effort is null or effort in ('low', 'high'));
  end if;
end $$;

create index if not exists portal_project_tasks_priority_idx
  on portal_project_tasks(project_id, benefit, effort);
