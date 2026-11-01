import { Hono } from "hono";
import { listAudit, verifyAuditChain } from "../../audit";
import { costsSummary } from "../../costs";
import { parseQuery } from "../../lib/http";
import type { AppEnv } from "../../types";
import { AuditQuery } from "../schemas";
import { analystOrAdmin } from "./guards";

/** Auditoría y costos. */
export const auditoriaRoutes = new Hono<AppEnv>();

auditoriaRoutes.get("/audit", analystOrAdmin, async (c) => {
  const q = parseQuery(c, AuditQuery);
  return c.json({ entries: await listAudit(c.env, q) });
});

auditoriaRoutes.get("/audit/verify", analystOrAdmin, async (c) => {
  return c.json(await verifyAuditChain(c.env));
});

auditoriaRoutes.get("/costs", analystOrAdmin, async (c) => {
  return c.json(await costsSummary(c.env));
});
