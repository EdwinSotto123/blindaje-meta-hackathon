import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Junta los errores de la consola del navegador y las excepciones sin capturar de la página. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

/** Sin violaciones de WCAG 2.2 A y AA según axe. */
export async function expectAccessible(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const summary = violations.map(
    (v) =>
      `${v.id}: ${v.help}. ${v.nodes
        .slice(0, 3)
        .map((n) => n.html.slice(0, 160))
        .join(" | ")}`,
  );
  expect(summary, "violaciones de accesibilidad").toEqual([]);
}
