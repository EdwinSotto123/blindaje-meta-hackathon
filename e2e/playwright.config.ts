import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de punta a punta sobre los builds de producción servidos en local: la landing, el portal y
 * la consola en modo simulado (datos ficticios, sin API). Antes hay que compilarlos:
 *   pnpm --filter @blindaje/landing build
 *   pnpm --filter @blindaje/portal build:mock
 *   pnpm --filter @blindaje/console build:mock
 * En CI se usa el Chromium de Playwright; en local, el Chrome instalado (sin descargar navegadores).
 */
const CI = !!process.env.CI;

export const URLS = {
  landing: "http://localhost:4400",
  console: "http://localhost:4401",
  portal: "http://localhost:4402",
} as const;

export default defineConfig({
  testDir: "./tests",
  // En serie: los servidores de preview locales abortan navegaciones con varias pestañas a la vez.
  workers: 1,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["github"], ["list"]] : "list",
  use: { trace: "retain-on-failure" },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], ...(CI ? {} : { channel: "chrome" }) } },
    { name: "celular", use: { ...devices["Pixel 7"], ...(CI ? {} : { channel: "chrome" }) } },
  ],
  webServer: [
    {
      command: "pnpm --filter @blindaje/landing exec astro preview --port 4400",
      url: URLS.landing,
      reuseExistingServer: !CI,
    },
    {
      command: "pnpm --filter @blindaje/console exec vite preview --port 4401 --strictPort",
      url: URLS.console,
      reuseExistingServer: !CI,
    },
    {
      command: "pnpm --filter @blindaje/portal exec vite preview --port 4402 --strictPort",
      url: URLS.portal,
      reuseExistingServer: !CI,
    },
  ],
});
