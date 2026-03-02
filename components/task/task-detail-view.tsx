"use client";

import { AlertCircle } from "lucide-react";
import { useTaskDetail } from "@/hooks/use-task-detail";
import { ActivityFeed } from "@/components/task/activity-feed";
import { AttachmentUpload } from "@/components/task/attachment-upload";
import { CommentThread } from "@/components/task/comment-thread";
import { TaskEditor } from "@/components/task/task-editor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TaskDetailView({ taskId }: { taskId: string }) {
  const { data: task, isLoading, error } = useTaskDetail(taskId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando tarefa...</p>;
  }

  if (error || !task) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        Não foi possível carregar a tarefa.
      </div>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      <Card className="h-fit">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge style={{ backgroundColor: task.stage.color }}>{task.stage.name}</Badge>
            <Badge variant="secondary">{task.priority}</Badge>
            {task.labels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>

          <div>
            <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-2xl">{task.title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Projeto: {task.project.name}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-foreground/90">{task.description ?? "Sem descrição"}</p>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Responsável</p>
              <p className="text-sm">{task.assignee?.full_name ?? "Não definido"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prazo</p>
              <p className="text-sm">{task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "Sem data"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Checklist</p>
            <div className="space-y-2">
              {task.checklist.length === 0 ? <p className="text-sm text-muted-foreground">Checklist vazio.</p> : null}
              {task.checklist.map((item) => (
                <label key={item.id} className="flex items-center gap-2 rounded-md border border-border/70 p-2 text-sm">
                  <input checked={item.done} readOnly type="checkbox" className="h-4 w-4 rounded border-input" />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <TaskEditor task={task} />
          <AttachmentUpload taskId={task.id} workspaceId={task.workspace_id} />
        </CardContent>
      </Card>

      <aside className="space-y-6">
        <ActivityFeed taskId={task.id} />
        <CommentThread taskId={task.id} />
      </aside>
    </section>
  );
}
