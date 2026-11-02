import { useCallback, useState } from "react";
import { View } from "react-native";

import { Card, Chip, Mark, T } from "@/components/ui";
import { refreshReport, syncNow, usePrivate } from "@/private/data";
import { Proceso } from "@/private/Proceso";
import { termsFromReport, Transcript } from "@/private/Transcript";
import { usePolling } from "@/private/usePolling";
import { colors } from "@/theme/tokens";

/**
 * Qué pasó con lo que acabas de guardar: espera conexión, se está subiendo, ya está en la nube,
 * cada paso de la revisión apenas termina (con su tecnología) y, al final, la transcripción con los
 * datos resaltados.
 */
export function UploadStatus({
  queueId,
  decoy,
  showTranscript = true,
}: {
  queueId: string | null;
  decoy: boolean;
  showTranscript?: boolean;
}) {
  const item = usePrivate((s) => s.queue.find((q) => q.id === queueId) ?? null);
  const report = usePrivate((s) => s.report);
  // La fila de la cola se borra cuando el reporte ya incluye la evidencia: se recuerda su id.
  const [evidenceId, setEvidenceId] = useState<string | null>(item?.evidence_id ?? null);
  if (item?.evidence_id && item.evidence_id !== evidenceId) setEvidenceId(item.evidence_id);
  const ev = evidenceId ? (report?.evidencia.find((e) => e.id === evidenceId) ?? null) : null;
  const gone = !!queueId && !item; // ya se quitó de la cola porque el reporte la incluye
  const done = ev?.status === "procesado";

  const tick = useCallback(async () => {
    await syncNow();
    await refreshReport();
  }, []);
  usePolling(tick, decoy || done ? null : 2500);

  if (decoy) return <Chip label="Guardado cifrado, fuera de este celular" icon="lock" color={colors.resaltadorVerde} />;

  let label = "Guardando…";
  let icon: "clock" | "upload" | "lock" | "alert" = "clock";
  let color: string = colors.resaltador;
  if (item?.status === "pendiente") label = "Guardado cifrado. Se subirá cuando haya conexión";
  if (item?.status === "subiendo") {
    label = "Subiendo, cifrado…";
    icon = "upload";
  }
  if (item?.status === "error") {
    label = "No se pudo subir. Lo reintentaremos";
    icon = "alert";
  }
  if (item?.status === "subido" || gone || ev) {
    label = "Guardado cifrado, fuera de este celular";
    icon = "lock";
    color = colors.resaltadorVerde;
  }

  const hallazgos = report?.hallazgos ?? [];
  const pasos = ev?.proceso ?? [];
  const enNube = item?.status === "subido" || !!ev;

  return (
    <View style={{ gap: 12 }} accessibilityLiveRegion="polite">
      <Chip label={label} icon={icon} color={color} testID="estado-subida" />
      {showTranscript && enNube && !done && !pasos.length ? (
        <Card>
          <T variant="h2">Revisando lo que subiste…</T>
        </Card>
      ) : null}
      {showTranscript && done && (ev?.transcripcion?.length || (!pasos.length && (ev?.nota || hallazgos.length))) ? (
        <Card>
          <T variant="h2">{ev?.transcripcion?.length ? "Lo que dice" : "Revisado"}</T>
          {ev?.transcripcion?.length ? <Transcript turns={ev.transcripcion} terms={termsFromReport(report)} /> : null}
          {/* Con recorrido, lo encontrado en esta pieza va en sus pasos; los hallazgos de todo el caso, en las notas. */}
          {ev?.nota && !pasos.length ? <T variant="secondary">{ev.nota}</T> : null}
          {hallazgos.length && !pasos.length ? (
            <View style={{ gap: 8 }}>
              <T variant="h2">Lo que encontramos</T>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {hallazgos.map((h) => (
                  <Mark key={h} label={h} />
                ))}
              </View>
            </View>
          ) : null}
        </Card>
      ) : null}
      {pasos.length ? (
        <View style={{ gap: 12 }}>
          <T variant="h2">Cómo lo revisamos</T>
          <Proceso
            pasos={pasos}
            pendiente={ev?.status === "recibido" || ev?.status === "procesando"}
            testID="proceso-en-vivo"
          />
        </View>
      ) : null}
    </View>
  );
}
