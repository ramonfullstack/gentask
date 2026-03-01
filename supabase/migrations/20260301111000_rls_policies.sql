alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.task_activity enable row level security;

create or replace function public.is_workspace_member(workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.workspace_member_role(workspace uuid)
returns public.workspace_role
language sql
stable
security definer
set search_path = public
as $$
  select wm.role
  from public.workspace_members wm
  where wm.workspace_id = workspace
    and wm.user_id = auth.uid()
  limit 1;
$$;

create policy "profile_select_own" on public.profiles
for select using (id = auth.uid());

create policy "profile_update_own" on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid());

create policy "workspace_select_member" on public.workspaces
for select using (public.is_workspace_member(id));

create policy "workspace_insert_owner" on public.workspaces
for insert with check (owner_id = auth.uid());

create policy "workspace_update_admin" on public.workspaces
for update using (public.workspace_member_role(id) = 'admin')
with check (public.workspace_member_role(id) = 'admin');

create policy "workspace_members_select_member" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_insert_admin" on public.workspace_members
for insert with check (public.workspace_member_role(workspace_id) = 'admin');

create policy "workspace_members_update_admin" on public.workspace_members
for update using (public.workspace_member_role(workspace_id) = 'admin')
with check (public.workspace_member_role(workspace_id) = 'admin');

create policy "workspace_members_delete_admin" on public.workspace_members
for delete using (public.workspace_member_role(workspace_id) = 'admin');

create policy "projects_select_member" on public.projects
for select using (public.is_workspace_member(workspace_id));

create policy "projects_insert_admin" on public.projects
for insert with check (public.workspace_member_role(workspace_id) = 'admin');

create policy "projects_update_admin" on public.projects
for update using (public.workspace_member_role(workspace_id) = 'admin')
with check (public.workspace_member_role(workspace_id) = 'admin');

create policy "projects_delete_admin" on public.projects
for delete using (public.workspace_member_role(workspace_id) = 'admin');

create policy "tasks_select_member" on public.tasks
for select using (public.is_workspace_member(workspace_id));

create policy "tasks_insert_member" on public.tasks
for insert with check (public.is_workspace_member(workspace_id));

create policy "tasks_update_member" on public.tasks
for update using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "tasks_delete_admin" on public.tasks
for delete using (public.workspace_member_role(workspace_id) = 'admin');

create policy "task_comments_select_member" on public.task_comments
for select using (public.is_workspace_member(workspace_id));

create policy "task_comments_insert_member" on public.task_comments
for insert with check (public.is_workspace_member(workspace_id) and author_id = auth.uid());

create policy "task_comments_update_author" on public.task_comments
for update using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "task_comments_delete_author_or_admin" on public.task_comments
for delete using (author_id = auth.uid() or public.workspace_member_role(workspace_id) = 'admin');

create policy "task_attachments_select_member" on public.task_attachments
for select using (public.is_workspace_member(workspace_id));

create policy "task_attachments_insert_member" on public.task_attachments
for insert with check (public.is_workspace_member(workspace_id) and uploader_id = auth.uid());

create policy "task_attachments_delete_uploader_or_admin" on public.task_attachments
for delete using (uploader_id = auth.uid() or public.workspace_member_role(workspace_id) = 'admin');

create policy "task_activity_select_member" on public.task_activity
for select using (public.is_workspace_member(workspace_id));

create policy "task_activity_insert_member" on public.task_activity
for insert with check (public.is_workspace_member(workspace_id) and actor_id = auth.uid());
