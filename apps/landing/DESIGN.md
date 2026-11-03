---
name: Blindaje web · Humano y cálido
description: La landing, el portal público y la consola de Blindaje. La calle limeña da la paleta (crema de pared, terracota de ladrillo, ocre de fachada, verde de puerta pintada, tinta café), Bricolage Grotesque en los titulares y Atkinson Hyperlegible en el texto, fotos reales de Lima con crédito.
scope: apps/landing, apps/portal, apps/console (la app móvil conserva su camuflaje de cuaderno, ver DESIGN.md en la raíz)
source: packages/ui/theme/calido.css
colors:
  crema: "#f7f1e6"
  crema-2: "#efe5d3"
  papel: "#fffcf6"
  noche: "#2a1e17"
  noche-2: "#3a2a20"
  tinta: "#2a1e17"
  tinta-2: "#6a5446"
  tinta-3: "#76604f"
  linea: "#e2d5c1"
  linea-2: "#cdbba3"
  terracota: "#b4462a"
  terracota-2: "#8c3218"
  arcilla: "#f3d9c6"
  ocre: "#e7ad45"
  ocre-suave: "#f8e2b0"
  verde: "#2e5e4e"
  verde-suave: "#d6e6dc"
  alerta: "#a3241b"
  alerta-suave: "#f8dcd6"
  crema-tenue: "#d9c9b5"
  lvl-none: "#ebe5db"
  lvl-bajo: "#eeb994"
  lvl-medio: "#d77a4c"
  lvl-alto: "#9e3a1f"
signals:
  voz: { fill: "#c59711", border: "#815d00", tint: "#f8eed8", glyph: "círculo" }
  identificadores: { fill: "#21763c", border: "#045725", tint: "#e3f4e5", glyph: "rombo" }
  frases: { fill: "#bf71a6", border: "#793d67", tint: "#fbe8f4", glyph: "etiqueta" }
  imagenes: { fill: "#105483", border: "#003860", tint: "#e3f0fd", glyph: "hexágono" }
  casos: { fill: "#2a1e17", text: "#fffcf6", glyph: "rectángulo redondeado" }
typography:
  display: { fontFamily: "Bricolage Grotesque (variable, opsz)", fontSize: "clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)", fontWeight: 650, lineHeight: 1.02, letterSpacing: "-0.02em" }
  head: { fontFamily: "Bricolage Grotesque", fontSize: "clamp(1.875rem, 1.35rem + 2vw, 2.875rem)", fontWeight: 650, lineHeight: 1.08, letterSpacing: "-0.018em" }
  figure: { fontFamily: "Bricolage Grotesque", fontSize: "clamp(2.5rem, 1.8rem + 2.4vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.03em" }
  wordmark: { fontFamily: "Bricolage Grotesque", fontWeight: 800, letterSpacing: "-0.045em", text: "blindaje", note: "minúsculas, con un punto de terracota de 0.2em al final" }
  lead: { fontFamily: "Atkinson Hyperlegible", fontSize: "clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)", lineHeight: 1.45 }
  body: { fontFamily: "Atkinson Hyperlegible", fontSize: "clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)", lineHeight: 1.55 }
  small: { fontFamily: "Atkinson Hyperlegible", fontSize: "0.875rem", lineHeight: 1.45 }
radii:
  s: "8px"
  m: "12px (botones, campos)"
  l: "16px (tarjetas)"
  foto: "20px"
shadows:
  sombra-1: "0 1px 2px rgb(74 40 20 / .08), 0 4px 12px -4px rgb(74 40 20 / .12)"
  sombra-2: "0 2px 4px rgb(74 40 20 / .06), 0 18px 40px -16px rgb(74 40 20 / .28)"
---

# Blindaje web: Humano y cálido

**29/10/2026.** Después de cuatro mundos visuales (quipu índigo, informe en serif, tintes del quipu y una
landing de producto en añil con resaltador amarillo), el dueño dijo "sigue estando hasta la mierda el
diseño" y eligió, en una pregunta estructurada, rehacer la landing, el portal público y la consola con
**"Humano y cálido"**: crema, terracota y fotos reales de Lima, con las víctimas al centro.

## Idea

Detrás de cada caso hay una persona de barrio. La paleta sale de su calle: el crema de las paredes, la
terracota del ladrillo, el ocre de las fachadas, el verde de las puertas pintadas y una tinta café en vez
del negro. Las tres superficies comparten las variables de `packages/ui/theme/calido.css`
(`@blindaje/ui/theme.css`); cada app solo nombra sus usos.

## Color

- **Fondos:** crema para la página, crema-2 para bandas hundidas (Hecho con Meta AI, beneficios,
  resultados, barra lateral de la consola), papel para lo que se eleva (tarjetas, el formulario, el marco
  del mapa).
- **Tinta:** tinta para el texto, tinta-2 para lo secundario (6.3:1 sobre crema), tinta-3 solo para
  créditos y notas (5.3:1). Nunca grises fríos.
- **Acción:** terracota con texto blanco (5.5:1); hover en terracota-2. Es el único color de botón
  principal en las tres superficies.
- **Marcar un dato:** ocre-suave detrás de la palabra (clase `.marca` en la landing). Reemplaza al
  resaltador amarillo.
- **Confirmado:** verde. **Error y 105:** alerta, con texto blanco.
- **Campos de color de la landing:** la noche café en la franja de ayuda y el pie; la terracota en
  "Solicita acceso", el único campo de color fuerte, con la hoja del formulario en papel.
- **Mapa:** una sola tinta terracota de claro a oscuro (`--lvl-bajo/medio/alto`); "sin datos" es un gris
  cálido sin borde ni rango, igual para cero casos y para menos del umbral. La consola agrega
  `--lvl-medio-alto` (mezcla de medio y alto) para su cuarto rango.
- **Señales** (grafo de la consola y "Las huellas que deja una banda"): ocre para la voz, verde para los
  identificadores, buganvilla para las frases, azul petróleo para las imágenes, tinta para los casos.
  Validadas con el script de dataviz (`--pairs all`: peor par con daltonismo 15.6, visión normal 17.8).
  El ocre tiene poco contraste solo: siempre lleva borde o etiqueta. La forma del glifo es la segunda
  señal.

## Tipografía

Bricolage Grotesque variable (eje de tamaño óptico) para titulares, cifras y el wordmark; Atkinson
Hyperlegible para todo el texto y los controles, pensada para leer con poca visión o con apuro. Titulares
en peso 650 con tracking -0.02em: abiertos, no comprimidos. Cifras grandes (problema y resultados) en
Bricolage; las del problema en tinta, las de resultados en terracota. Kalam y cualquier letra a mano
quedaron fuera de la web.

## Fotos

Dos fotos de Wikimedia Commons con licencia abierta y crédito visible (`docs/fotos.md`): un cerro poblado
(selector del portal y login de la consola) y una bodega por dentro (fila de las víctimas en la landing).
Radio de 20 px y `--sombra-2`. Nunca muestran víctimas ni negocios reconocibles, y ningún texto dice que
ahí pasó un caso. Las fotos de los casos del demo (el mostrador con la bala y la nota, las colchas de
"Otro ángulo, la misma colcha") son ficticias, hechas con Muse Image (`eval/src/gen-demo-images.ts`), y
sus textos lo dicen.

## Composición de la landing

- **Pitch (3/11, es la portada y "Cómo funciona"):** quince escenas a pantalla entera sobre la noche
  café que avanzan con el scroll (`Pitch.astro`): el logo armado con píxeles; el problema, de América
  Latina al Perú y sus distritos fiscales; las tres víctimas; la voz (huella, desdistorsión, radar); la
  foto; el texto (ficha, números con HMAC, frases firma); la suma de señales; la red; el Vigía; el mapa;
  y la escala a la región. Un solo lienzo dibuja todo con datos reales de la evaluación y casos
  ficticios; el texto de cada escena es HTML y entra con `clip-path`, nunca con opacidad (axe mide el
  contraste a mitad de un fundido). Los puntos de la derecha (arriba en el celular) nombran cada escena.
  El modo en vivo lo decide el CSS (`.js` y movimiento permitido) para que el titular pinte en el primer
  cuadro; los datos del lienzo bajan después de la carga. Sin movimiento, cada escena con su dibujo final
  quieto; sin JavaScript, el texto en lista.
- **Pitch interactivo (3/11):** debajo del texto, cada escena que se presta tiene su control, con datos
  reales: escuchar el audio de cada víctima (con subtítulos), mover el tono que deshace el disfraz, mover
  el umbral de revisión entre las voces, elegir qué par de fotos comparar, tocar un dato de la ficha para
  ver de dónde sale, prender o apagar señales (la suma usa `combineSignals`), confirmar o descartar el
  vínculo entre A y B, avanzar los días del Vigía y elegir un país. Los deslizadores siguen al scroll
  hasta que se tocan; al salir de la escena, todo vuelve a lo que decide el scroll. Abajo a la izquierda,
  anterior y siguiente, "n de 15" y "Saltar la historia"; las flechas ← y → del teclado pasan de escena y
  una línea ocre al pie marca el avance. Los controles son botones con `aria-pressed` y deslizadores con
  `aria-valuetext`; lo que cambia se anuncia en una región `aria-live`. Sin movimiento, los controles
  vuelven a dibujar el dibujo quieto; sin JavaScript, no se muestran. En el celular, el dibujo usa el alto
  que deja libre el texto de cada escena.
- **Sube lo que te mandaron, de forma anónima (3/11, `#subir`, justo después del pitch):** fondo
  `--paper-2`; a la izquierda el título, tres garantías con ícono (solo región y distrito, y la ubicación
  de las fotos JPG se borra; cifrado con SHA-256; se compara solo si la persona lo activa) y el aviso en
  rojo suave de que es un piloto y no reemplaza una denuncia (105 y 1818); a la derecha, la hoja de papel
  del formulario: arriba la franja verde "Es anónimo" (sin nombre, DNI, teléfono, correo ni cuenta),
  soltar o elegir archivos (audio, foto, video o el chat en .txt, hasta 10 de 50 MB; las fotos JPG
  pierden el GPS en el navegador con `stripJpegLocation`, sin recomprimir, y la fila dice "ubicación
  borrada"), "Probar con un caso de ejemplo" (los archivos ficticios del caso A), pegar los mensajes,
  "¿Dónde pasó?" (región obligatoria, con "Prefiero no decirlo"; en Lima Metropolitana y el Callao la
  lista de distritos, fuera de Lima el distrito o la ciudad en texto, que rechaza calles y números),
  "Cuéntanos más" plegado (cómo te contactaron en pastillas, cuándo empezó, rubro, relato; lo marcado
  se suma al relato), el consentimiento comunitario apagado por defecto y "Enviar mi evidencia" con una
  barra de avance. Usa la misma API que la app
  (`/v1/auth/device/register`, `/v1/cases`, evidencia, envío) y, cuando la IA termina, muestra el
  reporte propio: ficha, lo que dice cada audio, hallazgos, qué hacer, el PDF de la denuncia y "Borrar mi
  caso". El token vive solo en la memoria de la pestaña. Enlazada desde la cabecera ("Subir evidencia")
  y desde el final del pitch.
- **Después del pitch:** Voz (los audios del caso B), Fotos (la misma colcha), dónde pasa (mapa),
  beneficios, recorrido del producto, Meta AI, resultados, límites, preguntas y "Solicita acceso".
- **Cabecera:** crema con línea inferior; wordmark, seis enlaces, idioma y "Ver el mapa". La franja de
  ayuda (105, Línea 1818, Salir rápido) queda fija arriba en la noche café.
- **Secciones:** título a la izquierda y entrada a la derecha, alineados por la primera línea; filas
  separadas por líneas antes que tarjetas, y nunca una tarjeta dentro de otra.
- **Beneficios:** filas alternadas; la de víctimas une la foto de la bodega con la app por fuera
  (cuaderno de ventas, su disfraz real) y por dentro.
- **Pie:** la ayuda, el wordmark, enlaces, notas de honestidad y el crédito de cada foto.

## Portal y consola

- **Portal:** contenedor de 1120 px y columna de lectura de 760 px; pestañas subrayadas con la activa en
  terracota; la respuesta de Mi zona en una tarjeta de papel ("En Ate, el riesgo para bodegas es
  **alto**", con el nivel sobre el color de su cuadro); notas en bandas hundidas sin borde; lo que no
  llega al mínimo, punteado. Detalle en el informe del 29/10 en `DEVLOG.md`.
- **Consola:** herramienta de horas (modo Operate): crema, barra lateral crema-2, paneles de papel con
  borde de 1 px, botones terracota de 42 px, el ítem activo relleno de tinta, foco terracota de 3 px.
  La foto solo en el inicio de sesión.

## Reglas

- Una superficie elevada lleva borde **o** sombra, no ambos; nunca tarjetas dentro de tarjetas.
- Foco visible: `outline: 3px solid var(--terracota); outline-offset: 2px`.
- Sin emojis, sin letra a mano, sin cuadriculados de fondo (salvo el cuaderno de ventas de la app, que es
  su disfraz real), sin kickers, sin texto con degradado, sin sombras duras.
- El detector marca `cream-palette` en todas las pantallas: es el fondo que eligió el dueño, a propósito.
