import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildOpenApi } from "../src/openapi/spec";

/**
 * Escribe docs/openapi.json desde src/openapi/spec.ts. Con --check no escribe: falla si el archivo
 * no coincide con lo que se generaría (el lint de la API lo corre así).
 */
const OUT = fileURLToPath(new URL("../../../docs/openapi.json", import.meta.url));
const doc = buildOpenApi();
const text = `${JSON.stringify(doc, null, 2)}\n`;

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT, "utf8").replace(/\r\n/g, "\n");
  } catch {
    // Si no existe, está desactualizado.
  }
  if (current !== text) {
    console.error("docs/openapi.json está desactualizado. Regenéralo con: pnpm --filter @blindaje/api openapi");
    process.exit(1);
  }
  console.log("docs/openapi.json al día");
} else {
  writeFileSync(OUT, text);
  const ops = Object.values(doc.paths as Record<string, object>).reduce((n, item) => n + Object.keys(item).length, 0);
  console.log(`docs/openapi.json: ${ops} rutas`);
}
