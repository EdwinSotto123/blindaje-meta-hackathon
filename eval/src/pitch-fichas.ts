/**
 * Las fichas de los casos A, B y C del demo para la escena "Lee" del pitch de la landing: lo que Muse
 * Spark 1.3 saca de verdad de cada caso con el mismo prompt y esquema de la ficha del sistema
 * (FICHA_SYSTEM, FichaExtraction, extractFichaPiezas con caché). Cada caso va con su transcripción de
 * audio y su mensaje (apps/landing/src/data/casos-demo.json, todo ficticio). Escribe en
 * apps/landing/src/data/pitch.json la parte "fichas": monto, periodicidad, plazo, canal, cuentas,
 * grupo y frases firma.
 *
 * Uso (desde la raíz):
 *   pnpm --filter @blindaje/eval demo:pitch:fichas
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractFichaPiezas } from "./ficha-eval";
import type { PiezaEvidencia } from "./ficha-input";

const LANDING = resolve(import.meta.dirname, "../../apps/landing/src/data");

interface Pieza {
  tipo: "audio" | "texto" | "imagen";
  hora: string;
  texto?: string;
}
interface Caso {
  caso: string;
  contacto: string;
  piezas: Pieza[];
}

const casos = (JSON.parse(readFileSync(resolve(LANDING, "casos-demo.json"), "utf8")) as { casos: Caso[] }).casos;
const fichas: Record<string, unknown> = {};
let costo = 0;
for (const c of casos) {
  const piezas: PiezaEvidencia[] = c.piezas
    .filter((p) => p.texto)
    .map((p, i) => ({
      label: `EV-${c.caso}${i + 1}`,
      tipo: p.tipo === "audio" ? "audio" : "texto",
      recibido: null,
      origen: c.contacto,
      contenido: p.texto!,
    }));
  const { data, cache } = await extractFichaPiezas(`pitch-${c.caso}`, piezas);
  costo += cache ? 0 : data.cost_usd;
  const f = data.output as {
    monto_soles: number | null;
    periodicidad: string | null;
    plazo: string | null;
    canal_pago: string | null;
    identificadores: { tipo: string; valor: string; rol: string }[];
    grupo_que_dice_ser: string | null;
    frases_firma: string[];
  };
  fichas[c.caso] = {
    monto_soles: f.monto_soles,
    periodicidad: f.periodicidad,
    plazo: f.plazo,
    canal_pago: f.canal_pago,
    cuentas: f.identificadores.filter((x) => x.rol !== "contacto").map((x) => ({ tipo: x.tipo, valor: x.valor })),
    grupo: f.grupo_que_dice_ser,
    frases: f.frases_firma.slice(0, 3),
  };
  console.log(c.caso, cache ? "(caché)" : "", JSON.stringify(fichas[c.caso]));
}

const path = resolve(LANDING, "pitch.json");
const pitch = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
pitch.fichas = { modelo: "muse-spark-1.3", fuente: "eval/src/pitch-fichas.ts (FICHA_SYSTEM)", casos: fichas };
writeFileSync(path, JSON.stringify(pitch) + "\n");
console.log(`costo: US$ ${costo.toFixed(4)}`);
