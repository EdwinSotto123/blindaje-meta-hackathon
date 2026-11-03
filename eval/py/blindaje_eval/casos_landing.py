"""Los tres casos del demo para la sección "Los casos" de la landing: lo que recibe cada víctima.

Toma de eval/demo (todo ficticio: personas, negocios, números, cuentas y "Los X") los casos A, B y C:
el primer audio de cada uno, sus mensajes y la foto del caso A. Para la landing deja:

- apps/landing/public/casos/{a1,b1,c1}.m4a: los audios enteros (voces sintéticas de MMS-TTS), para
  escucharlos en el chat.
- apps/landing/src/assets/casos/foto-A.jpg: la foto del caso A (bala y nota en el mostrador), a 960 px.
- apps/landing/src/data/casos-demo.json: por caso, el número desde el que escriben, cuántos días antes
  llegó cada pieza, la duración y la forma de onda de cada audio (36 barras), el texto de los mensajes y
  la transcripción de los audios (guiones-audio.json).

Uso (desde eval/):
  pnpm demo:casos
"""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image

from .paths import DEMO_DIR, EVAL_DIR
from .whatsapp import a_wav

LANDING = EVAL_DIR.parent / "apps" / "landing"
BARRAS = 36
CASOS = ("A", "B", "C")


def _onda(x: np.ndarray) -> list[float]:
    tramos = np.array_split(np.abs(x), BARRAS)
    picos = np.array([float(np.percentile(t, 98)) if t.size else 0.0 for t in tramos])
    return [round(float(v), 2) for v in picos / max(float(picos.max()), 1e-9)]


def _m4a(ogg: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-i",
        str(ogg),
        "-ac",
        "1",
        "-c:a",
        "aac",
        "-b:a",
        "40k",
        str(dst),
    ]
    subprocess.run(cmd, check=True)


def main() -> None:
    demo = json.loads((DEMO_DIR / "demo.json").read_text(encoding="utf-8"))
    guiones = json.loads((DEMO_DIR / "guiones-audio.json").read_text(encoding="utf-8"))["audios"]
    ids = demo["identificadores"]
    out = []
    for caso in demo["casos"]:
        if caso["code"] not in CASOS:
            continue
        piezas = []
        audio_listo = False
        for e in caso["evidencia"]:
            if e["tipo"] == "audio":
                # Un audio por caso en el chat (el primero): el caso A tiene dos, de la misma voz.
                if audio_listo:
                    continue
                audio_listo = True
                nombre = Path(e["archivo"]).stem
                with tempfile.TemporaryDirectory() as tmp:
                    wav = Path(tmp) / f"{nombre}.wav"
                    a_wav(DEMO_DIR / e["archivo"], wav)
                    x, sr = sf.read(str(wav), dtype="float32", always_2d=False)
                _m4a(DEMO_DIR / e["archivo"], LANDING / "public" / "casos" / f"{nombre.lower()}.m4a")
                piezas.append(
                    {
                        "tipo": "audio",
                        "id": nombre,
                        "dia": e["dia"],
                        "hora": e["hora"],
                        "segundos": round(len(x) / sr, 1),
                        "onda": _onda(x),
                        "texto": guiones[nombre]["texto"],
                    }
                )
            elif e["tipo"] == "texto":
                piezas.append({"tipo": "texto", "dia": e["dia"], "hora": e["hora"], "texto": e["texto"]})
            elif e["tipo"] == "imagen":
                dst = LANDING / "src" / "assets" / "casos" / "foto-A.jpg"
                dst.parent.mkdir(parents=True, exist_ok=True)
                img = Image.open(DEMO_DIR / e["archivo"]).convert("RGB")
                img.resize((960, round(960 * img.height / img.width)), Image.Resampling.LANCZOS).save(
                    dst, "JPEG", quality=82, optimize=True, progressive=True
                )
                piezas.append({"tipo": "imagen", "dia": e["dia"], "hora": e["hora"]})
        out.append(
            {
                "caso": caso["code"],
                "sector": caso["sector"],
                "zona": caso["zona"],
                "contacto": ids[f"contacto_{caso['code']}"],
                "piezas": piezas,
            }
        )
    datos = {
        "fuente": "eval/py/blindaje_eval/casos_landing.py (casos ficticios A, B y C de eval/demo)",
        "ficticio": True,
        "casos": out,
    }
    (LANDING / "src" / "data" / "casos-demo.json").write_text(
        json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    print(json.dumps([{"caso": c["caso"], "piezas": [p["tipo"] for p in c["piezas"]]} for c in out]))


if __name__ == "__main__":
    main()
