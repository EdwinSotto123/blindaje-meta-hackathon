"""El índice de voces de la escena Compara del recorrido de la landing (Flow.astro), con huellas reales.

La voz del caso B (la nota B1 del demo, voz ficticia de MMS-TTS) se busca entre las voces guardadas:
la del caso A (A1 y A2) y siete voces de SLR73 que hacen de otras voces guardadas. Cada una va como una
imagen de 16 x 12 píxeles (un píxel por número de su huella ECAPA de 192) con su coseno real con B1.
Las casillas de todas van en el orden de la huella de B1: la que se le parece repite su degradado.

Color: claro donde el número es cercano a 0, dorado donde es positivo y café oscuro donde es negativo
(los colores de la voz en la landing). Uso (desde eval/):
  pnpm demo:flujo:vectores
Salida: apps/landing/src/data/flujo-vectores.json
"""

from __future__ import annotations

import base64
import io
import json

import numpy as np
from PIL import Image

from .paths import AUDIO_WHATSAPP_DIR, EVAL_DIR
from .voice_backend import LocalBackend
from .voz_distorsion import _norm
from .voz_landing import _wav

LANDING = EVAL_DIR.parent / "apps" / "landing"
OTRAS = 7
# Tinte, positivo y negativo: los colores de la voz en la landing.
TINTE, POSITIVO, NEGATIVO = (
    np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)
    for h in ("#f8eed8", "#c59711", "#5b4100")
)


def png(v: np.ndarray, escala: float) -> str:
    """La huella en una imagen de 16 x 12 píxeles, como data URI."""
    t = np.clip(v / escala, -1, 1)
    u = np.abs(t)[:, None] ** 0.8
    color = np.where(t[:, None] >= 0, TINTE + (POSITIVO - TINTE) * u, TINTE + (NEGATIVO - TINTE) * u)
    img = Image.fromarray(color.reshape(12, 16, 3).round().astype(np.uint8), "RGB")
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def main() -> None:
    be = LocalBackend()
    b1 = be.embed(_wav("B1")).centroid
    caso_a = _norm(np.concatenate([be.embed(_wav(n)).segmentos for n in ("A1", "A2")]).mean(0))
    dirs = sorted(d for d in (AUDIO_WHATSAPP_DIR / "slr73").iterdir() if (d / "a1_canal1.wav").exists())
    otras = [
        _norm(np.concatenate([be.embed(d / f"{a}_canal1.wav").segmentos for a in ("a1", "a2")]).mean(0))
        for d in dirs[:OTRAS]
    ]

    # V-3 es el caso A; las demás, voces de SLR73. Todas en el orden de la huella de B1.
    orden = np.argsort(-b1)
    escala = float(np.abs(b1).max())
    ids = ["V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-8", "V-9"]
    voces = otras[:2] + [caso_a] + otras[2:]
    indice = [
        {"id": i, "caso_a": i == "V-3", "coseno": round(float(b1 @ v), 2), "png": png(v[orden], escala)}
        for i, v in zip(ids, voces, strict=True)
    ]
    datos = {
        "fuente": "eval/py/blindaje_eval/flujo_vectores.py (voz ficticia del demo y siete voces de SLR73)",
        "sonda": {"id": "V-7", "png": png(b1[orden], escala)},
        "indice": indice,
    }
    (LANDING / "src" / "data" / "flujo-vectores.json").write_text(
        json.dumps(datos, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n"
    )
    print(json.dumps({"indice": [{k: x[k] for k in ("id", "coseno")} for x in indice]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
