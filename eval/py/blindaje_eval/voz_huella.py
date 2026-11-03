"""La voz en píxeles: espectrograma, huella de 192 números y barrido de tono para la landing.

Con la voz 1 ficticia del demo (MMS-TTS; la misma de voz_landing), calcula lo que dibuja la sección
"Aunque disfracen la voz, queda huella":

- El espectrograma de los primeros 7 s (los mismos que se escuchan en la landing) de la nota limpia
  (B1), la disfrazada (+4 semitonos y WhatsApp) y la revertida (-4), en escala de semitonos: dos
  filas por semitono, de 80 Hz a 1,28 kHz (donde se ven los primeros armónicos de la voz), una
  columna cada 25 ms, 16 niveles de energía. Es una transformada de Q constante: cada fila mira con
  una ventana a su medida (larga para los graves, corta para los agudos), así los armónicos se ven
  como rayas. En esta escala, subir el tono es mover la imagen hacia arriba.
- La huella ECAPA (192 números) guardada del caso A (A2), la de B1 limpia y la de la disfrazada
  movida de -8 a +8 semitonos (17 versiones; 0 = la disfrazada tal cual), con su coseno con A2. Las
  casillas van ordenadas por el valor de la huella guardada: el coseno no cambia con el orden, y así
  una nota parecida repite el degradado.
- Las 28 voces de SLR73 de voz_distorsion: el coseno de cada nota de prueba (limpia, disfrazada y
  revertida con el mejor tono del barrido) con cada voz inscrita, una matriz de 28 x 28 por versión.

Todo sale de audios y huellas que ya están en la caché de voz_distorsion y voz_landing (correr esos
dos antes). Uso (desde eval/):
  pnpm demo:voz:huella
Salida: apps/landing/src/data/voz-huella.json y eval/results/voz_huella.json (resumen).
"""

from __future__ import annotations

import json

import numpy as np
import soundfile as sf

from .paths import AUDIO_WHATSAPP_DIR, CACHE_DIR, EVAL_DIR
from .voice_backend import SR, LocalBackend
from .voz_distorsion import BARRIDO, _escribir, _norm, _shift

LANDING = EVAL_DIR.parent / "apps" / "landing"
DEMO = CACHE_DIR / "distorsion" / "demo"
DISFRAZ = 4
CLIP_S = 7.0
HOP_S = 0.025
F_MIN = 80.0
POR_SEMITONO = 2
SEMITONOS = 48  # 80 Hz a 1,28 kHz
Q = 17  # un semitono de resolución
VENTANA_MAX = 2048  # 128 ms: en los graves, la ventana no crece más
RANGO_DB = 50.0


def espectrograma(x: np.ndarray) -> np.ndarray:
    """(filas, columnas) de 0 a 15: energía en dB por medio semitono, la fila 0 abajo (80 Hz)."""
    x = x[: int(CLIP_S * SR)].astype(np.float64)
    hop = int(HOP_S * SR)
    cols = round(CLIP_S / HOP_S)
    filas = SEMITONOS * POR_SEMITONO
    pad = VENTANA_MAX
    xp = np.pad(x, (pad, pad + cols * hop))
    centros = pad + hop // 2 + np.arange(cols) * hop
    P = np.empty((filas, cols))
    for r in range(filas):
        f = F_MIN * 2 ** (r / (12 * POR_SEMITONO))
        n = min(VENTANA_MAX, round(Q * SR / f))
        t = np.arange(n) - n / 2
        kernel = np.hanning(n) * np.exp(-2j * np.pi * f * t / SR) / n
        idx = centros[:, None] + np.arange(n)[None, :] - n // 2
        P[r] = np.abs(xp[idx] @ kernel) ** 2
    db = 10 * np.log10(P + 1e-14)
    ref = float(np.percentile(db, 99.5))
    nivel = np.clip((db - (ref - RANGO_DB)) / RANGO_DB, 0, 1)
    return np.round(nivel * 15).astype(np.uint8)


def _hex4(m: np.ndarray) -> str:
    return "".join("0123456789abcdef"[v] for v in m.ravel())


def _hex8(v: np.ndarray, escala: float) -> str:
    q = np.clip(np.round(v / escala * 127), -127, 127).astype(np.int16)
    return "".join(f"{int(x) & 0xFF:02x}" for x in q)


def _leer(path) -> np.ndarray:
    x, sr = sf.read(str(path), dtype="float32", always_2d=False)
    assert sr == SR, path
    return x


def matrices(be: LocalBackend) -> dict:
    """Las 28 voces de voz_distorsion: coseno de cada nota de prueba con cada voz inscrita."""
    dirs = sorted(
        d
        for d in (AUDIO_WHATSAPP_DIR / "slr73").iterdir()
        if (d / "a1_canal1.wav").exists() and (d / "b1_canal2.wav").exists()
    )
    E = np.stack(
        [
            _norm(np.concatenate([be.embed(d / f"{a}_canal1.wav").segmentos for a in ("a1", "a2")]).mean(0))
            for d in dirs
        ]
    )
    limpia, disfrazada, revertida, ks = [], [], [], []
    for d in dirs:
        base = CACHE_DIR / "distorsion" / d.name
        limpia.append(be.embed(d / "b1_canal2.wav").centroid)
        v0 = be.embed(base / f"b1_{DISFRAZ:+d}.wav").centroid
        disfrazada.append(v0)
        mejor = (-2.0, 0, v0)
        for k in BARRIDO:
            if k == 0:
                v = v0
            else:
                try:
                    v = be.embed(base / f"b1_{DISFRAZ:+d}_r{k:+d}.wav").centroid
                except ValueError:
                    continue
            s = float(np.max(E @ v))
            if s > mejor[0]:
                mejor = (s, k, v)
        revertida.append(mejor[2])
        ks.append(mejor[1])
    out: dict = {"n": len(dirs), "k": ks}
    for nombre, filas in (("limpia", limpia), ("disfrazada", disfrazada), ("revertida", revertida)):
        M = np.stack(filas) @ E.T
        out[nombre] = "".join(f"{min(99, max(0, round(float(c) * 100))):02d}" for c in M.ravel())
        out[f"top1_{nombre}"] = round(float(np.mean(M.argmax(1) == np.arange(len(dirs)))), 4)
    return out


def main() -> None:
    be = LocalBackend()
    limpia_wav = DEMO / "B1.wav"
    disfrazada_wav = DEMO / f"B1_{DISFRAZ:+d}.wav"
    for p in (limpia_wav, disfrazada_wav, DEMO / "A2.wav"):
        if not p.exists():
            raise SystemExit(f"Falta {p}: corre antes blindaje_eval.voz_landing")
    limpia = _leer(limpia_wav)
    disfrazada = _leer(disfrazada_wav)
    revertida_wav = _escribir(
        lambda: _shift(disfrazada, -DISFRAZ), DEMO / f"B1_{DISFRAZ:+d}_r{-DISFRAZ:+d}.wav"
    )
    revertida = _leer(revertida_wav)

    guardada = be.embed(DEMO / "A2.wav").centroid
    h_limpia = be.embed(limpia_wav).centroid
    barrido = []
    for k in BARRIDO:
        wav = (
            disfrazada_wav
            if k == 0
            else _escribir(lambda k=k: _shift(disfrazada, k), DEMO / f"B1_{DISFRAZ:+d}_r{k:+d}.wav")
        )
        v = be.embed(wav).centroid
        barrido.append((k, float(guardada @ v), v))
    mejor = max(barrido, key=lambda b: b[1])

    orden = np.argsort(-guardada)
    vectores = [guardada, h_limpia, *[b[2] for b in barrido]]
    escala = float(max(np.abs(v).max() for v in vectores))

    espectros = {
        n: espectrograma(x)
        for n, x in (("limpia", limpia), ("disfrazada", disfrazada), ("revertida", revertida))
    }
    filas, cols = espectros["limpia"].shape
    datos = {
        "fuente": "eval/py/blindaje_eval/voz_huella.py (voz 1 ficticia del demo, MMS-TTS; 28 voces de SLR73)",
        "modelo": be.modelo_id,
        "disfraz": DISFRAZ,
        "espectro": {
            "filas": filas,
            "columnas": cols,
            "f_min": F_MIN,
            "por_semitono": POR_SEMITONO,
            "hop_s": HOP_S,
            **{n: _hex4(m) for n, m in espectros.items()},
        },
        "huella": {
            "dim": int(guardada.size),
            "escala": round(escala, 4),
            "guardada": _hex8(guardada[orden], escala),
            "limpia": _hex8(h_limpia[orden], escala),
            "coseno_limpia": round(float(guardada @ h_limpia), 3),
            "barrido": [{"k": k, "coseno": round(c, 3), "v": _hex8(v[orden], escala)} for k, c, v in barrido],
            "mejor_k": mejor[0],
        },
        "voces": matrices(be),
    }
    (LANDING / "src" / "data" / "voz-huella.json").write_text(
        json.dumps(datos, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n"
    )
    resumen = {
        "modelo": datos["modelo"],
        "coseno_con_a2": {
            "limpia": datos["huella"]["coseno_limpia"],
            **{f"{b['k']:+d}": b["coseno"] for b in datos["huella"]["barrido"]},
        },
        "mejor_k": mejor[0],
        "voces": {k: v for k, v in datos["voces"].items() if k.startswith("top1") or k in ("n", "k")},
    }
    (EVAL_DIR / "results" / "voz_huella.json").write_text(
        json.dumps(resumen, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    print(json.dumps(resumen, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
