"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import { TeamMark } from "@/components/presentation/team-mark";

/**
 * The header's brand lockup: `[logo] غيث`.
 *
 * ## Why this exists
 *
 * The header used to show the emblem alone, on the argument that the logo should
 * *replace* the team label rather than sit beside it — a typed wordmark next to
 * the artwork reads as a caption on it. But a projector-sized emblem with no name
 * next to it leaves the room with no idea who is presenting until they read the
 * footer, and the brief asks for the name to be there. The fix is not to choose
 * between the two but to make them one object: the mark and the word in a single
 * flex group, so they are always adjacent, always aligned, and always read as
 * one thing.
 *
 * ## Why the logo is a separate element from the text
 *
 * They rotate on different clocks. The name alternates with the tagline every
 * {@link ROTATE_MS}; the mark never moves. If the mark lived inside the
 * animated subtree it would re-mount and re-fade with every swap, which is both
 * the "logo flickers in the corner" artefact and a distraction on a stage. So
 * the mark is rendered once, outside `AnimatePresence`, and only the text slot
 * animates.
 *
 * ## Why the text slot has a fixed width
 *
 * `غيث` is three glyphs and the tagline is sixteen. Left to size itself, the
 * header would gain and lose ~5rem every swap, shoving the progress rail and the
 * navigation buttons sideways seven times a session — on a projector, a moving
 * toolbar is far more noticeable than a moving word. The slot is therefore a
 * fixed-width, single-line, right-aligned box: the word changes inside it, the
 * layout does not.
 *
 * ## Accessibility
 *
 * The rotating word is `aria-hidden`, and a single stable `sr-only` "فريق غيث"
 * carries the accessible name instead. A screen reader therefore announces the
 * brand once, predictably, instead of re-announcing a different word every seven
 * seconds while the presenter is talking over it.
 */
export function TeamBrand({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "night";
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [showingTagline, setShowingTagline] = useState(false);

  useEffect(() => {
    const id = window.setInterval(
      () => setShowingTagline((on) => !on),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  const word = showingTagline ? BRAND.tagline : BRAND.name;

  return (
    <div
      className={cn("flex shrink-0 items-center gap-2", className)}
      // The slot width lives here, on the lockup, because the span below
      // measures against the custom property and `BRAND.slot` was never bound
      // to it. An undefined `--brand-slot` makes `width: var(--brand-slot)`
      // invalid at computed-value time, which silently falls back to `auto` —
      // and an `auto`-width box around two absolutely-positioned faces has no
      // intrinsic width at all. It happened to look right because the parent
      // header was not under pressure, so the header-width assertion passed
      // while the guarantee did not. This is the assertion that would have
      // caught it if it had measured the slot rather than the header.
      style={{ "--brand-slot": BRAND.slot } as React.CSSProperties}
      // One stable accessible name for the whole lockup; see the note above.
    >
      {/* ── the mark. Fixed, never animated, never re-mounted. ── */}
      <TeamMark
        variant="emblem"
        tone={tone}
        className="size-[clamp(1.4rem,1.15rem+0.7vw,1.75rem)] shrink-0"
      />

      <span className="sr-only">{BRAND.accessibleName}</span>

      {/* ── the rotating word, in a box that never resizes ── */}
      {/* The height is pinned so a one-line word and its replacement cannot
          change the header's height mid-swap. */}
      <span
        aria-hidden
        className={cn(
          "relative h-[1.6em] w-[var(--brand-slot)] shrink-0 overflow-hidden",
          tone === "night" ? "text-night-text" : "text-ink",
        )}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={word}
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, y: "35%" }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: "-35%" }}
            transition={{ duration: reduced ? 0.2 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute inset-0 flex items-center whitespace-nowrap font-display",
              "text-[clamp(0.8rem,0.72rem+0.28vw,1rem)] font-bold tracking-tight",
              showingTagline
                ? tone === "night"
                  ? "text-gold-200"
                  : "text-gold-600"
                : "",
            )}
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

/**
 * The word and the tagline that share one slot.
 *
 * `tagline` is short on purpose: it has to fit the same fixed-width box as the
 * team name, so anything that wraps would be clipped. «حيث تبدأ الأفكار» is the
 * deck's own register — it says what the talk does rather than what the team is.
 */
export const BRAND = {
  name: "غيث",
  tagline: "حيث تبدأ الأفكار…",
  accessibleName: "فريق غيث",
  /**
   * The slot width. `غيث` needs ~2.5rem; «حيث تبدأ الأفكار…» needs ~7.5rem at
   * the largest step of the type ramp. One width covers both, so the swap cannot
   * move the toolbar. Adjust this if the tagline is ever reworded.
   */
  slot: "8.5rem",
} as const;

/**
 * 7 seconds, inside the 5–10s the brief asks for.
 *
 * Long enough that the name is what the room reads, short enough that a
 * six-minute talk shows the tagline several times rather than once at the start.
 */
const ROTATE_MS = 7000;
