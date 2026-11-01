import type { LinkRow } from "../console/views";
import type { Env } from "../env";
import { nowIso } from "../lib/ids";

/** Revisión humana de los vínculos en la consola: la cola por estado y la decisión. */

/** Vínculos en esos estados, de mayor a menor puntaje, con el nombre de quien los revisó. */
export async function listLinksByStatus(env: Env, statuses: string[], limit: number): Promise<LinkRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT l.*, u.display_name AS reviewer_name FROM links l LEFT JOIN users u ON u.id = l.reviewer_id
     WHERE l.status IN (${statuses.map(() => "?").join(",")})
     ORDER BY l.score DESC, l.created_at ASC LIMIT ?`,
  )
    .bind(...statuses, limit)
    .all<LinkRow>();
  return results;
}

/** Para confirmar, los dos casos siguen indexados y con consentimiento comunitario. */
export async function bothCasesCommunity(env: Env, caseA: string, caseB: string): Promise<boolean> {
  const ok = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM cases WHERE id IN (?, ?) AND indexed = 1 AND consent_mode = 'comunitario'",
  )
    .bind(caseA, caseB)
    .first<{ n: number }>();
  return (ok?.n ?? 0) >= 2;
}

export async function setLinkDecision(
  env: Env,
  id: string,
  d: { status: "confirmado" | "descartado"; reviewer_id: string; note: string | null },
): Promise<void> {
  const now = nowIso();
  await env.DB.prepare(
    "UPDATE links SET status = ?, reviewer_id = ?, reviewed_at = ?, review_note = ?, updated_at = ? WHERE id = ?",
  )
    .bind(d.status, d.reviewer_id, now, d.note, now, id)
    .run();
}
