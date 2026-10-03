"use client";

import { motion } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import { sections } from "@/data/presentation";

/**
 * The chapter rail: `٠١ / ٠٤` plus four ticks.
 *
 * The denominator is derived from `sections` rather than typed out, so the
 * rail can never claim a chapter count the deck does not have.
 *
 * Sits above the stage, never over it. Each tick is a real button so the
 * presenter can jump straight to a section if a speaker runs long.
 */
export function PresentationProgress({
  activeIndex,
  onSelect,
  tone = "ink",
  className,
}: {
  /**
   * -1 on every stage that is not one of the chapters — the cover, the opening
   * question and the three stages after the last one — 0–3 across the chapters.
   */
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Matches the stage underneath, so the rail never inverts against it. */
  tone?: "ink" | "night";
  className?: string;
}) {
  const isNight = tone === "night";
  return (
    <nav
      aria-label="تقدّم العرض"
      className={cn("flex items-center gap-2.5 sm:gap-3", className)}
    >
      <span
        className={cn(
          "kicker shrink-0",
          isNight ? "text-night-muted" : "text-ink-faint",
        )}
      >
        <span className={cn("tabular", isNight ? "text-gold-300" : "text-gold-500")}>
          {activeIndex < 0 || activeIndex >= sections.length
            ? "—"
            : sections[activeIndex].numeral}
        </span>
        <span className="mx-1 opacity-50">/</span>
        <span className="tabular">{toArabicDigits(sections.length)}</span>
      </span>

      {/* The bar list is hidden below `sm`. It is ~136px of chrome, and at
          390px it did not fit beside the brand slot, the numeral, and the
          movement and utility controls — the row spilled 130px sideways and gave
          the whole stage a horizontal scroll. The numeral above already says
          where we are ("٠٢ / ٠٤"), and it is a tenth of the width, so on a phone
          the bars were paying for information the numeral was already giving.
          Everything from `sm` up keeps them. */}
      <ol className="hidden items-center gap-1.5 sm:flex sm:gap-2">
        {sections.map((section, i) => {
          const state =
            i < activeIndex ? "done" : i === activeIndex ? "active" : "ahead";
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={state === "active" ? "step" : undefined}
                aria-label={`القسم ${section.numeral} — ${section.shortTitle}`}
                className="group relative block h-5 cursor-pointer p-0 sm:h-6"
              >
                <span
                  className={cn(
                    "block h-[3px] w-7 rounded-full transition-all duration-300 sm:w-9",
                    state === "active"
                      ? isNight
                        ? "bg-gold-300"
                        : "bg-gold-400"
                      : state === "done"
                        ? isNight
                          ? "bg-gold-300/45 group-hover:bg-gold-300/70"
                          : "bg-gold-400/45 group-hover:bg-gold-400/70"
                        : isNight
                          ? "bg-night-muted/25 group-hover:bg-night-muted/45"
                          : "bg-ink/12 group-hover:bg-ink/25",
                  )}
                />
                {state === "active" ? (
                  <motion.span
                    layoutId="progress-pill"
                    className={cn(
                      "absolute inset-x-0 -bottom-1 mx-auto size-1 rounded-full",
                      isNight ? "bg-gold-300" : "bg-gold-500",
                    )}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span
                  className={cn(
                    // Below the rail, not above it: the top rail is flush with
                    // the top of the viewport, so a tooltip opened upward would
                    // land off-screen.
                    "pointer-events-none absolute top-[calc(100%+0.4rem)] right-0 hidden whitespace-nowrap rounded-md border px-2 py-1 type-micro font-semibold shadow-lift group-hover:block",
                    isNight
                      ? "border-night-line bg-night-raised text-night-text"
                      : "border-paper-line bg-paper-raised text-ink",
                  )}
                >
                  {section.shortTitle}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Prev / next pair. In RTL the visual "next" arrow points left, which is what
 * the audience expects when reading right-to-left.
 */
export function PresentationNavigation({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  tone = "ink",
  className,
}: {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  tone?: "ink" | "night";
  className?: string;
}) {
  const buttonClass = cn(
    "grid size-8 place-items-center rounded-full border sm:size-9",
    "transition-colors duration-200",
    tone === "night"
      ? "border-night-line bg-night-raised/80 text-night-muted hover:border-gold-300/50 hover:bg-night-raised hover:text-night-text"
      : "border-paper-line bg-paper-raised/80 text-ink-soft hover:border-gold-400/60 hover:bg-gold-100/70 hover:text-ink",
    "disabled:pointer-events-none disabled:opacity-30",
  );

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        type="button"
        className={buttonClass}
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="القسم السابق"
        title="السابق  ·  →"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="القسم التالي"
        title="التالي  ·  ←"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
    </div>
  );
}
