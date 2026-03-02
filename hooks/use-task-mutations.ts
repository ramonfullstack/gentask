"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ProjectKanbanData } from "@/hooks/use-project-kanban";
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
        const content = await response.json().catch(() => ({ message: "Falha ao criar tarefa" }));
        throw new Error(content.message ?? "Falha ao criar tarefa");
      }

      return response.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["kanban", projectId] })
      ]);
    }
  });
}

export function useUpdateTask(taskId: string, projectId?: string) {
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
        const content = await response.json().catch(() => ({ message: "Falha ao atualizar tarefa" }));
        throw new Error(content.message ?? "Falha ao atualizar tarefa");
      }

      return response.json();
    },
    onSuccess: async () => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: ["task", taskId] }),
        queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] })
      ];

      if (projectId) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: ["kanban", projectId] }));
      }

      await Promise.all(invalidations);
    }
  });
}

export function useDeleteTask(taskId: string, projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir tarefa");
      }
    },
    onSuccess: async () => {
      if (projectId) {
        await queryClient.invalidateQueries({ queryKey: ["kanban", projectId] });
      }
    }
  });
}

export function useMoveTaskStage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, stageId }: { taskId: string; stageId: string }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId })
      });

      if (!response.ok) {
        const content = await response.json().catch(() => ({ message: "Falha ao mover tarefa" }));
        throw new Error(content.message ?? "Falha ao mover tarefa");
      }

      return response.json();
    },
    onMutate: async ({ taskId, stageId }) => {
      await queryClient.cancelQueries({ queryKey: ["kanban", projectId] });

      const previousData = queryClient.getQueryData<ProjectKanbanData>(["kanban", projectId]);

      if (previousData) {
        queryClient.setQueryData<ProjectKanbanData>(["kanban", projectId], {
          ...previousData,
          tasks: previousData.tasks.map((task) => (task.id === taskId ? { ...task, stage_id: stageId } : task))
        });
      }

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["kanban", projectId], context.previousData);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kanban", projectId] });
    }
  });
}
