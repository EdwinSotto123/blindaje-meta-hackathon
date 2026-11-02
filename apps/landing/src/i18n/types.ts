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
    hero: {
      /** Titular de la portada. */
      title: string;
      lead: string;
      /** Acción principal: el mapa público por distrito del portal (y su versión corta, en la cabecera). */
      ctaMap: string;
      ctaMapShort: string;
      /** A quién protege: "Para" y la lista. */
      audienceLabel: string;
      audience: string[];
      /** La foto de la calle: texto alternativo y crédito con licencia. */
      photoAlt: string;
      photoCredit: string;
      phoneAlt: string;
      phoneCap: string;
    };
    built: { label: string; items: string[] };
    /** Dónde pasa: el mapa esquemático de distritos y sus reglas públicas. */
    where: {
      title: string;
      lead: string;
      rules: string[];
      cta: string;
      label: string;
      legend: { sin_datos: string; bajo: string; medio: string; alto: string };
      note: string;
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
    how: {
      title: string;
      lead: string;
      /**
       * El recorrido animado (Flow.astro): seis escenas, del audio al distrito. Las cifras son las del
       * par A–B del demo en el motor de vinculación (eval/report.json, verificaciones a_demo_AB).
       */
      flow: {
        railLabel: string;
        scenes: { label: string; title: string; text: string; tags: string[] }[];
        s1: { chips: [string, string, string]; seal: string };
        s2: { transcript: string; highlight: string; bullet: string; note: string; fields: { k: string; v: string }[] };
        s3: { rows: { name: string; raw: string; out: string }[] };
        s4: {
          caseA: string;
          whereA: string;
          caseB: string;
          whereB: string;
          index: string;
          voice: string;
          phone: string;
          script: string;
          photo: string;
          voiceMatch: string;
          scriptMatch: string;
          phoneMismatch: string;
          review: string;
          probable: string;
        };
        s5: {
          title: string;
          status: string;
          explain: string;
          confirm: string;
          dismiss: string;
          confirmed: string;
          audit: string;
        };
        s6: {
          network: string;
          sameVoice: string;
          sameAccount: string;
          below: string;
          alertTitle: string;
          alert: string;
        };
        note: string;
      };
    };
    tour: {
      title: string;
      lead: string;
      tabsLabel: string;
      items: {
        tab: string;
        title: string;
        note: string;
        text: string;
        shot: ProductShot;
        alt: string;
        caption: string;
        /** Nota a mano sobre la captura (solo en pantallas anchas); decorativa. */
        pen?: string;
      }[];
    };
    tech: {
      apiLabel: string;
      openLabel: string;
      agentsTitle: string;
      agentsLead: string;
    };
    /**
     * Una voz disfrazada y su huella: animación paso a paso (la voz, disfrazada, revertida, huella e ID)
     * con cifras de eval/results/voz_distorsion.json. Las llaves entre llaves se llenan en el build.
     */
    voice: {
      title: string;
      lead: string;
      steps: { label: string; title: string; text: string }[];
      listen: string;
      /** Nombre accesible de cada audio: original, disfrazada y revertida. */
      audioLabels: [string, string, string];
      similarity: string;
      /** Rótulo del tono medido (F0) de cada versión. */
      pitch: string;
      replay: string;
      chart: {
        caption: string;
        rows: [string, string, string];
        similarity: string;
        top1: string;
        falseLinks: string;
        threshold: string;
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
