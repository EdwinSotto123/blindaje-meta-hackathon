import { Hono } from "hono";
import { runRedactor } from "../../agents";
import { getExpediente, listExpedientes } from "../../agents/redactor";
import { audit } from "../../audit";
import { expedienteView } from "../../console/views";
import { getDecrypted, sha256Hex } from "../../lib/crypto";
import { notFound } from "../../lib/errors";
import { getAuth } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { findNetwork } from "../../networks";
import { actorOf, type AppEnv } from "../../types";
import { analystOrAdmin } from "./guards";

/** Expedientes (Redactor). */
export const expedientesRoutes = new Hono<AppEnv>();

expedientesRoutes.post("/networks/:id/expediente", analystOrAdmin, rateLimit("agents"), async (c) => {
  const auth = getAuth(c);
  const net = await findNetwork(c.env, c.req.param("id"));
  if (!net) throw notFound("Red");
  await audit(c.env, { ...actorOf(auth), action: "agent.redactor.run", target_type: "network", target_id: net.id });
  const { expediente_id } = await runRedactor(c.env, net.id, { actor: actorOf(auth) });
  const e = await getExpediente(c.env, expediente_id);
  if (!e) throw notFound("Expediente");
  return c.json(expedienteView(e));
});

expedientesRoutes.get("/networks/:id/expedientes", analystOrAdmin, async (c) => {
  const net = await findNetwork(c.env, c.req.param("id"));
  if (!net) throw notFound("Red");
  return c.json({ expedientes: (await listExpedientes(c.env, net.id)).map(expedienteView) });
});

expedientesRoutes.get("/expedientes/:id", analystOrAdmin, async (c) => {
  const e = await getExpediente(c.env, c.req.param("id"));
  if (!e) throw notFound("Expediente");
  return c.json(expedienteView(e));
});

expedientesRoutes.get("/expedientes/:id/pdf", analystOrAdmin, async (c) => {
  const auth = getAuth(c);
  const e = await getExpediente(c.env, c.req.param("id"));
  if (!e || e.status !== "listo" || !e.r2_key) throw notFound("Expediente");
  const pdf = await getDecrypted(c.env.EVIDENCE, e.r2_key, c.env.EVIDENCE_ENCRYPTION_KEY, e.id);
  if (!pdf) throw notFound("Expediente");
  await audit(c.env, {
    ...actorOf(auth),
    action: "expediente.download",
    target_type: "expediente",
    target_id: e.id,
    details: { network_id: e.network_id, sha256: e.sha256 ?? (await sha256Hex(pdf)) },
  });
  return new Response(pdf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="expediente-${e.id.slice(0, 8)}.pdf"`,
      "cache-control": "no-store",
    },
  });
});
