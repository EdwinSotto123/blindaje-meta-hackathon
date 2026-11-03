import { describe, expect, it } from "vitest";
import { stripJpegLocation } from "../src/photo-location";

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));
const u16le = (n: number) => [n & 0xff, n >> 8];
const u32le = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, n >>> 24];
const u16be = (n: number) => [n >> 8, n & 0xff];
const segment = (marker: number, data: number[]) => [0xff, marker, ...u16be(data.length + 2), ...data];

/**
 * Un EXIF (TIFF little-endian) con la orientación (6: de costado) y un bloque GPS con latitud
 * 12° 3' S, como los de las fotos de la cámara del celular.
 */
function exifWithGps(): number[] {
  const ifd0 = [
    ...u16le(2),
    ...[...u16le(0x0112), ...u16le(3), ...u32le(1), ...u16le(6), 0, 0],
    ...[...u16le(0x8825), ...u16le(4), ...u32le(1), ...u32le(38)],
    ...u32le(0),
  ];
  const gps = [
    ...u16le(2),
    ...[...u16le(1), ...u16le(2), ...u32le(2), ...ascii("S"), 0, 0, 0],
    ...[...u16le(2), ...u16le(5), ...u32le(3), ...u32le(68)],
    ...u32le(0),
  ];
  const latitude = [...u32le(12), ...u32le(1), ...u32le(3), ...u32le(1), ...u32le(0), ...u32le(1)];
  return [...ascii("Exif"), 0, 0, ...ascii("II"), 0x2a, 0, ...u32le(8), ...ifd0, ...gps, ...latitude];
}

const IMAGE = [0xff, 0xda, 0, 4, 1, 2, 9, 8, 7, 0xff, 0, 6, 0xff, 0xd9];

function jpeg(...segments: number[][]): Uint8Array<ArrayBuffer> {
  return new Uint8Array([0xff, 0xd8, ...segments.flat(), ...IMAGE]);
}

const text = (b: Uint8Array) => new TextDecoder("latin1").decode(b);

describe("stripJpegLocation", () => {
  it("vacía el GPS del EXIF, deja la orientación y no toca la imagen", () => {
    const input = jpeg(segment(0xe1, exifWithGps()), segment(0xdb, [1, 2]));
    const { bytes, removed } = stripJpegLocation(input);
    expect(removed).toBe(true);
    expect(bytes).toHaveLength(input.length);
    const tiff = 2 + 4 + 6;
    // Orientación intacta: primera entrada del IFD0, valor 6.
    expect(bytes[tiff + 8 + 2]).toBe(0x12);
    expect(bytes[tiff + 8 + 2 + 8]).toBe(6);
    // El bloque GPS sin entradas y la latitud en cero.
    expect(bytes[tiff + 38]).toBe(0);
    expect(bytes[tiff + 39]).toBe(0);
    expect([...bytes.subarray(tiff + 38, tiff + 92)].every((x) => x === 0)).toBe(true);
    expect(text(bytes)).not.toContain("S\0");
    // La imagen y los demás bloques, idénticos.
    expect([...bytes.subarray(input.length - IMAGE.length - 6)]).toEqual([
      ...input.subarray(input.length - IMAGE.length - 6),
    ]);
    // No modifica el archivo original.
    expect(input[tiff + 38]).toBe(2);
  });

  it("quita el XMP y el IPTC, y avisa solo si traían un lugar", () => {
    const xmp = segment(0xe1, [
      ...ascii("http://ns.adobe.com/xap/1.0/"),
      0,
      ...ascii("<exif:GPSLatitude>12,3S</exif:GPSLatitude>"),
    ]);
    const withPlace = stripJpegLocation(jpeg(xmp));
    expect(withPlace.removed).toBe(true);
    expect(text(withPlace.bytes)).not.toContain("GPSLatitude");
    expect([...withPlace.bytes]).toEqual([0xff, 0xd8, ...IMAGE]);

    const iptc = segment(0xed, ascii("Photoshop 3.0 sin lugar"));
    const plain = stripJpegLocation(jpeg(iptc, segment(0xdb, [1, 2])));
    expect(plain.removed).toBe(false);
    expect([...plain.bytes]).toEqual([0xff, 0xd8, ...segment(0xdb, [1, 2]), ...IMAGE]);
  });

  it("deja igual un JPEG sin ubicación y lo que no es JPEG", () => {
    const clean = jpeg(segment(0xe0, ascii("JFIF\0")));
    const out = stripJpegLocation(clean);
    expect(out.removed).toBe(false);
    expect([...out.bytes]).toEqual([...clean]);

    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
    expect(stripJpegLocation(png)).toEqual({ bytes: png, removed: false });
  });

  it("no se rompe con un EXIF cortado o con offsets fuera del archivo", () => {
    const broken = exifWithGps();
    broken.splice(40);
    expect(() => stripJpegLocation(jpeg(segment(0xe1, broken)))).not.toThrow();
    const wild = exifWithGps();
    wild.splice(6 + 8 + 2 + 12 + 8, 4, ...u32le(0xfffffff0));
    expect(stripJpegLocation(jpeg(segment(0xe1, wild))).removed).toBe(false);
    expect(() => stripJpegLocation(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0, 1]))).not.toThrow();
  });
});
