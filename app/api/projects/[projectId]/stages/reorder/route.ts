import { NextRequest, NextResponse } from "next/server";
import { buildStagePositionUpdates } from "@/lib/stages/service";
import { createClient } from "@/lib/supabase/server";
import { reorderStagesSchema } from "@/lib/validations/stage";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;
  const supabase = await createClient();

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

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.role !== "admin") {
    return NextResponse.json({ message: "Sem permissão para alterar etapas" }, { status: 403 });
  }

  const payload = reorderStagesSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ issues: payload.error.flatten() }, { status: 400 });
  }

  const { data: existingStages } = await supabase.from("workflow_stages").select("id").eq("project_id", projectId);
  const existingIds = new Set((existingStages ?? []).map((item) => item.id));
  const incomingIds = payload.data.stageIds;

  if (existingIds.size !== incomingIds.length || incomingIds.some((id) => !existingIds.has(id))) {
    return NextResponse.json({ message: "Lista de etapas inválida para este projeto" }, { status: 400 });
  }

  const updates = buildStagePositionUpdates(incomingIds);

  for (const item of updates) {
    const { error } = await supabase.from("workflow_stages").update({ position: item.position }).eq("id", item.id);
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
