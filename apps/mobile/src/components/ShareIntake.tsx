import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect, useRef } from "react";

import { deleteFileQuietly, saveBytes, saveFile } from "@/private/data";
import { utf8 } from "@/lib/bytes";
import { evidenceTypeForMime } from "@/lib/mime";
import { configStore } from "@/state/config";
import { sessionStore } from "@/state/session";

/**
 * Recibe archivos compartidos desde otra app (por ejemplo, un audio de WhatsApp).
 * El archivo se cifra de inmediato en la cola como "retenido", se borra la copia en claro que
 * dejó el sistema y no se muestra nada en el disfraz. Solo después de ingresar el PIN la
 * persona decide si lo guarda en sus notas (y entonces se sube).
 */
/** Audios, fotos, videos y textos. Al compartir varios a la vez Android puede mandar cualquier tipo. */
const ACEPTADOS = /^(audio|image|video|text)\//i;

export function ShareIntake() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const router = useRouter();
  const busy = useRef(false);

  useEffect(() => {
    if (!hasShareIntent || busy.current) return;
    busy.current = true;
    (async () => {
      const files = shareIntent.files ?? [];
      try {
        if (!configStore.get().onboarded) {
          // Sin configurar no hay dónde guardarlo: se descarta en silencio.
          files.forEach((f) => deleteFileQuietly(f.path));
          return;
        }
        const capturedAt = new Date().toISOString();
        // Uno por uno: si un archivo no se puede leer, los demás igual se guardan.
        for (const f of files) {
          if (!ACEPTADOS.test(f.mimeType ?? "")) {
            deleteFileQuietly(f.path);
            continue;
          }
          try {
            await saveFile(f.path, {
              tipo: evidenceTypeForMime(f.mimeType),
              mime: f.mimeType,
              source: "compartido",
              durationMs: f.duration ?? null,
              capturedAt,
              hold: true,
            });
          } catch {
            deleteFileQuietly(f.path);
          }
        }
        if (!files.length && shareIntent.text) {
          await saveBytes(utf8(shareIntent.text), {
            tipo: "texto",
            mime: "text/plain; charset=utf-8",
            source: "compartido",
            capturedAt,
            preview: shareIntent.text.slice(0, 120),
            hold: true,
          });
        }
        if (sessionStore.get().mode === "real") router.push("/privado/recibido");
      } catch {
        files.forEach((f) => deleteFileQuietly(f.path));
      } finally {
        resetShareIntent(true);
        busy.current = false;
      }
    })();
  }, [hasShareIntent, shareIntent, resetShareIntent, router]);

  return null;
}
