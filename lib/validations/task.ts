import { z } from "zod";

export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const checklistItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  done: z.boolean()
});

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  stageId: z.string().uuid().optional(),
  priority: taskPrioritySchema.default("medium"),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
  labels: z.array(z.string().min(1)).default([]),
  checklist: z.array(checklistItemSchema).default([])
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  stageId: z.string().uuid().optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
  labels: z.array(z.string().min(1)).optional(),
  checklist: z.array(checklistItemSchema).optional()
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(4000)
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
