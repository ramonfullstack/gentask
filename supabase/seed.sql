-- Seed base para o primeiro usuário autenticado.
with first_user as (
  select id
  from auth.users
  order by created_at asc
  limit 1
), workspace_insert as (
  insert into public.workspaces (id, name, owner_id)
  select gen_random_uuid(), 'Workspace Inicial', id
  from first_user
  on conflict do nothing
  returning id, owner_id
), workspace_existing as (
  select w.id, w.owner_id
  from public.workspaces w
  join first_user fu on fu.id = w.owner_id
  order by w.created_at asc
  limit 1
), selected_workspace as (
  select id, owner_id from workspace_insert
  union all
  select id, owner_id from workspace_existing
  limit 1
), member_insert as (
  insert into public.workspace_members (workspace_id, user_id, role)
  select id, owner_id, 'admin'::public.workspace_role
  from selected_workspace
  on conflict (workspace_id, user_id) do nothing
), project_insert as (
  insert into public.projects (workspace_id, name, description)
  select id, 'Produto Core', 'Projeto inicial do GenTask'
  from selected_workspace
  on conflict do nothing
  returning id, workspace_id
), selected_project as (
  select id, workspace_id from project_insert
  union all
  select p.id, p.workspace_id
  from public.projects p
  join selected_workspace sw on sw.id = p.workspace_id
  order by p.created_at asc
  limit 1
)
insert into public.tasks (
  workspace_id,
  project_id,
  title,
  description,
  status,
  priority,
  assignee_id,
  due_date,
  labels,
  checklist,
  created_by
)
select
  sp.workspace_id,
  sp.id,
  'Implementar Activity Feed',
  'Criar timeline com comentários, anexos e alterações de status.',
  'in_progress'::public.task_status,
  'high'::public.task_priority,
  fu.id,
  (now() + interval '7 days')::date,
  array['timeline', 'ux'],
  jsonb_build_array(
    jsonb_build_object('id', gen_random_uuid(), 'label', 'Modelar schema', 'done', true),
    jsonb_build_object('id', gen_random_uuid(), 'label', 'Implementar endpoint', 'done', false),
    jsonb_build_object('id', gen_random_uuid(), 'label', 'Criar layout mobile', 'done', false)
  ),
  fu.id
from selected_project sp
join first_user fu on true
where not exists (
  select 1
  from public.tasks t
  where t.project_id = sp.id
);
