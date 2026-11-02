"""Voz disfrazada con un cambiador de tono: ¿la huella de voz la sigue reconociendo, y revertir el tono ayuda?

Protocolo (mismos audios y modelo que voice_eval, backend local con ECAPA-TDNN):

1. Inscritos: los hablantes de prueba de SLR73, cada uno con el centroide de los segmentos de a1 y a2
   (canal 1), igual que en voice_eval.
2. Prueba: b1 (canal 2) de cada hablante pasa por un cambiador de voz simple (torchaudio
   pitch_shift: sube el tono y los formantes, como las apps baratas) de +4 semitonos y
   vuelve a viajar por WhatsApp (canal 2), como si el extorsionador lo grabara así y lo mandara.
3. Reversión: se prueba bajar o subir el tono de -8 a +8 semitonos. Cada audio deja UNA huella
   revertida: la del desplazamiento k* cuya mejor coincidencia en todo el índice es la más alta
   (no se conoce al hablante). Esa huella se compara con todos los inscritos como cualquier otra.
4. Métricas por condición (limpio, disfrazado, revertido): acierto en el primer lugar, coseno con
   la voz correcta y falsos vínculos (pares de personas distintas con probabilidad calibrada de voz
   >= 0.60, calibración de eval/calibration.json) por cada 100 comparaciones. Elegir el mejor de 17
   desplazamientos también sube las coincidencias falsas: por eso se cuentan.

Uso:
  uv run python -I -m blindaje_eval.voz_distorsion
Salida: eval/results/voz_distorsion.json
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
import soundfile as sf

from .paths import AUDIO_WHATSAPP_DIR, CACHE_DIR, EVAL_DIR
from .voice_backend import SR, LocalBackend
from .whatsapp import ida_y_vuelta

# Un disfraz: con el barrido de 17 tonos, cada voz tarda alrededor de un minuto en CPU.
DISFRACES = [4]
BARRIDO = list(range(-8, 9))
UMBRAL_REVISION = 0.60
TMP = CACHE_DIR / "distorsion"


def _norm(v: np.ndarray) -> np.ndarray:
    return v / max(float(np.linalg.norm(v)), 1e-12)


def _shift(x: np.ndarray, semitonos: int) -> np.ndarray:
    if semitonos == 0:
        return x
    import torch
    import torchaudio.functional as F

    y = F.pitch_shift(torch.from_numpy(np.ascontiguousarray(x))[None, :], SR, semitonos)[0].numpy()
    pico = float(np.max(np.abs(y))) or 1.0
    return (y / max(pico, 1.0)).astype(np.float32)


def _escribir(hacer, path: Path) -> Path:
    """Escribe el audio que devuelve `hacer()` solo si falta: el cambio de tono es lo lento."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        sf.write(str(path), hacer(), SR, subtype="PCM_16")
    return path


def _calibracion() -> tuple[float, float, float]:
    c = json.loads((EVAL_DIR / "calibration.json").read_text(encoding="utf-8"))["voz"]
    return float(c["a"]), float(c["b"]), float(c["p_max"])


def _prob(s: np.ndarray, a: float, b: float, p_max: float) -> np.ndarray:
    return np.minimum(p_max, 1 / (1 + np.exp(-a * (s - b))))


def _metricas(ids: list[str], E: np.ndarray, pruebas: dict[str, np.ndarray], cal) -> dict:
    a, b, p_max = cal
    top1, tar, non = 0, [], []
    for h, v in pruebas.items():
        s = E @ v
        top1 += ids[int(np.argmax(s))] == h
        for g, sc in zip(ids, s, strict=True):
            (tar if g == h else non).append(float(sc))
    tar_a, non_a = np.array(tar), np.array(non)
    falsos = int(np.sum(_prob(non_a, a, b, p_max) >= UMBRAL_REVISION))
    return {
        "pruebas": len(pruebas),
        "top1": round(top1 / len(pruebas), 4),
        "coseno_correcto_media": round(float(tar_a.mean()), 4),
        "coseno_distinto_p99": round(float(np.quantile(non_a, 0.99)), 4),
        "falsos_vinculos": falsos,
        "comparaciones": int(len(tar_a) + len(non_a)),
        "falsos_por_100": round(100 * falsos / (len(tar_a) + len(non_a)), 3),
        "aciertos_sobre_revision": round(float(np.mean(_prob(tar_a, a, b, p_max) >= UMBRAL_REVISION)), 4),
    }


def run() -> dict:
    t0 = time.time()
    be = LocalBackend()
    cal = _calibracion()
    dirs = sorted(
        d
        for d in (AUDIO_WHATSAPP_DIR / "slr73").iterdir()
        if (d / "a1_canal1.wav").exists() and (d / "b1_canal2.wav").exists()
    )
    ids = [d.name for d in dirs]
    inscritos = {}
    for d in dirs:
        hs = [be.embed(d / "a1_canal1.wav"), be.embed(d / "a2_canal1.wav")]
        inscritos[d.name] = _norm(np.concatenate([h.segmentos for h in hs]).mean(axis=0))
    E = np.stack([inscritos[h] for h in ids])

    limpio = {d.name: be.embed(d / "b1_canal2.wav").centroid for d in dirs}
    out: dict = {
        "version": "v1",
        "modelo": be.modelo_id,
        "dataset": "SLR73 (español de Perú), mismos audios que la evaluación de voz",
        "hablantes": len(ids),
        "disfraz": "torchaudio pitch_shift (tono y formantes) y luego WhatsApp canal 2",
        "barrido_semitonos": [BARRIDO[0], BARRIDO[-1]],
        "umbral_revision": UMBRAL_REVISION,
        "limpio": _metricas(ids, E, limpio, cal),
        "disfraces": [],
    }

    ejemplo = None
    for st in DISFRACES:
        disfrazado, revertido, ks = {}, {}, {}
        for d in dirs:
            x, sr = sf.read(str(d / "b1_canal2.wav"), dtype="float32", always_2d=False)
            assert sr == SR
            base = TMP / d.name
            fuente = _escribir(lambda x=x, st=st: _shift(x, st), base / f"b1_{st:+d}_fuente.wav")
            wav = base / f"b1_{st:+d}.wav"
            if not wav.exists():
                ida_y_vuelta(fuente, wav, 2, seed=st + 100)
            y, _ = sf.read(str(wav), dtype="float32", always_2d=False)
            disfrazado[d.name] = be.embed(wav).centroid
            mejor = (-2.0, 0, None)
            for k in BARRIDO:
                if k == 0:
                    v = disfrazado[d.name]
                else:
                    r = _escribir(lambda y=y, k=k: _shift(y, k), base / f"b1_{st:+d}_r{k:+d}.wav")
                    try:
                        v = be.embed(r).centroid
                    except ValueError:
                        # Algunos desplazamientos dejan el audio sin ventanas de 3 s con voz: no cuentan.
                        continue
                s = float(np.max(E @ v))
                if s > mejor[0]:
                    mejor = (s, k, v)
            revertido[d.name], ks[d.name] = mejor[2], mejor[1]
            print(f"{d.name} {st:+d}: k*={mejor[1]:+d} ({time.time() - t0:.0f} s)", flush=True)
            if ejemplo is None and st == DISFRACES[0]:
                i = ids.index(d.name)
                ej = {
                    "hablante": d.name,
                    "disfraz_semitonos": st,
                    "k_revertido": mejor[1],
                    "coseno_limpio": round(float(E[i] @ limpio[d.name]), 4),
                    "coseno_disfrazado": round(float(E[i] @ disfrazado[d.name]), 4),
                    "coseno_revertido": round(float(E[i] @ revertido[d.name]), 4),
                }
                if ej["coseno_revertido"] > ej["coseno_disfrazado"] + 0.1:
                    ejemplo = ej
        kv = np.array(list(ks.values()))
        out["disfraces"].append(
            {
                "semitonos": st,
                "sin_revertir": _metricas(ids, E, disfrazado, cal),
                "revertido": _metricas(ids, E, revertido, cal),
                "k_exacto": round(float(np.mean(kv == -st)), 4),
                "k_a_1_semitono": round(float(np.mean(np.abs(kv + st) <= 1)), 4),
                "k_mediana": float(np.median(kv)),
            }
        )
        print(f"disfraz {st:+d}: hecho ({time.time() - t0:.0f} s)", flush=True)
    out["ejemplo"] = ejemplo
    out["segundos"] = round(time.time() - t0, 1)
    return out


def main() -> None:
    res = run()
    dst = EVAL_DIR / "results" / "voz_distorsion.json"
    dst.write_text(json.dumps(res, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(res, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
