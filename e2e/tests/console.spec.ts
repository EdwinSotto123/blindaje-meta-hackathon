import { expect, test, type Page } from "@playwright/test";
import { URLS } from "../playwright.config";
import { expectAccessible, watchErrors } from "./helpers";

/** Entra con una de las cuentas de demostración del modo simulado. */
async function entrarComo(page: Page, rol: "revisora del equipo" | "analista del equipo" | "administración") {
  await page.goto(URLS.console + "/login");
  await page.getByRole("button", { name: `Entrar como ${rol}` }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

test("consola: la entrada es accesible y no muestra errores", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(URLS.console + "/login");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectAccessible(page);
  expect(errors).toEqual([]);
});

test("consola: la revisora abre la cola de vínculos y el primer vínculo", async ({ page }) => {
  const errors = watchErrors(page);
  await entrarComo(page, "revisora del equipo");
  await page.goto(URLS.console + "/vinculos");
  const primero = page.locator('a[href^="/vinculos/"]').first();
  await expect(primero).toBeVisible();
  await primero.click();
  await expect(page).toHaveURL(/\/vinculos\/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectAccessible(page);
  expect(errors).toEqual([]);
});

for (const ruta of ["/monitoreo", "/alertas", "/vectores", "/auditoria"]) {
  test(`consola: administración ve ${ruta}`, async ({ page }) => {
    const errors = watchErrors(page);
    await entrarComo(page, "administración");
    await page.goto(URLS.console + ruta);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Cargando", { exact: false })).toHaveCount(0, { timeout: 15_000 });
    await expectAccessible(page);
    expect(errors).toEqual([]);
  });
}
