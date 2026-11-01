import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { VectorCaseSummary, VectorIndexName, VectorOverview, VectorTrace } from "@blindaje/shared";
import { type VectorsApi } from "../../api/vectors";
import { Icon } from "@blindaje/ui";
import { ErrorBox } from "../../components/ui";
import { buildSteps, INDEX_ORDER, PROVIDER_LABEL, stepDescription, stepDuration, type Step } from "../../lib/vectors";
import { Candidates } from "./Candidatos";
import { Lanes } from "./Carriles";
import { MapCard } from "./Mapas";
import { MapLegend } from "./Mapas";
import { TraceTable } from "./Candidatos";

// ---------------------------------------------------------------------------
// Recorrido
// ---------------------------------------------------------------------------

type TraceState = { caseId: string; status: "loading" | "ready" | "error"; data?: VectorTrace; error?: unknown } | null;

function useReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && Boolean(window.matchMedia?.(query).matches),
  );
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function Walkthrough({ overview, vectors }: { overview: VectorOverview; vectors: VectorsApi }) {
  const reduced = useReducedMotion();
  // Empieza por el caso con más vectores: el recorrido más completo.
  const firstCase = useMemo(
    () => [...overview.casos].sort((a, b) => sumVectors(b) - sumVectors(a))[0]!.case_id,
    // Solo al montar: una sincronización no cambia el caso elegido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [caseId, setCaseId] = useState(firstCase);
  const c = overview.casos.find((x) => x.case_id === caseId) ?? overview.casos[0]!;
  const steps = useMemo(() => buildSteps(c), [c]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  // Pausa pedida a mitad de un paso: congela las animaciones. Avanzar a mano no las congela.
  const [held, setHeld] = useState(false);
  const [slow, setSlow] = useState(false);
  const [trace, setTrace] = useState<TraceState>(null);
  const clock = useRef({ step: -1, used: 0 });

  const firstSearch = steps.findIndex((s) => s.kind === "busqueda" || s.kind === "senales");
  const traceForCase = trace && trace.caseId === c.case_id ? trace : null;
  const traceData = traceForCase?.status === "ready" ? traceForCase.data! : null;
  const loading = traceForCase?.status === "loading" || (!traceForCase && stepIdx >= firstSearch);
  const vel = slow ? 2 : 1;
  const step = stepIdx >= 0 ? steps[stepIdx]! : null;
  const atEnd = stepIdx === steps.length - 1;
  // Al final, o si la búsqueda falló, el recorrido se detiene solo.
  const running = playing && !atEnd && traceForCase?.status !== "error";

  // La búsqueda se pide de verdad al llegar a su paso (o al saltar más allá), una vez por caso.
  const requested = useRef<string | null>(null);
  const requestTrace = useCallback(
    (id: string) => {
      if (requested.current === id) return;
      requested.current = id;
      setTrace({ caseId: id, status: "loading" });
      vectors.trace(id).then(
        (data) => setTrace((t) => (t?.caseId === id ? { caseId: id, status: "ready", data } : t)),
        (error: unknown) => {
          if (requested.current === id) requested.current = null;
          setTrace((t) => (t?.caseId === id ? { caseId: id, status: "error", error } : t));
        },
      );
    },
    [vectors],
  );
  const lastStep = steps.length - 1;
  const caseKey = c.case_id;
  const goTo = useCallback(
    (i: number) => {
      const n = Math.max(-1, Math.min(i, lastStep));
      setStepIdx(n);
      // La búsqueda tarda unos segundos en vivo: se pide al empezar y corre mientras se ven los
      // primeros pasos; el recorrido solo la espera si llega a la búsqueda antes que la respuesta.
      if (n >= 0) requestTrace(caseKey);
    },
    [lastStep, requestTrace, caseKey],
  );

  // Reloj del recorrido: cuenta el tiempo usado del paso, para que pausar y seguir no lo reinicie.
  const waiting = step?.kind === "busqueda" || step?.kind === "senales" ? !traceData : false;
  useEffect(() => {
    if (!running || !step || waiting) return;
    if (clock.current.step !== stepIdx) clock.current = { step: stepIdx, used: 0 };
    const total = stepDuration(step, traceData) * vel;
    const started = Date.now();
    const t = setTimeout(() => goTo(stepIdx + 1), Math.max(0, total - clock.current.used));
    return () => {
      clearTimeout(t);
      clock.current.used += Date.now() - started;
    };
  }, [running, step, stepIdx, waiting, traceData, vel, goTo]);

  const pickCase = (id: string) => {
    setCaseId(id);
    setStepIdx(-1);
    setPlaying(false);
    setHeld(false);
    clock.current = { step: -1, used: 0 };
  };
  const play = () => {
    setHeld(false);
    if (reduced) {
      if (stepIdx < 0 || atEnd) goTo(0);
      return;
    }
    if (stepIdx < 0 || atEnd) {
      clock.current = { step: -1, used: 0 };
      goTo(0);
    }
    setPlaying(true);
  };
  const next = () => {
    setHeld(false);
    goTo(stepIdx + 1);
  };
  const restart = () => {
    setPlaying(false);
    setHeld(false);
    setStepIdx(-1);
    clock.current = { step: -1, used: 0 };
  };
  const jump = (i: number) => {
    setPlaying(false);
    setHeld(false);
    goTo(i);
  };
  const retry = () => {
    requested.current = null;
    requestTrace(c.case_id);
  };

  const caption = step
    ? stepDescription(step, c, overview, traceData, loading)
    : `Elige un caso y pulsa ${reduced ? "Empezar" : "Reproducir"}: verás cómo se procesó, paso a paso.`;

  return (
    <section className="panel vx-walk" aria-labelledby="vx-walk-title">
      <div className="panel-head">
        <h2 id="vx-walk-title">Recorrido de un caso</h2>
        <span className="small muted">
          Los vectores, las consultas y los tiempos son los de la base; los casos son ficticios.
        </span>
      </div>

      <div className="vx-controls">
        <div className="vx-cases" role="group" aria-label="Caso">
          {overview.casos.map((x) => (
            <button
              key={x.case_id}
              type="button"
              className="vx-case"
              aria-pressed={x.case_id === c.case_id}
              aria-label={`Caso ${x.caso}: ${sumVectors(x)} vectores`}
              onClick={() => pickCase(x.case_id)}
            >
              {x.caso}
            </button>
          ))}
        </div>
        <div className="row vx-play">
          {running ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setPlaying(false);
                setHeld(true);
              }}
            >
              <Icon name="pause" size={16} />
              Pausar
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={play}>
              <Icon name="play" size={16} />
              {reduced ? "Empezar" : stepIdx >= 0 && !atEnd ? "Seguir" : atEnd ? "Ver de nuevo" : "Reproducir"}
            </button>
          )}
          <button type="button" className="btn" onClick={next} disabled={atEnd}>
            <Icon name="skip" size={15} />
            Paso siguiente
          </button>
          <button type="button" className="btn btn-quiet" onClick={restart} disabled={stepIdx < 0}>
            Reiniciar
          </button>
          {!reduced ? (
            <div className="segmented" role="group" aria-label="Velocidad">
              <button type="button" aria-pressed={!slow} onClick={() => setSlow(false)}>
                1x
              </button>
              <button type="button" aria-pressed={slow} onClick={() => setSlow(true)}>
                0.5x
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <ol className="vx-steps">
        {steps.map((s, i) => (
          <li key={`${s.kind}-${s.indice ?? ""}`}>
            <button
              type="button"
              aria-current={i === stepIdx ? "step" : undefined}
              data-done={i < stepIdx}
              onClick={() => jump(i)}
            >
              <span className="vx-step-n" aria-hidden="true">
                {i + 1}
              </span>
              {s.corto ? (
                <>
                  <Icon name="search" size={13} />
                  <span className="sr-only">Buscar </span>
                  {s.corto}
                </>
              ) : (
                s.titulo
              )}
            </button>
          </li>
        ))}
      </ol>

      <p className="vx-caption" aria-live="polite">
        <span className="vx-caption-case case-letter" aria-hidden="true">
          {c.caso}
        </span>
        <span>{caption}</span>
      </p>

      {traceForCase?.status === "error" ? <ErrorBox error={traceForCase.error} onRetry={retry} /> : null}

      <WalkStage
        overview={overview}
        c={c}
        steps={steps}
        stepIdx={stepIdx}
        trace={traceData}
        loading={loading}
        paused={held}
        vel={vel}
      />
    </section>
  );
}

function sumVectors(c: VectorCaseSummary): number {
  return INDEX_ORDER.reduce((s, i) => s + (c.vectores[i] ?? 0), 0);
}

/** En qué paso aparece algo: oculto antes, animado durante, quieto después. */
export type Phase = "later" | "now" | "done";

function phaseOf(steps: Step[], stepIdx: number, match: (s: Step) => boolean): Phase {
  const at = steps.findIndex(match);
  if (at < 0 || stepIdx < at) return "later";
  return stepIdx === at ? "now" : "done";
}

interface StageProps {
  overview: VectorOverview;
  c: VectorCaseSummary;
  steps: Step[];
  stepIdx: number;
  trace: VectorTrace | null;
  loading: boolean;
  paused?: boolean;
  vel?: number;
}

/** El escenario del recorrido en un paso dado. Exportado para los tests (se dibuja sin DOM). */
export function WalkStage({ overview, c, steps, stepIdx, trace, loading, paused = false, vel = 1 }: StageProps) {
  const ph = (kind: Step["kind"], indice?: VectorIndexName) =>
    phaseOf(steps, stepIdx, (s) => s.kind === kind && (!indice || s.indice === indice));
  const provider = trace?.proveedor ?? overview.almacen.proveedor;
  return (
    <div className="vx-stage" data-paused={paused} style={{ "--vel": vel } as CSSProperties}>
      <Lanes overview={overview} c={c} ph={ph} />
      <div className="vx-maps-head">
        <h3>Dentro de {PROVIDER_LABEL[provider]}</h3>
        <MapLegend caso={c.caso} />
      </div>
      <div className="vx-maps">
        {INDEX_ORDER.map((i) => (
          <MapCard
            key={i}
            overview={overview}
            c={c}
            indice={i}
            land={ph("base")}
            search={ph("busqueda", i)}
            trace={trace}
            loading={loading}
          />
        ))}
      </div>
      <Candidates
        c={c}
        overview={overview}
        trace={trace}
        loading={loading}
        senales={ph("senales")}
        revision={ph("revision")}
      />
      {trace && ph("busqueda") !== "later" ? <TraceTable trace={trace} /> : null}
    </div>
  );
}
