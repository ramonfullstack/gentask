import { expect, test } from "@playwright/test";

test("navigates through main app routes via sidebar", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  test.skip(!email || !password, "Configure E2E_EMAIL e E2E_PASSWORD para executar este cenário");

  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Senha").fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/app");

  await page.getByRole("link", { name: "Kanban" }).click();
  await expect(page).toHaveURL(/\/app\/kanban/);

  await page.getByRole("link", { name: "Tarefas" }).click();
  await expect(page).toHaveURL(/\/app\/tasks/);

  await page.getByRole("link", { name: "Workflow" }).click();
  await expect(page).toHaveURL(/\/app\/settings\/workflow/);

  await page.getByRole("link", { name: "Projeto" }).click();
  await expect(page).toHaveURL(/\/app\/settings\/project/);
});
