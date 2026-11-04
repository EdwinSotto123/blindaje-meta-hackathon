# Datos del demo (ficticios)

Historia de los casos A, B y C (sección 3 del documento de diseño, textos de `docs/VIDEO.md`).
Todo es **ficticio**: personas, negocios, números (`+51 900 000 xxx`), la cuenta de Yape y el grupo
"Los X".

| Caso | Evidencia | Qué debe detectar Blindaje |
|---|---|---|
| A, bodega, San Juan de Lurigancho | `A1.ogg` y `A2.ogg` (voz 1, celular 1), mensaje "Si no yapeas S/ 2,000 en 48 horas al 900 000 101…", `foto-A.jpg` (bala sobre el mostrador y nota "LOS X. 48 HORAS"), muestra de voz `victima-A.ogg` | Ficha, huella de voz, identificadores, bala y nota en la imagen |
| B, mototaxi, otro distrito | `B1.ogg` (la **misma voz 1**, desde el **celular 2** y otro número), mensaje "Yapea al 900 000 202. Habla con el jefe." | Vínculo A–B por voz con números distintos; "habla con el jefe" y "no llames a la policía" |
| C, mercado | `C1.ogg` (otra voz), mensaje "Tu cupo es S/ 800 semanal. Yapea al 900 000 202…" | Vínculo B–C por la misma cuenta de Yape |
| D, E, F y G, de fondo | Solo un mensaje de texto cada uno, en San Juan de Lurigancho, de "Los X" con "habla con el jefe"; D, E y G pagan a 900 000 202 | Volumen para la red y el Vigía (≥ 5 casos de ≥ 3 víctimas en la zona en 14 días) |
| H, mercado, Ate (segunda banda) | `H1.ogg` (**voz 2**, otra persona) y "Cupo semanal S/ 200. Yapea al 900 000 212…" | Vínculo F–H por la cuenta 900 000 212: F dice ser de "Los X", pero paga a otra cuenta. Los agentes separan por la evidencia, no por el nombre |
| I, mercado (lo sube la persona en el video, desde la app) | `I1.ogg` (voz 2), `foto-I.jpg` (nota "PAGA O CIERRAS. 200 X SEMANA"), `video-I.mp4` (esa foto con zoom y el audio `I2.ogg`) y "Ya sabes: S/ 200 cada semana al 900 000 212…" | Vínculos H–I por voz y F–I y H–I por la cuenta: segunda red de 3 casos |
| J, bodega, **caso falso** | `J1.ogg` (voz clonada de quien extorsiona en A y B, con la marca de agua de AudioSeal), `foto-J.jpg` (la foto alternativa con la marca de Video Seal) y "Los X. Yapea S/ 3,000 al 900 000 202…" | Autenticidad "generado con IA, confirmado" en el audio y la foto; la voz pesa la mitad y la persona revisora descarta el vínculo con la banda 1 |

Así quedan 10 casos: la banda 1 (A, B, C, D, E y G), la banda 2 (F, H e I) y un caso falso (J).

Números de contacto (en el relato de cada caso): A `+51 900 000 111`, B `+51 900 000 222`,
C `+51 900 000 333`.

## Archivos

- `demo.json`: lo que carga `pnpm demo:seed` (casos, evidencia, fechas, relatos).
- `guiones-audio.json`: textos de los audios (los mismos de `docs/VIDEO.md`).
- `audio/*.ogg`: notas de voz Opus. `audio/manifest.json` dice el origen de cada una
  (`grabado` o `sintetico`), su SHA-256 y la verificación de la huella de voz.
- `foto-A.jpg`: la foto del caso A. `foto-alternativa.jpg`: otra toma parecida que la evaluación usa
  como imagen distinta. `foto-A.meta.json`: modelo y prompt.
- `foto-I.jpg` (`pnpm --filter @blindaje/eval demo:foto-i`, Muse Image) y `video-I.mp4`: el puesto del
  caso I y su video, armado con
  `ffmpeg -i foto-I.jpg -i audio/I2.ogg -filter_complex "[0:v]scale=1920:1280,zoompan=z='min(1+0.0018*on,1.45)':x='iw*0.51-(iw/zoom/2)':y='ih*0.55-(ih/zoom/2)':d=240:s=1280x720:fps=30,format=yuv420p[v]" -map "[v]" -map 1:a -t 8 -c:v libx264 -crf 24 -c:a aac -b:a 64k -ac 1 -movflags +faststart video-I.mp4`.
- `foto-J.jpg` y la marca de `J1.ogg`: `services/ml/scripts/demo_caso_falso.py` (AudioSeal y Video
  Seal, comprueba que los detectores las leen). `caso-falso.meta.json`: origen, marca y puntaje.

## Los audios son sintéticos

Mientras el equipo no grabe los audios, **son respaldos sintéticos** generados con MMS-TTS de Meta
(`facebook/mms-tts-spa`, licencia CC-BY-NC-4.0, no comercial) y pasados por la simulación de
WhatsApp: A1, A2 y la muestra de la víctima por el canal 1; B1, C1 y el infiltrado por el canal 2.
La voz 1 es la de MMS-TTS; la voz de C1 y la de la víctima son la misma síntesis con otro tono y
timbre, para que la huella de voz las trate como personas distintas (ver `verificacion_voz` en el
manifiesto). La sección 1 de `docs/VIDEO.md` explica cómo grabarlos; con las grabaciones en
`eval/audio/raw/demo/`, `uv run python -I -m blindaje_eval.tts_demo --force` las usa en su lugar.

## Comandos

```bash
pnpm demo:reset   # borra todo lo is_demo en la API
pnpm demo:seed    # organización, usuarios, dispositivos P-256, casos A → B → C y su procesamiento
```

`API_URL` (por defecto la del README de `services/api`), `DEMO_SECRET` (o `services/api/.dev.vars`;
también va en el registro de dispositivos, que con `DEMO_MODE=true` queda exento del límite de 10 por hora por IP)
y `DEMO_WAIT_SECONDS` (espera por caso, 240 por defecto). Son idempotentes: reutilizan los
dispositivos guardados en `eval/data/cache/demo-devices.json`, no duplican casos y la API ignora
evidencia repetida.
