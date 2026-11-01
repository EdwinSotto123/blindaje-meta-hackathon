import { CENTRAL_ORG_ID } from "@blindaje/shared";
import type { Env } from "../env";
import { nowIso } from "../lib/ids";
import { hashPassword } from "../lib/password";
import { deleteAggregates, insertAggregates } from "./aggregates";
import { CENTRAL_ORG, DEMO_BUSINESS, DEMO_INVITES, DEMO_ORG, DEMO_USERS, demoUserPassword } from "./data";

/**
 * Crea (o completa) los datos del demo: organizaciones, equipo central, cuenta del portal,
 * invitaciones y casos agregados. Se puede correr varias veces: solo crea lo que falta y reemplaza
 * los casos agregados. Devuelve cuántas cuentas creó.
 */
export async function seedDemo(env: Env): Promise<{ users_created: number; business_created: number }> {
  const now = nowIso();
  // La organización central la crea la migración 0004; el seed la asegura por si falta.
  await env.DB.batch([
    env.DB.prepare(
      "INSERT OR IGNORE INTO organizations (id, name, kind, district, is_demo, created_at) VALUES (?, ?, ?, NULL, 0, ?)",
    ).bind(CENTRAL_ORG.id, CENTRAL_ORG.name, CENTRAL_ORG.kind, now),
    env.DB.prepare(
      "INSERT OR IGNORE INTO organizations (id, name, kind, district, is_demo, created_at) VALUES (?, ?, ?, ?, 1, ?)",
    ).bind(DEMO_ORG.id, DEMO_ORG.name, DEMO_ORG.kind, DEMO_ORG.district, now),
  ]);
  const createdUsers: string[] = [];
  for (const u of DEMO_USERS) {
    const password = demoUserPassword(env, u);
    if (!password) continue;
    const exists = await env.DB.prepare("SELECT id FROM users WHERE id = ? OR email = ?")
      .bind(u.id, u.email)
      .first<{ id: string }>();
    if (exists) {
      // Un seed anterior al rediseño los dejó en la organización demo: pasan al equipo central.
      await env.DB.prepare("UPDATE users SET org_id = ?, display_name = ? WHERE id = ? AND is_demo = 1")
        .bind(CENTRAL_ORG_ID, u.display_name, exists.id)
        .run();
      continue;
    }
    await env.DB.prepare(
      "INSERT INTO users (id, org_id, email, display_name, password_hash, role, disabled, is_demo, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)",
    )
      .bind(u.id, CENTRAL_ORG_ID, u.email, u.display_name, await hashPassword(password), u.role, now)
      .run();
    createdUsers.push(u.id);
  }
  const bizExists = await env.DB.prepare("SELECT id FROM business_accounts WHERE id = ? OR email = ?")
    .bind(DEMO_BUSINESS.id, DEMO_BUSINESS.email)
    .first();
  if (!bizExists) {
    await env.DB.prepare(
      `INSERT INTO business_accounts (id, org_id, email, password_hash, business_name, sector, zona, disabled, is_demo, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, 'demo', ?)`,
    )
      .bind(
        DEMO_BUSINESS.id,
        DEMO_ORG.id,
        DEMO_BUSINESS.email,
        await hashPassword(DEMO_BUSINESS.password),
        DEMO_BUSINESS.business_name,
        DEMO_BUSINESS.sector,
        DEMO_BUSINESS.zona,
        now,
      )
      .run();
  }
  for (const inv of DEMO_INVITES) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO invites (code, org_id, created_by, created_at, expires_at, max_uses, uses) VALUES (?, ?, ?, ?, NULL, ?, 0)",
    )
      .bind(inv.code, DEMO_ORG.id, "demo", now, inv.max_uses)
      .run();
  }
  // Casos agregados: se reemplazan en cada seed para que las fechas sigan dentro del periodo.
  await deleteAggregates(env);
  await insertAggregates(env, Date.now());
  return { users_created: createdUsers.length, business_created: bizExists ? 0 : 1 };
}
