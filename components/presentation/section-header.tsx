"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { FiligreeRule } from "./ornaments";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";

/**
 * Shared masthead for every stage: chapter numeral, kicker, title, hook.
 *
 * ## `variant="context"` — the one the sections use
 *
 * This used to be a masthead sitting on its own above the stage: numeral,
 * kicker, a rule, and the chapter title at `type-display-md`. Read next to a
 * point title set at `type-display-sm`, that made the *chapter* the biggest
 * type on the screen and the point being spoken a caption under it — which is
 * the argument inverted. The room should be able to tell at a glance which
 * chapter they are in and what is being said in it, and the thing being said is
 * the thing that changes every few seconds, so it is the thing that should be
 * large.
 *
 * So `context` renders the same four parts as a *contextual* heading: numeral
 * and kicker on one line, the chapter title a size below the point title and in
 * a quieter tone, the hook as the line that opens the chapter. No rule — the
 * brief asks for hierarchy from spacing and type rather than from a divider
 * that would box the heading off as a separate card. It sits inside the
 * point's own transition, so chapter and point arrive together as one
 * composition rather than as two blocks that happen to be near each other.
 *
 * `variant="masthead"` keeps the original large treatment for anywhere a stage
 * genuinely wants the chapter as its own page.
 */
export function SectionHeader({
  numeral,
  kicker,
  title,
  hook,
  align = "split",
  variant = "context",
  tone = "ink",
  className,
  delay = 0,
}: {
  numeral?: string;
  kicker: string;
  title: string;
  /**
   * The question the chapter opens on.
   *
   * Separate from `title` because the two do different jobs. The title says
   * what the chapter is about and stays put for all of it, so the room can
   * always tell where it is. The hook is the line that makes the room want to
   * hear it — a question, not a summary, and one that is still open when the
   * chapter ends. Folding the two together produced titles like
   * «طرق لتحسين اللغة العربية في زمن التطور التكنولوجي», which is a subject
   * line: it describes, it does not ask. The chapter gets both, in that order.
   *
   * Optional: where a chapter has no question worth opening on, leave it out
   * rather than writing one to fill the slot.
   */
  hook?: string;
  align?: "split" | "center";
  variant?: "context" | "masthead";
  tone?: "ink" | "night";
  className?: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const centered = align === "center";
  const isContext = variant === "context";
  const titleTone = isContext
    ? tone === "night"
      ? "text-night-muted"
      : "text-ink-muted"
    : tone === "night"
      ? "text-night-text"
      : "text-ink";
  const kickerTone = tone === "night" ? "text-gold-300" : "text-gold-600";

  return (
    <header
      className={cn(
        "flex min-w-0 flex-col",
        centered ? "items-center text-center" : "items-start pt-4",
        className,
      )}
    >
      {/* The numeral rides inline with the kicker so the masthead costs one
          line instead of three — the difference between fitting a 720p
          projector and scrolling on it. In `context` it is a marker rather than
          a display number: the chapter's identity, not the biggest thing in
          the composition. */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.001 : 0.4, delay: reduced ? 0 : delay }}
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
            style={{ fontSize: isContext ? "var(--numeral-size-context)" : "var(--numeral-size)" }}
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
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.001 : 0.4, delay: reduced ? 0 : delay + 0.05 }}
          className={cn("kicker", kickerTone)}
        >
          {kicker}
        </motion.p>
      </motion.div>

      {/* Each stage is a page of its own, so its title is the page's `h1`. The
          point titles inside it are `h2`. In `context` the title is set at body
          size and given weight instead of the display face's size: it reads as
          the heading that introduces the point below it, which is what the
          brief asks for, and it leaves the display sizes to the point title
          where the eye is meant to land. */}
      <motion.h1
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.001 : 0.5, delay: reduced ? 0 : delay + 0.1 }}
        className={cn(
          "balance",
          isContext
            ? cn(
                /* `type-body-lg`, not an omitted size class. Tailwind's preflight
                   sets `h1 { font-size: inherit }`, so a bare `font-display` here
                   silently inherited whatever the stage's base size happened to be
                   — 16px at 720p, i.e. exactly body-text size, which is not a
                   title a projector can be read from at the back of a room. Sized
                   from the scale, it lands ~19px at 720p and ~23px at 1080p:
                   still well under a 25–54px point title, so the hierarchy the
                   brief asks for holds, but it reads as a heading. */
                "mt-1.5 type-body-lg font-display font-semibold",
                centered ? "max-w-xl" : "max-w-lg",
              )
            : cn(
                "stage-title mt-1.5 type-display-md",
                centered ? "max-w-3xl" : "max-w-2xl",
              ),
          titleTone,
        )}
      >
        {title}
      </motion.h1>

      {/* The hook belongs to the chapter, not to the point, so it sits under
          the chapter title — where it reads as the chapter's opening line — and
          is set quieter than the point title below it. In the masthead variant
          the rule closed the title block first; in `context` there is no rule,
          so the hook follows the title directly and the gap below it opens the
          space where the point title begins. */}
      {hook ? (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0.001 : 0.5,
            delay: reduced ? 0 : delay + 0.18,
          }}
          className={cn(
            "balance",
            isContext
              ? cn(
                  "mt-1.5 type-body",
                  tone === "night" ? "text-night-muted/90" : "text-ink-faint",
                  centered ? "max-w-xl" : "max-w-md",
                )
              : cn(
                  "mt-3 type-body-lg",
                  tone === "night" ? "text-gold-200" : "text-ink-soft",
                  centered ? "max-w-2xl" : "max-w-xl",
                ),
          )}
        >
          {hook}
        </motion.p>
      ) : null}

      {/* The rule belongs to the masthead only. In `context` it would draw a
          line under the chapter heading and put it in a box of its own, which
          is the separation the brief is asking to remove. */}
      {isContext ? null : (
        <FiligreeRule className={cn("mt-3", centered ? "w-40" : "w-28")} />
      )}
    </header>
  );
}
