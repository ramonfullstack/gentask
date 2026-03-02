"use client";

import { AlertCircle } from "lucide-react";
import { useProjectKanban } from "@/hooks/use-project-kanban";
import { StageManagement } from "@/components/task/stage-management";

export function WorkflowSettingsPage({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useProjectKanban(projectId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando configurações de workflow...</p>;
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        Não foi possível carregar configurações de workflow.
      </div>
    );
  }

  return <StageManagement projectId={projectId} stages={data.stages} tasks={data.tasks} canManageStages={data.canManageStages} />;
}
