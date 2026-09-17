import { expect, test } from "@playwright/test";

test("marketing routes lead to signup without submitting customer data", async ({ page }) => {
  for (const path of ["/", "/features", "/industries", "/features/echipamente", "/pricing", "/compare", "/blog"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(page.locator('a[href^="/signup"]:visible').first()).toBeVisible();
  }
  await page.goto("/");
  const menu = page.locator('summary[aria-label="Deschide meniul"]');
  const mobile = await menu.isVisible();
  if (mobile) await menu.click();
  const nav = page.getByRole("navigation", { name: mobile ? "Navigare mobilă" : "Navigare principală" });
  await nav.getByRole("link", { name: "Comparații" }).click();
  await expect(page).toHaveURL(/\/compare$/);
  await expect(page.locator("h1")).toContainText("Comparații");
  await page.goto("/");
  if (mobile) await menu.click();
  await page.getByRole("navigation", { name: mobile ? "Navigare mobilă" : "Navigare principală" }).getByRole("link", { name: "Ghiduri" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await page.locator('a[href="/signup?plan=starter"]:visible').first().click();
  await expect(page).toHaveURL(/\/signup\?plan=starter/);
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test("five settings sections remain present while editors open inline", async ({ page }) => {
  await page.goto("/design-review");
  for (const section of ["units", "payments", "categories", "location", "fiscal"]) {
    await expect(page.locator(`#settings-${section}`)).toBeVisible();
  }
  await expect(page.locator("#settings-units li")).toHaveCount(6);
  for (const section of ["units", "payments", "categories", "location"]) {
    const panel = page.locator(`#settings-${section}`);
    await panel.getByRole("button", { name: "Gestionează" }).click();
    await expect(page.locator(`#editor-${section}`)).toBeVisible();
    await expect(page).toHaveURL(/\/design-review$/);
    await panel.getByRole("button", { name: "Închide", exact: true }).click();
    await expect(page.locator(`#editor-${section}`)).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Configurare și verificare" }).click();
  await expect(page.locator("#editor-fiscal")).toBeVisible();
  await page.getByRole("button", { name: "Închide configurarea" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: `test-results/settings-${test.info().project.name}.png`, fullPage: true });
});
