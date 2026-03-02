"use client";

import { useQuery } from "@tanstack/react-query";

export type WorkflowStage = {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  color: string;
  position: number;
  is_final: boolean;
  is_active: boolean;
};

export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  stage_id: string;
  assignee_id: string | null;
  assignee: { id: string; full_name: string | null } | null;
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  labels: string[];
  updated_at: string;
};

export type ProjectKanbanData = {
  project: { id: string; name: string; workspace_id: string };
  stages: WorkflowStage[];
  tasks: KanbanTask[];
  canManageStages: boolean;
};

export function useProjectKanban(projectId: string) {
  return useQuery({
    queryKey: ["kanban", projectId],
    queryFn: async (): Promise<ProjectKanbanData> => {
      const response = await fetch(`/api/projects/${projectId}/kanban`);
      if (!response.ok) {
        throw new Error("Falha ao carregar quadro do projeto");
      }
      return response.json();
    }
  });
}
