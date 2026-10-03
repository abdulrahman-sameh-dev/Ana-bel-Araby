"use client";

import { motion, type Transition } from "motion/react";
import { ArrowLeft, CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import { TeamMark } from "@/components/presentation/team-mark";
import type { Handoff } from "@/data/handoff";

const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * The moment between two speakers.
 *
 * This is not a slide. It has no points and no content to read — it exists so
 * the room knows its speaker has finished and the next one is standing up.
 * Putting it as its own state, reached only by an explicit press, is what stops
 * the deck feeling like one person talking to themselves through four
 * disconnected pages.
 *
 * ## What is allowed on this screen, and why it used to be wrong
 *
 * The brief for this screen is one line: no hand-off cues on the audience's
 * screen. Everything the audience sees is read by the room, so "the room is told
 * who speaks next" is a production cue whether or not it is dressed as content.
 * So this screen carries exactly one thing — `handoff.teaser`, the question
 * about the chapter that is coming.
 *
 * An earlier version of this component reasoned its way to the opposite
 * conclusion and kept the next speaker's name, on the argument that "the room
 * is told the running order, which tells them nothing" — and then set the name
 * in `type-display-sm`, the second-largest type on the page, on the argument
 * that it "arrives small, as the delivery of that question". Both reasons were
 * about whether the *audience* benefits from knowing the running order, which
 * is the wrong question to ask. They do not: a name tells the room nothing about
 * the argument, and it invites the attention of everyone in the room to go to
 * the logistics of the event rather than to the question. The comment kept the
 * name because the reasoning felt good, and the reasoning felt good because it
 * never went back to the instruction.
 *
 * `line` and `cue` were already correctly kept off this screen; they are staging
 * directions and they live in `data/handoff.ts` for the handout.
 */
export function HandoffState({
  handoff,
  onContinue,
  tone = "ink",
}: {
  handoff: Handoff;
  onContinue: () => void;
  tone?: "ink" | "night";
}) {
  const reduced = usePrefersReducedMotion();
  const isNight = tone === "night";

  return (
    <section
      className={cn(
        "stage-page relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden text-center",
        isNight ? "bg-night text-night-text" : "",
      )}
    >
      {/* The question the room carries into the next chapter, announced when it
          changes. The name that used to ride along here is gone for the same
          reason it is gone from the markup: a live region is read aloud by the
          screen reader in the room, which makes it an audience surface, not a
          private one. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {handoff.teaser}
      </p>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.001 : 0.35, ease: EASE }}
        >
          <TeamMark variant="emblem" className="h-11 w-11 opacity-80" />
        </motion.div>

        {/* A mark, not a label. The old kicker read «سؤال قبل المحور التالي»,
            which is a hand-off cue in Arabic clothing — it tells the room it is
            being handed to, which is information about the event rather than
            about the language. The ornament still gives the screen a centre of
            gravity without saying anything. */}
        <div
          className={cn(
            "mt-[var(--sp-block)] flex items-center justify-center",
            isNight ? "text-night-muted" : "text-gold-600",
          )}
          aria-hidden
        >
          <CircleHelp className="size-3.5" />
        </div>

        {/* ── the teaser. The largest type on the screen, on purpose. ── */}
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.001 : 0.45, delay: reduced ? 0 : 0.06, ease: EASE }}
          className={cn(
            "stage-title mt-1 type-display-md balance",
            isNight ? "text-night-text" : "text-ink",
          )}
        >
          {handoff.teaser}
        </motion.h2>

        {/* ── how to leave this screen, with nothing written on it ──
            A labelled button here was «لنسمع الجواب», which is an instruction
            to the room as much as to the presenter: it tells an audience of a
            hundred people that the next thing is an answer, and it puts a piece
            of stage direction on the wall. The arrow alone still gives the
            presenter something to click and still gives a screen reader and a
            mouse user a name, and both of those live in attributes rather than
            in type. */}
        <motion.button
          type="button"
          onClick={onContinue}
          aria-label="انتقال إلى المحور التالي"
          title="انتقال إلى المحور التالي"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.001 : 0.4, delay: reduced ? 0 : 0.18, ease: EASE }}
          className={cn(
            "group mt-[clamp(1.75rem,1.2rem+2vh,3rem)] flex size-[clamp(2.75rem,2.4rem+1.4vh,3.5rem)] cursor-pointer items-center justify-center rounded-full shadow-lift transition-colors duration-200",
            isNight
              ? "bg-gold-300 text-night hover:bg-gold-200"
              : "bg-ink text-paper hover:bg-gold-500 hover:text-ink",
          )}
        >
          <ArrowLeft
            className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden
          />
        </motion.button>
      </div>
    </section>
  );
}
