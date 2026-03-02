"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, GripVertical, Plus } from "lucide-react";
import { useCreateTask, useMoveTaskStage } from "@/hooks/use-task-mutations";
import { type KanbanTask, useProjectKanban } from "@/hooks/use-project-kanban";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProjectKanbanProps = {
  projectId: string;
  projectName: string;
  showHeader?: boolean;
};

export function ProjectKanban({ projectId, projectName, showHeader = true }: ProjectKanbanProps) {
  const { data, isLoading, error } = useProjectKanban(projectId);
  const createTask = useCreateTask(projectId);
  const moveTaskStage = useMoveTaskStage(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newTaskStageId, setNewTaskStageId] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const orderedStages = useMemo(
    () => (data?.stages ?? []).filter((stage) => stage.is_active).sort((a, b) => a.position - b.position),
    [data?.stages]
  );

  const tasksByStage = useMemo(() => {
    const grouped = new Map<string, KanbanTask[]>();

    if (!data) {
      return grouped;
    }

    orderedStages.forEach((stage) => grouped.set(stage.id, []));

    data.tasks.forEach((task) => {
      const list = grouped.get(task.stage_id) ?? [];
      grouped.set(task.stage_id, [...list, task]);
    });

    return grouped;
  }, [data, orderedStages]);

  const onCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await createTask.mutateAsync({
      title,
      description: description || null,
      dueDate: dueDate || null,
      stageId: newTaskStageId || undefined,
      labels: []
    });

    setTitle("");
    setDescription("");
    setDueDate("");
  };

  const onDropTask = async (stageId: string) => {
    if (!draggedTaskId) {
      return;
    }

    await moveTaskStage.mutateAsync({ taskId: draggedTaskId, stageId });
    setDraggedTaskId(null);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando quadro...</p>;
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        Falha ao carregar Kanban.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {showHeader ? (
        <header className="space-y-2">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight">{projectName}</h1>
          <p className="text-sm text-muted-foreground">Kanban dinâmico com etapas gerenciáveis por projeto.</p>
        </header>
      ) : null}

      <form onSubmit={onCreateTask} className="grid gap-3 rounded-xl border border-border/70 bg-card/70 p-4 md:grid-cols-[1.2fr_1.2fr_180px_180px_auto]">
        <Input placeholder="Título da tarefa" value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} required />
        <Textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-10"
        />
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        <select
          value={newTaskStageId}
          onChange={(event) => setNewTaskStageId(event.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">Etapa inicial automática</option>
          {orderedStages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={createTask.isPending || !title.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova tarefa
        </Button>
      </form>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-max grid-flow-col gap-4">
          {orderedStages.map((stage) => (
            <Card
              key={stage.id}
              className="w-80"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => void onDropTask(stage.id)}
              data-testid={`kanban-stage-${stage.slug}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    {stage.name}
                  </span>
                  <Badge variant="secondary">{tasksByStage.get(stage.id)?.length ?? 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(tasksByStage.get(stage.id) ?? []).map((task) => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    className="rounded-lg border border-border/70 bg-background/70 p-3"
                    data-testid={`task-card-${task.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/app/tasks/${task.id}`} className="text-sm font-medium hover:underline">
                        {task.title}
                      </Link>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{task.priority}</Badge>
                      {task.due_date ? <Badge variant="secondary">{new Date(task.due_date).toLocaleDateString("pt-BR")}</Badge> : null}
                    </div>
                  </article>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </section>
  );
}
