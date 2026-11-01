import { Hono } from "hono";
import { MIN_CASES_FOR_STATS, MIN_VICTIMS_FOR_STATS } from "@blindaje/shared";
import { audit } from "../audit";
import {
  CENTRAL_ORG,
  DEMO_ACTOR,
  DEMO_BUSINESS,
  DEMO_INVITES,
  DEMO_ORG,
  DEMO_USERS,
  DEMO_ZONES,
  demoAggregateCount,
} from "../demo/data";
import { resetDemo } from "../demo/reset";
import { seedDemo } from "../demo/seed";
import { timingSafeEqualStr } from "../lib/crypto";
import { ApiError } from "../lib/errors";
import type { AppEnv } from "../types";

/**
 * Modo demo (solo con DEMO_MODE=true y header x-demo-secret = DEMO_SECRET).
 * Todo lo que crea está marcado is_demo y dice "ficticio" (también la cuenta del portal de negocios,
 * "Bodega Don Lucho (ficticia)"). Las contraseñas están en README.md.
 * Los casos A, B y C los crea el script de eval/ usando la API como la app, con los códigos de
 * invitación DEMO-CASO-* y el header `x-demo-case-code`.
 * Desde el rediseño del 28/10: el equipo (revisión, análisis, administración) es de la organización
 * central, la organización demo queda como canal de difusión de las invitaciones, y el seed agrega
 * casos ficticios por distrito (fichas sin evidencia) para que el mapa tenga distritos sobre y bajo
 * el umbral. Los datos están en src/demo/.
 */
export const demoRoutes = new Hono<AppEnv>();

demoRoutes.use("*", async (c, next) => {
  if (c.env.DEMO_MODE !== "true")
    throw new ApiError("demo_disabled", "El modo demo no está habilitado en este entorno");
  const secret = c.req.header("x-demo-secret") ?? "";
  if (!c.env.DEMO_SECRET || !timingSafeEqualStr(secret, c.env.DEMO_SECRET)) {
    throw new ApiError("unauthorized", "Secreto de demo inválido");
  }
  await next();
});

demoRoutes.post("/seed", async (c) => {
  const env = c.env;
  const seeded = await seedDemo(env);
  const sobre = DEMO_ZONES.filter((z) => z.casos >= MIN_CASES_FOR_STATS && z.victimas >= MIN_VICTIMS_FOR_STATS).map(
    (z) => z.distrito,
  );
  const bajo = DEMO_ZONES.filter((z) => !sobre.includes(z.distrito)).map((z) => z.distrito);
  await audit(env, {
    ...DEMO_ACTOR,
    action: "demo.seed",
    target_type: "organization",
    target_id: DEMO_ORG.id,
    details: {
      users_created: seeded.users_created,
      business_created: seeded.business_created,
      aggregate_cases: demoAggregateCount(),
    },
  });
  return c.json(
    {
      org: { id: DEMO_ORG.id, name: DEMO_ORG.name },
      central: { id: CENTRAL_ORG.id, name: CENTRAL_ORG.name },
      users: DEMO_USERS.map((u) => ({ id: u.id, email: u.email, display_name: u.display_name, role: u.role })),
      invites: DEMO_INVITES.map((i) => i.code),
      business_accounts: [
        {
          id: DEMO_BUSINESS.id,
          email: DEMO_BUSINESS.email,
          business_name: DEMO_BUSINESS.business_name,
          sector: DEMO_BUSINESS.sector,
          zona: DEMO_BUSINESS.zona,
        },
      ],
      zonas: {
        casos_agregados: demoAggregateCount(),
        sobre_umbral: sobre,
        bajo_umbral: bajo,
        consulta: "GET /v1/public/zones?demo=1",
      },
      passwords: "Ver services/api/README.md (sección Demo)",
      ficticio: true,
    },
    201,
  );
});

demoRoutes.post("/reset", async (c) => {
  const env = c.env;
  const summary = await resetDemo(env);
  await audit(env, { ...DEMO_ACTOR, action: "demo.reset", target_type: null, target_id: null, details: summary });
  return c.json({ ok: true, deleted: summary });
});
