import type { Dict } from "./types";
import { SOURCES } from "./sources";

export const es: Dict = {
  lang: "es",
  htmlLang: "es-PE",
  meta: {
    title: "Blindaje: inteligencia comunitaria contra la extorsión",
    description:
      "Blindaje recolecta la evidencia que guardan las víctimas de extorsión, la convierte en inteligencia y muestra en qué distritos pasa, nunca en qué vivienda. Una persona revisa cada vínculo.",
    ogLocale: "es_PE",
  },
  skip: "Saltar al contenido",
  help: {
    ariaLabel: "Ayuda inmediata",
    danger: "¿Estás en peligro ahora?",
    dangerCta: "Llamar al 105",
    report: "Para denunciar:",
    reportCta: "Línea 1818",
    exit: "Salir rápido",
    exitShort: "Salir",
    exitHint: "Abre una página neutra. Atajo: Esc dos veces.",
  },
  nav: {
    ariaLabel: "Secciones",
    benefits: "Beneficios",
    map: "Mapa",
    product: "Producto",
    how: "Cómo funciona",
    intelligence: "Inteligencia",
    tech: "Meta AI",
    results: "Resultados",
    pilot: "Solicitar acceso",
    switchLabel: "Read in English",
    switchName: "English",
    switchShort: "EN",
    switchHref: "/en/",
    switchLang: "en",
  },
  hero: {
    ctaPilot: "Solicitar acceso",
    ctaHow: "Ver cómo funciona",
  },
  problem: {
    title: "Miles de denuncias que nadie conecta",
    lead: "Las bandas operan en serie: la misma voz llama a varias víctimas, mandan las mismas fotos, repiten el mismo guion y la misma cuenta cobra a distintos comerciantes. Esa información existe, pero está dispersa en celulares de personas que no se conocen.",
    sourcePrefix: "Fuente:",
    figures: [
      {
        value: "13,892",
        text: "denuncias por extorsión registró el Ministerio Público entre enero y julio de 2026.",
        detail:
          "Los distritos fiscales con más casos: Lima Este (1,806), La Libertad (1,625), Lima Sur (1,346), Lima Norte (1,305) y Lima Centro (1,178).",
        source: SOURCES.exitosa,
      },
      {
        value: "27,000",
        text: "denuncias por extorsión, o más, cerraron el año 2025, según datos de la Fiscalía.",
        source: SOURCES.larepublica,
      },
      {
        value: "80",
        text: "por ciento de las empresas de transporte público admitió pagar cupos mensuales a bandas criminales.",
        detail:
          "Al menos 69 conductores fueron asesinados durante su jornada en 2025, con la extorsión como principal móvil.",
        source: SOURCES.larepublica,
      },
      {
        value: "26,217",
        text: "denuncias por extorsión al cierre del periodo analizado, frente a 4,761 al inicio, mientras los presos sentenciados bajaron de 712 a 650.",
        detail:
          "El medio aclara que las cifras solas no explican la diferencia: más denuncias no se traducen solas en más condenas.",
        source: SOURCES.elcomercio,
      },
    ],
    gapTitle: "Y las cifras se quedan cortas: muchas víctimas no denuncian por temor a represalias.",
    gapSource: SOURCES.americatv,
    gaps: [
      {
        title: "Evidencia débil",
        text: "Audios de WhatsApp sin transcribir, capturas sin fecha, cronologías armadas de memoria.",
      },
      {
        title: "Casos desconectados",
        text: "Nadie compara la voz del audio de una bodeguera con la de un mototaxista de otro distrito.",
      },
      {
        title: "Miedo a denunciar",
        text: "La víctima no sabe si denunciar sirve, teme que el extorsionador se entere y no tiene a quién recurrir.",
      },
    ],
  },
  actors: {
    title: "Cada uno recibe algo concreto.",
    lead: "La víctima documenta sin exponerse, la comunidad sabe dónde pasa y la autoridad recibe casos ya vinculados.",
    victim: {
      name: "Víctima",
      title: "Guarda la evidencia sin que nadie lo note.",
      lead: "En el celular, Blindaje se ve como una app común de tu negocio, y tú eliges cuál. Funciona de verdad. Tus notas privadas se abren con una entrada secreta y tu PIN.",
      points: [
        {
          title: "PIN señuelo y salir rápido",
          text: "Un PIN señuelo abre unas notas vacías y creíbles. Un toque vuelve a la app de siempre y la bloquea. Cero notificaciones.",
        },
        {
          title: "Todo se sube cifrado",
          text: "Graba, toma una foto o pega un audio de WhatsApp. Se sube cifrado apenas lo guardas y no queda en tu galería.",
        },
        {
          title: "Lo que encontramos",
          text: "Blindaje transcribe y resalta los datos: cuánto piden, por dónde, en qué plazo y quién dice ser.",
        },
        {
          title: "Tu denuncia, lista",
          text: "Con cronología y huella de integridad, para llevarla a la comisaría.",
        },
      ],
      illo: {
        label: "La misma app, por fuera y por dentro",
        outside: "Por fuera: un cuaderno de ventas que funciona",
        inside: "Por dentro: cómo se revisó cada nota",
        key: "Entrada secreta y PIN",
        note: "Ilustración. El disfraz lo eliges tú: este es uno de ellos.",
      },
      shotOutsideAlt:
        "Captura de la app por fuera: el cuaderno de ventas, con las ventas del día y los fiados por cobrar",
      shotInsideAlt:
        "Captura de la app por dentro: cómo se revisó un audio, paso por paso, con Muse Voice Transcribe, SpeechBrain ECAPA y AudioSeal, C2PA y Muse Spark 1.2",
      cloud:
        "Sin señal, la evidencia espera cifrada en el celular y se borra de ahí cuando la subida se confirma. Solo la ven las personas autorizadas.",
    },
    community: {
      name: "Comunidad y negocios",
      title: "Ven dónde pasa y saben qué hacer",
      lead: "Con consentimiento, cada caso se compara con los demás. El equipo aprueba alertas anónimas por distrito y cada negocio ve consejos de prevención para su zona y su rubro.",
      points: [
        {
          title: "Solo cifras agregadas",
          text: "Nada se muestra con menos de 5 casos de 3 víctimas distintas. No hay buscador de números ni de cuentas.",
        },
      ],
      consent: [
        {
          title: "Solo mi denuncia",
          tag: "Viene así",
          text: "Blindaje ordena tu evidencia y arma tu denuncia. Nada sale de tu caso.",
        },
        {
          title: "Modo comunitario",
          tag: "Lo activas tú",
          text: "Tus señales seudonimizadas se comparan con las de otros casos. Lo puedes retirar cuando quieras.",
        },
      ],
      shot: {
        alt: "Captura del portal público en un celular: mapa de los distritos de Lima y el Callao con niveles de riesgo en rangos, sin cuenta.",
        caption: "Portal público en el celular, sin cuenta. Modo simulado, datos ficticios.",
      },
    },
    authority: {
      name: "Autoridad",
      title: "Expedientes de red para la policía y la fiscalía.",
      lead: "Cuando un analista autorizado aprueba una red, Blindaje arma el expediente en PDF. Se envía solo cuando existe un canal formal con la autoridad.",
      dossier: [
        { title: "Resumen de la red", text: "Tamaño, periodo, sectores y modus operandi común." },
        { title: "Cronología unificada", text: "Los hechos de todos los casos, en orden." },
        { title: "Vínculos explicados", text: "Cada vínculo con su puntaje, sus señales y la evidencia citada." },
        { title: "Huella SHA-256", text: "Cada archivo original con su huella de integridad y hora UTC." },
        { title: "Cadena de custodia", text: "Quién subió qué y cuándo, en un registro encadenado." },
      ],
      channel:
        "Las cuentas que aparecen en varios casos quedan señaladas para que la autoridad las pida por los canales legales. Blindaje no comparte datos con bancos ni fintechs.",
      shot: {
        alt: "Captura de la consola: perfil de la red R-001 hecho por el Cartógrafo, con hechos citados a la izquierda e hipótesis por aprobar a la derecha.",
        caption:
          "El Cartógrafo separa hechos de hipótesis. Solo lo aprobado entra al expediente. Consola en modo simulado, datos ficticios.",
      },
    },
  },
  tech: {
    title: "Hecho con Meta AI, pieza por pieza",
    lead: "La evidencia pasa por un pipeline en Cloudflare y un contenedor de ML. Cada pieza se transcribe, se segmenta, se resume en una ficha y se convierte en señales que se pueden comparar.",
    groups: [
      {
        title: "Meta Model API",
        rows: [
          {
            name: "Muse Spark 1.3",
            id: "muse-spark-1.3",
            use: "Arma la ficha del caso con JSON de esquema estricto, mueve a los agentes con llamadas a herramientas por la Responses API y busca manipulación en fotos y videos.",
          },
          {
            name: "Muse Spark 1.2",
            id: "muse-spark-1.2",
            use: "Escucha el audio directamente para el análisis forense de la voz, porque la 1.3 no tiene soporte completo de audio.",
          },
          {
            name: "Muse Voice Transcribe 1.0",
            id: "muse-voice-transcribe-1.0",
            use: "Transcribe separando quién habla, con marcas de tiempo por turno y un vocabulario propio: Yape, Plin, cupo, derecho de piso.",
          },
          {
            name: "SAM 3.1",
            id: "sam-3.1",
            use: "Encuentra con texto balas, notas escritas a mano y placas en fotos y cuadros de video, y tapa los rostros de terceros.",
          },
          {
            name: "Muse Image 1.0",
            id: "muse-image-1.0",
            use: "Generó las fotos ficticias del demo y de la evaluación. Ninguna foto es real.",
          },
          {
            name: "Muse Wonder 1.0",
            id: "muse-wonder-1.0",
            use: "Opcional: el Cartógrafo lo usa cuando una red es muy grande.",
          },
        ],
      },
      {
        title: "Modelos y librerías abiertas de Meta",
        rows: [
          {
            name: "AudioSeal",
            id: "facebook/audioseal",
            use: "Detecta marcas de IA en el audio y, al revés, marca cada copia de audio con los 16 bits de la cuenta que la escucha.",
          },
          {
            name: "Video Seal",
            id: "facebookresearch/videoseal",
            use: "Detecta marcas de IA en fotos y videos, y marca cada copia de imagen con un mensaje de 256 bits por entrega.",
          },
          {
            name: "DINOv2",
            id: "dinov2-small",
            use: "Convierte cada recorte en un vector para encontrar imágenes reutilizadas aunque no sean idénticas.",
          },
          { name: "FAISS", id: "faiss", use: "Tres índices de búsqueda: voz, texto e imagen." },
          { name: "PyTorch", id: "torch", use: "Corre los modelos del contenedor de ML." },
          { name: "React Native y Hermes", id: "react-native", use: "La app de la víctima, en Android." },
          { name: "React", id: "react", use: "La consola de revisión y el portal de negocios." },
        ],
      },
    ],
    honestTitle: "Lo que no es de Meta, y lo que descartamos",
    honest: [
      "La huella de voz (ECAPA de SpeechBrain) y los vectores de texto (multilingual-e5-small) usan modelos abiertos de terceros, porque la Meta Model API no tiene un endpoint de embeddings.",
      "Evaluamos Muse Glimmer para armar la ficha en el celular, sin conexión. Es un modelo denso de 30B parámetros, unos 17 GB incluso a 4 bits: no cabe en un celular. La ficha se arma en el servidor, con consentimiento.",
    ],
  },
  commitments: {
    title: "Lo que Blindaje no hace",
    lead: "Estos límites son parte del diseño, no una nota al pie. Protegen a las víctimas y evitan errores graves.",
    items: [
      {
        title: "No decide nada sin una persona.",
        text: "Todo vínculo, alerta, consejo y expediente es un borrador hasta que alguien autorizado lo aprueba.",
      },
      {
        title: "No identifica personas.",
        text: "Vincula casos y señales. Nunca le pone nombre a una voz ni busca a nadie en internet: los agentes no tienen búsqueda web.",
      },
      { title: "No le muestra a una víctima datos de otras.", text: "Tampoco le avisa que su caso fue vinculado." },
      {
        title: "No aconseja pagar ni negociar.",
        text: "Ni a víctimas ni a negocios. Siempre deriva al 105, a la Línea 1818 y a la comisaría.",
      },
      {
        title: "No publica direcciones, viviendas ni cifras exactas.",
        text: "Solo distritos y rangos, como en el mapa de arriba.",
      },
      { title: "No usa datos reales en el demo.", text: "Casos, voces, números, cuentas y fotos son ficticios." },
      { title: "No tiene contenido político.", text: "" },
    ],
    honestyTitle: "Y te lo decimos claro",
    honesty:
      "El servidor procesa la evidencia para transcribirla y compararla, así que no es cifrado de extremo a extremo. Viaja cifrada, se guarda cifrada y solo la ven los roles autorizados, con un registro de auditoría encadenado.",
    legal: "Antes de un piloto con víctimas reales hace falta una revisión legal bajo la",
    legalLink: SOURCES.ley29733,
  },
  results: {
    title: "Lo que medimos, con datos ficticios",
    lead: "La evaluación usa guiones de amenaza escritos para el proyecto y voces de un corpus abierto de español de Perú (OpenSLR SLR73), comprimidas como en WhatsApp. Publicamos los resultados reales, sean los que sean.",
    placeholder: "Todavía no hay reporte de la evaluación.",
    pendingNote: "La evaluación todavía no ha publicado su reporte. Las metas son objetivos de trabajo, no resultados.",
    cols: { what: "Qué se mide", target: "Meta", result: "Resultado" },
    pending: "Pendiente",
    metrics: [
      { id: "voice_top1", label: "Vinculación por voz: el caso correcto aparece primero", target: "80% o más" },
      {
        id: "voice_top3",
        label: "Vinculación por voz: el caso correcto está entre los 3 primeros",
        target: "90% o más",
      },
      {
        id: "false_links_per_100",
        label: "Vínculos incorrectos por cada 100 comparaciones sobre el umbral de revisión",
        target: "2 como máximo",
      },
      { id: "identifier_match", label: "Coincidencias exactas de identificadores detectadas", target: "100%" },
      { id: "ficha_accuracy", label: "Campos de la ficha correctos frente a la etiqueta manual", target: "90% o más" },
      {
        id: "citation_fidelity",
        label: "Afirmaciones de los agentes con evidencia citada y verificable",
        target: "100%",
      },
      { id: "small_stats", label: "Estadísticas mostradas con menos de 5 casos", target: "0" },
      { id: "infiltrator", label: "Prueba del infiltrado: no recibe vínculos ni datos de otros casos", target: "Pasa" },
    ],
    generatedAt: "Reporte generado el",
    passed: "Pasa",
    failed: "No pasa",
    sample: "muestras",
    meets: "Cumple la meta",
    misses: "No cumple la meta",
    noTarget: "Sin meta",
    extraTitle: "Otros resultados, sin meta",
    fullReport: "Reporte completo de la evaluación",
    reportedNote:
      "Resultados reales de una corrida con datos ficticios. Las metas son objetivos de trabajo, no garantías.",
    leak: {
      title: "Rastreo de filtraciones",
      lead: "Copias marcadas que se atribuyeron a la cuenta correcta después de cada cambio, con medios ficticios y 50 destinatarios simulados.",
      rows: {
        "audio.whatsapp_opus_16k": "Audio reenviado por WhatsApp (Opus 16 kbps)",
        "imagen.whatsapp": "Imagen recomprimida por WhatsApp",
        "imagen.recorte_10_whatsapp": "Imagen recortada un 10 % y reenviada por WhatsApp",
        "imagen.captura_png": "Captura de pantalla de la imagen",
        "imagen.captura_whatsapp": "Captura de pantalla reenviada por WhatsApp",
        "audio.fragmento_6s_opus_16k": "Fragmento de audio de 6 s cortado en un punto cualquiera",
        "audio.opus_8k": "Audio comprimido a Opus 8 kbps (caso extremo)",
      },
      limitTag: "Límite conocido",
      falseLabel: "Medios sin marca atribuidos a una cuenta por error",
      falseValue: "{a} de {na} pruebas de audio y {i} de {ni} de imagen",
      source: "Resultados del rastreo (eval/results/watermark.json)",
    },
  },
  pilot: {
    title: "Solicita acceso para tu institución",
    lead: "Blindaje trabaja con instituciones que pueden actuar: comisarías, fiscalías, municipios y ONG. Gremios, iglesias y juntas vecinales pueden ayudar a difundir la app.",
    who: "La policía y la fiscalía reciben el expediente de cada red por un canal formal. Municipios y ONG usan el mapa y las alertas de sus distritos, que ya son públicos.",
    steps: [
      "Conversamos con tu institución.",
      "Hacemos la revisión legal antes de tratar datos reales.",
      "Empezamos en uno o dos distritos.",
    ],
    fields: {
      org: "Nombre de tu institución u organización",
      name: "Tu nombre",
      contact: "WhatsApp, celular o correo",
      contactHint: "Para responderte. No lo compartimos con nadie.",
      sector: "Tipo de institución",
      sectorNone: "Elige uno",
      sectors: [
        { value: "policia", label: "Policía" },
        { value: "fiscalia", label: "Fiscalía" },
        { value: "municipalidad", label: "Municipalidad" },
        { value: "ong", label: "ONG o atención a víctimas" },
        { value: "difusion", label: "Gremio, iglesia o junta (para difundir)" },
        { value: "otro", label: "Otro" },
      ],
      district: "Distrito o provincia",
      members: "Cuántas personas lo usarían",
      message: "¿Algo que debamos saber?",
      optional: "opcional",
      more: "Agregar detalles (opcional)",
    },
    errors: {
      org: "Escribe el nombre de tu institución (al menos 2 letras).",
      name: "Escribe tu nombre (al menos 2 letras).",
      contact: "Escribe un número de celular (6 dígitos o más) o un correo para responderte.",
      members: "Escribe solo un número, sin puntos ni comas.",
      summary: "Revisa los campos marcados.",
    },
    verifying: "Comprobación automática contra el spam",
    verifyingWait: "Se activa sola cuando empiezas a llenar el formulario.",
    captchaLoad: "No pudimos cargar la comprobación automática. Revisa tu conexión y recarga la página.",
    noscript: "Para enviar este formulario, activa JavaScript en tu navegador.",
    submit: "Enviar solicitud",
    sending: "Enviando…",
    successTitle: "Recibimos tu solicitud",
    success:
      "Te escribiremos al contacto que dejaste para conversar sobre tu institución y los siguientes pasos, empezando por la revisión legal. Gracias por sumarte.",
    fail: "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.",
    rateLimited: "Llegaron muchas solicitudes desde tu conexión. Espera unos minutos e inténtalo de nuevo.",
    captcha: "La comprobación automática todavía no termina. Espera unos segundos y vuelve a enviar.",
    unavailable: "El formulario no está disponible ahora. Inténtalo de nuevo en unos minutos.",
    privacy:
      "Usamos estos datos solo para responder tu solicitud. Este formulario no es para denunciar: si estás en peligro, llama al 105.",
  },
  helpSection: {
    title: "Si estás en peligro ahora, llama al 105",
    lines: [
      { number: "105", name: "Policía Nacional del Perú, emergencias", cta: "Llamar al 105" },
      { number: "1818", name: "Línea 1818, Central Única de Denuncias del Mininter", cta: "Llamar a la Línea 1818" },
    ],
    station: "También puedes denunciar en tu comisaría más cercana.",
    note: "No pagues ni negocies. Guarda los audios y los mensajes, y denuncia.",
  },
  footer: {
    hackathon:
      "Proyecto para el Meta Global AI Developer Hackathon, construido del 26 de octubre al 4 de noviembre de 2026.",
    repo: "Código en GitHub",
    fictitious: "Los datos del demo y de la evaluación son ficticios. Nada de esta página viene de víctimas reales.",
    license: "Código abierto bajo licencia Apache-2.0.",
    shots: "Las capturas son de la consola y del portal público de Blindaje en modo simulado.",
  },
  notFound: {
    title: "Esta página no existe",
    text: "Puede que el enlace esté mal escrito.",
    home: "Volver al inicio",
  },
  lp: {
    hero: {
      title: "Nadie debería enfrentar la extorsión solo",
      lead: "Blindaje junta lo que guardan las víctimas (audios, fotos, mensajes, números y cuentas) para descubrir a la misma banda detrás de casos distintos y mostrar en qué distritos pasa. Una persona revisa cada vínculo.",
      ctaMap: "Ver el mapa por distrito",
      ctaMapShort: "Ver el mapa",
      audienceLabel: "Para",
      audience: ["bodegueras", "mototaxistas", "puestos de mercado", "transportistas"],
      photoAlt: "Mototaxis amarillos, azules y rojos esperando pasajeros en una calle peatonal del centro de Lima.",
      photoCredit: "Foto ilustrativa: Paulo Guereta, CC BY 2.0. No muestra víctimas.",
      phoneAlt:
        "Captura del portal público en un celular: en Ate, el riesgo para bodegas es alto, entre 10 y 19 casos.",
      phoneCap: "El portal público, sin cuenta. Datos ficticios.",
    },
    built: {
      label: "Hecho con Meta AI",
      items: [
        "Muse Spark",
        "Muse Voice Transcribe",
        "SAM 3.1",
        "AudioSeal",
        "Video Seal",
        "DINOv2",
        "FAISS",
        "PyTorch",
        "React Native",
      ],
    },
    problem: { gapsTitle: "Por qué no alcanza hoy" },
    benefits: {
      title: "Lo que gana cada uno",
      lead: "La víctima documenta sin exponerse, la comunidad sabe dónde pasa y qué hacer, y la autoridad recibe casos ya vinculados.",
      illustration:
        "Capturas reales de la app en un emulador Android, con datos ficticios. Por fuera, un cuaderno de ventas que funciona; por dentro, cada nota dice qué la revisó y con qué modelo. El disfraz lo eliges tú: también puede ser una lista de compras o una calculadora de vueltos.",
      victimPhotoAlt:
        "Interior de una bodega de Lima: estantes con productos, cajas rojas de cerveza apiladas y dos personas de espaldas en el mostrador.",
      victimPhotoCredit: "Foto ilustrativa: cemeiakano, CC BY-SA 2.0. No muestra víctimas.",
      audiences: [
        {
          id: "victim",
          name: "Víctimas",
          title: "Reportan directo, sin que nadie lo note",
          points: [
            "Instalan la app sin código ni pertenecer a un gremio. El disfraz lo eligen ellas.",
            "Entrada secreta, PIN señuelo, salir rápido y cero notificaciones.",
            "Audios, fotos y mensajes se suben cifrados y no quedan en la galería.",
            "La denuncia sale lista, con cronología y huella de integridad.",
          ],
        },
        {
          id: "community",
          name: "Comunidad y negocios",
          title: "Ven dónde pasa y saben qué hacer",
          points: [
            "Un mapa por distrito, público y sin cuenta.",
            "Alertas y consejos de prevención para su zona y su rubro, aprobados por una persona.",
          ],
        },
        {
          id: "authority",
          name: "Policía y fiscalía",
          title: "Reciben casos ya vinculados, con la evidencia citada",
          points: [
            "Expediente en PDF con la cronología de toda la red.",
            "Huella SHA-256 y cadena de custodia de cada archivo.",
            "En qué distritos opera la red y cuentas repetidas para pedirlas por canales legales.",
          ],
        },
      ],
    },
    where: {
      title: "Dónde pasa, distrito por distrito",
      lead: "Los casos se juntan por distrito, nunca por calle ni vivienda. El mapa es público y no necesita cuenta.",
      rules: [
        "Rangos, no cifras exactas: 5-9, 10-19, 20-49 o 50+.",
        "Nada donde haya menos de 5 casos de 3 víctimas: ese distrito se ve igual que uno sin casos.",
        "Sin totales que permitan restar y sin direcciones ni coordenadas.",
        "Más casos puede significar que ahí se denuncia más, no que sea más peligroso.",
      ],
      cta: "Abrir el mapa",
      label: "Mapa esquemático de los 50 distritos de Lima y Callao con datos ficticios",
      legend: { sin_datos: "Sin datos o pocos casos", bajo: "Bajo", medio: "Medio", alto: "Alto" },
      listToggle: "Ver los distritos en una lista",
      note: "Datos ficticios. Cada cuadro es un distrito en su posición aproximada.",
    },
    how: {
      title: "Del audio de WhatsApp al mapa del distrito",
      lead: "Así viaja una amenaza ficticia por Blindaje, del celular de la víctima al mapa del distrito, y así se comparan dos casos. Los modelos proponen y una persona decide.",
      flow: {
        railLabel: "Pasos del recorrido",
        scenes: [
          {
            label: "Recolecta",
            title: "La víctima guarda la evidencia sin que se note",
            text: "La víctima reenvía a la app los audios, fotos y mensajes que recibió. Por fuera la app es un cuaderno de ventas; lo que guarda se cifra en el celular y sube con una huella (SHA-256) que prueba que nadie lo cambió.",
            tags: ["AES-256-GCM", "SHA-256"],
          },
          {
            label: "Analiza",
            title: "Los modelos de Meta leen cada pieza",
            text: "Muse Voice Transcribe pasa el audio a texto y separa quién habla. SAM 3.1 encuentra la bala y la nota en la foto. Muse Spark 1.3 arma la ficha del caso: monto, plazo, forma de pago y grupo.",
            tags: ["Muse Voice Transcribe 1.0", "SAM 3.1", "Muse Spark 1.3"],
          },
          {
            label: "Señales",
            title: "Todo se vuelve señales que se pueden comparar",
            text: "Para comparar casos sin exponer a nadie, cada dato se vuelve una señal: la voz, en 192 números que describen cómo suena; teléfonos y cuentas, en un código cifrado (HMAC); el guion y la foto, en vectores. No se guarda ningún nombre.",
            tags: ["SpeechBrain ECAPA", "HMAC-SHA256", "multilingual-e5-small", "DINOv2"],
          },
          {
            label: "Compara",
            title: "Otro número, la misma voz",
            text: "Blindaje busca entre todos los casos las señales más parecidas. La voz de B se parece a la de A aunque llamó desde otro número, y el guion también coincide. Juntas dan 0.91 sobre 1: el vínculo queda como probable.",
            tags: ["FAISS", "Calibración de la evaluación"],
          },
          {
            label: "Revisa",
            title: "Ningún vínculo existe hasta que una persona lo confirma",
            text: "Un posible vínculo no cuenta hasta que una persona del equipo lo revisa. El Vinculador le muestra en qué se parecen los casos y en qué no, con cada evidencia citada; ella confirma o descarta, y la decisión queda registrada.",
            tags: ["Vinculador con Muse Spark 1.3", "Revisión humana"],
          },
          {
            label: "Muestra",
            title: "Los vínculos arman la red y el mapa dice dónde",
            text: "B y C además pagan a la misma cuenta, así que los tres casos forman una red. El mapa público muestra dónde pasa, por distrito y en rangos, nunca direcciones; las alertas salen solo cuando una persona las aprueba.",
            tags: ["Cartógrafo", "Vigía", "Mapa por distrito"],
          },
        ],
        s1: { chips: ["Audio de WhatsApp", "Foto", "Mensaje"], seal: "Cifrado en el celular" },
        s2: {
          transcript: "Son dos mil soles. Te vamos a mandar el número para que yapees.",
          highlight: "dos mil soles",
          bullet: "bala",
          note: "nota escrita a mano",
          fields: [
            { k: "Monto", v: "S/ 2,000" },
            { k: "Plazo", v: "48 horas" },
            { k: "Canal", v: "Yape" },
            { k: "Grupo", v: "«Los X»" },
          ],
        },
        s3: {
          rows: [
            { name: "Voz", raw: "Audio de 24 s", out: "V-7" },
            { name: "Número", raw: "Yape 900 000 488", out: "…488" },
            { name: "Guion", raw: "«habla con el jefe»", out: "e5" },
            { name: "Foto", raw: "Recorte: bala", out: "IMG-1" },
          ],
        },
        s4: {
          caseA: "Caso A",
          whereA: "Bodega, San Juan de Lurigancho",
          caseB: "Caso B",
          whereB: "Mototaxi, Comas",
          index: "Índice de voces",
          voice: "Voz",
          phone: "Teléfono",
          script: "Guion",
          photo: "Foto",
          voiceMatch: "voz parecida (0.79) → 0.85",
          scriptMatch: "mismo guion, canal y grupo → 0.40",
          phoneMismatch: "distintos",
          review: "Revisar",
          probable: "Probable",
        },
        s5: {
          title: "Caso A y Caso B",
          status: "Probable 0.91",
          explain: "La voz de EV-B1 se parece a la de EV-A1 y EV-A2 en 4 de 5 segmentos. Los teléfonos son distintos.",
          confirm: "Confirmar vínculo",
          dismiss: "Descartar",
          confirmed: "Confirmado por una revisora",
          audit: "Auditoría encadenada",
        },
        s6: {
          network: "Red R-001",
          sameVoice: "misma voz",
          sameAccount: "Yape …488",
          below: "Comas: menos de 5 casos, no se publica",
          alertTitle: "Alerta aprobada",
          alert: "San Juan de Lurigancho: audios que dicen ser de «Los X». No pagues: denuncia en la Línea 1818.",
        },
        note: "Datos ficticios del demo. Las cifras son las del motor de vinculación con la calibración de la evaluación.",
      },
    },
    tour: {
      title: "Después del vínculo",
      lead: "Lo que hace el equipo con los casos ya vinculados. Capturas reales de la consola, con datos ficticios.",
      tabsLabel: "Funciones de Blindaje",
      items: [
        {
          tab: "Mapea la red",
          title: "Mapea la red detrás de los casos",
          text: "Con varios vínculos confirmados, los casos forman una red. El Cartógrafo (Muse Spark 1.3) la resume para el equipo: desde cuándo opera, cómo cobra, cómo escala y qué evidencia falta. Separa lo comprobado de lo que es hipótesis; solo lo comprobado pasa al expediente.",
          shot: "consola-red-grafo",
          alt: "Captura de la consola: grafo de la red R-001, con tres casos unidos por la huella de voz V-3 y la cuenta Yape …488.",
        },
        {
          tab: "Aconseja",
          title: "Aconseja a los negocios cómo prevenir",
          text: "Con datos de toda una zona y un rubro, el Asesor (Muse Spark 1.3) redacta consejos de prevención para los negocios. Un validador revisa que cada frase cite evidencia, que no aparezcan números ni cuentas y que nunca diga que paguen; después, una persona lo aprueba.",
          shot: "consola-recomendaciones-asesor",
          alt: "Captura de la consola: consejo del Asesor para mototaxis de Ate, en borrador. El validador encontró una afirmación sin cita y una cita que no existe.",
        },
        {
          tab: "Expediente",
          title: "Arma el expediente para la fiscalía",
          text: "Cuando un analista aprueba una red, el Redactor arma el PDF para la fiscalía: la cronología de todos los casos, cada vínculo con su evidencia y la huella SHA-256 de cada archivo, que prueba que nadie lo cambió. Sale solo por un canal formal.",
          shot: "consola-perfil-cartografo",
          alt: "Captura de la consola: perfil de la red R-001, con hechos citados a la izquierda e hipótesis por aprobar a la derecha.",
        },
        {
          tab: "Autenticidad",
          title: "Revisa si la evidencia es real",
          text: "Una voz o una foto se pueden fabricar con IA. Blindaje busca marcas de agua (AudioSeal, Video Seal), credenciales de contenido (C2PA) y metadatos, y Muse Spark revisa el audio o la imagen. Son indicios para la revisora: solo se afirma que algo es IA si una marca lo prueba.",
          shot: "consola-autenticidad-evidencia",
          alt: "Captura de la consola: el audio EV-C2 tiene indicios fuertes de IA; sin marca de AudioSeal, sin C2PA, y una entonación uniforme y sin respiración.",
        },
        {
          tab: "Filtraciones",
          title: "Rastrea quién filtró una copia",
          text: "Cada audio o foto que se abre en la consola sale con una marca invisible de la cuenta que lo pidió (AudioSeal y Video Seal). Si una copia aparece afuera, aunque la reenvíen por WhatsApp, la administración sabe de qué cuenta salió.",
          shot: "consola-rastreo-filtracion",
          alt: "Captura de la consola: la marca de Video Seal de una foto reenviada por WhatsApp coincide con la copia que recibió la Revisora Demo, con el 98 % de los bits.",
        },
      ],
    },
    tech: {
      tabsLabel: "Tecnología de Blindaje",
      tabs: ["Meta Model API", "Modelos abiertos de Meta", "Seis agentes"],
      apiLabel: "Meta Model API",
      openLabel: "Modelos y librerías abiertas de Meta",
      agentsTitle: "Seis agentes, y siempre una persona que aprueba",
      agentsLead:
        "Corren con Muse Spark 1.3 por la Responses API, con salida JSON de esquema estricto. Toda afirmación cita evidencia: sin cita, la salida no vale.",
    },
    photos: {
      title: "Otro ángulo, la misma colcha",
      lead: "Las bandas mandan fotos para asustar, y dos fotos del mismo cuarto casi nunca salen iguales: cambian el ángulo, la luz y el encuadre. Así se ven por dentro, parche por parche, y esto es lo que dice Muse Spark al mirarlas. Fotos ficticias, generadas con Muse Image.",
      pairsLabel: "Qué par de fotos comparar",
      pairs: ["Misma colcha, otro ángulo", "Otra colcha, mismos objetos", "La misma foto, reenviada"],
      photoA: "Foto del caso A",
      photoB: ["Foto del caso B", "Foto del caso C", "La foto del caso A, recortada y recomprimida"],
      alt: [
        "Foto ficticia vista desde arriba: una colcha fucsia con rosas blancas y flecos, tres balas y una hoja que dice PAGA O YA SABES.",
        "Foto ficticia en diagonal: la misma colcha fucsia con rosas blancas y flecos sobre una cama de madera, la pared celeste despintada, un foco y la nota.",
        "Foto ficticia vista desde arriba: una colcha azul a cuadros, tres balas y una hoja que dice PAGA O YA SABES.",
        "La primera foto otra vez, recortada en los bordes y con menos calidad, como queda al reenviarla.",
      ],
      stepsLabel: "Pasos de la comparación",
      steps: [
        {
          title: "La foto en parches",
          text: "DINOv2, el modelo de imagen del sistema, corta cada foto en una cuadrícula de 24 × 16: {total} parches.",
        },
        {
          title: "Cada parche, 384 números",
          text: "DINOv2 describe cada parche con 384 números; aquí van resumidos en un color. Mismo color, parche parecido, aunque cambie el ángulo.",
        },
        {
          title: "Cada parche busca pareja",
          text: "Si en la otra foto hay un parche parecido ({umbral} o más), se enciende; si no, se apaga.",
        },
        {
          title: "Las mejores parejas",
          text: "Una línea une los parches que se eligen el uno al otro como el más parecido.",
        },
        {
          title: "Lo que ve Muse Spark",
          text: "Mira las dos fotos enteras, nombra los detalles que no cambian con el ángulo y dice si parece el mismo lugar.",
        },
      ],
      count: "{n} de {total} con pareja",
      stats: {
        whole: "Foto entera, DINOv2",
        hash: "Hash perceptual",
        hashBits: "{n} de 64 bits distintos",
        partners: "Parches con pareja",
        partnersOf: "{n} de {total}",
        system: "Hoy el sistema",
        joins: "Las une ({p})",
        notJoins: "No las une ({p})",
      },
      vlm: "Muse Spark",
      verdicts: {
        probable: "Mismo lugar: probable",
        posible: "Mismo lugar: posible",
        poco_probable: "Mismo lugar: poco probable",
      },
      common: "En común",
      differences: "Diferencias",
      noVlm: "Es la misma foto: el sistema la reconoce por el hash, sin preguntarle a Muse Spark.",
      explain: [
        "Como fotos enteras se parecen poco ({cos}) y el hash cambia {ham} bits, así que hoy el sistema no las une. Parche por parche, {n} de {total} encuentran pareja: las rosas, los flecos y la hoja se encienden en las dos. Muse Spark llega a lo mismo.",
        "La misma nota, pero otra colcha. Solo {n} de {total} parches encuentran pareja: la hoja, el foco y algo del tejido. Las rosas y los flecos se apagan, y Muse Spark dice poco probable.",
        "Es la misma foto, recortada y recomprimida: el hash cambia apenas {ham} bits y {n} de {total} parches encuentran pareja. El sistema ya la une ({p}).",
      ],
      hover: "Pasa el puntero o toca un parche para ver su pareja en la otra foto.",
      replay: "Ver de nuevo",
      note: "Hoy el sistema compara la foto entera (DINOv2 y hash perceptual) y reconoce la misma foto reenviada o recortada. Comparar parche por parche y preguntarle a Muse Spark por los detalles en común es un experimento de la evaluación: todavía no une casos, y una persona revisaría cada pista.",
      source:
        "Fotos ficticias de Muse Image. Parches de DINOv2 ViT-S/14 (24 × 16); los colores son las tres primeras componentes principales de sus vectores; las líneas dejan fuera el borde de la foto. Muse Spark 1.3 con salida JSON. Cifras: eval/results/fotos_huella.json y fotos_vlm.json.",
    },
    voice: {
      title: "Aunque disfracen la voz, queda huella",
      lead: "Un cambiador de voz basta para que la huella no reconozca a la misma persona. Aquí se ve por qué, píxel por píxel, con una voz ficticia. Abajo, lo medido con {speakers} voces reales de español de Perú (SLR73) enviadas por WhatsApp.",
      stepsLabel: "La voz disfrazada, paso a paso",
      steps: [
        {
          title: "La voz en píxeles",
          text: "Los primeros 7 segundos de la nota del caso B. Cada columna es un instante y cada fila un tono, de grave (abajo) a agudo; lo claro es energía. Las rayas curvas son los armónicos de la voz.",
        },
        {
          title: "La huella: 192 números",
          text: "ECAPA resume la nota entera en 192 números. Se multiplican casilla por casilla con la huella guardada del caso A y se suman: parecido {demoClean} sobre 1. Si la nota se parece, repite el degradado de la guardada.",
        },
        {
          title: "El disfraz, +{semitones} semitonos",
          text: "Una app sube el tono. En esta escala, toda la imagen sube: la voz pasa de {hzClean} a {hzDisguised} Hz. Para ECAPA ya es otra persona: el degradado se pierde y el parecido cae a {demoDisguised}.",
        },
        {
          title: "El barrido, de {sweepMin} a +{sweepMax}",
          text: "Blindaje baja y sube el tono de a un semitono y se queda con la versión más parecida a alguna huella guardada. Gana {bestK}, con {demoBest}; el disfraz exacto era {exactK} ({demoExact}).",
        },
        {
          title: "Lo que queda",
          text: "La voz vuelve a parecerse, pero queda bajo el umbral de revisión ({threshold}). Es una pista para una persona del equipo, no un vínculo.",
        },
      ],
      canvas: {
        spectrogram: "Nota del caso B",
        versions: ["limpia", "disfrazada +4", "revertida −4"],
        shifted: "disfrazada, movida {k}",
        stored: "Guardada, caso A",
        note: "Esta nota",
        product: "Casilla por casilla",
        similarity: "Parecido",
        threshold: "umbral de revisión",
        sweep: "Barrido de tono, en semitonos",
        positive: "positivo, suma",
        negative: "negativo, resta",
      },
      listen: "Escuchar",
      versions: ["Limpia", "Disfrazada", "Revertida"],
      audioLabels: [
        "la voz original, 7 segundos",
        "la voz disfrazada con +4 semitonos, 7 segundos",
        "la voz disfrazada y revertida con −4, 7 segundos",
      ],
      hover: "Pasa el puntero o toca una barra del barrido para ver ese tono. Al escuchar, la línea sigue el audio.",
      replay: "Ver de nuevo",
      measured: {
        title: "Lo medido con {speakers} voces de SLR73",
        explain:
          "Cada cuadro compara las {speakers} notas de prueba (filas) con las {speakers} voces guardadas (columnas); cuanto más claro, más parecido. La diagonal es la misma persona. El punto marca la voz más parecida de cada fila: si cae en la diagonal, acierta.",
        figures: ["Limpia", "Disfrazada +4", "Revertida con el barrido"],
        top1: "Queda en primer lugar",
        similarity: "Parecido medio con su voz",
        falseLinks: "Falsos vínculos por cada 100",
      },
      note: "La reversión es un experimento de la evaluación: todavía no corre en el sistema. Devuelve a la persona correcta al primer lugar en el {top1Reverted} de los casos (sin revertir, {top1Disguised}) y no crea vínculos falsos, pero el parecido queda bajo el umbral de revisión: sirve como pista para una persona, no para unir casos sola. La voz sola nunca llega a «probable», ni siquiera sin disfraz.",
      source:
        "Audio del ejemplo: voz ficticia de MMS-TTS, disfrazada +4 y revertida −4 con el mismo método. Cifras: eval/results/voz_distorsion.json y voz_huella.json.",
    },
    trust: {
      title: "Lo que Blindaje no hace",
      lead: "Estos límites son parte del diseño, no una nota al pie. Protegen a las víctimas y evitan errores graves.",
    },
    menu: { label: "Menú", faq: "Preguntas" },
    results: {
      label: "Resultados medidos",
      highlights: [
        { id: "voice_top1", label: "de las veces, la voz encontró primero el caso correcto" },
        { id: "false_links_per_100", label: "vínculos incorrectos por cada 100 comparaciones" },
        { id: "ficha_accuracy", label: "de los campos de la ficha, correctos frente a la etiqueta manual" },
      ],
      leakId: "audio.whatsapp_opus_16k",
      leakLabel: "de los audios reenviados por WhatsApp, rastreados hasta su cuenta",
      target: "Meta",
      more: "Ver cada métrica y el rastreo de filtraciones",
    },
    faq: {
      title: "Preguntas frecuentes",
      lead: "Lo que suelen preguntar las instituciones y quienes difunden la app.",
      items: [
        {
          q: "¿La víctima necesita pertenecer a un gremio?",
          a: "No. Cualquier víctima instala la app y reporta. Gremios, iglesias, juntas o municipios pueden ayudar a difundirla, pero no revisan ni aprueban nada.",
        },
        {
          q: "¿Quién ve la evidencia de una víctima?",
          a: "Solo el equipo de análisis de Blindaje, según lo que la víctima permita. La evidencia viaja cifrada, se guarda cifrada y cada acceso queda en un registro de auditoría encadenado. Una víctima nunca ve datos de otros casos.",
        },
        {
          q: "¿Y si alguien revisa el celular de la víctima?",
          a: "Ve una app de ventas que funciona. Las notas privadas se abren con una entrada secreta y un PIN; un PIN señuelo abre notas vacías y creíbles, y un toque vuelve a la app de siempre. No hay notificaciones.",
        },
        {
          q: "¿Cómo se evitan los reportes falsos sin un gremio que verifique?",
          a: "Una persona del equipo revisa cada vínculo antes de que cuente, ninguna señal decide sola, hay un límite de registros por conexión y los dispositivos sospechosos se pueden marcar.",
        },
        {
          q: "¿Cómo se suma una institución?",
          a: "Conversamos, hacemos la revisión legal bajo la Ley 29733 antes de tratar datos reales y empezamos en uno o dos distritos.",
        },
      ],
    },
  },
  page: {
    problemTitle: ["Miles de denuncias", "que nadie conecta"],
    tech: {
      title: ["Hecho con Meta AI,", "pieza por pieza"],
      lead: "Qué modelo hace cada tarea y qué agentes los usan. Todos proponen; nada sale sin que una persona lo apruebe.",
      groups: [
        {
          kind: "Meta Model API",
          rows: [
            { name: "Muse Spark 1.3", use: "Ficha del caso y agentes" },
            { name: "Muse Spark 1.2", use: "Análisis forense de la voz" },
            { name: "Muse Voice Transcribe", use: "Transcribe por hablante" },
            { name: "SAM 3.1", use: "Balas, notas, placas; tapa rostros" },
            { name: "Muse Image 1.0", use: "Fotos ficticias del demo" },
            { name: "Muse Wonder 1.0", use: "Redes grandes, opcional" },
          ],
        },
        {
          kind: "Abiertos de Meta",
          rows: [
            { name: "AudioSeal", use: "Marcas de IA y rastreo de audio" },
            { name: "Video Seal", use: "Marcas de IA y rastreo de imagen" },
            { name: "DINOv2", use: "Imágenes reutilizadas" },
            { name: "FAISS", use: "Búsqueda de voz, texto e imagen" },
            { name: "PyTorch", use: "El contenedor de ML" },
            { name: "React Native", use: "La app de la víctima" },
            { name: "React", use: "Consola y portal" },
          ],
        },
      ],
      approves: "Aprueba",
      agents: [
        { name: "Vinculador", what: "Explica cada posible vínculo", approves: "Una revisora" },
        { name: "Cartógrafo", what: "Analiza una red", approves: "Un analista" },
        { name: "Vigía", what: "Redacta alertas por distrito", approves: "El equipo" },
        { name: "Redactor", what: "Arma el expediente", approves: "Un analista" },
        { name: "Asesor", what: "Escribe consejos por zona", approves: "El equipo" },
        { name: "Autenticidad", what: "Busca indicios de IA", approves: "La revisora" },
      ],
    },
    results: { title: "Lo que medimos" },
    pilot: {
      title: "Solicita acceso para tu institución",
      steps: [
        { lead: "Primero,", text: "conversamos con tu institución." },
        { lead: "Luego,", text: "hacemos la revisión legal antes de tratar datos reales." },
        { lead: "Al final,", text: "empezamos en uno o dos distritos." },
      ],
    },
    foot: {
      callLine: "Llama al 105",
      reportLine: "Para denunciar, Línea 1818",
      top: "Volver arriba",
      creditsLabel: "Fotos",
      place: "Lima, 2026",
      photosLabel: "Fotos de Wikimedia Commons",
      photos: [
        {
          what: "mototaxis en el centro de Lima",
          author: "Paulo Guereta",
          license: "CC BY 2.0",
          href: "https://commons.wikimedia.org/wiki/File:Lima_-_Per%C3%BA_(20529612568).jpg",
        },
        {
          what: "una bodega de Lima",
          author: "cemeiakano",
          license: "CC BY-SA 2.0",
          href: "https://commons.wikimedia.org/wiki/File:Lima2011_-_bodega.jpg",
        },
      ],
      photosNote: "Recortadas y reducidas para la web. Son ilustrativas: no muestran víctimas ni lugares de casos",
    },
  },
};
