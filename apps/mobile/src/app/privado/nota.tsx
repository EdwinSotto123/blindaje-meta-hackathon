import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { Button, Card, Chip, T } from "@/components/ui";
import { usePrivate } from "@/private/data";
import { PrivateScreen } from "@/private/PrivateScreen";
import { Proceso } from "@/private/Proceso";
import { titleFor } from "@/private/rows";
import { termsFromReport, Transcript } from "@/private/Transcript";
import { shortDateTime } from "@/lib/format";
import { colors } from "@/theme/tokens";

/**
 * Detalle de una nota: transcripción con datos resaltados, "Cómo lo revisamos" (cada paso con su
 * tecnología) y huella de integridad.
 */
export default function Nota() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = usePrivate((s) => s.report);
  const ev = report?.evidencia.find((e) => e.id === id) ?? null;
  // Con el recorrido, el resultado de "¿hecho con IA?" ya va en su paso: no se repite en una tarjeta.
  const autenticidadEnProceso = !!ev?.proceso.some((p) => p.paso.startsWith("Revisamos si fue hecho con IA"));

  return (
    <PrivateScreen title={ev ? titleFor(ev.tipo, ev.duration_ms) : "Nota"} testID="nota">
      {!ev ? (
        <T variant="secondary">No pudimos cargar esta nota. Revisa tu conexión.</T>
      ) : (
        <>
          <Chip label="Guardado cifrado, fuera de este celular" icon="lock" color={colors.resaltadorVerde} />
          <T variant="secondary">
            {ev.label}: {shortDateTime(ev.captured_at ?? ev.received_utc)}
          </T>
          {ev.transcripcion?.length ? (
            <Card>
              <T variant="h2">{ev.tipo === "texto" ? "El mensaje" : "Lo que dice"}</T>
              <Transcript turns={ev.transcripcion} terms={termsFromReport(report)} />
            </Card>
          ) : ev.status !== "procesado" ? (
            <T variant="secondary">Estamos revisando esta nota…</T>
          ) : null}
          {ev.nota ? (
            <Card>
              <T variant="h2">Nota</T>
              <T variant="body">{ev.nota}</T>
            </Card>
          ) : null}
          {ev.autenticidad && !autenticidadEnProceso ? (
            // Solo el texto corto del servidor: nunca las señales técnicas ni el análisis.
            <Card>
              <T variant="h2">¿Fue hecho con IA?</T>
              <T variant="body" testID="nota-autenticidad">
                {ev.autenticidad}
              </T>
            </Card>
          ) : null}
          {ev.proceso.length ? (
            <View style={{ gap: 12 }}>
              <T variant="h2">Cómo lo revisamos</T>
              <Proceso pasos={ev.proceso} pendiente={ev.status === "recibido" || ev.status === "procesando"} />
              <Button
                label="Cómo funciona por dentro"
                kind="secondary"
                compact
                onPress={() => router.push("/privado/tecnologia")}
                testID="ir-tecnologia"
              />
            </View>
          ) : null}
          <View style={{ gap: 4 }}>
            <T variant="h2">Huella de integridad (SHA-256)</T>
            <T variant="small" selectable style={{ fontFamily: "monospace" }}>
              {ev.sha256}
            </T>
            <T variant="small">Si alguien cambiara el archivo, esta huella ya no coincidiría.</T>
          </View>
        </>
      )}
    </PrivateScreen>
  );
}
