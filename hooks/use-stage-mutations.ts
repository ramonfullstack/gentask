"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStageSchema, deleteStageSchema, reorderStagesSchema, updateStageSchema } from "@/lib/validations/stage";

export function useCreateStage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: unknown) => {
      const body = createStageSchema.parse(payload);
      const response = await fetch(`/api/projects/${projectId}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const content = await response.json().catch(() => ({ message: "Falha ao criar etapa" }));
        throw new Error(content.message ?? "Falha ao criar etapa");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kanban", projectId] });
    }
  });
}

export function useUpdateStage(projectId: string, stageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: unknown) => {
      const body = updateStageSchema.parse(payload);
      const response = await fetch(`/api/projects/${projectId}/stages/${stageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const content = await response.json().catch(() => ({ message: "Falha ao atualizar etapa" }));
        throw new Error(content.message ?? "Falha ao atualizar etapa");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kanban", projectId] });
    }
  });
}

export function useReorderStages(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: unknown) => {
      const body = reorderStagesSchema.parse(payload);
      const response = await fetch(`/api/projects/${projectId}/stages/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const content = await response.json().catch(() => ({ message: "Falha ao reordenar etapas" }));
        throw new Error(content.message ?? "Falha ao reordenar etapas");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kanban", projectId] });
    }
  });
}

export function useDeleteStage(projectId: string, stageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: unknown) => {
      const body = deleteStageSchema.parse(payload);
      const response = await fetch(`/api/projects/${projectId}/stages/${stageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const content = await response.json().catch(() => ({ message: "Falha ao excluir etapa" }));
        throw new Error(content.message ?? "Falha ao excluir etapa");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kanban", projectId] });
    }
  });
}
