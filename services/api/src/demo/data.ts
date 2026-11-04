import { CENTRAL_ORG_ID } from "@blindaje/shared";
import { DEMO_READONLY_USER_ID } from "../auth/tokens";
import type { Env } from "../env";
import type { Actor } from "../types";

/**
 * Datos ficticios del modo demo (src/routes/demo.ts): organizaciones, cuentas, invitaciones y los
 * casos agregados por distrito. Todo lo que crea el seed está marcado is_demo y dice "ficticio".
 */

/** Canal de difusión del demo: emite las invitaciones que usa el script de eval/. */
export const DEMO_ORG = {
  id: "org-demo-bodegueros-lima-este",
  name: "Asociación de Bodegueros de Lima Este (datos ficticios)",
  kind: "gremio",
  district: "Lima Este",
};

export const CENTRAL_ORG = { id: CENTRAL_ORG_ID, name: "Equipo Blindaje", kind: "alianza" } as const;

/**
 * El equipo central del demo. Las cuentas que pueden decidir (revisión, análisis, administración) no
 * tienen contraseña en el código: sale de su secreto y, si no existe, el seed no crea esa cuenta. La
 * única con contraseña pública es la del jurado, que es de solo lectura (README.md).
 */
export const DEMO_USERS = [
  {
    id: "usr-demo-revisora",
    email: "revisora@demo.blindaje.test",
    display_name: "Revisora Demo",
    role: "reviewer",
    secret: "DEMO_REVIEWER_PASSWORD",
    password: null,
  },
  {
    id: "usr-demo-analista",
    email: "analista@demo.blindaje.test",
    display_name: "Analista Demo",
    role: "analyst",
    secret: "DEMO_ANALYST_PASSWORD",
    password: null,
  },
  {
    id: "usr-demo-admin",
    email: "admin@demo.blindaje.test",
    display_name: "Administración Demo",
    role: "admin",
    secret: "DEMO_ADMIN_PASSWORD",
    password: null,
  },
  {
    id: DEMO_READONLY_USER_ID,
    email: "jurado@demo.blindaje.test",
    display_name: "Jurado (solo lectura)",
    role: "admin",
    secret: null,
    password: "Jurado-Demo-2026",
  },
] as const;

export function demoUserPassword(env: Env, u: (typeof DEMO_USERS)[number]): string | undefined {
  return u.password ?? (u.secret ? env[u.secret] : undefined);
}

/** Cuenta del portal de negocios anterior (rol business). Contraseña documentada en README.md. */
export const DEMO_BUSINESS = {
  id: "biz-demo-bodega-don-lucho",
  email: "negocio@demo.blindaje.test",
  business_name: "Bodega Don Lucho (ficticia)",
  sector: "bodega",
  zona: "san-juan-de-lurigancho",
  password: "Negocio-Demo-2026",
} as const;

export const DEMO_INVITES = [
  { code: "DEMO-CASO-A", max_uses: 5 },
  { code: "DEMO-CASO-B", max_uses: 5 },
  { code: "DEMO-CASO-C", max_uses: 5 },
  { code: "DEMO-LIMA-ESTE", max_uses: 100 },
] as const;

export const DEMO_ACTOR: Actor = { actor_type: "system", actor_id: "demo" };

// ---------------------------------------------------------------------------
// Casos agregados del demo (solo para el mapa y el panorama por distrito). Los distritos y cifras
// están en packages/shared/src/demo-zones.ts (DEMO_ZONES).
// ---------------------------------------------------------------------------

/** Plataforma de los dispositivos de los casos agregados: así el reset los borra en bloque. */
export const DEMO_AGGREGATE_PLATFORM = "demo-agregado";
