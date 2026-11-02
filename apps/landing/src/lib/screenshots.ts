/**
 * Capturas reales tomadas en build de docs/screenshots/: la consola y el portal en modo simulado
 * (datos ficticios), con nombre fijo, consola-*.png y portal-*.png, más su recorte para el celular
 * (*-movil.png), y la app de la víctima en el emulador contra la API en vivo (app-*.png, evidencia
 * ficticia). Si falta una, su figura no se muestra.
 */
import type { ImageMetadata } from "astro";

const files = import.meta.glob<{ default: ImageMetadata }>(
  "../../../../docs/screenshots/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}",
  { eager: true },
);

const entries = Object.entries(files)
  .map(([file, mod]) => ({ name: file.split("/").pop() ?? file, image: mod.default }))
  .sort((a, b) => a.name.localeCompare(b.name));

type ProductBase =
  | "consola-vinculo-misma-voz"
  | "consola-red-grafo"
  | "consola-perfil-cartografo"
  | "consola-recomendaciones-asesor"
  | "consola-autenticidad-evidencia"
  | "consola-rastreo-filtracion"
  | "consola-zonas"
  | "portal-mapa"
  | "portal-zona"
  | "app-audio-texto"
  | "app-audio-recorrido"
  | "app-foto-recorrido"
  | "app-como-funciona"
  | "app-disfraz-cuaderno"
  | "app-notas-privadas";

/** Cada captura puede tener su recorte para el celular, con el mismo nombre y "-movil". */
export type ProductShot = ProductBase | `${ProductBase}-movil`;

export function productShot(name: ProductShot): ImageMetadata | null {
  return entries.find((e) => e.name.replace(/\.[a-z]+$/i, "") === name)?.image ?? null;
}
