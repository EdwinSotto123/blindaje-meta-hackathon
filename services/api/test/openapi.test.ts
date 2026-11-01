import { describe, expect, it } from "vitest";
import { app } from "../src/app";
import { ROUTES, buildOpenApi } from "../src/openapi/spec";

/** `METHOD /ruta/{id}` de cada ruta montada en la app, sin los middlewares (método ALL). */
function appRoutes(): string[] {
  const set = new Set<string>();
  for (const r of app.routes) {
    if (r.method === "ALL") continue;
    set.add(`${r.method} ${r.path.replace(/:(\w+)/g, "{$1}")}`);
  }
  return [...set].sort();
}

describe("OpenAPI (docs/openapi.json)", () => {
  it("la tabla de src/openapi/spec.ts tiene exactamente las rutas de la app", () => {
    const enLaApp = appRoutes();
    const enLaTabla = [...new Set(ROUTES.map((r) => `${r.method.toUpperCase()} ${r.path}`))].sort();
    expect({
      faltan_en_la_tabla: enLaApp.filter((r) => !enLaTabla.includes(r)),
      sobran_en_la_tabla: enLaTabla.filter((r) => !enLaApp.includes(r)),
    }).toEqual({ faltan_en_la_tabla: [], sobran_en_la_tabla: [] });
  });

  it("arma el documento con una operación por ruta", () => {
    const doc = buildOpenApi() as { paths: Record<string, Record<string, unknown>> };
    const ops = Object.values(doc.paths).reduce((n, item) => n + Object.keys(item).length, 0);
    expect(ops).toBe(appRoutes().length);
  });
});
