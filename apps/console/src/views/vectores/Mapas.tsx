import { useState, type CSSProperties } from "react";
import type { VectorCaseSummary, VectorIndexName, VectorOverview, VectorPoint, VectorTrace } from "@blindaje/shared";
import { fmtScore } from "../../lib/format";
import {
  aggregateNeighbors,
  bestPerCase,
  DIVERGING,
  fmtVarianza,
  INDEX_META,
  latencyText,
  MAP,
  placeLabels,
  pointsOf,
  PROVIDER_LABEL,
  queriesOf,
  toSvg,
} from "../../lib/vectors";
import type { Phase } from "./Recorrido";

// --- Mapas de las colecciones -------------------------------------------------------------------

export function MapLegend({ caso }: { caso: string }) {
  return (
    <ul className="legend vx-legend" aria-label="Leyenda de los mapas">
      <li>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5" fill="var(--terracota)" stroke="var(--papel)" strokeWidth="1.5" />
        </svg>
        Caso {caso}
      </li>
      <li>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="3.6" fill="var(--tinta-3)" opacity="0.55" />
        </svg>
        Otros casos
      </li>
      <li>
        <svg aria-hidden="true" width="34" height="14" viewBox="0 0 34 14">
          <path d="M2 7h22" stroke="var(--tinta)" strokeWidth="1.6" />
          <circle cx="27" cy="7" r="4.5" fill="var(--tinta)" stroke="var(--papel)" strokeWidth="1.5" />
        </svg>
        Vecino que cuenta
      </li>
      <li>
        <svg aria-hidden="true" width="34" height="14" viewBox="0 0 34 14">
          <path d="M2 7h22" stroke="var(--tinta-3)" strokeWidth="1.4" strokeDasharray="3 3" />
          <circle cx="27" cy="7" r="4" fill="var(--papel)" stroke="var(--tinta-3)" strokeWidth="1.4" />
        </svg>
        No pasa el umbral
      </li>
      <li className="vx-legend-scale">
        <span
          className="vx-scale"
          aria-hidden="true"
          style={{ "--neg": DIVERGING.neg, "--mid": DIVERGING.mid, "--pos": DIVERGING.pos } as CSSProperties}
        />
        <span>Tira: negativo, cero, positivo</span>
      </li>
    </ul>
  );
}

interface Hover {
  point: VectorPoint;
  score: number | null;
}

export function MapCard({
  overview,
  c,
  indice,
  land,
  search,
  trace,
  loading,
}: {
  overview: VectorOverview;
  c: VectorCaseSummary;
  indice: VectorIndexName;
  land: Phase;
  search: Phase;
  trace: VectorTrace | null;
  loading: boolean;
}) {
  const [hover, setHover] = useState<Hover | null>(null);
  const map = overview.mapas.find((m) => m.indice === indice);
  const col = overview.colecciones.find((k) => k.indice === indice);
  const all = pointsOf(overview, indice);
  const mine = all.filter((p) => p.case_id === c.case_id);
  const others = all.filter((p) => p.case_id !== c.case_id);
  const has = mine.length > 0;
  const qs = queriesOf(trace, indice);
  const showSearch = has && search !== "later" && trace !== null;
  const scanning = has && search === "now" && !trace && loading;
  const neighbors = showSearch ? aggregateNeighbors(qs) : [];
  const nbById = new Map(neighbors.map((n) => [n.id, n]));
  const byId = new Map(all.map((p) => [p.id, p]));
  const anim = search === "now";

  const labels = placeLabels(
    bestPerCase(neighbors.filter((n) => n.pasa))
      .map((n) => {
        const p = byId.get(n.id);
        return p ? { id: n.id, text: `${n.caso} (${fmtScore(n.score)})`, ...toSvg(p) } : null;
      })
      .filter((x): x is { id: number; text: string; cx: number; cy: number } => Boolean(x)),
    3,
    [
      ...(land !== "later" ? mine : []),
      ...neighbors.map((n) => byId.get(n.id)).filter((p): p is VectorPoint => Boolean(p)),
    ].map(toSvg),
  );

  const status = !has
    ? `El caso ${c.caso} no tiene vectores aquí.`
    : scanning
      ? `Consultando ${PROVIDER_LABEL[overview.almacen.proveedor]}…`
      : showSearch
        ? qs.length
          ? `${qs.length} ${qs.length === 1 ? "consulta" : "consultas"}, ${latencyText(qs)}. ${neighbors.filter((n) => n.pasa).length} ${neighbors.filter((n) => n.pasa).length === 1 ? "vecino cuenta" : "vecinos cuentan"}`
          : "Sin consultas"
        : land !== "later"
          ? `${mine.length} ${mine.length === 1 ? "vector guardado" : "vectores guardados"}`
          : `${all.length} vectores en la colección`;

  const title = col?.coleccion ?? INDEX_META[indice].coleccion;
  return (
    <figure className="vx-map" data-has={has} aria-labelledby={`vx-map-${indice}`}>
      <figcaption id={`vx-map-${indice}`} className="vx-map-head">
        <code>{title}</code>
        <span className="small muted">
          {INDEX_META[indice].label}, {col?.dim ?? "?"} números
        </span>
      </figcaption>
      <div className="vx-map-box" onMouseLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${MAP.w} ${MAP.h}`}
          role="img"
          aria-label={`Mapa de ${title}: ${all.length} vectores${has ? `, ${mine.length} del caso ${c.caso}` : ""}. La tabla de consultas trae los mismos datos.`}
        >
          <rect className="vx-map-frame" x="0.5" y="0.5" width={MAP.w - 1} height={MAP.h - 1} rx="8" />
          <path
            className="vx-map-axis"
            d={`M${MAP.w / 2} ${MAP.pad}V${MAP.h - MAP.pad}M${MAP.pad} ${MAP.h / 2}H${MAP.w - MAP.pad}`}
          />
          {others.map((p) => {
            const { cx, cy } = toSvg(p);
            const nb = nbById.get(p.id);
            return (
              <circle
                key={p.id}
                className="vx-pt-other"
                data-nb={nb ? (nb.pasa ? "pasa" : "no") : undefined}
                cx={cx}
                cy={cy}
                r={4.2}
              />
            );
          })}
          {/* Líneas de cada vecino a la consulta que más se le parece. */}
          {neighbors.map((n, i) => {
            const a = byId.get(n.desde);
            const b = byId.get(n.id);
            if (!a || !b) return null;
            const pa = toSvg(a);
            const pb = toSvg(b);
            return (
              <line
                key={`l-${n.id}`}
                className={`vx-line${n.pasa ? "" : " vx-line-no"}${anim ? " vx-in" : ""}`}
                x1={pa.cx}
                y1={pa.cy}
                x2={pb.cx}
                y2={pb.cy}
                pathLength={n.pasa ? 1 : undefined}
                style={{ "--i": i } as CSSProperties}
              />
            );
          })}
          {neighbors.map((n, i) => {
            const b = byId.get(n.id);
            if (!b) return null;
            const { cx, cy } = toSvg(b);
            return (
              <circle
                key={`n-${n.id}`}
                className={`vx-nb${n.pasa ? "" : " vx-nb-no"}${anim ? " vx-in" : ""}`}
                cx={cx}
                cy={cy}
                r={n.pasa ? 5.4 : 4.6}
                style={{ "--i": i } as CSSProperties}
              />
            );
          })}
          {land !== "later"
            ? mine.map((p, i) => {
                const { cx, cy } = toSvg(p);
                return (
                  <g
                    key={`m-${p.id}`}
                    className={`vx-mine${land === "now" ? " vx-in" : ""}`}
                    style={{ "--i": i } as CSSProperties}
                  >
                    {land === "now" ? <circle className="vx-drop-ring" cx={cx} cy={cy} r={7} /> : null}
                    <circle className="vx-pt-mine" cx={cx} cy={cy} r={6} />
                  </g>
                );
              })
            : null}
          {(scanning || (anim && showSearch)) && land !== "later"
            ? mine.slice(0, 8).map((p, i) => {
                const { cx, cy } = toSvg(p);
                return (
                  <circle
                    key={`r-${p.id}`}
                    className={`vx-ring${scanning ? " vx-ring-wait" : ""}`}
                    cx={cx}
                    cy={cy}
                    r={9}
                    style={{ "--i": i } as CSSProperties}
                  />
                );
              })
            : null}
          {labels.map((l) => (
            <text
              key={`t-${l.id}`}
              className={`vx-label${anim ? " vx-in" : ""}`}
              x={l.x}
              y={l.y}
              textAnchor={l.anchor}
              style={{ "--i": neighbors.findIndex((n) => n.id === l.id) } as CSSProperties}
            >
              {l.text}
            </text>
          ))}
          {/* Zonas de puntería más grandes que el punto, para el detalle al pasar el mouse. */}
          {all.map((p) => {
            if (p.case_id === c.case_id && land === "later") return null;
            const { cx, cy } = toSvg(p);
            const nb = nbById.get(p.id);
            return (
              <circle
                key={`h-${p.id}`}
                className="vx-hit"
                cx={cx}
                cy={cy}
                r={11}
                onMouseEnter={() => setHover({ point: p, score: nb?.score ?? null })}
              />
            );
          })}
        </svg>
        {hover ? <MapTooltip hover={hover} c={c} /> : null}
        {!has ? <span className="vx-map-empty small">Sin vectores del caso {c.caso}</span> : null}
      </div>
      <p className="vx-map-status small" data-wait={scanning}>
        {scanning ? <span className="spinner" aria-hidden="true" /> : null}
        {status}
      </p>
      {map ? (
        <p className="vx-map-var small muted">Los dos ejes explican {fmtVarianza(map.varianza)} de la varianza</p>
      ) : null}
    </figure>
  );
}

function MapTooltip({ hover, c }: { hover: Hover; c: VectorCaseSummary }) {
  const { cx, cy } = toSvg(hover.point);
  const left = (cx / MAP.w) * 100;
  const top = (cy / MAP.h) * 100;
  const mine = hover.point.case_id === c.case_id;
  return (
    <div className="vx-tip" style={{ left: `${left}%`, top: `${top}%` }} data-flip={left > 60} role="presentation">
      <strong>
        Caso {hover.point.caso}
        {mine ? " (este caso)" : ""}
      </strong>
      <span>
        {hover.point.ref}
        {hover.point.evidencia ? ` (${hover.point.evidencia})` : ""}
      </span>
      {hover.score !== null ? (
        <span>
          Coseno con el caso {c.caso}: {fmtScore(hover.score)}
        </span>
      ) : null}
      <span className="muted">Vector #{hover.point.id}</span>
    </div>
  );
}
