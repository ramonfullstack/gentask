"use client";

import { useQuery } from "@tanstack/react-query";

export type TaskActivityItem = {
  id: string;
  actor_name: string | null;
  event_type: string;
  field_name: string | null;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
};

export function useTaskActivity(taskId: string) {
  return useQuery({
    queryKey: ["task-activity", taskId],
    queryFn: async (): Promise<TaskActivityItem[]> => {
      const response = await fetch(`/api/tasks/${taskId}/activity`);
      if (!response.ok) {
        throw new Error("Falha ao carregar atividade");
      }
      return response.json();
    }
  });
}
