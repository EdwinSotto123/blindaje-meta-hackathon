import type { Dict } from "./types";
import { SOURCES } from "./sources";

const src = {
  exitosa: { ...SOURCES.exitosa, name: "Exitosa, with Public Ministry data (in Spanish)" },
  larepublica: { ...SOURCES.larepublica, name: "La República, editorial of June 22, 2026 (in Spanish)" },
  americatv: { ...SOURCES.americatv, name: "América TV (in Spanish)" },
  elcomercio: { ...SOURCES.elcomercio, name: "El Comercio (in Spanish)" },
  ley29733: { ...SOURCES.ley29733, name: "Law 29733 on Personal Data Protection (in Spanish)" },
};

export const en: Dict = {
  lang: "en",
  htmlLang: "en",
  meta: {
    title: "Blindaje: community intelligence against extortion",
    description:
      "Blindaje collects the evidence extortion victims keep, turns it into intelligence and shows which districts it happens in, never which home. A person reviews every link.",
    ogLocale: "en_US",
  },
  skip: "Skip to content",
  help: {
    ariaLabel: "Immediate help in Peru",
    danger: "In danger right now?",
    dangerCta: "Call 105",
    report: "To report extortion:",
    reportCta: "Línea 1818",
    exit: "Quick exit",
    exitShort: "Exit",
    exitHint: "Opens a neutral page. Shortcut: press Esc twice.",
  },
  nav: {
    ariaLabel: "Sections",
    benefits: "Benefits",
    map: "Map",
    product: "Product",
    how: "How it works",
    intelligence: "Intelligence",
    tech: "Meta AI",
    results: "Results",
    pilot: "Request access",
    switchLabel: "Leer en español",
    switchName: "Español",
    switchShort: "ES",
    switchHref: "/",
    switchLang: "es",
  },
  hero: {
    ctaPilot: "Request access",
    ctaHow: "See how it works",
  },
  problem: {
    title: "Thousands of reports no one connects",
    lead: "Gangs work in series: the same voice calls several victims, they send the same photos, repeat the same script and the same account collects from different vendors. That information exists, but it is scattered across the phones of people who never meet.",
    sourcePrefix: "Source:",
    figures: [
      {
        value: "13,892",
        text: "extortion reports were filed with Peru’s Public Ministry between January and July 2026.",
        detail:
          "Prosecution districts with the most cases: Lima Este (1,806), La Libertad (1,625), Lima Sur (1,346), Lima Norte (1,305) and Lima Centro (1,178).",
        source: src.exitosa,
      },
      {
        value: "27,000",
        text: "extortion reports or more closed out 2025, according to Public Prosecutor data.",
        source: src.larepublica,
      },
      {
        value: "80",
        text: "percent of public transport companies admitted to paying monthly protection fees to criminal gangs.",
        detail: "At least 69 drivers were killed on the job in 2025, with extortion as the main motive.",
        source: src.larepublica,
      },
      {
        value: "26,217",
        text: "extortion reports at the end of the period analyzed, up from 4,761, while sentenced prisoners fell from 712 to 650.",
        detail:
          "The outlet notes the figures alone do not explain the gap: more reports do not automatically mean more convictions.",
        source: src.elcomercio,
      },
    ],
    gapTitle: "And the numbers fall short: many victims never report, for fear of retaliation.",
    gapSource: src.americatv,
    gaps: [
      {
        title: "Weak evidence",
        text: "Untranscribed WhatsApp voice notes, undated screenshots, timelines rebuilt from memory.",
      },
      {
        title: "Disconnected cases",
        text: "No one compares the voice threatening a shopkeeper with the one threatening a mototaxi driver in another district.",
      },
      {
        title: "Fear of reporting",
        text: "Victims doubt reporting helps, fear the extortioner will find out and have no one they trust to turn to.",
      },
    ],
  },
  actors: {
    title: "Everyone gets something concrete.",
    lead: "Victims document without exposing themselves, the community knows where it happens and the authorities receive cases that are already linked.",
    victim: {
      name: "Victim",
      title: "Keep the evidence where no one will notice.",
      lead: "On the phone, Blindaje looks like an ordinary app for your business, and you choose which one. It really works. Your private notes open with a secret entry and your PIN.",
      points: [
        {
          title: "Decoy PIN and quick exit",
          text: "A decoy PIN opens empty, believable notes. One tap returns to the everyday app and locks it. Zero notifications.",
        },
        {
          title: "Everything uploads encrypted",
          text: "Record, take a photo or paste a WhatsApp voice note. It uploads encrypted as soon as you save it and stays out of your gallery.",
        },
        {
          title: "What we found",
          text: "Blindaje transcribes and highlights the facts: how much they demand, through which channel, the deadline and who they claim to be.",
        },
        {
          title: "Your police report, ready",
          text: "With a timeline and integrity fingerprints, ready to take to the police station.",
        },
      ],
      illo: {
        label: "The same app, outside and inside",
        outside: "Outside: a sales notebook that really works",
        inside: "Inside: how each note was checked",
        key: "Secret entry and PIN",
        note: "Illustration. You choose the disguise; this is one of them.",
      },
      shotOutsideAlt:
        "Screenshot of the app from the outside: the sales notebook, with the day’s sales and the credit owed",
      shotInsideAlt:
        "Screenshot of the app from the inside: how a voice note was checked, step by step, with Muse Voice Transcribe, SpeechBrain ECAPA, and AudioSeal, C2PA and Muse Spark 1.2",
      cloud:
        "Without a signal, the evidence waits encrypted on the phone and is deleted from it once the upload is confirmed. Only authorized people can see it.",
    },
    community: {
      name: "Community and businesses",
      title: "See where it happens and know what to do",
      lead: "With consent, each case is compared with the others. The team approves anonymous alerts by district and every business sees prevention advice for its area and trade.",
      points: [
        {
          title: "Aggregate figures only",
          text: "Nothing is shown with fewer than 5 cases from 3 different victims. There is no search for numbers or accounts.",
        },
      ],
      consent: [
        {
          title: "Only my report",
          tag: "The default",
          text: "Blindaje organizes your evidence and builds your report. Nothing leaves your case.",
        },
        {
          title: "Community mode",
          tag: "You turn it on",
          text: "Your pseudonymized signals are compared with other cases. You can withdraw whenever you want.",
        },
      ],
      shot: {
        alt: "Screenshot of the public portal on a phone: map of the districts of Lima and Callao with risk levels in ranges, no account.",
        caption: "The public portal on a phone, in Spanish, with no account. Simulated mode, fictitious data.",
      },
    },
    authority: {
      name: "Authorities",
      title: "Network case files for police and prosecutors.",
      lead: "When an authorized analyst approves a network, Blindaje assembles the case file as a PDF. It is only sent through a formal channel with the authorities.",
      dossier: [
        { title: "Network summary", text: "Size, period, sectors and shared modus operandi." },
        { title: "Unified timeline", text: "Events from every case, in order." },
        { title: "Explained links", text: "Each link with its score, its signals and the cited evidence." },
        { title: "SHA-256 fingerprints", text: "Every original file with its integrity fingerprint and UTC time." },
        { title: "Chain of custody", text: "Who uploaded what and when, in a hash-chained log." },
      ],
      channel:
        "Accounts that appear in several cases are flagged so the authorities can request them through legal channels. Blindaje shares no data with banks or fintechs.",
      shot: {
        alt: "Screenshot of the console: the Cartographer’s profile of network R-001, with cited facts on the left and hypotheses awaiting approval on the right.",
        caption:
          "The Cartographer keeps facts apart from hypotheses. Only what is approved goes into the case file. Console in Spanish, simulated mode, fictitious data.",
      },
    },
  },
  tech: {
    title: "Built with Meta AI, piece by piece",
    lead: "Evidence flows through a pipeline on Cloudflare and an ML container. Every piece is transcribed, segmented, summarized into a case record and turned into signals that can be compared.",
    groups: [
      {
        title: "Meta Model API",
        rows: [
          {
            name: "Muse Spark 1.3",
            id: "muse-spark-1.3",
            use: "Builds the case record with strict JSON schema output, drives the agents with tool calling over the Responses API and looks for manipulation in photos and videos.",
          },
          {
            name: "Muse Spark 1.2",
            id: "muse-spark-1.2",
            use: "Listens to audio directly for the forensic voice analysis, since 1.3 lacks full audio support.",
          },
          {
            name: "Muse Voice Transcribe 1.0",
            id: "muse-voice-transcribe-1.0",
            use: "Transcribes with speaker diarization, per-turn timestamps and a custom vocabulary: Yape, Plin, cupo, derecho de piso.",
          },
          {
            name: "SAM 3.1",
            id: "sam-3.1",
            use: "Finds bullets, handwritten notes and license plates in photos and video frames from text prompts, and masks bystanders’ faces.",
          },
          {
            name: "Muse Image 1.0",
            id: "muse-image-1.0",
            use: "Generated the fictitious photos for the demo and the evaluation. No photo is real.",
          },
          {
            name: "Muse Wonder 1.0",
            id: "muse-wonder-1.0",
            use: "Optional: the Cartographer uses it when a network is very large.",
          },
        ],
      },
      {
        title: "Meta open models and libraries",
        rows: [
          {
            name: "AudioSeal",
            id: "facebook/audioseal",
            use: "Detects AI watermarks in audio and, in reverse, marks every audio copy with the 16-bit tag of the account that plays it.",
          },
          {
            name: "Video Seal",
            id: "facebookresearch/videoseal",
            use: "Detects AI watermarks in photos and videos, and marks every image copy with a 256-bit message per delivery.",
          },
          {
            name: "DINOv2",
            id: "dinov2-small",
            use: "Turns each crop into a vector to find reused images even when they are not identical.",
          },
          { name: "FAISS", id: "faiss", use: "Three search indexes: voice, text and image." },
          { name: "PyTorch", id: "torch", use: "Runs the models in the ML container." },
          { name: "React Native and Hermes", id: "react-native", use: "The victim’s app, on Android." },
          { name: "React", id: "react", use: "The review console and the business portal." },
        ],
      },
    ],
    honestTitle: "What is not Meta, and what we ruled out",
    honest: [
      "Voiceprints (SpeechBrain ECAPA) and text vectors (multilingual-e5-small) use third-party open models, because the Meta Model API has no embeddings endpoint.",
      "We evaluated Muse Glimmer for building the case record on the phone, offline. It is a dense 30B-parameter model, about 17 GB even at 4 bits: it does not fit on a phone. The record is built on the server, with consent.",
    ],
  },
  commitments: {
    title: "What Blindaje does not do",
    lead: "These limits are part of the design, not a footnote. They protect victims and prevent serious mistakes.",
    items: [
      {
        title: "It decides nothing without a person.",
        text: "Every link, alert, piece of advice and case file is a draft until an authorized person approves it.",
      },
      {
        title: "It does not identify people.",
        text: "It links cases and signals. It never puts a name to a voice or searches for anyone online: the agents have no web search.",
      },
      { title: "It does not show a victim other victims’ data.", text: "Nor does it tell them their case was linked." },
      {
        title: "It never advises paying or negotiating.",
        text: "Not to victims, not to businesses. It always points to 105, Línea 1818 and the police station.",
      },
      {
        title: "It publishes no addresses, homes or exact counts.",
        text: "Only districts and ranges, as in the map above.",
      },
      {
        title: "It uses no real data in the demo.",
        text: "Cases, voices, numbers, accounts and photos are fictitious.",
      },
      { title: "It has no political content.", text: "" },
    ],
    honestyTitle: "And we say it plainly",
    honesty:
      "The server processes evidence to transcribe and compare it, so this is not end-to-end encryption. Evidence is encrypted in transit and at rest, and only authorized roles can see it, with a hash-chained audit log.",
    legal: "Before any pilot with real victims, a legal review is required under Peru’s",
    legalLink: src.ley29733,
  },
  results: {
    title: "What we measure, with fictitious data",
    lead: "The evaluation uses threat scripts written for the project and voices from an open corpus of Peruvian Spanish (OpenSLR SLR73), compressed the way WhatsApp does. We publish the real results, whatever they are.",
    placeholder: "The evaluation report is not available yet.",
    pendingNote: "The evaluation has not published its report yet. Targets are working goals, not results.",
    cols: { what: "What is measured", target: "Target", result: "Result" },
    pending: "Pending",
    metrics: [
      { id: "voice_top1", label: "Voice linking: the right case ranks first", target: "80% or more" },
      { id: "voice_top3", label: "Voice linking: the right case is in the top 3", target: "90% or more" },
      {
        id: "false_links_per_100",
        label: "Wrong links per 100 comparisons above the review threshold",
        target: "2 at most",
      },
      { id: "identifier_match", label: "Exact identifier matches detected", target: "100%" },
      { id: "ficha_accuracy", label: "Case record fields correct against manual labels", target: "90% or more" },
      { id: "citation_fidelity", label: "Agent claims with cited, verifiable evidence", target: "100%" },
      { id: "small_stats", label: "Statistics shown with fewer than 5 cases", target: "0" },
      { id: "infiltrator", label: "Infiltrator test: receives no links or other cases’ data", target: "Pass" },
    ],
    generatedAt: "Report generated on",
    passed: "Pass",
    failed: "Fail",
    sample: "samples",
    meets: "Meets the target",
    misses: "Misses the target",
    noTarget: "No target",
    extraTitle: "Other results, no target",
    fullReport: "Full evaluation report (in Spanish)",
    reportedNote: "Real results from a run on fictitious data. Targets are working goals, not guarantees.",
    leak: {
      title: "Leak tracing",
      lead: "Marked copies attributed to the right account after each change, with fictitious media and 50 simulated recipients.",
      rows: {
        "audio.whatsapp_opus_16k": "Audio forwarded on WhatsApp (Opus 16 kbps)",
        "imagen.whatsapp": "Image recompressed by WhatsApp",
        "imagen.recorte_10_whatsapp": "Image cropped by 10% and forwarded on WhatsApp",
        "imagen.captura_png": "Screenshot of the image",
        "imagen.captura_whatsapp": "Screenshot forwarded on WhatsApp",
        "audio.fragmento_6s_opus_16k": "6-second audio clip cut at an arbitrary point",
        "audio.opus_8k": "Audio compressed to Opus 8 kbps (extreme case)",
      },
      limitTag: "Known limit",
      falseLabel: "Unmarked media wrongly attributed to an account",
      falseValue: "{a} of {na} audio tests and {i} of {ni} image tests",
      source: "Leak tracing results (eval/results/watermark.json)",
    },
  },
  pilot: {
    title: "Request access for your institution",
    lead: "Blindaje works with institutions that can act: police stations, prosecutors, municipalities and NGOs. Guilds, churches and neighborhood councils can help spread the app.",
    who: "Police and prosecutors receive each network’s file through a formal channel. Municipalities and NGOs use the map and alerts for their districts, which are already public.",
    steps: [
      "We talk with your institution.",
      "We run the legal review before handling real data.",
      "We start in one or two districts.",
    ],
    fields: {
      org: "Institution or organization name",
      name: "Your name",
      contact: "WhatsApp, mobile or email",
      contactHint: "So we can reply. We never share it.",
      sector: "Type of institution",
      sectorNone: "Choose one",
      sectors: [
        { value: "policia", label: "Police" },
        { value: "fiscalia", label: "Prosecutors" },
        { value: "municipalidad", label: "Municipality" },
        { value: "ong", label: "NGO or victim support" },
        { value: "difusion", label: "Guild, church or council (to spread it)" },
        { value: "otro", label: "Other" },
      ],
      district: "District or province",
      members: "How many people would use it",
      message: "Anything we should know?",
      optional: "optional",
      more: "Add details (optional)",
    },
    errors: {
      org: "Enter your institution’s name (at least 2 letters).",
      name: "Enter your name (at least 2 letters).",
      contact: "Enter a mobile number (6 digits or more) or an email so we can reply.",
      members: "Enter a whole number, without dots or commas.",
      summary: "Check the highlighted fields.",
    },
    verifying: "Automatic spam check",
    verifyingWait: "It starts by itself once you begin filling in the form.",
    captchaLoad: "We could not load the automatic check. Check your connection and reload the page.",
    noscript: "To send this form, turn on JavaScript in your browser.",
    submit: "Send request",
    sending: "Sending…",
    successTitle: "We received your request",
    success:
      "We will write to the contact you left to talk about your institution and the next steps, starting with the legal review. Thank you for joining.",
    fail: "We could not send your request. Check your connection and try again.",
    rateLimited: "Too many requests came from your connection. Wait a few minutes and try again.",
    captcha: "The automatic check has not finished yet. Wait a few seconds and send again.",
    unavailable: "The form is not available right now. Try again in a few minutes.",
    privacy:
      "We use this data only to answer your request. This form is not for reporting a crime: if you are in danger, call 105.",
  },
  helpSection: {
    title: "If you are in danger right now, call 105",
    lines: [
      { number: "105", name: "Peruvian National Police, emergencies", cta: "Call 105" },
      { number: "1818", name: "Línea 1818, the Interior Ministry’s single reporting line", cta: "Call Línea 1818" },
    ],
    station: "You can also report at your nearest police station.",
    note: "Don’t pay or negotiate. Keep the voice notes and messages, and report it.",
  },
  footer: {
    hackathon: "Built for the Meta Global AI Developer Hackathon, from October 26 to November 4, 2026.",
    repo: "Code on GitHub",
    fictitious: "All demo and evaluation data is fictitious. Nothing on this page comes from real victims.",
    license: "Open source under the Apache-2.0 license.",
    shots: "Screenshots show Blindaje’s console and public portal in simulated mode.",
  },
  notFound: {
    title: "This page does not exist",
    text: "The link may be mistyped.",
    home: "Back to the home page",
  },
  lp: {
    hero: {
      title: "No one should face extortion alone",
      lead: "Blindaje brings together what victims keep (audio, photos, messages, numbers and accounts) to uncover the same gang behind different cases and show which districts it hits. A person reviews every link.",
      ctaMap: "See the district map",
      ctaMapShort: "See the map",
      audienceLabel: "For",
      audience: ["corner shops", "mototaxi drivers", "market stalls", "transport workers"],
      photoAlt: "Yellow, blue and red mototaxis waiting for passengers on a pedestrian street in central Lima.",
      photoCredit: "Illustrative photo: Paulo Guereta, CC BY 2.0. It shows no victims.",
      phoneAlt:
        "Screenshot of the public portal on a phone: in Ate, the risk for corner shops is high, between 10 and 19 cases.",
      phoneCap: "The public portal, no account. Fictitious data.",
    },
    built: {
      label: "Built with Meta AI",
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
    problem: { gapsTitle: "Why today is not enough" },
    benefits: {
      title: "What each one gets",
      lead: "Victims document without exposing themselves, the community knows where it happens and what to do, and the authorities get cases already linked.",
      illustration:
        "Real screenshots of the app on an Android emulator, with fictitious data. Outside, a working sales notebook; inside, every note shows what checked it and with which model. You choose the disguise: it can also be a shopping list or a change calculator.",
      victimPhotoAlt:
        "Inside a corner shop in Lima: shelves of goods, stacked red beer crates and two people at the counter, seen from behind.",
      victimPhotoCredit: "Illustrative photo: cemeiakano, CC BY-SA 2.0. It shows no victims.",
      audiences: [
        {
          id: "victim",
          name: "Victims",
          title: "Report directly, without anyone noticing",
          points: [
            "They install the app with no code and no guild. They choose the disguise.",
            "Secret entrance, decoy PIN, quick exit and zero notifications.",
            "Voice notes, photos and messages upload encrypted and never sit in the gallery.",
            "The police report comes out ready, with a timeline and integrity fingerprints.",
          ],
        },
        {
          id: "community",
          name: "Community and businesses",
          title: "See where it happens and know what to do",
          points: [
            "A district map, public and with no account.",
            "Alerts and prevention advice for their area and trade, approved by a person.",
          ],
        },
        {
          id: "authority",
          name: "Police and prosecutors",
          title: "Get cases already linked, with the evidence cited",
          points: [
            "A PDF case file with the timeline of the whole network.",
            "SHA-256 fingerprints and chain of custody for every file.",
            "Which districts the network works in, and repeated accounts to request through legal channels.",
          ],
        },
      ],
    },
    where: {
      title: "Where it happens, district by district",
      lead: "Cases are grouped by district, never by street or home. The map is public and needs no account.",
      rules: [
        "Ranges, not exact counts: 5-9, 10-19, 20-49 or 50+.",
        "Nothing where there are fewer than 5 cases from 3 victims: that district looks the same as one with none.",
        "No totals that allow subtraction, and no addresses or coordinates.",
        "More cases can mean more reporting there, not more danger.",
      ],
      cta: "Open the map",
      label: "Schematic map of the 50 districts of Lima and Callao with fictitious data",
      legend: { sin_datos: "No data or few cases", bajo: "Low", medio: "Medium", alto: "High" },
      listToggle: "See the districts as a list",
      note: "Fictitious data. Each square is a district in its approximate position.",
    },
    how: {
      title: "From a WhatsApp voice note to the district map",
      lead: "This is how a fictitious threat travels through Blindaje, from the victim’s phone to the district map, and how two cases get compared. Models propose; a person decides.",
      flow: {
        railLabel: "Steps of the journey",
        scenes: [
          {
            label: "Collect",
            title: "The victim saves the evidence without anyone noticing",
            text: "The victim forwards the voice notes, photos and messages they received to the app. From the outside it is a sales notebook; what it saves is encrypted on the phone and uploaded with a hash (SHA-256) that proves nobody changed it.",
            tags: ["AES-256-GCM", "SHA-256"],
          },
          {
            label: "Analyze",
            title: "Meta’s models read every piece",
            text: "Muse Voice Transcribe turns the audio into text and separates who speaks. SAM 3.1 finds the bullet and the note in the photo. Muse Spark 1.3 builds the case record: amount, deadline, payment method and group.",
            tags: ["Muse Voice Transcribe 1.0", "SAM 3.1", "Muse Spark 1.3"],
          },
          {
            label: "Signals",
            title: "Everything becomes signals that can be compared",
            text: "To compare cases without exposing anyone, each piece becomes a signal: the voice, as 192 numbers that describe how it sounds; phones and accounts, as an encrypted code (HMAC); the script and the photo, as vectors. No name is stored.",
            tags: ["SpeechBrain ECAPA", "HMAC-SHA256", "multilingual-e5-small", "DINOv2"],
          },
          {
            label: "Compare",
            title: "Another number, the same voice",
            text: "Blindaje searches every case for the most similar signals. B’s voice resembles A’s even though it called from another number, and the script matches too. Together they reach 0.91 out of 1: the link is marked probable.",
            tags: ["FAISS", "Evaluation calibration"],
          },
          {
            label: "Review",
            title: "No link exists until a person confirms it",
            text: "A possible link doesn’t count until a person on the team reviews it. The Linker shows how the cases match and where they don’t, citing each piece of evidence; the reviewer confirms or dismisses it, and the decision is logged.",
            tags: ["Linker on Muse Spark 1.3", "Human review"],
          },
          {
            label: "Show",
            title: "Links build the network, the map shows where",
            text: "B and C also pay into the same account, so the three cases form a network. The public map shows where it happens, by district and in ranges, never addresses; alerts go out only once a person approves them.",
            tags: ["Cartographer", "Lookout", "District map"],
          },
        ],
        s1: { chips: ["WhatsApp voice note", "Photo", "Message"], seal: "Encrypted on the phone" },
        s2: {
          transcript: "Son dos mil soles. Te vamos a mandar el número para que yapees.",
          highlight: "dos mil soles",
          bullet: "bullet",
          note: "handwritten note",
          fields: [
            { k: "Amount", v: "S/ 2,000" },
            { k: "Deadline", v: "48 hours" },
            { k: "Channel", v: "Yape" },
            { k: "Group", v: "«Los X»" },
          ],
        },
        s3: {
          rows: [
            { name: "Voice", raw: "24 s voice note", out: "V-7" },
            { name: "Number", raw: "Yape 900 000 488", out: "…488" },
            { name: "Script", raw: "«habla con el jefe»", out: "e5" },
            { name: "Photo", raw: "Crop: bullet", out: "IMG-1" },
          ],
        },
        s4: {
          caseA: "Case A",
          whereA: "Corner shop, San Juan de Lurigancho",
          caseB: "Case B",
          whereB: "Mototaxi, Comas",
          index: "Voice index",
          voice: "Voice",
          phone: "Phone",
          script: "Script",
          photo: "Photo",
          voiceMatch: "similar voice (0.79) → 0.85",
          scriptMatch: "same script, channel and group → 0.40",
          phoneMismatch: "different",
          review: "Review",
          probable: "Probable",
        },
        s5: {
          title: "Case A and Case B",
          status: "Probable 0.91",
          explain: "The voice in EV-B1 matches EV-A1 and EV-A2 in 4 of 5 segments. The phones are different.",
          confirm: "Confirm link",
          dismiss: "Dismiss",
          confirmed: "Confirmed by a reviewer",
          audit: "Hash-chained audit",
        },
        s6: {
          network: "Network R-001",
          sameVoice: "same voice",
          sameAccount: "Yape …488",
          below: "Comas: under 5 cases, not published",
          alertTitle: "Approved alert",
          alert: "San Juan de Lurigancho: voice notes claiming to be «Los X». Don’t pay: report it on Línea 1818.",
        },
        note: "Fictitious demo data. The figures come from the linking engine with the evaluation’s calibration.",
      },
    },
    tour: {
      title: "After the link",
      lead: "What the team does with linked cases. Real console screenshots, with fictitious data.",
      tabsLabel: "Blindaje features",
      items: [
        {
          tab: "Map the network",
          title: "Maps the network behind the cases",
          text: "With several confirmed links, the cases form a network. The Cartographer (Muse Spark 1.3) summarizes it for the team: since when it operates, how it collects, how it escalates and what evidence is missing. It separates facts from hypotheses; only facts reach the case file.",
          shot: "consola-red-grafo",
          alt: "Console screenshot: graph of network R-001, with three cases tied by voiceprint V-3 and Yape account …488.",
        },
        {
          tab: "Advise",
          title: "Advises businesses on prevention",
          text: "With data from a whole area and trade, the Advisor (Muse Spark 1.3) drafts prevention advice for businesses. A validator checks that every sentence cites evidence, that no numbers or accounts appear and that it never says to pay; then a person approves it.",
          shot: "consola-recomendaciones-asesor",
          alt: "Console screenshot: the Advisor’s draft for mototaxis in Ate. The validator found a claim without a citation and a citation that does not exist.",
        },
        {
          tab: "Case file",
          title: "Builds the case file for prosecutors",
          text: "When an analyst approves a network, the Case writer builds the PDF for prosecutors: the timeline of every case, each link with its evidence and the SHA-256 hash of every file, which proves nobody changed it. It leaves only through a formal channel.",
          shot: "consola-perfil-cartografo",
          alt: "Console screenshot: profile of network R-001, with cited facts on the left and hypotheses awaiting approval on the right.",
        },
        {
          tab: "Authenticity",
          title: "Checks whether the evidence is real",
          text: "A voice or a photo can be faked with AI. Blindaje looks for watermarks (AudioSeal, Video Seal), content credentials (C2PA) and metadata, and Muse Spark reviews the audio or image. These are leads for the reviewer: something is called AI only if a mark proves it.",
          shot: "consola-autenticidad-evidencia",
          alt: "Console screenshot: audio EV-C2 shows strong signs of AI; no AudioSeal watermark, no C2PA, and a flat intonation without breathing.",
        },
        {
          tab: "Leaks",
          title: "Traces who leaked a copy",
          text: "Every voice note or photo opened in the console carries an invisible mark of the account that requested it (AudioSeal and Video Seal). If a copy shows up outside, even forwarded over WhatsApp, the administration knows which account it came from.",
          shot: "consola-rastreo-filtracion",
          alt: "Console screenshot: the Video Seal watermark of a photo forwarded on WhatsApp matches the copy received by the Demo Reviewer, with 98% of the bits.",
        },
      ],
    },
    tech: {
      tabsLabel: "Blindaje’s technology",
      tabs: ["Meta Model API", "Meta’s open models", "Six agents"],
      apiLabel: "Meta Model API",
      openLabel: "Meta’s open models and libraries",
      agentsTitle: "Six agents, and always a person who approves",
      agentsLead:
        "They run on Muse Spark 1.3 through the Responses API, with strict JSON schema output. Every claim cites evidence: without a citation, the output is rejected.",
    },
    voice: {
      title: "Even a disguised voice leaves a print",
      lead: "A voice changer is enough for the print to stop recognizing the same person. We measured it with {speakers} real voices in Peruvian Spanish (SLR73) sent over WhatsApp: how much is lost, and how much reversing the pitch brings back.",
      steps: [
        {
          label: "The voice",
          title: "One voice, a new SIM",
          text: "The voice that threatened case A calls again from another number. It is a fictitious voice, generated with Meta’s MMS-TTS.",
        },
        {
          label: "Disguised",
          title: "A voice changer, +{semitones} semitones",
          text: "An app raises the pitch and the timbre. The print stops recognizing it: the similarity to its own voice drops from {cosClean} to {cosDisguised} (out of 1).",
        },
        {
          label: "Reversed",
          title: "Trying every pitch from {sweepMin} to +{sweepMax}",
          text: "Blindaje lowers and raises the pitch one semitone at a time and keeps the version closest to a stored print. It found the exact shift for {exact} voices.",
        },
      ],
      listen: "Listen",
      audioLabels: [
        "Listen to the original voice, 7 seconds",
        "Listen to the disguised voice, 7 seconds",
        "Listen to the reversed voice, 7 seconds",
      ],
      similarity: "Similarity to their voice",
      pitch: "Pitch",
      replay: "Play again",
      chart: {
        caption: "Measured with {speakers} SLR73 voices",
        rows: ["Clean", "Disguised", "Reversed"],
        similarity: "Similarity to their own voice (mean cosine)",
        top1: "Ranked first",
        falseLinks: "False links per 100",
        threshold: "Review threshold",
      },
      note: "The reversal is an evaluation experiment: it does not run in the system yet. It brings the right person back to first place in {top1Reverted} of cases (without it, {top1Disguised}) and creates no false links, but the similarity stays below the review threshold: it is a lead for a person, never a link on its own. A voice alone never reaches “probable”, even undisguised.",
      source:
        "Example audio: fictitious MMS-TTS voice, disguised +4 and reversed −4 with the same method. Figures: eval/results/voz_distorsion.json.",
    },
    trust: {
      title: "What Blindaje does not do",
      lead: "These limits are part of the design, not a footnote. They protect victims and prevent serious mistakes.",
    },
    menu: { label: "Menu", faq: "FAQ" },
    results: {
      label: "Measured results",
      highlights: [
        { id: "voice_top1", label: "of the time, the voice found the right case first" },
        { id: "false_links_per_100", label: "wrong links per 100 comparisons" },
        { id: "ficha_accuracy", label: "of case-sheet fields correct against the manual label" },
      ],
      leakId: "audio.whatsapp_opus_16k",
      leakLabel: "of voice notes forwarded on WhatsApp, traced to their account",
      target: "Target",
      more: "See every metric and the leak tracing",
    },
    faq: {
      title: "Frequently asked questions",
      lead: "What institutions and the people who spread the app usually ask.",
      items: [
        {
          q: "Does a victim need to belong to a guild?",
          a: "No. Any victim installs the app and reports. Guilds, churches, neighborhood councils or municipalities can help spread it, but they do not review or approve anything.",
        },
        {
          q: "Who sees a victim’s evidence?",
          a: "Only the Blindaje analysis team, as far as the victim allows. Evidence travels encrypted, is stored encrypted and every access is written to a chained audit log. A victim never sees data from other cases.",
        },
        {
          q: "What if someone checks the victim’s phone?",
          a: "They see a working sales app. The private notes open with a secret entrance and a PIN; a decoy PIN opens empty, believable notes, and one tap goes back to the usual app. There are no notifications.",
        },
        {
          q: "How are fake reports stopped without a guild vetting members?",
          a: "A person on the team reviews every link before it counts, no signal decides alone, there is a registration limit per connection and suspicious devices can be flagged.",
        },
        {
          q: "How does an institution join?",
          a: "We talk, run the legal review under Peru’s Law 29733 before handling real data and start in one or two districts.",
        },
      ],
    },
  },
  page: {
    problemTitle: ["Thousands of reports", "no one connects"],
    tech: {
      title: ["Built with Meta AI,", "piece by piece"],
      lead: "Which model does each job and which agents use them. They all propose; nothing goes out until a person approves it.",
      groups: [
        {
          kind: "Meta Model API",
          rows: [
            { name: "Muse Spark 1.3", use: "Case sheet and agents" },
            { name: "Muse Spark 1.2", use: "Voice forensics" },
            { name: "Muse Voice Transcribe", use: "Transcribes by speaker" },
            { name: "SAM 3.1", use: "Bullets, notes, plates; blurs faces" },
            { name: "Muse Image 1.0", use: "Fictitious demo photos" },
            { name: "Muse Wonder 1.0", use: "Large networks, optional" },
          ],
        },
        {
          kind: "Open from Meta",
          rows: [
            { name: "AudioSeal", use: "AI marks and audio tracing" },
            { name: "Video Seal", use: "AI marks and image tracing" },
            { name: "DINOv2", use: "Reused images" },
            { name: "FAISS", use: "Voice, text and image search" },
            { name: "PyTorch", use: "The ML container" },
            { name: "React Native", use: "The victim's app" },
            { name: "React", use: "Console and portal" },
          ],
        },
      ],
      approves: "Approves",
      agents: [
        { name: "Linker", what: "Explains each possible link", approves: "The reviewer" },
        { name: "Cartographer", what: "Analyzes a network", approves: "An analyst" },
        { name: "Lookout", what: "Drafts alerts by district", approves: "The team" },
        { name: "Writer", what: "Builds the case file", approves: "An analyst" },
        { name: "Advisor", what: "Writes advice by area", approves: "The team" },
        { name: "Authenticity", what: "Looks for signs of AI", approves: "The reviewer" },
      ],
    },
    results: { title: "What we measured" },
    pilot: {
      title: "Request access for your institution",
      steps: [
        { lead: "First,", text: "we talk with your institution." },
        { lead: "Then,", text: "we do the legal review before handling real data." },
        { lead: "Finally,", text: "we start in one or two districts." },
      ],
    },
    foot: {
      callLine: "Call 105",
      reportLine: "To report, Línea 1818",
      top: "Back to top",
      creditsLabel: "Photos",
      place: "Lima, 2026",
      photosLabel: "Photos from Wikimedia Commons",
      photos: [
        {
          what: "mototaxis in central Lima",
          author: "Paulo Guereta",
          license: "CC BY 2.0",
          href: "https://commons.wikimedia.org/wiki/File:Lima_-_Per%C3%BA_(20529612568).jpg",
        },
        {
          what: "a corner shop in Lima",
          author: "cemeiakano",
          license: "CC BY-SA 2.0",
          href: "https://commons.wikimedia.org/wiki/File:Lima2011_-_bodega.jpg",
        },
      ],
      photosNote:
        "Cropped and resized for the web. They are illustrative: they show no victims and no places where cases happened",
    },
  },
};
