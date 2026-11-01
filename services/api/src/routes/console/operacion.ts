import { Hono } from "hono";
import { ConsoleMonitor, VectorOverview, VectorSyncResult, VectorTrace } from "@blindaje/shared";
import { audit } from "../../audit";
import { consoleMonitor } from "../../console/monitor";
import { readJson } from "../../lib/http";
import { getAuth } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { vectorOverview, vectorSync, vectorTrace } from "../../vectors/console";
import { actorOf, type AppEnv } from "../../types";
import { VectorTraceRequest } from "../schemas";
import { adminOnly, consoleIsDemo } from "./guards";

/** Operación (solo administración): monitoreo y motor vectorial. */
export const operacionRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Monitoreo (solo administración): servicios medidos en vivo, colas del equipo y presupuesto
// ---------------------------------------------------------------------------

operacionRoutes.get("/monitoreo", adminOnly, async (c) => {
  const started = Date.now();
  const cf = (c.req.raw as Request & { cf?: { colo?: string } }).cf;
  const data = await consoleMonitor(c.env, {
    demo: await consoleIsDemo(c, c.req.query("demo")),
    colo: cf?.colo ?? null,
    // Cloudflare puede agregar cf-placement ("remote-ATL"); si no, la región fijada en wrangler.jsonc.
    placement: c.req.header("cf-placement") ?? c.env.WORKER_REGION ?? null,
    started,
    waitUntil: (p) => {
      try {
        c.executionCtx.waitUntil(p);
      } catch {
        void p;
      }
    },
  });
  return c.json(ConsoleMonitor.parse(data));
});

// ---------------------------------------------------------------------------
// Motor vectorial (solo administración)
// ---------------------------------------------------------------------------

/** Estado de la base vectorial, colecciones, casos indexados y el mapa de cada índice. */
operacionRoutes.get("/vectores", adminOnly, async (c) => {
  return c.json(VectorOverview.parse(await vectorOverview(c.env)));
});

/** Corre en vivo la búsqueda de candidatos de un caso (sin crear vínculos) y la devuelve paso a paso. */
operacionRoutes.post("/vectores/consulta", adminOnly, rateLimit("vectores"), async (c) => {
  const auth = getAuth(c);
  const { case_id } = await readJson(c, VectorTraceRequest);
  const trace = await vectorTrace(c.env, case_id);
  await audit(c.env, {
    ...actorOf(auth),
    action: "vectors.query",
    target_type: "case",
    target_id: case_id,
    details: {
      code: trace.caso,
      provider: trace.proveedor,
      queries: trace.consultas.length,
      candidates: trace.candidatos.length,
    },
  });
  return c.json(VectorTrace.parse(trace));
});

/** Sincronización completa D1 → base vectorial (Chroma, o FAISS si no hay Chroma). */
operacionRoutes.post("/vectores/sincronizar", adminOnly, rateLimit("vectores"), async (c) => {
  const auth = getAuth(c);
  const result = await vectorSync(c.env);
  await audit(c.env, {
    ...actorOf(auth),
    action: "vectors.sync",
    target_type: null,
    target_id: null,
    details: { provider: result.proveedor, written: result.sincronizados, deleted: result.borrados },
  });
  return c.json(VectorSyncResult.parse(result));
});
