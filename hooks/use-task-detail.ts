"use client";

import { useQuery } from "@tanstack/react-query";

export type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  labels: string[];
  checklist: { id: string; label: string; done: boolean }[];
  assignee: { id: string; full_name: string | null } | null;
  project: { id: string; name: string };
  workspace_id: string;
};

export function useTaskDetail(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async (): Promise<TaskDetail> => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error("Falha ao carregar a tarefa");
      }
      return response.json();
    }
  });
}
