"use client";

import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";

/**
 * A quiet "where we are, and what is next" marker for the sections that walk a
 * sequence of points.
 *
 * These sections already show the whole sequence as a list of real controls,
 * so this is not navigation and it is not announced — it is the one glance
 * that answers "how much is left, and what do I say after this?" without the
 * presenter having to read the list. It sits at the end of the RTL line, which
 * is the direction the talk travels, so the arrow points the way the audience
 * is about to be taken.
 */
export function NextPointPreview({
  total,
  current,
  currentLabel,
  nextLabel,
  tone = "ink",
  className,
}: {
  total: number;
  /** Zero-based index of the point on stage. */
  current: number;
  /** Shown as the position, so the marker is not only dots. */
  currentLabel: string;
  /** `null` on the last point — the tail says so instead of teasing nothing. */
  nextLabel: string | null;
  tone?: "ink" | "night";
  className?: string;
}) {
  const isNight = tone === "night";
  const last = current >= total - 1;

  const subtle = isNight ? "text-night-muted" : "text-ink-faint";
  const strong = isNight ? "text-night-text" : "text-ink";
  const accent = isNight ? "text-gold-300" : "text-gold-600";

  return (
    <div
      // Purely a restatement of the point list beside it: announcing it would
      // make a screen reader say every point twice on each move.
      aria-hidden
      className={cn(
        "flex items-center gap-3 rounded-full border px-3 py-1.5",
        isNight
          ? "border-night-line bg-night-raised/70"
          : "border-paper-line bg-paper-raised/70",
        className,
      )}
    >
      {/* Position, as a run of ticks with the travelled ones filled. */}
      <span className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "block h-1 rounded-full transition-all duration-300",
              i < current
                ? "w-3"
                : i === current
                  ? cn("w-5", isNight ? "bg-gold-300" : "bg-gold-500")
                  : "w-3",
              i < current
                ? isNight
                  ? "bg-gold-300/45"
                  : "bg-gold-400/45"
                : i === current
                  ? ""
                  : isNight
                    ? "bg-night-muted/25"
                    : "bg-ink/12",
            )}
          />
        ))}
      </span>

      <span className={cn("tabular type-micro", subtle)}>
        {toArabicDigits(current + 1)} / {toArabicDigits(total)}
      </span>

      <span className={cn("h-3 w-px", isNight ? "bg-night-line" : "bg-paper-line")} />

      {/* The point on stage, named. */}
      <span className={cn("truncate type-micro font-semibold", strong)}>
        {currentLabel}
      </span>

      {/* And the one after it. */}
      {last ? (
        <span className={cn("type-micro", subtle)}>آخر المحاور</span>
      ) : (
        <span className={cn("flex min-w-0 items-center gap-1 type-micro", subtle)}>
          <span className="shrink-0">التالي</span>
          <ChevronLeft className="size-3 shrink-0" aria-hidden />
          <motion.span
            key={nextLabel}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
            className={cn("truncate font-semibold", accent)}
          >
            {nextLabel}
          </motion.span>
        </span>
      )}
    </div>
  );
}
