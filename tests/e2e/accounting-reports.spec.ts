import { expect, test } from "@playwright/test";

const email = process.env.E2E_REPORTS_EMAIL;
const password = process.env.E2E_REPORTS_PASSWORD;

test.describe("owner accounting reports", () => {
  test.skip(!email || !password, "Requires an isolated owner fixture via E2E_REPORTS_EMAIL and E2E_REPORTS_PASSWORD");

  test("opens every report requested for the accountant without a billing redirect", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(email!);
    await page.locator("#password").fill(password!);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/app(?:\?|$)/);

    await page.goto("/app/reports");
    const reports = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Rapoarte contabile" }),
    });
    const requested = [
      ["Detalii Vânzări", "/app/reports/detalii-vanzari"],
      ["Raport de gestiune", "/app/reports/gestiune"],
      ["Bon de consum", "/app/reports/consum"],
      ["Registru de Casă", "/app/reports/registru-de-casa"],
    ] as const;

    for (const [name, path] of requested) {
      await expect(reports.getByRole("link", { name })).toHaveAttribute("href", path);
    }

    for (const [, path] of requested) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path}(?:\\?|$)`));
      await expect(page).not.toHaveURL(/\/app\/billing/);
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});
