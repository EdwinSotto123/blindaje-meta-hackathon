import { API_URL, DEMO_WORLD, MOCK } from "../config";
import { MockPortalApi } from "../mock/mockApi";
import type { PortalApi } from "./api";
import { HttpPortalApi } from "./httpApi";

/** Instancia única: API real con VITE_API_URL (con VITE_DEMO, su mundo del demo), o modo simulado. */
export function createApi(): PortalApi {
  return MOCK ? new MockPortalApi() : new HttpPortalApi(API_URL, undefined, { demo: DEMO_WORLD });
}
