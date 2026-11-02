import {
  NivelAutenticidad,
  PromptGuardResult,
  ResultadoAutenticidad,
  textoAutenticidadVictima,
  type EvidenceType,
  type PasoProceso,
} from "@blindaje/shared";
import type { Env } from "../env";
import { parseJsonColumn } from "../lib/db";
import { READ_MODEL, SAM_MODEL } from "./image";
import type {
  FramesContent,
  LecturaContent,
  RedactadaContent,
  SegmentacionContent,
  TranscripcionContent,
} from "./types";

/**
 * "Cómo lo revisamos": el recorrido de cada pieza de evidencia de la víctima, armado solo con lo
 * que de verdad corrió (derivados, huellas, recortes y el costo de la ficha en D1). Reglas:
 *  - Solo SU evidencia. Ningún paso dice si hubo coincidencias con otros casos.
 *  - De la autenticidad, solo qué se usó y el texto corto de siempre; nunca señales ni puntajes.
 *  - Un paso que no corrió no aparece (por ejemplo, Prompt Guard sin clasificador).
 */

export interface HechosEvidencia {
  id: string;
  tipo: EvidenceType;
  status: string;
  received_utc: string;
  /** El SHA-256 que calculó el servidor coincide con el que mandó el celular. */
  huellaCoincide: boolean;
  derivados: Array<{ tipo: string; content_json: string | null }>;
  huellasVoz: { n: number; model: string | null };
  recortes: { n: number; model: string | null };
}

export interface HechosCaso {
  /** Última ficha armada por un modelo para este caso (fila `ficha` de api_costs). */
  ficha: { model: string; ts: string } | null;
  /** Consentimiento comunitario y caso en los índices de comparación. */
  comparado: boolean;
}

/** Nombre legible de un modelo o detector a partir de su id. */
export function nombreTecnologia(id: string): string {
  const v = (re: RegExp) => re.exec(id)?.[1];
  const transcribe = v(/^muse-voice-transcribe-([\d.]+)/);
  if (transcribe) return `Muse Voice Transcribe ${transcribe}`;
  const spark = v(/^muse-spark-([\d.]+)/);
  if (spark) return `Muse Spark ${spark}`;
  const sam = v(/^sam-([\d.]+)/);
  if (sam) return `SAM ${sam}`;
  if (/audioseal/i.test(id)) return "AudioSeal";
  if (/videoseal/i.test(id)) return "Video Seal";
  if (/ecapa/i.test(id)) return "SpeechBrain ECAPA";
  if (/dinov2/i.test(id)) return "DINOv2";
  if (/prompt-guard/i.test(id)) return "Llama Prompt Guard 2";
  return id;
}

/** "a", "a y b", "a, b y c". */
function lista(xs: string[]): string {
  return xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
}

function mayuscula(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function recortar(s: string, n: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
}

function contenido<T>(ev: HechosEvidencia, tipo: string): T | null {
  return parseJsonColumn<T>(ev.derivados.find((d) => d.tipo === tipo)?.content_json);
}

function comparacion(caso: HechosCaso, siPasa: string): string {
  return caso.comparado
    ? `Sirve para notar si ${siPasa}. Se compara sin nombres.`
    : "Solo se compara con otros casos si das permiso.";
}

function contar(n: number, uno: string, varios: string): string {
  return n === 1 ? `1 ${uno}` : `${n} ${varios}`;
}

export function procesoDeEvidencia(ev: HechosEvidencia, caso: HechosCaso): PasoProceso[] {
  const pasos: PasoProceso[] = [
    {
      paso: "Guardado cifrado",
      tecnologia: "AES-256-GCM",
      detalle: ev.huellaCoincide
        ? "La huella SHA-256 de tu celular y la del servidor coinciden: llegó sin cambios."
        : "Se cifró en tu celular y otra vez en la nube.",
    },
  ];

  const tr = contenido<TranscripcionContent>(ev, "transcripcion");
  if (tr?.turns.length) {
    const voces = new Set(tr.turns.filter((t) => t.speaker).map((t) => t.speaker)).size;
    const turnos = contar(tr.turns.length, "turno", "turnos");
    const cuenta = voces ? `${contar(voces, "voz", "voces")} en ${turnos}` : turnos;
    pasos.push({
      paso: "Lo pasamos a texto",
      tecnologia: nombreTecnologia(tr.model),
      detalle: tr.turns.some((t) => t.es_victima)
        ? `${cuenta}. Separamos tu voz de la de quien te habla.`
        : `${cuenta}, con palabras de aquí como Yape, Plin o cupo.`,
    });
  }

  const frames = contenido<FramesContent>(ev, "frames");
  if (frames) {
    pasos.push({
      paso: "Revisamos el video cuadro por cuadro",
      tecnologia: nombreTecnologia(SAM_MODEL),
      detalle: `${frames.frames} cuadros${frames.placa ? ". Encontramos una placa de vehículo" : ""}.`,
    });
  }

  const seg = contenido<SegmentacionContent>(ev, "segmentacion");
  if (seg) {
    const objetos = [...new Set(seg.objetos.map((o) => o.concepto))].filter((c) => c !== "rostro" && c !== "niño");
    pasos.push({
      paso: "Buscamos objetos en la imagen",
      tecnologia: nombreTecnologia(SAM_MODEL),
      detalle: objetos.length
        ? `Encontramos: ${lista(objetos)}.`
        : "No encontramos balas, armas, notas escritas ni placas.",
    });
  }

  const regiones = contenido<RedactadaContent>(ev, "redactada")?.regiones ?? 0;
  if (regiones > 0) {
    pasos.push({
      paso: "Tapamos rostros",
      tecnologia: nombreTecnologia(SAM_MODEL),
      detalle: `${contar(regiones, "rostro", "rostros")} de otras personas, antes de compartir la imagen.`,
    });
  }

  const lec = contenido<LecturaContent>(ev, "lectura");
  if (lec?.texto || lec?.placas?.length) {
    pasos.push({
      paso: "Leímos lo escrito",
      tecnologia: nombreTecnologia(READ_MODEL),
      detalle: lec.texto ? `«${recortar(lec.texto, 90)}»` : `Placa ${lista(lec.placas ?? [])}.`,
    });
  }

  if (ev.huellasVoz.n > 0) {
    pasos.push({
      paso: ev.huellasVoz.n === 1 ? "Huella de la voz de quien te habla" : `Huella de ${ev.huellasVoz.n} voces`,
      tecnologia: nombreTecnologia(ev.huellasVoz.model ?? "ecapa"),
      detalle: `Tu voz queda fuera. ${comparacion(caso, "la misma voz le habló a otras personas")}`,
    });
  }

  if (ev.recortes.n > 0) {
    pasos.push({
      paso: "Huella de la imagen",
      tecnologia: nombreTecnologia(ev.recortes.model ?? "dinov2"),
      detalle: comparacion(caso, "la misma foto le llegó a otra persona, aunque esté recortada"),
    });
  }

  const pg = PromptGuardResult.safeParse(
    parseJsonColumn(ev.derivados.find((d) => d.tipo === "prompt_guard")?.content_json),
  );
  if (pg.success && pg.data.status === "revisado" && pg.data.model) {
    pasos.push({
      paso: "Buscamos órdenes escondidas para la IA",
      tecnologia: nombreTecnologia(pg.data.model),
      detalle: pg.data.marcados
        ? "Encontramos texto que intenta dar órdenes a la IA. Se analiza como dato y nunca se obedece."
        : "No encontramos ninguna.",
    });
  }

  const aut = ResultadoAutenticidad.safeParse(
    parseJsonColumn(ev.derivados.find((d) => d.tipo === "autenticidad")?.content_json),
  );
  if (aut.success && NivelAutenticidad.safeParse(aut.data.nivel).success) {
    const t = aut.data.tecnicas;
    const usados = [
      t.watermark ? nombreTecnologia(t.watermark.detector) : null,
      t.c2pa ? "C2PA" : null,
      aut.data.model ? nombreTecnologia(aut.data.model) : null,
    ].filter((x): x is string => !!x);
    if (usados.length) {
      pasos.push({
        paso: "Revisamos si fue hecho con IA",
        tecnologia: lista(usados),
        // El texto de siempre, sin repetir "Revisamos si fue hecho con IA:".
        detalle: mayuscula(textoAutenticidadVictima(aut.data.nivel).replace(/^Revisamos si fue hecho con IA: /, "")),
      });
    }
  }

  if (caso.ficha && ev.status === "procesado" && ev.received_utc <= caso.ficha.ts) {
    pasos.push({
      paso: "Datos para tu denuncia",
      tecnologia: nombreTecnologia(caso.ficha.model),
      detalle:
        "Monto, plazo, canal de pago y frases, en un formato fijo. Lo que dice la evidencia entra como dato, nunca como orden.",
    });
  }

  if (caso.comparado && ev.status === "procesado") {
    pasos.push({
      paso: "Comparación sin nombres",
      tecnologia: "HMAC-SHA256 y FAISS",
      detalle:
        "Con tu permiso. Números y cuentas se comparan cifrados y una persona del equipo revisa cada parecido. Otras víctimas no ven tus datos y tú no ves los de ellas.",
    });
  }

  return pasos;
}

/** Lee de D1 los hechos de todas las evidencias de un caso y arma el recorrido de cada una. */
export async function procesoDelCaso(env: Env, caseId: string): Promise<Map<string, PasoProceso[]>> {
  const [evRes, derRes, vozRes, recRes, fichaRes, casoRes] = await env.DB.batch([
    env.DB.prepare("SELECT id, tipo, status, received_utc, sha256, sha256_client FROM evidence WHERE case_id = ?").bind(
      caseId,
    ),
    env.DB.prepare(
      "SELECT evidence_id, tipo, content_json FROM derivatives WHERE case_id = ? AND tipo IN ('transcripcion','frames','segmentacion','redactada','lectura','prompt_guard','autenticidad')",
    ).bind(caseId),
    env.DB.prepare(
      "SELECT evidence_id, COUNT(*) AS n, MAX(model) AS model FROM voice_prints WHERE case_id = ? GROUP BY evidence_id",
    ).bind(caseId),
    env.DB.prepare(
      `SELECT c.evidence_id, COUNT(*) AS n, MAX(e.model) AS model FROM image_crops c
       LEFT JOIN embeddings e ON e.ref_type = 'image_crop' AND e.ref_id = c.id
       WHERE c.case_id = ? GROUP BY c.evidence_id`,
    ).bind(caseId),
    env.DB.prepare(
      "SELECT model, ts FROM api_costs WHERE case_id = ? AND operation = 'ficha' AND status IN ('ok','cached') ORDER BY ts DESC LIMIT 1",
    ).bind(caseId),
    env.DB.prepare("SELECT consent_mode, indexed FROM cases WHERE id = ?").bind(caseId),
  ]);
  type Cuenta = { evidence_id: string; n: number; model: string | null };
  const evidencias = evRes!.results as Array<{
    id: string;
    tipo: EvidenceType;
    status: string;
    received_utc: string;
    sha256: string;
    sha256_client: string;
  }>;
  const derivados = derRes!.results as Array<{ evidence_id: string; tipo: string; content_json: string | null }>;
  const voces = vozRes!.results as Cuenta[];
  const recortes = recRes!.results as Cuenta[];
  const ficha = (fichaRes!.results[0] as { model: string; ts: string } | undefined) ?? null;
  const c = casoRes!.results[0] as { consent_mode: string; indexed: number } | undefined;
  const caso: HechosCaso = { ficha, comparado: c?.consent_mode === "comunitario" && c.indexed === 1 };
  const cuenta = (xs: Cuenta[], id: string) => {
    const r = xs.find((x) => x.evidence_id === id);
    return { n: r?.n ?? 0, model: r?.model ?? null };
  };

  return new Map(
    evidencias.map((e) => [
      e.id,
      procesoDeEvidencia(
        {
          id: e.id,
          tipo: e.tipo,
          status: e.status,
          received_utc: e.received_utc,
          huellaCoincide: e.sha256 === e.sha256_client,
          derivados: derivados.filter((d) => d.evidence_id === e.id),
          huellasVoz: cuenta(voces, e.id),
          recortes: cuenta(recortes, e.id),
        },
        caso,
      ),
    ]),
  );
}
