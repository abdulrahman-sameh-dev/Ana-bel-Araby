"use client";

import { AnimatePresence, motion } from "motion/react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/format";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";

/**
 * Section clock with pause / resume / reset.
 *
 * Deliberately calm: no pulsing when time is short, no colour alarm until the
 * 90 seconds are actually gone. The ring is the only moving part, and it moves
 * at 1 Hz-equivalent so it reads as a clock, not as an animation.
 */
export function SectionTimer({
  elapsed,
  durationSeconds,
  running,
  onToggle,
  onReset,
  tone = "ink",
  className,
}: {
  elapsed: number;
  durationSeconds: number;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  /** Matches the stage underneath, so the clock never inverts against it. */
  tone?: "ink" | "night";
  className?: string;
}) {
  const remaining = Math.max(0, durationSeconds - elapsed);
  const overrun = elapsed > durationSeconds;
  const ratio = Math.min(1, elapsed / durationSeconds);
  const shown = overrun ? formatClock(elapsed) : formatClock(remaining);

  const reduced = usePrefersReducedMotion();
  const isNight = tone === "night";
  const R = 15;
  const CIRC = 2 * Math.PI * R;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border py-1 ps-1 pe-1.5 sm:gap-2 sm:pe-2",
        isNight
          ? "border-night-line bg-night-raised/80"
          : "border-paper-line bg-paper-raised/80",
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={running ? "إيقاف المؤقت مؤقتاً" : "استئناف المؤقت"}
        title={running ? "إيقاف مؤقت  ·  مسافة" : "استئناف  ·  مسافة"}
        className={cn(
          "grid size-6.5 place-items-center rounded-full transition-transform duration-150 hover:scale-105 active:scale-95 sm:size-7",
          isNight
            ? "bg-gold-300 text-night hover:bg-gold-200"
            : "bg-ink text-paper",
        )}
      >
        {running ? (
          <Pause className="size-3" aria-hidden />
        ) : (
          <Play className="size-3 translate-x-px" aria-hidden />
        )}
      </button>

      <div className="relative grid size-8 place-items-center">
        <svg
          viewBox="0 0 34 34"
          className="absolute inset-0 size-7 -rotate-90 sm:size-8"
          aria-hidden
        >
          <circle
            cx="17"
            cy="17"
            r={R}
            fill="none"
            stroke={isNight ? "var(--night-line)" : "var(--paper-line)"}
            strokeWidth="2"
          />
          <circle
            cx="17"
            cy="17"
            r={R}
            fill="none"
            stroke={
              overrun
                ? "var(--destructive)"
                : isNight
                  ? "var(--gold-300)"
                  : "var(--gold-400)"
            }
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - ratio)}
            style={{ transition: "stroke-dashoffset 0.3s linear" }}
          />
        </svg>
        <span className="sr-only">
          {running ? "المؤقت يعمل" : "المؤقت متوقف"}، الوقت المتبقي {shown}
        </span>
      </div>

      <span
        className={cn(
          "tabular min-w-[2.3rem] text-center type-body-sm font-bold sm:min-w-[2.6rem] sm:text-[0.8rem]",
          overrun
            ? "text-destructive"
            : isNight
              ? "text-night-text"
              : "text-ink",
        )}
        dir="ltr"
        aria-hidden
      >
        {shown}
      </span>

      <button
        type="button"
        onClick={onReset}
        aria-label="تصفير المؤقت"
        title="تصفير"
        className={cn(
          "grid size-6.5 place-items-center rounded-full transition-colors duration-150 sm:size-7",
          isNight
            ? "text-night-muted hover:bg-night-raised hover:text-night-text"
            : "text-ink-muted hover:bg-paper-sunk hover:text-ink",
        )}
      >
        <RotateCcw className="size-3" aria-hidden />
      </button>

      <AnimatePresence>
        {overrun ? (
          <motion.span
            initial={reduced ? false : { opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 6 }}
            className="hidden type-micro font-semibold text-destructive sm:inline"
          >
            تجاوزت المدة
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
