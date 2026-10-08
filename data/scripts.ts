/**
 * The four speaker scripts — spoken prose, one chapter per speaker.
 *
 * `/script/[slug]` is a reading surface, not another view of the deck: the
 * audience never sees it, and the presenter never drives it from a clicker. It
 * exists so a speaker can read their part out loud, at their desk, with the
 * delivery markers in front of them and nothing else.
 *
 * Two rules shape every line below.
 *
 * **Nothing is invented.** Every fact, quote, number, era and loanword is
 * reached through the existing data modules — {@link sections}, {@link identityQuotes},
 * {@link openingAnswerLines}, {@link pointFor} — so a script cannot drift from
 * what the room is shown. What *is* authored here is the connective speech
 * around them: the openings, the bridges and the questions. That is the part a
 * slide cannot hold.
 *
 * **Nothing is shared back.** `data/presentation.ts` says the second chapter is
 * read by أ. عبدالرحمن سامح, because that is the stage's roster. These pages
 * are a different artifact with a different assignment — the second chapter
 * belongs to أ. ولاء — so the scripts carry their own names in
 * {@link SCRIPT_SPEAKERS} and never write to the shared one. Both are true at
 * once, in their own file.
 *
 * Emphasis is not repeated here either. Each chapter points at its point in
 * `data/points.ts` and the renderer bolds that point's approved `emphasis`
 * phrases as they fall in the spoken text, so a word can never be highlighted
 * on the script page that the stage does not highlight too.
 */

import {
  closing,
  historyClosing,
  identityQuotes,
  influenceWords,
  SECTION_DURATION_SECONDS,
  sections,
  techTakeaway,
} from "@/data/presentation";
import {
  OPENING_DURATION_SECONDS,
  openingAnswerLines,
  openingChallenge,
} from "@/data/handoff";
import { pointFor } from "@/data/points";
import { clockToArabicDigits, formatClock, toArabicDigits } from "@/lib/format";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * One line of the script.
 *
 * The union is deliberately small and the difference between its members is
 * the difference between saying something and doing something: `say` is spoken
 * aloud, `cue` and `note` are for the person holding the paper.
 */
export type ScriptLine =
  /** Words said out loud. */
  | { t: "say"; text: string; /** Rendered as a bracketed pill before the line. */ mark?: string }
  /** Approved material quoted verbatim, with its attribution. */
  | { t: "quote"; lead?: string; text: string; by: string }
  /** The دجداج reveal — the four senses, set exactly as the team supplied them. */
  | { t: "answer"; items: readonly string[] }
  /** A delivery marker: pause, smile, look at the room. Not spoken. */
  | { t: "cue"; text: string }
  /** A longer aside for the speaker only — pacing, what is on screen, a caution. */
  | { t: "note"; text: string };

/** One stretch of the talk: a heading, a memory cue, and the lines in order. */
export type ScriptChapter = {
  id: string;
  /** The point's own title, so the script reads like the deck it belongs to. */
  heading: string;
  /** The chain to hold in the head while this stretch is being read. */
  cue?: string;
  /** `point` id in `data/points.ts`, used for duration and emphasis. */
  point?: string;
  /** The opening question screen, or the closing pair. Styled apart from the rest. */
  tone?: "opening" | "final";
  /** A duration to show when the stretch is not a point on the stage. */
  durationLabel?: string;
  lines: readonly ScriptLine[];
};

export type SpeakerScript = {
  /** Route segment: `/script/<slug>`. */
  slug: string;
  /** Section id in `data/presentation.ts` — joins the script to its points. */
  sectionId: string;
  /** The script's own speaker name. See {@link SCRIPT_SPEAKERS}. */
  speaker: string;
  /** The chapter's title, taken from `sections` so it can never disagree. */
  topic: string;
  shortTitle: string;
  numeral: string;
  /** Section length as the stage shows it. */
  durationLabel: string;
  /** The section's anchor line — the one thing the audience should leave with. */
  anchor: string;
  /** The whole chapter as one chain of memories. */
  memoryCue: string;
  /** The section's pacing note, shown once as a timing aside. */
  pacing: string;
  chapters: readonly ScriptChapter[];
  /** Where this speaker hands the room over. Absent for the last speaker. */
  handoff?: { teaser: string; line: string; to: string; toSlug: string };
};

/* -------------------------------------------------------------------------- */
/*  Speakers                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Who reads what, on these pages.
 *
 * Kept beside the scripts rather than in `data/presentation.ts` because it is
 * a statement about the scripts, not about the stage. `sections[1].speaker`
 * stays as it is, and so does `sections[1].speakerBackup` — neither is edited,
 * imported or re-exported from here.
 */
export const SCRIPT_SPEAKERS = {
  batool: "أ. بتول ياسر",
  walaa: "أ. ولاء",
  hanin: "أ. حنين حسن",
  anwar: "أ. أنور السادات",
} as const;

export const SCRIPT_SLUGS = ["batool", "walaa", "hanin", "anwar"] as const;
export type ScriptSlug = (typeof SCRIPT_SLUGS)[number];

const SECTION_DURATION_LABEL = clockToArabicDigits(
  formatClock(SECTION_DURATION_SECONDS),
);

/** The دجداج opening's own budget — it runs beside the chapter, not inside it. */
const OPENING_TOTAL_LABEL = `${toArabicDigits(OPENING_DURATION_SECONDS)} ثانية`;

/* -------------------------------------------------------------------------- */
/*  01 — Identity · أ. بتول ياسر                                               */
/* -------------------------------------------------------------------------- */

const batool: SpeakerScript = {
  slug: "batool",
  sectionId: sections[0].id,
  speaker: SCRIPT_SPEAKERS.batool,
  topic: sections[0].title,
  shortTitle: sections[0].shortTitle,
  numeral: sections[0].numeral,
  durationLabel: SECTION_DURATION_LABEL,
  anchor: sections[0].notes.anchor,
  memoryCue: "السؤال ← القرآن ← الدين ← القدم ← الأدب ← الهوية",
  pacing: sections[0].notes.pacing,
  chapters: [
    {
      id: "opening",
      heading: "الافتتاح — دجداج",
      cue: "اسأل ← اصمت ← اقرأ المعنى ← اربط",
      tone: "opening",
      durationLabel: OPENING_TOTAL_LABEL,
      lines: [
        { t: "say", text: `${openingChallenge.cardTitle} ${openingChallenge.cardLine}`, mark: "ابدأ بالبطاقة" },
        { t: "cue", text: "[اسأل الجمهور]" },
        { t: "say", text: openingChallenge.ask },
        { t: "note", text: `على الشاشة يظهر السؤال كما هو: ${openingChallenge.question}` },
        {
          t: "cue",
          text: `[انتظر الإجابة] ${toArabicDigits(openingChallenge.questionSeconds)} ثانية صمتاً — لا تملأها، ولا تقدّم الإجابة مبكراً.`,
        },
        { t: "say", text: "المعنى كما هو، أربعة:", mark: "اقرأ المعنى" },
        { t: "answer", items: openingAnswerLines() },
        { t: "say", text: openingChallenge.connection },
        { t: "say", text: openingChallenge.takeaway },
        {
          t: "say",
          text: "لو تغيّرت لغتنا كل يوم، فماذا نظنّ أننا نخسر؟",
          mark: "اسأل ثم انتقل",
        },
      ],
    },
    {
      id: "intro",
      heading: "المدخل",
      cue: "لماذا نحن؟",
      lines: [
        {
          t: "say",
          text: "كلنا نتكلم العربية كل يوم… بس هل سألنا أنفسنا، لماذا هذه هي لغتنا تحديداً؟",
          mark: "ابدأ",
        },
        {
          t: "say",
          text: "جواب هذا المحور في جملة واحدة: العربية ليست لغة تواصل فقط — إنها جزء من الهوية.",
        },
      ],
    },
    {
      id: "quran",
      heading: "لغة القرآن",
      cue: "العلاقة ← الآية ← المعنى",
      point: "quran",
      lines: [
        {
          t: "say",
          text: "قبل كل شيء: العربية لغة نزل بها القرآن.",
          mark: "ابدأ بالعلاقة",
        },
        {
          t: "note",
          text: "دع الآية تظهر على الشاشة قبل أن تنطق بها، ولا تقرأ كل النص المعروض حرفياً.",
        },
        { t: "cue", text: "[توقف قصير]" },
        {
          t: "quote",
          lead: "قال تعالى:",
          text: identityQuotes[0].text,
          by: identityQuotes[0].attribution,
        },
        {
          t: "say",
          text: "نزلت بها الرسالة، فبقيت لغة كتابها العظيم.",
        },
        {
          t: "say",
          text: "ومن ارتباطها بالقرآن، ننتقل إلى مكانتها عند الصحابة.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "umar",
      heading: "العربية في الدين",
      cue: "قول عمر ← دين",
      point: "umar",
      lines: [
        {
          t: "say",
          text: "صار تعلّم العربية عندنا أمراً دينياً لا اختياراً.",
          mark: "ابدأ بالقول",
        },
        {
          t: "quote",
          text: identityQuotes[1].text,
          by: identityQuotes[1].attribution,
        },
        {
          t: "say",
          text: "\"من دينكم\" — بهذا القول صار تعلّم العربية دليلاً على مركزيتها، لا مجرد اقتباس.",
        },
        { t: "cue", text: "[توقف قصير]" },
        {
          t: "say",
          text: "ومن شهادها في الدين، إلى طول عمرها.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "age",
      heading: "قدم اللغة العربية",
      cue: "٢٩ قرناً ← سؤال القاعة",
      point: "age",
      lines: [
        {
          t: "say",
          text: "العربية ظهرت قبل نحو ٢٩ قرناً، فبقيت لغتها وتاريخها النحوي أطول عمراً.",
          mark: "اذكر الرقم كما هو",
        },
        {
          t: "note",
          text: "الرقم من المادة. لا تضف تواريخ أو عصوراً غير مذكورة.",
        },
        { t: "cue", text: "[اسأل الجمهور]" },
        {
          t: "say",
          text: "كم لغة أقدم منها؟",
        },
        { t: "cue", text: "[انتظر الإجابة]" },
        {
          t: "say",
          text: "ورغم هذا القدم ما زالت تحتفظ بتاريخها اللغوي والنحوي.",
        },
        {
          t: "say",
          text: "ومن طول عمرها، إلى ما كتبت بها.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "poetry",
      heading: "الإبداع العربي",
      cue: "شعر ← أدب ← بلاغة ← تعدد المعاني",
      point: "poetry",
      lines: [
        {
          t: "say",
          text: "على مدى العصور كانت العربية لغةً تُقرأ لما فيها، لا لمجرّد التخاطب.",
          mark: "ابدأ بالفكرة",
        },
        {
          t: "say",
          text: "لغة الشعر والأدب بفروعه المتنوعة، لبلاغتها وتعدد معانيها.",
        },
        {
          t: "note",
          text: "شدّد على تعدد المعاني. أعطِ مثالاً واحداً سريعاً إن اتسع الوقت.",
        },
        {
          t: "say",
          text: "ومن لغتها التي نقرأ بها، إلى لغتنا التي نحن.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "identity",
      heading: "الجسر إلى الهوية",
      cue: "دين ← معرفة ← أدب ← هوية",
      point: "identity",
      lines: [
        { t: "cue", text: "[بتركيز]" },
        {
          t: "say",
          text: "لأنها لغة الدين، ولأنها لغة المعرفة، ولأنها لغة الأدب… صارت العربية جزءاً من الهوية نفسها، لا تفصيلاً فيها.",
        },
        { t: "cue", text: "[توقف قصير]" },
        {
          t: "say",
          text: sections[0].notes.anchor,
        },
      ],
    },
  ],
  handoff: {
    teaser: "العربية أقدم من كل ما نعرفه عنها… فكيف تحافظ على حضورها في زمن الشاشة؟",
    line: `${SCRIPT_SPEAKERS.walaa} ستأخذنا إلى إجابتها.`,
    to: SCRIPT_SPEAKERS.walaa,
    toSlug: "walaa",
  },
};

/* -------------------------------------------------------------------------- */
/*  02 — Technology · أ. ولاء                                                   */
/* -------------------------------------------------------------------------- */

const walaa: SpeakerScript = {
  slug: "walaa",
  sectionId: sections[1].id,
  speaker: SCRIPT_SPEAKERS.walaa,
  topic: sections[1].title,
  shortTitle: sections[1].shortTitle,
  numeral: sections[1].numeral,
  durationLabel: SECTION_DURATION_LABEL,
  anchor: sections[1].notes.anchor,
  memoryCue: "المحتوى ← التطبيقات ← القراءة ← الإعلام ← التعريب ← المبادرات",
  pacing: sections[1].notes.pacing,
  chapters: [
    {
      id: "intro",
      heading: "المدخل",
      cue: "الواقع ← السؤال ← الخلاصة",
      tone: "opening",
      lines: [
        {
          t: "say",
          text: sections[1].hook as string,
          mark: "ابدأ بالسؤال",
        },
        { t: "cue", text: "[اسأل الجمهور]" },
        {
          t: "say",
          text: "هل يهدّد التغيّرُ العربيةَ أم يحملها إلى الأمام؟",
        },
        { t: "cue", text: "[انتظر الإجابة]" },
        {
          t: "say",
          text: sections[1].notes.anchor,
          mark: "أجب عن السؤال",
        },
      ],
    },
    {
      id: "content",
      heading: "المحتوى الرقمي",
      cue: "رصين ← لا مجرد حضور",
      point: "content",
      lines: [
        { t: "say", text: "أول خطوة: المحتوى.", mark: "ابدأ بالمحور الأول" },
        {
          t: "say",
          text: "ويكيبيديا، والمدونات، والمواقع بمحتوى رصين في شتى العلوم والتقنيات.",
        },
        { t: "say", text: "العربية تحتاج محتوى، لا مجرد حضور." },
        {
          t: "say",
          text: "والمحتوى وحده لا يكفي — يحتاج من يستخدمه.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "apps",
      heading: "التطبيقات والألعاب",
      cue: "قواعد ← شيق ← الأجيال الناشئة",
      point: "apps",
      lines: [
        {
          t: "say",
          text: "ثم التطبيقات والألعاب التعليمية: قواعد اللغة وأدبها بأسلوب شيق.",
          mark: "مرّ بسرعة",
        },
        {
          t: "say",
          text: "ألعاب تعليمية ومسابقات لغوية للأجيال الناشئة.",
        },
        { t: "note", text: "لا تذكر اسم تطبيق غير موجود في المادة." },
        {
          t: "say",
          text: "ومن استخدام التطبيق، إلى التعلّم نفسه.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "learning",
      heading: "القراءة والتعلم",
      cue: "قراءة ← ربط ← بدون تلقين",
      point: "learning",
      lines: [
        { t: "say", text: "ونرجع للأساس: القراءة.", mark: "ابدأ" },
        {
          t: "say",
          text: "تشجيع قراءة الكتب والمقالات الرصينة بانتظام.",
        },
        {
          t: "say",
          text: "وربط القواعد وتاريخها بمهارات القرن الحادي والعشرين، بعيداً عن أساليب التلقين الجافة.",
        },
        {
          t: "say",
          text: "ومن التعلم، إلى ما نراه ونسمعه.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "media",
      heading: "الإعلام وصناعة المحتوى",
      cue: "وثائقي ← مسلسلات ← فصحى قريبة",
      point: "media",
      lines: [
        {
          t: "say",
          text: "وبعدين، ما نراه ونسمعه: أفلام وثائقية ومسلسلات هادفة.",
          mark: "ابدأ",
        },
        {
          t: "say",
          text: "تخاطب الشباب بفصحى واضحة وقريبة.",
        },
        {
          t: "note",
          text: "القرب من الشباب هو الفكرة — الفصحى ما تعني لغة بعيدة.",
        },
        {
          t: "say",
          text: "ومن الإعلام، إلى المحتوى العلمي نفسه.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "science",
      heading: "تعريب العلوم والتقنية",
      cue: "مصطلحات ← ذكاء اصطناعي ← مسألة لا حل",
      point: "science",
      lines: [
        {
          t: "say",
          text: "وأهم ما يحتاجه العصر الآن: تسريع حركة تعريب العلوم الحديثة ومصطلحات التقنية والذكاء الاصطناعي.",
          mark: "شدّد",
        },
        {
          t: "say",
          text: "المصطلح المترجم يطرح مسألة، لا أنها الحل.",
        },
        {
          t: "say",
          text: "والهدف: بقاء اللغة قادرة على مواكبة العصر.",
        },
        {
          t: "say",
          text: "ومن المصطلحات، إلى المبادرات التي تقودها المجموعة.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "community",
      heading: "المبادرات المجتمعية",
      cue: "تطوع ← ورش ← صون",
      point: "community",
      lines: [
        {
          t: "say",
          text: "وبآخر الطريق: مبادرات تطوعية وورش عمل.",
          mark: "ابدأ بالمحور السادس",
        },
        {
          t: "say",
          text: "للتعزيز الوعي بأهمية الحفاظ على سلامة اللغة كلغة تفكير وعمل وعلم.",
        },
        { t: "cue", text: "[توقف قصير]" },
        {
          t: "say",
          text: techTakeaway,
          mark: "الخلاصة — اقرأها كما هي",
        },
        { t: "note", text: "لا تضف محوراً سابعاً — هذه هي الخلاصة." },
      ],
    },
  ],
  handoff: {
    teaser: "بينما نعيش على الشاشات، كم كلمة عربية نمرّ عليها دون أن نعرفها؟",
    line: "أ. حنين حسن لها أن تجيب.",
    to: SCRIPT_SPEAKERS.hanin,
    toSlug: "hanin",
  },
};

/* -------------------------------------------------------------------------- */
/*  03 — Discovery · أ. حنين حسن                                                */
/* -------------------------------------------------------------------------- */

const hanin: SpeakerScript = {
  slug: "hanin",
  sectionId: sections[2].id,
  speaker: SCRIPT_SPEAKERS.hanin,
  topic: sections[2].title,
  shortTitle: sections[2].shortTitle,
  numeral: sections[2].numeral,
  durationLabel: SECTION_DURATION_LABEL,
  anchor: sections[2].notes.anchor,
  memoryCue: "مالطا ← النجم ← كتاب العين",
  pacing: sections[2].notes.pacing,
  chapters: [
    {
      id: "intro",
      heading: "المدخل",
      cue: "تعجب ← ثلاثة ← انتقل",
      tone: "opening",
      lines: [
        {
          t: "say",
          text: "ثلاث أشياء لا تتوقعونها عن لغتنا.",
          mark: "ابدأ بالتعجب",
        },
        { t: "say", text: sections[2].hook as string },
        { t: "cue", text: "[اسأل الجمهور]" },
        { t: "cue", text: "[انتظر الإجابة] دع أحداً يجيب قبل أن تبدأ بالحقيقة الأولى." },
        { t: "cue", text: "[انتقل]" },
      ],
    },
    {
      id: "maltese",
      heading: "اللغة المالطية",
      cue: "من العربية ← بحروف لاتينية",
      point: "maltese",
      lines: [
        {
          t: "say",
          text: "أولها: لغة كاملة تطورت من العربية.",
          mark: "ابدأ بالتعجب",
        },
        { t: "say", text: "تُستخدم اليوم في مالطا." },
        {
          t: "say",
          text: "لكنها لم تعد تُكتب بحروفها — بحروف لاتينية.",
        },
        {
          t: "note",
          text: "لا تضف تاريخاً أو تفصيلاً لم يرد في المادة.",
        },
        {
          t: "say",
          text: "ولننتقل إلى مفاجأة أخرى — من لغة، إلى سماء.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "aldebaran",
      heading: "النجم العربي",
      cue: "Aldebaran ← الدبران ← التابع",
      point: "aldebaran",
      lines: [
        {
          t: "say",
          text: "ثانيها: نجم في السماء، أصل اسمه عربي.",
          mark: "ابدأ",
        },
        {
          t: "say",
          text: "Aldebaran — سُمّي بالدبران، أي «التابع».",
        },
        {
          t: "say",
          text: "لأنه يبدو أنه يتبع مجموعة نجوم أخرى في السماء.",
        },
        {
          t: "note",
          text: "أظهر الاسم الثلاثي: Aldebaran، الدبران، التابع.",
        },
        {
          t: "say",
          text: "ومن السماء، إلى أول كتاب في اللغة.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "alain",
      heading: "كتاب العين",
      cue: "أول معجم ← بمخارج الأصوات",
      point: "alain",
      lines: [
        { t: "say", text: "ثالثها — وهذه المفاجأة الأكبر: أول معجم في اللغة.", mark: "ابدأ" },
        { t: "say", text: "للخليل بن أحمد الفراهيدي." },
        {
          t: "say",
          text: "مميّزته أنه لم يُرتَّب أبجدياً، بل اعتمد ترتيباً خاصاً بمخارج أصوات الحروف.",
        },
        {
          t: "note",
          text: "شدّد: الترتيب بالمخرج، لا بالحرف. الحروف على الشاشة مجمّعة حول الفم.",
        },
        { t: "cue", text: "[توقف قصير]" },
      ],
    },
    {
      id: "recap",
      heading: "الخلاصة",
      cue: "ثلاث حقائق ← تكسر التوقّع",
      lines: [
        {
          t: "say",
          text: "ثلاث حقائق: لغة كاملة خرجت من لغتنا، ونجم في السماء أصل اسمه عربي، وأول معجم رتّب الحروف بمخارجها.",
          mark: "اجمع الثلاثة",
        },
        { t: "say", text: sections[2].notes.anchor },
      ],
    },
  ],
  handoff: {
    teaser: "من أين جاءت هذه الكلمات؟ ومن أين جاءت اللغة التي تحملها؟",
    line: "أ. أنور السادات سيعيدنا إلى جذور السؤال.",
    to: SCRIPT_SPEAKERS.anwar,
    toSlug: "anwar",
  },
};

/* -------------------------------------------------------------------------- */
/*  04 — History · أ. أنور السادات                                              */
/* -------------------------------------------------------------------------- */

const anwar: SpeakerScript = {
  slug: "anwar",
  sectionId: sections[3].id,
  speaker: SCRIPT_SPEAKERS.anwar,
  topic: sections[3].title,
  shortTitle: sections[3].shortTitle,
  numeral: sections[3].numeral,
  durationLabel: SECTION_DURATION_LABEL,
  anchor: sections[3].notes.anchor,
  memoryCue: "الجذور ← ما قبل الإسلام ← الإسلام ← الأمويون ← العباسيون ← الترجمة ← أوروبا",
  pacing: sections[3].notes.pacing,
  chapters: [
    {
      id: "intro",
      heading: "المدخل",
      cue: "سؤال ← سبع محطات",
      tone: "opening",
      lines: [
        { t: "say", text: sections[3].hook as string, mark: "ابدأ بالسؤال" },
        {
          t: "say",
          text: "لمحطة وراء محطة — سبع محطات، ثم أربع كلمات.",
        },
      ],
    },
    {
      id: "roots",
      heading: "الجذور",
      cue: "أعرق اللغات ← الجزيرة والشام والحجاز",
      point: "roots",
      lines: [
        { t: "say", text: "نبدأ من الجذور.", mark: "المحطة الأولى" },
        {
          t: "say",
          text: "العربية من أعرق اللغات، ولها جذور قديمة في الجزيرة والشام والحجاز.",
        },
        { t: "cue", text: "[انتقل]" },
      ],
    },
    {
      id: "pre-islam",
      heading: "ما قبل الإسلام",
      cue: "قرون طويلة ← لغة التخاطب",
      point: "pre-islam",
      lines: [
        { t: "say", text: "ثم قرون طويلة قبل الإسلام.", mark: "المحطة الثانية" },
        {
          t: "say",
          text: "تطورت وانتشرت حتى صارت لغة التخاطب الأولى في الجزيرة.",
        },
        { t: "cue", text: "[انتقل]" },
      ],
    },
    {
      id: "islam",
      heading: "ظهور الإسلام",
      cue: "فتوحات ← لغة القرآن ← لغة رسمية",
      point: "islam",
      lines: [
        { t: "say", text: "وجاء الإسلام.", mark: "المحطة الثالثة" },
        {
          t: "say",
          text: "انتشرت انتشاراً واسعاً، وصارت لغة القرآن ولغة رسمية في دول كثيرة.",
        },
        { t: "cue", text: "[انتقل]" },
      ],
    },
    {
      id: "umayyad",
      heading: "العصر الأموي",
      cue: "من الأموي ← كتابة ودواوين",
      point: "umayyad",
      lines: [
        {
          t: "say",
          text: "مع الأمويين بدأت مكانتها العلمية تتّضح.",
          mark: "المحطة الرابعة",
        },
        { t: "say", text: "وأصبحت لغة الكتابة والدواوين." },
        { t: "cue", text: "[انتقل]" },
      ],
    },
    {
      id: "abbasid",
      heading: "العصر العباسي",
      cue: "عهد المأمون ← بيت الحكمة",
      point: "abbasid",
      lines: [
        { t: "say", text: "ثم العصر العباسي.", mark: "المحطة الخامسة" },
        {
          t: "say",
          text: "في عهد المأمون صارت بيتاً للحكمة، فازدهر النحو والصرف والبلاغة.",
        },
        { t: "cue", text: "[انتقل]" },
      ],
    },
    {
      id: "translation",
      heading: "حركة الترجمة",
      cue: "اليونان ← فارس ← الهند",
      point: "translation",
      lines: [
        { t: "say", text: "وهنا اللحظة الكبرى: حركة الترجمة.", mark: "المحطة السادسة" },
        {
          t: "say",
          text: "نُقلت علوم اليونان وفارس والهند إلى العربية.",
        },
        {
          t: "say",
          text: "ومن انتقال العلوم، إلى انتقال الكلمات.",
          mark: "[انتقل]",
        },
      ],
    },
    {
      id: "influence",
      heading: "إلى أوروبا",
      cue: "تعلّم ← انتقلت ← أربع كلمات",
      point: "influence",
      lines: [
        { t: "say", text: "ومن بيت الحكمة، إلى أوروبا.", mark: "المحطة السابعة" },
        {
          t: "say",
          text: "تعلّم علماء وطلاب الأوروبيين العربية، وانتقلت معها كلماتها إلى لغاتهم.",
        },
        {
          t: "say",
          text: influenceWords.map((w) => w.word).join(" · "),
          mark: "أظهر الكلمات الأربع",
        },
        {
          t: "say",
          text: influenceWords.map((w) => w.meaning).join(" · "),
        },
        { t: "note", text: "لا تضف كلمات أخرى غير مذكورة." },
        { t: "say", text: historyClosing.tail },
      ],
    },
    {
      id: "closing",
      heading: "الختام",
      cue: "الجذور ← التأثير ← الحاضر ← المستقبل",
      tone: "final",
      lines: [
        {
          t: "say",
          text: historyClosing.lead,
          mark: "اجمع الرحلة",
        },
        {
          t: "say",
          text: sections[3].notes.anchor,
        },
        { t: "cue", text: "[توقف قصير]" },
        { t: "say", text: closing.statement, mark: "اقرأ الجملة كما هي" },
        { t: "cue", text: "[اصمت] ثم اطرح السؤال" },
        { t: "say", text: closing.question, mark: "[ابتسم]" },
        { t: "cue", text: "[انتظر الإجابة] اترك الصمت بعد السؤال — هو الجزء المهم." },
        { t: "say", text: closing.thanksSpoken, mark: "اشكر" },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Registry                                                                   */
/* -------------------------------------------------------------------------- */

export const scripts: SpeakerScript[] = [batool, walaa, hanin, anwar];

/** The script for a route segment, or `null` for anything else. */
export function scriptFor(slug: string | undefined): SpeakerScript | null {
  if (!slug) return null;
  return scripts.find((s) => s.slug === slug) ?? null;
}

/** Seconds the given chapter runs, from its point on the stage. `null` if untimed. */
export function chapterSeconds(
  script: SpeakerScript,
  chapter: ScriptChapter,
): number | null {
  if (!chapter.point) return null;
  const point = pointFor(script.sectionId, chapter.point);
  return point?.durationSeconds ?? null;
}

/** The approved emphasis phrases to bold in a chapter's spoken lines. */
export function chapterEmphasis(
  script: SpeakerScript,
  chapter: ScriptChapter,
): readonly string[] {
  if (!chapter.point) return [];
  return pointFor(script.sectionId, chapter.point)?.emphasis ?? [];
}

