"""Las fotos también dejan huella: parches de DINOv2, coincidencias y hash perceptual.

Lee las fotos ficticias de eval/demo/fotos-colcha (las genera eval/src/fotos-colcha.ts con Muse Image)
y la comparación de Muse Spark (eval/results/fotos_vlm.json), y calcula para la landing:

- Vector global de cada foto como en el pipeline (services/ml: DINOv2 ViT-S/14, CLS tras la norma,
  la foto en un cuadrado de 224 px) y el hash perceptual (imagehash.phash, como imaging.phash_hex).
- La probabilidad de imagen con la calibración del pipeline (eval/calibration.json): hash a 10 bits o
  menos da 0.80; si no, logística sobre el coseno, con tope 0.50.
- Los parches: la foto a 336 x 224 (24 x 16 parches de 14 px) y el vector de cada parche. Para cada
  parche de una foto, su mejor parecido en la otra (el mapa de lo que encuentra pareja) y su pareja.
  "Con pareja" = mejor parecido de 0.65 o más (umbral de esta visualización, no de la calibración).
- Las líneas: pares de parches que se eligen mutuamente como el más parecido, con 0.65 o más, sin el
  anillo del borde (ahí los vectores de DINOv2 se parecen por la posición más que por lo que se ve) y
  separados entre sí (como máximo uno por vecindario de 3 x 3 en cada foto), los 36 más parecidos.
- Los vectores en color: PCA conjunta de los parches de las tres fotos originales; las tres primeras
  componentes, a rojo, verde y azul. Mismo color = vectores parecidos, aunque la foto cambie.
- El color promedio de cada parche, para dibujar la foto en píxeles.
- La "foto reenviada": colcha-1 recortada, achicada y recomprimida como por WhatsApp.

Uso (desde eval/):
  pnpm demo:fotos:parches
Salida: apps/landing/src/data/fotos-demo.json, apps/landing/src/assets/fotos-huella/*.jpg y
eval/results/fotos_huella.json.
"""

from __future__ import annotations

import io
import json
import math

import imagehash
import numpy as np
from PIL import Image

from .paths import DEMO_DIR, EVAL_DIR, MODELS_DIR

SRC = DEMO_DIR / "fotos-colcha"
LANDING = EVAL_DIR.parent / "apps" / "landing"
ASSETS = LANDING / "src" / "assets" / "fotos-huella"
COLS, ROWS = 24, 16
PATCH = 14
TOP = 36
PAREJA = 0.65
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def _modelo():
    from transformers import AutoModel

    return AutoModel.from_pretrained("facebook/dinov2-small", cache_dir=str(MODELS_DIR / "hf")).eval()


def _tensor(img: Image.Image):
    import torch

    arr = (np.asarray(img, dtype=np.float32) / 255.0 - MEAN) / STD
    return torch.from_numpy(arr.transpose(2, 0, 1)[None].copy())


def vector_global(model, img: Image.Image) -> np.ndarray:
    """Igual que services/ml: cuadrado con relleno, 224 px, pooler_output, L2."""
    import torch

    w, h = img.size
    side = max(w, h)
    canvas = Image.new("RGB", (side, side), (124, 116, 104))
    canvas.paste(img, ((side - w) // 2, (side - h) // 2))
    canvas = canvas.resize((224, 224), Image.Resampling.BICUBIC)
    with torch.inference_mode():
        v = model(pixel_values=_tensor(canvas)).pooler_output[0].cpu().numpy()
    return v / np.linalg.norm(v)


def parches(model, img: Image.Image) -> np.ndarray:
    """(ROWS*COLS, 384) normalizados: la foto entera a 336 x 224, sin relleno."""
    import torch

    x = _tensor(img.resize((COLS * PATCH, ROWS * PATCH), Image.Resampling.BICUBIC))
    with torch.inference_mode():
        h = model(pixel_values=x).last_hidden_state[0, 1:].cpu().numpy()
    assert h.shape[0] == ROWS * COLS, h.shape
    return h / np.linalg.norm(h, axis=1, keepdims=True)


def reenviada(img: Image.Image) -> Image.Image:
    """Recorte del 88 %, 960 px de ancho y JPEG de calidad 55: lo que deja un reenvío por WhatsApp."""
    w, h = img.size
    dx, dy = int(w * 0.06), int(h * 0.06)
    c = img.crop((dx, dy, w - dx, h - dy)).resize((960, int(960 * (h - 2 * dy) / (w - 2 * dx))))
    buf = io.BytesIO()
    c.save(buf, "JPEG", quality=55)
    return Image.open(io.BytesIO(buf.getvalue())).convert("RGB")


def p_imagen(coseno: float, hamming: int, cal: dict) -> float:
    if hamming <= int(cal["hamming_max"]):
        return float(cal["p_hamming"])
    return float(min(cal["p_max"], 1 / (1 + math.exp(-cal["dino_a"] * (coseno - cal["dino_b"])))))


def coincidencias(pa: np.ndarray, pb: np.ndarray) -> list[tuple[int, int, float]]:
    """Pares de parches que se eligen mutuamente como el más parecido, ordenados por parecido."""
    s = pa @ pb.T
    ab = s.argmax(1)
    ba = s.argmax(0)
    out = [(i, int(j), float(s[i, j])) for i, j in enumerate(ab) if ba[j] == i]
    return sorted(out, key=lambda t: -t[2])


def _interior(k: int) -> bool:
    return 1 <= k // COLS <= ROWS - 2 and 1 <= k % COLS <= COLS - 2


def _cerca(a: int, b: int) -> bool:
    return abs(a // COLS - b // COLS) <= 1 and abs(a % COLS - b % COLS) <= 1


def lineas(pa: np.ndarray, pb: np.ndarray) -> list[tuple[int, int, float]]:
    """Las líneas del dibujo: coincidencias mutuas fuera del borde, separadas, de PAREJA o más."""
    out: list[tuple[int, int, float]] = []
    for i, j, s in coincidencias(pa, pb):
        if s < PAREJA or not (_interior(i) and _interior(j)):
            continue
        if any(_cerca(i, a) or _cerca(j, b) for a, b, _ in out):
            continue
        out.append((i, j, s))
        if len(out) == TOP:
            break
    return out


def pca_colores(patch: dict[str, np.ndarray], base: tuple[str, ...]) -> dict[str, str]:
    """Tres componentes principales de los parches de `base`, a RGB, para todas las fotos."""
    x = np.concatenate([patch[n] for n in base])
    mu = x.mean(0)
    _, _, vt = np.linalg.svd(x - mu, full_matrices=False)
    z = (x - mu) @ vt[:3].T
    lo, hi = np.percentile(z, 2, 0), np.percentile(z, 98, 0)
    out = {}
    for n, p in patch.items():
        c = np.clip(((p - mu) @ vt[:3].T - lo) / (hi - lo), 0, 1)
        out[n] = "".join(f"{int(r * 255):02x}{int(g * 255):02x}{int(b * 255):02x}" for r, g, b in c)
    return out


def main() -> None:
    model = _modelo()
    cal = json.loads((EVAL_DIR / "calibration.json").read_text(encoding="utf-8"))["imagen"]
    fotos = {n: Image.open(SRC / f"{n}.jpg").convert("RGB") for n in ("colcha-1", "colcha-2", "otra-1")}
    fotos["colcha-1-reenviada"] = reenviada(fotos["colcha-1"])

    ASSETS.mkdir(parents=True, exist_ok=True)
    for n, img in fotos.items():
        w = 960
        img.resize((w, int(w * img.size[1] / img.size[0])), Image.Resampling.LANCZOS).save(
            ASSETS / f"{n}.jpg", "JPEG", quality=82, optimize=True, progressive=True
        )

    glob = {n: vector_global(model, img) for n, img in fotos.items()}
    hashes = {n: imagehash.phash(img, hash_size=8) for n, img in fotos.items()}
    patch = {n: parches(model, img) for n, img in fotos.items()}

    # El color promedio de cada parche (la foto en píxeles).
    pix = {}
    for n, img in fotos.items():
        small = np.asarray(img.resize((COLS, ROWS), Image.Resampling.BOX), dtype=np.uint8).reshape(-1, 3)
        pix[n] = "".join(f"{r:02x}{g:02x}{b:02x}" for r, g, b in small)

    pares = []
    for a, b, tipo in (
        ("colcha-1", "colcha-2", "misma_colcha"),
        ("colcha-1", "otra-1", "otra_colcha"),
        ("colcha-1", "colcha-1-reenviada", "reenviada"),
    ):
        cos = float(glob[a] @ glob[b])
        ham = int(hashes[a] - hashes[b])
        sim = patch[a] @ patch[b].T
        mejor_a = sim.max(1)
        mejor_b = sim.max(0)
        m = lineas(patch[a], patch[b])
        pares.append(
            {
                "a": a,
                "b": b,
                "tipo": tipo,
                "coseno": round(cos, 3),
                "hamming": ham,
                "p_imagen": round(p_imagen(cos, ham, cal), 3),
                "con_pareja": int((mejor_a >= PAREJA).sum()),
                "parches": ROWS * COLS,
                "mejor_a": "".join(f"{min(99, max(0, round(v * 100))):02d}" for v in mejor_a),
                "pareja_a": "".join(f"{int(j):03d}" for j in sim.argmax(1)),
                "mejor_b": "".join(f"{min(99, max(0, round(v * 100))):02d}" for v in mejor_b),
                "pareja_b": "".join(f"{int(i):03d}" for i in sim.argmax(0)),
                "con_pareja_b": int((mejor_b >= PAREJA).sum()),
                "lineas": [[i, j, round(s, 3)] for i, j, s in m],
            }
        )

    vlm_path = EVAL_DIR / "results" / "fotos_vlm.json"
    vlm = json.loads(vlm_path.read_text(encoding="utf-8")) if vlm_path.exists() else None
    if vlm:
        por_par = {(p["a"], p["b"]): p["resultado"] for p in vlm["pares"]}
        for p in pares:
            r = por_par.get((p["a"], p["b"]))
            if r:
                p["vlm"] = r

    datos = {
        "fuente": "eval/py/blindaje_eval/fotos_huella.py (fotos ficticias de Muse Image; vectores de DINOv2 ViT-S/14)",
        "modelo": "facebook/dinov2-small",
        "vlm": vlm["modelo"] if vlm else None,
        "grid": {"cols": COLS, "rows": ROWS},
        "calibracion": {k: cal[k] for k in ("hamming_max", "p_hamming", "dino_a", "dino_b", "p_max")},
        "fotos": [{"id": n, "w": img.size[0], "h": img.size[1]} for n, img in fotos.items()],
        "umbral_pareja": PAREJA,
        "pix": pix,
        "pca": pca_colores(patch, ("colcha-1", "colcha-2", "otra-1")),
        "pares": pares,
    }
    (LANDING / "src" / "data" / "fotos-demo.json").write_text(
        json.dumps(datos, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n"
    )
    resumen = [
        {
            k: v
            for k, v in p.items()
            if k not in ("lineas", "mejor_a", "mejor_b", "pareja_a", "pareja_b", "vlm")
        }
        | {"lineas": len(p["lineas"])}
        for p in pares
    ]
    (EVAL_DIR / "results" / "fotos_huella.json").write_text(
        json.dumps(
            {"modelo": datos["modelo"], "calibracion": datos["calibracion"], "pares": resumen},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(json.dumps(resumen, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
