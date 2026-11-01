import { type CSSProperties } from "react";
import type { VectorCaseSummary, VectorIndexName, VectorOverview, VectorPoint } from "@blindaje/shared";
import { Icon } from "@blindaje/ui";
import { caseLanes, casePoints, divergingColor, INDEX_META, modelInfo, type Lane, type Step } from "../../lib/vectors";
import type { Phase } from "./Recorrido";

// --- Carriles: evidencia → modelo → vector → colección -----------------------------------------

const LANE_META: Record<Lane, { label: string; icon: "mic" | "message" | "image" | "key" }> = {
  voz: { label: "Voz", icon: "mic" },
  texto: { label: "Texto", icon: "message" },
  imagen: { label: "Imagen", icon: "image" },
  identificadores: { label: "Identificadores", icon: "key" },
};

const LANE_INDICES: Record<Lane, VectorIndexName[]> = {
  voz: ["voz", "voz_segmento"],
  texto: ["texto"],
  imagen: ["imagen"],
  identificadores: [],
};

export function Lanes({
  overview,
  c,
  ph,
}: {
  overview: VectorOverview;
  c: VectorCaseSummary;
  ph: (k: Step["kind"]) => Phase;
}) {
  const lanes = caseLanes(c);
  const pEv = ph("evidencia");
  const pMod = ph("modelos");
  const pVec = ph("vectores");
  const pBase = ph("base");
  return (
    <div className="vx-lanes" role="list" aria-label={`Cómo se procesó el caso ${c.caso}`}>
      <div className="vx-lane vx-lane-head" aria-hidden="true">
        <span>Evidencia</span>
        <span />
        <span>Modelo</span>
        <span />
        <span>Vector</span>
        <span />
        <span>Dónde se guarda</span>
      </div>
      {lanes.map((lane, li) => {
        const col = (i: VectorIndexName) => overview.colecciones.find((k) => k.indice === i);
        const idx = LANE_INDICES[lane];
        const model = modelInfo(idx.length ? col(idx[0]!)?.modelo : null, lane);
        const evidence = laneEvidence(c, lane);
        return (
          <div key={lane} className="vx-lane" role="listitem" style={{ "--li": li } as CSSProperties}>
            <div className="vx-cell vx-ev" data-phase={pEv}>
              <span className="vx-lane-name">
                <Icon name={LANE_META[lane].icon} size={15} />
                {LANE_META[lane].label}
              </span>
              <span className="vx-chips">
                {lane === "identificadores" ? (
                  <span className="vx-chip" style={{ "--i": 0 } as CSSProperties}>
                    {c.identificadores} {c.identificadores === 1 ? "número o cuenta" : "números o cuentas"}
                  </span>
                ) : (
                  evidence.map((e, i) => (
                    <span key={e} className="vx-chip" style={{ "--i": i } as CSSProperties}>
                      {e}
                    </span>
                  ))
                )}
                {lane === "texto" && c.evidencia.some((e) => e.tipo === "audio") ? (
                  <span className="vx-chip-note small muted">y lo transcrito</span>
                ) : null}
              </span>
            </div>
            <Connector phase={pMod} />
            <div className="vx-cell vx-model" data-phase={pMod} data-label="Modelo">
              {model.previo ? <span className="vx-model-prev small">{model.previo}</span> : null}
              <strong>{model.nombre}</strong>
              <span className="small muted">{model.detalle}</span>
            </div>
            <Connector phase={pVec} />
            <div className="vx-cell vx-vecs" data-phase={pVec} data-label="Vector">
              {lane === "identificadores" ? (
                <span className="small muted">Sin vector: se compara el HMAC exacto, nunca el número en claro.</span>
              ) : (
                <LaneVectors overview={overview} c={c} indices={idx} />
              )}
            </div>
            <Connector phase={pBase} />
            <div className="vx-cell vx-dest" data-phase={pBase} data-label="Dónde se guarda">
              {lane === "identificadores" ? (
                <span className="vx-col">
                  <strong>D1</strong>
                  <span className="small muted">comparación exacta</span>
                </span>
              ) : (
                idx
                  .filter((i) => (c.vectores[i] ?? 0) > 0)
                  .map((i) => (
                    <span key={i} className="vx-col">
                      <code>{col(i)?.coleccion ?? INDEX_META[i].coleccion}</code>
                      <span className="small muted">
                        {c.vectores[i]} {c.vectores[i] === 1 ? "vector" : "vectores"} de {col(i)?.dim ?? "?"}
                      </span>
                    </span>
                  ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function laneEvidence(c: VectorCaseSummary, lane: Lane): string[] {
  const tipo = lane === "voz" ? ["audio", "video"] : lane === "imagen" ? ["imagen", "video"] : ["texto"];
  return c.evidencia.filter((e) => tipo.includes(e.tipo)).map((e) => e.label);
}

/** Línea entre columnas con un pulso que viaja de izquierda a derecha en su paso. */
function Connector({ phase }: { phase: Phase }) {
  return (
    <span className="vx-connector" data-phase={phase} aria-hidden="true">
      <span className="vx-run">
        <i />
      </span>
    </span>
  );
}

/** Tiras de números de un carril: las huellas, la ficha o los recortes; los segmentos se resumen. */
function LaneVectors({
  overview,
  c,
  indices,
}: {
  overview: VectorOverview;
  c: VectorCaseSummary;
  indices: VectorIndexName[];
}) {
  const main = indices[0]!;
  const pts = casePoints(overview, c.case_id, main);
  const dim = overview.colecciones.find((k) => k.indice === main)?.dim ?? 0;
  const shown = pts.slice(0, 3);
  const segs = indices.includes("voz_segmento") ? casePoints(overview, c.case_id, "voz_segmento") : [];
  return (
    <div className="vx-strips">
      {shown.map((p, i) => (
        <div key={p.id} className="vx-strip-row">
          <VectorStrip point={p} delay={i} />
          <span className="vx-strip-label small">
            <strong>{p.ref}</strong>
            {p.evidencia ? <span className="muted"> ({p.evidencia})</span> : null}
          </span>
        </div>
      ))}
      <span className="small muted">
        {dim ? `32 de los ${dim} números de cada vector` : null}
        {pts.length > shown.length ? `, y ${pts.length - shown.length} más` : ""}
        {segs.length
          ? `. Además, ${segs.length} ${segs.length === 1 ? "segmento" : "segmentos"} de 3 s, uno por vector`
          : ""}
      </span>
    </div>
  );
}

const CELL = 8;
const GAP = 1.5;

export function VectorStrip({ point, delay = 0 }: { point: VectorPoint; delay?: number }) {
  const w = point.muestra.length * (CELL + GAP) - GAP;
  return (
    <svg
      className="vx-strip"
      width={w}
      height={18}
      viewBox={`0 0 ${w} 18`}
      aria-hidden="true"
      style={{ "--d": delay } as CSSProperties}
    >
      {point.muestra.map((v, i) => (
        <rect
          key={i}
          x={i * (CELL + GAP)}
          y={0}
          width={CELL}
          height={18}
          rx={1.5}
          fill={divergingColor(v)}
          style={{ "--i": i } as CSSProperties}
        />
      ))}
    </svg>
  );
}
