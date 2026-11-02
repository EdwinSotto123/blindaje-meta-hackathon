import { describe, expect, it } from "vitest";
import { VICTIM_FORBIDDEN_KEYS } from "@blindaje/shared";
import { nombreTecnologia, procesoDeEvidencia, type HechosCaso, type HechosEvidencia } from "../src/pipeline/proceso";

function ev(over: Partial<HechosEvidencia>): HechosEvidencia {
  return {
    id: "ev-1",
    tipo: "imagen",
    status: "procesado",
    received_utc: "2026-11-01T10:00:00.000Z",
    huellaCoincide: true,
    derivados: [],
    huellasVoz: { n: 0, model: null },
    recortes: { n: 0, model: null },
    ...over,
  };
}

const der = (tipo: string, content: unknown) => ({ tipo, content_json: JSON.stringify(content) });
const sinPermiso: HechosCaso = { ficha: null, comparado: false };

describe("Cómo lo revisamos (recorrido de cada evidencia)", () => {
  it("una foto: objetos, rostros tapados, lectura y huella, sin coincidencias ni rostros en los hallazgos", () => {
    const pasos = procesoDeEvidencia(
      ev({
        derivados: [
          der("segmentacion", {
            lang: "en",
            width: 100,
            height: 100,
            objetos: [
              { concepto: "bala", box: { x1: 0, y1: 0, x2: 1, y2: 1 }, score: 0.6 },
              { concepto: "rostro", box: { x1: 0, y1: 0, x2: 1, y2: 1 }, score: 0.9 },
            ],
          }),
          der("redactada", { regiones: 2 }),
          der("lectura", { texto: "LOS X. 48 HORAS", placas: [] }),
        ],
        recortes: { n: 3, model: "facebook/dinov2-small" },
      }),
      sinPermiso,
    );
    expect(pasos.map((p) => [p.paso, p.tecnologia])).toEqual([
      ["Guardado cifrado", "AES-256-GCM"],
      ["Buscamos objetos en la imagen", "SAM 3.1"],
      ["Tapamos rostros", "SAM 3.1"],
      ["Leímos lo escrito", "Muse Spark 1.3"],
      ["Huella de la imagen", "DINOv2"],
    ]);
    expect(pasos[1]!.detalle).toBe("Encontramos: bala.");
    expect(pasos[2]!.detalle).toBe("2 rostros de otras personas, antes de compartir la imagen.");
    expect(pasos[3]!.detalle).toBe("«LOS X. 48 HORAS»");
    // Sin consentimiento comunitario: no hay paso de comparación y la huella lo dice.
    expect(pasos[4]!.detalle).toBe("Solo se compara con otros casos si das permiso.");
  });

  it("Prompt Guard sin clasificador y autenticidad mal formada no aparecen", () => {
    const pasos = procesoDeEvidencia(
      ev({
        tipo: "texto",
        derivados: [
          der("prompt_guard", {
            status: "no_revisado",
            label: null,
            score: null,
            model: null,
            threshold: null,
            textos: 1,
            marcados: 0,
            revisado_at: "2026-11-01T10:00:00.000Z",
          }),
          der("autenticidad", { nivel: "otro" }),
        ],
      }),
      sinPermiso,
    );
    expect(pasos.map((p) => p.paso)).toEqual(["Guardado cifrado"]);
  });

  it("la ficha solo cuenta para lo que llegó antes de armarla; la comparación, solo con permiso", () => {
    const caso: HechosCaso = { ficha: { model: "muse-spark-1.3", ts: "2026-11-01T12:00:00.000Z" }, comparado: true };
    const antes = procesoDeEvidencia(ev({ tipo: "texto" }), caso).map((p) => p.paso);
    const despues = procesoDeEvidencia(ev({ tipo: "texto", received_utc: "2026-11-01T13:00:00.000Z" }), caso).map(
      (p) => p.paso,
    );
    const enProceso = procesoDeEvidencia(ev({ tipo: "texto", status: "procesando" }), caso).map((p) => p.paso);
    expect(antes).toEqual(["Guardado cifrado", "Datos para tu denuncia", "Comparación sin nombres"]);
    expect(despues).toEqual(["Guardado cifrado", "Comparación sin nombres"]);
    expect(enProceso).toEqual(["Guardado cifrado"]);
  });

  it("nunca trae claves ni valores que la víctima no debe ver", () => {
    const pasos = procesoDeEvidencia(
      ev({
        tipo: "audio",
        derivados: [
          der("transcripcion", {
            model: "muse-voice-transcribe-1.0",
            turns: [
              { speaker: "A", start_ms: 0, end_ms: 1, text: "Paga", es_victima: false },
              { speaker: "B", start_ms: 1, end_ms: 2, text: "No", es_victima: true },
            ],
          }),
        ],
        huellasVoz: { n: 1, model: "speechbrain/spkrec-ecapa-voxceleb" },
      }),
      { ficha: null, comparado: true },
    );
    expect(pasos[1]!.detalle).toBe("2 voces en 2 turnos. Separamos tu voz de la de quien te habla.");
    const text = JSON.stringify(pasos);
    for (const k of VICTIM_FORBIDDEN_KEYS) expect(text.includes(`"${k}"`), k).toBe(false);
  });

  it("nombres legibles de los modelos", () => {
    expect(nombreTecnologia("muse-spark-1.2")).toBe("Muse Spark 1.2");
    expect(nombreTecnologia("sam-3.1")).toBe("SAM 3.1");
    expect(nombreTecnologia("videoseal-1.0")).toBe("Video Seal");
    expect(nombreTecnologia("audioseal-16bits")).toBe("AudioSeal");
    expect(nombreTecnologia("meta-llama/Llama-Prompt-Guard-2-86M")).toBe("Llama Prompt Guard 2");
    expect(nombreTecnologia("otro-modelo")).toBe("otro-modelo");
  });
});
