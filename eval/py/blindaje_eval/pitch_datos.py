"""Datos del pitch de la landing (Pitch.astro) que no estaban en otros archivos.

El radar de voces: el coseno real de la nota B1 del demo (voz ficticia de MMS-TTS) con cada voz
guardada: la del caso A (A1 y A2), la del caso C (C1, otra voz sintética), la muestra de la víctima A y
las 28 voces de SLR73 inscritas (a1 y a2 de cada hablante, como en voz_distorsion). Mismas huellas ECAPA
que el resto de la evaluación (salen de la caché).

Uso (desde eval/):
  pnpm demo:pitch
Salida: apps/landing/src/data/pitch.json
"""

from __future__ import annotations

import json

import numpy as np

from .paths import AUDIO_WHATSAPP_DIR, EVAL_DIR
from .voice_backend import LocalBackend
from .voz_distorsion import _norm
from .voz_landing import _wav

LANDING = EVAL_DIR.parent / "apps" / "landing"


def main() -> None:
    be = LocalBackend()
    b1 = be.embed(_wav("B1")).centroid
    caso_a = _norm(np.concatenate([be.embed(_wav(n)).segmentos for n in ("A1", "A2")]).mean(0))
    c1 = be.embed(_wav("C1")).centroid
    victima = be.embed(_wav("victima-A")).centroid
    dirs = sorted(d for d in (AUDIO_WHATSAPP_DIR / "slr73").iterdir() if (d / "a1_canal1.wav").exists())
    slr = [
        float(
            b1
            @ _norm(np.concatenate([be.embed(d / f"{a}_canal1.wav").segmentos for a in ("a1", "a2")]).mean(0))
        )
        for d in dirs
    ]
    datos = {
        "fuente": "eval/py/blindaje_eval/pitch_datos.py (huellas ECAPA de la caché de la evaluación)",
        "radar": {
            "caso_a": round(float(b1 @ caso_a), 3),
            "caso_c": round(float(b1 @ c1), 3),
            "victima_a": round(float(b1 @ victima), 3),
            "slr73": [round(x, 3) for x in slr],
        },
    }
    (LANDING / "src" / "data" / "pitch.json").write_text(
        json.dumps(datos, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n"
    )
    print(json.dumps(datos["radar"] | {"slr73": f"{len(slr)} voces, max {max(slr):.2f}"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
