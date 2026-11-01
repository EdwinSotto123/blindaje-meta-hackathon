import "../styles/vectors.css";
import { useMemo } from "react";
import type { VectorOverview } from "@blindaje/shared";
import { vectorsFor, type VectorsApi } from "../api/vectors";
import { useApi, useUser } from "../app/context";
import { useAsync } from "@blindaje/ui";
import { Empty, ErrorBox, Loading, PageHead } from "../components/ui";
import { CollectionsTable } from "./vectores/Inventario";
import { MapNote } from "./vectores/Inventario";
import { StoreStrip } from "./vectores/StoreStrip";
import { Walkthrough } from "./vectores/Recorrido";

/**
 * Motor vectorial (solo administración). Muestra, con los datos de verdad, cómo cada evidencia se
 * vuelve un vector, dónde se guarda (Chroma Cloud o FAISS) y cómo la búsqueda de vecinos encuentra
 * casos parecidos, hasta el puntaje que manda un vínculo a la cola de revisión humana.
 *
 * El recorrido es una máquina de pasos: cada elemento aparece en su paso, se anima solo mientras
 * ese paso es el actual y después queda quieto en su estado final. Con movimiento reducido no hay
 * animación y se avanza con "Paso siguiente". La búsqueda se pide a la API de verdad al llegar a
 * ese paso: mientras responde, el recorrido espera.
 */
export function VectorsView() {
  const api = useApi();
  const user = useUser();
  const vectors = useMemo(() => vectorsFor(api, { id: user.id, role: user.role }), [api, user.id, user.role]);
  const ov = useAsync(() => vectors.overview(), "vectores");

  return (
    <>
      <PageHead title="Motor vectorial">
        Así se vuelve números cada evidencia, así se guarda en la base vectorial y así se buscan casos parecidos. Nada
        se vincula solo: todo termina en la cola de revisión.
      </PageHead>
      {ov.error && !ov.data ? (
        <ErrorBox error={ov.error} onRetry={ov.reload} />
      ) : !ov.data ? (
        <Loading label="Leyendo la base vectorial…" />
      ) : (
        <VectorsBody overview={ov.data} vectors={vectors} onSynced={ov.reload} />
      )}
    </>
  );
}

function VectorsBody({
  overview,
  vectors,
  onSynced,
}: {
  overview: VectorOverview;
  vectors: VectorsApi;
  onSynced: () => void;
}) {
  return (
    <>
      <StoreStrip store={overview.almacen} vectors={vectors} onSynced={onSynced} />
      {overview.casos.length ? (
        <Walkthrough overview={overview} vectors={vectors} />
      ) : (
        <Empty title="Todavía no hay casos indexados">
          Cuando un caso con consentimiento comunitario termine de procesarse, sus vectores aparecerán aquí.
        </Empty>
      )}
      <CollectionsTable overview={overview} />
      <MapNote overview={overview} />
    </>
  );
}
