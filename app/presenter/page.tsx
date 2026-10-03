"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Clock,
  Eye,
  ChevronDown,
  Keyboard,
  MessageSquareQuote,
  PencilLine,
  Lightbulb,
  Highlighter,
  UserRound,
  UserRoundCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import {
  presentation,
  cover,
  sections,
  closing,
  teamCredits,
  behindTask,
  behindNotes,
  evidencePairs,
} from "@/data/presentation";
import {
  openingChallenge,
  openingAnswerLines,
  handoffBridge,
  handoffFor,
} from "@/data/handoff";
import { pointSections, type PresentationPoint } from "@/data/points";
import {
  describePointVisual,
  emphasisOf,
  spokenDuration,
} from "@/lib/presenter-brief";
import { TeamMark } from "@/components/presentation/team-mark";

/** The opening's own hand-off, as one line: the teaser, then the speaker. */
const openingHandoffBridge = () => handoffBridge("opening");

/**
 * The presenter handout — `/presenter`.
 *
 * Built for a phone held in one hand on a lectern, which is the situation it is
 * actually used in. That drives every decision here:
 *
 * - **It is independent of the stage.** There is no socket, no shared state, no
 *   polling, and no server. The two screens share data, not a connection, so a
 *   dropped Wi-Fi link mid-talk can never desynchronise what the room is
 *   looking at from what the speaker is reading. If the team later wants them
 *   linked, that is a separate, deliberate change.
 * - **The sequence is navigable, not scrollable-and-hoped-for.** A speaker
 *   mid-talk needs the next point, not the ability to hunt for it.
 * - **Personal notes are saved to the device.** `localStorage` only: no account,
 *     no backend, nothing that could leak the team's material off the phone.
 * - **Mobile first.** The layout is one column by default and only widens into
 *     two on a tablet in landscape.
 *
 * Reading the content is deliberately lazy about the DOM: one point is rendered
 * at a time, so the whole talk is a few kilobytes of React rather than several
 * thousand nodes of text nobody is looking at.
 */

/** One stop in the talk. A section has points; the open and the close have one. */
type Stop = {
  id: string;
  label: string;
  /**
   * Who is speaking this stop, and who stands behind them. `null` on the cover
   * and the closing, where the team is on stage together rather than one
   * member taking the floor.
   */
  speaker: { primary: string; backup: string } | null;
  /** The section's own notes, folded away behind the point cues. */
  points: PresentationPoint[];
  /** Present when the stop is not a timed chapter. */
  note?: { title: string; lines: string[] };
};

const sectionById = Object.fromEntries(sections.map((s) => [s.id, s]));

/** A chapter's speaker, read from the same row the stage footer reads. */
const chapterSpeaker = (id: string) => {
  const s = sectionById[id];
  return s ? { primary: s.speaker, backup: s.speakerBackup } : null;
};

const STOPS: Stop[] = [
  {
    id: "cover",
    label: "الغلاف",
    speaker: null,
    points: [
      {
        id: "title",
        index: "٠١",
        title: `${presentation.title} — ${presentation.subtitle}`,
        headline: cover.line,
        explanation:
          "لا تتكلم هنا. اترك الغلاف على الشاشة بضع ثوانٍ، ثم انتقل بالسهم إلى سؤال الافتتاح.",
        onScreen:
          "الشعار، ثم العنوان «أنا بالعربي»، ثم السطر الفاصل، وثلاث كلمات: الهوية · العلم · المستقبل، والتاريخ أسفل يسار الشاشة والمدة أسفل يمينها.",
        durationSeconds: 15,
        presenterNotes: [
          "تأكد أن الإضاءة والصوت جاهزان قبل الضغط.",
          "اترك الشريحة مكثوفة — هي أول ما يراه الحضور من الفريق.",
          "ثم اضغط السهم مرة واحدة للانتقال إلى سؤال الافتتاح.",
        ],
        // The keyboard hint this used to borrow from the cover is an audience-
        // facing string; the handout states the move in its own words instead.
        emphasis: ["أنا بالعربي"],
        transition: "ثم انتقل بسهم واحد إلى سؤال الافتتاح.",
        visual: { kind: "term", text: cover.team },
      },
    ],
  },
  {
    id: "opening",
    label: "الافتتاح",
    speaker: chapterSpeaker(sections[0].id),
    /* Three entries, because the opening is three screens. The handout mirrors
       the projector beat for beat: if a point is not listed here, the speaker
       cannot rehearse it, and if it is listed twice, they rehearse it twice. */
    points: [
      {
        id: "card",
        index: "٠١",
        title: "البطاقة",
        headline: openingChallenge.cardTitle,
        explanation:
          "صمتٌ مقصود. يحتاج الحضور أن يعرف أن شيئاً سيأتي قبل أن يُسألوا عنه، فلا تملأ هذا الوقت بكلام.",
        onScreen: `${openingChallenge.cardTitle} — ${openingChallenge.cardLine}. لا السؤال بعد.`,
        /* Not part of either budget. See the note in the shell. */
        durationSeconds: 5,
        presenterNotes: [
          "أظهر البطاقة واتركها ثوانٍ. لا تقل شيئاً بعد أن تظهر.",
          "ثم اقلبها بزر «التالي» — البطاقة نفسها قابلة للضغط أيضاً.",
        ],
        emphasis: ["الصمت قبل السؤال"],
        transition: openingHandoffBridge(),
        visual: { kind: "term", text: openingChallenge.cardTitle },
      },
      {
        id: "question",
        index: "٠٢",
        title: "السؤال",
        headline: openingChallenge.question,
        explanation: openingChallenge.ask,
        onScreen: `السؤال وحده: «${openingChallenge.question}»`,
        /* The interaction budget: asked, then left alone. */
        durationSeconds: openingChallenge.questionSeconds,
        presenterNotes: [
          "اقرأ السؤال بصوتك ثم اصمت.",
          `الصمت المقصود ${toArabicDigits(openingChallenge.questionSeconds)} ثانية — لا تملأه.`,
        ],
        emphasis: [`${toArabicDigits(openingChallenge.questionSeconds)} ثانية صمت`],
        transition: openingHandoffBridge(),
        visual: { kind: "term", text: openingChallenge.question },
      },
      {
        id: "reveal",
        index: "٠٣",
        title: "كشف المعنى",
        headline: openingAnswerLines()[0] ?? openingChallenge.takeaway,
        explanation: openingChallenge.connection,
        onScreen: `المعنى الأربعة، ثم: ${openingChallenge.connection}`,
        durationSeconds: openingChallenge.answerSeconds,
        presenterNotes: [
          /* The four forms, in the order `openingChallenge.answer` gives them. Listed
     literally because this is the order the speaker reads them aloud, and a
     cue that quietly reordered the senses would teach them the wrong pairing.
     Must be kept in step with the answer in `data/handoff.ts`. */
          "اقرأ المعنى الأربعة بالترتيب: الدَّجْدَاج، دَجْدَاجَة، الدُّجَّة، دَجَّ.",
          "ثم جملة الربط، ثم جملة السؤال الختامي.",
          "ثم اطرح سؤال الهوية قبل التسليم.",
        ],
        emphasis: [openingChallenge.takeaway],
        transition: openingHandoffBridge(),
        visual: { kind: "term", text: openingChallenge.takeaway },
      },
    ],
  },
  ...pointSections.map((s) => ({
    id: s.id,
    label: sectionById[s.id]?.shortTitle ?? s.id,
    speaker: chapterSpeaker(s.id),
    points: s.points,
  })),
  {
    /* «ما وراء العرض» is a full screen the room sees — the projector carries it
       between `history` and `ghaith` — so it needs a stop here. Without one the
       presenter steps through the exact moment the talk leaves the narrative and
       shows the evidence, holding nothing but a stale history note; and
       `behindNotes`, which is where the pacing for it actually lives, was
       reachable only from the projector's own notes overlay. Every string below
       is read from the data the stage renders, so the two cannot drift. */
    id: "behind",
    label: behindTask.title,
    speaker: null,
    points: [
      {
        id: "task",
        index: "٠١",
        title: behindTask.title,
        headline: behindTask.purpose,
        explanation: behindNotes.anchor,
        onScreen: `${behindTask.kicker} — ${behindTask.title}. ${behindTask.requirement} ${behindTask.evidenceNote}`,
        /* No clock, matching the stage: this screen is walked at the presenter's
           own pace, and `behindNotes.pacing` is what governs it. */
        durationSeconds: null,
        presenterNotes: behindNotes.cues,
        /* Empty on purpose: `emphasisOf` falls back to the point's own title.
           The only other candidate is the requirement, and an eighty-character
           sentence does not belong in a chip meant to be read at a glance. */
        emphasis: [],
        transition: "ثم فريق غيث.",
        visual: {
          kind: "evidence",
          pairs: evidencePairs.length,
          note: behindTask.evidenceNote,
        },
      },
    ],
  },
  {
    id: "ghaith",
    label: "الفريق",
    speaker: null,
    points: [
      {
        id: "credits",
        index: "٠١",
        title: teamCredits.headline,
        headline: teamCredits.bridge,
        explanation:
          "اذكر المجموعات الخمس، ثم المتحدثين الأربعة، ثم الاحتياطي، ثم انتقل إلى الخاتمة.",
        onScreen: `${presentation.team} — ${presentation.dateLabel}: ${presentation.date}`,
        durationSeconds: 30,
        presenterNotes: [
          "بحث الهوية: رنا، بسنت، نور.",
          "صلة العربية بعالمها: عبدالرحمن، أنور، ولاء.",
          "التاريخ: حنين، رنا، بسنت — المعلومات: حبيبة، بتول، مروة.",
          "الهانداوت: بتول، رنا، بسنت.",
          "المتحدثون: بتول، عبدالرحمن، حنين، أنور. الاحتياطي: ولاء.",
          "ثم انتقل إلى شاشة الختام.",
        ],
        emphasis: ["أسماء الفريق", "ثم الاحتياطي"],
        transition: "ثم الخاتمة.",
        visual: { kind: "term", text: "غيث" },
      },
    ],
  },
  {
    id: "closing",
    label: "الخاتمة",
    speaker: null,
    points: [
      {
        id: "thanks",
        index: "٠١",
        title: closing.question,
        headline: closing.statement,
        explanation:
          "اقرأ الجملة، ثم اصمت، ثم اطرح السؤال. الشكر يأتي بعد السؤال لا قبله.",
        onScreen: `${closing.statementLines.join(" ")} ثم: ${closing.questionLines.join(" ")} ثم «${closing.thanks}».`,
        durationSeconds: 30,
        presenterNotes: [
          `اقرأ الجملة كما هي: ${closing.statement}`,
          "اصمت بعدها — الصمت بعد الجملة مقصود.",
          `ثم اطرح السؤال: ${closing.question}`,
          "دع الصمت مرة أخرى بعد السؤال.",
          `ثم اشكر: ${closing.thanksSpoken}`,
          "افتح باب الأسئلة، ولا تعُد إلى أي شريحة.",
        ],
        emphasis: [closing.question],
        transition: "انتهى العرض. ابدأ الأسئلة.",
        visual: { kind: "term", text: closing.question },
      },
    ],
  },
];

const NOTES_KEY = "ghayth:presenter-notes:v1";

export default function PresenterHandout() {
  const reduced = usePrefersReducedMotion();
  const [stopIndex, setStopIndex] = useState(0);
  const [pointIndex, setPointIndex] = useState(0);
  /** What is being typed for the current point; `null` until something is. */
  const [draft, setDraft] = useState<string | null>(null);
  /** Everything saved on this device, keyed `stop.point`. */
  const [stored, setStored] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NOTES_KEY);
      setStored(raw ? (JSON.parse(raw) as Record<string, string>) : {});
    } catch {
      // A private-mode browser can refuse storage. The handout still works; the
      // notes just do not survive a reload.
      setStored({});
    }
  }, []);

  const stop = STOPS[stopIndex];
  const point = stop.points[Math.min(pointIndex, stop.points.length - 1)];
  const handoff = handoffFor(stop.id);
  const key = `${stop.id}.${point.id}`;

  // Moving to another point abandons the draft, and the field falls back to
  // whatever is stored for the point now on screen.
  useEffect(() => {
    setDraft(null);
  }, [key]);

  const value = draft ?? stored[key] ?? "";

  const save = (value: string) => {
    setDraft(value);
    setStored((prev) => {
      const next = { ...prev, [key]: value };
      try {
        window.localStorage.setItem(NOTES_KEY, JSON.stringify(next));
      } catch {
        // Nothing to do: the note stays in `draft` for this session.
      }
      return next;
    });
  };

  const go = (stopDelta: number, pointDelta: number) => {
    let s = stopIndex;
    let p = pointIndex;

    if (stopDelta !== 0) {
      // A deliberate jump to another stop: forward lands on its first point,
      // back on its last, so the presenter arrives where they left off.
      s += stopDelta;
      p = stopDelta > 0 ? 0 : s >= 0 && s < STOPS.length ? STOPS[s].points.length - 1 : 0;
    } else if (p + pointDelta >= stop.points.length) {
      // Running off the end of a chapter continues into the next one.
      s += 1;
      p = 0;
    } else if (p + pointDelta < 0) {
      // Running off the front goes back to the previous chapter's LAST point.
      // Landing on its first point instead would walk the presenter past a
      // whole chapter without ever showing it.
      s -= 1;
      p = s >= 0 && s < STOPS.length ? STOPS[s].points.length - 1 : 0;
    } else {
      p += pointDelta;
    }

    s = Math.max(0, Math.min(STOPS.length - 1, s));
    const target = STOPS[s];
    setStopIndex(s);
    setPointIndex(Math.max(0, Math.min(target.points.length - 1, p)));
  };

  const total = useMemo(
    () => STOPS.reduce((sum, s) => sum + s.points.length, 0),
    [],
  );
  const seen = STOPS.slice(0, stopIndex + 1).reduce(
    (sum, s) => sum + (s.id === stop.id ? pointIndex + 1 : s.points.length),
    0,
  );

  /**
   * Who is on, and who walks on next.
   *
   * The stage keeps this in its footer; a speaker reading this page cannot see
   * the footer, and stepping on over whoever is mid-sentence is the one
   * failure this page exists to prevent. Derived from the same `sections` rows
   * the stage reads, so the two cannot disagree about who is speaking.
   */
  const { onStage, nextUp } = useMemo(() => {
    const here = stop.speaker;

    // Is there another point left in this stop? If so the same person continues.
    const hasPointAhead = pointIndex < stop.points.length - 1;
    if (hasPointAhead) {
      return {
        onStage: here,
        nextUp: here ? { name: here.primary, note: "يكمل النقطة التالية" } : null,
      };
    }

    const following = STOPS[stopIndex + 1];
    if (!following) {
      return { onStage: here, nextUp: null };
    }

    // The last chapter hands straight over to the team standing on stage.
    if (!following.speaker) {
      return {
        onStage: here,
        nextUp: { name: presentation.team, note: `يوقف ${stop.speaker?.primary ?? "المتحدث"} ويصعد الفريق` },
      };
    }

    // Crossing into the next chapter: the hand-off line in `handoffs` names the
    // incoming speaker, so read that rather than guessing from the section.
    const bridge = handoffFor(stop.id);
    return {
      onStage: here,
      nextUp: {
        name: bridge?.to ?? following.speaker.primary,
        note: bridge ? "بعد قراءة سطر التسليم" : "يبدأ المحور التالي",
      },
    };
  }, [stop, stopIndex, pointIndex]);

  return (
    <main className="min-h-dvh bg-night text-night-text">
      {/* ── header: who this is for, and how to get back to the room ── */}
      <header className="sticky top-0 z-20 border-b border-night-line bg-night/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <TeamMark variant="emblem" className="size-9 shrink-0" priority />
          <div className="min-w-0 flex-1">
            <p className="kicker text-gold-300">ورقة المتحدث</p>
            <p className="truncate type-body-sm font-bold text-night-text">
              {presentation.title} · {presentation.team}
            </p>
          </div>
          <Link
            href="/"
            className="flex min-h-10 shrink-0 items-center rounded-full border border-night-line px-3.5 type-micro font-semibold text-night-muted transition-colors hover:border-gold-300/50 hover:text-night-text"
          >
            العرض
          </Link>
        </div>
      </header>

      {/*
        How to drive the deck, kept here rather than on the stage.

        The stage used to carry a running clock and a row of key names in its
        bottom rail. Both are presenter material and the audience sees the
        same screen, so they now appear only while the notes overlay is open.
        That makes this page the place a presenter learns the overlay exists —
        which is correct anyway: it is the surface they read immediately before
        going on stage, and it is not on the wall.
      */}
      <div className="mx-auto max-w-3xl px-4 pt-3">
        <details className="group rounded-lg border border-night-line/70 bg-night-raised/40 px-3.5 py-2.5">
          <summary className="cursor-pointer list-none marker:hidden type-micro font-semibold text-night-muted transition-colors hover:text-night-text">
            <span className="flex items-center gap-2">
              <Keyboard className="size-3.5 shrink-0" aria-hidden />
              كيف تقود العرض من لوحة المفاتيح؟
              <ChevronDown
                className="size-3.5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </span>
          </summary>
          <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 type-micro text-night-muted">
            {[
              ["← / →", "النقطة التالية · النقطة السابقة"],
              ["↑ / ↓", "الانتقال بين المحاور"],
              ["مسافة", "إيقاف مؤقّت المحور أو تشغيله"],
              ["F", "ملء الشاشة"],
              ["N", "ملاحظات المتحدث: تفتح شريط الساعة واختصارات لوحة المفاتيح على شاشة العرض"],
            ].map(([keys, what]) => (
              <div key={keys} className="contents">
                <dt className="font-display font-bold text-gold-300">{keys}</dt>
                <dd>{what}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2.5 type-micro text-night-muted/80">
            شريط الساعة والاختصارات يظهران على شاشة العرض فقط عند فتح «N»، حتى لا يقرأ
            الحضور تعليماتٍ ليست لهم.
          </p>
        </details>
      </div>

      {/* ── progress + stop picker ── */}
      <nav aria-label="محاور العرض" className="border-b border-night-line">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {/* <p className="tabular type-micro text-night-muted">
            النقطة {toArabicDigits(seen)} من {toArabicDigits(total)} ·{" "}
            {presentation.date}
          </p> */}
          {/* One scrollable line: wrapping six chips onto three rows would cost
              more height than a presenter wants to lose to navigation. */}
          <ol className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {STOPS.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setStopIndex(i);
                    setPointIndex(0);
                  }}
                  aria-current={i === stopIndex ? "step" : undefined}
                  className={cn(
                    "min-h-10 cursor-pointer rounded-full border px-3 type-micro font-semibold transition-colors",
                    i === stopIndex
                      ? "border-gold-300/60 bg-gold-300/12 text-gold-200"
                      : i < stopIndex
                        ? "border-night-line text-night-muted"
                        : "border-night-line/60 text-night-muted/60",
                  )}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* ── the point ── */}
      <div className="mx-auto max-w-3xl px-4 py-4">
        <motion.article
          key={`${stop.id}.${point.id}`}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.001 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="kicker text-gold-300">
            {stop.label} · النقطة {point.index} من{" "}
            {toArabicDigits(stop.points.length)}
          </p>
          <h1 className="mt-1 font-display type-display-sm balance text-night-text">
            {point.title}
          </h1>
          <p className="mt-1.5 type-body text-gold-200">{point.headline}</p>

          {/* Who is on, who is next, and how long this runs. All three are on
              one row because they are the three things checked before a
              point is opened, not after. */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {point.durationSeconds === null ? null : (
              <span className="flex items-center gap-1.5 rounded-full border border-night-line bg-night-raised px-2.5 py-1 type-micro text-night-muted">
                <Clock className="size-3" aria-hidden />
                {spokenDuration(point.durationSeconds)}
              </span>
            )}
            {onStage ? (
              <span className="flex items-center gap-1.5 rounded-full border border-night-line bg-night-raised px-2.5 py-1 type-micro text-night-muted">
                <UserRound className="size-3" aria-hidden />
                الآن: {onStage.primary}
              </span>
            ) : null}
            {nextUp ? (
              <span className="flex items-center gap-1.5 rounded-full border border-gold-300/25 bg-gold-300/8 px-2.5 py-1 type-micro font-semibold text-gold-200">
                <UserRoundCheck className="size-3" aria-hidden />
                ثم: {nextUp.name}
                <span className="font-normal text-gold-300/70">
                  {" — "}
                  {nextUp.note}
                </span>
              </span>
            ) : null}
          </div>

          {/* The words that carry the point. Authored per point in
              `data/points.ts`, shown as chips so they can be found by eye in
              the half-second before the speaker starts. */}
          <section className="mt-3 rounded-lg border border-gold-300/20 bg-gold-300/8 p-4">
            <h2 className="kicker flex items-center gap-1.5 text-gold-300">
              <Highlighter className="size-3.5" aria-hidden />
              شدّد على
            </h2>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {emphasisOf(point).map((word) => (
                <li
                  key={word}
                  className="rounded-full bg-gold-300/15 px-2.5 py-1 type-body-sm font-bold text-gold-100"
                >
                  {word}
                </li>
              ))}
            </ul>
          </section>

          {/* What to say. */}
          <section className="mt-4 rounded-lg border border-night-line bg-night-raised p-4">
            <h2 className="kicker flex items-center gap-1.5 text-gold-300">
              <MessageSquareQuote className="size-3.5" aria-hidden />
              ما تقوله
            </h2>
            <p className="mt-1.5 type-body leading-relaxed text-night-text">
              {point.explanation}
            </p>
          </section>

          {/* Cues, in order. */}
          <section className="mt-3 rounded-lg border border-night-line bg-night-raised p-4">
            <h2 className="kicker flex items-center gap-1.5 text-gold-300">
              <Lightbulb className="size-3.5" aria-hidden />
              ملاحظات بالترتيب
            </h2>
            <ol className="mt-2 space-y-1.5">
              {point.presenterNotes.map((cue, i) => (
                <li
                  key={cue}
                  className="flex items-start gap-2 type-body leading-relaxed text-night-text"
                >
                  <span
                    className="tabular mt-0.5 shrink-0 font-bold text-gold-300/70"
                    dir="ltr"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{cue}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* What the room can see, so nobody narrates the slide. */}
          <section className="mt-3 rounded-lg border border-gold-300/20 bg-gold-300/8 p-4">
            <h2 className="kicker flex items-center gap-1.5 text-gold-300">
              <Eye className="size-3.5" aria-hidden />
              ما يراه الحضور
            </h2>
            <p className="mt-1.5 type-body leading-relaxed text-night-text">
              {point.onScreen}
            </p>
            {/* How it is drawn, which `onScreen` does not say. The speaker
                needs this to know whether to read the slide aloud or narrate
                around it. */}
            <p className="mt-2 border-t border-night-line/70 pt-2 type-body-sm leading-relaxed text-night-muted">
              <span className="font-bold text-gold-300/90">شكله: </span>
              {describePointVisual(point.visual)}
            </p>
          </section>

          {/* The bridge, quoted. */}
          <section className="mt-3 rounded-lg border border-night-line bg-night-raised p-4">
            <h2 className="kicker flex items-center gap-1.5 text-gold-300">
              <ChevronLeft className="size-3.5" aria-hidden />
              الانتقال
            </h2>
            <p className="mt-1.5 type-body leading-relaxed text-night-text">
              {point.transition}
            </p>
            {/* The hand-off's own delivery note. `line` and `cue` are the two
                fields the projector deliberately withholds, so this is the
                only place they can be read from — and the only place a
                presenter can see who they are handing to, by name. */}
            {handoff && pointIndex === stop.points.length - 1 ? (
              <p className="mt-2 border-t border-night-line/70 pt-2 type-body-sm leading-relaxed text-night-muted">
                <span className="font-bold text-gold-300/90">كيف تُسلّم: </span>
                {handoff.cue}
              </p>
            ) : null}
          </section>

          {/* The speaker's own handwriting, kept on the device. */}
          <section className="mt-3 rounded-lg border border-night-line bg-night-raised p-4">
            <h2 className="kicker flex items-center gap-1.5 text-gold-300">
              <PencilLine className="size-3.5" aria-hidden />
              ملاحظتي
            </h2>
            <label htmlFor="presenter-note" className="sr-only">
              ملاحظة شخصية لهذه النقطة
            </label>
            <textarea
              id="presenter-note"
              value={value}
              onChange={(e) => save(e.target.value)}
              rows={3}
              placeholder="اكتب هنا… تبقى على هذا الجهاز فقط"
              className="mt-2 w-full resize-y rounded-md border border-night-line bg-night px-3 py-2 type-body text-night-text placeholder:text-night-muted/50 focus:border-gold-300/60 focus:outline-none"
            />
          </section>
        </motion.article>

        {/* ── navigation: the two things a speaker actually presses ── */}
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(0, -1)}
            disabled={stopIndex === 0 && pointIndex === 0}
            aria-label="النقطة السابقة"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-night-line text-night-muted transition-colors hover:border-gold-300/50 hover:text-night-text disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(0, 1)}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold-300 font-bold text-night transition-colors hover:bg-gold-200"
          >
            النقطة التالية
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1, 0)}
            disabled={stopIndex >= STOPS.length - 1}
            aria-label="المحور التالي"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-night-line text-night-muted transition-colors hover:border-gold-300/50 hover:text-night-text disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </main>
  );
}
