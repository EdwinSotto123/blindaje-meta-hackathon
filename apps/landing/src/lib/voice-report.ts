/**
 * Lee eval/results/voz_distorsion.json en tiempo de build: la voz disfrazada con un cambiador de
 * tono y su reversión, medidas con 28 voces de SLR73 (eval/py/blindaje_eval/voz_distorsion.py). Si
 * no existe o no se puede leer, devuelve null y la landing no muestra la sección: nunca inventa
 * números.
 */
import fs from "node:fs";
import path from "node:path";

export interface VoiceCondition {
  /** Acierto en el primer lugar (0 a 1). */
  top1: number;
  /** Coseno medio con la voz correcta. */
  cosine: number;
  /** Falsos vínculos por cada 100 comparaciones. */
  falsePer100: number;
}

export interface VoiceReport {
  speakers: number;
  semitones: number;
  sweep: [number, number];
  /** Umbral de revisión como probabilidad (0.60) y como coseno, según eval/calibration.json. */
  threshold: number;
  thresholdCosine: number;
  clean: VoiceCondition;
  disguised: VoiceCondition;
  reverted: VoiceCondition;
  /** Fracción de voces donde el barrido encontró el tono exacto del disfraz. */
  exactShift: number;
}

function obj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function condition(v: unknown): VoiceCondition | null {
  const o = obj(v);
  const top1 = num(o?.top1);
  const cosine = num(o?.coseno_correcto_media);
  const falsePer100 = num(o?.falsos_por_100);
  return top1 === null || cosine === null || falsePer100 === null ? null : { top1, cosine, falsePer100 };
}

export function readVoiceReport(): VoiceReport | null {
  const file = process.env.VOICE_REPORT_PATH ?? path.resolve(process.cwd(), "../../eval/results/voz_distorsion.json");
  let root: Record<string, unknown> | null;
  try {
    root = obj(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    return null;
  }
  const d = obj(Array.isArray(root?.disfraces) ? root.disfraces[0] : null);
  const sweep = root?.barrido_semitonos;
  const speakers = num(root?.hablantes);
  const semitones = num(d?.semitonos);
  const threshold = num(root?.umbral_revision);
  const exactShift = num(d?.k_exacto);
  const clean = condition(root?.limpio);
  const disguised = condition(d?.sin_revertir);
  const reverted = condition(d?.revertido);
  if (
    !Array.isArray(sweep) ||
    sweep.length !== 2 ||
    speakers === null ||
    semitones === null ||
    threshold === null ||
    exactShift === null ||
    !clean ||
    !disguised ||
    !reverted
  )
    return null;
  let cal: Record<string, unknown> | null;
  try {
    cal = obj(obj(JSON.parse(fs.readFileSync(path.resolve(path.dirname(file), "../calibration.json"), "utf8")))?.voz);
  } catch {
    return null;
  }
  const a = num(cal?.a);
  const b = num(cal?.b);
  if (a === null || b === null) return null;
  return {
    speakers,
    semitones,
    sweep: [Number(sweep[0]), Number(sweep[1])],
    threshold,
    // La probabilidad calibrada es 1 / (1 + e^(−a(s − b))): llega al umbral en s = b + ln(p / (1 − p)) / a.
    thresholdCosine: b + Math.log(threshold / (1 - threshold)) / a,
    clean,
    disguised,
    reverted,
    exactShift,
  };
}
