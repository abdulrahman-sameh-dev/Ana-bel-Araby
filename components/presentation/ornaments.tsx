"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";

/**
 * Eight-pointed star (khatam) lattice — the geometric ground for parchment
 * sections. Drawn once as an inline SVG tile so it costs no extra request and
 * can be recoloured per section through `currentColor`.
 */
export function ArabesqueField({
  className,
  tone = "ink",
  opacity = 0.05,
}: {
  className?: string;
  /** `ink` for light grounds, `gold` for a warmer, more decorative field. */
  tone?: "ink" | "gold" | "night";
  opacity?: number;
}) {
  const stroke =
    tone === "gold"
      ? "var(--gold-500)"
      : tone === "night"
        ? "var(--gold-300)"
        : "var(--ink)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full" width="100%" height="100%">
        <defs>
          <pattern
            id="khatam-lattice"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={stroke} strokeWidth="0.75">
              <path d="M36 4 L52 20 L36 36 L20 20 Z" />
              <path d="M36 36 L52 52 L36 68 L20 52 Z" />
              <path d="M4 36 L20 20 L36 36 L20 52 Z" opacity="0.55" />
              <path d="M68 36 L52 20 L36 36 L52 52 Z" opacity="0.55" />
              <circle cx="36" cy="36" r="3.2" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#khatam-lattice)" />
      </svg>
    </div>
  );
}

/**
 * The double rule that framed every slide of the original deck, reduced to a
 * hairline so it frames rather than boxes.
 */
export function OrnamentFrame({
  className,
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "neutral" | "night";
}) {
  const color =
    tone === "gold"
      ? "var(--gold-500)"
      : tone === "night"
        ? "var(--gold-300)"
        : "var(--ink)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        // 1px outer rule + 1px inner rule, exactly as in the source slides.
        border: `1px solid color-mix(in oklab, ${color} 22%, transparent)`,
        borderRadius: 2,
        inset: 0,
        boxShadow: `inset 0 0 0 5px transparent, inset 0 0 0 6px color-mix(in oklab, ${color} 11%, transparent)`,
      }}
    />
  );
}

/** Small rule + lozenge used to separate a kicker from its title. */
export function FiligreeRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("flex items-center gap-2 text-gold-400", className)}
    >
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold-400/50" />
      <svg width="9" height="9" viewBox="0 0 9 9" className="shrink-0">
        <path
          d="M4.5 0 L9 4.5 L4.5 9 L0 4.5 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
        />
      </svg>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold-400/50" />
    </div>
  );
}

/**
 * The cover's decorative layer: heritage drawn, technology implied.
 *
 * ## What this is not
 *
 * It is not a floating blob field, a parallax stack, or a soft gradient with
 * some dots. Those are the default shapes a decorative background takes, and
 * they say nothing — the deck's motion rule is that movement must mean
 * something, and motion that only exists to fill space is the clearest possible
 * statement that the space needed filling.
 *
 * ## What it is instead
 *
 * Two things the cover's own text is about, drawn:
 *
 * 1. **Calligraphic arcs.** The three long curves are single strokes, and they
 *    are *drawn* — `pathLength` 0 → 1 — rather than faded in. A calligrapher's
 *    line is the oldest gesture in this subject, and drawing one is the only
 *    animation here that echoes the thing being talked about. It plays once, on
 *    entry.
 * 2. **The khatim.** An eight-pointed star, the geometry underneath the
 *    interlacing, sitting still behind the title.
 *
 * The technology half of the cover — Arabic as heritage and as a science —
 * is carried by the type and the progress rail rather than by a second drawing,
 * because a laptop glyph next to a star pattern is the generic-landing-page
 * answer and it is worse than saying nothing.
 *
 * ## Why it is drawn and not an image
 *
 * A bitmap here would be crisp at 1080p and blurry at 4K, would add a request
 * and weight, and could not be recoloured per ground. Strokes scale with the
 * viewport, cost nothing, and inherit `currentColor`.
 *
 * ## Reduced motion
 *
 * Under `prefers-reduced-motion` the paths render at `pathLength: 1` with no
 * transition, so the composition is identical and only the drawing is skipped.
 * The decoration carries no information, so nothing is lost.
 */
export function CoverMotif({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "night";
}) {
  const reduced = usePrefersReducedMotion();
  const ink = tone === "night" ? "text-gold-200" : "text-gold-500";
  const veil = tone === "night" ? "text-night-line" : "text-paper-line";

  const drawn = reduced
    ? { initial: { pathLength: 1 }, transition: { duration: 0 } }
    : {
        initial: { pathLength: 0 },
        transition: { duration: 2.1, ease: [0.33, 1, 0.68, 1] as const },
      };

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* ── the khatim. Still. It is the ground, and grounds do not move. ── */}
      <motion.svg
        viewBox="0 0 400 400"
        className={cn(
          "absolute inset-s-1/2 top-1/2 h-[min(150%,145vw)] w-[min(150%,145vw)] -translate-x-1/2 -translate-y-1/2",
          veil,
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
        initial={false}
      >
        <g opacity="0.5">
          <path d="M200 20 L262 70 L338 62 L330 138 L380 200 L330 262 L338 338 L262 330 L200 380 L138 330 L62 338 L70 262 L20 200 L70 138 L62 62 L138 70 Z" />
          <rect x="86" y="86" width="228" height="228" />
        </g>
        <g opacity="0.3">
          <path d="M200 86 L314 200 L200 314 L86 200 Z" />
          <path d="M200 114 L286 200 L200 286 L114 200 Z" />
        </g>
      </motion.svg>

      {/* ── three calligraphic strokes, drawn once ── */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className={cn("absolute inset-0 h-full w-full", ink)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      >
        {[
          /* upper sweep, rising to the right in RTL */
          { d: "M-40 300 C 320 190 700 250 1000 150 C 1230 76 1400 110 1660 44", delay: 0.25, o: 0.22 },
          /* the long lower counter-curve */
          { d: "M-40 640 C 380 780 760 700 1080 806 C 1300 880 1450 840 1660 892", delay: 0.5, o: 0.18 },
          /* a shorter inner accent, the small flourish beside a signature */
          { d: "M1160 470 C 1290 424 1400 476 1648 412", delay: 0.8, o: 0.14 },
        ].map((s, i) => (
          <motion.path
            key={i}
            d={s.d}
            opacity={s.o}
            initial={drawn.initial}
            animate={{ pathLength: 1 }}
            transition={{ ...drawn.transition, delay: s.delay }}
          />
        ))}
      </svg>

      {/* ── where the stroke lands ──
          Three small rosettes where the arcs terminate, so the drawing has
          somewhere to finish. Static: they are the punctuation of the strokes
          above, and they arrive with them. */}
      <div className={cn("absolute inset-0", ink)}>
        {[
          [96.5, 15],
          [98, 92],
          [26, 74],
        ].map(([x, y], i) => (
          <span
            key={i}
            className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[1px] bg-current opacity-30"
            style={{ insetInlineStart: `${x}%`, top: `${y}%` }}
          />
        ))}
      </div>
    </div>
  );
}
