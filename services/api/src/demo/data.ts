import { CENTRAL_ORG_ID, type Sector, type TipoAmenaza } from "@blindaje/shared";
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
// Casos agregados del demo (solo para el mapa y el panorama por distrito)
// ---------------------------------------------------------------------------

/**
 * Casos ficticios por distrito: fichas sin evidencia, sin números, sin grupo, sin frases y sin canal
 * de pago conocido (así no forman patrones para el Vigía ni redes), con consentimiento comunitario.
 * `casos` y `victimas` caen en los últimos 28 días; `previos`, en los 28 anteriores (tendencia).
 * Unos distritos pasan el umbral (con rangos, niveles y tendencias distintos) y otros no.
 */
interface DemoZone {
  distrito: string;
  casos: number;
  victimas: number;
  previos: number;
  sectores: Sector[];
  amenazas: TipoAmenaza[];
  /** Cuántos de los casos más antiguos del periodo tuvieron intimidación física después del plazo. */
  escalamiento?: number;
}

export const DEMO_ZONES: readonly DemoZone[] = [
  // Sobre el umbral. San Juan de Lurigancho también tiene los casos de la historia (A, C, D, E, F y G).
  {
    distrito: "san-juan-de-lurigancho",
    casos: 9,
    victimas: 7,
    previos: 4,
    sectores: ["bodega", "mototaxi", "mercado"],
    amenazas: ["dano_local"],
    escalamiento: 1,
  },
  {
    distrito: "villa-el-salvador",
    casos: 23,
    victimas: 16,
    previos: 12,
    sectores: ["bodega", "bodega", "mototaxi", "transporte"],
    amenazas: ["dano_local", "dano_fisico"],
    escalamiento: 2,
  },
  {
    distrito: "ate",
    casos: 12,
    victimas: 8,
    previos: 11,
    sectores: ["mototaxi", "transporte", "bodega"],
    amenazas: ["dano_vehiculo"],
  },
  { distrito: "comas", casos: 7, victimas: 5, previos: 12, sectores: ["mercado", "bodega"], amenazas: ["dano_local"] },
  {
    distrito: "lima",
    casos: 5,
    victimas: 3,
    previos: 0,
    sectores: ["mercado", "restaurante"],
    amenazas: ["difusion_informacion"],
  },
  // Sin modalidad que pase el umbral ni intimidación: nivel bajo.
  {
    distrito: "la-victoria",
    casos: 6,
    victimas: 4,
    previos: 5,
    sectores: ["mercado", "restaurante", "construccion"],
    amenazas: ["dano_local", "dano_familia", "dano_fisico", "difusion_informacion", "otro"],
  },
  // Bajo el umbral: en el mapa se ven igual que un distrito sin casos.
  {
    distrito: "san-martin-de-porres",
    casos: 4,
    victimas: 4,
    previos: 3,
    sectores: ["bodega"],
    amenazas: ["dano_local"],
  },
  { distrito: "los-olivos", casos: 6, victimas: 2, previos: 0, sectores: ["restaurante"], amenazas: ["dano_local"] },
  { distrito: "callao", casos: 3, victimas: 3, previos: 2, sectores: ["transporte"], amenazas: ["dano_vehiculo"] },
  { distrito: "puente-piedra", casos: 2, victimas: 2, previos: 0, sectores: ["mototaxi"], amenazas: ["dano_vehiculo"] },
];

/** Plataforma de los dispositivos de los casos agregados: así el reset los borra en bloque. */
export const DEMO_AGGREGATE_PLATFORM = "demo-agregado";

/** Total de casos agregados que crea el seed (para el reset y los tests). */
export function demoAggregateCount(): number {
  return DEMO_ZONES.reduce((n, z) => n + z.casos + z.previos, 0);
}
