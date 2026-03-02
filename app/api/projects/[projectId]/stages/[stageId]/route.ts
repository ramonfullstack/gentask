import { NextRequest, NextResponse } from "next/server";
import { ensureUniqueStageSlug } from "@/lib/stages/service";
import { createClient } from "@/lib/supabase/server";
import { deleteStageSchema, updateStageSchema } from "@/lib/validations/stage";

type RouteContext = {
  params: Promise<{ projectId: string; stageId: string }>;
};

async function ensureAdmin(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: NextResponse.json({ message: "Não autenticado" }, { status: 401 }) };
  }

  const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();

  if (!project) {
    return { supabase, error: NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 }) };
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.role !== "admin") {
    return { supabase, error: NextResponse.json({ message: "Sem permissão para alterar etapas" }, { status: 403 }) };
  }

  return { supabase, error: null };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { projectId, stageId } = await context.params;
  const { supabase, error: authError } = await ensureAdmin(projectId);

  if (authError) {
    return authError;
  }

  const payload = updateStageSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ issues: payload.error.flatten() }, { status: 400 });
  }

  const { data: currentStage } = await supabase
    .from("workflow_stages")
    .select("id,name,slug")
    .eq("id", stageId)
    .eq("project_id", projectId)
    .single();

  if (!currentStage) {
    return NextResponse.json({ message: "Etapa não encontrada" }, { status: 404 });
  }

  const updatePayload: Record<string, unknown> = {};
  const nextName = payload.data.name ?? currentStage.name;

  if (payload.data.name !== undefined) {
    updatePayload.name = payload.data.name;
  }

  if (payload.data.color !== undefined) {
    updatePayload.color = payload.data.color;
  }

  if (payload.data.isFinal !== undefined) {
    updatePayload.is_final = payload.data.isFinal;
  }

  if (payload.data.isActive !== undefined) {
    updatePayload.is_active = payload.data.isActive;
  }

  if (payload.data.name !== undefined) {
    const { data: siblingStages } = await supabase
      .from("workflow_stages")
      .select("slug")
      .eq("project_id", projectId)
      .neq("id", stageId);

    updatePayload.slug = ensureUniqueStageSlug(nextName, (siblingStages ?? []).map((item) => item.slug));
  }

  const { data, error } = await supabase
    .from("workflow_stages")
    .update(updatePayload)
    .eq("id", stageId)
    .eq("project_id", projectId)
    .select("id,name,slug,color,position,is_final,is_active,project_id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { projectId, stageId } = await context.params;
  const { supabase, error: authError } = await ensureAdmin(projectId);

  if (authError) {
    return authError;
  }

  const payload = deleteStageSchema.safeParse(await request.json().catch(() => ({})));

  if (!payload.success) {
    return NextResponse.json({ issues: payload.error.flatten() }, { status: 400 });
  }

  const destinationStageId = payload.data.destinationStageId;

  const { data: stageToDelete } = await supabase
    .from("workflow_stages")
    .select("id")
    .eq("id", stageId)
    .eq("project_id", projectId)
    .single();

  if (!stageToDelete) {
    return NextResponse.json({ message: "Etapa não encontrada" }, { status: 404 });
  }

  const { count: tasksCount } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("stage_id", stageId)
    .eq("project_id", projectId);

  if ((tasksCount ?? 0) > 0 && !destinationStageId) {
    return NextResponse.json(
      { message: "Etapa possui tarefas. Informe destinationStageId para migrar antes de excluir." },
      { status: 409 }
    );
  }

  if (destinationStageId) {
    if (destinationStageId === stageId) {
      return NextResponse.json({ message: "destinationStageId deve ser diferente da etapa removida" }, { status: 400 });
    }

    const { data: destinationStage } = await supabase
      .from("workflow_stages")
      .select("id")
      .eq("id", destinationStageId)
      .eq("project_id", projectId)
      .single();

    if (!destinationStage) {
      return NextResponse.json({ message: "Etapa de destino inválida" }, { status: 400 });
    }

    const { error: migrateError } = await supabase
      .from("tasks")
      .update({ stage_id: destinationStageId })
      .eq("project_id", projectId)
      .eq("stage_id", stageId);

    if (migrateError) {
      return NextResponse.json({ message: migrateError.message }, { status: 400 });
    }
  }

  const { error } = await supabase.from("workflow_stages").delete().eq("id", stageId).eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
