import { describe, expect, it } from "vitest";
import { updateTaskSchema } from "@/lib/validations/task";

describe("updateTaskSchema", () => {
  it("accepts valid task payload", () => {
    const result = updateTaskSchema.safeParse({
      title: "Task title",
      stageId: "550e8400-e29b-41d4-a716-446655440000",
      priority: "high",
      labels: ["ux", "backend"]
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid stage id", () => {
    const result = updateTaskSchema.safeParse({
      stageId: "not-uuid"
    });

    expect(result.success).toBe(false);
  });
});
