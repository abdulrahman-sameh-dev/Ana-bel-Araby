"use client";

import { useEffect, useState } from "react";
import { motion, type Transition } from "motion/react";
import { HeartHandshake, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { closing, presentation, sections } from "@/data/presentation";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import {
  ArabesqueField,
  FiligreeRule,
  OrnamentFrame,
} from "@/components/presentation/ornaments";
import { TeamMark } from "@/components/presentation/team-mark";

const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * Stage 08 — the closing.
 *
 * The credits stage before this one is the record of who did the work. This one
 * is what the room is left holding, and it is a question rather than a summary:
 * the statement says the language can carry the future, and the question asks
 * the people in front of it whether they will be part of that.
 *
 * ## The order was inverted on purpose
 *
 * This used to lead with «شكر لحسن الاستماع» at the largest size in the deck,
 * with the claim underneath it. That made the last thing anyone read a pleasantry
 * — pleasant, and finished. Gratitude now sits underneath the closing pair, at
 * a step down: the room's last read is the question, and the thank-you is there
 * for the speaker to say out loud, which is what it is actually for.
 *
 * Three things are earned here:
 *
 * - **The pair arrives as a pair.** The statement is set clause by clause on a
 *   stagger, and the question only fades in once the claim has landed. A closing
 *   that appears all at once reads as a bullet point; one that arrives in two
 *   beats reads as something being said.
 * - **The pillars close the loop.** The same three words the cover opened with
 *   — الهوية · العلم · المستقبل — return here, which is what makes the deck feel
 *   like one argument instead of five slides.
 * - **The speakers stand together.** Last time all four are named in one frame
 *   is the last time the room sees the team as a team rather than as a queue.
 *
 * Nothing auto-advances. `onRestart` returns the presenter to the cover, which
 * is the only sensible thing to offer a room that has already been thanked.
 */
export function ClosingSection({ onRestart }: { onRestart: () => void }) {
  const reduced = usePrefersReducedMotion();
  /** How many of the statement's lines have been set. */
  const [shown, setShown] = useState(
    reduced ? closing.statementLines.length : 0,
  );

  useEffect(() => {
    if (reduced || shown >= closing.statementLines.length) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), 520);
    return () => window.clearTimeout(t);
  }, [reduced, shown]);

  const complete = shown >= closing.statementLines.length;

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden text-center"
      aria-label={closing.kicker}
    >
      <ArabesqueField tone="gold" opacity={0.045} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(62%_52%_at_50%_42%,var(--gold-100)_0%,transparent_72%)] opacity-60"
      />

      <OrnamentFrame className="inset-4 sm:inset-6" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.001 : 0.5, ease: EASE }}
        >
          <TeamMark
            variant="lockup"
            className="h-[clamp(2.5rem,2rem+2.4vh,4.25rem)]"
            priority
          />
        </motion.div>

        <FiligreeRule className="mt-(--sp-block) w-40" />

        <p className="kicker mt-(--sp-tight) text-gold-600">
          {closing.kicker}
        </p>

        {/* ── the claim, clause by clause. ── */}
        <p className="mt-1.5 flex flex-col items-center">
          {closing.statementLines.map((line, i) => (
            <motion.span
              key={line}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={
                i < shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
              }
              transition={{
                duration: reduced ? 0.001 : 0.5,
                delay: reduced ? 0 : i * 0.06,
                ease: EASE,
              }}
              className="type-display-sm balance leading-relaxed text-ink-soft"
            >
              {line}
            </motion.span>
          ))}
        </p>

        {/* ── and the question. The largest type in the deck, and the last
            thing anyone reads. It only arrives once the claim has landed, so
            the two read as one sentence turning back on the room. ── */}
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={complete ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: reduced ? 0.001 : 0.6, delay: reduced ? 0 : 0.12, ease: EASE }}
          className="stage-title mt-(--sp-tight) flex flex-col items-center text-balance text-ink"
        >
          {closing.questionLines.map((line) => (
            <span
              key={line}
              className="type-display-lg leading-[1.22] font-bold"
            >
              {line}
            </span>
          ))}
        </motion.h1>

        {/* ── the gratitude, now underneath: said out loud, not read. ── */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={complete ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: reduced ? 0.001 : 0.5, delay: reduced ? 0 : 0.24, ease: EASE }}
          className="mt-(--sp-block) flex items-center gap-2 type-body-lg font-semibold text-gold-600"
        >
          <HeartHandshake className="size-4 shrink-0" aria-hidden />
          {closing.thanks}
        </motion.p>

        {/* ── the three movements, closing the loop the cover opened. ── */}
        <motion.ul
          initial={reduced ? false : { opacity: 0 }}
          animate={complete ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduced ? 0.001 : 0.5, delay: reduced ? 0 : 0.2, ease: EASE }}
          className="mt-(--sp-block) flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5"
        >
          {presentation.pillars.map((pillar, i) => (
            <li key={pillar} className="flex items-center gap-3">
              <span
                className={cn(
                  "font-display type-body-lg font-bold",
                  i === presentation.pillars.length - 1
                    ? "text-gold-600"
                    : "text-ink-soft",
                )}
              >
                {pillar}
              </span>
              {i < presentation.pillars.length - 1 ? (
                <span aria-hidden className="text-gold-400/70">
                  ·
                </span>
              ) : null}
            </li>
          ))}
        </motion.ul>

        {/* ── the four, together, one last time. ── */}
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={complete ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduced ? 0.001 : 0.5, delay: reduced ? 0 : 0.26, ease: EASE }}
          className="mt-(--sp-block) w-full"
        >
          <FiligreeRule className="mx-auto w-full max-w-md" />
          <ul className="mt-(--sp-tight) grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-4">
            {sections.map((section) => (
              <li key={section.id} className="min-w-0">
                <p
                  className="tabular font-display type-body-lg font-bold text-gold-400/70"
                  aria-hidden
                >
                  {section.numeral}
                </p>
                <p className="truncate type-body-sm font-semibold text-ink-soft">
                  {section.speaker}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── the only action left in the deck. ── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={complete ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: reduced ? 0.001 : 0.5, delay: reduced ? 0 : 0.32, ease: EASE }}
          className="mt-(--sp-block) flex flex-col items-center gap-2.5"
        >
          <button
            type="button"
            onClick={onRestart}
            className="group flex h-[clamp(2.3rem,2rem+1.1vh,2.8rem)] cursor-pointer items-center gap-2 rounded-full border border-paper-line bg-paper-raised px-5 font-sans type-body-sm font-semibold text-ink-soft shadow-lift transition-colors duration-200 hover:border-gold-400/60 hover:bg-gold-100/60 hover:text-ink"
          >
            <RotateCcw
              className="size-3.5 transition-transform duration-200 group-hover:-rotate-45"
              aria-hidden
            />
            إعادة العرض
          </button>
          <p className="flex items-center gap-2 type-micro text-ink-faint">
            <HeartHandshake className="size-3" aria-hidden />
            {closing.thanksSpoken}
            <span aria-hidden className="opacity-50">
              ·
            </span>
            {presentation.team} · {presentation.date}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
