import { useState } from "react";
import type { VectorStoreStatus, VectorSyncResult } from "@blindaje/shared";
import { errorMessage } from "../../api/client";
import { type VectorsApi } from "../../api/vectors";
import { Icon } from "@blindaje/ui";
import { Acciones } from "../../components/SoloLectura";
import { Notice } from "../../components/ui";
import { fmtDateTime } from "../../lib/format";
import { fmtMs, INDEX_META, INDEX_ORDER, indexKind, PROVIDER_LABEL } from "../../lib/vectors";

// ---------------------------------------------------------------------------
// Estado de la base
// ---------------------------------------------------------------------------

/** Franja de estado: proveedor, conexión, qué datos llegan y la sincronización. Exportada para los tests. */
export function StoreStrip({
  store,
  vectors,
  onSynced,
}: {
  store: VectorStoreStatus;
  vectors?: VectorsApi;
  onSynced?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VectorSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = async () => {
    if (!vectors) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await vectors.sync());
      onSynced?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const none = store.proveedor === "ninguno";
  return (
    <section className="panel vx-store" aria-labelledby="vx-store-title">
      <div className="vx-store-main">
        <span className="vx-store-icon" aria-hidden="true">
          <Icon name="database" size={22} />
        </span>
        <div className="stack-sm" style={{ gap: 2 }}>
          <h2 id="vx-store-title" className="vx-store-name">
            {PROVIDER_LABEL[store.proveedor]}
            {store.base ? (
              <span className="vx-store-base">
                {" "}
                (base <code>{store.base}</code>)
              </span>
            ) : null}
          </h2>
          <span className="vx-conn-state" data-ok={store.conectado}>
            <i aria-hidden="true" />
            {none
              ? "Sin búsqueda por vectores: solo identificadores y hash de imagen"
              : store.conectado
                ? "Conectada"
                : "No responde"}
            {store.conectado && store.latencia_ms !== null ? `, respondió en ${fmtMs(store.latencia_ms)}` : ""}
            {!none ? `. ${indexKind(store.proveedor)}` : ""}
          </span>
        </div>
      </div>
      <p className="vx-store-note small">
        <Icon name="lock" size={14} />
        <span>
          {store.solo_demo
            ? "Solo casos ficticios del demo, con ids numéricos y sin texto ni datos personales. D1 es la fuente de verdad: la base es la copia de búsqueda."
            : "D1 es la fuente de verdad: la base es la copia de búsqueda."}
        </span>
      </p>
      <div className="vx-store-sync">
        <span className="small muted">
          Última sincronización:{" "}
          {store.sincronizado_en ? `${fmtDateTime(store.sincronizado_en)} (hora de Lima)` : "nunca"}
        </span>
        {vectors && !none ? (
          <Acciones compact>
            <button type="button" className="btn btn-sm" disabled={busy} onClick={() => void sync()}>
              <Icon name="refresh" size={15} />
              {busy ? "Sincronizando…" : "Sincronizar desde D1"}
            </button>
          </Acciones>
        ) : null}
      </div>
      <div aria-live="polite" className="vx-store-result">
        {result ? <Notice kind="success-box">{syncText(result)}</Notice> : null}
        {error ? <Notice kind="error-box">{error}</Notice> : null}
      </div>
    </section>
  );
}

export function syncText(r: VectorSyncResult): string {
  const total = INDEX_ORDER.reduce((s, i) => s + (r.sincronizados[i] ?? 0), 0);
  const parts = INDEX_ORDER.filter((i) => r.sincronizados[i] !== undefined).map(
    (i) => `${INDEX_META[i].corto} ${r.sincronizados[i]}`,
  );
  const secs = (r.ms / 1000).toLocaleString("es-PE", { maximumFractionDigits: 1 });
  return `Listo: ${total} vectores copiados a ${PROVIDER_LABEL[r.proveedor]} (${parts.join(", ")}), ${r.borrados} ${r.borrados === 1 ? "borrado" : "borrados"}, en ${secs} s.`;
}
