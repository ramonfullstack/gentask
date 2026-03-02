create table if not exists public.workflow_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  slug text not null,
  color text not null default '#64748b',
  position integer not null,
  is_final boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, slug)
);

create index if not exists workflow_stages_project_id_idx on public.workflow_stages(project_id);
create index if not exists workflow_stages_project_position_idx on public.workflow_stages(project_id, position);

drop trigger if exists workflow_stages_set_updated_at on public.workflow_stages;
create trigger workflow_stages_set_updated_at
before update on public.workflow_stages
for each row execute function public.set_updated_at();

alter table public.tasks add column if not exists stage_id uuid references public.workflow_stages(id) on delete restrict;

insert into public.workflow_stages (workspace_id, project_id, name, slug, color, position, is_final, is_active)
select
  p.workspace_id,
  p.id,
  stage_data.name,
  stage_data.slug,
  stage_data.color,
  stage_data.position,
  stage_data.is_final,
  true
from public.projects p
cross join (
  values
    ('To Do', 'todo', '#64748b', 100, false),
    ('Review', 'review', '#f59e0b', 200, false),
    ('Pull Request', 'pull-request', '#0ea5e9', 300, false),
    ('Finalizada', 'done', '#22c55e', 400, true)
) as stage_data(name, slug, color, position, is_final)
on conflict (project_id, slug) do nothing;

update public.tasks t
set stage_id = ws.id
from public.workflow_stages ws
where ws.project_id = t.project_id
  and ws.slug = case
    when t.status::text = 'todo' then 'todo'
    when t.status::text = 'review' then 'review'
    when t.status::text = 'done' then 'done'
    else 'pull-request'
  end
  and t.stage_id is null;

update public.tasks t
set stage_id = ws.id
from lateral (
  select id
  from public.workflow_stages
  where project_id = t.project_id
  order by position asc
  limit 1
) ws
where t.stage_id is null;

alter table public.tasks alter column stage_id set not null;

create or replace function public.log_task_activity_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_old_stage_name text;
  v_new_stage_name text;
begin
  v_actor_id := coalesce(auth.uid(), new.created_by, old.created_by);

  if tg_op = 'INSERT' then
    if v_actor_id is not null then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, new_value)
      values (new.workspace_id, new.id, v_actor_id, 'task.created', to_jsonb(new));
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if v_actor_id is null then
      return new;
    end if;

    if old.stage_id is distinct from new.stage_id then
      select ws.name into v_old_stage_name from public.workflow_stages ws where ws.id = old.stage_id;
      select ws.name into v_new_stage_name from public.workflow_stages ws where ws.id = new.stage_id;

      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, old_value, new_value)
      values (
        new.workspace_id,
        new.id,
        v_actor_id,
        'stage_changed',
        jsonb_build_object('stageId', old.stage_id, 'stageName', v_old_stage_name),
        jsonb_build_object('stageId', new.stage_id, 'stageName', v_new_stage_name)
      );
    end if;

    if old.priority is distinct from new.priority then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, v_actor_id, 'task.priority_changed', 'priority', to_jsonb(old.priority), to_jsonb(new.priority));
    end if;

    if old.assignee_id is distinct from new.assignee_id then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, v_actor_id, 'task.assignee_changed', 'assignee_id', to_jsonb(old.assignee_id), to_jsonb(new.assignee_id));
    end if;

    if old.due_date is distinct from new.due_date then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, v_actor_id, 'task.due_date_changed', 'due_date', to_jsonb(old.due_date), to_jsonb(new.due_date));
    end if;

    if old.title is distinct from new.title then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, v_actor_id, 'task.title_changed', 'title', to_jsonb(old.title), to_jsonb(new.title));
    end if;

    return new;
  end if;

  return new;
end;
$$;

alter table public.tasks drop column if exists status;
drop type if exists public.task_status;
