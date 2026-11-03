/**
 * Lo que el pitch de la landing (Pitch.astro) muestra de los textos de los casos, calculado con las
 * mismas funciones del sistema y sin llamar a ninguna API (todo sale de la caché de la evaluación):
 *
 * - lee:      la ficha que Muse Spark 1.3 sacó del caso A (eval/data/cache/ficha/DEMO-A-*.json, la de
 *             mo-eval: mismas piezas que sube demo:seed) y, en cada pieza de evidencia, dónde aparece
 *             cada dato de la ficha (monto, plazo, cuenta, grupo y frases firma).
 * - fichas:   lo esencial de las fichas de A a G.
 * - numeros:  cada teléfono y cuenta de las fichas, normalizado con normalizeIdentifier y cifrado con
 *             hmacIdentifier (HMAC-SHA256 de "grupo:valor"), como el pipeline, pero con una clave de
 *             demostración: la clave de la alianza nunca sale del servidor.
 * - patrones: las frases firma que se repiten entre casos (commonPhrases), el parecido del resumen
 *             (e5, de la caché de text-embed) y la x de la logística del MO para cada par de los 32
 *             guiones ficticios (mismo guion o banda frente a distintos) y para los pares del demo.
 * - vigia:    el día y el distrito de cada caso del demo, y la regla del Vigía (5 casos de 3 víctimas
 *             en 14 días).
 *
 * Escribe esas partes en apps/landing/src/data/pitch.json (el radar lo pone pitch_datos.py).
 * Uso (desde eval/):
 *   pnpm demo:pitch:texto
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  combineSignals,
  hmacIdentifier,
  identifierLabel,
  importAllianceKey,
  lastThree,
  logistic,
  normalizeIdentifier,
  type FichaExtraction,
  type IdentifierType,
} from "@blindaje/shared";
import { commonPhrases, sameGroup } from "../../services/api/src/linking/signals";
import { CACHE_DIR, DEMO_DIR, EVAL_DIR } from "./env";
import { loadGuiones } from "./data";

const LANDING = resolve(EVAL_DIR, "../apps/landing/src/data");
const CASOS = ["A", "B", "C", "D", "E", "F", "G"] as const;
const r3 = (x: number) => Math.round(x * 1000) / 1000;

// ---------- Fichas del demo (la última de la caché de cada caso) ----------
const FICHA_DIR = resolve(CACHE_DIR, "ficha");
function fichaDemo(code: string): FichaExtraction {
  const files = readdirSync(FICHA_DIR)
    .filter((f) => f.startsWith(`DEMO-${code}-`))
    .map((f) => JSON.parse(readFileSync(resolve(FICHA_DIR, f), "utf8")) as { ts: string; output: FichaExtraction })
    .sort((a, b) => b.ts.localeCompare(a.ts));
  if (!files[0]) throw new Error(`Falta la ficha del caso ${code}: corre antes pnpm eval (mo-eval)`);
  return files[0].output;
}
const fichas = Object.fromEntries(CASOS.map((c) => [c, fichaDemo(c)])) as Record<string, FichaExtraction>;

// ---------- 1. Lee: dónde está cada dato de la ficha del caso A ----------
const demo = JSON.parse(readFileSync(resolve(DEMO_DIR, "demo.json"), "utf8")) as {
  casos: {
    code: string;
    zona: string;
    sector: string;
    evidencia: { tipo: string; archivo?: string; texto?: string; dia: number }[];
  }[];
};
const guionesAudio = JSON.parse(readFileSync(resolve(DEMO_DIR, "guiones-audio.json"), "utf8")).audios as Record<
  string,
  { texto: string }
>;
const fA = fichas.A!;
// Formas habladas de los datos (el audio dice "dos mil soles"; la ficha guarda 2000).
const TERMINOS: { kind: string; t: string[] }[] = [
  { kind: "monto", t: ["S/ 2,000", "dos mil soles"] },
  { kind: "plazo", t: ["48 horas", "cuarenta y ocho horas"] },
  { kind: "cuenta", t: fA.identificadores.filter((i) => i.rol === "cobro").map((i) => i.valor) },
  { kind: "grupo", t: fA.grupo_que_dice_ser ? [fA.grupo_que_dice_ser] : [] },
  { kind: "frase", t: fA.frases_firma },
];
function marcas(texto: string) {
  const out: { a: number; b: number; kind: string }[] = [];
  const low = texto.toLowerCase();
  for (const { kind, t } of TERMINOS) {
    for (const term of t) {
      const i = low.indexOf(term.toLowerCase().replace(/[.,]$/, ""));
      if (i < 0) continue;
      const b = i + term.replace(/[.,]$/, "").length;
      if (out.some((m) => i < m.b && b > m.a)) continue;
      out.push({ a: i, b, kind });
    }
  }
  return out.sort((x, y) => x.a - y.a);
}
const casoA = demo.casos.find((c) => c.code === "A")!;
const piezasA = casoA.evidencia
  .filter((e) => e.tipo !== "imagen")
  .map((e, i) => {
    const texto =
      e.tipo === "audio" ? guionesAudio[e.archivo!.replace(/^audio\//, "").replace(/\.ogg$/, "")]!.texto : e.texto!;
    return { label: `EV-A${i + 1}`, tipo: e.tipo, texto, marcas: marcas(texto) };
  });

// ---------- 2. Fichas de A a G (lo que se muestra) ----------
const resumen = Object.fromEntries(
  CASOS.map((c) => {
    const f = fichas[c]!;
    return [
      c,
      {
        tipo_amenaza: f.tipo_amenaza,
        monto_soles: f.monto_soles,
        periodicidad: f.periodicidad,
        plazo: f.plazo,
        canal_pago: f.canal_pago,
        grupo: f.grupo_que_dice_ser,
        frases: f.frases_firma,
        identificadores: f.identificadores.map((i) => ({ tipo: i.tipo, valor: i.valor, rol: i.rol })),
        fuentes: f.fuentes,
      },
    ];
  }),
);

// ---------- 3. Números: normalizar y cifrar como el pipeline, con una clave de demostración ----------
const demoKey = createHash("sha256").update("blindaje-landing-clave-de-demostracion").digest("base64url");
const key = await importAllianceKey(demoKey);
const numeros = [];
for (const c of CASOS) {
  for (const i of fichas[c]!.identificadores) {
    const normalizado = normalizeIdentifier(i.tipo as IdentifierType, i.valor);
    if (!normalizado) continue;
    const hmac = await hmacIdentifier(key, i.tipo as IdentifierType, normalizado);
    numeros.push({
      caso: c,
      rol: i.rol,
      tipo: i.tipo,
      valor: i.valor,
      normalizado,
      hmac: hmac.slice(0, 16),
      ref: identifierLabel(hmac),
      ultimos: lastThree(normalizado),
    });
  }
}

// ---------- 4. Patrones de habla ----------
const cal = JSON.parse(readFileSync(resolve(EVAL_DIR, "calibration.json"), "utf8")) as {
  mo: { a: number; b: number; p_max: number };
  voz: { a: number; b: number; p_max: number };
  identificador: { p: number };
  thresholds: { probable: number; revisar: number };
};
const mo = JSON.parse(readFileSync(resolve(CACHE_DIR, "results", "mo.json"), "utf8")) as {
  guiones: Record<string, { ficha: FichaExtraction; vector: number[] }>;
};
const familias = new Map(loadGuiones().guiones.map((g) => [g.id, g.familia]));
const textCache = JSON.parse(readFileSync(resolve(CACHE_DIR, "text-embed.json"), "utf8")) as Record<
  string,
  { v: number[] }
>;
const vecOf = (t: string) => textCache[createHash("sha256").update(`passage\u0000${t}`).digest("hex")]?.v ?? null;
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
const moX = (fa: FichaExtraction, fb: FichaExtraction, cos: number) => {
  const frases = commonPhrases(fa.frases_firma ?? [], fb.frases_firma ?? []);
  const canal = Boolean(fa.canal_pago && fa.canal_pago === fb.canal_pago);
  const grupo = sameGroup(fa.grupo_que_dice_ser, fb.grupo_que_dice_ser);
  const x = cos + 0.05 * Math.min(frases.length, 3) + (canal ? 0.03 : 0) + (grupo ? 0.05 : 0);
  return { x, frases, canal, grupo, p: Math.min(logistic(x, cal.mo.a, cal.mo.b), cal.mo.p_max) };
};
const G = Object.entries(mo.guiones).map(([id, g]) => ({ id, familia: familias.get(id) ?? "?", ...g }));
const xMismo: number[] = [];
const xDistintos: number[] = [];
const cosTodos: number[] = [];
for (let i = 0; i < G.length; i++)
  for (let j = i + 1; j < G.length; j++) {
    const a = G[i]!;
    const b = G[j]!;
    const cos = dot(a.vector, b.vector);
    const { x } = moX(a.ficha, b.ficha, cos);
    cosTodos.push(cos);
    (a.familia === b.familia && a.familia !== "sin_grupo" ? xMismo : xDistintos).push(r3(x));
  }
const demoPar = (a: string, b: string) => {
  const va = vecOf(fichas[a]!.resumen_mo);
  const vb = vecOf(fichas[b]!.resumen_mo);
  if (!va || !vb) throw new Error(`Falta el vector del resumen de ${a} o ${b} en text-embed.json`);
  const cos = dot(va, vb);
  const m = moX(fichas[a]!, fichas[b]!, cos);
  return {
    par: `${a}-${b}`,
    coseno: r3(cos),
    frases: m.frases,
    canal: m.canal,
    grupo: m.grupo,
    x: r3(m.x),
    p: r3(m.p),
  };
};
// Las frases firma que se repiten entre los casos del demo, con en qué casos aparecen.
const grupos: { frase: string; casos: string[] }[] = [];
for (const c of CASOS)
  for (const f of fichas[c]!.frases_firma) {
    const g = grupos.find((x) => commonPhrases([x.frase], [f]).length > 0);
    if (g) {
      if (!g.casos.includes(c)) g.casos.push(c);
    } else grupos.push({ frase: f, casos: [c] });
  }
const vA = vecOf(fA.resumen_mo);
const vB = vecOf(fichas.B!.resumen_mo);

// ---------- 5. Combinar señales (par A-B y par B-C del demo) ----------
// La voz de A y B sale de mo.json (verificación a_demo_AB, con la calibración de la evaluación); la de B
// y C, del coseno del radar (pitch_datos.py) con la misma logística de la voz.
const verif = (
  JSON.parse(readFileSync(resolve(CACHE_DIR, "results", "mo.json"), "utf8")) as {
    report: { verificaciones: { a_demo_AB: { p_voz: number } } };
  }
).report.verificaciones.a_demo_AB;
const radar = (JSON.parse(readFileSync(resolve(LANDING, "pitch.json"), "utf8")) as { radar: { caso_c: number } }).radar;
const ab = demoPar("A", "B");
const bc = demoPar("B", "C");
const vozBC = Math.min(logistic(radar.caso_c, cal.voz.a, cal.voz.b), cal.voz.p_max);
const combina = {
  ab: { voz: verif.p_voz, guion: ab.p, cuenta: 0, total: r3(combineSignals([verif.p_voz, ab.p])) },
  bc: {
    voz: r3(vozBC),
    guion: bc.p,
    cuenta: cal.identificador.p,
    total: r3(combineSignals([vozBC, bc.p, cal.identificador.p])),
  },
  revisar: cal.thresholds.revisar,
  probable: cal.thresholds.probable,
};

// ---------- 6. Vigía ----------
const vigia = {
  ventana: 14,
  min_casos: 5,
  min_victimas: 3,
  casos: demo.casos.map((c) => ({
    caso: c.code,
    zona: c.zona,
    sector: c.sector,
    dia: Math.max(...c.evidencia.map((e) => e.dia)),
    grupo: fichas[c.code]?.grupo_que_dice_ser ?? null,
  })),
};

const path = resolve(LANDING, "pitch.json");
const pitch = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
delete pitch.fichas;
Object.assign(pitch, {
  lee: { modelo: "muse-spark-1.3", piezas: piezasA },
  casos: resumen,
  numeros: { clave: "de demostración", items: numeros },
  patrones: {
    frases: grupos.filter((g) => g.casos.length > 1).sort((a, b) => b.casos.length - a.casos.length),
    coseno_media: r3(cosTodos.reduce((s, v) => s + v, 0) / cosTodos.length),
    vector_a: vA ? vA.map((v) => r3(v)) : null,
    vector_b: vB ? vB.map((v) => r3(v)) : null,
    x_mismo: xMismo,
    x_distintos: xDistintos,
    cal: cal.mo,
    pares: [ab, demoPar("A", "C")],
  },
  combina,
  vigia,
});
writeFileSync(path, JSON.stringify(pitch) + "\n");
console.log(
  JSON.stringify(
    {
      lee: piezasA.map((p) => [p.label, p.marcas.length]),
      numeros: numeros.length,
      frases: grupos.filter((g) => g.casos.length > 1).map((g) => [g.frase, g.casos.join("")]),
      x: { mismo: xMismo.length, distintos: xDistintos.length },
      pares: [ab, demoPar("A", "C")],
      combina,
    },
    null,
    1,
  ),
);
