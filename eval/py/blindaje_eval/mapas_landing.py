"""Los mapas de puntos del pitch de la landing: América Latina y el Perú.

Toma los contornos de países de Natural Earth (dominio público), en el TopoJSON de world-atlas
(countries-50m, https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json), y arma dos
grillas de puntos: una de América Latina (un punto cada 1.1°, con el país de cada punto) y una del Perú
(un punto cada 0.22°). Solo guarda los puntos, nunca los contornos.

Uso (desde eval/):
  pnpm demo:mapas
Salida: apps/landing/src/data/mapas.json
"""

from __future__ import annotations

import json
import urllib.request

from .paths import DOWNLOADS_DIR, EVAL_DIR

URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json"
FUENTE = DOWNLOADS_DIR / "geo" / "countries-50m.json"
LANDING = EVAL_DIR.parent / "apps" / "landing"

# Países de América Latina y el Caribe (nombres de Natural Earth) y el código que usa la landing.
PAISES = {
    "Mexico": "MX",
    "Guatemala": "GT",
    "Belize": "BZ",
    "Honduras": "HN",
    "El Salvador": "SV",
    "Nicaragua": "NI",
    "Costa Rica": "CR",
    "Panama": "PA",
    "Cuba": "CU",
    "Jamaica": "JM",
    "Haiti": "HT",
    "Dominican Rep.": "DO",
    "Puerto Rico": "PR",
    "Bahamas": "BS",
    "Trinidad and Tobago": "TT",
    "Colombia": "CO",
    "Venezuela": "VE",
    "Guyana": "GY",
    "Suriname": "SR",
    "Ecuador": "EC",
    "Peru": "PE",
    "Brazil": "BR",
    "Bolivia": "BO",
    "Paraguay": "PY",
    "Chile": "CL",
    "Argentina": "AR",
    "Uruguay": "UY",
}
LATAM_CAJA = (-118.0, -34.0, -56.0, 33.0)  # lon mín, lon máx, lat mín, lat máx
PERU_CAJA = (-81.5, -68.5, -18.5, 0.1)


def _topologia() -> dict:
    if not FUENTE.exists():
        FUENTE.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(URL, FUENTE)
    return json.loads(FUENTE.read_text(encoding="utf-8"))


def _arcos(topo: dict) -> list[list[tuple[float, float]]]:
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    out = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        out.append(pts)
    return out


def _anillo(arcos: list, idx: list[int]) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    for i in idx:
        a = arcos[i] if i >= 0 else list(reversed(arcos[~i]))
        pts.extend(a if not pts else a[1:])
    return pts


def _anillos(geom: dict, arcos: list) -> list[list[tuple[float, float]]]:
    if geom["type"] == "Polygon":
        return [_anillo(arcos, r) for r in geom["arcs"]]
    if geom["type"] == "MultiPolygon":
        return [_anillo(arcos, r) for poly in geom["arcs"] for r in poly]
    return []


def _dentro(x: float, y: float, anillos: list[list[tuple[float, float]]]) -> bool:
    """Par o impar sobre todos los anillos del país (respeta los huecos)."""
    c = False
    for r in anillos:
        n = len(r)
        j = n - 1
        for i in range(n):
            xi, yi = r[i]
            xj, yj = r[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-15) + xi:
                c = not c
            j = i
    return c


def _grilla(caja: tuple[float, float, float, float], paso: float, paises: dict[str, list]) -> list[list]:
    """[columna, fila, país]: columna desde lon mín y fila desde lat máx, de a `paso` grados."""
    lon0, lon1, lat0, lat1 = caja
    pts = []
    codes = list(paises)
    fila = 0
    while lat1 - fila * paso >= lat0:
        col = 0
        while lon0 + col * paso <= lon1:
            lon = lon0 + col * paso
            lat = lat1 - fila * paso
            for k, code in enumerate(codes):
                if _dentro(lon, lat, paises[code]):
                    pts.append([col, fila, k])
                    break
            col += 1
        fila += 1
    return pts


def main() -> None:
    topo = _topologia()
    arcos = _arcos(topo)
    paises = {}
    for g in topo["objects"]["countries"]["geometries"]:
        code = PAISES.get(g["properties"]["name"])
        if code:
            paises[code] = _anillos(g, arcos)
    latam = _grilla(LATAM_CAJA, 1.1, paises)
    peru = _grilla(PERU_CAJA, 0.22, {"PE": paises["PE"]})
    datos = {
        "fuente": "Natural Earth (dominio público) vía world-atlas 2.0.2, countries-50m; puntos de eval/py/blindaje_eval/mapas_landing.py",
        "latam": {"caja": LATAM_CAJA, "paso": 1.1, "paises": list(paises), "puntos": latam},
        "peru": {"caja": PERU_CAJA, "paso": 0.22, "puntos": [p[:2] for p in peru]},
    }
    (LANDING / "src" / "data" / "mapas.json").write_text(
        json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n"
    )
    print(json.dumps({"latam": len(latam), "peru": len(peru)}))


if __name__ == "__main__":
    main()
