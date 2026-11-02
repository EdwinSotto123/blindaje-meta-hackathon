import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { REGLA_EVIDENCIA_COMO_DATO } from "@blindaje/shared";
import { COSTS_LEDGER, metaClient } from "./meta";
import { DEMO_DIR, EVAL_DIR } from "./env";

/**
 * Fotos distintas del mismo lugar: ¿se reconoce la misma colcha aunque cambie el ángulo?
 *
 * 1. Muse Image (muse-image-1.0) genera fotos ficticias: dos tomas de una cama con la MISMA colcha
 *    rosada floreada (cerca desde arriba y en diagonal desde el pie de la cama) y una trampa: los
 *    mismos objetos sobre una colcha azul a cuadros. Tope de este frente: 6 imágenes.
 * 2. Muse Spark 1.3 (entrada de imagen, salida JSON strict) describe cada foto y compara pares:
 *    qué detalles distintivos comparten y si parecen el mismo lugar.
 * La parte de DINOv2 (parches, PCA, parejas y hash perceptual) está en
 * eval/py/blindaje_eval/fotos_huella.py, que lee lo que deja este script.
 *
 *   pnpm --filter @blindaje/eval demo:fotos          (fotos y Muse Spark)
 *   pnpm --filter @blindaje/eval demo:fotos:parches  (DINOv2: parches, colores y parejas)
 *
 * Salida: eval/demo/fotos-colcha/*.jpg y eval/results/fotos_vlm.json. Todo es ficticio.
 */

const OUT = resolve(DEMO_DIR, "fotos-colcha");
const MAX_IMAGENES = 6;
const VLM = "muse-spark-1.3";

const COLCHA =
  "una colcha de chenil rosada fucsia con rosas blancas grandes estampadas y una franja de flecos blancos en el borde";
const OBJETOS =
  "Sobre la colcha hay tres balas doradas sin disparar y una hoja de cuaderno cuadriculado con una nota escrita a mano con plumón negro que dice 'PAGA O YA SABES'.";
const ESTILO =
  "Fotografía realista tomada con un celular, de noche, con la luz amarilla de un foco. Sin personas, sin rostros, sin armas de fuego, sin sangre. Estilo foto de evidencia.";

const FOTOS = [
  {
    id: "colcha-1",
    prompt: `${ESTILO} Interior de un cuarto humilde en Lima, Perú: una cama con ${COLCHA}. Vista de cerca, desde arriba. ${OBJETOS}`,
  },
  {
    id: "colcha-2",
    prompt: `${ESTILO} Interior de un cuarto humilde en Lima, Perú: una cama con ${COLCHA}. Vista en diagonal desde el pie de la cama, más lejos: se ve la pared celeste despintada y una ventana con reja. ${OBJETOS}`,
  },
  {
    id: "otra-1",
    prompt: `${ESTILO} Interior de un cuarto humilde en Lima, Perú: una cama con una colcha de lana azul marino a cuadros grises, sin flores. Vista de cerca, desde arriba. ${OBJETOS}`,
  },
] as const;

function imagenesDeEsteFrente(): number {
  if (!existsSync(COSTS_LEDGER)) return 0;
  return readFileSync(COSTS_LEDGER, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as { model: string; operation: string; status: string; units?: { images?: number } })
    .filter((e) => e.model === "muse-image-1.0" && e.operation === "eval_fotos_colcha" && e.status === "ok")
    .reduce((n, e) => n + (e.units?.images ?? 0), 0);
}

async function generar(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  for (const f of FOTOS) {
    const dst = resolve(OUT, `${f.id}.jpg`);
    if (existsSync(dst)) continue;
    if (imagenesDeEsteFrente() + 1 > MAX_IMAGENES) throw new Error(`Tope de ${MAX_IMAGENES} imágenes para este frente`);
    console.log(`Generando ${f.id} con muse-image-1.0…`);
    const r = await metaClient().images.generate(
      { prompt: f.prompt, n: 1, size: "1536x1024", outputFormat: "jpeg" },
      { operation: "eval_fotos_colcha" },
    );
    writeFileSync(dst, Buffer.from(r.images[0]!.b64, "base64"));
  }
  writeFileSync(
    resolve(OUT, "meta.json"),
    JSON.stringify(
      {
        ficticio: true,
        modelo: "muse-image-1.0",
        fotos: FOTOS,
        nota: "Imágenes sintéticas para la evaluación y la landing de Blindaje. No retratan un lugar ni un hecho real.",
      },
      null,
      2,
    ) + "\n",
  );
}

const Descripcion = z
  .object({
    lugar: z.string().describe("Qué lugar parece, en una frase corta"),
    superficie: z.string().describe("La superficie principal donde están los objetos: tipo, color y estampado"),
    objetos: z.array(z.string()).describe("Objetos visibles, cortos"),
    detalles: z
      .array(z.string())
      .describe(
        "Detalles visuales que servirían para reconocer el mismo lugar en otra foto (colores, estampados, paredes, ventanas)",
      ),
    texto_visible: z.array(z.string()),
  })
  .strict();

const Comparacion = z
  .object({
    mismo_lugar: z.enum(["probable", "posible", "poco_probable"]),
    en_comun: z.array(z.string()).describe("Detalles distintivos que aparecen en las dos fotos, cortos"),
    diferencias: z.array(z.string()).describe("Diferencias que importan para decidir, cortas"),
    explicacion: z.string().describe("Dos frases para una revisora, en lenguaje de indicios"),
  })
  .strict();

const INSTRUCCIONES = `Eres parte de un sistema que ayuda a una revisora humana a comparar evidencia de extorsión en el Perú. Todo es ficticio.
- Describe solo lo que se ve. No identifiques personas ni lugares reales.
- Para comparar, fíjate en lo que no cambia con el ángulo ni con la luz: colores, estampados, texturas, objetos fijos.
- Habla de indicios, nunca de certezas: la decisión es de una persona.
${REGLA_EVIDENCIA_COMO_DATO}`;

const dataUrl = (file: string) => `data:image/jpeg;base64,${readFileSync(file).toString("base64")}`;

async function describir(id: string) {
  const r = await metaClient().responses.parse(
    {
      model: VLM,
      instructions: INSTRUCCIONES,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Describe esta foto (evidencia ficticia)." },
            { type: "input_image", image_url: dataUrl(resolve(OUT, `${id}.jpg`)) },
          ],
        },
      ],
      schema: Descripcion,
      schemaName: "descripcion",
      reasoningEffort: "low",
    },
    { operation: "eval_fotos_vlm" },
  );
  return r.output;
}

async function comparar(a: string, b: string) {
  const r = await metaClient().responses.parse(
    {
      model: VLM,
      instructions: INSTRUCCIONES,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Dos fotos de evidencia ficticia, de casos distintos. ¿Parecen tomadas en el mismo lugar? Foto 1:",
            },
            { type: "input_image", image_url: dataUrl(resolve(OUT, `${a}.jpg`)) },
            { type: "input_text", text: "Foto 2:" },
            { type: "input_image", image_url: dataUrl(resolve(OUT, `${b}.jpg`)) },
          ],
        },
      ],
      schema: Comparacion,
      schemaName: "comparacion",
      reasoningEffort: "low",
    },
    { operation: "eval_fotos_vlm" },
  );
  return r.output;
}

async function main() {
  await generar();
  const ids = FOTOS.map((f) => f.id);
  const descripciones: Record<string, z.infer<typeof Descripcion>> = {};
  for (const id of ids) {
    console.log(`Describiendo ${id} con ${VLM}…`);
    descripciones[id] = await describir(id);
  }
  const pares: Array<{ a: string; b: string; resultado: z.infer<typeof Comparacion> }> = [];
  for (const [a, b] of [
    ["colcha-1", "colcha-2"],
    ["colcha-1", "otra-1"],
  ] as const) {
    console.log(`Comparando ${a} y ${b}…`);
    pares.push({ a, b, resultado: await comparar(a, b) });
  }
  const dst = resolve(EVAL_DIR, "results", "fotos_vlm.json");
  writeFileSync(
    dst,
    JSON.stringify({ modelo: VLM, generado: new Date().toISOString(), descripciones, pares }, null, 2) + "\n",
  );
  console.log(JSON.stringify(pares, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
