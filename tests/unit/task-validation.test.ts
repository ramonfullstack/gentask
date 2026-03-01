import { describe, expect, it } from "vitest";
import { updateTaskSchema } from "@/lib/validations/task";

describe("updateTaskSchema", () => {
  it("accepts valid task payload", () => {
    const result = updateTaskSchema.safeParse({
      title: "Task title",
      status: "in_progress",
      priority: "high",
      labels: ["ux", "backend"]
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateTaskSchema.safeParse({
      status: "blocked"
    });

    expect(result.success).toBe(false);
  });
});
