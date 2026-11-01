import type { PilotRequest } from "@blindaje/shared";
import type { Env } from "../env";
import { hmacHex } from "../lib/crypto";
import { newId, nowIso } from "../lib/ids";

/** Guarda una solicitud de piloto de la landing y devuelve su id. De la IP queda solo un HMAC truncado. */
export async function insertPilotRequest(env: Env, body: PilotRequest, ip: string): Promise<string> {
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO pilot_requests (id, org_name, contact_name, contact, sector, district, members, message, lang, ip_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      body.org_name,
      body.contact_name,
      body.contact,
      body.sector ?? null,
      body.district ?? null,
      body.members ?? null,
      body.message ?? null,
      body.lang,
      (await hmacHex(env.JWT_SECRET, `pilot-ip:${ip}`)).slice(0, 32),
      nowIso(),
    )
    .run();
  return id;
}
