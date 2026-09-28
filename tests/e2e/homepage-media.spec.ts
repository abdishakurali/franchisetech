import { expect, test } from "@playwright/test";

test("homepage media, offline details and shared language preference", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?lang=ro");
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page.locator("#offline")).toContainText("maximum 20");
  await expect(page.locator("#client-video iframe")).toHaveCount(0);

  await page.getByRole("tab", { name: "Vânzări", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Stoc", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Mărește imaginea", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();

  for (const name of ["Datecs DP25", "Datecs DP150", "Datecs FP700"]) {
    const image = page.getByRole("img", { name, exact: true });
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element: HTMLImageElement) =>
            element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }

  await page.locator("#client-video button").click();
  await expect(page.locator("#client-video iframe")).toHaveAttribute(
    "src",
    /Uioqt3bKenE/,
  );
  await page.locator("#in-cafe summary").click();
  await expect(page.locator("#in-cafe video")).toBeVisible();
  await expect(page.locator("#in-cafe video")).toHaveAttribute("controls", "");

  await page
    .locator("#adevar-unic")
    .getByRole("button", { name: "English", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText(
    "POS and stock management for your business.",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("franchisetech:marketingLocale"),
      ),
    )
    .toBe("en");
  await page.goto("/pricing");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(
    "POS and stock management for your business.",
  );
  await page.reload();
  await expect(page.locator("h1")).toHaveText(
    "POS and stock management for your business.",
  );
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
});

test("explicit language links win over an existing preference", async ({
  page,
}) => {
  await page.goto("/?lang=en");
  await expect(page.locator("h1")).toHaveText(
    "POS and stock management for your business.",
  );
  await page.goto("/?lang=ro");
  await expect(page.locator("h1")).toHaveText(
    "POS și gestiune pentru localul tău.",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
});
