import { Hono } from "hono";
import { LeakTraceResult } from "@blindaje/shared";
import { audit } from "../../audit";
import { buildCaseSide, caseTranscripts, getConsoleCase } from "../../console/views";
import {
  derivativeFile,
  getEvidence,
  MAX_EVIDENCE_BYTES,
  readDerivativePlain,
  readEvidencePlain,
} from "../../evidence";
import { detectLeakKind, markCopy, traceLeak } from "../../leaks";
import { readBodyLimited } from "../../lib/body";
import { sha256Hex } from "../../lib/crypto";
import { ApiError, notFound } from "../../lib/errors";
import { parseQuery } from "../../lib/http";
import { trimWav } from "../../lib/wav";
import { getAuth } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { actorOf, type AppEnv } from "../../types";
import { MediaQuery } from "../schemas";
import { adminOnly, centralTeam } from "./guards";

/** Evidencia y casos. */
export const evidenciaRoutes = new Hono<AppEnv>();

evidenciaRoutes.get("/evidence/:id/media", centralTeam, async (c) => {
  const auth = getAuth(c);
  const q = parseQuery(c, MediaQuery);
  const ev = await getEvidence(c.env, c.req.param("id"));
  if (!ev) throw notFound("Evidencia");
  await getConsoleCase(c.env, ev.case_id);

  let body: ArrayBuffer | null = null;
  let contentType = ev.mime;
  let variant = "original";
  const hasRange = q.start_ms !== undefined && q.end_ms !== undefined;

  if (ev.tipo === "audio" && hasRange) {
    const wavDer = await derivativeFile(c.env, ev.id, "wav");
    const wav = wavDer
      ? await readDerivativePlain(c.env, wavDer)
      : ev.mime.includes("wav")
        ? await readEvidencePlain(c.env, ev)
        : null;
    const trimmed = wav ? trimWav(wav, q.start_ms!, q.end_ms!) : null;
    if (trimmed) {
      body = trimmed;
      contentType = "audio/wav";
      variant = wavDer ? "wav_recortado" : "original_recortado";
    }
  }
  if (!body && ev.tipo === "imagen") {
    const red = await derivativeFile(c.env, ev.id, "redactada");
    if (red) {
      body = await readDerivativePlain(c.env, red);
      if (body) {
        contentType = "image/jpeg";
        variant = "redactada";
      }
    }
  }
  if (!body) body = await readEvidencePlain(c.env, ev);
  if (!body) throw notFound("Evidencia");

  // Rastreo de filtraciones: la copia lleva una marca invisible de quien la pide (falla abierta).
  const rango = variant.endsWith("_recortado") ? `${q.start_ms}-${q.end_ms}` : "completo";
  const marked = await markCopy(c.env, { ev, userId: auth.sub, variant: `${variant}:${rango}`, body, contentType });
  const m = marked.outcome;

  await audit(c.env, {
    ...actorOf(auth),
    action: "evidence.media",
    target_type: "evidence",
    target_id: ev.id,
    details: {
      case_id: ev.case_id,
      label: ev.label,
      variant,
      start_ms: q.start_ms ?? null,
      end_ms: q.end_ms ?? null,
      marca: m.marca,
      marca_motivo: m.motivo,
      marca_tipo: m.kind,
      marca_entrega: m.issue_id,
      marca_cache: m.cache,
      marca_modelo: m.model,
      marca_error: m.error,
      marca_ms: m.ms,
    },
  });
  const headers: Record<string, string> = {
    "content-type": marked.contentType,
    "content-disposition": `inline; filename="${ev.label}"`,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "x-blindaje-variant": variant,
    "x-blindaje-marca": m.marca,
  };
  if (m.motivo) headers["x-blindaje-marca-motivo"] = m.motivo;
  return new Response(marked.body, { headers });
});

/**
 * Rastreo de una copia filtrada (solo admin). Por qué no la analista: es quien más evidencia
 * escucha, así que sería su propia sospechosa, y el rastreo le serviría de oráculo para probar si
 * una edición borra su marca. Desde el 29/10 la administración también recibe copias (marcadas a su
 * nombre como las de cualquiera): sus rastreos y sus copias quedan en la auditoría encadenada.
 */
evidenciaRoutes.post("/leaks/trace", adminOnly, rateLimit("upload"), async (c) => {
  const auth = getAuth(c);
  const bytes = await readBodyLimited(c, MAX_EVIDENCE_BYTES);
  if (!bytes.byteLength) throw new ApiError("bad_request", "Falta el archivo");
  const kind = detectLeakKind(c.req.query("kind"), c.req.header("content-type"), bytes);
  const sha256 = await sha256Hex(bytes);
  const { result, audit: details } = await traceLeak(c.env, bytes, kind);
  // El archivo nunca se guarda: solo su huella y el resultado.
  await audit(c.env, {
    ...actorOf(auth),
    action: "leak.trace",
    target_type: null,
    target_id: null,
    details: { ...details, sha256, size_bytes: bytes.byteLength },
  });
  return c.json(LeakTraceResult.parse(result));
});

evidenciaRoutes.get("/cases/:id", centralTeam, async (c) => {
  const auth = getAuth(c);
  const cs = await getConsoleCase(c.env, c.req.param("id"));
  const [side, transcripciones] = await Promise.all([buildCaseSide(c.env, cs.id, cs), caseTranscripts(c.env, cs.id)]);
  await audit(c.env, {
    ...actorOf(auth),
    action: "case.view",
    target_type: "case",
    target_id: cs.id,
    details: { code: cs.code },
  });
  return c.json({ ...side, transcripciones });
});
