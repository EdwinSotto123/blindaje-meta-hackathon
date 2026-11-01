import { isDemoUser } from "../../auth/tokens";
import { getAuth, requireRole } from "../../middleware/auth";
import type { AppContext } from "../../types";

// La administración ve y hace todo lo de la consola (decisión del 29/10: es el panel de monitoreo de
// quien dirige Blindaje). Revisión y análisis conservan solo lo suyo.
/** El equipo central completo: revisa vínculos y aprueba alertas y consejos de cualquier zona. */
export const centralTeam = requireRole("reviewer", "analyst", "admin");
export const analystOrAdmin = requireRole("analyst", "admin");
export const adminOnly = requireRole("admin");

/**
 * Mundo de los datos de la consola: las cuentas del demo (users.is_demo) trabajan sobre los casos
 * del demo y las demás sobre los reales. Con DEMO_MODE=true, `?demo=1|0` lo cambia.
 */
export async function consoleIsDemo(c: AppContext, override?: string): Promise<boolean> {
  if (c.env.DEMO_MODE === "true" && override !== undefined) return override === "1" || override === "true";
  const auth = getAuth(c);
  return isDemoUser(c.env, auth.sub);
}
