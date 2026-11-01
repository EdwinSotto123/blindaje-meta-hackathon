import { Hono } from "hono";
import { AlertDecisionRequest, type AlertaBorrador } from "@blindaje/shared";
import { runVigia } from "../../agents";
import { approveAlert, getAlert, listAlerts, rejectAlert } from "../../alerts";
import { audit } from "../../audit";
import { alertView } from "../../console/views";
import { ApiError, notFound } from "../../lib/errors";
import { parseQuery, readJson } from "../../lib/http";
import { getAuth } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { actorOf, type AppEnv } from "../../types";
import { AlertsQuery, VigiaRunRequest } from "../schemas";
import { analystOrAdmin, centralTeam } from "./guards";

/** Alertas (Vigía). */
export const alertasRoutes = new Hono<AppEnv>();

alertasRoutes.post("/vigia/run", analystOrAdmin, rateLimit("agents"), async (c) => {
  const auth = getAuth(c);
  // Cuerpo opcional: la consola llama sin cuerpo.
  const text = await c.req.text();
  let raw: unknown = {};
  if (text.trim()) {
    try {
      raw = JSON.parse(text);
    } catch {
      throw new ApiError("bad_request", "El cuerpo debe ser JSON");
    }
  }
  const body = VigiaRunRequest.parse(raw);
  await audit(c.env, {
    ...actorOf(auth),
    action: "agent.vigia.run",
    target_type: null,
    target_id: null,
    details: { trigger: "manual", ...body },
  });
  const alerts = await runVigia(c.env, {
    trigger: "manual",
    actor: actorOf(auth),
    lookbackDays: body.lookback_days,
    image: body.image,
  });
  return c.json({ alerts });
});

/** Alertas de todas las zonas: el equipo central las revisa sin filtro por organización. */
alertasRoutes.get("/alerts", async (c) => {
  const q = parseQuery(c, AlertsQuery);
  return c.json({ alerts: (await listAlerts(c.env, q.status)).map(alertView) });
});

/** Una alerta nunca lleva números o cuentas completos (sección 10.4). */
function assertNoFullNumbers(text: string): void {
  if (/\d[\d\s-]{6,}\d/.test(text)) {
    throw new ApiError("bad_request", "La alerta no puede incluir números de teléfono o cuentas completos");
  }
}

alertasRoutes.post("/alerts/:id/decision", centralTeam, async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, AlertDecisionRequest);
  const a = await getAlert(c.env, c.req.param("id"));
  const draft = JSON.parse(a.draft_json) as AlertaBorrador;
  const edited: AlertaBorrador = {
    ...draft,
    ...(body.titulo ? { titulo: body.titulo } : {}),
    ...(body.cuerpo ? { cuerpo: body.cuerpo } : {}),
  };
  if (body.decision === "aprobar") {
    assertNoFullNumbers(`${edited.titulo} ${edited.cuerpo}`);
    await approveAlert(c.env, a.id, edited, auth.sub);
  } else {
    await rejectAlert(c.env, a.id, edited);
  }
  await audit(c.env, {
    ...actorOf(auth),
    action: "alert.decision",
    target_type: "alert",
    target_id: a.id,
    details: { decision: body.decision, edited: Boolean(body.titulo || body.cuerpo), org_id: a.org_id },
  });
  return c.json(alertView(await getAlert(c.env, a.id)));
});

alertasRoutes.get("/alerts/:id/image", centralTeam, async (c) => {
  const a = await getAlert(c.env, c.req.param("id"));
  if (!a.image_r2_key) throw notFound("Imagen");
  const obj = await c.env.EVIDENCE.get(a.image_r2_key);
  if (!obj) throw notFound("Imagen");
  return new Response(obj.body, {
    headers: { "content-type": obj.httpMetadata?.contentType ?? "image/png", "cache-control": "no-store" },
  });
});
