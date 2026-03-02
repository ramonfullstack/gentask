import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  workspace_id: string;
};

export type WorkspaceContext = {
  userId: string;
  userEmail: string | null;
  workspaceId: string;
  projects: ProjectSummary[];
  currentProject: ProjectSummary | null;
};

export async function getWorkspaceContext(preferredProjectId?: string): Promise<WorkspaceContext> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership?.workspace_id) {
    return {
      userId: user.id,
      userEmail: user.email ?? null,
      workspaceId: "",
      projects: [],
      currentProject: null
    };
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id,name,description,workspace_id")
    .eq("workspace_id", membership.workspace_id)
    .order("created_at", { ascending: true });

  const projectList = projects ?? [];
  const currentProject =
    projectList.find((project) => project.id === preferredProjectId) ??
    projectList[0] ??
    null;

  return {
    userId: user.id,
    userEmail: user.email ?? null,
    workspaceId: membership.workspace_id,
    projects: projectList,
    currentProject
  };
}
