import { z } from "zod";

export const stageColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Cor deve ser hexadecimal (#RRGGBB)");

export const createStageSchema = z.object({
  name: z.string().min(2).max(60),
  color: stageColorSchema.default("#64748b"),
  isFinal: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export const updateStageSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  color: stageColorSchema.optional(),
  isFinal: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export const reorderStagesSchema = z.object({
  stageIds: z.array(z.string().uuid()).min(1)
});

export const deleteStageSchema = z.object({
  destinationStageId: z.string().uuid().optional()
});
