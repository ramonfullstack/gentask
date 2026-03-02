import { expect, test } from "@playwright/test";

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

test("create dynamic stage, move task and persist after reload", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  test.skip(!email || !password, "Configure E2E_EMAIL e E2E_PASSWORD para executar este cenário");

  const stageName = `Homologação ${Date.now()}`;
  const stageSlug = toSlug(stageName);
  const taskTitle = `Task DnD ${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Senha").fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/app");
  await page.locator('a[href^="/app/projects/"]').first().click();

  await page.getByPlaceholder("Nova etapa (ex: Em homologação)").fill(stageName);
  await page.getByRole("button", { name: "Criar etapa" }).click();

  await expect(page.getByTestId(`kanban-stage-${stageSlug}`)).toBeVisible();

  await page.getByPlaceholder("Título da tarefa").fill(taskTitle);
  await page.getByRole("button", { name: "Nova tarefa" }).click();

  const taskCard = page.locator("article", { hasText: taskTitle }).first();
  const targetStage = page.getByTestId(`kanban-stage-${stageSlug}`);

  await taskCard.dragTo(targetStage);
  await expect(targetStage.getByText(taskTitle)).toBeVisible();

  await page.reload();
  await expect(page.getByTestId(`kanban-stage-${stageSlug}`).getByText(taskTitle)).toBeVisible();
});
