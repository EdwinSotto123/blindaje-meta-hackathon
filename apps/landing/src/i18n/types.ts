import type { ProductShot } from "../lib/screenshots";

export type Lang = "es" | "en";

/** Una frase que abre con una entrada en negrita ("Por fuera,") y sigue en tinta suave. */
export interface RunIn {
  lead: string;
  text: string;
}

export interface Source {
  name: string;
  url: string;
}

export interface Figure {
  /** La cifra tal como aparece en la fuente. */
  value: string;
  text: string;
  detail?: string;
  source: Source;
}

export interface Row {
  title: string;
  text: string;
}

export interface MetricCopy {
  id: string;
  label: string;
  target: string;
}

/** Texto alternativo y pie de una captura real de la consola o del portal. */
export interface ShotCopy {
  alt: string;
  caption: string;
  /** Pie del recorte que se ve en el celular, si muestra solo un detalle. */
  mobileCaption?: string;
}

export interface Dict {
  lang: Lang;
  htmlLang: string;
  meta: { title: string; description: string; ogLocale: string };
  skip: string;
  help: {
    danger: string;
    dangerCta: string;
    report: string;
    reportCta: string;
    ariaLabel: string;
    exit: string;
    exitShort: string;
    exitHint: string;
  };
  nav: {
    ariaLabel: string;
    benefits: string;
    map: string;
    product: string;
    how: string;
    intelligence: string;
    tech: string;
    results: string;
    pilot: string;
    switchLabel: string;
    switchName: string;
    switchShort: string;
    switchHref: string;
    switchLang: Lang;
  };
  hero: {
    ctaPilot: string;
    ctaHow: string;
  };
  problem: {
    title: string;
    lead: string;
    figures: Figure[];
    sourcePrefix: string;
    gapTitle: string;
    gapSource: Source;
    gaps: Row[];
  };
  actors: {
    title: string;
    lead: string;
    victim: {
      name: string;
      title: string;
      lead: string;
      points: Row[];
      illo: {
        label: string;
        outside: string;
        inside: string;
        key: string;
        note: string;
      };
      shotOutsideAlt: string;
      shotInsideAlt: string;
      cloud: string;
    };
    community: {
      name: string;
      title: string;
      lead: string;
      points: Row[];
      consent: { title: string; tag: string; text: string }[];
      shot: ShotCopy;
    };
    authority: {
      name: string;
      title: string;
      lead: string;
      dossier: Row[];
      channel: string;
      shot: ShotCopy;
    };
  };
  tech: {
    title: string;
    lead: string;
    groups: { title: string; rows: { name: string; id: string; use: string }[] }[];
    honestTitle: string;
    honest: string[];
  };
  commitments: {
    title: string;
    lead: string;
    items: Row[];
    honestyTitle: string;
    honesty: string;
    legal: string;
    legalLink: Source;
  };
  results: {
    title: string;
    lead: string;
    placeholder: string;
    pendingNote: string;
    cols: { what: string; target: string; result: string };
    pending: string;
    metrics: MetricCopy[];
    generatedAt: string;
    passed: string;
    failed: string;
    sample: string;
    meets: string;
    misses: string;
    noTarget: string;
    extraTitle: string;
    fullReport: string;
    reportedNote: string;
    leak: {
      title: string;
      lead: string;
      rows: Record<string, string>;
      limitTag: string;
      falseLabel: string;
      /** "{a} de {na} pruebas de audio y {i} de {ni} de imagen". */
      falseValue: string;
      source: string;
    };
  };
  pilot: {
    title: string;
    lead: string;
    who: string;
    steps: string[];
    fields: {
      org: string;
      name: string;
      contact: string;
      contactHint: string;
      sector: string;
      sectorNone: string;
      sectors: { value: string; label: string }[];
      district: string;
      members: string;
      message: string;
      optional: string;
      more: string;
    };
    errors: { org: string; name: string; contact: string; members: string; summary: string };
    verifying: string;
    verifyingWait: string;
    captchaLoad: string;
    noscript: string;
    submit: string;
    sending: string;
    success: string;
    successTitle: string;
    fail: string;
    rateLimited: string;
    captcha: string;
    unavailable: string;
    privacy: string;
  };
  helpSection: {
    title: string;
    lines: { number: string; name: string; cta: string }[];
    station: string;
    note: string;
  };
  footer: {
    hackathon: string;
    repo: string;
    fictitious: string;
    license: string;
    shots: string;
  };
  notFound: { title: string; text: string; home: string };
  /** La landing de producto: portada, beneficios por actor, pasos, recorrido y Meta AI. */
  lp: {
    /** El texto corto del botón del mapa en la cabecera. */
    hero: { ctaMapShort: string };
    /** El pitch: escenas a pantalla entera que avanzan con el scroll (Pitch.astro). */
    pitch: {
      railLabel: string;
      hint: string;
      scenes: { kicker: string; title: string; text: string; tags?: string[] }[];
      /** Los audios del pitch: el rótulo del botón y lo que sigue en su nombre accesible. */
      audio: {
        group: string;
        clean: string;
        cleanName: string;
        disguised: string;
        disguisedName: string;
        reverted: string;
        revertedName: string;
      };
      ctaMap: string;
      ctaPilot: string;
      source: string;
      /** Rótulos que se dibujan en el lienzo. */
      canvas: {
        reports: string;
        latam: string;
        peru: string;
        reportsPeru: string;
        fiscalTitle: string;
        perDot: string;
        todayLima: string;
        /** País, canales de pago, longitud y latitud del rótulo. */
        payments: [string, string, number, number][];
        file: string;
        fileText: string;
        anyPolice: string;
        oneReport: string;
        ears: string;
        eyes: string;
        reads: string;
        otherNumber: string;
        caseLabel: string;
        sectors: [string, string, string];
        zones: [string, string, string];
        audio: string;
        spectrogram: string;
        print: string;
        transcript: string;
        voiceA: string;
        voiceB: string;
        disguised: string;
        reverted: string;
        similarity: string;
        threshold: string;
        semitones: string;
        center: string;
        caseA: string;
        caseC: string;
        victim: string;
        slr: string;
        bullet: string;
        note: string;
        sameRoom: string;
        otherRoom: string;
        resent: string;
        patches: string;
        message: string;
        voiceNote: string;
        evidence: string;
        ficha: string;
        strict: string;
        fields: {
          threat: string;
          amount: string;
          deadline: string;
          channel: string;
          payment: string;
          contact: string;
          group: string;
          phrases: string;
          sources: string;
        };
        threats: Record<string, string>;
        periods: Record<string, string>;
        otherFichas: string;
        legend: { monto: string; plazo: string; cuenta: string; grupo: string; frase: string };
        normalized: string;
        hmac: string;
        stored: string;
        demoKey: string;
        distinctContacts: string;
        sameAccountCases: string;
        phrasesTitle: string;
        inCases: string;
        summaryVector: string;
        avgCosine: string;
        terms: { cosine: string; phrases: string; channel: string; group: string; result: string };
        sameScript: string;
        otherPairs: string;
        cap: string;
        signals: { voice: string; script: string; account: string; together: string };
        review: string;
        probable: string;
        /** Un par de casos, con {a} y {b}. */
        pair: string;
        daysAgo: string;
        today: string;
        rule: string;
        pattern: string;
        counter: string;
        draft: string;
        approved: string;
        sameVoice: string;
        sameAccount: string;
        network: string;
        confirmed: string;
        scriptOnly: string;
        alertTitle: string;
        alert: string;
        underFive: string;
        range: string;
      };
    };
    /** Dónde pasa: el mapa esquemático de distritos y sus reglas públicas. */
    where: {
      title: string;
      lead: string;
      rules: string[];
      cta: string;
      label: string;
      legend: { sin_datos: string; bajo: string; medio: string; alto: string };
      /** Rótulo del desplegable con la lista de distritos (la misma información del mapa). */
      listToggle: string;
      note: string;
      /** La animación del mapa: cuatro pasos (en orden con las reglas) y volver a verla. */
      anim: { steps: [string, string, string, string]; replay: string };
    };
    problem: { gapsTitle: string };
    benefits: {
      title: string;
      lead: string;
      illustration: string;
      /** La foto de una bodega de Lima en la fila de las víctimas: texto alternativo y crédito. */
      victimPhotoAlt: string;
      victimPhotoCredit: string;
      audiences: {
        id: "victim" | "community" | "authority";
        name: string;
        title: string;
        points: string[];
      }[];
    };
    tour: {
      title: string;
      lead: string;
      tabsLabel: string;
      items: {
        tab: string;
        title: string;
        text: string;
        shot: ProductShot;
        alt: string;
      }[];
    };
    tech: {
      /** Las tres pestañas de Hecho con Meta AI: API, modelos abiertos y agentes. */
      tabsLabel: string;
      tabs: [string, string, string];
      apiLabel: string;
      openLabel: string;
      agentsTitle: string;
      agentsLead: string;
    };
    /**
     * Otro ángulo, la misma colcha (Fotos.astro): parches de DINOv2 y Muse Spark sobre fotos ficticias,
     * con cifras de apps/landing/src/data/fotos-demo.json. Las llaves entre llaves se llenan en el build.
     */
    photos: {
      title: string;
      lead: string;
      pairsLabel: string;
      pairs: [string, string, string];
      photoA: string;
      photoB: [string, string, string];
      /** Texto alternativo: la foto A y las tres B, en el orden de los pares. */
      alt: [string, string, string, string];
      stepsLabel: string;
      steps: { title: string; text: string }[];
      count: string;
      stats: {
        whole: string;
        hash: string;
        hashBits: string;
        partners: string;
        partnersOf: string;
        system: string;
        joins: string;
        notJoins: string;
      };
      vlm: string;
      verdicts: { probable: string; posible: string; poco_probable: string };
      common: string;
      differences: string;
      noVlm: string;
      explain: [string, string, string];
      hover: string;
      replay: string;
      note: string;
      source: string;
    };
    /**
     * Una voz disfrazada y su huella: animación paso a paso (la voz, disfrazada, revertida, huella e ID)
     * con cifras de eval/results/voz_distorsion.json. Las llaves entre llaves se llenan en el build.
     */
    voice: {
      title: string;
      lead: string;
      /** Nombre de la lista de pasos de la animación. */
      stepsLabel: string;
      /** Cinco pasos: la voz en píxeles, la huella, el disfraz, el barrido y lo que queda. */
      steps: { title: string; text: string }[];
      /** Rótulos que se dibujan en el lienzo (no los lee un lector de pantalla: el texto está en los pasos). */
      canvas: {
        spectrogram: string;
        versions: [string, string, string];
        shifted: string;
        stored: string;
        note: string;
        product: string;
        similarity: string;
        threshold: string;
        sweep: string;
        /** Leyenda de colores: positivo (suma) y negativo (resta). */
        positive: string;
        negative: string;
      };
      listen: string;
      /** Rótulo visible de cada audio: limpia, disfrazada y revertida. */
      versions: [string, string, string];
      /** Lo que sigue al rótulo en el nombre accesible de cada audio (solo para lectores de pantalla). */
      audioLabels: [string, string, string];
      hover: string;
      replay: string;
      measured: {
        title: string;
        explain: string;
        figures: [string, string, string];
        top1: string;
        similarity: string;
        falseLinks: string;
      };
      note: string;
      source: string;
    };
    trust: { title: string; lead: string };
    /** Menú de secciones en celular y tableta. */
    menu: { label: string; faq: string };
    /** Cuatro resultados medidos, arriba de las tablas. */
    results: {
      label: string;
      highlights: { id: string; label: string }[];
      leakId: string;
      leakLabel: string;
      target: string;
      more: string;
    };
    faq: { title: string; lead: string; items: { q: string; a: string }[] };
  };
  /** Texto propio del diseño "informe impreso": titulares cortos, entradas, filas y pies de foto. */
  page: {
    problemTitle: [string, string];
    tech: {
      title: [string, string];
      lead: string;
      groups: { kind: string; rows: { name: string; use: string }[] }[];
      approves: string;
      agents: { name: string; what: string; approves: string }[];
    };
    results: { title: string };
    pilot: { title: string; steps: RunIn[] };
    foot: {
      callLine: string;
      reportLine: string;
      top: string;
      creditsLabel: string;
      place: string;
      /** Crédito de cada foto de la página (autor, licencia y enlace al original). */
      photosLabel: string;
      photos: { what: string; author: string; license: string; href: string }[];
      photosNote: string;
    };
  };
}
