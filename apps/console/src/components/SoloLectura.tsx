import { useId, type ReactNode } from "react";
import { useAuth } from "../app/context";
import { Icon } from "./Icons";

/** La cuenta de jurado del demo: ve todo como la administración, pero no cambia nada. */
export function useSoloLectura(): boolean {
  const { user } = useAuth();
  return user?.solo_lectura === true;
}

export const SOLO_LECTURA_TEXTO = "Cuenta de solo lectura: puedes ver todo, pero no aprobar, editar ni correr agentes.";

/**
 * Agrupa los controles que cambian algo (decidir, correr un agente, crear, sincronizar). Para la
 * cuenta de jurado quedan desactivados todos a la vez, con el motivo escrito debajo, en vez de
 * fallar con un 403 al tocarlos. Es un fieldset: el navegador desactiva cada control de adentro.
 */
export function Acciones({
  children,
  className,
  label,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  /** Nombre del grupo para lectores de pantalla. */
  label?: string;
  /** Para un botón suelto en la cabecera de la página: el motivo en dos palabras. */
  compact?: boolean;
}) {
  const soloLectura = useSoloLectura();
  const id = useId();
  return (
    <fieldset
      className={className ? `acciones ${className}` : "acciones"}
      disabled={soloLectura}
      aria-label={label}
      aria-describedby={soloLectura ? id : undefined}
    >
      {children}
      {soloLectura ? (
        <p id={id} className="solo-lectura-nota">
          <Icon name="lock" size={14} />
          {compact ? <span title={SOLO_LECTURA_TEXTO}>Solo lectura</span> : SOLO_LECTURA_TEXTO}
        </p>
      ) : null}
    </fieldset>
  );
}
