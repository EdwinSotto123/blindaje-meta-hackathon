import type { Sector } from "./enums";
import type { TipoAmenaza } from "./ficha";

// Datos ficticios del demo: los casos agregados por distrito que el seed de la API (services/api/src/demo)
// guarda en la base. Están aquí para que la landing anime exactamente esos casos.

/**
 * Casos ficticios por distrito: fichas sin evidencia, sin números, sin grupo, sin frases y sin canal
 * de pago conocido (así no forman patrones para el Vigía ni redes), con consentimiento comunitario.
 * `casos` y `victimas` caen en los últimos 28 días; `previos`, en los 28 anteriores (tendencia).
 * Unos distritos pasan el umbral (con rangos, niveles y tendencias distintos) y otros no.
 */
export interface DemoZone {
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

/** Total de casos agregados que crea el seed (para el reset y los tests). */
export function demoAggregateCount(): number {
  return DEMO_ZONES.reduce((n, z) => n + z.casos + z.previos, 0);
}
