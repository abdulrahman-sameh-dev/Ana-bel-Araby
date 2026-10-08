/**
 * `/handout` — the read-only outline behind the quick-reference page.
 *
 * The handout is a *cue sheet*, not a second presentation: one section, one
 * screen, everything the speaker has to remember without walking point by
 * point. It is a consumer of the deck's own data and never a source — nothing
 * in `@/data/*` or in the audience/presenter pages imports this file, so it
 * cannot change how the approved presentation behaves.
 *
 * ## What is kept, and why
 *
 * The deck already holds every string the handout shows. The only decision
 * made here is *which* of them a speaker glancing at a phone needs:
 *
 * | handout block   | lifted from                                             |
 * | --------------- | ------------------------------------------------------- |
 * | الخلاصة         | `section.notes.anchor` — the "if you say one thing" line |
 * | التوقيت         | `section.durationSeconds` + `section.notes.pacing`      |
 * | النقاط          | each point's `title` (the keyword) + `headline` (one line) |
 * | لا تنسَ         | `point.emphasis`, minus anything already stated elsewhere |
 * | لابد من ذكره    | verbatim material: `verse`, `saying` and `loanwords` visuals |
 * | التسليم        | the last point's `transition` — how the chapter ends     |
 *
 * ## The one piece of judgement
 *
 * `emphasis` is authored as "the words that must carry the point", so it is
 * exactly what a cue sheet wants. It is also redundant with the point titles on
 * chapter 04, where the emphasis *is* the era name, and with the loanwords,
 * which appear both as emphasis and as the point's visual. So the two filters
 * below drop an emphasis entry when the same words are already on the page as
 * a point title or as quoted material. Nothing is lost — the words are still
 * there, once — and chapter 04 does not print its seven eras twice.
 */

import { sections } from "@/data/presentation";
import { pointSections, type PresentationPoint } from "@/data/points";
import {
  OPENING_DURATION_SECONDS,
  openingAnswerLines,
  openingChallenge,
  openingHandoff,
  openingNotes,
  handoffFor,
} from "@/data/handoff";
import { clockToArabicDigits, formatClock } from "@/lib/format";

/* -------------------------------------------------------------------------- */
/*  Shape                                                                      */
/* -------------------------------------------------------------------------- */

export type HandoutPoint = {
  index: string;
  title: string;
  headline: string;
};

/** Verbatim material — a quotation, or a word the room has to see spelled out. */
export type HandoutMust = {
  text: string;
  /** Attribution, or the familiar meaning beside a loanword. */
  source?: string;
  /** Set in the Latin face when the specimen itself is Latin. */
  latin?: boolean;
};

/** The دجداج warm-up. Present on the opening entry only. */
export type HandoutInteraction = {
  /** The line said out loud before the room is asked. */
  ask: string;
  /** Presenter cues for running the interaction, in order. */
  cues: string[];
  /** The four senses, as the data sets them. */
  answer: string[];
  /** The one line that turns the word back into the talk. */
  connection: string;
};

export type HandoutEntry = {
  id: string;
  kind: "opening" | "section";
  /** `"افتتاح"` on the warm-up, a chapter numeral everywhere else. */
  numeral: string;
  /** The short name for the nav chips: `section.shortTitle`, or `"افتتاح"`. */
  navLabel: string;
  kicker: string;
  title: string;
  /** `null` on the opening, whose presenter is not set in the data. */
  speaker: string | null;
  durationLabel: string | null;
  pacing: string | null;
  /** The one-line purpose of the section. */
  core: string;
  /** The argument in order. Empty on the opening. */
  points: HandoutPoint[];
  emphasis: string[];
  musts: HandoutMust[];
  /** How the chapter ends or hands over — the last point's `transition`. */
  close: string;
  /** Who picks it up next, or `null` where the deck itself ends. */
  next: string | null;
  interaction?: HandoutInteraction;
};

/* -------------------------------------------------------------------------- */
/*  Derivation — all read-only                                                 */
/* -------------------------------------------------------------------------- */

/** `90` → `"٠١:٣٠"`. `null` stays `null`; nobody needs a clock they have not. */
function durationLabel(seconds: number | null): string | null {
  if (seconds == null) return null;
  return clockToArabicDigits(formatClock(seconds));
}

function pointsOf(sectionId: string): PresentationPoint[] {
  return pointSections.find((s) => s.id === sectionId)?.points ?? [];
}

/**
 * The material that has to be *said verbatim*, taken from the visuals that
 * already carry it: the verse, the saying, and the four European loanwords.
 *
 * These are the only three visuals in the deck whose text is quoted rather
 * than described, which is precisely the line between "must mention" and
 * "described better by the point headline".
 */
function quotesOf(points: PresentationPoint[]): HandoutMust[] {
  const musts: HandoutMust[] = [];
  for (const p of points) {
    const v = p.visual;
    if (v.kind === "verse" || v.kind === "saying") {
      musts.push({ text: v.text, source: v.attribution });
    } else if (v.kind === "loanwords") {
      for (const w of v.words) musts.push({ text: w.word, source: w.meaning, latin: true });
    }
  }
  return musts;
}

/**
 * `emphasis`, flattened, de-duplicated, and stripped of anything already
 * stated on the page — see the note at the top of this file.
 */
function emphasisOf(points: PresentationPoint[], musts: HandoutMust[]): string[] {
  const titles = points.map((p) => p.title);
  const spoken = musts.map((m) => m.text);
  const overlaps = (value: string) =>
    titles.some((t) => t.includes(value) || value.includes(t)) ||
    spoken.some((s) => s.includes(value) || value.includes(s));

  const out: string[] = [];
  for (const p of points) {
    for (const entry of p.emphasis) {
      if (overlaps(entry) || out.includes(entry)) continue;
      out.push(entry);
    }
  }
  return out;
}

function sectionEntry(section: (typeof sections)[number]): HandoutEntry {
  const points = pointsOf(section.id);
  const musts = quotesOf(points);
  const handoff = handoffFor(section.id);

  return {
    id: section.id,
    kind: "section",
    numeral: section.numeral,
    navLabel: section.shortTitle,
    kicker: section.kicker,
    title: section.title,
    speaker: section.speaker,
    durationLabel: durationLabel(section.durationSeconds),
    pacing: section.notes.pacing,
    core: section.notes.anchor,
    points: points.map((p) => ({
      index: p.index,
      title: p.title,
      headline: p.headline,
    })),
    emphasis: emphasisOf(points, musts),
    musts,
    close: points[points.length - 1]?.transition ?? "",
    next: handoff?.to ?? null,
  };
}

/**
 * The دجداج warm-up, kept deliberately small — a question, the cue to ask it
 * with, the answer, and the line that turns back to the talk. It is not a fifth
 * chapter and is not given chapter blocks.
 */
function openingEntry(): HandoutEntry {
  return {
    id: "opening",
    kind: "opening",
    numeral: "افتتاح",
    navLabel: "افتتاح",
    kicker: openingChallenge.cardTitle,
    title: openingChallenge.question,
    speaker: null,
    durationLabel: durationLabel(OPENING_DURATION_SECONDS),
    pacing: openingNotes.pacing,
    core: openingNotes.anchor,
    points: [],
    emphasis: [],
    musts: [],
    close: openingChallenge.takeaway,
    next: openingHandoff().to,
    interaction: {
      ask: openingChallenge.ask,
      // One cue exists purely to tell the speaker to say `ask` out loud. The
      // ask is rendered as its own line above it, so keeping that cue would
      // print the same sentence twice on a page that has no room to spare.
      cues: openingNotes.cues.filter((cue) => !cue.includes(openingChallenge.ask)),
      answer: openingAnswerLines(),
      connection: openingChallenge.connection,
    },
  };
}

/**
 * All five handout pages, in presentation order: the warm-up, then chapters
 * 01–04.
 */
export function handoutEntries(): HandoutEntry[] {
  return [openingEntry(), ...sections.map(sectionEntry)];
}
