import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Button, T } from "@/components/ui";
import { PrivateScreen } from "@/private/PrivateScreen";
import { TecTag } from "@/private/Proceso";
import { useConfig } from "@/state/config";
import { useSessionMode } from "@/state/session";
import { colors } from "@/theme/tokens";

type Fila = { icon: IconName; titulo: string; texto: string; tecs?: string[] };

const CELULAR: Fila[] = [
  {
    icon: "lock",
    titulo: "Se cifra al guardarlo",
    texto: "Antes de salir del celular, con una llave que vive en el almacenamiento seguro. No queda en tu galería.",
    tecs: ["AES-256-GCM", "SHA-256"],
  },
  {
    icon: "calc",
    titulo: "Tu PIN abre esto",
    texto: "Se guarda como huella, nunca como número. El PIN señuelo abre notas vacías.",
    tecs: ["PBKDF2-SHA256"],
  },
  {
    icon: "phone",
    titulo: "Una llave propia para este celular",
    texto: "Sin cuenta ni correo: el celular firma con su llave para renovar tu sesión.",
    tecs: ["ECDSA P-256"],
  },
];

const NUBE: Fila[] = [
  {
    icon: "mic",
    titulo: "Audios y llamadas a texto",
    texto: "Separa quién dijo qué y entiende palabras de aquí: Yape, Plin, cupo, derecho de piso.",
    tecs: ["Muse Voice Transcribe 1.0"],
  },
  {
    icon: "camera",
    titulo: "Fotos y videos",
    texto: "Busca balas, armas, notas escritas y placas, y tapa los rostros de otras personas.",
    tecs: ["SAM 3.1"],
  },
  {
    icon: "file",
    titulo: "Tu ficha para la denuncia",
    texto:
      "Lee lo escrito y saca monto, plazo, canal de pago, grupo y frases, en un formato fijo. Cada dato dice de qué nota salió.",
    tecs: ["Muse Spark 1.3"],
  },
  {
    icon: "alert",
    titulo: "¿Fue hecho con IA?",
    texto: "Busca marcas de agua y credenciales de contenido, y revisa el audio o la imagen. Son indicios, no prueba.",
    tecs: ["AudioSeal", "Video Seal", "C2PA", "Muse Spark 1.2"],
  },
  {
    icon: "message",
    titulo: "La evidencia se lee como dato",
    texto: "Si un mensaje trae órdenes para la IA, no se siguen: todo entra marcado como evidencia.",
  },
];

const PERMISO: Fila[] = [
  {
    icon: "mic",
    titulo: "Huella de voz",
    texto: "De quien te habla, nunca la tuya. Así se nota si la misma voz llamó desde otro número.",
    tecs: ["SpeechBrain ECAPA", "FAISS"],
  },
  {
    icon: "image",
    titulo: "Huella de imagen",
    texto: "Reconoce la misma foto aunque esté recortada.",
    tecs: ["DINOv2", "FAISS"],
  },
  {
    icon: "list",
    titulo: "Huella del guion",
    texto: "Las frases y la forma de pedir el pago.",
    tecs: ["multilingual-e5-small", "FAISS"],
  },
  {
    icon: "lock",
    titulo: "Números y cuentas, cifrados",
    texto: "Se comparan sin mostrarse. El equipo solo ve los 3 últimos dígitos.",
    tecs: ["HMAC-SHA256"],
  },
  {
    icon: "check",
    titulo: "Una persona decide",
    texto:
      "Cada parecido lo revisa alguien del equipo antes de unir casos. Otras víctimas no ven tus datos y tú no ves los de ellas.",
  },
];

const NUNCA: Fila[] = [
  { icon: "close", titulo: "No buscamos a nadie en internet", texto: "La IA trabaja solo con lo que tú guardas." },
  {
    icon: "close",
    titulo: "No nombramos ni acusamos a nadie",
    texto: "Ordenamos la evidencia; la policía y la fiscalía deciden.",
  },
  {
    icon: "close",
    titulo: "No publicamos dónde vives",
    texto: "El mapa público muestra distritos, en rangos, y solo con varios casos.",
  },
  {
    icon: "close",
    titulo: "No es cifrado de extremo a extremo",
    texto: "Para revisar tu evidencia, el servidor la abre. Por eso solo la ve el equipo autorizado.",
  },
];

function Filas({ filas, testID }: { filas: Fila[]; testID?: string }) {
  return (
    <View testID={testID}>
      {filas.map((f, i) => (
        <View
          key={f.titulo}
          style={[s.fila, i === filas.length - 1 && { borderBottomWidth: 0 }]}
          accessible
          accessibilityLabel={`${f.titulo}. ${f.texto}${f.tecs ? ` Con ${f.tecs.join(", ")}.` : ""}`}
        >
          <View style={s.icono}>
            <Icon name={f.icon} size={20} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <T variant="bodyBold">{f.titulo}</T>
            <T variant="secondary">{f.texto}</T>
            {f.tecs ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {f.tecs.map((t) => (
                  <TecTag key={t} label={t} />
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/** "Cómo funciona": qué pasa con lo que guardas y qué tecnología hace cada paso. */
export default function Tecnologia() {
  const router = useRouter();
  const decoy = useSessionMode() === "decoy";
  const consent = useConfig((c) => c.consent);

  return (
    <PrivateScreen title="Cómo funciona" testID="tecnologia">
      <T variant="body">
        Lo que pasa con cada audio, foto o mensaje que guardas aquí, y qué tecnología hace cada paso. En cada nota
        puedes ver los pasos que ya corrieron.
      </T>

      <View style={s.seccion}>
        <T variant="titleSmall">En tu celular</T>
        <Filas filas={CELULAR} />
      </View>

      <View style={s.seccion}>
        <T variant="titleSmall">En la nube</T>
        <T variant="secondary">Los modelos de Meta revisan cada pieza apenas llega.</T>
        <Filas filas={NUBE} testID="tecnologia-nube" />
      </View>

      <View style={s.seccion}>
        <T variant="titleSmall">Con tu permiso</T>
        <T variant="secondary">
          Comparar sin nombres es lo que une casos de una misma red.{" "}
          {decoy
            ? "Se activa en Ajustes."
            : consent === "comunitario"
              ? "Lo tienes activado."
              : "Hoy está apagado: solo armamos tu denuncia. Lo cambias en Ajustes."}
        </T>
        <Filas filas={PERMISO} />
      </View>

      <View style={s.seccion}>
        <T variant="titleSmall">Lo que nunca hacemos</T>
        <Filas filas={NUNCA} />
      </View>

      <Button label="Volver" kind="secondary" compact onPress={() => router.back()} />
    </PrivateScreen>
  );
}

const s = StyleSheet.create({
  seccion: { gap: 8, marginTop: 12 },
  fila: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.tinta,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.papel,
  },
});
