/**
 * Piezas de interfaz que comparten la consola y el portal: íconos y carga de datos. El tema
 * (colores, tipografía, radios y sombras) está en ./theme.css y también lo usa la landing.
 */
export { Icon, type IconName } from "./icons";
export { clearAsyncCache, useAsync, type AsyncState } from "./useAsync";
