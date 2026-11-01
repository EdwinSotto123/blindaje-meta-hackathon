import { z } from "zod";
import * as S from "@blindaje/shared";
import * as R from "../routes/schemas";

/**
 * Especificación OpenAPI 3.1 de la API, armada desde los esquemas Zod que ya usan las rutas
 * (src/routes/schemas.ts y @blindaje/shared). Módulo puro: no importa las rutas, que cargan módulos
 * que solo existen en Cloudflare.
 *
 * ROUTES lista cada ruta; test/openapi.test.ts verifica que coincida exactamente con las rutas de la
 * app. `pnpm --filter @blindaje/api openapi` escribe docs/openapi.json, y el lint de la API falla si
 * quedó desactualizado.
 */

type Method = "get" | "post" | "put" | "delete";
type Tag = "Salud" | "Público" | "Autenticación" | "Víctima" | "Negocios" | "Consola" | "Demo";
type Auth = "none" | "device" | "console" | "business" | "demo";
type Status = 200 | 201 | 202 | 204;
type ConsoleRole = z.infer<typeof S.ConsoleRole>;

/** Cuerpo o respuesta binaria: los tipos MIME posibles. */
interface Binary {
  binary: string | readonly string[];
  description?: string;
}

interface RouteSpec {
  method: Method;
  /** Ruta OpenAPI, con los parámetros entre llaves: `/v1/console/links/{id}`. */
  path: string;
  tag: Tag;
  summary: string;
  description?: string;
  auth: Auth | readonly Auth[];
  /** Roles de consola que pueden llamarla. */
  roles?: readonly ConsoleRole[];
  query?: z.ZodObject;
  headers?: z.ZodObject;
  body?: z.ZodType | Binary;
  /** Por defecto 200. Con varios, la misma respuesta para cada uno. */
  status?: Status | readonly Status[];
  /** Esquema de la respuesta, archivo binario o, si nada valida la forma, solo una descripción. */
  response: z.ZodType | Binary | string;
}

// ---------------------------------------------------------------------------
// Esquemas que solo existen aquí
// ---------------------------------------------------------------------------

/** El error de siempre (src/lib/errors.ts). */
const ErrorBody = z.object({
  error: z.object({ code: S.ErrorCode, message: z.string(), details: z.unknown().optional() }),
});

/** `{ [key]: T[] }`, como el `listOf` de los clientes. */
const list = (key: string, item: z.ZodType) => z.object({ [key]: z.array(item) });

// Respuestas que ningún cliente valida: la forma sale tal cual del handler.
const HealthResponse = z.object({ ok: z.literal(true), env: z.string(), version: z.string() });
const CreatedId = z.object({ id: z.string() });
const Org = { id: z.string(), name: z.string(), kind: z.string(), district: z.string().nullable() };
const OrgList = list(
  "orgs",
  z.object({ ...Org, is_demo: z.boolean(), created_at: z.string(), devices: z.number(), users: z.number() }),
);
const CreatedOrg = z.object({ ...Org, is_demo: z.literal(false), created_at: z.string() });
const UserList = list("users", S.ConsoleUser.extend({ disabled: z.boolean() }));
const IdName = z.object({ id: z.string(), name: z.string() });
const DemoSeedResponse = z.object({
  org: IdName,
  central: IdName,
  users: z.array(z.object({ id: z.string(), email: z.string(), display_name: z.string(), role: S.ConsoleRole })),
  invites: z.array(z.string()),
  business_accounts: z.array(
    z.object({ id: z.string(), email: z.string(), business_name: z.string(), sector: z.string(), zona: z.string() }),
  ),
  zonas: z.object({
    casos_agregados: z.number(),
    sobre_umbral: z.array(z.string()),
    bajo_umbral: z.array(z.string()),
    consulta: z.string(),
  }),
  passwords: z.string(),
  ficticio: z.literal(true),
});
const DemoResetResponse = z.object({
  ok: z.literal(true),
  deleted: z.object({
    cases: z.number(),
    aggregate_cases: z.number(),
    devices: z.number(),
    users: z.number(),
    business_accounts: z.number(),
  }),
});

// Queries y headers que el handler lee sin esquema.
const LeakTraceQuery = z.object({
  kind: S.LeakTraceKind.optional().describe("Si falta, se deduce del content-type o de los primeros bytes"),
});
const MonitorQuery = z.object({
  demo: z.string().optional().describe("Con DEMO_MODE=true, 1 o true muestra el mundo del demo y otro valor el real"),
});
const DemoScriptHeader = z.object({
  "x-demo-secret": z.string().optional().describe("Solo el script del demo: lo exime del límite de registros por IP"),
});
const DemoCaseHeader = z.object({
  "x-demo-case-code": z
    .string()
    .optional()
    .describe("Solo el script del demo (DEMO_MODE=true y dispositivo del demo): una letra que será el código del caso"),
});

// ---------------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------------

const PUBLICO = { tag: "Público", auth: "none" } as const;
const AUTH = { tag: "Autenticación", auth: "none" } as const;
const VICTIMA = { tag: "Víctima", auth: "device" } as const;
const NEGOCIOS = { tag: "Negocios", auth: "business" } as const;
const DEMO = { tag: "Demo", auth: "demo" } as const;
const CONSOLA = { tag: "Consola", auth: "console" } as const;

const EQUIPO = ["reviewer", "analyst", "admin"] as const;
const ANALISIS = ["analyst", "admin"] as const;
const ADMIN = ["admin"] as const;
const ADMIN_REVISION = ["admin", "reviewer"] as const;

const MUNDO_DEMO = "Con DEMO_MODE=true, `?demo=1` sirve los datos ficticios del demo; si no, se ignora.";

export const ROUTES: readonly RouteSpec[] = [
  {
    method: "get",
    path: "/v1/health",
    tag: "Salud",
    auth: "none",
    summary: "Estado de la API: entorno y versión",
    response: HealthResponse,
  },

  // Público
  {
    ...PUBLICO,
    method: "post",
    path: "/v1/public/pilot-requests",
    summary: "Solicitud de piloto desde la landing (verificada con Turnstile)",
    body: S.PilotRequest,
    status: 201,
    response: CreatedId,
  },
  {
    ...PUBLICO,
    method: "get",
    path: "/v1/public/zones",
    summary: "Mapa de distritos: nivel y rango de casos, sin cifras exactas",
    description: MUNDO_DEMO,
    query: R.PublicZonesQuery,
    response: S.PublicZoneMap,
  },
  {
    ...PUBLICO,
    method: "get",
    path: "/v1/public/risk",
    summary: "Panorama de riesgo de un distrito, con rangos",
    description: `\`zona\` es un distrito (id o nombre). ${MUNDO_DEMO}`,
    query: R.PublicRiskQuery,
    response: S.PublicRiskOverview,
  },
  {
    ...PUBLICO,
    method: "get",
    path: "/v1/public/alerts",
    summary: "Alertas aprobadas por el equipo central",
    description: MUNDO_DEMO,
    query: R.PublicAlertsQuery,
    response: S.PublicAlerts,
  },
  {
    ...PUBLICO,
    method: "get",
    path: "/v1/public/recommendations",
    summary: "Consejos del Asesor aprobados, por distrito y rubro",
    description: MUNDO_DEMO,
    query: R.PublicRecommendationsQuery,
    response: S.PublicRecommendations,
  },

  // Autenticación
  {
    ...AUTH,
    method: "post",
    path: "/v1/auth/device/register",
    summary: "Registro del dispositivo de una víctima",
    description: "Sin `invite_code`, el dispositivo queda en la organización central. Límite por IP.",
    headers: DemoScriptHeader,
    body: S.DeviceRegisterRequest,
    status: 201,
    response: S.DeviceRegisterResponse,
  },
  {
    ...AUTH,
    method: "post",
    path: "/v1/auth/device/refresh",
    summary: "Renueva los tokens del dispositivo (firmado con su llave)",
    body: S.DeviceRefreshRequest,
    response: S.TokenPair,
  },
  {
    ...AUTH,
    method: "post",
    path: "/v1/auth/console/login",
    summary: "Ingreso a la consola",
    body: S.ConsoleLoginRequest,
    response: S.ConsoleLoginResponse,
  },
  {
    ...AUTH,
    method: "post",
    path: "/v1/auth/console/refresh",
    summary: "Renueva los tokens de la consola",
    body: S.ConsoleRefreshRequest,
    response: S.TokenPair,
  },
  {
    ...AUTH,
    method: "post",
    path: "/v1/auth/business/login",
    summary: "Ingreso al portal de negocios",
    body: S.BusinessLoginRequest,
    response: S.BusinessLoginResponse,
  },
  {
    ...AUTH,
    method: "post",
    path: "/v1/auth/business/refresh",
    summary: "Renueva los tokens del portal de negocios",
    body: S.ConsoleRefreshRequest,
    response: S.TokenPair,
  },
  {
    ...AUTH,
    method: "post",
    path: "/v1/auth/logout",
    auth: ["device", "console", "business"],
    summary: "Cierra la sesión: revoca el refresh token",
    body: R.LogoutRequest,
    status: 204,
    response: "Sesión cerrada",
  },

  // Víctima
  {
    ...VICTIMA,
    method: "post",
    path: "/v1/me/voice-sample",
    summary: "Muestra de voz de la víctima (solo se guarda el vector cifrado)",
    body: { binary: "audio/*", description: "Audio crudo de unos 10 s (WAV, Opus o M4A)" },
    response: R.VoiceSampleResponse,
  },
  {
    ...VICTIMA,
    method: "post",
    path: "/v1/cases",
    summary: "Abre un caso",
    headers: DemoCaseHeader,
    body: S.CreateCaseRequest,
    status: 201,
    response: S.CaseSummary,
  },
  {
    ...VICTIMA,
    method: "get",
    path: "/v1/cases",
    summary: "Casos de la víctima",
    response: R.CaseListResponse,
  },
  {
    ...VICTIMA,
    method: "post",
    path: "/v1/cases/{id}/evidence",
    summary: "Sube una evidencia como archivo crudo",
    description:
      "201 si es nueva; 200 si ya estaba (reintento idempotente). `422 integrity_mismatch` si el SHA-256 no coincide.",
    headers: S.EvidenceUploadHeaders,
    body: { binary: "*/*", description: "El archivo tal cual, con su tipo MIME en content-type. Límite 50 MB." },
    status: [201, 200],
    response: S.EvidenceItem,
  },
  {
    ...VICTIMA,
    method: "post",
    path: "/v1/cases/{id}/submit",
    summary: "Envía el caso a procesar",
    body: S.SubmitCaseRequest,
    status: 202,
    response: S.SubmitCaseResponse,
  },
  {
    ...VICTIMA,
    method: "get",
    path: "/v1/cases/{id}/report",
    summary: "Reporte propio de la víctima",
    response: S.VictimReport,
  },
  {
    ...VICTIMA,
    method: "get",
    path: "/v1/cases/{id}/report.pdf",
    summary: "Denuncia en PDF para la comisaría",
    response: { binary: "application/pdf" },
  },
  {
    ...VICTIMA,
    method: "put",
    path: "/v1/cases/{id}/consent",
    summary: "Cambia el consentimiento del caso",
    body: S.ConsentRequest,
    response: S.CaseSummary,
  },
  {
    ...VICTIMA,
    method: "delete",
    path: "/v1/cases/{id}",
    summary: "Borra el caso y todo lo suyo",
    status: 204,
    response: "Caso borrado",
  },
  {
    ...VICTIMA,
    method: "get",
    path: "/v1/alerts",
    summary: "Alertas aprobadas para el distrito de la víctima",
    description: "Sin `zona`, el distrito de su caso más reciente.",
    query: R.VictimAlertsQuery,
    response: R.AlertListResponse,
  },
  {
    ...VICTIMA,
    method: "get",
    path: "/v1/recommendations",
    summary: "Consejos aprobados para el distrito y el rubro de la víctima",
    description: "Sin `zona`, el distrito de su caso más reciente.",
    query: R.VictimRecommendationsQuery,
    response: R.RecommendationListResponse,
  },

  // Negocios (portal anterior)
  {
    ...NEGOCIOS,
    method: "get",
    path: "/v1/business/me",
    summary: "Cuenta de negocio de la sesión",
    response: S.BusinessMe,
  },
  {
    ...NEGOCIOS,
    method: "get",
    path: "/v1/business/risk",
    summary: "Panorama de riesgo agregado de la zona y el rubro",
    description: "Por defecto, la zona y el rubro de la cuenta.",
    query: R.RiskQuery,
    response: S.RiskOverview,
  },
  {
    ...NEGOCIOS,
    method: "get",
    path: "/v1/business/recommendations",
    summary: "Consejos aprobados para la zona y el rubro de la cuenta",
    response: R.RecommendationListResponse,
  },
  {
    ...NEGOCIOS,
    method: "get",
    path: "/v1/business/alerts",
    summary: "Alertas aprobadas para la zona de la cuenta",
    response: R.AlertListResponse,
  },

  // Demo
  {
    ...DEMO,
    method: "post",
    path: "/v1/demo/seed",
    summary: "Crea los datos ficticios del demo",
    status: 201,
    response: DemoSeedResponse,
  },
  {
    ...DEMO,
    method: "post",
    path: "/v1/demo/reset",
    summary: "Borra todo lo marcado como demo",
    response: DemoResetResponse,
  },

  // Consola
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/me",
    roles: EQUIPO,
    summary: "Usuario de la sesión",
    response: S.ConsoleUser,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/links",
    roles: EQUIPO,
    summary: "Vínculos, ordenados por puntaje",
    description: "Sin `status`, los `probable` y `por_revisar`.",
    query: R.LinksQuery,
    response: list("links", S.LinkView),
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/links/{id}",
    roles: EQUIPO,
    summary: "Detalle de un vínculo",
    response: S.LinkView,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/links/{id}/decision",
    roles: EQUIPO,
    summary: "Confirma o descarta un vínculo",
    body: S.LinkDecisionRequest,
    response: S.LinkView,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/evidence/{id}/media",
    roles: EQUIPO,
    summary: "Medio descifrado, marcado para quien lo pide",
    description:
      "Audio recortado si hay rango e imagen redactada si existe. Headers `x-blindaje-variant`, `x-blindaje-marca` y, si no se aplicó la marca, `x-blindaje-marca-motivo`.",
    query: R.MediaQuery,
    response: { binary: "*/*", description: "El medio con su tipo MIME" },
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/leaks/trace",
    roles: ADMIN,
    summary: "Rastrea el origen de una copia filtrada",
    description: "El archivo nunca se guarda: solo su SHA-256 en la auditoría.",
    query: LeakTraceQuery,
    body: {
      binary: ["audio/*", "image/*", "application/octet-stream"],
      description: "Copia sospechosa cruda (audio o imagen). Límite 50 MB.",
    },
    response: S.LeakTraceResult,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/cases/{id}",
    roles: EQUIPO,
    summary: "Ficha y evidencia de un caso",
    description: "Además trae `transcripciones` (por evidencia), fuera del contrato de shared.",
    response: S.CaseSide,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/networks",
    roles: ANALISIS,
    summary: "Redes",
    response: list("networks", S.NetworkSummary),
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/networks/{id}",
    roles: ANALISIS,
    summary: "Detalle de una red: grafo, cronología y vínculos",
    response: S.NetworkView,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/networks/{id}/cartografo",
    roles: ANALISIS,
    summary: "Corre el Cartógrafo sobre la red",
    body: R.CartografoRunRequest,
    response: S.ProfileView,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/networks/{id}/profiles",
    roles: ANALISIS,
    summary: "Perfiles de la red",
    response: list("profiles", S.ProfileView),
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/hypotheses/{id}/decision",
    roles: ANALISIS,
    summary: "Aprueba o descarta una hipótesis",
    body: S.HypothesisDecisionRequest,
    response: S.HypothesisView,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/profiles/{id}/decision",
    roles: ANALISIS,
    summary: "Aprueba o rechaza un perfil de red",
    body: R.ProfileDecisionRequest,
    response: S.ProfileView,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/vigia/run",
    roles: ANALISIS,
    summary: "Corre el Vigía: borradores de alertas",
    body: R.VigiaRunRequest,
    response: list("alerts", S.AlertView),
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/alerts",
    roles: EQUIPO,
    summary: "Alertas de todas las zonas",
    query: R.AlertsQuery,
    response: list("alerts", S.AlertView),
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/alerts/{id}/decision",
    roles: EQUIPO,
    summary: "Aprueba o rechaza una alerta (puede editar el texto)",
    body: S.AlertDecisionRequest,
    response: S.AlertView,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/alerts/{id}/image",
    roles: EQUIPO,
    summary: "Imagen de una alerta",
    response: { binary: "image/*" },
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/asesor/run",
    roles: ANALISIS,
    summary: "Corre el Asesor por distrito y rubro",
    description: "Sin `zona`, los distritos que pasan el umbral (máximo 5). `org_id` se ignora.",
    body: S.AsesorRunRequest,
    response: list("recommendations", S.ConsoleRecommendationView),
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/recommendations",
    roles: EQUIPO,
    summary: "Recomendaciones del Asesor",
    query: R.RecommendationsQuery,
    response: list("recommendations", S.ConsoleRecommendationView),
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/recommendations/{id}/decision",
    roles: EQUIPO,
    summary: "Aprueba o rechaza una recomendación",
    body: S.RecommendationDecisionRequest,
    response: S.ConsoleRecommendationView,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/business-accounts",
    roles: ADMIN_REVISION,
    summary: "Crea una cuenta del portal de negocios",
    body: S.CreateBusinessAccountRequest,
    status: 201,
    response: S.BusinessMe,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/zones",
    roles: EQUIPO,
    summary: "Cifras exactas por distrito, con el periodo anterior",
    description: "Mundo: el de la cuenta; con DEMO_MODE=true, `?demo=1|0` lo cambia.",
    query: R.ZonesQuery,
    response: S.ConsoleZones,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/networks/{id}/expediente",
    roles: ANALISIS,
    summary: "Genera el expediente de la red (Redactor)",
    response: S.ExpedienteView,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/networks/{id}/expedientes",
    roles: ANALISIS,
    summary: "Expedientes de la red, los más recientes primero",
    response: list("expedientes", S.ExpedienteView),
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/expedientes/{id}",
    roles: ANALISIS,
    summary: "Detalle de un expediente",
    response: S.ExpedienteView,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/expedientes/{id}/pdf",
    roles: ANALISIS,
    summary: "Expediente en PDF",
    response: { binary: "application/pdf" },
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/monitoreo",
    roles: ADMIN,
    summary: "Panel de monitoreo: servicios, colas, presupuesto y agentes",
    query: MonitorQuery,
    response: S.ConsoleMonitor,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/vectores",
    roles: ADMIN,
    summary: "Estado de la base vectorial y mapa de cada índice",
    response: S.VectorOverview,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/vectores/consulta",
    roles: ADMIN,
    summary: "Corre en vivo la búsqueda de candidatos de un caso",
    description: "No crea ni cambia vínculos. La cuenta de jurado también puede usarla.",
    body: R.VectorTraceRequest,
    response: S.VectorTrace,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/vectores/sincronizar",
    roles: ADMIN,
    summary: "Sincroniza D1 con la base vectorial",
    response: S.VectorSyncResult,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/audit",
    roles: ANALISIS,
    summary: "Bitácora de auditoría, de la más reciente hacia atrás",
    query: R.AuditQuery,
    response: list("entries", S.AuditEntry),
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/audit/verify",
    roles: ANALISIS,
    summary: "Verifica la cadena de hashes de la auditoría",
    response: S.AuditVerifyResponse,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/costs",
    roles: ANALISIS,
    summary: "Costos de la API de Meta y presupuesto",
    response: S.CostsResponse,
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/orgs",
    roles: ADMIN,
    summary: "Organizaciones",
    response: OrgList,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/orgs",
    roles: ADMIN,
    summary: "Crea una organización",
    body: R.CreateOrgRequest,
    status: 201,
    response: CreatedOrg,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/invites",
    roles: ADMIN_REVISION,
    summary: "Crea códigos de invitación",
    description: "Sin `org_id`, de la organización de quien los pide.",
    body: R.CreateInvitesRequest,
    status: 201,
    response: z.object({ codes: z.array(z.string()) }),
  },
  {
    ...CONSOLA,
    method: "get",
    path: "/v1/console/users",
    roles: ADMIN,
    summary: "Usuarios de la consola",
    response: UserList,
  },
  {
    ...CONSOLA,
    method: "post",
    path: "/v1/console/users",
    roles: ADMIN,
    summary: "Crea un usuario de consola",
    body: R.CreateUserRequest,
    status: 201,
    response: S.ConsoleUser,
  },
];

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>;

const COMPONENT = "#/components/schemas/";
const ERROR_RESPONSE = { $ref: "#/components/responses/Error" };

const TAGS: Array<{ name: Tag; description: string }> = [
  { name: "Salud", description: "Estado del Worker." },
  { name: "Público", description: "Portal público por distrito: sin cuenta, solo lectura y solo datos agregados." },
  { name: "Autenticación", description: "Registro de dispositivos, ingreso y renovación de tokens." },
  { name: "Víctima", description: "Rutas de la app: solo el caso propio de la víctima." },
  { name: "Negocios", description: "Portal de negocios anterior (rol business): solo información agregada." },
  { name: "Consola", description: "Equipo central: revisión, análisis y administración." },
  { name: "Demo", description: "Datos ficticios del demo. Fuera de DEMO_MODE=true responden 404 demo_disabled." },
];

const BEARER = { type: "http", scheme: "bearer", bearerFormat: "JWT" };
const SECURITY_SCHEMES = {
  deviceToken: {
    ...BEARER,
    description: "Token de acceso del dispositivo de una víctima (POST /v1/auth/device/register o /refresh).",
  },
  consoleToken: {
    ...BEARER,
    description:
      "Token de acceso de la consola (POST /v1/auth/console/login). La cuenta de jurado del demo solo puede leer.",
  },
  businessToken: { ...BEARER, description: "Token de acceso del portal de negocios (POST /v1/auth/business/login)." },
  demoSecret: {
    type: "apiKey",
    in: "header",
    name: "x-demo-secret",
    description: "Secreto del demo (DEMO_SECRET). Solo con DEMO_MODE=true.",
  },
};
const SCHEME: Record<Exclude<Auth, "none">, keyof typeof SECURITY_SCHEMES> = {
  device: "deviceToken",
  console: "consoleToken",
  business: "businessToken",
  demo: "demoSecret",
};

const STATUS_TEXT: Record<Status, string> = { 200: "OK", 201: "Creado", 202: "Aceptado", 204: "Sin contenido" };
const METHOD_ORDER: Method[] = ["get", "post", "put", "delete"];

const isZod = (v: unknown): v is z.ZodType => typeof v === "object" && v !== null && "_zod" in v;
const isBinary = (v: unknown): v is Binary => typeof v === "object" && v !== null && "binary" in v;

/** Esquemas con nombre (van a components.schemas): los exportados por shared y por las rutas. */
function namedSchemas(): Map<z.ZodType, string> {
  const names = new Map<z.ZodType, string>();
  const taken = new Set<string>();
  for (const mod of [S, R, { ErrorBody }]) {
    for (const [name, value] of Object.entries(mod)) {
      if (!isZod(value) || names.has(value)) continue;
      if (taken.has(name)) throw new Error(`Dos esquemas se llaman ${name}`);
      names.set(value, name);
      taken.add(name);
    }
  }
  return names;
}

/** Convierte con z.toJSONSchema todos los esquemas con nombre más los anónimos de las rutas. */
function convert(names: Map<z.ZodType, string>, anon: Map<z.ZodType, string>, io: "input" | "output") {
  const registry = z.registry<{ id: string }>();
  for (const [schema, id] of [...names, ...anon]) registry.add(schema, { id });
  const { schemas } = z.toJSONSchema(registry, {
    io,
    uri: (id) => COMPONENT + id,
    // Lo que JSON Schema no puede expresar (por ejemplo, la salida de un transform) queda como {}.
    unrepresentable: "any",
    override: ({ zodSchema, jsonSchema }) => {
      const def = zodSchema._zod.def as { type: string; catchall?: unknown };
      // Sin .strict(), un objeto no promete que no haya más claves (en "output" zod pone false).
      if (def.type === "object" && !def.catchall) delete jsonSchema.additionalProperties;
      // Los límites de entero seguro de .int() solo agregan ruido.
      if (jsonSchema.maximum === Number.MAX_SAFE_INTEGER) delete jsonSchema.maximum;
      if (jsonSchema.minimum === Number.MIN_SAFE_INTEGER) delete jsonSchema.minimum;
    },
  });
  const out: Record<string, Json> = {};
  for (const [id, json] of Object.entries(schemas)) {
    const { $schema: _s, $id: _i, ...rest } = json as Json;
    out[id] = rest;
  }
  return out;
}

/** Nombres de los componentes a los que apunta `json` (con `$ref`). */
function refsOf(json: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(json)) for (const v of json) refsOf(v, found);
  else if (json && typeof json === "object") {
    for (const [k, v] of Object.entries(json)) {
      if (k !== "$ref" || typeof v !== "string") refsOf(v, found);
      else if (v.startsWith(COMPONENT)) found.add(v.slice(COMPONENT.length));
      else if (!v.startsWith("#/components/responses/")) throw new Error(`Referencia inesperada: ${v}`);
    }
  }
  return found;
}

/** Componentes alcanzables desde `roots`, siguiendo sus referencias. */
function reachable(roots: Set<string>, converted: Record<string, Json>): Set<string> {
  const seen = new Set<string>();
  const queue = [...roots];
  while (queue.length) {
    const name = queue.pop()!;
    if (seen.has(name)) continue;
    const json = converted[name];
    if (!json) throw new Error(`Referencia a un esquema sin nombre: ${name}`);
    seen.add(name);
    queue.push(...refsOf(json));
  }
  return seen;
}

/** Propiedades de un objeto (query o headers) como parámetros de OpenAPI. */
function parameters(json: Json, where: "query" | "header"): Json[] {
  const props = (json.properties ?? {}) as Record<string, Json>;
  const required = new Set((json.required ?? []) as string[]);
  return Object.entries(props).map(([name, { description, ...schema }]) => ({
    name,
    in: where,
    ...(description ? { description } : {}),
    required: required.has(name),
    schema,
  }));
}

const binaryContent = (b: Binary) => Object.fromEntries([b.binary].flat().map((type) => [type, {}]));

export function buildOpenApi(): Json {
  const names = namedSchemas();
  const anonIn = new Map<z.ZodType, string>();
  const anonOut = new Map<z.ZodType, string>();
  ROUTES.forEach((r, i) => {
    const add = (map: Map<z.ZodType, string>, schema: unknown, slot: string) => {
      if (isZod(schema) && !names.has(schema) && !map.has(schema)) map.set(schema, `op${i}.${slot}`);
    };
    add(anonIn, r.query, "query");
    add(anonIn, r.headers, "headers");
    add(anonIn, r.body, "body");
    add(anonOut, r.response, "response");
  });
  const input = convert(names, anonIn, "input");
  const output = convert(names, anonOut, "output");

  const idOf = (schema: z.ZodType, anon: Map<z.ZodType, string>) => names.get(schema) ?? anon.get(schema)!;
  const refsIn = new Set<string>();
  const refsOut = new Set<string>(["ErrorBody"]);
  /** Un esquema con nombre va como $ref; uno anónimo, en línea. */
  const schemaFor = (schema: z.ZodType, side: "input" | "output") => {
    const name = names.get(schema);
    const json = name
      ? { $ref: COMPONENT + name }
      : side === "input"
        ? input[anonIn.get(schema)!]!
        : output[anonOut.get(schema)!]!;
    refsOf(json, side === "input" ? refsIn : refsOut);
    return json;
  };
  const paramsOf = (schema: z.ZodObject, where: "query" | "header") => {
    const json = input[idOf(schema, anonIn)]!;
    refsOf(json.properties, refsIn);
    return parameters(json, where);
  };

  const paths: Record<string, Record<string, Json>> = {};
  for (const r of ROUTES) {
    const item = (paths[r.path] ??= {});
    if (item[r.method]) throw new Error(`Ruta repetida en la tabla: ${r.method.toUpperCase()} ${r.path}`);

    const params = [
      ...[...r.path.matchAll(/\{(\w+)\}/g)].map((m) => ({
        name: m[1],
        in: "path",
        required: true,
        schema: { type: "string" },
      })),
      ...(r.query ? paramsOf(r.query, "query") : []),
      ...(r.headers ? paramsOf(r.headers, "header") : []),
    ];

    let requestBody: Json | undefined;
    if (isBinary(r.body)) {
      requestBody = {
        ...(r.body.description ? { description: r.body.description } : {}),
        required: true,
        content: binaryContent(r.body),
      };
    } else if (r.body) {
      // readJson acepta un cuerpo vacío como {}: el cuerpo es obligatorio solo si {} no pasa.
      requestBody = {
        required: !r.body.safeParse({}).success,
        content: { "application/json": { schema: schemaFor(r.body, "input") } },
      };
    }

    const responses: Json = {};
    for (const status of [r.status ?? 200].flat()) {
      const res = r.response;
      if (status === 204) responses[status] = { description: typeof res === "string" ? res : STATUS_TEXT[204] };
      else if (typeof res === "string") responses[status] = { description: res, content: { "application/json": {} } };
      else if (isBinary(res))
        responses[status] = { description: res.description ?? "Archivo", content: binaryContent(res) };
      else
        responses[status] = {
          description: STATUS_TEXT[status],
          content: { "application/json": { schema: schemaFor(res, "output") } },
        };
    }
    responses.default = ERROR_RESPONSE;

    const kinds = [r.auth].flat().filter((k): k is Exclude<Auth, "none"> => k !== "none");
    const description = [r.description, r.roles && `Roles: ${r.roles.join(", ")}.`].filter(Boolean).join("\n\n");
    item[r.method] = {
      tags: [r.tag],
      summary: r.summary,
      ...(description ? { description } : {}),
      // Sin credenciales: `security: []` lo dice explícitamente.
      security: kinds.map((k) => ({ [SCHEME[k]]: [] })),
      ...(params.length ? { parameters: params } : {}),
      ...(requestBody ? { requestBody } : {}),
      responses,
    };
  }

  // Solo los componentes que se usan. Uno que cambia entre pedido y respuesta (default, coerce o
  // transform) tendría dos formas con el mismo nombre: mejor fallar y separarlo en dos esquemas.
  const usedIn = reachable(refsIn, input);
  const usedOut = reachable(refsOut, output);
  const schemas: Record<string, Json> = {};
  for (const name of [...new Set([...usedIn, ...usedOut])].sort()) {
    const a = usedIn.has(name) ? input[name] : undefined;
    const b = usedOut.has(name) ? output[name] : undefined;
    if (a && b && JSON.stringify(a) !== JSON.stringify(b)) {
      throw new Error(`El esquema ${name} tiene otra forma en los pedidos que en las respuestas: sepáralo en dos`);
    }
    schemas[name] = (b ?? a)!;
  }

  const sortedPaths: Record<string, Json> = {};
  for (const path of Object.keys(paths).sort()) {
    const item = paths[path]!;
    sortedPaths[path] = Object.fromEntries(METHOD_ORDER.filter((m) => item[m]).map((m) => [m, item[m]]));
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "API de Blindaje",
      version: R.API_VERSION,
      description:
        "Worker `blindaje-api`. Generado desde los esquemas Zod (`pnpm --filter @blindaje/api openapi`); el índice con las reglas de cada grupo está en docs/API.md.",
    },
    tags: TAGS,
    paths: sortedPaths,
    components: {
      schemas,
      responses: {
        Error: {
          description: "Error: `{ error: { code, message, details? } }`.",
          content: { "application/json": { schema: { $ref: `${COMPONENT}ErrorBody` } } },
        },
      },
      securitySchemes: SECURITY_SCHEMES,
    },
  };
}
