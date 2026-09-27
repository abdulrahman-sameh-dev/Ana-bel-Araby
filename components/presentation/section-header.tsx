"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { FiligreeRule } from "./ornaments";

/**
 * Shared masthead for every stage: chapter numeral, kicker, title.
 *
 * `align` is `"split"` for the two-column stages (identity, technology) and
 * `"center"` for the single-axis stages (discovery, history, closing).
 */
export function SectionHeader({
  numeral,
  kicker,
  title,
  align = "split",
  tone = "ink",
  className,
  delay = 0,
}: {
  numeral?: string;
  kicker: string;
  title: string;
  align?: "split" | "center";
  tone?: "ink" | "night";
  className?: string;
  delay?: number;
}) {
  const centered = align === "center";
  const titleTone = tone === "night" ? "text-night-text" : "text-ink";
  const kickerTone = tone === "night" ? "text-gold-300" : "text-gold-600";

  return (
    <header
      className={cn(
        "flex min-w-0 flex-col",
        centered ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {/* The numeral rides inline with the kicker so the masthead costs one
          line instead of three — the difference between fitting a 720p
          projector and scrolling on it. */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className={cn(
          "flex items-center gap-2.5",
          centered && "justify-center",
        )}
      >
        {numeral ? (
          <span
            className={cn(
              "font-display font-bold leading-none",
              tone === "night" ? "text-gold-300/50" : "text-gold-400/50",
            )}
            style={{ fontSize: "var(--numeral-size)" }}
            aria-hidden
          >
            {numeral}
          </span>
        ) : null}
        {numeral ? (
          <span
            aria-hidden
            className={cn(
              "h-4 w-px",
              tone === "night" ? "bg-night-line" : "bg-paper-line",
            )}
          />
        ) : null}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: delay + 0.05 }}
          className={cn("kicker", kickerTone)}
        >
          {kicker}
        </motion.p>
      </motion.div>

      {/* Each stage is a page of its own, so its title is the page's `h1`.
          The section title is what a screen reader lands on when the speaker
          changes. */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.1 }}
        className={cn(
          "stage-title mt-1.5 type-display-md balance",
          titleTone,
          centered ? "max-w-3xl" : "max-w-2xl",
        )}
      >
        {title}
      </motion.h1>

      <FiligreeRule className={cn("mt-3", centered ? "w-40" : "w-28")} />
    </header>
  );
}
