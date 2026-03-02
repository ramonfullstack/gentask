import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectKanban } from "@/components/task/project-kanban";

type ProjectTasksPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectTasksPage({ params }: ProjectTasksPageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("id, name").eq("id", projectId).maybeSingle();

  if (!project) {
    notFound();
  }

  return <ProjectKanban projectId={project.id} projectName={project.name} />;
}
