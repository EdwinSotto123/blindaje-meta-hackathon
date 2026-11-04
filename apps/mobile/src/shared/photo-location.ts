// ARCHIVO GENERADO, NO EDITAR.
// Copia de packages/shared/src hecha por apps/mobile/scripts/sync-shared.mjs.
// Para cambiar un contrato, edita packages/shared y corre `npm run sync-shared`.
/* eslint-disable */

/**
 * Borra la ubicación de una foto JPEG antes de subirla. Las fotos de la cámara del celular guardan
 * las coordenadas GPS en el EXIF; una foto de la nota que dejaron en la bodega ubicaría la bodega.
 *
 * Sin volver a comprimir la imagen: los píxeles quedan idénticos byte a byte. Se vacía el bloque GPS
 * del EXIF (sus entradas y sus valores quedan en cero) y se quitan los bloques XMP e IPTC, que también
 * pueden llevar la ubicación. El resto del EXIF (la orientación, la fecha de la foto) se queda: la
 * fecha sirve como prueba y sin la orientación la foto se vería de costado.
 *
 * Si el archivo no es un JPEG, o no se entiende, se devuelve tal cual.
 */

/** Bytes por valor de cada tipo TIFF (1 BYTE, 2 ASCII, 3 SHORT, 4 LONG, 5 RATIONAL, …). */
const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };
const GPS_IFD_TAG = 0x8825;
const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0, 0]; // "Exif\0\0"
/** Lo que delata un lugar dentro de un bloque XMP o IPTC. */
const PLACE = /gps|location|city|ciudad|ubicaci/i;

export interface StripResult {
  bytes: Uint8Array<ArrayBuffer>;
  /** true si la foto traía una ubicación y se borró. */
  removed: boolean;
}

/** Vacía el bloque GPS de un EXIF que empieza (su cabecera TIFF) en `tiff` y termina en `end`. */
function clearGps(b: Uint8Array, tiff: number, end: number): boolean {
  if (tiff + 8 > end) return false;
  const order = b[tiff];
  if (order !== 0x49 && order !== 0x4d) return false; // "II" o "MM"
  const le = order === 0x49;
  const u16 = (o: number) => (le ? b[o]! | (b[o + 1]! << 8) : (b[o]! << 8) | b[o + 1]!);
  const u32 = (o: number) =>
    (le
      ? b[o]! | (b[o + 1]! << 8) | (b[o + 2]! << 16) | (b[o + 3]! << 24)
      : (b[o]! << 24) | (b[o + 1]! << 16) | (b[o + 2]! << 8) | b[o + 3]!) >>> 0;
  const ifd0 = tiff + u32(tiff + 4);
  if (ifd0 + 2 > end) return false;
  const n = u16(ifd0);
  for (let k = 0; k < n; k++) {
    const e = ifd0 + 2 + k * 12;
    if (e + 12 > end) return false;
    if (u16(e) !== GPS_IFD_TAG) continue;
    const gps = tiff + u32(e + 8);
    if (gps + 2 > end) return false;
    const count = u16(gps);
    for (let j = 0; j < count; j++) {
      const g = gps + 2 + j * 12;
      if (g + 12 > end) break;
      const bytes = (TYPE_SIZE[u16(g + 2)] ?? 1) * u32(g + 4);
      if (bytes > 4) {
        const at = tiff + u32(g + 8);
        if (at >= tiff && at + bytes <= end) b.fill(0, at, at + bytes);
      }
      b.fill(0, g, g + 12);
    }
    // Un bloque sin entradas: el siguiente campo (ya en cero) dice que no hay otro bloque después.
    b[gps] = 0;
    b[gps + 1] = 0;
    return count > 0;
  }
  return false;
}

export function stripJpegLocation(input: Uint8Array<ArrayBuffer>): StripResult {
  if (input.length < 4 || input[0] !== 0xff || input[1] !== 0xd8) return { bytes: input, removed: false };
  const b = input.slice();
  const keep: Uint8Array<ArrayBuffer>[] = [];
  let from = 0;
  let removed = false;
  let i = 2;
  while (i + 4 <= b.length && b[i] === 0xff) {
    const marker = b[i + 1]!;
    if (marker === 0xff) {
      i++;
      continue;
    }
    // Desde SOS empiezan los datos de la imagen; no hay más metadatos que mirar.
    if (marker === 0xda || marker === 0xd9) break;
    const len = (b[i + 2]! << 8) | b[i + 3]!;
    const end = i + 2 + len;
    if (len < 2 || end > b.length) break;
    const data = i + 4;
    const isExif = marker === 0xe1 && EXIF_HEADER.every((x, k) => b[data + k] === x);
    if (isExif) {
      if (clearGps(b, data + EXIF_HEADER.length, end)) removed = true;
    } else if (marker === 0xe1 || marker === 0xed) {
      // XMP (APP1 que no es EXIF) e IPTC (APP13): fuera siempre; "removed" solo si traían un lugar.
      if (PLACE.test(new TextDecoder("latin1").decode(b.subarray(data, end)))) removed = true;
      keep.push(b.subarray(from, i));
      from = end;
    }
    i = end;
  }
  if (from === 0) return { bytes: b, removed };
  keep.push(b.subarray(from));
  const out = new Uint8Array(keep.reduce((s, x) => s + x.length, 0));
  let at = 0;
  for (const part of keep) {
    out.set(part, at);
    at += part.length;
  }
  return { bytes: out, removed };
}
