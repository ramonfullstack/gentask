-- Garante que todo usuário em auth.users tenha profile correspondente.
insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Evita actor_id inválido em contexto sem auth.uid() (seed/execuções administrativas).
create or replace function public.log_task_activity_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
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

    if old.status is distinct from new.status then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, v_actor_id, 'task.status_changed', 'status', to_jsonb(old.status), to_jsonb(new.status));
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
