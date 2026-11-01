import { Hono } from "hono";
import { consoleUserView, getUserById } from "../../auth/tokens";
import { ApiError } from "../../lib/errors";
import { getAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types";

/** Sesión. */
export const sesionRoutes = new Hono<AppEnv>();

sesionRoutes.get("/me", async (c) => {
  const auth = getAuth(c);
  const user = await getUserById(c.env, auth.sub);
  if (!user || user.disabled) throw new ApiError("unauthorized", "Sesión vencida. Vuelve a ingresar.");
  return c.json(consoleUserView(user));
});
