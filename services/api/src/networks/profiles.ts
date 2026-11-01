import type { HypothesisRow } from "../console/views";
import type { Env } from "../env";
import { nowIso } from "../lib/ids";

/**
 * Decisiones de la persona analista sobre lo que propone el Cartógrafo: el perfil de cada red y sus
 * hipótesis (se deciden una por una).
 */

/** Hipótesis con el estado de su perfil (no se aprueba si el perfil no pasó el validador de citas). */
export async function getHypothesisForDecision(
  env: Env,
  id: string,
): Promise<(HypothesisRow & { profile_status: string | null }) | null> {
  return env.DB.prepare(
    "SELECT h.*, p.status AS profile_status FROM hypotheses h LEFT JOIN network_profiles p ON p.id = h.profile_id WHERE h.id = ?",
  )
    .bind(id)
    .first<HypothesisRow & { profile_status: string | null }>();
}

export async function setHypothesisStatus(
  env: Env,
  id: string,
  status: "aprobada" | "descartada",
  reviewerId: string,
): Promise<void> {
  await env.DB.prepare("UPDATE hypotheses SET status = ?, reviewer_id = ?, reviewed_at = ? WHERE id = ?")
    .bind(status, reviewerId, nowIso(), id)
    .run();
}

/** Hipótesis con el nombre de quien la revisó. */
export async function getHypothesis(env: Env, id: string): Promise<HypothesisRow | null> {
  return env.DB.prepare(
    "SELECT h.*, u.display_name AS reviewer_name FROM hypotheses h LEFT JOIN users u ON u.id = h.reviewer_id WHERE h.id = ?",
  )
    .bind(id)
    .first<HypothesisRow>();
}

export async function getProfileRef(
  env: Env,
  id: string,
): Promise<{ id: string; network_id: string; status: string } | null> {
  return env.DB.prepare("SELECT id, network_id, status FROM network_profiles WHERE id = ?")
    .bind(id)
    .first<{ id: string; network_id: string; status: string }>();
}

export async function setProfileStatus(
  env: Env,
  id: string,
  status: "aprobado" | "rechazado",
  reviewerId: string,
): Promise<void> {
  await env.DB.prepare("UPDATE network_profiles SET status = ?, reviewer_id = ?, reviewed_at = ? WHERE id = ?")
    .bind(status, reviewerId, nowIso(), id)
    .run();
}
