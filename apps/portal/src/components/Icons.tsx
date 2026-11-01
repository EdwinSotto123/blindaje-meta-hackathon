import { Icon as BaseIcon, type IconName } from "@blindaje/ui";
import type { ComponentProps } from "react";

export type { IconName };

/** Íconos de @blindaje/ui con el tamaño y la clase del portal (20 px, clase "icon"). */
export function Icon({ size = 20, ...rest }: ComponentProps<typeof BaseIcon>) {
  return <BaseIcon size={size} className="icon" {...rest} />;
}
