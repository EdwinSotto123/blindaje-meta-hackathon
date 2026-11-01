import { Hono } from "hono";
import { LinkDecisionRequest } from "@blindaje/shared";
import { audit } from "../../audit";
import { buildLinkView, getLinkRow } from "../../console/views";
import { ApiError } from "../../lib/errors";
import { parseQuery, readJson } from "../../lib/http";
import { bothCasesCommunity, listLinksByStatus, setLinkDecision } from "../../linking/review";
import { getAuth } from "../../middleware/auth";
import { recomputeNetworks } from "../../networks";
import { actorOf, type AppEnv } from "../../types";
import { LinksQuery } from "../schemas";
import { centralTeam } from "./guards";

/** Vínculos. */
export const vinculosRoutes = new Hono<AppEnv>();

vinculosRoutes.get("/links", centralTeam, async (c) => {
  const q = parseQuery(c, LinksQuery);
  const statuses = !q.status
    ? ["probable", "por_revisar"]
    : q.status === "todos"
      ? ["probable", "por_revisar", "confirmado", "descartado"]
      : [q.status];
  const results = await listLinksByStatus(c.env, statuses, q.limit);
  const links = await Promise.all(results.map((r) => buildLinkView(c.env, r)));
  return c.json({ links });
});

vinculosRoutes.get("/links/:id", centralTeam, async (c) => {
  const auth = getAuth(c);
  const row = await getLinkRow(c.env, c.req.param("id"));
  const view = await buildLinkView(c.env, row);
  await audit(c.env, {
    ...actorOf(auth),
    action: "link.view",
    target_type: "link",
    target_id: row.id,
    details: { label: view.label },
  });
  return c.json(view);
});

vinculosRoutes.post("/links/:id/decision", centralTeam, async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, LinkDecisionRequest);
  const row = await getLinkRow(c.env, c.req.param("id"));
  const status = body.decision === "confirmar" ? "confirmado" : "descartado";
  if (status === "confirmado" && !(await bothCasesCommunity(c.env, row.case_a, row.case_b))) {
    throw new ApiError("conflict", "Uno de los casos ya no tiene consentimiento comunitario");
  }
  await setLinkDecision(c.env, row.id, { status, reviewer_id: auth.sub, note: body.note ?? null });
  if (status === "confirmado" || row.status === "confirmado") await recomputeNetworks(c.env);
  await audit(c.env, {
    ...actorOf(auth),
    action: "link.decision",
    target_type: "link",
    target_id: row.id,
    details: { decision: body.decision, previous: row.status, score: row.score, num: row.num },
  });
  return c.json(await buildLinkView(c.env, await getLinkRow(c.env, row.id)));
});
