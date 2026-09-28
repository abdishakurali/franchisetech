import { expect, test } from "@playwright/test";

// Fresh browser contexts only. No credentials, signup submissions or tenant writes.
test("operational screens require authentication", async ({ page }) => {
  for (const path of [
    "/app", "/app/pos", "/app/stock", "/app/products", "/app/recipes",
    "/app/purchases/new", "/app/reports", "/app/settings", "/app/setup-checklist",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  }
});
