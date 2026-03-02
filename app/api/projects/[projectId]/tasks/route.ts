import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTaskSchema } from "@/lib/validations/task";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;
  const supabase = await createClient();

  const json = await request.json();
  const parsed = createTaskSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ issues: parsed.error.flatten() }, { status: 400 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();

  if (!project) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  const payload = parsed.data;

  let stageId = payload.stageId ?? null;

  if (!stageId) {
    const { data: firstActiveStage } = await supabase
      .from("workflow_stages")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!firstActiveStage) {
      return NextResponse.json({ message: "Projeto sem etapas ativas para criar tarefas" }, { status: 400 });
    }

    stageId = firstActiveStage.id;
  } else {
    const { data: stage } = await supabase
      .from("workflow_stages")
      .select("id")
      .eq("id", stageId)
      .eq("project_id", projectId)
      .maybeSingle();

    if (!stage) {
      return NextResponse.json({ message: "Etapa inválida para este projeto" }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: project.workspace_id,
      project_id: projectId,
      stage_id: stageId,
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      assignee_id: payload.assigneeId,
      due_date: payload.dueDate,
      labels: payload.labels,
      checklist: payload.checklist,
      created_by: user.id
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
