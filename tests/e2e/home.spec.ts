import { expect, test } from "@playwright/test";

test("home page renders CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /GenTask:/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar conta" })).toBeVisible();
});
