import { NextRequest, NextResponse } from "next/server";
import { ensureUniqueStageSlug } from "@/lib/stages/service";
import { createClient } from "@/lib/supabase/server";
import { createStageSchema } from "@/lib/validations/stage";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

async function getProjectRole(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, project: null, role: null };
  }

  const { data: project } = await supabase.from("projects").select("id,workspace_id").eq("id", projectId).single();

  if (!project) {
    return { supabase, user, project: null, role: null };
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, project, role: membership?.role ?? null };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;
  const { supabase, project } = await getProjectRole(projectId);

  if (!project) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("workflow_stages")
    .select("id,name,slug,color,position,is_final,is_active,project_id")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;
  const { supabase, project, role } = await getProjectRole(projectId);

  if (!project) {
    return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
  }

  if (role !== "admin") {
    return NextResponse.json({ message: "Sem permissão para alterar etapas" }, { status: 403 });
  }

  const payload = createStageSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ issues: payload.error.flatten() }, { status: 400 });
  }

  const { data: existingStages } = await supabase.from("workflow_stages").select("slug").eq("project_id", projectId);
  const existingSlugs = (existingStages ?? []).map((item) => item.slug);

  const { data: lastStage } = await supabase
    .from("workflow_stages")
    .select("position")
    .eq("project_id", projectId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastStage?.position ?? 0) + 100;
  const slug = ensureUniqueStageSlug(payload.data.name, existingSlugs);

  const { data, error } = await supabase
    .from("workflow_stages")
    .insert({
      workspace_id: project.workspace_id,
      project_id: projectId,
      name: payload.data.name,
      slug,
      color: payload.data.color,
      position: nextPosition,
      is_final: payload.data.isFinal ?? false,
      is_active: payload.data.isActive ?? true
    })
    .select("id,name,slug,color,position,is_final,is_active,project_id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
