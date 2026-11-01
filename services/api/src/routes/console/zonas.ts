import { Hono } from "hono";
import { ConsoleZones } from "@blindaje/shared";
import { parseQuery } from "../../lib/http";
import { consoleZones } from "../../zones";
import type { AppEnv } from "../../types";
import { ZonesQuery } from "../schemas";
import { centralTeam, consoleIsDemo } from "./guards";

/** Zonas (rediseño del 28/10). */
export const zonasRoutes = new Hono<AppEnv>();

/**
 * Vista de zonas: cifras exactas por distrito para el equipo, con el periodo anterior, víctimas
 * distintas, redes y modalidades. Bajo el umbral, solo las cifras (sin redes ni modalidades).
 */
zonasRoutes.get("/zones", centralTeam, async (c) => {
  const q = parseQuery(c, ZonesQuery);
  const isDemo = await consoleIsDemo(c, q.demo);
  return c.json(ConsoleZones.parse(await consoleZones(c.env, { dias: q.dias, isDemo })));
});
