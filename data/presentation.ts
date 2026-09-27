/**
 * Single source of truth for every word, number and quote on stage.
 *
 * Content is transcribed from the team's own material in `Assets/`
 * (برزينتشن-انا-بالعربي-فريق-3-2.pptx.pdf and هانداوت-أنا-بالعربي-فريق-٣.docx.pdf).
 * Nothing here may be edited without checking the source — see the note at the
 * bottom of this file.
 */

/* -------------------------------------------------------------------------- */
/*  Presentation-level configuration                                          */
/* -------------------------------------------------------------------------- */

/**
 * Date shown in the footer of every section.
 *
 * No presentation date was supplied with the source material, so this is left
 * as a visible placeholder rather than an invented date. Replace the string
 * with e.g. `"١٤٤٧ هـ"` or `"2026-09-26"` and it updates everywhere at once.
 */
export const PRESENTATION_DATE = "—  —  —";

/** Shown next to the date. */
export const PRESENTATION_DATE_LABEL = "التاريخ";

export const presentation = {
  title: "اللغة العربية",
  subtitle: "هويتها، تطورها، تاريخها، وتأثيرها",
  team: "فريق ٣ — أنا بالعربي",
  /** Chapter strip shown under the hero word and in the closing recap. */
  pillars: ["الهوية", "العلم", "المستقبل"] as const,
  heroLine: "من الهوية... إلى العلم... إلى المستقبل",
  heroQuestion: "ما معنى كلمة عربية؟",
  duration: "~ ٦ دقائق",
  date: PRESENTATION_DATE,
  dateLabel: PRESENTATION_DATE_LABEL,
} as const;

/** Seconds allotted to each of the four speakers. */
export const SECTION_DURATION_SECONDS = 90;

/* -------------------------------------------------------------------------- */
/*  Shared shapes                                                             */
/* -------------------------------------------------------------------------- */

export type Stage =
  | "cover"
  | "identity"
  | "technology"
  | "discovery"
  | "history"
  | "behind"
  | "team"
  | "closing";

export type InfoPoint = {
  id: string;
  /** Two-digit ordinal shown as the visual anchor. */
  index: string;
  label: string;
  /** One line the audience reads at a glance. */
  headline: string;
  /** Revealed on hover / focus / click. */
  detail: string;
  icon: "book" | "clock" | "feather" | "shield" | "sparkle";
};

export type Quote = {
  text: string;
  attribution: string;
  /** `scripture` renders in Amiri naskh; `attribution` stays in the UI face. */
  style: "scripture" | "prose";
  /** Optional visual note, e.g. the meaning of a word. */
  gloss?: string;
};

/**
 * What the notes panel needs to render, which is less than a full `Section`.
 * The two credit stages are not timed sections and have no single speaker, so
 * the panel takes this shape instead and the shell fills in what applies.
 */
export type NotesSource = {
  /** `null` on a stage that is not one of the numbered chapters. */
  numeral: string | null;
  shortTitle: string;
  notes: PresenterNotes;
  /** `null` where there is no clock to run down. */
  durationSeconds: number | null;
};

export type PresenterNotes = {
  /** Cues, not a script. */
  cues: string[];
  /** One-line "if you only say one thing" reminder. */
  anchor: string;
  /** How to spend the 90 seconds. */
  pacing: string;
};

export type Section = {
  id: string;
  stage: Stage;
  /** Speaker-facing title (may be long). */
  title: string;
  /** Short title for the progress rail. */
  shortTitle: string;
  /** Displayed chapter number, e.g. "٠١". */
  numeral: string;
  kicker: string;
  speaker: string;
  /**
   * Cover presenter. The author of this data is never mutated at runtime — the
   * shell keeps a "who is speaking now" flag and swaps the displayed name.
   */
  speakerBackup: string;
  durationSeconds: number;
  notes: PresenterNotes;
};

/* -------------------------------------------------------------------------- */
/*  The four sections                                                          */
/* -------------------------------------------------------------------------- */

export const sections: Section[] = [
  {
    id: "identity",
    stage: "identity",
    title: "أهمية اللغة العربية ولماذا تعتبر جزءاً من الهوية",
    shortTitle: "الهوية",
    numeral: "٠١",
    kicker: "لماذا العربية هوية؟",
    speaker: "أ بتول ياسر",
    speakerBackup: "أ ولاء",
    durationSeconds: SECTION_DURATION_SECONDS,
    notes: {
      anchor: "العربية ليست لغة تواصل فقط — إنها جزء من الهوية.",
      pacing: "ابدأ بالقرآن (٢٠ث)، ثم عمر بن الخطاب (١٥ث)، ثم القدم (١٥ث)، ثم الشعر (١٥ث)، ثم الجسر إلى الهوية (١٥ث).",
      cues: [
        "ابدأ بعلاقة العربية بالقرآن الكريم — نزلت بها الرسالة.",
        "اقرأ الآية بهدوء؛ دعها تظهر على الشاشة بدل قراءتها بصوت عالٍ فقط.",
        "قول عمر بن الخطاب: «تعلموا العربية فإنها من دينكم».",
        "القدم: «ظهرت منذ ٢٩ قرناً» — اذكرها كما وردت في المادة.",
        "الشعر والأدب والبلاغة وتعدد المعاني.",
        "الهوية ليست لغة تواصل فقط، بل تاريخ ودين ومعنى.",
      ],
    },
  },
  {
    id: "technology",
    stage: "technology",
    title: "طرق لتحسين اللغة العربية في زمن التطور التكنولوجي",
    shortTitle: "التكنولوجيا",
    numeral: "٠٢",
    kicker: "العربية في زمن التطور",
    speaker: "أ عبد الرحمن سامح",
    speakerBackup: "أ ولاء",
    durationSeconds: SECTION_DURATION_SECONDS,
    notes: {
      anchor: "الحفاظ على العربية لا يعني تجميدها.",
      pacing: "مرّ على الست محاور بسرعة (٦٠ث) ثم اقرأ الخلاصة (١٥ث) واتركها تظهر (١٥ث).",
      cues: [
        "ابدأ بالسؤال: هل يهدّد التغيّرُ العربيةَ أم يحملها إلى الأمام؟",
        "المحتوى الرقمي: ويكيبيديا والمدونات والمواقع بمحتوى رصين.",
        "التطبيقات والألعاب والقراءة: القواعد والأدب بأسلوب للأجيال الناشئة.",
        "الإعلام: أفلام وثائقية ومسلسلات بالفصحى القريبة من الشباب.",
        "تعريب العلوم: تسريع مصطلحات التقنية والذكاء الاصطناعي.",
        "المبادرات: ورش عمل تطوعية وصيانة لسلامة اللغة.",
      ],
    },
  },
  {
    id: "discovery",
    stage: "discovery",
    title: "معلومات جديدة ومفاجئة عن اللغة العربية",
    shortTitle: "مفاجآت",
    numeral: "٠٣",
    kicker: "هل تعلم؟",
    speaker: "أ/ حنين حسن",
    speakerBackup: "أ ولاء",
    durationSeconds: SECTION_DURATION_SECONDS,
    notes: {
      anchor: "ثلاث حقائق تكسر التوقّع.",
      pacing: "٣٠ث لكل حقيقة: تعجب → تفاعل → اقرأ السطر الأخير فقط.",
      cues: [
        "ابدأ بالتعجب: «ثلاث أشياء لا تتوقعونها».",
        "المالطية: لغة تطورت من العربية، تُكتب اليوم بالحروف اللاتينية.",
        "اضغط على النجم: Aldebaran ← الدبران ← التابع.",
        "سبب التسمية: يبدو أنه يتبع مجموعة نجوم أخرى.",
        "كتاب العين: للخليل بن أحمد الفراهيدي.",
        "شدّد: رتّب الحروف بمخارج الأصوات، لا بترتيب أبجدي عادي.",
      ],
    },
  },
  {
    id: "history",
    stage: "history",
    title: "تاريخ اللغة العربية وأمثلة على قوتها وتأثيرها",
    shortTitle: "التاريخ",
    numeral: "٠٤",
    kicker: "من الجذور إلى العالم",
    speaker: "أ أنور السادات",
    speakerBackup: "أ ولاء",
    durationSeconds: SECTION_DURATION_SECONDS,
    notes: {
      anchor: "العربية لغة للعلم والحضارة، وأثرها وصل إلى أوروبا.",
      pacing: "المحطات السبع بسرعة (٥٠ث) ثم كرّس ٢٥ث للكلمات الأربع.",
      cues: [
        "الجذور: من أعرق اللغات، جذورها في الجزيرة والشام والحجاز.",
        "ما قبل الإسلام: تطورت وانتشرت عبر قرون طويلة.",
        "مع الإسلام: انتشرت بالفتوحات، وصارت لغة القرآن ولغة رسمية.",
        "الأمويون والعباسيون: في عهد المأمون صارت لغة العلم والثقافة.",
        "الترجمة والنحو: من علوم اليونان وفارس والهند.",
        "أوروبا: Algebra · Alchemy · Algorithm · Alcohol — اضغط عليها.",
      ],
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Stage 01 — Identity                                                       */
/* -------------------------------------------------------------------------- */

export const identityPoints: InfoPoint[] = [
  {
    id: "quran",
    index: "٠١",
    label: "لغة القرآن",
    headline: "نزلت بها الرسالة الخاتمة",
    detail:
      "اصطفى الله العربية من بين اللغات لتكون لغة كتابه العظيم، ولتنزل بها الرسالة الخاتمة.",
    icon: "book",
  },
  {
    id: "root",
    index: "٠٢",
    label: "امتداد تاريخي",
    headline: "قدمتها لا تُنسى",
    detail:
      "ظهرت منذ نحو ٢٩ قرناً، ورغم هذا القدم ما زالت تحتفظ بتاريخها اللغوي والنحوي.",
    icon: "clock",
  },
  {
    id: "poetry",
    index: "٠٣",
    label: "لغة الشعر والأدب",
    headline: "بلاغة وتعدد معانٍ",
    detail:
      "على مدى العصور كانت العربية لغة الشعر والأدب بفروعه المتنوعة، لبلاغتها وتعدد معانيها.",
    icon: "feather",
  },
  {
    id: "identity",
    index: "٠٤",
    label: "جزء من الهوية",
    headline: "لغة دينٍ لا لغة أداة",
    detail:
      "لأنها لغة الدين والمعرفة والأدب، صارت جزءاً من الهوية نفسها، لا تفصيلاً فيها.",
    icon: "shield",
  },
];

export const identityQuotes: Quote[] = [
  {
    text: "إِنَّا أَنْزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَعَلَّكُمْ تَعْقِلُونَ",
    attribution: "سورة يوسف — الآية ١",
    style: "scripture",
  },
  {
    text: "تعلموا العربية فإنها من دينكم",
    attribution: "عمر بن الخطاب رضي الله عنه",
    style: "prose",
  },
];

/* -------------------------------------------------------------------------- */
/*  Stage 02 — Technology                                                     */
/* -------------------------------------------------------------------------- */

export type TechNode = {
  id: string;
  index: string;
  /** Latin label kept small — it reads as a system, not as content. */
  latin: string;
  label: string;
  headline: string;
  detail: string;
  icon: "globe" | "smartphone" | "book" | "clapper" | "cpu" | "hands";
};

export const techNodes: TechNode[] = [
  {
    id: "content",
    index: "٠١",
    latin: "CONTENT",
    label: "المحتوى الرقمي",
    headline: "ويكيبيديا والمدونات والمواقع",
    detail:
      "إثراء المنصات والمواقع الإلكترونية بمحتوى عربي رصين في شتى العلوم والتقنيات.",
    icon: "globe",
  },
  {
    id: "apps",
    index: "٠٢",
    latin: "APPS & GAMES",
    label: "التطبيقات والألعاب",
    headline: "القواعد والأدب بأسلوب شيق",
    detail:
      "تطبيقات للهواتف الذكية تقدّم قواعد اللغة وأدبها بأسلوب شيق، مع ألعاب تعليمية ومسابقات لغوية للأجيال الناشئة.",
    icon: "smartphone",
  },
  {
    id: "learning",
    index: "٠٣",
    latin: "EDUCATION",
    label: "القراءة والتعلم",
    headline: "ربط القواعد بمهارات القرن الحادي والعشرين",
    detail:
      "تشجيع قراءة الكتب والمقالات الرصينة بانتظام، وربط قواعد اللغة وتاريخها بالتطبيقات المعاصرة، بعيداً عن أساليب التلقين الجافة.",
    icon: "book",
  },
  {
    id: "media",
    index: "٠٤",
    latin: "MEDIA",
    label: "الإعلام وصناعة المحتوى",
    headline: "فصحى قريبة من الشباب",
    detail:
      "إنتاج مواد إعلامية مرئية ومسموعة — أفلام وثائقية ومسلسلات هادفة تخاطب الشباب بفصحى واضحة وقريبة.",
    icon: "clapper",
  },
  {
    id: "science",
    index: "٠٥",
    latin: "TECHNOLOGY",
    label: "تعريب العلوم والتقنية",
    headline: "مصطلحات التقنية والذكاء الاصطناعي",
    detail:
      "تسريع حركة تعريب العلوم الحديثة ومصطلحات التقنية والذكاء الاصطناعي، لضمان بقاء اللغة قادرة على مواكبة العصر.",
    icon: "cpu",
  },
  {
    id: "community",
    index: "٠٦",
    latin: "COMMUNITY",
    label: "المبادرات المجتمعية",
    headline: "ورش عمل ومساهمات تطوعية",
    detail:
      "تنظيم مبادرات تطوعية وورش عمل للتعزيز الوعي بأهمية الحفاظ على سلامة اللغة كلغة تفكير وعمل وعلم.",
    icon: "hands",
  },
];

/**
 * Not a quotation from the source — a one-line summary written for the stage.
 * Labelled as such in the component that renders it.
 */
export const techTakeaway = "الحفاظ على العربية لا يعني تجميدها؛ بل إدخالها إلى أدوات العصر.";

/** Verse artwork shipped in `Assets/` and re-used verbatim. */
export const techArtwork = {
  src: "/media/artworks/ways-to-protect-arabic.jpg",
  alt: "لوحة شعرية بخط عربي: طرق الحفاظ على اللغة العربية في زمن التغير",
  caption: "من لوحات الفريق الأصلية",
} as const;

/* -------------------------------------------------------------------------- */
/*  Stage 03 — Discovery                                                      */
/* -------------------------------------------------------------------------- */

export type DiscoveryFact = {
  id: string;
  index: string;
  kicker: string;
  title: string;
  /** The reveal, one line. */
  headline: string;
  detail: string;
  /** Lines the presenter can read straight off the screen. */
  beats: string[];
};

export const discoveryFacts: DiscoveryFact[] = [
  {
    id: "maltese",
    index: "٠١",
    kicker: "لغة عربية اختفت",
    title: "اللغة المالطية",
    headline: "لغة كاملة تطورت من العربية",
    detail:
      "تُستخدم اليوم في مالطا، لكنها لم تعد تُكتب بحروفها — بل بالحروف اللاتينية.",
    beats: ["العربية", "المالطية", "A · B · C"],
  },
  {
    id: "aldebaran",
    index: "٠٢",
    kicker: "نجم عربي في السماء",
    title: "Aldebaran",
    headline: "بعض أسماء النجوم أصلها عربي",
    detail:
      "سُمّي بالدبران، أي «التابع»، لأنه يبدو أنه يتبع مجموعة نجوم أخرى في السماء.",
    beats: ["Aldebaran", "الدبران", "التابع"],
  },
  {
    id: "alain",
    index: "٠٣",
    kicker: "معجم لم يُرتَّب أبجدياً",
    title: "كتاب العين",
    headline: "للخليل بن أحمد الفراهيدي",
    detail:
      "مميّزته أنه لم يُرتَّب بالطريقة الأبجدية العادية، بل اعتمد ترتيباً خاصاً بمخارج أصوات الحروف.",
    beats: ["الحروف", "مخارج", "ترتيب"],
  },
];

/** Articulation-point groups, used to place letters around a schematic head.
 *  Schematic only — the point is the idea, not a historical diagram. */
export const articulationGroups: { id: string; label: string; letters: string[] }[] = [
  { id: "throat", label: "الحلق", letters: ["ء", "هـ", "ع", "ح"] },
  { id: "tongue", label: "اللسان", letters: ["د", "ط", "ت", "ن", "ل", "ر"] },
  { id: "lips", label: "الشفتان", letters: ["ب", "م", "و", "ف"] },
  { id: "nose", label: "الخيشوم", letters: ["غ", "خ"] },
];

/* -------------------------------------------------------------------------- */
/*  Stage 04 — History                                                        */
/* -------------------------------------------------------------------------- */

export type TimelineEra = {
  id: string;
  index: string;
  title: string;
  /** No invented dates: only phases named in the source material. */
  period: string;
  detail: string;
};

export const timelineEras: TimelineEra[] = [
  {
    id: "roots",
    index: "٠١",
    title: "الجذور القديمة",
    period: "أقدم المراحل",
    detail:
      "العربية واحدة من أعرق اللغات في التاريخ، ولها جذور قديمة في شبه الجزيرة العربية والشام والحجاز.",
  },
  {
    id: "pre-islam",
    index: "٠٢",
    title: "ما قبل الإسلام",
    period: "قرون طويلة",
    detail: "تطورت وانتشرت عبر قرون طويلة قبل الإسلام.",
  },
  {
    id: "islam",
    index: "٠٣",
    title: "ظهور الإسلام",
    period: "مع الفتوحات",
    detail:
      "انتشرت العربية بشكل كبير، وأصبحت لغة القرآن الكريم ولغة رسمية في كثير من الدول.",
  },
  {
    id: "umayyad",
    index: "٠٤",
    title: "العصر الأموي",
    period: "من العصر الأموي فصاعداً",
    detail: "في العصر الأموي والعباسي صارت العربية لغة للعلم والثقافة والترجمة.",
  },
  {
    id: "abbasid",
    index: "٠٥",
    title: "العصر العباسي",
    period: "خصوصاً عهد المأمون",
    detail:
      "وفي عهد المأمون صارت العربية لغة للعلم والثقافة والترجمة، وازدهرت علوم النحو والصرف والبلاغة.",
  },
  {
    id: "translation",
    index: "٠٦",
    title: "الترجمة والعلوم",
    period: "اليونان وفارس والهند",
    detail: "تُرجمت إلى العربية علوم اليونان وفارس والهند، فازدهرت علوم النحو والصرف والبلاغة.",
  },
  {
    id: "europe",
    index: "٠٧",
    title: "انتقال التأثير إلى أوروبا",
    period: "إلى اللغات الأوروبية",
    detail:
      "تعلم بعض العلماء والطلاب الأوروبيين العربية للاستفادة من علومها، وانتقلت إلى اللغات الأوروبية كلمات ومصطلحات ذات أصل عربي.",
  },
];

export type InfluenceWord = { word: string; index: string };

export const influenceWords: InfluenceWord[] = [
  { word: "Algebra", index: "٠١" },
  { word: "Alchemy", index: "٠٢" },
  { word: "Algorithm", index: "٠٣" },
  { word: "Alcohol", index: "٠٤" },
];

export const historyClosing = {
  lead: "لم تكن العربية مجرد لغة للتواصل، بل كانت أيضاً لغة للعلم والحضارة.",
  tail: "وكان لها تأثير واضح في تاريخ المعرفة الإنسانية.",
} as const;

export const historyArtwork = {
  src: "/media/artworks/tarikh-al-arabiyya-fi-al-dad.jpg",
  alt: "لوحة: تاريخ اللغة العربية في الضاد",
  caption: "من لوحات الفريق الأصلية",
} as const;

export const calligraphyArtwork = {
  src: "/media/artworks/calligraphy-portrait.jpg",
  alt: "لوحة خط عربي على ورق كريمي",
  caption: null,
} as const;

/* -------------------------------------------------------------------------- */
/*  Stage 05 — ما وراء العرض                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The task the team was given alongside the presentation.
 *
 * Wording is taken from the brief. The `requirement` states the *brief*, not a
 * measured result — nothing on this stage reports how many people were
 * actually convinced, because that number is not derivable from the material
 * in `Assets/`. The evidence strip below shows the screenshots themselves so
 * the audience can judge the work rather than take a claim on trust.
 */
export const behindTask = {
  kicker: "المهمة المسندة إلينا",
  title: "ما وراء العرض",
  lead: "قبل التقديم، أُسند إلى الفريق تمرين خارج حدود الشرائح.",
  requirement:
    "إقناع شخصين على الأقل بتغيير اسم Facebook من الإنجليزية إلى العربية، مع التقاط لقطة شاشة قبل التغيير ولقطة بعده.",
  evidenceNote: "كل زوج صور هنا لحساب واحد: الصورة الأولى بالاسم الإنجليزي، والثانية بعد تغييره.",
  deadlineLabel: "موعد التسليم",
  deadline: "غداً الساعة ٩ مساءً",
} as const;

/** No clock on this stage: it is walked at the presenter's own pace. */
export const behindNotes: PresenterNotes = {
  anchor: "الشرائح ليست كل العمل — العمل الذي قبلها هو ما يثبت ذلك.",
  pacing: "اذكر المهمة (١٥ث)، ثم اعرض الحالات واحدة واحدة ولا تعطّ وقتاً لكل لقطة.",
  cues: [
    "اربطها بالافتتاحية: قبل أن نبدأ، كان هناك تمرين خارج الشرائح.",
    "اذكر المطلوب بإيجاز: شخصان على الأقل، وتغيير الاسم من الإنجليزية إلى العربية.",
    "وضّح أن كل حالة عبارة عن لقطتين: قبل وبعد، للحساب نفسه.",
    "امشِ بين الحالات بهدوء — اضغط على أي صورة لتكبيرها إن لزم.",
    "لا تعطِ عدداً للأشخاص: هذه لقطات، وليست إحصاء.",
    "اختم بالموعد: غداً الساعة التاسعة مساءً.",
  ],
};

export type EvidencePair = {
  id: string;
  /** Display ordinal, e.g. "٠١". */
  index: string;
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  /** Original files in `Assets/social-media-screenshots/`. Provenance only. */
  source: { before: string; after: string };
};

/**
 * The eighteen screenshots in `Assets/social-media-screenshots`, paired by the
 * page group they were captured on. Within each pair the member whose profile
 * name is still set in Latin script is the "before" capture.
 *
 * The names themselves are deliberately left untranscribed: the "after" names
 * are Arabic and could not be read with the OCR available here, so writing
 * them out would mean guessing. The screenshots are shown instead.
 */
export const evidencePairs: EvidencePair[] = [
  { n: "٠١", file: "evidence-01", from: ["img-006-007", "img-006-008"] },
  { n: "٠٢", file: "evidence-02", from: ["img-007-009", "img-007-010"] },
  // Numbered out of order in the source folder: 012 is the Latin "before".
  { n: "٠٣", file: "evidence-03", from: ["img-008-012", "img-008-011"] },
  { n: "٠٤", file: "evidence-04", from: ["img-009-013", "img-009-014"] },
  { n: "٠٥", file: "evidence-05", from: ["img-010-015", "img-010-016"] },
  { n: "٠٦", file: "evidence-06", from: ["img-011-017", "img-011-018"] },
  { n: "٠٧", file: "evidence-07", from: ["img-012-019", "img-012-020"] },
  { n: "٠٨", file: "evidence-08", from: ["img-013-021", "img-013-022"] },
  { n: "٠٩", file: "evidence-09", from: ["img-014-023", "img-014-024"] },
].map(({ n, file, from: [beforeFrom, afterFrom] }) => ({
  id: file,
  index: n,
  /**
   * Provenance: the original files in `Assets/social-media-screenshots/`.
   * Never rendered — it exists so each case can be traced back to its source
   * and checked for tampering. See `public/media/README.md`.
   */
  source: { before: beforeFrom, after: afterFrom },
  before: {
    src: `/media/evidence/${file}-before.jpg`,
    alt: `لقطة شاشة قبل تغيير الاسم — الحالة ${n}`,
  },
  after: {
    src: `/media/evidence/${file}-after.jpg`,
    alt: `لقطة شاشة بعد تغيير الاسم إلى العربية — الحالة ${n}`,
  },
}));

/* -------------------------------------------------------------------------- */
/*  Stage 06 — فريق العمل                                                     */
/* -------------------------------------------------------------------------- */

export type CreditGroup = {
  id: string;
  label: string;
  members: string[];
};

/**
 * Contributions are grouped by the work done, not alphabetical. The grouping
 * is the team's own; no role is invented for a person the material does not
 * name, and nobody is given credit for a section they are not on record for.
 */
export const creditGroups: CreditGroup[] = [
  {
    id: "identity",
    label: "بحث وتجهيز شرائح الهوية",
    members: ["أ رنا", "أ بسنت", "أ نور"],
  },
  {
    id: "kinship",
    label: "بحث وتجهيز شرائح صلة العربية بعالمها",
    members: ["أ عبدالرحمن", "أ أنور", "أ ولاء"],
  },
  {
    id: "history",
    label: "بحث وتجهيز شرائح التاريخ",
    members: ["أ حنين", "أ رنا", "أ بسنت"],
  },
  {
    id: "facts",
    label: "بحث وتجهيز شرائح المعلومات المفاجئة",
    members: ["أ حبيبة", "أ بتول", "أ مروة"],
  },
  {
    id: "handout",
    label: "التقديم وتجهيز الهانداوت",
    members: ["أ بتول", "أ رنا", "أ بسنت"],
  },
];

/** Presenting line-up, derived from the sections so it can never drift. */
export const presenterLineup = sections.map((s) => ({
  numeral: s.numeral,
  section: s.shortTitle,
  name: s.speaker,
}));

/** The cover presenter for the whole deck. */
export const teamBackupPresenter = sections[0].speakerBackup;

export const teamNotes: PresenterNotes = {
  anchor: "كل اسم هنا قام على جزء محدد — لا اجتهاد في تقسيم العمل.",
  pacing: "مرّ على المجموعات بسرعة (٣٠ث) ثم قدّم المتحدثين الأربعة ببطء.",
  cues: [
    "ابدأ بالشكر، واذكر أن العمل كان موزّعاً حسب الأقسام.",
    "الهوية: رنا وبسنت ونور.",
    "صلة العربية بعالمها: عبدالرحمن وأنور وولاء.",
    "التاريخ: حنين ورنا وبسنت — المعلومات: حبيبة وبتول ومروة.",
    "الهانداوت: بتول ورنا وبسنت.",
    "قدّم المتحدثين الأربعة، واذكر أن أ ولاء هي المقدمة الاحتياطية.",
  ],
};

/* -------------------------------------------------------------------------- */
/*  Closing                                                                    */
/* -------------------------------------------------------------------------- */

export const closing = {
  lead: "العربية ليست فقط لغة الماضي",
  statements: [
    "لغة هوية",
    "لغة علم",
    "لغة معرفة",
    "لغة قادرة على مواكبة المستقبل",
  ],
  /** Optional footer line. Left empty rather than inventing a slogan. */
  coda: "",
} as const;

/* -------------------------------------------------------------------------- */
/*  Stage index (order matters)                                               */
/* -------------------------------------------------------------------------- */

export type StageDefinition = {
  id: string;
  kind: "cover" | "section" | "extra" | "closing";
  sectionId?: string;
  label: string;
};

export const stages: StageDefinition[] = [
  { id: "cover", kind: "cover", label: "المقدمة" },
  ...sections.map<StageDefinition>((s) => ({
    id: s.id,
    kind: "section",
    sectionId: s.id,
    label: s.shortTitle,
  })),
  { id: "behind", kind: "extra", label: behindTask.title },
  { id: "team", kind: "extra", label: "فريق العمل" },
  { id: "closing", kind: "closing", label: "الخلاصة" },
];

export const SECTION_IDS = sections.map((s) => s.id);

/* -------------------------------------------------------------------------- */
/*  Content rules                                                             */
/* -------------------------------------------------------------------------- */

/*
 * Every claim above is traceable to the team's handout. Where the source is
 * vague, the wording is kept vague — the "٢٩ قرناً" figure is reported as a
 * span, never as a dated year, and the Maltese / Aldebaran / Al-ʿAyn entries
 * deliberately carry no extra history beyond what the handout states (no
 * Sicily, no "oldest dictionary" claim, no extra naming theory). The one line
 * not present in the source is `techTakeaway`, which is flagged in code as a
 * stage summary rather than quoted material.
 */
