create or replace function public.log_task_activity_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.task_activity (workspace_id, task_id, actor_id, event_type, new_value)
    values (new.workspace_id, new.id, new.created_by, 'task.created', to_jsonb(new));
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, auth.uid(), 'task.status_changed', 'status', to_jsonb(old.status), to_jsonb(new.status));
    end if;

    if old.priority is distinct from new.priority then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, auth.uid(), 'task.priority_changed', 'priority', to_jsonb(old.priority), to_jsonb(new.priority));
    end if;

    if old.assignee_id is distinct from new.assignee_id then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, auth.uid(), 'task.assignee_changed', 'assignee_id', to_jsonb(old.assignee_id), to_jsonb(new.assignee_id));
    end if;

    if old.due_date is distinct from new.due_date then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, auth.uid(), 'task.due_date_changed', 'due_date', to_jsonb(old.due_date), to_jsonb(new.due_date));
    end if;

    if old.title is distinct from new.title then
      insert into public.task_activity (workspace_id, task_id, actor_id, event_type, field_name, old_value, new_value)
      values (new.workspace_id, new.id, auth.uid(), 'task.title_changed', 'title', to_jsonb(old.title), to_jsonb(new.title));
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists task_activity_trigger on public.tasks;
create trigger task_activity_trigger
after insert or update on public.tasks
for each row execute function public.log_task_activity_changes();
