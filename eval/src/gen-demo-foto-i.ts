import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { metaClient } from "./meta";
import { DEMO_DIR } from "./env";

/**
 * Foto ficticia del caso I (segunda banda, mercado) con Muse Image (muse-image-1.0, 0.01 USD): un
 * puesto de mercado ficticio con una nota manuscrita que exige el cupo semanal. Nada gráfico. Una
 * sola imagen; solo se genera si falta (con --force, otra vez).
 *
 *   pnpm --filter @blindaje/eval demo:foto-i
 *
 * Salida: eval/demo/foto-I.jpg y eval/demo/foto-I.meta.json. La app del demo la comparte junto con
 * el video del caso I (eval/demo/video-I.mp4, armado con ffmpeg a partir de esta foto y el audio I2).
 */

const PROMPT_FOTO_I = [
  "Fotografía realista tomada con un celular, de día, de un puesto ficticio de verduras en un mercado de Lima, Perú.",
  "Toldo azul, cajones de madera con verduras genéricas, una balanza, sin marcas ni logos.",
  "Sobre la balanza hay una hoja de cuaderno cuadriculado con una nota escrita a mano con plumón rojo que dice",
  "'PAGA O CIERRAS. 200 X SEMANA'.",
  "Sin personas, sin rostros, sin armas, sin sangre, sin violencia. Estilo foto de evidencia, luz natural, encuadre horizontal.",
].join(" ");

async function main() {
  const out = resolve(DEMO_DIR, "foto-I.jpg");
  if (!process.argv.includes("--force") && existsSync(out)) {
    console.log("foto-I.jpg ya existe (usa --force para regenerar).");
    return;
  }
  const r = await metaClient().images.generate(
    { prompt: PROMPT_FOTO_I, n: 1, size: "1536x1024", outputFormat: "jpeg" },
    { operation: "eval_demo_foto" },
  );
  if (!r.images.length) throw new Error("Muse Image no devolvió la imagen");
  writeFileSync(out, Buffer.from(r.images[0]!.b64, "base64"));
  writeFileSync(
    resolve(DEMO_DIR, "foto-I.meta.json"),
    JSON.stringify(
      {
        ficticio: true,
        modelo: "muse-image-1.0",
        prompt: PROMPT_FOTO_I,
        generado: new Date().toISOString(),
        archivos: ["foto-I.jpg"],
        nota: "Imagen sintética generada para el demo de Blindaje. No retrata un lugar ni un hecho real.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Listo: ${out}`);
}

main().catch((e) => {
  console.error(`gen-demo-foto-i falló: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
