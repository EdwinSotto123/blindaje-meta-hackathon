import { DEMO_PATTERN_PREFIX } from "../business/risk";
import { deleteCaseFully, type CaseRow } from "../cases";
import type { Env } from "../env";
import { recomputeNetworks } from "../networks";
import { deleteAggregates } from "./aggregates";
import { DEMO_ACTOR } from "./data";

/**
 * Borra todo lo del demo (lo marcado is_demo y lo de organizaciones demo): casos con todo lo suyo,
 * alertas, cuentas, dispositivos, invitaciones y organizaciones. Devuelve lo que borró.
 */
export async function resetDemo(env: Env): Promise<{
  cases: number;
  aggregate_cases: number;
  devices: number;
  users: number;
  business_accounts: number;
}> {
  const demoOrgs = "SELECT id FROM organizations WHERE is_demo = 1";
  const counts = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM devices WHERE is_demo = 1 OR org_id IN (${demoOrgs})`),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM users WHERE is_demo = 1 OR org_id IN (${demoOrgs})`),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM business_accounts WHERE is_demo = 1 OR org_id IN (${demoOrgs})`),
  ]);
  // Los casos agregados se borran en bloque (no tienen evidencia, vínculos ni índices); los demás,
  // uno por uno con todo lo suyo.
  const aggregates = await deleteAggregates(env);
  const { results: cases } = await env.DB.prepare(
    `SELECT * FROM cases WHERE is_demo = 1 OR org_id IN (${demoOrgs})`,
  ).all<CaseRow>();
  for (const cs of cases) await deleteCaseFully(env, cs, DEMO_ACTOR, { recompute: false });
  await recomputeNetworks(env);

  // Alertas del demo: las del Vigía con casos del demo (en la organización central, con el prefijo)
  // y las de organizaciones demo anteriores al rediseño.
  const demoAlerts = `SELECT id FROM alerts WHERE org_id IN (${demoOrgs}) OR COALESCE(pattern_key, '') LIKE '${DEMO_PATTERN_PREFIX}%'`;
  const { results: alertImages } = await env.DB.prepare(
    `SELECT image_r2_key FROM alerts WHERE image_r2_key IS NOT NULL AND id IN (${demoAlerts})`,
  ).all<{ image_r2_key: string }>();
  if (alertImages.length) await env.EVIDENCE.delete(alertImages.map((a) => a.image_r2_key));

  const demoUsers =
    "SELECT id FROM users WHERE is_demo = 1 OR org_id IN (SELECT id FROM organizations WHERE is_demo = 1)";
  const demoDevices =
    "SELECT id FROM devices WHERE is_demo = 1 OR org_id IN (SELECT id FROM organizations WHERE is_demo = 1)";
  const demoBusiness =
    "SELECT id FROM business_accounts WHERE is_demo = 1 OR org_id IN (SELECT id FROM organizations WHERE is_demo = 1)";
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM alerts WHERE id IN (${demoAlerts})`),
    env.DB.prepare(`UPDATE links SET reviewer_id = NULL WHERE reviewer_id IN (${demoUsers})`),
    env.DB.prepare(`UPDATE network_profiles SET reviewer_id = NULL WHERE reviewer_id IN (${demoUsers})`),
    env.DB.prepare(`UPDATE hypotheses SET reviewer_id = NULL WHERE reviewer_id IN (${demoUsers})`),
    env.DB.prepare(`UPDATE alerts SET approved_by = NULL WHERE approved_by IN (${demoUsers})`),
    env.DB.prepare(`UPDATE expedientes SET created_by = NULL WHERE created_by IN (${demoUsers})`),
    // Negocios: recomendaciones del Asesor, sesiones y cuentas del portal.
    env.DB.prepare(`DELETE FROM business_recommendations WHERE is_demo = 1 OR org_id IN (${demoOrgs})`),
    env.DB.prepare(`UPDATE business_recommendations SET approved_by = NULL WHERE approved_by IN (${demoUsers})`),
    env.DB.prepare(`DELETE FROM business_refresh_tokens WHERE subject_id IN (${demoBusiness})`),
    env.DB.prepare(`DELETE FROM business_accounts WHERE id IN (${demoBusiness})`),
    env.DB.prepare(`DELETE FROM refresh_tokens WHERE subject_type = 'user' AND subject_id IN (${demoUsers})`),
    env.DB.prepare(`DELETE FROM refresh_tokens WHERE subject_type = 'device' AND subject_id IN (${demoDevices})`),
    env.DB.prepare(`DELETE FROM users WHERE id IN (${demoUsers})`),
    env.DB.prepare(`DELETE FROM devices WHERE id IN (${demoDevices})`),
    env.DB.prepare(`DELETE FROM invites WHERE org_id IN (${demoOrgs})`),
    env.DB.prepare(`DELETE FROM organizations WHERE is_demo = 1`),
    env.DB.prepare("DELETE FROM agent_runs WHERE target_type = 'case' AND target_id NOT IN (SELECT id FROM cases)"),
    env.DB.prepare(
      "DELETE FROM agent_runs WHERE target_type = 'network' AND target_id NOT IN (SELECT id FROM networks)",
    ),
    env.DB.prepare(
      "DELETE FROM agent_runs WHERE target_type = 'organization' AND target_id NOT IN (SELECT id FROM organizations)",
    ),
    // Las etiquetas vuelven a empezar después de lo que quede (VIN-1, R-001… si no queda nada).
    env.DB.prepare("UPDATE counters SET value = COALESCE((SELECT MAX(num) FROM links), 0) WHERE name = 'link'"),
    env.DB.prepare("UPDATE counters SET value = COALESCE((SELECT MAX(num) FROM voice_prints), 0) WHERE name = 'voice'"),
    env.DB.prepare("UPDATE counters SET value = COALESCE((SELECT MAX(num) FROM image_crops), 0) WHERE name = 'image'"),
    env.DB.prepare("UPDATE counters SET value = COALESCE((SELECT MAX(num) FROM networks), 0) WHERE name = 'network'"),
    env.DB.prepare(
      "UPDATE counters SET value = COALESCE((SELECT MAX(num) FROM hypotheses), 0) WHERE name = 'hypothesis'",
    ),
  ]);
  return {
    cases: cases.length + aggregates,
    aggregate_cases: aggregates,
    devices: (counts[0]!.results[0] as { n: number }).n,
    users: (counts[1]!.results[0] as { n: number }).n,
    business_accounts: (counts[2]!.results[0] as { n: number }).n,
  };
}
