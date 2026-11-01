import { expect, test } from "@playwright/test";
import { URLS } from "../playwright.config";
import { expectAccessible, watchErrors } from "./helpers";

for (const { path, lang } of [
  { path: "/", lang: "es" },
  { path: "/en/", lang: "en" },
]) {
  test(`landing ${lang}: carga, un solo h1, sin errores y accesible`, async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto(URLS.landing + path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", new RegExp(`^${lang}`));
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    // La franja de ayuda con las líneas oficiales siempre está (nunca se esconde tras un menú).
    await expect(page.getByText("105").first()).toBeVisible();
    await expectAccessible(page);
    expect(errors).toEqual([]);
  });
}
