import { describe, expect, it } from "vitest";
import { buildStagePositionUpdates, ensureUniqueStageSlug, moveStageId, slugifyStageName } from "@/lib/stages/service";

describe("stage service", () => {
  it("slugifies stage names", () => {
    expect(slugifyStageName("Pull Request")).toBe("pull-request");
    expect(slugifyStageName("  Etapa Final  ")).toBe("etapa-final");
  });

  it("generates unique stage slugs", () => {
    const slug = ensureUniqueStageSlug("Review", ["review", "review-2"]);
    expect(slug).toBe("review-3");
  });

  it("builds ordered positions", () => {
    expect(buildStagePositionUpdates(["a", "b", "c"])).toEqual([
      { id: "a", position: 100 },
      { id: "b", position: 200 },
      { id: "c", position: 300 }
    ]);
  });

  it("moves stage ids in array", () => {
    const moved = moveStageId(["a", "b", "c", "d"], "a", "c");
    expect(moved).toEqual(["b", "c", "a", "d"]);
  });
});
