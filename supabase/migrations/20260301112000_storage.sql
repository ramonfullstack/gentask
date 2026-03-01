insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

create policy "storage_select_workspace_member"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'task-attachments'
  and public.is_workspace_member(split_part(name, '/', 1)::uuid)
);

create policy "storage_insert_workspace_member"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'task-attachments'
  and owner = auth.uid()
  and public.is_workspace_member(split_part(name, '/', 1)::uuid)
);

create policy "storage_delete_owner_or_workspace_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'task-attachments'
  and (
    owner = auth.uid()
    or public.workspace_member_role(split_part(name, '/', 1)::uuid) = 'admin'
  )
);
