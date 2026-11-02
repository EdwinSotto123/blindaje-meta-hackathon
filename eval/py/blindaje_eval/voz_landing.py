"""Datos y audios de la animación "La voz deja huella" de la landing, con la voz 1 ficticia del demo.

La voz 1 (MMS-TTS, ficticia) amenaza en A2 desde el celular 1 y en B1 desde el celular 2. Aquí B1 se
disfraza como en voz_distorsion (+4 semitonos y WhatsApp canal 2) y se revierte con el inverso exacto
(-4). Es una ilustración para ver y escuchar; las cifras de la landing salen de voz_distorsion. Salidas:

- apps/landing/src/data/voz-demo.json: la onda de cada versión (picos por tramo), su tono (F0 por
  tramo y mediana en Hz), la huella ECAPA de B1 (192 números) y, como referencia, los cosenos con A2.
- apps/landing/public/voz/b1-{limpia,disfrazada,revertida}.m4a: 7 s de cada versión para escuchar.

Uso:
  uv run python -I -m blindaje_eval.voz_landing
"""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

from .paths import CACHE_DIR, DEMO_DIR, EVAL_DIR
from .voice_backend import SR, LocalBackend
from .voz_distorsion import _escribir, _norm, _shift
from .whatsapp import a_wav, ida_y_vuelta

LANDING = EVAL_DIR.parent / "apps" / "landing"
DISFRAZ = 4
CLIP_S = 7.0
BARRAS = 72
TMP = CACHE_DIR / "distorsion" / "demo"


def _wav(nombre: str) -> Path:
    dst = TMP / f"{nombre}.wav"
    if not dst.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        a_wav(DEMO_DIR / "audio" / f"{nombre}.ogg", dst)
    return dst


def _onda(x: np.ndarray) -> list[float]:
    x = x[: int(CLIP_S * SR)]
    tramos = np.array_split(np.abs(x), BARRAS)
    picos = np.array([float(np.percentile(t, 98)) if t.size else 0.0 for t in tramos])
    return [round(float(v), 3) for v in picos / max(float(picos.max()), 1e-9)]


def _tono(x: np.ndarray) -> dict:
    """Tono (F0) por tramo de la onda, solo donde hay voz, y su mediana en Hz."""
    import torch
    import torchaudio.functional as F

    x = x[: int(CLIP_S * SR)]
    f0 = F.detect_pitch_frequency(
        torch.from_numpy(np.ascontiguousarray(x))[None],
        SR,
        frame_time=0.02,
        win_length=15,
        freq_low=60,
        freq_high=500,
    )[0].numpy()
    hop = len(x) // len(f0)
    rms = np.array([np.sqrt(np.mean(x[i * hop : (i + 1) * hop] ** 2)) for i in range(len(f0))])
    voz = rms > 0.15 * rms.max()
    barras: list[int | None] = []
    for idx in np.array_split(np.arange(len(f0)), BARRAS):
        v = f0[idx][voz[idx]]
        barras.append(int(np.median(v)) if v.size >= 2 else None)
    return {"hz": int(np.median(f0[voz])), "barras": barras}


def _m4a(x: np.ndarray, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "clip.wav"
        sf.write(str(src), x[: int(CLIP_S * SR)], SR, subtype="PCM_16")
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-loglevel",
                "error",
                "-i",
                str(src),
                "-ac",
                "1",
                "-c:a",
                "aac",
                "-b:a",
                "40k",
                str(dst),
            ],
            check=True,
        )


def main() -> None:
    be = LocalBackend()
    a2 = be.embed(_wav("A2")).centroid

    limpia_wav = _wav("B1")
    limpia, _ = sf.read(str(limpia_wav), dtype="float32", always_2d=False)
    fuente = _escribir(lambda: _shift(limpia, DISFRAZ), TMP / f"B1_{DISFRAZ:+d}_fuente.wav")
    disfrazada_wav = TMP / f"B1_{DISFRAZ:+d}.wav"
    if not disfrazada_wav.exists():
        ida_y_vuelta(fuente, disfrazada_wav, 2, seed=7)
    disfrazada, _ = sf.read(str(disfrazada_wav), dtype="float32", always_2d=False)
    # Inverso exacto del disfraz. En el índice del demo un barrido se confunde a propósito: C1 y la
    # víctima son la misma síntesis con otro tono. Los números de la landing salen de voz_distorsion.
    revertida_wav = _escribir(
        lambda: _shift(disfrazada, -DISFRAZ), TMP / f"B1_{DISFRAZ:+d}_r{-DISFRAZ:+d}.wav"
    )
    revertida, _ = sf.read(str(revertida_wav), dtype="float32", always_2d=False)

    h_limpia = be.embed(limpia_wav).centroid
    datos = {
        "fuente": "eval/py/blindaje_eval/voz_landing.py (voz 1 ficticia del demo, MMS-TTS)",
        "modelo": be.modelo_id,
        "disfraz_semitonos": DISFRAZ,
        "revertida_semitonos": -DISFRAZ,
        "coseno_con_a2": {
            "limpia": round(float(a2 @ h_limpia), 3),
            "disfrazada": round(float(a2 @ be.embed(disfrazada_wav).centroid), 3),
            "revertida": round(float(a2 @ be.embed(revertida_wav).centroid), 3),
        },
        "ondas": {"limpia": _onda(limpia), "disfrazada": _onda(disfrazada), "revertida": _onda(revertida)},
        "tono": {"limpia": _tono(limpia), "disfrazada": _tono(disfrazada), "revertida": _tono(revertida)},
        "huella": [round(float(v), 3) for v in _norm(h_limpia)],
    }
    dst = LANDING / "src" / "data" / "voz-demo.json"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(datos, ensure_ascii=False) + "\n", encoding="utf-8")
    for nombre, x in (("limpia", limpia), ("disfrazada", disfrazada), ("revertida", revertida)):
        _m4a(x, LANDING / "public" / "voz" / f"b1-{nombre}.m4a")
    resumen = {k: v for k, v in datos.items() if k not in ("ondas", "huella", "tono")}
    resumen["tono_hz"] = {k: t["hz"] for k, t in datos["tono"].items()}
    print(json.dumps(resumen, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
