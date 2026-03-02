export type StageLike = {
  id: string;
  slug: string;
};

export function slugifyStageName(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "stage";
}

export function ensureUniqueStageSlug(name: string, existingSlugs: string[]): string {
  const base = slugifyStageName(name);
  if (!existingSlugs.includes(base)) {
    return base;
  }

  let cursor = 2;
  let next = `${base}-${cursor}`;

  while (existingSlugs.includes(next)) {
    cursor += 1;
    next = `${base}-${cursor}`;
  }

  return next;
}

export function buildStagePositionUpdates(stageIds: string[]): { id: string; position: number }[] {
  return stageIds.map((id, index) => ({
    id,
    position: (index + 1) * 100
  }));
}

export function moveStageId(stageIds: string[], sourceId: string, targetId: string): string[] {
  const sourceIndex = stageIds.indexOf(sourceId);
  const targetIndex = stageIds.indexOf(targetId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return stageIds;
  }

  const next = [...stageIds];
  const [source] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, source);
  return next;
}
