"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCommentSchema } from "@/lib/validations/task";

export type TaskComment = {
  id: string;
  content: string;
  created_at: string;
  author_name: string | null;
};

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: async (): Promise<TaskComment[]> => {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      if (!response.ok) {
        throw new Error("Falha ao carregar comentários");
      }
      return response.json();
    }
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const payload = createCommentSchema.parse({ content });
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Falha ao publicar comentário");
      }

      return response.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] }),
        queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] })
      ]);
    }
  });
}
