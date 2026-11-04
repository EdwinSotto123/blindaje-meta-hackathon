"""Evidencia del caso J del demo: un caso falso, hecho entero con IA.

Toma el audio J1 (voz sintética de MMS-TTS que imita a quien extorsiona en A y B, ya generado por
`pnpm --filter @blindaje/eval demo:audio`) y la foto alternativa del demo (generada con Muse Image),
y les pone la marca de agua que deja un generador de Meta: AudioSeal en el audio y Video Seal en la
imagen. El audio con la marca se vuelve a pasar por Opus, como un reenvío por WhatsApp. Al final lee
las marcas con los mismos detectores del contenedor para comprobar que el paso de autenticidad las
confirma ("generado_ia_confirmado").

Solo medios ficticios. Necesita los pesos (`scripts/download_models.py`) y ffmpeg con libopus.

    cd services/ml
    uv run python scripts/demo_caso_falso.py
"""

from __future__ import annotations

import hashlib
import io
import json
import os
import subprocess
import tempfile
from pathlib import Path

os.environ.setdefault("NO_TORCH_COMPILE", "1")

from PIL import Image

from blindaje_ml import media
from blindaje_ml.imaging import to_jpeg
from blindaje_ml.watermark import (
    AudioSealDetector,
    AudioSealEmbedder,
    VideoSealDetector,
    VideoSealEmbedder,
    hex_to_bits,
)

REPO = Path(__file__).resolve().parent.parent.parent.parent
DEMO = REPO / "eval" / "demo"
AUDIO = DEMO / "audio" / "J1.ogg"
FOTO_BASE = DEMO / "foto-alternativa.jpg"
FOTO = DEMO / "foto-J.jpg"
# Mensajes fijos: no identifican a nadie, solo hacen que la marca sea reproducible.
MENSAJE_AUDIO = 0x4A31  # "J1"
MENSAJE_IMAGEN = "4a" * 32  # 256 bits
JPEG_QUALITY = 92


def _sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def _opus(wav: bytes, dst: Path) -> None:
    """WAV a OGG Opus mono 16 kHz, como una nota de voz reenviada por WhatsApp."""
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "marcado.wav"
        src.write_bytes(wav)
        subprocess.run(
            [
                "ffmpeg",
                "-nostdin",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(src),
                "-c:a",
                "libopus",
                "-b:a",
                "24k",
                "-vbr",
                "on",
                "-application",
                "voip",
                "-ar",
                "16000",
                "-ac",
                "1",
                str(dst),
            ],
            check=True,
        )


def marcar_audio() -> dict:
    original = AUDIO.read_bytes()
    wav, _ = media.normalize_audio(original)
    marcado = AudioSealEmbedder().embed(media.wav_to_array(wav), MENSAJE_AUDIO)
    _opus(media.array_to_wav(marcado), AUDIO)
    # Lectura como la hace el contenedor: el archivo final, ya comprimido.
    final, _ = media.normalize_audio(AUDIO.read_bytes())
    det = AudioSealDetector().decode(media.wav_to_array(final))
    print(f"J1.ogg: AudioSeal detectado={det['detected']} score={det['score']}")
    return {"detectado": det["detected"], "score": det["score"], "sha256": _sha(AUDIO)}


def marcar_imagen() -> dict:
    base = Image.open(FOTO_BASE).convert("RGB")
    emb = VideoSealEmbedder()
    marcada = emb.embed(base, hex_to_bits(MENSAJE_IMAGEN, emb.nbits))
    FOTO.write_bytes(to_jpeg(marcada, quality=JPEG_QUALITY))
    det = VideoSealDetector().detect([Image.open(io.BytesIO(FOTO.read_bytes()))])
    print(f"foto-J.jpg: Video Seal detectado={det['detected']} score={det['score']}")
    return {"detectado": det["detected"], "score": det["score"], "sha256": _sha(FOTO)}


def main() -> None:
    audio = marcar_audio()
    imagen = marcar_imagen()
    meta = {
        "ficticio": True,
        "caso": "J",
        "nota": "Caso falso del demo: toda su evidencia está hecha con IA y lleva la marca de agua de Meta. "
        "El paso de autenticidad debe confirmarlo y la persona revisora, descartarlo.",
        "audio": {
            "archivo": "eval/demo/audio/J1.ogg",
            "origen": "MMS-TTS (facebook/mms-tts-spa), voz persona1",
            "marca": "AudioSeal 16 bits",
            "mensaje": MENSAJE_AUDIO,
            **audio,
        },
        "imagen": {
            "archivo": "eval/demo/foto-J.jpg",
            "origen": "Muse Image (muse-image-1.0), la foto alternativa del demo",
            "marca": "Video Seal 1.0, 256 bits",
            **imagen,
        },
    }
    (DEMO / "caso-falso.meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    # El manifiesto de audios guarda el SHA-256 de cada archivo: J1 cambió al llevar la marca.
    manifest = DEMO / "audio" / "manifest.json"
    m = json.loads(manifest.read_text(encoding="utf-8"))
    if "J1" in m.get("audios", {}):
        m["audios"]["J1"]["sha256"] = audio["sha256"]
        m["audios"]["J1"]["marca_agua"] = "AudioSeal 16 bits (scripts/demo_caso_falso.py de services/ml)"
        manifest.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if not (audio["detectado"] and imagen["detectado"]):
        raise SystemExit("Alguna marca no se lee: el caso falso no quedaría confirmado.")


if __name__ == "__main__":
    main()
