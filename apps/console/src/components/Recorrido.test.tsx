import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { Recorrido } from "./Recorrido";

describe("recorrido sugerido de la cuenta de jurado", () => {
  it("lleva a las cuatro paradas en orden, con una línea en inglés y un botón para ocultarlo", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Recorrido />
      </MemoryRouter>,
    );
    expect([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])).toEqual(["/vinculos", "/alertas", "/vectores", "/auditoria"]);
    expect(html).toContain('lang="en"');
    expect(html).toContain("Ocultar");
  });
});
