import { Hono } from "hono";
import { insertInvite, insertOrg, insertUser, listOrgs, listUsers, orgExists } from "../../admin";
import { audit } from "../../audit";
import { consoleUserView, getUserById } from "../../auth/tokens";
import { isUniqueViolation } from "../../lib/db";
import { ApiError, notFound } from "../../lib/errors";
import { readJson } from "../../lib/http";
import { addSeconds, inviteCode, newId, nowIso } from "../../lib/ids";
import { getAuth, requireRole } from "../../middleware/auth";
import { actorOf, type AppEnv } from "../../types";
import { CreateInvitesRequest, CreateOrgRequest, CreateUserRequest } from "../schemas";
import { adminOnly } from "./guards";

/** Administración: organizaciones, invitaciones y usuarios. */
export const administracionRoutes = new Hono<AppEnv>();

administracionRoutes.get("/orgs", adminOnly, async (c) => {
  const results = await listOrgs(c.env);
  return c.json({ orgs: results.map((o) => ({ ...o, is_demo: o.is_demo === 1 })) });
});

administracionRoutes.post("/orgs", adminOnly, async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, CreateOrgRequest);
  const id = newId();
  const now = nowIso();
  await insertOrg(c.env, { id, name: body.name, kind: body.kind, district: body.district ?? null, created_at: now });
  await audit(c.env, {
    ...actorOf(auth),
    action: "org.create",
    target_type: "organization",
    target_id: id,
    details: { kind: body.kind },
  });
  return c.json(
    { id, name: body.name, kind: body.kind, district: body.district ?? null, is_demo: false, created_at: now },
    201,
  );
});

administracionRoutes.post("/invites", requireRole("admin", "reviewer"), async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, CreateInvitesRequest);
  // Las invitaciones son de un canal de difusión (cualquier organización); por defecto, la de quien las pide.
  const orgId = body.org_id ?? auth.org;
  if (!(await orgExists(c.env, orgId))) throw notFound("Organización");
  const now = nowIso();
  const expires = addSeconds(now, body.expires_days * 86400);
  const codes: string[] = [];
  while (codes.length < body.count) {
    const code = inviteCode();
    const created = await insertInvite(c.env, {
      code,
      org_id: orgId,
      created_by: auth.sub,
      created_at: now,
      expires_at: expires,
      max_uses: body.max_uses,
    });
    if (created) codes.push(code);
  }
  await audit(c.env, {
    ...actorOf(auth),
    action: "invites.create",
    target_type: "organization",
    target_id: orgId,
    details: { count: codes.length, max_uses: body.max_uses, expires_at: expires },
  });
  return c.json({ codes }, 201);
});

administracionRoutes.get("/users", adminOnly, async (c) => {
  const results = await listUsers(c.env);
  return c.json({ users: results.map((u) => ({ ...consoleUserView(u), disabled: u.disabled === 1 })) });
});

administracionRoutes.post("/users", adminOnly, async (c) => {
  const auth = getAuth(c);
  const body = await readJson(c, CreateUserRequest);
  if (!(await orgExists(c.env, body.org_id))) throw notFound("Organización");
  const id = newId();
  try {
    await insertUser(c.env, {
      id,
      org_id: body.org_id,
      email: body.email.trim().toLowerCase(),
      display_name: body.display_name,
      password: body.password,
      role: body.role,
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new ApiError("conflict", "Ya existe un usuario con ese correo");
    throw err;
  }
  await audit(c.env, {
    ...actorOf(auth),
    action: "user.create",
    target_type: "user",
    target_id: id,
    details: { role: body.role, org_id: body.org_id },
  });
  const user = await getUserById(c.env, id);
  return c.json(consoleUserView(user!), 201);
});
