/**
 * The speaking sequence, as data.
 *
 * The deck used to show every talking point of a section at once and let the
 * audience read the whole argument off a wall of cards. That is fine for a
 * handout and wrong for a talk: the speaker says them one at a time, in order,
 * and the screen should follow the voice.
 *
 * So the flow lives here rather than inside the section components. Each point
 * carries everything three consumers need and the component tree does not
 * have to repeat itself:
 *
 *   1. the section components, which render the *visual* for the current point;
 *   2. the shell, which owns the arrow keys and the point index;
 *   3. `/presenter`, the mobile handout, which renders the point's script.
 *
 * Content is still taken from the team's own material in `Assets/`. The one
 * deliberate departure is the opening challenge, which is an audience warm-up
 * rather than a sourced claim and so lives in `@/data/handoff`.
 */

import {
  identityPoints,
  identityQuotes,
  techNodes,
  techTakeaway,
  discoveryFacts,
  timelineEras,
  influenceWords,
  historyClosing,
  type InfoPoint,
  type TechNode,
  type DiscoveryFact,
  type TimelineEra,
} from "@/data/presentation";
import { handoffBridge } from "@/data/handoff";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * What the audience is looking at while a point is on stage.
 *
 * The union is deliberately narrow: each variant names a visual the section
 * components already know how to draw, which is what keeps the spotlight
 * generic instead of a slot every section can stuff anything into.
 */
export type PointVisual =
  /** The Qur'an verse, set large. */
  | { kind: "verse"; text: string; attribution: string }
  /** A saying in the dark card. */
  | { kind: "saying"; text: string; attribution: string }
  /** The team's own artwork, uncropped. */
  | { kind: "artwork"; src: string; alt: string }
  /** A term, rendered as a typographic specimen. */
  | { kind: "term"; text: string; latin?: string; note?: string }
  /** The four European loanwords, as the closing flourish. */
  | {
      kind: "loanwords";
      words: { word: string; index: string; meaning: string }[];
    }
  /** The articulation schematic for كتاب العين. */
  | { kind: "articulation" }
  /** A short list, used where the material was already a list. */
  | { kind: "beats"; items: string[] }
  /**
   * The before/after evidence captures on «ما وراء العرض».
   *
   * Its own kind because no other one is honest about it: these are paired
   * screenshots a presenter walks through by hand, not a word set, a quote or a
   * list. Describing them as `beats` would tell the speaker there are lines to
   * read aloud, which is exactly the narration `behindNotes` forbids.
   */
  | { kind: "evidence"; pairs: number; note: string };

/** One beat in a talk: what is shown, what is said, how long, and what comes after. */
export type PresentationPoint = {
  id: string;
  /** Two-digit ordinal as the audience sees it, e.g. "٠١". */
  index: string;
  /** The point's name, used by the navigator and the handout. */
  title: string;
  /** One line of supporting text under the title. */
  headline: string;
  /** What the presenter says. Longer than a cue; still not a script. */
  explanation: string;
  /** How the audience should be looking. Also read by the handout. */
  onScreen: string;
  /**
   * Roughly how long this point runs, in seconds.
   *
   * `null` for a stop that is walked at the presenter's own pace and therefore
   * has no clock at all — the same convention the stage already uses for its
   * untimed screens, so a stop cannot claim a budget the projector does not
   * show. Both readers guard for it rather than printing "٠ ثانية".
   */
  durationSeconds: number | null;
  /** Cues for the presenter, in the order they are needed. */
  presenterNotes: string[];
  /**
   * The literal words or phrase to land on when this point is spoken.
   *
   * Authored rather than derived on purpose: a derived highlight ("the title,
   * bolded") is decoration, and the presenter holding a phone in one hand
   * needs the two words that must carry the point, not a formatting hint.
   * `/presenter` shows these as chips under "شدّد على".
   */
  emphasis: string[];
  /** The bridge into the next point, quoted so it can be said verbatim. */
  transition: string;
  visual: PointVisual;
};

export type PointSection = {
  id: string;
  points: PresentationPoint[];
};

/* -------------------------------------------------------------------------- */
/*  Stage 01 — Identity                                                        */
/* -------------------------------------------------------------------------- */

const identityPointsById = Object.fromEntries(
  identityPoints.map((p: InfoPoint) => [p.id, p]),
) as Record<string, InfoPoint>;

const verse = identityQuotes[0];
const saying = identityQuotes[1];

/**
 * The order here is the order the brief asks for, which also happens to be
 * the order the argument should be made in: scripture, then the testimony
 * about it, then its age, then its literature, and only then the claim that it
 * is an identity.
 *
 * The argument closes on "this is part of who we are", so the artwork and the
 * saying recede as the section progresses instead of competing with the point
 * on stage.
 */
const identitySequence: PointSection = {
  id: "identity",
  points: [
    {
      id: "quran",
      index: "٠١",
      title: "لغة القرآن",
      headline: identityPointsById.quran.headline,
      explanation: "نزلت بها الرسالة، فبقيت لغة كتابها العظيم.",
      onScreen: "الآية كاملة، بخط كبير، هي العنصر الوحيد على الشاشة.",
      durationSeconds: 20,
      presenterNotes: [
        "ابدأ بعلاقة العربية بالقرآن الكريم.",
        "نزلت بها الرسالة الخاتمة.",
        "دع الآية تظهر بصرياً قبل أن تنطق بها.",
        "لا تقرأ كل النص المعروض حرفياً.",
      ],
      emphasis: ["القرآن الكريم"],
      transition: "ومن ارتباطها بالقرآن، ننتقل إلى مكانتها عند الصحابة.",
      visual: {
        kind: "verse",
        text: verse.text,
        attribution: verse.attribution,
      },
    },
    {
      id: "umar",
      index: "٠٢",
      // Was «قول عمر بن الخطاب», which named the speaker a second time — the
      // saying's own visual already carries the attribution — and set the quote
      // as the headline as well, so the quote and the name each appeared twice.
      //
      // The title now names the *claim* the saying makes, the visual states the
      // quote once with its attribution once, and the headline says what it
      // changed. Three different statements of one point instead of two copies
      // of the same one.
      title: "العربية في الدين",
      headline: "جعل تعلّم العربية أمراً دينياً لا اختياراً.",
      /* Handout-only, so it may restate the quote freely: the room sees the
         saying once and this consequence once, and the speaker still has the
         full attribution in front of them. */
      explanation:
        "قالها عمر بن الخطاب رضي الله عنه، فجعل تعلّم العربية أمراً دينياً لا اختياراً.",
      onScreen: "القول في بطاقة داكنة، بخط نسخي، مع اسم المتحدث.",
      durationSeconds: 15,
      presenterNotes: [
        "اذكر قول عمر بن الخطاب.",
        "اربط تعلم العربية بالدين.",
        "هذا دليل على مركزيتها، لا مجرد اقتباس.",
      ],
      emphasis: ["من دينكم"],
      transition: "ومن شهادها في الدين، إلى طول عمرها.",
      visual: {
        kind: "saying",
        text: saying.text,
        attribution: saying.attribution,
      },
    },
    {
      id: "age",
      index: "٠٣",
      title: "قدم اللغة العربية",
      headline: identityPointsById.root.headline,
      explanation:
        "ظهرت العربية قبل نحو ٢٩ قرناً، فبقيت لغتها وتاريخها النحوي أطول عمراً.",
      onScreen: "رقم ٢٩ في المقدمة، بجوار جملة واحدة.",
      durationSeconds: 15,
      presenterNotes: [
        "الرقم من المادة: اذكره كما هو.",
        "لا تضف تواريخ أو عصوراً غير مذكورة.",
        "اربط القدم ببقاء تاريخها اللغوي والنحوي.",
        "سؤال مفتوح للقاعة: كم لغة أقدم منها؟",
      ],
      emphasis: ["٢٩ قرناً"],
      transition: "ومن طول عمرها، إلى ما كتبت بها.",
      visual: {
        kind: "term",
        text: "٢٩ قرناً",
      },
    },
    {
      id: "poetry",
      index: "٠٤",
      // Was «الشعر والأدب والبلاغة», listing three of the four words the beats
      // graphic below it sets as four separate specimens. The graphic is the
      // better carrier — it is the point's visual — so the title names the
      // domain and lets the list be stated once.
      title: "الإبداع العربي",
      headline: identityPointsById.poetry.headline,
      explanation:
        "على مدى العصور كانت العربية لغة الشعر والأدب بفروعه المتنوعة، لبلاغتها وتعدد معانيها.",
      onScreen: "ثلاث كلمات: الشعر · الأدب · البلاغة، وتعدد المعاني.",
      durationSeconds: 15,
      presenterNotes: [
        "الشعر والأدب والبلاغة.",
        "شدّد على تعدد المعاني.",
        "أعطِ مثالاً واحداً سريعاً إن اتسع الوقت.",
      ],
      emphasis: ["الشعر", "الأدب", "البلاغة", "تعدد المعاني"],
      transition: "ومن لغتها التي نقرأ بها، إلى لغتنا التي نحن.",
      visual: {
        kind: "beats",
        items: ["الشعر", "الأدب", "البلاغة", "تعدد المعاني"],
      },
    },
    {
      id: "identity",
      index: "٠٥",
      title: "الجسر إلى الهوية",
      headline: identityPointsById.identity.headline,
      explanation:
        "لأنها لغة الدين والمعرفة والأدب، صارت جزءاً من الهوية نفسها، لا تفصيلاً فيها.",
      onScreen: "الجملة الختامية وحدها، كبيرة، ثم صمت.",
      durationSeconds: 15,
      presenterNotes: [
        "هذه هي خلاصة القسم.",
        "لغة الدين والمعرفة والأدب.",
        "اختم: العربية جزء من الهوية، وليست تفصيلاً فيها.",
        "توقف لحظة قبل الانتقال.",
      ],
      emphasis: ["جزء من الهوية", "لا تفصيلاً فيها"],
      // The last point of a chapter hands over, and the handout has to say it
      // the same way the hand-off screen will.
      transition: handoffBridge("identity"),
      // Was `kind: "artwork"`, the same calligraphy the section already shows in
      // its persistent column. That column used to be dropped on exactly this
      // point to avoid the duplication; now that it is mounted for the whole
      // chapter, the two would be on screen together, so the point's visual is
      // the words instead. The closing line of the chapter deserves the largest
      // type in the section, and the calligraphy beside it is what it is
      // standing next to.
      visual: { kind: "term", text: "جزءٌ من الهوية" },
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Stage 02 — Technology                                                      */
/* -------------------------------------------------------------------------- */

const techById = Object.fromEntries(
  techNodes.map((n: TechNode) => [n.id, n]),
) as Record<string, TechNode>;

const techSequence: PointSection = {
  id: "technology",
  points: [
    {
      id: "content",
      index: "٠١",
      title: techById.content.label,
      headline: techById.content.headline,
      explanation:
        "المحتوى الرقمي: ويكيبيديا والمدونات والمواقع بمحتوى رصين. العربية تحتاج محتوى، لا مجرد حضور.",
      onScreen: "اسم المحور وشروحه، والبقية كخريطة صامتة.",
      durationSeconds: 12,
      presenterNotes: [
        "المحتوى الرقمي.",
        "ويكيبيديا والمدونات والمواقع.",
        "المحتوى الرصين هو أول خطوة.",
      ],
      emphasis: ["المحتوى الرصين", "لا مجرد حضور"],
      transition: "المحتوى وحده لا يكفي — يحتاج من يستخدمه.",
      visual: { kind: "term", text: techById.content.label, latin: techById.content.latin },
    },
    {
      id: "apps",
      index: "٠٢",
      title: techById.apps.label,
      headline: techById.apps.headline,
      explanation:
        "التطبيقات والألعاب التعليمية: القواعد والأدب بأسلوب شيق للأجيال الناشئة.",
      onScreen: "المحور الحالي على الشاشة، وبقية المحاور مصغّرة.",
      durationSeconds: 12,
      presenterNotes: [
        "التطبيقات والألعاب.",
        "القواعد والأدب بأسلوب للأجيال الناشئة.",
        "لا تذكر اسم تطبيق غير موجود في المادة.",
      ],
      emphasis: ["أسلوب شيق", "الأجيال الناشئة"],
      transition: "ومن استخدام التطبيق، إلى التعلّم نفسه.",
      visual: { kind: "term", text: techById.apps.label, latin: techById.apps.latin },
    },
    {
      id: "learning",
      index: "٠٣",
      title: techById.learning.label,
      headline: techById.learning.headline,
      explanation: "القراءة والتعلم: ربط القواعد بمهارات القرن الحادي والعشرين.",
      onScreen: "المحور الحالي على الشاشة، وبقية المحاور مصغّرة.",
      durationSeconds: 12,
      presenterNotes: [
        "القراءة والتعلم.",
        "ربط القواعد بمهارات القرن الحادي والعشرين.",
      ],
      emphasis: ["ربط القواعد", "مهارات القرن الحادي والعشرين"],
      transition: "ومن التعلم، إلى ما نراه ونسمعه.",
      visual: {
        kind: "term",
        text: techById.learning.label,
        latin: techById.learning.latin,
      },
    },
    {
      id: "media",
      index: "٠٤",
      title: techById.media.label,
      headline: techById.media.headline,
      explanation:
        "الإعلام وصناعة المحتوى: أفلام وثائقية ومسلسلات بالفصحى القريبة من الشباب.",
      onScreen: "المحور الحالي على الشاشة، وبقية المحاور مصغّرة.",
      durationSeconds: 12,
      presenterNotes: [
        "الإعلام وصناعة المحتوى.",
        "أفلام وثائقية ومسلسلات بالفصحى.",
        "القرب من الشباب هو الفكرة.",
      ],
      emphasis: ["الفصحى القريبة من الشباب"],
      transition: "ومن الإعلام، إلى المحتوى العلمي نفسه.",
      visual: { kind: "term", text: techById.media.label, latin: techById.media.latin },
    },
    {
      id: "science",
      index: "٠٥",
      title: techById.science.label,
      headline: techById.science.headline,
      explanation:
        "تعريب العلوم والتقنية والذكاء الاصطناعي: تسريع مصطلحات التقنية التي ترد في الحياة اليومية.",
      onScreen: "المحور الحالي على الشاشة، وبقية المحاور مصغّرة.",
      durationSeconds: 12,
      presenterNotes: [
        "تعريب العلوم والتقنية والذكاء الاصطناعي.",
        "تسريع مصطلحات التقنية.",
        "اذكر أن المصطلح المترجم يطرح مسألة، لا أنها الحل.",
      ],
      emphasis: ["تعريب العلوم", "الذكاء الاصطناعي"],
      transition: "ومن المصطلحات، إلى المبادرات التي تقودها المجموعة.",
      visual: { kind: "term", text: techById.science.label, latin: techById.science.latin },
    },
    {
      id: "community",
      index: "٠٦",
      title: techById.community.label,
      headline: techById.community.headline,
      explanation:
        `المبادرات وورش العمل التطوعية لصون اللغة. ثم الخلاصة: ${techTakeaway}`,
      onScreen: "المحور السادس على الشاشة؛ الخلاصة تُقال بعده ولا تُعرض.",
      durationSeconds: 12,
      presenterNotes: [
        "المبادرات وورش العمل.",
        "ورش العمل التطوعية.",
        "حملات وصون للغة.",
        `ثم اختم بالخلاصة كما هي: ${techTakeaway}`,
        "لا تضف محوراً سابعاً — هذه هي الخلاصة.",
      ],
      emphasis: ["المبادرات وورش العمل التطوعية", "لا يعني تجميدها"],
      transition: handoffBridge("technology"),
      visual: {
        kind: "term",
        text: techById.community.label,
        latin: techById.community.latin,
      },
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Stage 03 — Discovery                                                       */
/* -------------------------------------------------------------------------- */

const factsById = Object.fromEntries(
  discoveryFacts.map((f: DiscoveryFact) => [f.id, f]),
) as Record<string, DiscoveryFact>;

const discoverySequence: PointSection = {
  id: "discovery",
  points: [
    {
      id: "maltese",
      index: "٠١",
      title: factsById.maltese.title,
      headline: factsById.maltese.headline,
      explanation: factsById.maltese.detail,
      onScreen: "المالطية هي الكافئة — تحوّل من العربية إلى اللاتينية.",
      durationSeconds: 30,
      presenterNotes: [
        "ابدأ بالتعجب.",
        "لغة كاملة تطورت من العربية.",
        "تُستخدم اليوم في مالطا.",
        "لم تعد تُكتب بحروفها، بل بالحروف اللاتينية.",
        "لا تضف تاريخاً أو تاريخياً لم يرد في المادة.",
      ],
      emphasis: ["لغة كاملة من العربية", "بحروف لاتينية"],
      transition: "ولننتقل إلى مفاجأة أخرى — من موت لغة إلى سماء.",
      visual: {
        kind: "beats",
        items: factsById.maltese.beats,
      },
    },
    {
      id: "aldebaran",
      index: "٠٢",
      title: "النجم العربي",
      headline: factsById.aldebaran.title,
      explanation: factsById.aldebaran.detail,
      onScreen: "سماء ليلية ونجم، مع الأسماء الثلاثة: Aldebaran، الدبران، التابع.",
      durationSeconds: 30,
      presenterNotes: [
        "نجم في السماء أصل اسمه عربي.",
        "Aldebaran.",
        "سُمّي بالدبران، أي «التابع».",
        "لأنه يبدو أنه يتبع مجموعة نجوم أخرى.",
        "اضغط على النجم لإبراز الأسماء.",
      ],
      emphasis: ["Aldebaran", "الدبران", "التابع"],
      transition: "ومن السماء، إلى أول كتاب في اللغة.",
      visual: {
        kind: "term",
        text: "الدبران",
        latin: "Aldebaran",
        note: factsById.aldebaran.detail,
      },
    },
    {
      id: "alain",
      index: "٠٣",
      title: "كتاب العين",
      headline: factsById.alain.headline,
      explanation: factsById.alain.detail,
      onScreen: "مخطط مخارج الأصوات: حروف مجمّعة حول الفم.",
      durationSeconds: 30,
      presenterNotes: [
        "أول معجم في اللغة.",
        "للخليل بن أحمد الفراهيدي.",
        "مميّزته: لم يُرتَّب أبجدياً.",
        "اعتمد ترتيباً خاصاً بمخارج أصوات الحروف.",
        "شدّد: هذا هو الفكرة — الترتيب بالمخرج، لا بالحرف.",
      ],
      emphasis: ["ترتيب مخارج الأصوات", "لا أبجدياً"],
      transition: handoffBridge("discovery"),
      visual: { kind: "articulation" },
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Stage 04 — History                                                         */
/* -------------------------------------------------------------------------- */

const erasById = Object.fromEntries(
  timelineEras.map((e: TimelineEra) => [e.id, e]),
) as Record<string, TimelineEra>;

const historySequence: PointSection = {
  id: "history",
  points: [
    ...(
      ["roots", "pre-islam", "islam", "umayyad", "abbasid", "translation"] as const
    ).map((id, i) => ({
      id,
      index: erasById[id].index,
      title: erasById[id].title,
      headline: erasById[id].period,
      explanation: erasById[id].detail,
      onScreen: `المحطة ${erasById[id].title} وحدها، والخط الزمني مصغّر حولها.`,
      durationSeconds: 8,
      presenterNotes: [
        `${erasById[id].title}: ${erasById[id].period}.`,
        erasById[id].detail,
        "لا تضف تواريخ لم ترد في المادة.",
      ],
      // The era's own name is what fills the stage, so it is what has to be
      // said clearly. Deriving it here keeps the six mapped eras consistent
      // with the timeline rail the audience is reading.
      emphasis: [erasById[id].title],
      transition:
        i === 5 ? "ومن انتقال العلوم، إلى انتقال الكلمات." : "ومن هنا، إلى المحطة التالية.",
      visual: {
        kind: "term" as const,
        text: erasById[id].title,
        note: erasById[id].period,
      },
    })),
    {
      id: "influence",
      index: "٠٧",
      title: erasById.europe.title,
      // The four words live in `visual`, drawn once. Naming them here as well
      // printed the same list twice on the same screen.
      //
      // The headline is the effect the four words are evidence *for* — not the
      // chapter's general claim, which the era six stops behind it have already
      // made, and which is not what an audience is being asked to notice about
      // a list of Latin words.
      headline: historyClosing.influence,
      explanation: erasById.europe.detail,
      onScreen: historyClosing.influence,
      durationSeconds: 25,
      presenterNotes: [
        "تعلم بعض العلماء والطلاب الأوروبيين العربية.",
        "وانتقلت إلى اللغات الأوروبية كلمات ومصطلحات.",
        "أربع كلمات أصلها عربي: Algebra · Alchemy · Algorithm · Alcohol.",
        historyClosing.tail,
        "لا تضف كلمات أخرى غير مذكورة.",
      ],
      emphasis: ["Algebra", "Alchemy", "Algorithm", "Alcohol"],
      // The last chapter has no hand-off — it is where the four speakers step
      // down together and the team comes on stage.
      transition: "انتهى العرض — ننتقل الآن إلى ما وراء الشرائح، وإلى الفريق.",
      visual: { kind: "loanwords" as const, words: influenceWords },
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Registry                                                                   */
/* -------------------------------------------------------------------------- */

export const pointSections: PointSection[] = [
  identitySequence,
  techSequence,
  discoverySequence,
  historySequence,
];

/** Points for one section, by id. Returns an empty list for a non-section. */
export function pointsFor(sectionId: string | undefined): PresentationPoint[] {
  if (!sectionId) return [];
  return pointSections.find((s) => s.id === sectionId)?.points ?? [];
}

export function pointFor(
  sectionId: string | undefined,
  pointId: string | undefined,
): PresentationPoint | null {
  const points = pointsFor(sectionId);
  if (points.length === 0) return null;
  return points.find((p) => p.id === pointId) ?? points[0];
}
