import { Hono } from "hono";
import { HypothesisDecisionRequest } from "@blindaje/shared";
import { runCartografo } from "../../agents";
import { audit } from "../../audit";
import { buildNetworkView, hypothesisView, listNetworkSummaries, listProfiles } from "../../console/views";
import { budgetGuard } from "../../costs";
import { ApiError, notFound } from "../../lib/errors";
import { readJson } from "../../lib/http";
import { getAuth } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { findNetwork } from "../../networks";
import {
  getHypothesis,
  getHypothesisForDecision,
  getProfileRef,
  setHypothesisStatus,
  setProfileStatus,
} from "../../networks/profiles";
import { actorOf, type AppEnv } from "../../types";
import { CartografoRunRequest, ProfileDecisionRequest } from "../schemas";
import { analystOrAdmin } from "./guards";

/** Redes, perfiles e hipótesis. */
export const redesRoutes = new Hono<AppEnv>();

redesRoutes.get("/networks", analystOrAdmin, async (c) => {
  return c.json({ networks: await listNetworkSummaries(c.env) });
});

redesRoutes.get("/networks/:id", analystOrAdmin, async (c) => {
  const auth = getAuth(c);
  const view = await buildNetworkView(c.env, c.req.param("id"));
  await audit(c.env, {
    ...actorOf(auth),
    action: "network.view",
    target_type: "network",
    target_id: view.id,
    details: { label: view.label },
  });
  return c.json(view);
});

redesRoutes.post("/networks/:id/cartografo", analystOrAdmin, rateLimit("agents"), async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, CartografoRunRequest);
  const net = await findNetwork(c.env, c.req.param("id"));
  if (!net) throw notFound("Red");
  if (body.model === "muse-wonder-1.0") {
    await budgetGuard(c.env, { essential: false, model: body.model, operation: "cartografo" });
  }
  await audit(c.env, {
    ...actorOf(auth),
    action: "agent.cartografo.run",
    target_type: "network",
    target_id: net.id,
    details: { model: body.model },
  });
  const profile = await runCartografo(c.env, net.id, { model: body.model, actor: actorOf(auth) });
  return c.json(profile);
});

redesRoutes.get("/networks/:id/profiles", analystOrAdmin, async (c) => {
  const net = await findNetwork(c.env, c.req.param("id"));
  if (!net) throw notFound("Red");
  return c.json({ profiles: await listProfiles(c.env, net.id) });
});

redesRoutes.post("/hypotheses/:id/decision", analystOrAdmin, async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, HypothesisDecisionRequest);
  const h = await getHypothesisForDecision(c.env, c.req.param("id"));
  if (!h) throw notFound("Hipótesis");
  if (body.decision === "aprobar" && h.profile_status === "invalido") {
    throw new ApiError("conflict", "No se puede aprobar una hipótesis de un perfil que no pasó el validador de citas");
  }
  const status = body.decision === "aprobar" ? "aprobada" : "descartada";
  await setHypothesisStatus(c.env, h.id, status, auth.sub);
  await audit(c.env, {
    ...actorOf(auth),
    action: "hypothesis.decision",
    target_type: "hypothesis",
    target_id: h.id,
    details: { decision: body.decision, previous: h.status, network_id: h.network_id },
  });
  const updated = await getHypothesis(c.env, h.id);
  return c.json(hypothesisView(updated!));
});

/** Aprobación del perfil de red por la persona analista (las hipótesis se deciden una por una). */
redesRoutes.post("/profiles/:id/decision", analystOrAdmin, async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, ProfileDecisionRequest);
  const p = await getProfileRef(c.env, c.req.param("id"));
  if (!p) throw notFound("Perfil");
  if (p.status === "invalido")
    throw new ApiError("conflict", "El perfil no pasó el validador de citas: vuelve a correr el Cartógrafo");
  const status = body.decision === "aprobar" ? "aprobado" : "rechazado";
  await setProfileStatus(c.env, p.id, status, auth.sub);
  await audit(c.env, {
    ...actorOf(auth),
    action: "profile.decision",
    target_type: "network_profile",
    target_id: p.id,
    details: { decision: body.decision, previous: p.status, network_id: p.network_id },
  });
  const view = (await listProfiles(c.env, p.network_id)).find((x) => x.id === p.id);
  if (!view) throw notFound("Perfil");
  return c.json(view);
});
