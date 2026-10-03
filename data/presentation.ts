/**
 * Single source of truth for every word, number and quote on stage.
 *
 * Content is transcribed from the team's own material in `Assets/`
 * (برزينتشن-انا-بالعربي-فريق-3-2.pptx.pdf and هانداوت-أنا-بالعربي-فريق-٣.docx.pdf).
 * Nothing here may be edited without checking the source — see the note at the
 * bottom of this file.
 *
 * ## Audience copy vs presenter copy
 *
 * This module holds both, and the split is deliberate. `cover`, `sections`,
 * `timelineEras` and `closing` are what the room reads. Everything reached
 * through a `notes` field, plus `openingChallenge.answerNote` and the `line` /
 * `cue` fields of every hand-off, is what the *speaker* reads and lives only on
 * `/presenter`. A staging direction — «اقرأ بهدوء», «لا تضف تواريخ», «كما وردت
 * في المادة» — has no place on a projector: the audience is being told how to
 * present rather than given something to think about.
 */

import { toArabicDigits } from "@/lib/format";

/* -------------------------------------------------------------------------- */
/*  Presentation-level configuration                                          */
/* -------------------------------------------------------------------------- */

/**
 * Date shown in the footer of every stage, and on the presenter handout.
 *
 * Supplied by the team and written out in full, in Arabic-Indic digits inside
 * Arabic text. This is the *presentation date*, not a submission deadline — the
 * two were once the same string here, which is why the distinction is written
 * down. Changing it here changes it on every stage and in the handout at once.
 */
export const PRESENTATION_DATE = "الجمعة ٩ أكتوبر ٢٠٢٦";

/** Shown next to the date. */
export const PRESENTATION_DATE_LABEL = "التاريخ";

export const presentation = {
  /**
   * The presentation's own name, and the largest thing on the cover.
   *
   * This is the title the team uses for itself — «أنا بالعربي» is the filename
   * stem of both source PDFs — so it is the identity of the talk rather than a
   * summary of its subject. `subtitle` carries the subject.
   */
  title: "أنا بالعربي",
  subtitle: "اللغة العربية بين الهوية والمعرفة والمستقبل",
  team: "غيث",
  /** The Latin spelling of the team name, as set in the logo. */
  teamLatin: "GHAITH",
  /** Chapter strip shown on the cover and again in the closing recap. */
  pillars: ["الهوية", "العلم", "المستقبل"] as const,
  heroLine: "من الهوية... إلى العلم... إلى المستقبل",
  duration: "نحو ٦ دقائق",
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
  /**
   * The question the chapter opens on, under the masthead.
   *
   * The title names the subject; this asks the question that makes the room
   * want it. They are separate because they are read at different moments and
   * do different work — see the note on `SectionHeader`'s `hook`. Absent on the
   * chapters that have no opening question worth asking.
   */
  hook?: string;
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
    speaker: "أ. بتول ياسر",
    speakerBackup: "أ. ولاء",
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
    hook: "العربية أقدم من كل ما نعرفه عنها… فكيف تحافظ على حضورها في عصر التكنولوجيا والإنترنت؟",
    speaker: "أ. عبدالرحمن سامح",
    speakerBackup: "أ. ولاء",
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
    hook: "نظن أننا نعرف العربية… فماذا قد يفاجئنا عنها؟",
    speaker: "أ. حنين حسن",
    speakerBackup: "أ. ولاء",
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
    hook: "كيف تحولت العربية من لغةٍ عريقة إلى لغةٍ للعلم والحضارة والتأثير؟",
    speaker: "أ. أنور السادات",
    speakerBackup: "أ. ولاء",
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
/*  Stage 00 — The cover                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The cover — the first thing the room sees, and the only stage that does not
 * hand the floor to a speaker.
 *
 * It carries no claim about the subject. It is the title card: who is
 * standing, what the talk is called, and the three movements it will travel
 * through. `pillars` and `line` are read off `presentation` rather than
 * retyped, so the cover and the closing can never disagree about them, and
 * `chapters` is derived from `sections` so a fifth chapter would appear here on
 * its own.
 */
export const cover = {
  /** Small label above the title. */
  kicker: "عرض تقديمي",
  /**
   * The talk's name. The room should be able to repeat it afterwards, so it is
   * set at display size and nothing is allowed to compete with it — the date
   * and the running time are deliberately the smallest type on the screen.
   */
  title: presentation.title,
  /** One line naming the subject, under the title and nothing louder. */
  subtitle: presentation.subtitle,
  /** The team, as the logo sets it. */
  team: presentation.team,
  teamLatin: presentation.teamLatin,
  /** The one line that frames everything that follows. */
  line: presentation.heroLine,
  /** The three movements of the talk, in order. */
  pillars: presentation.pillars,
  /** The four chapters, named as the progress rail names them. */
  chapters: sections.map((s) => s.shortTitle) as readonly string[],
  /** Bottom-right metadata. Secondary on purpose. */
  duration: presentation.duration,
  chapterCount: `${toArabicDigits(sections.length)} محاور`,
  date: presentation.date,
  cta: "ابدأ العرض",
} as const;

/**
 * Notes for the cover.
 *
 * The cover is the one stage where the best thing the presenter can do is
 * nothing, and the notes say so — a speaker who starts talking over the title
 * has already lost the room's attention before the first question.
 */
export const coverNotes: PresenterNotes = {
  anchor: "اترك الغلاف مكشوفاً — لا تتكلم فوق عنوانك.",
  pacing: "ثانيتان للوقوف، خمس ثوانٍ صمت، ثم انتقال.",
  cues: [
    "تأكد أن الصوت والإضاءة يعملان قبل أن تبدأ.",
    "الغلاف يعمل وحده — لا حاجة لتعليق.",
    "انتقل بسهم واحد فقط: الغلاف ← سؤال الافتتاح.",
    "لا تعد إلى الغلاف بعد بداية العرض.",
  ],
};

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
      // Was «قدمتها لا تُنسى», then «٢٩ قرناً». The first is the speaker's own
      // phrase rather than a fact, so it should never have been a headline; the
      // second was a second statement of what the point's own visual already
      // showed as a typographic specimen, and the number appeared twice on one
      // screen.
      //
      // The figure now lives in exactly one place — the visual — and the
      // headline carries what the figure *means* instead: that an old language
      // can still be a careful one. The "as stated in the material" caveat
      // stays in the point's presenter notes.
      headline:
        "ورغم هذا القدم ما زالت تحتفظ بتاريخها اللغوي والنحوي.",
      detail:
        "ظهرت منذ نحو ٢٩ قرناً، ورغم هذا القدم ما زالت تحتفظ بتاريخها اللغوي والنحوي.",
      icon: "clock",
    },

  {
    id: "poetry",
    index: "٠٣",
    label: "لغة الشعر والأدب",
    // Was «بلاغة وتعدد معانٍ», which repeated two of the four words the point's
    // beats graphic lists, and the point's own title listed three of them
    // again — so الشعر/الأدب/البلاغة/تعدد المعاني reached the audience three
    // times on a single screen.
    //
    // The list is now stated once, in the visual. The headline gives the
    // consequence — that Arabic was a language people *read*, not only spoke —
    // which is a different claim and does not repeat the list.
    headline:
      "على مدى العصور كانت العربية لغةً تُقرأ لما فيها، لا لمجرّد التخاطب.",
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

/**
 * The chronological spine of section 04.
 *
 * Two rules shape this list.
 *
 * **No invented dates.** The handout gives an order, not a calendar, so `period`
 * is a span or an event ("مع الفتوحات", "عهد المأمون") and never a year. The
 * visual progression is carried by `index` and by the rail, not by dates we
 * would have had to make up.
 *
 * **No repeated content.** An earlier draft had three consecutive eras whose
 * `detail` all said some form of «صارت العربية لغة للعلم والثقافة والترجمة»,
 * and two that both closed with «ازدهرت علوم النحو والصرف والبلاغة». Each era
 * below therefore contributes exactly one new idea: where it came from, when it
 * became official, what it was used for, who supported it, what came in, and
 * where it went.
 */
export const timelineEras: TimelineEra[] = [
  {
    id: "roots",
    index: "٠١",
    title: "الجذور",
    period: "أقدم المراحل",
    detail:
      "من أعرق اللغات، ولها جذور قديمة في الجزيرة والشام والحجاز.",
  },
  {
    id: "pre-islam",
    index: "٠٢",
    title: "ما قبل الإسلام",
    period: "قرون طويلة",
    detail: "تطورت وانتشرت حتى صارت لغة التخاطب الأولى في الجزيرة.",
  },
  {
    id: "islam",
    index: "٠٣",
    title: "ظهور الإسلام",
    period: "مع الفتوحات",
    detail:
      "انتشرت انتشاراً واسعاً، وصارت لغة القرآن ولغة رسمية في دول كثيرة.",
  },
  {
    id: "umayyad",
    index: "٠٤",
    title: "العصر الأموي",
    period: "من الأموي فصاعداً",
    detail: "بدأت مكانتها العلمية تتّضح، وأصبحت لغة الكتابة والدواوين.",
  },
  {
    id: "abbasid",
    index: "٠٥",
    title: "العصر العباسي",
    period: "عهد المأمون",
    detail:
      "في عهد المأمون صارت بيتًا للحكمة، فازدهر النحو والصرف والبلاغة.",
  },
  {
    id: "translation",
    index: "٠٦",
    title: "حركة الترجمة",
    period: "اليونان · فارس · الهند",
    detail: "نُقلت علوم اليونان وفارس والهند إلى العربية.",
  },
  {
    id: "europe",
    index: "٠٧",
    title: "إلى أوروبا",
    period: "إلى اللغات الأوروبية",
    detail:
      "تعلّم علماء وطلاب الأوروبيين العربية، وانتقلت معها كلماتها إلى لغاتهم.",
  },
];

export type InfluenceWord = {
  /** The loanword, set in Latin script — this is the point of the slide. */
  word: string;
  index: string;
  /**
   * The familiar Arabic term for the same thing.
   *
   * A gloss the audience already knows, not a second etymological claim: the
   * handout lists the four words and nothing about where each one was
   * transmitted, so nothing here goes beyond it.
   */
  meaning: string;
};

export const influenceWords: InfluenceWord[] = [
  { word: "Algebra", index: "٠١", meaning: "الجبر" },
  { word: "Alchemy", index: "٠٢", meaning: "الكيمياء" },
  { word: "Algorithm", index: "٠٣", meaning: "الخوارزمية" },
  { word: "Alcohol", index: "٠٤", meaning: "الكحول" },
];

export const historyClosing = {
  lead: "لم تكن العربية لغة تواصل فحسب، بل لغة علم وحضارة.",
  tail: "وكان لها تأثير واضح في تاريخ المعرفة الإنسانية.",
  /**
   * What the last point is *for*, in the team's words.
   *
   * This point shows four Latin loanwords, and until now its on-screen line
   * was `lead` — "Arabic was a language of science and civilisation", which is
   * a true and already-made claim, made two eras earlier in the same timeline,
   * and which says nothing about why an audience is looking at *Algebra* and
   * *Alcohol* on a slide about Arabic. The words on screen are the evidence;
   * the sentence above them has to name what the evidence shows.
   *
   * So the line is now the effect itself, and `lead` moves to `onScreen` where
   * it is read as intent rather than printed as a heading.
   */
  influence: "الكلمة انتقلت إلى اللغات الأوروبية.",
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
  /**
   * Why the exercise was worth doing at all.
   *
   * This replaced the submission deadline, which was on this stage until the
   * brief changed. Two reasons it should not have been there: a date is
   * production information that stops meaning anything the moment the talk is
   * given again, and it was taking the position of the argument. The stage was
   * answering «when is this due?» in the same visual weight as «what was the
   * point?» — and the screenshots next to it do the answering, not a calendar.
   *
   * Kept to one sentence and kept as a question. It is the deck's own argument
   * turned back on the audience, and it is the reason the exercise exists.
   */
  purpose:
    "إذا كانت اللغة جزءاً من هويتنا، فلماذا نخفيها خلف اسمٍ أجنبي على منصاتنا الرقمية؟",
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
    "اقرأ جملة الغرض بتمهّل، واتركها معلّقة — لا تنتقل فوراً.",
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
  { n: "١٠", file: "evidence-10", from: ["img-015-025", "img-015-026"] },
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

export type CreditRole = {
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
    label: "بحث وكتابة",
    members: ["أ. رنا", "أ. بسنت", "أ. نور"],
  },
  {
    id: "kinship",
    label: "بحث وكتابة",
    members: ["أ. عبدالرحمن", "أ. أنور", "أ. ولاء"],
  },
  {
    id: "history",
    label: "بحث وكتابة",
    members: ["أ. حنين", "أ. رنا", "أ. بسنت"],
  },
  {
    id: "facts",
    label: "بحث وكتابة",
    members: ["أ. حبيبة", "أ. بتول", "أ. مروة"],
  },
  {
    id: "handout",
    label: "البرزنتيشن والهانداوت",
    members: ["أ. بتول", "أ. رنا", "أ. بسنت"],
  },
];

/**
 * Grouped by role, the way the team describes the work on stage.
 *
 * `creditGroups` above keeps the *per-section* breakdown because the handout
 * needs to know who covered which chapter. This is the coarser view the credits
 * stage shows: the room does not need to know which of the three people on the
 * research team wrote the history slides, only that the research happened and
 * who was in it.
 *
 * The Facebook-account task is listed separately because it was delivered as
 * campaign work rather than as part of the slides, and it would disappear
 * entirely inside a research grouping.
 */
export const creditRoles: CreditRole[] = [
  {
    id: "research",
    label: "البحث والكتابة",
    members: [
      "أ. رنا",
      "أ. بسنت",
      "أ. نور",
      "أ. عبدالرحمن",
      "أ. أنور",
      "أ. ولاء",
      "أ. حنين",
      "أ. حبيبة",
      "أ. بتول",
      "أ. مروة",
    ],
  },
  {
    id: "presentation",
    label: "العرض",
    members: ["أ. عبدالرحمن", "أ. حنين", "أ. أنور", "أ. بتول"],
  },
  {
    id: "handout",
    label: "البرزنتيشن والهانداوت",
    members: ["أ. بتول", "أ. رنا", "أ. بسنت"],
  },
  {
    id: "outreach",
    label: "التوعية / تغيير أسماء حسابات فيسبوك",
    members: ["أ. رنا", "أ. بسنت", "أ. نور"],
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

/** The backup presenter, listed on the credits stage in its own right. */
export const creditBackup: { id: string; label: string; name: string } = {
  id: "backup",
  label: "الاحتياطي",
  name: teamBackupPresenter,
};

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

/**
 * The masthead of the credits stage.
 *
 * A heading, not a claim: it names what the page below it is. The closing
 * sentence lives on the closing stage, where it can be the only thing on
 * screen instead of competing with forty names.
 */
export const teamCredits = {
  headline: "من أعدّ هذا العمل",
  /** The bridge out of the credits and into the closing stage. */
  bridge: "ولكل واحدٍ من هذه الأسماء دورٌ في ما وصلتم إليه.",
} as const;

/* -------------------------------------------------------------------------- */
/*  Closing                                                                    */
/* -------------------------------------------------------------------------- */

export const closing = {
  /**
   * The last thing the room reads.
   *
   * The previous closing made a claim about the language and then asked the
   * audience a small task question («كم كلمة ستضيفون هذا الأسبوع؟»). That is a
   * call to action, and it lands as one more thing to be graded on the way out
   * of a short talk.
   *
   * This one turns the claim back on the people in the room: the statement
   * establishes that Arabic can carry the future, and the question asks whether
   * *they* will be part of it. Same length, but it ends as an invitation rather
   * than a homework assignment — which is what a closing line is for.
   */
  statement: "العربية قادرة على مواكبة المستقبل…",
  /** The question the room carries out. The largest type on the stage. */
  question: "فهل نكون نحن جزءاً من هذا المستقبل؟",
  /**
   * How the pair breaks on the stage.
   *
   * `statementLines` sets the claim in two beats so the eye lands on
   * «مواكبة المستقبل» before the question asks anything. `questionLines` keeps
   * the question to two lines, which is as wide as it can be before the Arabic
   * starts breaking mid-phrase.
   */
  statementLines: ["العربية قادرة", "على مواكبة المستقبل…"] as const,
  questionLines: ["فهل نكون نحن", "جزءاً من هذا المستقبل؟"] as const,
  /**
   * The thank-you. It sits *under* the statement rather than leading the stage:
   * the closing line is what the room repeats on the way out, and leading with
   * gratitude would make the last impression a pleasantry instead of a question.
   */
  thanks: "شكر لحسن الاستماع",
  /**
   * The short form the speaker says out loud as the stage changes — the same
   * warmth in the length a person can actually say.
   */
  thanksSpoken: "شكراً لكم على حسن استماعكم.",
  /** Small label above the statement, tying it back to the cover. */
  kicker: "الخلاصة",
} as const;

/**
 * Notes for the closing stage.
 *
 * Written as a short reading order rather than a script, because the order is
 * the only thing that can go wrong here: gratitude first, then the claim, then
 * the ask, then silence. Getting that sequence right is worth more than
 * memorising a paragraph.
 */
export const closingNotes: PresenterNotes = {
  anchor: "الجملة، ثم السؤال، ثم الشكر — بهذا الترتيب.",
  pacing: "الجملة (١٠ث)، السؤال (١٠ث) ثم اصمت، ثم الشكر (٥ث)، ثم افتح باب الأسئلة.",
  cues: [
    `اقرأ الجملة كما هي: ${closing.statement}`,
    `ثم اصمت، واطرح السؤال: ${closing.question}`,
    "اترك الصمت بعد السؤال — هو الجزء المهم، لا الفراغ قبله.",
    `ثم اشكر: ${closing.thanksSpoken}`,
    "لا تعُد إلى شريحة الفريق — الختام هو الختام.",
  ],
};

/* -------------------------------------------------------------------------- */
/*  Stage index (order matters)                                               */
/* -------------------------------------------------------------------------- */

export type StageDefinition = {
  id: string;
  kind: "cover" | "opening" | "section" | "extra" | "closing";
  sectionId?: string;
  label: string;
};

export const stages: StageDefinition[] = [
  { id: "cover", kind: "cover", label: "المقدّمة" },
  { id: "opening", kind: "opening", label: "سؤال الافتتاح" },
  ...sections.map<StageDefinition>((s) => ({
    id: s.id,
    kind: "section",
    sectionId: s.id,
    label: s.shortTitle,
  })),
  { id: "behind", kind: "extra", label: behindTask.title },
  { id: "ghaith", kind: "extra", label: "فريق غيث" },
  { id: "closing", kind: "closing", label: closing.kicker },
];

export const SECTION_IDS = sections.map((s) => s.id);

/* -------------------------------------------------------------------------- */
/*  Content rules                                                             */
/* -------------------------------------------------------------------------- */

/*
 * Every factual claim above is traceable to the team's handout. Where the
 * source is vague, the wording is kept vague — the "٢٩ قرناً" figure is
 * reported as a span, never as a dated year, and the Maltese / Aldebaran /
 * Al-ʿAyn entries deliberately carry no extra history beyond what the handout
 * states (no Sicily, no "oldest dictionary" claim, no extra naming theory).
 *
 * Three kinds of line here are *not* from the handout, and each is flagged in
 * place so nobody has to guess which is which:
 *
 *   - `techTakeaway` — a stage summary, labelled as written for the stage.
 *   - `cover` and everything under `closing` (including `thanks` and `coda`) —
 *     presentation copy. The deck's own words about itself, and the only lines
 *     on the last stage that are not somebody else's quotation.
 *   - `coverNotes` / `closingNotes` / `teamCredits` — presenter directions.
 *     They are read by the speaker, not the audience, so they make no claims to
 *     anyone.
 *
 * The audience warm-up lives in `data/handoff.ts` instead, together with its
 * own note on the one claim in it that still needs the team's confirmation.
 */
