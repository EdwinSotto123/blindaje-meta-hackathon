import { CENTRAL_ORG_ID, DEMO_ZONES, districtById, type FichaStored, type TipoAmenaza } from "@blindaje/shared";
import type { Env } from "../env";
import { newId, nowIso } from "../lib/ids";
import { DEMO_AGGREGATE_PLATFORM } from "./data";

/** Casos agregados del demo en D1: se crean en cada seed y se borran en bloque. */

const DAY_MS = 86_400_000;
const AMENAZA_TEXTO: Record<TipoAmenaza, string> = {
  dano_local: "Amenaza con dañar el local (ficticio)",
  dano_fisico: "Amenaza con hacer daño a la persona (ficticio)",
  dano_familia: "Amenaza a la familia (ficticio)",
  dano_vehiculo: "Amenaza con dañar el vehículo (ficticio)",
  difusion_informacion: "Amenaza con difundir información (ficticio)",
  otro: "Otra amenaza (ficticio)",
};

function limaIso(ms: number): string {
  return `${new Date(ms - 5 * 3600_000).toISOString().slice(0, 19)}-05:00`;
}

/**
 * Sentencias del seed de casos agregados. Códigos de caso "0NNN" y seudónimos "V-0NND": llevan un
 * 0, que ni caseCode() ni pseudonym() generan, así que nunca chocan con casos o víctimas reales.
 */
function aggregateStatements(env: Env, now: number): D1PreparedStatement[] {
  const stmts: D1PreparedStatement[] = [];
  const created = nowIso();
  let device = 0;
  let caso = 0;
  for (const z of DEMO_ZONES) {
    if (!districtById(z.distrito)) throw new Error(`Distrito desconocido en DEMO_ZONES: ${z.distrito}`);
    const devices: Array<{ id: string; pse: string }> = [];
    for (let i = 0; i < z.victimas; i++) {
      const d = { id: newId(), pse: `V-0${String(device++).padStart(2, "0")}D` };
      devices.push(d);
      stmts.push(
        env.DB.prepare(
          "INSERT INTO devices (id, org_id, pseudonym, public_key_jwk, platform, is_demo, created_at) VALUES (?, ?, ?, '{}', ?, 1, ?)",
        ).bind(d.id, CENTRAL_ORG_ID, d.pse, DEMO_AGGREGATE_PLATFORM, created),
      );
    }
    const periodos: Array<{ n: number; desde: number }> = [
      { n: z.casos, desde: 1 },
      { n: z.previos, desde: 29 },
    ];
    for (const [p, periodo] of periodos.entries()) {
      for (let i = 0; i < periodo.n; i++) {
        // i = 0 es el más antiguo del periodo: del día desde+26 al día desde.
        const dias = periodo.desde + 26 - Math.round((i * 26) / Math.max(1, periodo.n - 1));
        const t = now - dias * DAY_MS;
        const code = `0${String(caso++).padStart(3, "0")}`;
        const dev = devices[i % devices.length]!;
        const sector = z.sectores[i % z.sectores.length]!;
        const amenaza = z.amenazas[i % z.amenazas.length]!;
        const escala = p === 0 && i < (z.escalamiento ?? 0);
        const ficha: FichaStored = {
          caso: code,
          zona: z.distrito,
          sector,
          primer_contacto: limaIso(t),
          tipo_amenaza: amenaza,
          amenaza: AMENAZA_TEXTO[amenaza],
          monto_soles: [300, 500, 800, 1200, 2000][i % 5]!,
          periodicidad: i % 2 ? "semanal" : "unico",
          plazo: escala ? "48 horas" : null,
          plazo_horas: escala ? 48 : null,
          canal_pago: "otro",
          identificadores: [],
          grupo_que_dice_ser: null,
          frases_firma: [],
          escalamiento: escala
            ? [
                {
                  fecha: limaIso(t + 4 * DAY_MS).slice(0, 10),
                  tipo: "Visita intimidatoria al local (ficticio)",
                  evidencia: [],
                },
              ]
            : [],
          resumen_mo: "Caso agregado ficticio del demo: solo cuenta para el mapa por distrito (sin evidencia).",
          fuentes: [],
        };
        stmts.push(
          env.DB.prepare(
            `INSERT INTO cases (id, code, org_id, device_id, seudonimo_victima, sector, zona_cuadricula, primer_contacto, estado, consent_mode,
               ficha_json, indexed, is_demo, created_at, updated_at, submitted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'listo', 'comunitario', ?, 0, 1, ?, ?, ?)`,
          ).bind(
            newId(),
            code,
            CENTRAL_ORG_ID,
            dev.id,
            dev.pse,
            sector,
            z.distrito,
            ficha.primer_contacto,
            JSON.stringify(ficha),
            created,
            created,
            created,
          ),
        );
      }
    }
  }
  return stmts;
}

async function chunkedBatch(env: Env, stmts: D1PreparedStatement[], size = 50): Promise<void> {
  for (let i = 0; i < stmts.length; i += size) await env.DB.batch(stmts.slice(i, i + size));
}

/** Crea los casos agregados con fechas relativas a `now` (ms). */
export async function insertAggregates(env: Env, now: number): Promise<void> {
  await chunkedBatch(env, aggregateStatements(env, now));
}

const AGGREGATE_DEVICES = `SELECT id FROM devices WHERE is_demo = 1 AND platform = '${DEMO_AGGREGATE_PLATFORM}'`;

/** Borra los casos agregados y sus dispositivos (no tienen evidencia, vínculos ni índices). */
export async function deleteAggregates(env: Env): Promise<number> {
  const [del] = await env.DB.batch([
    env.DB.prepare(`DELETE FROM cases WHERE is_demo = 1 AND device_id IN (${AGGREGATE_DEVICES})`),
    env.DB.prepare(`DELETE FROM refresh_tokens WHERE subject_type = 'device' AND subject_id IN (${AGGREGATE_DEVICES})`),
    env.DB.prepare(`DELETE FROM devices WHERE id IN (${AGGREGATE_DEVICES})`),
  ]);
  return del!.meta.changes ?? 0;
}
