import { Hono } from "hono";
import {
  AsesorRunRequest,
  CENTRAL_ORG_ID,
  CreateBusinessAccountRequest,
  RecommendationDecisionRequest,
} from "@blindaje/shared";
import { getOrgDemo } from "../../admin";
import { asesorTargets, runAsesorFor } from "../../agents/asesor";
import { audit } from "../../audit";
import { businessMeView, getBusinessById, insertBusinessAccount } from "../../business/accounts";
import {
  approveRecommendation,
  getRecommendation,
  listRecommendations,
  recommendationConsoleView,
  rejectRecommendation,
} from "../../business/recommendations";
import { hasLongDigits, isUnsafeAdvice } from "../../business/safety";
import { isUniqueViolation } from "../../lib/db";
import { ApiError, notFound } from "../../lib/errors";
import { parseQuery, readJson } from "../../lib/http";
import { newId } from "../../lib/ids";
import { getAuth, requireRole } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { actorOf, type AppEnv } from "../../types";
import { RecommendationsQuery } from "../schemas";
import { analystOrAdmin, centralTeam, consoleIsDemo } from "./guards";

/** Negocios: Asesor, recomendaciones y cuentas del portal. */
export const negociosRoutes = new Hono<AppEnv>();

/**
 * Asesor por distrito y rubro (`zona`, `sector`); sin zona, los distritos que pasan el umbral. Las
 * recomendaciones quedan en borrador en la organización central. `org_id` se ignora.
 */
negociosRoutes.post("/asesor/run", analystOrAdmin, rateLimit("agents"), async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, AsesorRunRequest);
  const isDemo = await consoleIsDemo(c);
  const targets = await asesorTargets(c.env, body, { isDemo });
  await audit(c.env, {
    ...actorOf(auth),
    action: "agent.asesor.run",
    target_type: "organization",
    target_id: CENTRAL_ORG_ID,
    details: { demo: isDemo, targets: targets.map((t) => ({ zona: t.zona, sector: t.sector })) },
  });
  const recommendations = [];
  for (const t of targets) {
    recommendations.push(await runAsesorFor(c.env, t, { isDemo, actor: actorOf(auth) }));
  }
  return c.json({ recommendations });
});

negociosRoutes.get("/recommendations", async (c) => {
  const q = parseQuery(c, RecommendationsQuery);
  return c.json({ recommendations: (await listRecommendations(c.env, q.status)).map(recommendationConsoleView) });
});

negociosRoutes.post("/recommendations/:id/decision", centralTeam, async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, RecommendationDecisionRequest);
  const r = await getRecommendation(c.env, c.req.param("id"));
  const view = recommendationConsoleView(r);
  if (body.decision === "aprobar") {
    if (!view.citation_check.ok) {
      throw new ApiError("conflict", "La recomendación no pasó el validador de citas: vuelve a correr el Asesor");
    }
    // Última barrera antes de que llegue al portal público, a los negocios y a las víctimas.
    const c_ = view.contenido;
    const textos = [
      c_.resumen,
      ...c_.recomendaciones.flatMap((x) => [x.titulo, x.detalle]),
      ...c_.que_hacer_si_te_pasa,
      ...c_.advertencias,
    ];
    if (textos.some((t) => hasLongDigits(t) || /ID-/.test(t))) {
      throw new ApiError(
        "bad_request",
        "La recomendación no puede incluir números de teléfono, cuentas ni identificadores",
      );
    }
    if (textos.some((t) => isUnsafeAdvice(t))) {
      throw new ApiError(
        "bad_request",
        "La recomendación no puede aconsejar pagar, negociar ni actuar contra personas",
      );
    }
    await approveRecommendation(c.env, r.id, auth.sub);
  } else {
    await rejectRecommendation(c.env, r.id);
  }
  await audit(c.env, {
    ...actorOf(auth),
    action: "recommendation.decision",
    target_type: "business_recommendation",
    target_id: r.id,
    details: { decision: body.decision, previous: r.status, org_id: r.org_id, zona: r.zona, sector: r.sector },
  });
  return c.json(recommendationConsoleView(await getRecommendation(c.env, r.id)));
});

negociosRoutes.post("/business-accounts", requireRole("admin", "reviewer"), async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, CreateBusinessAccountRequest);
  const orgId = body.org_id ?? auth.org;
  const org = await getOrgDemo(c.env, orgId);
  if (!org) throw notFound("Organización");
  const id = newId();
  try {
    await insertBusinessAccount(c.env, {
      id,
      org_id: org.id,
      email: body.email.trim().toLowerCase(),
      password: body.password,
      business_name: body.business_name.trim(),
      sector: body.sector.trim(),
      zona: body.zona.trim(),
      is_demo: org.is_demo,
      created_by: auth.sub,
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new ApiError("conflict", "Ya existe una cuenta de negocio con ese correo");
    throw err;
  }
  await audit(c.env, {
    ...actorOf(auth),
    action: "business_account.create",
    target_type: "business_account",
    target_id: id,
    details: { org_id: org.id },
  });
  return c.json(businessMeView((await getBusinessById(c.env, id))!), 201);
});
