alter table public.workflow_stages enable row level security;

create policy "workflow_stages_select_member" on public.workflow_stages
for select using (public.is_workspace_member(workspace_id));

create policy "workflow_stages_insert_admin" on public.workflow_stages
for insert with check (public.workspace_member_role(workspace_id) = 'admin');

create policy "workflow_stages_update_admin" on public.workflow_stages
for update using (public.workspace_member_role(workspace_id) = 'admin')
with check (public.workspace_member_role(workspace_id) = 'admin');

create policy "workflow_stages_delete_admin" on public.workflow_stages
for delete using (public.workspace_member_role(workspace_id) = 'admin');
