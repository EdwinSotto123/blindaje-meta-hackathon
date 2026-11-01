import { z } from "zod";
import {
  BusinessRecommendationView,
  CENTRAL_ORG_ID,
  CaseSummary,
  ConsoleRole,
  LinkStatus,
  RecommendationStatus,
  Sector,
  VictimAlert,
  districtOfZone,
} from "@blindaje/shared";

/**
 * Esquemas propios de las rutas (cuerpos, queries y algunas respuestas) que no están en
 * packages/shared. Módulo puro (solo zod y @blindaje/shared): lo usan las rutas y también la
 * especificación OpenAPI (src/openapi/spec.ts), que no puede importar las rutas porque estas cargan
 * módulos que solo existen en Cloudflare.
 */

/** Versión de la API (GET /v1/health, el monitoreo y docs/openapi.json). */
export const API_VERSION = "0.1.0";

// ---------------------------------------------------------------------------
// Comunes
// ---------------------------------------------------------------------------

/**
 * Mundo de los datos: por defecto, el real. `?demo=1` sirve los datos ficticios del demo, y solo se
 * respeta donde DEMO_MODE=true (en producción se ignora).
 */
const DemoFlag = z.enum(["0", "1", "true", "false"]).optional();

/** Distrito de Lima Metropolitana o del Callao (id o nombre); devuelve el id. */
const DistrictParam = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .transform((v, ctx) => {
    const d = districtOfZone(v);
    if (!d) {
      ctx.addIssue({ code: "custom", message: "No es un distrito de Lima Metropolitana o del Callao" });
      return z.NEVER;
    }
    return d.id;
  });

/** `{ alerts }` de la víctima y del portal de negocios. */
export const AlertListResponse = z.object({ alerts: z.array(VictimAlert) });

/** `{ recommendations }` de la víctima y del portal de negocios. */
export const RecommendationListResponse = z.object({ recommendations: z.array(BusinessRecommendationView) });

// ---------------------------------------------------------------------------
// Público (/v1/public)
// ---------------------------------------------------------------------------

export const PublicZonesQuery = z.object({ demo: DemoFlag });

export const PublicRiskQuery = z.object({ zona: DistrictParam, sector: Sector.optional(), demo: DemoFlag });

export const PublicAlertsQuery = z.object({ zona: DistrictParam.optional(), demo: DemoFlag });

export const PublicRecommendationsQuery = z.object({
  zona: DistrictParam.optional(),
  sector: Sector.optional(),
  demo: DemoFlag,
});

// ---------------------------------------------------------------------------
// Autenticación (/v1/auth)
// ---------------------------------------------------------------------------

export const LogoutRequest = z.object({ refresh_token: z.string().min(1).max(200) });

// ---------------------------------------------------------------------------
// Víctima (/v1)
// ---------------------------------------------------------------------------

export const VoiceSampleResponse = z.object({ ok: z.literal(true) });

export const CaseListResponse = z.object({ cases: z.array(CaseSummary) });

export const VictimAlertsQuery = z.object({ zona: DistrictParam.optional() });

export const VictimRecommendationsQuery = z.object({ zona: DistrictParam.optional(), sector: Sector.optional() });

// ---------------------------------------------------------------------------
// Negocios (/v1/business)
// ---------------------------------------------------------------------------

export const RiskQuery = z.object({
  zona: z.string().trim().min(2).max(80).optional(),
  sector: z.string().trim().min(2).max(80).optional(),
});

// ---------------------------------------------------------------------------
// Consola (/v1/console)
// ---------------------------------------------------------------------------

export const LinksQuery = z.object({
  status: z.union([LinkStatus, z.literal("todos")]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const MediaQuery = z
  .object({
    start_ms: z.coerce.number().int().min(0).optional(),
    end_ms: z.coerce.number().int().min(0).optional(),
  })
  .refine((q) => (q.start_ms === undefined) === (q.end_ms === undefined), { message: "start_ms y end_ms van juntos" })
  .refine((q) => q.start_ms === undefined || q.end_ms! > q.start_ms, { message: "end_ms debe ser mayor que start_ms" });

export const CartografoRunRequest = z.object({
  model: z.enum(["muse-spark-1.3", "muse-wonder-1.0"]).default("muse-spark-1.3"),
});

export const ProfileDecisionRequest = z.object({ decision: z.enum(["aprobar", "rechazar"]) });

export const VigiaRunRequest = z.object({
  lookback_days: z.coerce.number().int().min(1).max(365).optional(),
  image: z.boolean().optional(),
});

export const AlertsQuery = z.object({ status: z.enum(["borrador", "aprobada", "rechazada"]).optional() });

export const RecommendationsQuery = z.object({ status: RecommendationStatus.optional() });

export const ZonesQuery = z.object({
  dias: z.coerce.number().int().min(7).max(365).default(28),
  demo: DemoFlag,
});

export const VectorTraceRequest = z.object({ case_id: z.string().min(1).max(64) });

export const AuditQuery = z.object({
  before_seq: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export const CreateOrgRequest = z.object({
  name: z.string().min(2).max(160),
  kind: z.enum(["gremio", "asociacion_mercado", "junta_vecinal", "alianza"]).default("gremio"),
  district: z.string().max(80).optional(),
});

export const CreateInvitesRequest = z.object({
  org_id: z.string().optional(),
  count: z.coerce.number().int().min(1).max(50),
  max_uses: z.coerce.number().int().min(1).max(100).default(1),
  expires_days: z.coerce.number().int().min(1).max(365).default(30),
});

export const CreateUserRequest = z.object({
  email: z.string().email().max(160),
  display_name: z.string().min(2).max(120),
  role: ConsoleRole,
  /** Por defecto, la organización central: el equipo de Blindaje. */
  org_id: z.string().default(CENTRAL_ORG_ID),
  password: z.string().min(12).max(200),
});
