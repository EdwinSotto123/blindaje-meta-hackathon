import { Hono } from "hono";
import { DEMO_READONLY_USER_ID } from "../../auth/tokens";
import { ApiError } from "../../lib/errors";
import { getAuth, requireAuth, requireRole } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import type { AppEnv } from "../../types";
import { administracionRoutes } from "./administracion";
import { alertasRoutes } from "./alertas";
import { auditoriaRoutes } from "./auditoria";
import { evidenciaRoutes } from "./evidencia";
import { expedientesRoutes } from "./expedientes";
import { negociosRoutes } from "./negocios";
import { operacionRoutes } from "./operacion";
import { redesRoutes } from "./redes";
import { sesionRoutes } from "./sesion";
import { vinculosRoutes } from "./vinculos";
import { zonasRoutes } from "./zonas";

/**
 * Consola del equipo central (/v1/console): un archivo por sección. Los dos middlewares de aquí
 * corren antes que los de cada ruta.
 */
export const consoleRoutes = new Hono<AppEnv>();

consoleRoutes.use("*", requireAuth, requireRole("reviewer", "analyst", "admin"), rateLimit("console"));

/** Lo único que la cuenta de jurado puede hacer además de leer: consultar el motor vectorial. */
const PERMITIDO_SOLO_LECTURA = new Set(["/v1/console/vectores/consulta"]);
consoleRoutes.use("*", async (c, next) => {
  const lectura = c.req.method === "GET" || c.req.method === "HEAD";
  if (!lectura && getAuth(c).sub === DEMO_READONLY_USER_ID && !PERMITIDO_SOLO_LECTURA.has(c.req.path)) {
    throw new ApiError(
      "forbidden",
      "Cuenta de solo lectura: puedes ver todo, pero no aprobar, editar ni correr agentes.",
    );
  }
  await next();
});

consoleRoutes
  .route("/", sesionRoutes)
  .route("/", vinculosRoutes)
  .route("/", evidenciaRoutes)
  .route("/", redesRoutes)
  .route("/", alertasRoutes)
  .route("/", negociosRoutes)
  .route("/", zonasRoutes)
  .route("/", expedientesRoutes)
  .route("/", operacionRoutes)
  .route("/", auditoriaRoutes)
  .route("/", administracionRoutes);
