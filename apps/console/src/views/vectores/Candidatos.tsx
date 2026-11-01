import { type CSSProperties } from "react";
import type {
  VectorCandidate,
  VectorCaseSummary,
  VectorNeighbor,
  VectorOverview,
  VectorQuery,
  VectorTrace,
} from "@blindaje/shared";
import { Loading, Notice, StatusBadge } from "../../components/ui";
import { fmtScore } from "../../lib/format";
import {
  combineFormula,
  ESTADO_DESTINO,
  fmtMs,
  INDEX_META,
  PROVIDER_LABEL,
  SIGNAL_META,
  SIGNAL_ORDER,
  SOURCE_LABEL,
  type SignalKey,
} from "../../lib/vectors";
import type { Phase } from "./Recorrido";

// --- Candidatos, señales y revisión -------------------------------------------------------------

function SignalGlyph({ k, size = 14 }: { k: SignalKey; size?: number }) {
  const m = SIGNAL_META[k];
  const common = { fill: m.color, stroke: m.borde, strokeWidth: 1.6 };
  const shape = (() => {
    switch (m.forma) {
      case "circulo":
        return <circle cx="8" cy="8" r="6" {...common} />;
      case "rombo":
        return <path d="M8 1.5l6.5 6.5L8 14.5 1.5 8z" {...common} />;
      case "hexagono":
        return <path d="M4.8 2h6.4l3.3 6-3.3 6H4.8L1.5 8z" {...common} />;
      case "etiqueta":
        return <path d="M1.5 4h8.5l4.5 4-4.5 4H1.5z" strokeLinejoin="round" {...common} />;
    }
  })();
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16">
      {shape}
    </svg>
  );
}

export function Candidates({
  c,
  overview,
  trace,
  loading,
  senales,
  revision,
}: {
  c: VectorCaseSummary;
  overview: VectorOverview;
  trace: VectorTrace | null;
  loading: boolean;
  senales: Phase;
  revision: Phase;
}) {
  if (senales === "later") return null;
  const head = (
    <div className="vx-cands-head">
      <h3>Señales y puntaje</h3>
      {trace ? (
        <span className="small muted">
          Revisión desde {fmtScore(trace.umbrales.revisar)}, probable desde {fmtScore(trace.umbrales.probable)}
        </span>
      ) : null}
    </div>
  );
  if (!trace) {
    return (
      <section className="vx-cands" aria-label="Candidatos">
        {head}
        {loading ? <Loading label="Consultando la base vectorial…" /> : null}
      </section>
    );
  }
  const distrito = (id: string) => overview.casos.find((x) => x.case_id === id)?.distrito ?? null;
  const showScore = revision !== "later";
  return (
    <section className="vx-cands" aria-label="Candidatos">
      {head}
      {trace.candidatos.length ? (
        <ul className="list-plain vx-cand-list">
          {trace.candidatos.map((k, i) => (
            <CandidateRow
              key={k.case_id}
              k={k}
              i={i}
              distrito={distrito(k.case_id)}
              showScore={showScore}
              animScore={revision === "now"}
              animBars={senales === "now"}
            />
          ))}
        </ul>
      ) : (
        <p className="muted">Ningún caso parecido al {c.caso} pasó los filtros.</p>
      )}
      {showScore ? (
        <Notice kind="notice">
          <span>
            <strong>Ningún vínculo se crea solo.</strong> Los que pasan el umbral esperan en la cola de vínculos a que
            una persona del equipo los revise; los demás se guardan para recalibrar y no se muestran.
          </span>
        </Notice>
      ) : null}
    </section>
  );
}

function CandidateRow({
  k,
  i,
  distrito,
  showScore,
  animScore,
  animBars,
}: {
  k: VectorCandidate;
  i: number;
  distrito: string | null;
  showScore: boolean;
  animScore: boolean;
  animBars: boolean;
}) {
  const sigs = SIGNAL_ORDER.filter((s) => typeof k.senales[s] === "number");
  return (
    <li className="vx-cand" data-estado={k.estado} style={{ "--i": i } as CSSProperties}>
      <div className="vx-cand-who">
        <span className="case-letter" aria-hidden="true">
          {k.caso}
        </span>
        <span className="stack-sm" style={{ gap: 0 }}>
          <span className="strong">Caso {k.caso}</span>
          {distrito ? <span className="small muted">{distrito}</span> : null}
          <span className="small muted">Llegó por: {k.fuentes.map((f) => SOURCE_LABEL[f]).join(", ")}</span>
        </span>
      </div>
      <ul className="list-plain vx-sigs" aria-label={`Señales del caso ${k.caso}`}>
        {sigs.map((s, j) => {
          const p = k.senales[s]!;
          return (
            <li key={s} className="vx-sig">
              <SignalGlyph k={s} />
              <span className="vx-sig-name small">{SIGNAL_META[s].label}</span>
              <span className="vx-sig-track" aria-hidden="true">
                <span
                  className={animBars ? "vx-in" : undefined}
                  style={
                    {
                      width: `${Math.round(p * 100)}%`,
                      background: SIGNAL_META[s].color,
                      "--i": i * 2 + j,
                    } as CSSProperties
                  }
                />
              </span>
              <span className="vx-sig-p small strong">{fmtScore(p)}</span>
            </li>
          );
        })}
        {!sigs.length ? <li className="small muted">Sin señales</li> : null}
      </ul>
      <div
        className={`vx-cand-score${animScore ? " vx-in" : ""}`}
        data-show={showScore}
        style={{ "--i": i } as CSSProperties}
      >
        {showScore ? (
          <>
            <span className="vx-score">{fmtScore(k.puntaje)}</span>
            <span className="vx-formula small muted">{combineFormula(k)}</span>
            <span className="row" style={{ gap: 6 }}>
              <StatusBadge status={k.estado} />
            </span>
            <span className="small">{ESTADO_DESTINO[k.estado]}</span>
          </>
        ) : (
          <span className="small muted">El puntaje sale en el paso siguiente</span>
        )}
      </div>
    </li>
  );
}

/** Las consultas como tabla: la alternativa de los mapas para lectores de pantalla y para revisar números. */
export function TraceTable({ trace }: { trace: VectorTrace }) {
  type Row = { q: VectorQuery; n: VectorNeighbor | null; first: boolean };
  const rows = trace.consultas.flatMap<Row>((q) =>
    q.vecinos.length ? q.vecinos.map((n, j) => ({ q, n, first: j === 0 })) : [{ q, n: null, first: true }],
  );
  return (
    <details className="vx-table">
      <summary>Ver las {trace.consultas.length} consultas como tabla</summary>
      <p className="small muted">
        {PROVIDER_LABEL[trace.proveedor]}: {fmtMs(trace.total_ms)} en total, contando el cálculo de las señales.
      </p>
      <div
        className="table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Consultas de la búsqueda (se desplaza a los lados)"
      >
        <table className="table">
          <thead>
            <tr>
              <th>Colección</th>
              <th>Consulta</th>
              <th>Vecino</th>
              <th className="num">Coseno</th>
              <th>¿Cuenta?</th>
              <th className="num">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ q, n, first }, i) => (
              <tr key={`${q.consulta}-${n?.id ?? "none"}-${i}`}>
                <td>{first ? <code>{INDEX_META[q.indice].coleccion}</code> : null}</td>
                <td>{first ? q.ref : null}</td>
                <td>{n ? `Caso ${n.caso}, ${n.ref}` : <span className="muted">Sin vecinos de otros casos</span>}</td>
                <td className="num">{n ? fmtScore(n.score) : "—"}</td>
                <td>{n ? (n.pasa ? "Sí" : `No (umbral ${fmtScore(q.umbral ?? 0)})`) : "—"}</td>
                <td className="num">{first ? fmtMs(q.latencia_ms) : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
