import { useState } from "react";
import { Link } from "react-router";
import { Icon, type IconName } from "@blindaje/ui";

const KEY = "blindaje.recorrido.oculto";

/** Cuatro paradas que muestran el producto, en el orden en que tiene sentido verlas. */
const PARADAS: Array<{ to: string; icon: IconName; title: string; text: string }> = [
  {
    to: "/vinculos",
    icon: "link",
    title: "Cola de vínculos",
    text: "Abre el primero: el Vinculador explica con citas por qué dos casos podrían ser la misma banda. Escucha los fragmentos de voz.",
  },
  {
    to: "/alertas",
    icon: "megaphone",
    title: "Alertas",
    text: "Un borrador del Vigía para un distrito y, al lado, cómo lo vería la persona dentro de su app.",
  },
  {
    to: "/vectores",
    icon: "database",
    title: "Motor vectorial",
    text: "Elige un caso y pulsa Empezar: cada audio, texto e imagen se vuelve números y encuentra casos parecidos.",
  },
  {
    to: "/auditoria",
    icon: "chain",
    title: "Auditoría",
    text: "Cada acción queda en una cadena de hashes. Pulsa Verificar cadena para comprobar que nadie la editó.",
  },
];

function leerOculto(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Recorrido sugerido para quien entra con la cuenta de jurado: la consola abre en Monitoreo (servicios
 * y colas), que no es lo que alguien de afuera necesita ver primero. Se puede ocultar; se recuerda en
 * este navegador.
 */
export function Recorrido() {
  const [oculto, setOculto] = useState(leerOculto);
  if (oculto) return null;
  const ocultar = () => {
    setOculto(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // Sin almacenamiento: se vuelve a ver al recargar.
    }
  };
  return (
    <section className="panel recorrido" aria-labelledby="recorrido-titulo">
      <div className="panel-head">
        <div>
          <h2 id="recorrido-titulo">Recorrido sugerido</h2>
          <p className="small muted" lang="en">
            Suggested tour for judges. The console is in Spanish; these four stops show what Blindaje does.
          </p>
        </div>
        <button type="button" className="btn btn-sm btn-quiet" onClick={ocultar}>
          <Icon name="x" size={14} /> Ocultar
        </button>
      </div>
      <ol className="list-plain recorrido-pasos">
        {PARADAS.map((p, i) => (
          <li key={p.to}>
            <span className="recorrido-n" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <Link to={p.to} className="recorrido-link">
                <Icon name={p.icon} size={16} />
                {p.title}
              </Link>
              <p className="small muted">{p.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
