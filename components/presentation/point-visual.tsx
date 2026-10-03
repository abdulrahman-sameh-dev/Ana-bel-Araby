"use client";

import Image from "next/image";
import { Quote as QuoteIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { articulationGroups } from "@/data/presentation";
import type { PointVisual as PointVisualType } from "@/data/points";

/**
 * Draws a point's visual.
 *
 * The old sections each carried their own bespoke block for this, which meant
 * the same idea — a quotation, a list of words, a specimen — was drawn four
 * different times. Splitting it out means the spotlight can hand a point's
 * visual to whatever section it is in, and each visual is drawn once, in one
 * place, at one size.
 *
 * Everything here is code rather than an image. That is deliberate: type,
 * lists, and the articulation schematic are sharper at any size, they animate
 * in, they are selectable by a screen reader, and they follow the deck's
 * palette. Only the two artworks stay photographic.
 */
export function PointVisual({
  visual,
  tone = "ink",
  className,
}: {
  visual: PointVisualType;
  tone?: "ink" | "night";
  className?: string;
}) {
  const isNight = tone === "night";

  switch (visual.kind) {
    /* ── the Qur'an verse, at the size a verse deserves ── */
    case "verse":
      return (
        <figure
          className={cn(
            "ornament-frame relative overflow-hidden rounded-lg px-[clamp(1rem,0.7rem+0.9vw,1.75rem)] py-(--sp-block) w-full",
            isNight ? "bg-night-raised" : "bg-linear-to-br from-paper-raised to-gold-100/50",
            className,
          )}
        >
          <QuoteIcon
            className={cn(
              "absolute -top-1 h-9 w-9",
              isNight ? "text-gold-300/30" : "text-gold-300/40",
            )}
            aria-hidden
          />
          <blockquote
            className={cn(
              "scripture relative type-scripture font-bold balance w-full",
              isNight ? "text-night-text" : "text-ink",
            )}
          >
            {visual.text}
          </blockquote>
          <figcaption
            className={cn(
              "mt-2 flex items-center gap-2 type-micro font-semibold w-full",
              isNight ? "text-gold-300" : "text-gold-500",
            )}
          >
            <span className="h-px w-6 bg-gold-400/60" aria-hidden />
            {visual.attribution}
          </figcaption>
        </figure>
      );

    /* ── a saying, in the dark card ── */
    case "saying":
      return (
        <blockquote
          className={cn(
            "ornament-frame relative overflow-hidden rounded-lg px-[clamp(1rem,0.7rem+0.9vw,1.6rem)] py-(--sp-block)",
            "bg-ink text-paper",
            className,
          )}
        >
          <QuoteIcon
            className="absolute -top-0.5 h-7 w-7 rotate-180 text-gold-400/30"
            aria-hidden
          />
          <p className="scripture relative type-scripture leading-[1.75] font-bold text-paper balance">
            {visual.text}
          </p>
          <footer className="mt-2 flex items-center gap-2 type-micro font-semibold text-gold-300">
            <span className="h-px w-6 bg-gold-400/50" aria-hidden />
            {visual.attribution}
          </footer>
        </blockquote>
      );

    /* ── a specimen: the number, or a title as a typographic object ── */
    case "term":
      return (
        <div
          className={cn(
            "ornament-frame rounded-lg px-[clamp(1rem,0.7rem+0.9vw,1.75rem)] py-(--sp-block)",
            isNight ? "bg-night-raised" : "bg-paper-raised",
            className,
          )}
        >
          {visual.latin ? (
            <p
              className={cn(
                "font-latin text-[clamp(0.7rem,0.6rem+0.4vw,0.9rem)] tracking-[0.2em]",
                isNight ? "text-gold-300" : "text-gold-600",
              )}
              dir="ltr"
            >
              {visual.latin}
            </p>
          ) : null}
          <p
            className={cn(
              "font-display type-display-lg balance",
              isNight ? "text-night-text" : "text-ink",
              visual.latin ? "mt-1" : "",
            )}
          >
            {visual.text}
          </p>
          {visual.note ? (
            <p
              className={cn(
                "mt-1.5 type-body",
                isNight ? "text-night-muted" : "text-ink-muted",
              )}
            >
              {visual.note}
            </p>
          ) : null}
        </div>
      );

    /* ── a short list, set large ── */
    case "beats":
      return (
        <ul
          className={cn(
            "flex flex-wrap items-baseline gap-x-3 gap-y-1.5",
            className,
          )}
        >
          {visual.items.map((item, i) => (
            <li
              key={item}
              className={cn(
                "font-display type-display-sm",
                i % 2 === 0
                  ? isNight
                    ? "text-gold-200"
                    : "text-gold-600"
                  : isNight
                    ? "text-night-text"
                    : "text-ink",
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      );

    /* ── the four European loanwords ──
        One treatment only. An earlier draft printed the same four words twice —
        once as a headline in the point copy and again as these cards — so the
        slide said the same thing twice and the second time said nothing new.
        The Latin word leads at display size, because it is the thing that is
        surprising; the Arabic sits beneath it as the recognisable gloss. */
    case "loanwords":
      return (
        <ul
          className={cn(
            "grid grid-cols-2 gap-(--sp-tight) sm:grid-cols-4",
            className,
          )}
        >
          {visual.words.map((w) => (
            <li
              key={w.word}
              className={cn(
                "rounded-lg border px-[clamp(0.5rem,0.35rem+0.4vw,0.9rem)] py-(--sp-tight) text-center",
                isNight
                  ? "border-gold-300/35 bg-night-raised"
                  : "border-gold-400/45 bg-paper-raised",
              )}
            >
              <span
                className={cn(
                  "tabular block type-micro font-semibold",
                  isNight ? "text-gold-300" : "text-gold-500",
                )}
              >
                {w.index}
              </span>
              <span
                className={cn(
                  "mt-0.5 block font-latin text-[clamp(1.15rem,0.95rem+0.8vw,1.75rem)] font-bold leading-tight",
                  isNight ? "text-night-text" : "text-ink",
                )}
                dir="ltr"
              >
                {w.word}
              </span>
              {w.meaning ? (
                <span
                  className={cn(
                    "mt-1 block font-display text-[clamp(0.8rem,0.72rem+0.3vw,1rem)]",
                    isNight ? "text-gold-200" : "text-gold-600",
                  )}
                >
                  {w.meaning}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      );

    /* ── the articulation schematic ──
        Drawn rather than photographed, because the point is the *idea* of
        grouping letters by where the sound is made, and a diagram of that is
        clearer, sharper, and movable than any artwork would be. Explicitly a
        schematic: no claim is made that it reproduces a historical diagram. */
    case "articulation":
      return (
        <div
          className={cn(
            "ornament-frame rounded-lg px-[clamp(1rem,0.7rem+0.9vw,1.75rem)] py-(--sp-block)",
            isNight ? "bg-night-raised" : "bg-paper-raised",
            className,
          )}
        >
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
            {articulationGroups.map((g) => (
              <li key={g.id} className="min-w-0">
                <p
                  className={cn(
                    "kicker",
                    isNight ? "text-gold-300" : "text-gold-600",
                  )}
                >
                  {g.label}
                </p>
                <p
                  dir="rtl"
                  className={cn(
                    "scripture mt-0.5 text-[clamp(1.1rem,0.95rem+0.7vw,1.6rem)] leading-tight",
                    isNight ? "text-night-text" : "text-ink",
                  )}
                >
                  {g.letters.join(" ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      );

    /* ── the team's own artwork ── */
    case "artwork":
      return (
        <figure
          className={cn(
            // `flex-1` plus a `min-h` floor, and both are load-bearing. The
            // `fill` image below is absolutely positioned, so it contributes
            // no height of its own: inside the section's flex column this
            // figure would otherwise resolve to zero and the artwork would be
            // invisible. `min-h-0` — the obvious choice in a flex child —
            // is exactly what allows that collapse, so the floor is expressed
            // as an actual minimum height instead.
            //
            // `max-w` keeps the bordered plate from stretching the full width
            // of a wide stage while a portrait artwork letterboxes inside it.
            // The plate then frames the picture instead of becoming a
            // full-bleed strip with the work marooned in the middle of it.
            "relative mx-auto flex-1 w-full max-w-136 overflow-hidden rounded-lg border bg-paper-sunk min-h-[clamp(7rem,22vh,18rem)]",
            isNight ? "border-night-line" : "border-paper-line",
            className,
          )}
        >
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 40rem"
            className="object-contain"
            loading="lazy"
          />
        </figure>
      );

    /* ── handout-only kinds ──
        `evidence` exists so the presenter handout can say what the «ما وراء
        العرض» screen is, in words, without inventing a visual language for it.
        That screen draws itself in `behind-section`, and the projector never
        routes this kind here — so this branch must not draw anything.

        It is written out rather than left to fall off the end of the switch,
        which would have returned `undefined` and rendered a silent blank: the
        next person to add a point to `pointSections` would have been debugging
        an empty stage with no error anywhere. */
    case "evidence":
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "PointVisual: 'evidence' is a handout-only kind and has no stage " +
            "treatment. The «ما وراء العرض» screen is drawn by BehindSection.",
        );
      }
      return null;
  }
}
