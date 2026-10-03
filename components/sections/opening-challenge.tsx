"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import {
  openingAnswerLines,
  openingBudgetFor,
  openingChallenge,
  openingHandoff,
  type OpeningStep,
} from "@/data/handoff";
import { OrnamentFrame } from "@/components/presentation/ornaments";
import { TeamMark } from "@/components/presentation/team-mark";

const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * Stage 01 — the room is woken up before anyone says anything useful.
 *
 * ## Three screens, and why
 *
 * `card → question → answer`, driven by {@link OpeningStep}. The obvious
 * alternative is one screen with a reveal button, and it fails for a reason
 * that is easy to miss: the question has to be on screen *before* anyone has
 * agreed to think about it. If the question arrives in the same second the
 * stage does, the first thing the audience processes is the change — a heading
 * swapping — rather than the words. The card is a beat of nothing, and that
 * beat is the whole point. It says something is coming without saying what.
 *
 * The answer then gets its own screen rather than a panel under the question,
 * so while the speaker explains four senses of one word, the screen is showing
 * that word and not two arguments at once.
 *
 * ## The card flip
 *
 * This is the only genuine 3D transform in the deck, and it is here because a
 * card turn is the one thing the audience will already have a model for. It
 * answers the question the animation raises — *did something change?* — without
 * a caption explaining it. Everything else in the deck fades or lifts, because
 * everything else is only changing which sentence is being said.
 *
 * Under `prefers-reduced-motion` the flip becomes a crossfade: same three
 * screens, same information, no rotation. The information does not depend on
 * the effect.
 *
 * ## What is deliberately absent
 *
 * No clock, no "about 40 seconds", no "before the first section", and no next
 * speaker's name. All four were here, and all four are presenter material: a
 * timing label on a projector is a stage direction the audience should not be
 * reading, and a hand-off that announces a name is the cue stopping the
 * argument. The presenter's clock is in the bottom rail and the timings are on
 * `/presenter`.
 *
 * So the card's click target carries an `aria-label` and no visible caption —
 * it is a control for whoever is holding the clicker, and the visible surface
 * is the ornament, not an instruction. The same reason the outgoing presenter
 * says the hand-off line out loud instead of printing it.
 */
export function OpeningChallenge({
  step,
  speaker,
  onContinue,
}: {
  /**
   * Owned by the shell, not by this component.
   *
   * Which of the three screens is showing is a *stage* decision — the shell is
   * what the arrow keys talk to. A keydown listener on this element would never
   * see the event anyway: nothing inside the stage holds focus, so keys land on
   * the body and never travel through here.
   */
  step: OpeningStep;
  /** Resolved by the shell, so the backup presenter shows here too. */
  speaker?: string;
  /** Advance to the next stage. */
  onContinue: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const answerLines = openingAnswerLines();
  const hasAnswer = answerLines.length > 0;
  const handoff = openingHandoff();

  const onCard = step === "card" || step === "question";
  const flipped = step === "question";
  /* No visible label: the cost of a wrong turn is one arrow key, which is
     already how the whole deck is driven. */
  const cardAria = flipped
    ? "البطاقة مقلوبة، السؤال معروض"
    : "اقلب البطاقة لعرض السؤال";

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden text-center"
      aria-label="سؤال الافتتاح"
    >
      <OrnamentFrame className="inset-4 sm:inset-6" />

      <div className="relative z-10 flex w-full flex-col px-2 pt-[clamp(1rem,4vh,3rem)]">
        {/* Upstream of the content, not centred: the opening is one of the
            points-light screens the brief asks to anchor at the top. */}
        <div className="flex flex-col items-center relative">
          {/* <TeamMark variant="emblem" className="h-50 bg-gray-500 p-6  z-10 -top-14 absolute inset-x-2/4.5 w-50 rounded-full" /> */}

          <AnimatePresence mode="wait" initial={false}>
            {onCard ? (
              <motion.div
                key="card-stage"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                transition={{ duration: reduced ? 0.18 : 0.34, ease: EASE }}
                className="flex w-full justify-center min-h-[75vh] mt-20 h-full"
                style={{ perspective: "1600px" }}
              >
                <motion.button
                  type="button"
                  onClick={onContinue}
                  aria-label={cardAria}
                  aria-live="polite"
                  /* The flip is the one moment the deck rotates in depth. */
                  /* `flipped` alone, not `flipped || reduced`.

                     The `|| reduced` looked like a politeness clause — "skip
                     the rotation when motion is reduced" — but it was an
                     inversion: it pinned `rotateY` to 180 for the whole
                     presentation, so a reduced-motion visitor landed on the
                     back face, read the question without ever seeing the card,
                     and could never see the card at all. The brief asks for the
                     motion to be reduced, not for the flip to be disabled. A
                     near-zero duration is the honest way to honour it: the
                     correct face is what is on screen, it simply arrives without
                     a turn. */
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: reduced ? 0.001 : 0.62, ease: EASE }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="group relative block w-full h-[75vh] cursor-pointer transform-3d"
                >
                  {/* both faces are mounted; only one is ever visible */}
                  {/* ── the two faces ──
                      Only the visible one is in the accessibility tree. Both
                      have to be mounted for the flip to have a back to turn to,
                      so `aria-hidden` is what keeps the hidden face's words out
                      of the tree — and it has to be `aria-hidden={flipped}` on
                      the front, not the other way round.

                      That inversion was in the first version of this component
                      and it is worth stating why it was wrong, because the
                      mistake is easy to repeat: it hid the face the audience
                      was looking at and exposed the one turned away. A screen
                      reader on the question screen would have announced
                      «قبل أن نبدأ» and not the question.

                      The front carries no question. It used to, which meant the
                      "reveal" revealed nothing — the word was legible on the
                      card from the moment the stage opened, so the flip was a
                      flourish over an already-answered question. That is the one
                      thing the card exists to prevent. */}
                  <span
                    aria-hidden={flipped}
                    className="ornament-frame relative flex h-full flex-col items-center justify-center gap-4 rounded-lg bg-paper-raised px-[clamp(1.25rem,0.6rem+2vw,2.5rem)] py-[clamp(1.25rem,1rem+1.5vh,2rem)] shadow-lift backface-hidden"
                    style={{ transform: "rotateY(0deg)" }}
                  >
                    <TeamMark variant="emblem" className="size-60 my-10 shrink-0 opacity-80" />
                    <span className="kicker text-gold-600">
                      {openingChallenge.cardTitle}
                    </span>
                    <span className="mt-1 type-body text-ink-muted">
                      {openingChallenge.cardLine}
                    </span>
                  </span>

                  <span
                    aria-hidden={!flipped}
                    className="absolute inset-0 flex min-h-[clamp(15rem,11rem+14vh,20rem)] flex-col items-center justify-center gap-3 rounded-lg bg-ink px-[clamp(1.25rem,0.6rem+2vw,2.5rem)] py-[clamp(1.25rem,1rem+1.5vh,2rem)] shadow-lift backface-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <span className="kicker text-gold-200">سؤال</span>
                    <span className="type-display-lg balance text-paper">
                      {openingChallenge.question}
                    </span>
                    <span className="mt-1 type-body text-night-muted">
                      فكّروا قليلاً…
                    </span>
                  </span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0.18 : 0.44, ease: EASE }}
                className="flex w-full flex-col min-h-[75vh] mt-20 items-center gap-(--sp-tight)"
              >
                {/* The answer, exactly as the team wrote it. */}
                {hasAnswer ? (
                  <div className="ornament-frame relative w-full rounded-lg bg-paper-raised px-[clamp(1rem,0.7rem+0.9vw,1.75rem)] py-(--sp-block) text-start">
                    <span className="kicker text-gold-600">المعنى</span>
                    <span className="scripture mt-1.5 flex flex-col gap-1.5 type-display-sm balance text-ink">
                      {answerLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  </div>
                ) : (
                  /* No answer in the data.

                     The previous version of this branch filled the gap with
                     «اكتبوا المعنى المقصود للكلمة في ورقة المتحدث، ليظهر هنا قبل
                     التقديم» — a note to the team, projected at the room, about a
                     field in a data file. Nobody in the audience can act on it
                     and the presenter does not need it on the wall: `/presenter`
                     is where a missing answer gets caught, and it is open on the
                     presenter's screen already.

                     So the branch now says nothing at all. A blank here is a
                     visible failure that a human has to fix, which is the correct
                     outcome; a polite instruction in the wrong place is not. */
                  <div className="w-full rounded-lg border border-dashed border-gold-400/40" />
                )}

                {/* And the reason the word was worth asking about. */}
                <p className="type-body-lg balance text-ink-soft">
                  {openingChallenge.connection}
                </p>

                <p className="ornament-frame type-display-sm balance rounded-lg bg-ink px-[clamp(1rem,0.7rem+0.9vw,1.75rem)] py-(--sp-block) text-paper">
                  {openingChallenge.takeaway}
                </p>

                {/* ── the hand-off. The question carries it. ──
                    The next speaker's name is not printed: the outgoing
                    presenter says the hand-off line, and a room that is told who
                    is up next stops listening.

                    The button that used to sit here said «لنبدأ» in
                    `type-body` bold on a filled pill. That is a hand-off cue
                    with a caption: the room is being told the opening is over
                    and something is starting. Same treatment as the hand-off
                    screen's advance control — the arrow is the affordance, the
                    label lives in the attributes. */}
                <div className="mt-1 flex w-full flex-col items-center gap-2.5">
                  <p className="type-display-sm balance text-ink">
                    {handoff.teaser}
                  </p>
                  <button
                    type="button"
                    onClick={onContinue}
                    aria-label="انتقال إلى بداية العرض"
                    title="انتقال إلى بداية العرض"
                    className="group mt-0.5 flex size-[clamp(2.4rem,2.1rem+1.2vh,2.9rem)] cursor-pointer items-center justify-center rounded-full bg-ink text-paper shadow-lift transition-colors duration-200 hover:bg-gold-500 hover:text-ink"
                  >
                    <ArrowLeft
                      className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                      aria-hidden
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {speaker ? (
            <p className="kicker mt-(--sp-tight) text-ink-faint">
              {speaker}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * The budget for whichever screen is showing, in seconds.
 *
 * Re-exported so the shell's rail can label the presenter's clock without
 * importing the challenge's internals. The rail is presenter chrome and is
 * hidden from the audience, so this label is allowed to exist at all.
 */
export { openingBudgetFor };
