import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateTaskSchema } from "@/lib/validations/task";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { taskId } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, workspace_id, title, description, status, priority, due_date, labels, checklist, project:projects(id,name), assignee:profiles!tasks_assignee_id_fkey(id,full_name)"
    )
    .eq("id", taskId)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { taskId } = await context.params;
  const supabase = await createClient();

  const json = await request.json();
  const parsed = updateTaskSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ issues: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  const { data: previousTask } = await supabase
    .from("tasks")
    .select("workspace_id, status, priority, assignee_id, due_date, labels, checklist")
    .eq("id", taskId)
    .single();

  const updatePayload: Record<string, unknown> = {};
  if (payload.title !== undefined) updatePayload.title = payload.title;
  if (payload.description !== undefined) updatePayload.description = payload.description;
  if (payload.status !== undefined) updatePayload.status = payload.status;
  if (payload.priority !== undefined) updatePayload.priority = payload.priority;
  if (payload.assigneeId !== undefined) updatePayload.assignee_id = payload.assigneeId;
  if (payload.dueDate !== undefined) updatePayload.due_date = payload.dueDate;
  if (payload.labels !== undefined) updatePayload.labels = payload.labels;
  if (payload.checklist !== undefined) updatePayload.checklist = payload.checklist;

  const { data: updatedTask, error } = await supabase.from("tasks").update(updatePayload).eq("id", taskId).select("id").single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (previousTask && user) {
    await supabase.from("task_activity").insert({
      workspace_id: previousTask.workspace_id,
      task_id: taskId,
      actor_id: user.id,
      event_type: "task.updated",
      old_value: previousTask,
      new_value: payload
    });
  }

  return NextResponse.json(updatedTask);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { taskId } = await context.params;
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
