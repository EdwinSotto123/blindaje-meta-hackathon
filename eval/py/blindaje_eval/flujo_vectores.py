"""Los vectores reales de las escenas Señales y Compara del recorrido de la landing (Flow.astro).

Cada señal del ejemplo, como la calcula el sistema, en una imagen de píxeles (un píxel por número):

- Voz: la huella ECAPA de la nota B1 del demo (voz ficticia de MMS-TTS), 192 números (6 x 32).
- Guion: el vector de multilingual-e5-small de «habla con el jefe» (passage, promedio con máscara y
  L2, como services/ml), 384 números (8 x 48). Usa los pesos de services/ml/models.
- Foto: el vector de DINOv2 del recorte de la bala (cuadrado con relleno gris, 224 px, CLS tras la
  norma, como services/ml), 384 números (8 x 48).
- El índice de voces de Compara: la voz del caso A (A1 y A2) y siete voces de SLR73 que hacen de otras
  voces guardadas, con su coseno real con la nota B1. Las casillas de todas van en el orden de la huella
  de B1: la que se parece repite su degradado.

Color: claro donde el número es cercano a 0; el color de la señal donde es positivo y su tono oscuro
donde es negativo. Uso (desde eval/):
  pnpm demo:flujo:vectores
Salida: apps/landing/src/data/flujo-vectores.json
"""

from __future__ import annotations

import base64
import io
import json

import numpy as np
from PIL import Image

from .fotos_huella import _modelo as dino_modelo
from .fotos_huella import vector_global
from .paths import AUDIO_WHATSAPP_DIR, EVAL_DIR
from .voice_backend import LocalBackend
from .voz_distorsion import _norm
from .voz_landing import _wav

LANDING = EVAL_DIR.parent / "apps" / "landing"
E5_DIR = EVAL_DIR.parent / "services" / "ml" / "models" / "multilingual-e5-small"
GUION = "habla con el jefe"
OTRAS = 7

# Los colores de cada señal en la landing (Flow.astro): tinte, color y borde.
COLORES = {
    "voz": ("#f8eed8", "#c59711", "#5b4100"),
    "mo": ("#fbe8f4", "#bf71a6", "#793d67"),
    "img": ("#e3f0fd", "#3f86bf", "#003860"),
}


def _rgb(h: str) -> np.ndarray:
    return np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)


def png(v: np.ndarray, rows: int, cols: int, señal: str, escala: float | None = None) -> str:
    """El vector en una imagen de rows x cols píxeles, como data URI."""
    tinte, pos, neg = (_rgb(c) for c in COLORES[señal])
    s = escala or float(np.abs(v).max())
    t = np.clip(v / s, -1, 1) ** 1
    u = np.abs(t)[:, None] ** 0.8
    color = np.where(t[:, None] >= 0, tinte + (pos - tinte) * u, tinte + (neg - tinte) * u)
    img = Image.fromarray(color.reshape(rows, cols, 3).round().astype(np.uint8), "RGB")
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def e5(texto: str) -> np.ndarray:
    import torch
    from transformers import AutoModel, AutoTokenizer

    tok = AutoTokenizer.from_pretrained(str(E5_DIR))
    model = AutoModel.from_pretrained(str(E5_DIR)).eval()
    with torch.inference_mode():
        enc = tok(["passage: " + texto], padding=True, truncation=True, return_tensors="pt")
        h = model(**enc).last_hidden_state
        m = enc["attention_mask"].unsqueeze(-1).to(h.dtype)
        v = ((h * m).sum(1) / m.sum(1)).cpu().numpy()[0]
    return _norm(v)


def main() -> None:
    be = LocalBackend()
    b1 = be.embed(_wav("B1")).centroid
    caso_a = _norm(np.concatenate([be.embed(_wav(n)).segmentos for n in ("A1", "A2")]).mean(0))
    dirs = sorted(d for d in (AUDIO_WHATSAPP_DIR / "slr73").iterdir() if (d / "a1_canal1.wav").exists())[
        :OTRAS
    ]
    otras = [
        _norm(np.concatenate([be.embed(d / f"{a}_canal1.wav").segmentos for a in ("a1", "a2")]).mean(0))
        for d in dirs
    ]

    texto = e5(GUION)
    bala = vector_global(
        dino_modelo(), Image.open(LANDING / "src" / "assets" / "flujo" / "bala.jpg").convert("RGB")
    )

    # El índice: V-3 es el caso A; las demás, voces de SLR73. En el orden de la huella de B1.
    orden = np.argsort(-b1)
    escala = float(np.abs(b1).max())
    ids = ["V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-8", "V-9"]
    voces = otras[:2] + [caso_a] + otras[2:]
    indice = [
        {
            "id": i,
            "caso_a": i == "V-3",
            "coseno": round(float(b1 @ v), 2),
            "png": png(v[orden], 12, 16, "voz", escala),
        }
        for i, v in zip(ids, voces, strict=True)
    ]
    datos = {
        "fuente": "eval/py/blindaje_eval/flujo_vectores.py (voz ficticia del demo; e5 y DINOv2 como services/ml; otras voces de SLR73)",
        "voz": {"png": png(b1, 6, 32, "voz"), "dim": int(b1.size)},
        "guion": {"png": png(texto, 8, 48, "mo"), "dim": int(texto.size)},
        "foto": {"png": png(bala, 8, 48, "img"), "dim": int(bala.size)},
        "sonda": {"id": "V-7", "png": png(b1[orden], 12, 16, "voz", escala)},
        "indice": indice,
    }
    (LANDING / "src" / "data" / "flujo-vectores.json").write_text(
        json.dumps(datos, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n"
    )
    print(json.dumps({"indice": [{k: x[k] for k in ("id", "coseno")} for x in indice]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
