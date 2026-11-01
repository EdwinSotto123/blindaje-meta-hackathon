import { type ReactNode } from "react";
import type { VectorCollection, VectorOverview } from "@blindaje/shared";
import { Icon } from "@blindaje/ui";
import { fmtVarianza, INDEX_META, INDEX_ORDER, modelInfo, PROVIDER_LABEL } from "../../lib/vectors";

// ---------------------------------------------------------------------------
// Inventario de colecciones y nota del mapa
// ---------------------------------------------------------------------------

/** Qué hay en cada colección y si la base está al día con D1. Exportada para los tests. */
export function CollectionsTable({ overview }: { overview: VectorOverview }) {
  const ids = overview.casos.reduce((s, x) => s + x.identificadores, 0);
  const providerName = PROVIDER_LABEL[overview.almacen.proveedor];
  return (
    <section className="panel vx-cols" aria-labelledby="vx-cols-title">
      <div className="panel-head">
        <h2 id="vx-cols-title">Colecciones</h2>
        <span className="small muted">
          Una por tipo de vector. Las cifras de D1 son de casos indexados con consentimiento comunitario.
        </span>
      </div>
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Colecciones (se desplaza a los lados)">
        <table className="table">
          <thead>
            <tr>
              <th>Colección</th>
              <th>Qué guarda</th>
              <th>Modelo</th>
              <th className="num">Números por vector</th>
              <th className="num">En D1</th>
              <th className="num">En {providerName}</th>
            </tr>
          </thead>
          <tbody>
            {INDEX_ORDER.map((i) => {
              const k = overview.colecciones.find((x) => x.indice === i);
              if (!k) return null;
              const m = modelInfo(k.modelo, INDEX_META[i].lane);
              return (
                <tr key={i}>
                  <td>
                    <code>{k.coleccion ?? INDEX_META[i].coleccion}</code>
                  </td>
                  <td>{INDEX_META[i].label}</td>
                  <td>
                    <span className="strong">{m.nombre}</span>
                    {m.previo ? <span className="small muted"> ({m.previo})</span> : null}
                  </td>
                  <td className="num">{k.dim}</td>
                  <td className="num">{k.en_d1}</td>
                  <td className="num">
                    <BaseCount k={k} />
                  </td>
                </tr>
              );
            })}
            <tr>
              <td>
                <span className="muted">no aplica</span>
              </td>
              <td>Identificadores (números y cuentas)</td>
              <td>
                <span className="strong">HMAC-SHA256</span>
                <span className="small muted"> (comparación exacta en D1)</span>
              </td>
              <td className="num">sin vector</td>
              <td className="num">{ids}</td>
              <td className="num">
                <span className="muted">no se guardan</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BaseCount({ k }: { k: VectorCollection }): ReactNode {
  if (k.en_base === null) return <span className="vx-mismatch">Sin respuesta</span>;
  if (k.en_base === k.en_d1)
    return (
      <span className="vx-ok">
        <Icon name="check" size={14} />
        {k.en_base}
      </span>
    );
  const diff = k.en_d1 - k.en_base;
  return (
    <span className="vx-mismatch">
      {k.en_base}: {diff > 0 ? `faltan ${diff}` : `sobran ${-diff}`}, sincroniza
    </span>
  );
}

export function MapNote({ overview }: { overview: VectorOverview }) {
  const vs = overview.mapas.map((m) => `${INDEX_META[m.indice].corto}: ${fmtVarianza(m.varianza)}`);
  return (
    <section className="vx-note small" aria-label="Cómo leer los mapas">
      <p>
        <strong>Cómo leer los mapas.</strong> Cada punto es un vector. El mapa es una proyección (PCA) de 192 o 384
        números a dos ejes, que explican una parte de la varianza ({vs.join("; ")}): ayuda a ver, no decide. La
        comparación real es el coseno con todos los números, por eso dos puntos cercanos en el mapa pueden no pasar el
        umbral.
      </p>
      <p>
        {overview.almacen.solo_demo
          ? "La base en la nube solo guarda casos ficticios del demo, con ids numéricos: sin texto, sin audio y sin datos personales. "
          : ""}
        Si un caso deja de estar indexado, sus vectores salen de la base; y aunque quedara alguno, la búsqueda siempre
        vuelve a filtrar contra D1.
      </p>
    </section>
  );
}
