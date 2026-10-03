"use client";

import { motion, type Transition } from "motion/react";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import { cover } from "@/data/presentation";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import {
  ArabesqueField,
  CoverMotif,
  FiligreeRule,
  OrnamentFrame,
} from "@/components/presentation/ornaments";
import { TeamMark } from "@/components/presentation/team-mark";

const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * Stage 00 — the cover.
 *
 * The one stage in the deck that belongs to nobody. A talk that opens straight
 * onto its first question is a talk that starts mid-sentence: the room does not
 * yet know what it is looking at, who is standing in front of it, or how long
 * it has agreed to listen. This page fixes all three before a single word is
 * spoken, and then gets out of the way.
 *
 * ## A title card, not a landing page
 *
 * It used to stack kicker → logo → title → subtitle → pillars → hero line →
 * meta → button → keyboard hint, which is nine things on one screen and no
 * focal point at all. Projected at 1920×1080 that reads as a form to be filled
 * in.
 *
 * So the hierarchy is now strict:
 *
 * - **`أنا بالعربي`** is the title, in the display face, at display scale. It is
 *   the largest thing on the screen and the only thing that is.
 * - **The subtitle** names the subject in one line, a step below.
 * - **The logo** carries the team identity. It is the real artwork, not a typed
 *   wordmark, and it is the deck's `priority` image — this is the first paint of
 *   the session.
 * - **The date and the running time sit in the footer**, in the smallest type on
 *   the page, anchored to the edges. They are facts about the session, not part
 *   of its argument, so they are deliberately not allowed to compete with the
 *   title for attention.
 *
 * The keyboard hint under the button is gone from the screen: «F لملء الشاشة»
 * and «N للملاحظات» are instructions to whoever is holding the clicker, and
 * they belong on `/presenter`.
 *
 * The decorative ground is the team's original cover slide, faded to a fifth of
 * its weight and multiplied into the parchment — a reference, not a backdrop,
 * so the type never fights the artwork underneath it.
 */
export function CoverSection({ onStart }: { onStart: () => void }) {
  const reduced = usePrefersReducedMotion();

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.001 : 0.55,
      delay: reduced ? 0 : delay,
      ease: EASE,
    },
  });

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden text-center"
      aria-label="مقدمة العرض"
    >
      {/* The chapters, named for anyone who cannot read the rail. The cover
          itself only shows how many there are; this is the list. */}
      <ul className="sr-only">
        {cover.chapters.map((chapter, i) => (
          <li key={chapter}>
            المحور {toArabicDigits(i + 1)}: {chapter}
          </li>
        ))}
      </ul>

      <ArabesqueField tone="ink" opacity={0.04} />

      {/* The team's own cover slide, as a ground and not as a backdrop. */}
      <motion.div
        aria-hidden
        initial={reduced ? false : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: reduced ? 0.001 : 1.8, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 bg-cover bg-center mix-blend-multiply"
        style={{
          backgroundImage:
            "url(/media/reference/original-slide-01-cover.jpg)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-paper/80 via-paper/70 to-paper/90"
      />

      <OrnamentFrame className="inset-4 sm:inset-6" />

      {/* The heritage half of the cover, drawn behind the title: three
          calligraphic strokes that write themselves once on entry, over a
          still eight-pointed khatim. Placed above the team's own cover slide and
          its veil, so the strokes sit in the parchment rather than under it.
          `z-0` with the title at `z-10` keeps it behind the type without
          needing another full-bleed wrapper. */}
      <CoverMotif className="z-0" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-2">
        {/* ── the brand. The real artwork, not a typed wordmark: the emblem with
            غيث / GHAITH beneath it as the logo itself sets them. Compact, and
            the deck's priority image — this is the first paint of the session. ── */}
        <motion.div {...rise(0)} className="flex flex-col items-center">
          <TeamMark
            variant="lockup"
            className="h-[clamp(3.5rem,2.6rem+3.4vh,6.5rem)]"
            priority
          />
        </motion.div>

        <motion.p
          {...rise(0.08)}
          className="kicker mt-(--sp-tight) text-gold-600"
        >
          {cover.kicker}
        </motion.p>

        {/* ── the title. The largest thing on the page, and the only one. ── */}
        <motion.h1
          {...rise(0.14)}
          className="stage-title mt-(--sp-tight) type-display-xl balance text-ink"
        >
          {cover.title}
        </motion.h1>

        {/* ── the subject, one step down and no louder. ── */}
        <motion.p
          {...rise(0.2)}
          className="mt-1.5 type-body-lg balance text-ink-soft"
        >
          {cover.subtitle}
        </motion.p>

        <motion.div {...rise(0.26)} className="mt-(--sp-block) w-full">
          <FiligreeRule className="w-full max-w-md" />
        </motion.div>

        {/* ── the three movements, as a strip rather than a list. ── */}
        <motion.ul
          {...rise(0.32)}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:gap-x-5"
        >
          {cover.pillars.map((pillar, i) => (
            <li key={pillar} className="flex items-center gap-3 sm:gap-5">
              <span
                className={cn(
                  "font-display type-display-sm font-bold",
                  i === cover.pillars.length - 1 ? "text-gold-600" : "text-ink-soft",
                )}
              >
                {pillar}
              </span>
              {i < cover.pillars.length - 1 ? (
                <span aria-hidden className="text-gold-400/70">
                  ·
                </span>
              ) : null}
            </li>
          ))}
        </motion.ul>

        {/* ── the way in. No keyboard hint: that is a note for the presenter. ── */}
        <motion.div {...rise(0.4)} className="mt-(--sp-block)">
          <button
            type="button"
            onClick={onStart}
            className="group flex h-[clamp(2.6rem,2.3rem+1.4vh,3rem)] cursor-pointer items-center gap-2.5 rounded-full bg-ink px-7 font-sans type-body font-bold text-paper shadow-lift transition-colors duration-200 hover:bg-gold-500 hover:text-ink"
          >
            {cover.cta}
            <ArrowLeft
              className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden
            />
          </button>
        </motion.div>
      </div>

      {/* ── the footer. Facts about the session, so they are anchored to the
          edges and set in the smallest type on the page: the running time on
          the right, the date on the left, neither competing with the title. ── */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.001 : 0.7, delay: reduced ? 0 : 0.5 }}
        className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-[clamp(1rem,0.5rem+2.5vw,4rem)] pb-[clamp(1rem,0.6rem+1.8vh,2.5rem)]"
      >
        <p className="kicker flex items-center gap-1.5 text-ink-faint">
          <CalendarDays className="size-3" aria-hidden />
          {cover.date}
        </p>

        <p className="kicker flex items-center gap-1.5 text-ink-faint">
          <Clock3 className="size-3" aria-hidden />
          {cover.chapterCount} · {cover.duration}
        </p>
      </motion.div>
    </section>
  );
}
