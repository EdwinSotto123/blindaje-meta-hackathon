import { Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { T } from "@/components/ui";
import type { PasoProceso } from "@/shared";
import { colors, fonts, radius } from "@/theme/tokens";

const RIEL = 22; // un cuadro del papel

/** "AudioSeal, C2PA y Muse Spark 1.2" → una etiqueta por tecnología. */
export function tecnologias(s: string): string[] {
  return s
    .split(/, | y /)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Etiqueta con borde de tinta (DESIGN.md, Tags): nombra la tecnología, no es un dato. */
export function TecTag({ label }: { label: string }) {
  return (
    <View
      style={{
        borderWidth: 1.5,
        borderColor: colors.tinta,
        borderRadius: radius.chip,
        backgroundColor: colors.papel,
        paddingHorizontal: 10,
        paddingVertical: 2,
      }}
    >
      {/* "simple": con el corte por defecto, Android partía "Video Seal" dentro de una etiqueta del ancho justo. */}
      <Text
        maxFontSizeMultiplier={1.4}
        numberOfLines={1}
        textBreakStrategy="simple"
        style={{ fontFamily: fonts.textoBold, fontSize: 14, lineHeight: 20, color: colors.tinta }}
      >
        {label}
      </Text>
    </View>
  );
}

export function TecTags({ tecnologia }: { tecnologia: string }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {tecnologias(tecnologia).map((t) => (
        <TecTag key={t} label={t} />
      ))}
    </View>
  );
}

function Punto({ icon, hecho, linea }: { icon: IconName; hecho: boolean; linea: boolean }) {
  return (
    <View style={{ width: RIEL, alignItems: "center" }}>
      <View
        style={{
          width: RIEL,
          height: RIEL,
          borderRadius: RIEL / 2,
          borderWidth: hecho ? 2 : 1.5,
          borderColor: hecho ? colors.tinta : colors.lapiz,
          backgroundColor: colors.blanco,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={13} strokeWidth={2.5} color={hecho ? colors.tinta : colors.lapiz} />
      </View>
      {linea ? (
        <View style={{ width: 2, flex: 1, minHeight: 12, backgroundColor: colors.borde, marginTop: 2 }} />
      ) : null}
    </View>
  );
}

/**
 * "Cómo lo revisamos": cada paso que corrió sobre una nota, con la tecnología que lo hizo. Mientras
 * el servidor sigue trabajando, una última fila en lápiz dice que falta (la ausencia se dibuja).
 */
export function Proceso({
  pasos,
  pendiente = false,
  testID = "proceso",
}: {
  pasos: PasoProceso[];
  pendiente?: boolean;
  testID?: string;
}) {
  return (
    <View testID={testID}>
      {pasos.map((p, i) => {
        const ultimo = i === pasos.length - 1 && !pendiente;
        return (
          <View
            key={`${i}:${p.paso}`}
            style={{ flexDirection: "row", gap: 12 }}
            accessible
            accessibilityLabel={`${p.paso}. Con ${p.tecnologia}.${p.detalle ? ` ${p.detalle}` : ""}`}
          >
            <Punto icon="check" hecho linea={!ultimo} />
            <View style={{ flex: 1, gap: 6, paddingBottom: ultimo ? 0 : 18 }}>
              <T variant="bodyBold">{p.paso}</T>
              <TecTags tecnologia={p.tecnologia} />
              {p.detalle ? <T variant="secondary">{p.detalle}</T> : null}
            </View>
          </View>
        );
      })}
      {pendiente ? (
        <View style={{ flexDirection: "row", gap: 12 }} accessible accessibilityLabel="Seguimos revisando">
          <Punto icon="clock" hecho={false} linea={false} />
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="bodyBold" style={{ color: colors.lapiz }}>
              Seguimos revisando…
            </T>
            <T variant="small">Los pasos aparecen aquí apenas terminan.</T>
          </View>
        </View>
      ) : null}
    </View>
  );
}
