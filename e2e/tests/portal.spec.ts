import { expect, test } from "@playwright/test";
import { URLS } from "../playwright.config";
import { expectAccessible, watchErrors } from "./helpers";

test("portal: el mapa lleva a los 50 distritos de Lima y el Callao", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(URLS.portal + "/mapa");
  await expect(page.locator("h1")).toBeVisible();
  // Cada distrito tiene su enlace (en la grilla o en la tabla accesible de abajo).
  await expect(page.locator('a[href^="/?distrito="]').first()).toBeVisible();
  const ids = await page
    .locator('a[href^="/?distrito="]')
    .evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).searchParams.get("distrito")));
  expect(new Set(ids).size).toBe(50);
  await expectAccessible(page);
  expect(errors).toEqual([]);
});

test("portal: la zona de un distrito muestra su nombre y las líneas de ayuda", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(URLS.portal + "/?distrito=ate");
  await expect(page.getByRole("heading", { level: 1, name: "Ate" })).toBeVisible();
  await expect(page.getByText("105").first()).toBeVisible();
  await expectAccessible(page);
  expect(errors).toEqual([]);
});

test("portal: de la zona al mapa sin recargar la página", async ({ page }) => {
  await page.goto(URLS.portal + "/?distrito=ate");
  await page.getByRole("link", { name: /mapa/i }).first().click();
  await expect(page).toHaveURL(/\/mapa/);
  await expect(page.locator('a[href^="/?distrito="]').first()).toBeVisible();
});
