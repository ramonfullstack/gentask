"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations/task";

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: unknown) => {
      const body = createTaskSchema.parse(payload);
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Falha ao criar tarefa");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    }
  });
}

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: unknown) => {
      const body = updateTaskSchema.parse(payload);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar tarefa");
      }

      return response.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["task", taskId] }),
        queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] })
      ]);
    }
  });
}

export function useDeleteTask(taskId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir tarefa");
      }
    }
  });
}
