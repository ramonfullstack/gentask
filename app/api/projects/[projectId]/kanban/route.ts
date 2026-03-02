import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id,name,workspace_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  const canManageStages = membership?.role === "admin";

  const { data: stages, error: stagesError } = await supabase
    .from("workflow_stages")
    .select("id,name,slug,color,position,is_final,is_active,project_id")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (stagesError) {
    return NextResponse.json({ message: stagesError.message }, { status: 400 });
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id,title,description,stage_id,priority,due_date,labels,updated_at")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (tasksError) {
    return NextResponse.json({ message: tasksError.message }, { status: 400 });
  }

  return NextResponse.json({
    project,
    stages: stages ?? [],
    tasks: tasks ?? [],
    canManageStages
  });
}
