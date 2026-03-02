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
      "id, workspace_id, project_id, title, description, stage_id, priority, due_date, labels, checklist, project:projects(id,name), stage:workflow_stages!tasks_stage_id_fkey(id,name,slug,color,position,is_final,is_active), assignee:profiles!tasks_assignee_id_fkey(id,full_name)"
    )
    .eq("id", taskId)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
  }

  const { data: availableStages } = await supabase
    .from("workflow_stages")
    .select("id,name,slug,color,position,is_final,is_active")
    .eq("project_id", data.project_id)
    .order("position", { ascending: true });

  const normalizedStage = Array.isArray(data.stage) ? data.stage[0] : data.stage;
  const normalizedAssignee = Array.isArray(data.assignee) ? data.assignee[0] : data.assignee;

  return NextResponse.json({
    ...data,
    stage: normalizedStage,
    assignee: normalizedAssignee,
    available_stages: availableStages ?? []
  });
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
    .select("id,project_id,workspace_id")
    .eq("id", taskId)
    .single();

  if (!previousTask) {
    return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
  }

  if (payload.stageId !== undefined) {
    const { data: stage } = await supabase
      .from("workflow_stages")
      .select("id")
      .eq("id", payload.stageId)
      .eq("project_id", previousTask.project_id)
      .maybeSingle();

    if (!stage) {
      return NextResponse.json({ message: "Etapa inválida para este projeto" }, { status: 400 });
    }
  }

  const updatePayload: Record<string, unknown> = {};
  if (payload.title !== undefined) updatePayload.title = payload.title;
  if (payload.description !== undefined) updatePayload.description = payload.description;
  if (payload.stageId !== undefined) updatePayload.stage_id = payload.stageId;
  if (payload.priority !== undefined) updatePayload.priority = payload.priority;
  if (payload.assigneeId !== undefined) updatePayload.assignee_id = payload.assigneeId;
  if (payload.dueDate !== undefined) updatePayload.due_date = payload.dueDate;
  if (payload.labels !== undefined) updatePayload.labels = payload.labels;
  if (payload.checklist !== undefined) updatePayload.checklist = payload.checklist;

  const { data: updatedTask, error } = await supabase
    .from("tasks")
    .update(updatePayload)
    .eq("id", taskId)
    .select("id,project_id,stage_id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
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
