import {
  AsesorOutput,
  CENTRAL_ORG_ID,
  TODOS_LOS_RUBROS,
  districtOfZone,
  type BusinessRecommendationView,
  type CitationCheck,
  type ConsoleRecommendationView,
  type NivelRiesgo,
} from "@blindaje/shared";
import type { Env } from "../env";
import { parseJsonColumn } from "../lib/db";
import { notFound } from "../lib/errors";
import { nowIso } from "../lib/ids";
import { sectorKey, zoneKey } from "./risk";
import { sanitizeDeep } from "./safety";

export interface RecommendationRow {
  id: string;
  org_id: string;
  sector: string;
  zona: string;
  status: "borrador" | "aprobada" | "rechazada";
  content_json: string;
  citation_check_json: string;
  model: string;
  agent_run_id: string | null;
  approved_by: string | null;
  approver_name?: string | null;
  approved_at: string | null;
  is_demo: number;
  created_at: string;
}

/** Uso: `${RECOMMENDATION_SELECT} WHERE …`. */
export const RECOMMENDATION_SELECT = `SELECT r.*, u.display_name AS approver_name FROM business_recommendations r
  LEFT JOIN users u ON u.id = r.approved_by`;

/** Recomendaciones de todas las zonas para la consola (las 100 más recientes). */
export async function listRecommendations(
  env: Env,
  status?: RecommendationRow["status"],
): Promise<RecommendationRow[]> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (status) {
    where.push("r.status = ?");
    binds.push(status);
  }
  const { results } = await env.DB.prepare(
    `${RECOMMENDATION_SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY r.created_at DESC LIMIT 100`,
  )
    .bind(...binds)
    .all<RecommendationRow>();
  return results;
}

export async function getRecommendation(env: Env, id: string): Promise<RecommendationRow> {
  const r = await env.DB.prepare(`${RECOMMENDATION_SELECT} WHERE r.id = ?`).bind(id).first<RecommendationRow>();
  if (!r) throw notFound("Recomendación");
  return r;
}

export async function approveRecommendation(env: Env, id: string, approvedBy: string): Promise<void> {
  await env.DB.prepare(
    "UPDATE business_recommendations SET status = 'aprobada', approved_by = ?, approved_at = ? WHERE id = ?",
  )
    .bind(approvedBy, nowIso(), id)
    .run();
}

export async function rejectRecommendation(env: Env, id: string): Promise<void> {
  await env.DB.prepare(
    "UPDATE business_recommendations SET status = 'rechazada', approved_by = NULL, approved_at = NULL WHERE id = ?",
  )
    .bind(id)
    .run();
}

const EMPTY_CHECK: CitationCheck = { ok: false, total_afirmaciones: 0, sin_cita: [], citas_inexistentes: [] };

function content(row: RecommendationRow): AsesorOutput {
  const parsed = AsesorOutput.safeParse(parseJsonColumn(row.content_json));
  if (parsed.success) return parsed.data;
  // Nunca debería pasar (se guarda ya validado); una fila dañada no tumba la lista.
  return {
    sector: row.sector,
    zona: row.zona,
    nivel_riesgo: "sin_datos",
    resumen: "",
    modalidades: [],
    recomendaciones: [],
    que_hacer_si_te_pasa: [],
    advertencias: [],
  };
}

export function recommendationConsoleView(row: RecommendationRow): ConsoleRecommendationView {
  const check = parseJsonColumn<CitationCheck>(row.citation_check_json) ?? EMPTY_CHECK;
  return {
    id: row.id,
    org_id: row.org_id,
    status: row.status,
    contenido: content(row),
    citation_check: { ok: check.ok, sin_cita: check.sin_cita, citas_inexistentes: check.citas_inexistentes },
    model: row.model,
    created_at: row.created_at,
    approved_by: row.approver_name ?? row.approved_by,
    approved_at: row.approved_at,
  };
}

/** Vista para negocios y víctimas: sin citas internas ni números, solo lo aprobado. */
export function recommendationPublicView(row: RecommendationRow): BusinessRecommendationView {
  const c = content(row);
  return sanitizeDeep({
    id: row.id,
    sector: c.sector,
    zona: c.zona,
    distrito: districtOfZone(row.zona)?.id ?? districtOfZone(c.zona)?.id ?? null,
    nivel_riesgo: c.nivel_riesgo as NivelRiesgo,
    resumen: c.resumen,
    modalidades: c.modalidades.map((m) => ({ descripcion: m.descripcion, senales_de_alerta: m.senales_de_alerta })),
    recomendaciones: c.recomendaciones,
    que_hacer_si_te_pasa: c.que_hacer_si_te_pasa,
    advertencias: c.advertencias,
    approved_at: row.approved_at ?? "",
  });
}

/**
 * Recomendaciones aprobadas por el equipo central (organización central) del mundo pedido. Con
 * `zonas`, solo las de esas zonas (claves de `zoneKey`); con `sector`, solo las de ese rubro o las
 * de todos los rubros, primero las del rubro. Luego, las más recientes.
 */
export async function approvedRecommendations(
  env: Env,
  opts: { isDemo: boolean; zonas?: Array<string | null> | null; sector?: string | null; limit?: number },
): Promise<BusinessRecommendationView[]> {
  const { results } = await env.DB.prepare(
    `SELECT * FROM business_recommendations WHERE org_id = ? AND status = 'aprobada' AND is_demo = ?
     ORDER BY approved_at DESC LIMIT 200`,
  )
    .bind(CENTRAL_ORG_ID, opts.isDemo ? 1 : 0)
    .all<RecommendationRow>();
  const zonas = opts.zonas ? new Set(opts.zonas.filter((z): z is string => Boolean(z))) : null;
  const s = sectorKey(opts.sector);
  const todos = sectorKey(TODOS_LOS_RUBROS);
  return results
    .filter((r) => !zonas || zonas.has(zoneKey(r.zona) ?? ""))
    .filter((r) => !s || sectorKey(r.sector) === s || sectorKey(r.sector) === todos)
    .map((r, i) => ({ r, i, score: s && sectorKey(r.sector) === s ? 1 : 0 }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, opts.limit ?? 50)
    .map(({ r }) => recommendationPublicView(r));
}
