import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateTaskForm } from "@/components/task/create-task-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight">{project.name}</h1>
        <p className="text-sm text-muted-foreground">Selecione uma tarefa para ver detalhes e histórico de atividades.</p>
      </header>

      <CreateTaskForm projectId={project.id} />

      <div className="grid gap-4">
        {tasks?.map((task) => (
          <Link key={task.id} href={`/app/tasks/${task.id}`}>
            <Card className="transition hover:-translate-y-0.5 hover:border-primary/40">
              <CardHeader>
                <CardTitle className="text-lg">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{task.status}</Badge>
                <Badge variant="outline">{task.priority}</Badge>
                <span>Prazo: {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "Sem data"}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
