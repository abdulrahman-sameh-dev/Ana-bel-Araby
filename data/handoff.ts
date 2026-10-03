/**
 * The opening is three screens, not one.
 *
 * `card` → `question` → `answer` is a deliberate sequence rather than a single
 * slide with a reveal button on it, because the room has to be *asked* before it
 * can be *answered*, and a question that appears the instant the stage opens has
 * given the audience no moment to prepare to think. The card buys that moment.
 *
 * The answer then gets a screen of its own instead of a panel underneath the
 * question, so that when the speaker explains the word, the screen is showing the
 * word and not two things at once.
 *
 * ## Timing
 *
 * {@link openingChallenge.questionSeconds} is for the *interaction* — asking,
 * then letting the room think. {@link openingChallenge.answerSeconds} is for
 * reading the answer and the one line that connects it. Both are presenter
 * timing: they live here and on `/presenter`, never as text on the projector.
 */

import { sections, type PresenterNotes } from "@/data/presentation";


/** The three screens the opening walks through, in order. */
export const OPENING_STEPS = ["card", "question", "answer"] as const;
export type OpeningStep = (typeof OPENING_STEPS)[number];

export const openingChallenge = {
  /* ── screen 1: the card ── */
  /** The face of the card, before anything is revealed. */
  cardTitle: "قبل أن نبدأ…",
  /**
   * One line under it that invites the room in without explaining the trick.
   *
   * It has to work as audience copy: anything phrased as «اضغط» would be an
   * instruction to whoever is holding the clicker, which is what the rest of
   * this deck refuses to put on a projector.
   */
  cardLine: "سؤال واحد، ثم صمت.",
  /**
   * Handover-only. The line the presenter says out loud when they turn the card.
   * It never reaches the screen — the audience sees only the question.
   */
  ask: "حد يعرف يعني إيه كلمة دجداج؟",

  /* ── screen 2: the question ── */
  question: "ما معنى كلمة دجداج؟",

  /**
   * Seconds allotted to the interaction itself: the question is on screen, the
   * room is thinking. The brief's figure.
   */
  questionSeconds: 40,

  /* ── screen 3: the answer ── */
  /**
   * The meaning, as the team supplies it. Newlines break the lines, so it is
   * *set* as written rather than re-flowed by the component.
   *
   * Four senses, because the point of the word is that it has more than one:
   * the blackness itself, the feminine form, the idiomatic night, and the verb
   * it comes from. Any one of them alone would be a dictionary entry; the four
   * together are why the room cannot answer it from memory.
   *
   * The four forms are linguistically distinct and must stay that way. They were
   * corrected here, at source, after the team checked them against the Arabic
   * Language Academy in Cairo — the deck had been carrying الدُّجَاج and الدُّجْجَة,
   * which are not this word:
   *
   * - الدَّجْدَاج — الأسود من كل شيء، والشديد الظلمة. The word itself.
   * - دَجْدَاجَة — its feminine, hence ليلة دَجْدَاجَة.
   * - الدُّجَّة — شدة الظلمة. A different noun from the word above, with a
   *   shadda on the ج, so it cannot be written interchangeably with it.
   * - دَجَّ الليلُ — أَظلمَ. The verb.
   *
   * Note that الدَّجَاج is the familiar word for chicken and is *not* this entry.
   *
   * The question above stays unvocalized on purpose: the room meets the word
   * cold, and this answer is where the pronunciation is finally given.
   *
   * Quoting is kept as the team supplied it, including its straight quotation
   * marks. An earlier version "tidied" them into guillemets «» —
   * typographically defensible in an Arabic deck and factually identical, and
   * therefore still wrong, because the one instruction this answer came with was
   * to use it exactly. If the quoting is ever revisited, it is a change to raise
   * with the team, not a thing to smooth over unasked.
   */
  answer: [
    'الدَّجْدَاج من كل شيء: السواد والظلمة، ويُقال لكل شيء أسود ومظلم "دُجاج".',
    'وهي بتاء: الكلمة المؤنثة منها بالتاء المربوطة هي "دَجْدَاجَة".',
    'ليلة دَجْدَاجَة: أي ليلة مظلمة جداً وشديدة السواد، وشدة الظلمة اسمها "الدُّجَّة".',
    'ومن ذلك الفعل "دَجَّ" إذا أظلم، ويقال: "دَجَّ الليلُ" أي غطى كل شيء بظلامه.',
  ].join("\n"),
  /**
   * The bridge from the word to the subject, in one line.
   *
   * Kept to a single sentence deliberately: this is the hinge of the whole
   * opening, and a second sentence here turns a turn into a paragraph the
   * audience has to read before they are back on the deck's subject.
   */
  connection: "في العربية كلمات كثيرة لا نعرفها، وهذا جزء من ثراء اللغة وغناها.",
  /** The realization the room leaves the opening with. */
  takeaway: "كم كلمة عربية نستخدمها فعلاً، وكم كلمة أخرى لا نعرفها؟",
  /** Seconds allotted to reading the answer and the line that connects it. */
  answerSeconds: 20,
  /**
   * Seconds for the card — the beat before the question, not part of the 60.
   *
   * This was previously the number 5 written into the pacing sentence by hand,
   * while {@link openingBudgetFor} handed the card the 40-second question
   * budget, because `card` was not `answer` and the ternary fell through. Two
   * places, two answers, and the presenter page agreed with one of them. A
   * named constant beside the other two is the whole fix.
   */
  cardSeconds: 5,

  /** Configurable: the opening has its own presenter, independent of section 01. */
  presenter: "",
  /** The backup applies here too, same as anywhere else on the deck. */
  presenterBackup: "أ ولاء",
} as const;

/**
 * The opening's own budget: the interaction plus the answer.
 *
 * Kept as a derived value rather than a third hand-typed number, so the notes
 * panel's clock can never disagree with the two segments it is made of.
 */
export const OPENING_DURATION_SECONDS =
  openingChallenge.questionSeconds + openingChallenge.answerSeconds;

/** `answer` split into the lines it is set as, blanks dropped. */
export function openingAnswerLines(): string[] {
  return openingChallenge.answer
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Which of the three screens the given index is on. */
export function openingStepAt(index: number): OpeningStep {
  const clamped = Math.max(0, Math.min(OPENING_STEPS.length - 1, index));
  return OPENING_STEPS[clamped];
}

/** The presenter budget for one of the opening's three screens. */
export function openingBudgetFor(step: OpeningStep): number {
  if (step === "answer") return openingChallenge.answerSeconds;
  if (step === "card") return openingChallenge.cardSeconds;
  return openingChallenge.questionSeconds;
}

/**
 * Notes for the opening, in the same shape the four chapters use.
 *
 * They live beside the challenge rather than in `presentation.ts` because every
 * word in them is about the challenge — the shell needs a `NotesSource` for
 * every stage, and the opening is a stage like any other.
 */
export const openingNotes: PresenterNotes = {
  anchor: "سؤال واحد، ثم صمت — والصمت هو الجزء المهم.",
  pacing: `البطاقة (${openingChallenge.cardSeconds}ث)، السؤال (${openingChallenge.questionSeconds}ث)، الإجابة (${openingChallenge.answerSeconds}ث)، ثم سلّم.`,
  cues: [
    "أظهر البطاقة واتركها ثوانٍ قبل قلبها — لا تعطِ السؤال فور الدخول.",
    "قل جملة السؤال بصوتك: «حد يعرف يعني إيه كلمة دجداج؟» ثم اصمت.",
    `الصمت المقصود ${openingChallenge.questionSeconds} ثانية. لا تملأه، ولا تقدّم الإجابة مبكراً.`,
    "اقرأ المعنى الأربعة، ثم جملة الربط، ثم جملة السؤال الختامي.",
    "ثم اطرح سؤال المحور التالي قبل التسليم.",
  ],
};

/**
 * One hand-off per chapter, so the deck reads as a single story handed from
 * person to person rather than four independent pages.
 *
 * The closing two stages (ما وراء العرض, فريق غيث) are not presenter-led, so
 * they have no hand-off line — the team is on stage together there.
 *
 * The teasers are written as questions about the *next* chapter, not about the
 * one that just ended. A hand-off that summarises what the room has already
 * heard is a recap; one that raises something unanswered is a bridge.
 */
export type Handoff = {
  /** Stage or section id this hand-off leaves. */
  from: string;
  /** Who picks it up. Presentation logistics — see the note below. */
  to: string;
  /** The question about the chapter that is coming. This is the hand-off. */
  teaser: string;
  /** The line the outgoing presenter says out loud to walk the room into it. */
  line: string;
  /** A short imperative for the handout. */
  cue: string;
};

export const handoffs: Handoff[] = [
  {
    from: "opening",
    to: sections[0].speaker,
    teaser: "لو تغيّرت لغتنا كل يوم، فماذا نظنّ أننا نخسر؟",
    line: "دعوا أ. بتول ياسر تأخذنا إلى الجواب.",
    cue: "اقرأ السؤال، ثم سلّم الكلمة.",
  },
  {
    from: sections[0].id,
    to: sections[1].speaker,
    teaser: "العربية أقدم من كل ما نعرفه عنها… فكيف تحافظ على حضورها في زمن الشاشة؟",
    line: "أ. عبدالرحمن سامح سيأخذنا إلى إجابته.",
    cue: "اترك السؤال معلّقاً، ثم سلّم للتكنولوجيا.",
  },
  {
    from: sections[1].id,
    to: sections[2].speaker,
    teaser: "بينما نعيش على الشاشات، كم كلمة عربية نمرّ عليها دون أن نعرفها؟",
    line: "أ. حنين حسن لها أن تجيب.",
    cue: "اربط الشاشة بالكلمة، ثم سلّم للمفاجآت.",
  },
  {
    from: sections[2].id,
    to: sections[3].speaker,
    teaser: "من أين جاءت هذه الكلمات؟ ومن أين جاءت اللغة التي تحملها؟",
    line: "أ. أنور السادات سيعيدنا إلى جذور السؤال.",
    cue: "اختم بالمفاجأة الأخيرة، ثم سلّم للتاريخ.",
  },
];

/** The hand-off that leaves the given section, or `null` if it ends the talk. */
export function handoffFor(sectionId: string | null | undefined): Handoff | null {
  if (!sectionId) return null;
  return handoffs.find((h) => h.from === sectionId) ?? null;
}

/** The hand-off that leaves the opening question for the first chapter. */
export function openingHandoff(): Handoff {
  return handoffs[0];
}

/**
 * The hand-off as one quotable line, for the last point of a chapter.
 *
 * `data/points.ts` gives every point a `transition` the handout shows under
 * «الانتقال», and the last point of a chapter is the natural place for the
 * hand-off. Deriving the string from the same source the stage renders means
 * the speaker cannot read a different sentence from the one the room sees.
 * Falls back to a plain hand-over line where a chapter has no teaser.
 */
export function handoffBridge(sectionId: string): string {
  const handoff = handoffFor(sectionId);
  if (!handoff) return "انتهى هذا المحور — ننتقل إلى ما بعده.";
  return `${handoff.teaser} — ${handoff.line}`;
}
