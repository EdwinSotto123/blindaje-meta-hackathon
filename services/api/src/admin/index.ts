import type { UserRow } from "../auth/tokens";
import type { Env } from "../env";
import { nowIso } from "../lib/ids";
import { hashPassword } from "../lib/password";

/** Administración de la consola: organizaciones, invitaciones y usuarios del equipo. */

// ---------------------------------------------------------------------------
// Organizaciones
// ---------------------------------------------------------------------------

interface OrgListRow {
  id: string;
  name: string;
  kind: string;
  district: string | null;
  is_demo: number;
  created_at: string;
  devices: number;
  users: number;
}

/** Todas las organizaciones, con cuántos dispositivos y usuarios tiene cada una. */
export async function listOrgs(env: Env): Promise<OrgListRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT o.id, o.name, o.kind, o.district, o.is_demo, o.created_at,
       (SELECT COUNT(*) FROM devices d WHERE d.org_id = o.id) AS devices,
       (SELECT COUNT(*) FROM users u WHERE u.org_id = o.id) AS users
     FROM organizations o ORDER BY o.created_at ASC`,
  ).all<OrgListRow>();
  return results;
}

export async function insertOrg(
  env: Env,
  o: { id: string; name: string; kind: string; district: string | null; created_at: string },
): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO organizations (id, name, kind, district, is_demo, created_at) VALUES (?, ?, ?, ?, 0, ?)",
  )
    .bind(o.id, o.name, o.kind, o.district, o.created_at)
    .run();
}

export async function orgExists(env: Env, id: string): Promise<boolean> {
  const org = await env.DB.prepare("SELECT id FROM organizations WHERE id = ?").bind(id).first();
  return Boolean(org);
}

/** La organización y si es del demo (las cuentas del portal heredan su is_demo). */
export async function getOrgDemo(env: Env, id: string): Promise<{ id: string; is_demo: number } | null> {
  return env.DB.prepare("SELECT id, is_demo FROM organizations WHERE id = ?")
    .bind(id)
    .first<{ id: string; is_demo: number }>();
}

// ---------------------------------------------------------------------------
// Invitaciones
// ---------------------------------------------------------------------------

/** Guarda un código de invitación; false si el código ya existía. */
export async function insertInvite(
  env: Env,
  inv: { code: string; org_id: string; created_by: string; created_at: string; expires_at: string; max_uses: number },
): Promise<boolean> {
  const res = await env.DB.prepare(
    "INSERT OR IGNORE INTO invites (code, org_id, created_by, created_at, expires_at, max_uses, uses) VALUES (?, ?, ?, ?, ?, ?, 0)",
  )
    .bind(inv.code, inv.org_id, inv.created_by, inv.created_at, inv.expires_at, inv.max_uses)
    .run();
  return Boolean(res.meta.changes);
}

// ---------------------------------------------------------------------------
// Usuarios de la consola
// ---------------------------------------------------------------------------

export async function listUsers(env: Env): Promise<UserRow[]> {
  const { results } = await env.DB.prepare(
    "SELECT u.*, o.name AS org_name FROM users u JOIN organizations o ON o.id = u.org_id ORDER BY u.created_at ASC",
  ).all<UserRow>();
  return results;
}

/** Crea un usuario de la consola (correo ya normalizado). Un correo repetido falla con UNIQUE. */
export async function insertUser(
  env: Env,
  u: { id: string; org_id: string; email: string; display_name: string; password: string; role: UserRow["role"] },
): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO users (id, org_id, email, display_name, password_hash, role, disabled, is_demo, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)",
  )
    .bind(u.id, u.org_id, u.email, u.display_name, await hashPassword(u.password), u.role, nowIso())
    .run();
}
