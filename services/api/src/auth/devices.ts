import type { DeviceRegisterRequest } from "@blindaje/shared";
import type { Env } from "../env";
import { nowIso } from "../lib/ids";

/**
 * Dispositivos de víctima: el registro (con o sin código de invitación), el refresh firmado y lo que
 * necesita la creación de casos.
 */

export async function findInvite(env: Env, code: string): Promise<{ code: string; org_id: string } | null> {
  return env.DB.prepare("SELECT code, org_id FROM invites WHERE code = ?")
    .bind(code)
    .first<{ code: string; org_id: string }>();
}

/** Gasta un uso de la invitación; false si ya no le quedan usos o venció. */
export async function redeemInvite(env: Env, code: string, now: string): Promise<boolean> {
  const used = await env.DB.prepare(
    "UPDATE invites SET uses = uses + 1 WHERE code = ? AND uses < max_uses AND (expires_at IS NULL OR expires_at > ?)",
  )
    .bind(code, now)
    .run();
  return Boolean(used.meta.changes);
}

export async function getDeviceOrg(
  env: Env,
  orgId: string,
): Promise<{ id: string; name: string; is_demo: number } | null> {
  return env.DB.prepare("SELECT id, name, is_demo FROM organizations WHERE id = ?")
    .bind(orgId)
    .first<{ id: string; name: string; is_demo: number }>();
}

/** Registra el dispositivo. Un seudónimo repetido falla con UNIQUE (quien llama reintenta con otro). */
export async function insertDevice(
  env: Env,
  d: {
    id: string;
    org_id: string;
    pseudonym: string;
    public_key: DeviceRegisterRequest["public_key"];
    platform: DeviceRegisterRequest["platform"];
    invite_code: string | null;
    is_demo: number;
    now: string;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO devices (id, org_id, pseudonym, public_key_jwk, platform, invite_code, is_demo, created_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(d.id, d.org_id, d.pseudonym, JSON.stringify(d.public_key), d.platform, d.invite_code, d.is_demo, d.now, d.now)
    .run();
}

/** Lo que pide el refresh: la llave pública para verificar la firma y los datos del token. */
export async function getDeviceKey(
  env: Env,
  id: string,
): Promise<{ id: string; org_id: string; pseudonym: string; public_key_jwk: string } | null> {
  return env.DB.prepare("SELECT id, org_id, pseudonym, public_key_jwk FROM devices WHERE id = ?")
    .bind(id)
    .first<{ id: string; org_id: string; pseudonym: string; public_key_jwk: string }>();
}

export async function touchDevice(env: Env, id: string): Promise<void> {
  await env.DB.prepare("UPDATE devices SET last_seen_at = ? WHERE id = ?").bind(nowIso(), id).run();
}

/** El dispositivo (solo is_demo) o null si no está registrado. */
export async function getDeviceDemo(env: Env, id: string): Promise<{ is_demo: number } | null> {
  return env.DB.prepare("SELECT is_demo FROM devices WHERE id = ?").bind(id).first<{ is_demo: number }>();
}
