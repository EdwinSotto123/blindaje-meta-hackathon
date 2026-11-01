import type { AlertaBorrador } from "@blindaje/shared";
import { ALERT_SELECT, type AlertRow } from "../console/views";
import type { Env } from "../env";
import { notFound } from "../lib/errors";
import { nowIso } from "../lib/ids";

/** Alertas del Vigía en la consola: el equipo central las revisa sin filtro por organización. */

/** Las 100 alertas más recientes de todas las zonas (con `status`, solo las de ese estado). */
export async function listAlerts(env: Env, status?: AlertRow["status"]): Promise<AlertRow[]> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (status) {
    where.push("a.status = ?");
    binds.push(status);
  }
  const { results } = await env.DB.prepare(
    `${ALERT_SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY a.created_at DESC LIMIT 100`,
  )
    .bind(...binds)
    .all<AlertRow>();
  return results;
}

export async function getAlert(env: Env, id: string): Promise<AlertRow> {
  const a = await env.DB.prepare(`${ALERT_SELECT} WHERE a.id = ?`).bind(id).first<AlertRow>();
  if (!a) throw notFound("Alerta");
  return a;
}

/** Aprueba la alerta con el borrador tal como quedó (con las ediciones del equipo). */
export async function approveAlert(env: Env, id: string, draft: AlertaBorrador, approvedBy: string): Promise<void> {
  await env.DB.prepare(
    "UPDATE alerts SET status = 'aprobada', draft_json = ?, approved_by = ?, approved_at = ? WHERE id = ?",
  )
    .bind(JSON.stringify(draft), approvedBy, nowIso(), id)
    .run();
}

export async function rejectAlert(env: Env, id: string, draft: AlertaBorrador): Promise<void> {
  await env.DB.prepare("UPDATE alerts SET status = 'rechazada', draft_json = ? WHERE id = ?")
    .bind(JSON.stringify(draft), id)
    .run();
}
