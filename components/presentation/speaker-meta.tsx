"use client";

import { motion } from "motion/react";
import { Mic, CalendarDays, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/format";
import { presentation } from "@/data/presentation";

/**
 * Footer rail shared by all four speaker sections.
 *
 * Layout is fixed by the brief: speaker on the **right** (the start of an RTL
 * line), date on the **left**. The duration chip sits in the middle and mirrors
 * the live clock, so the presenter can feel the 90 seconds without looking away
 * from the audience for long.
 *
 * The cover switch lives here too, next to the name it replaces. A presenter
 * taking over mid-talk should not have to find a switch somewhere else on the
 * slide, and a name shown in the footer with no way to change it is a name
 * that can be wrong.
 */
export function SpeakerMeta({
  speaker,
  primarySpeaker,
  backupSpeaker,
  backupActive = false,
  onToggleBackup,
  durationSeconds,
  elapsed,
  tone = "ink",
  className,
}: {
  /** Whoever is holding the floor right now. */
  speaker: string;
  /** The section's own speaker, whether or not they are the one on stage. */
  primarySpeaker: string;
  /** Cover presenter, or omit to hide the switch. */
  backupSpeaker?: string;
  /** True while the cover is holding the floor. */
  backupActive?: boolean;
  onToggleBackup?: () => void;
  durationSeconds: number;
  /** Live elapsed seconds for the current section. */
  elapsed?: number;
  tone?: "ink" | "night";
  className?: string;
}) {
  const isNight = tone === "night";
  const allotted = formatClock(durationSeconds);
  const live = elapsed === undefined ? null : formatClock(elapsed);
  const overrun = elapsed !== undefined && elapsed > durationSeconds;
  /**
   * A section with no distinct cover has nothing to switch to, so the control
   * is not rendered at all. The test is against the *primary*, never against
   * the name currently shown — otherwise switching on would make the cover
   * equal the shown name and the switch would delete itself, stranding the
   * presenter in someone else's section.
   */
  const canSwitch = Boolean(
    onToggleBackup && backupSpeaker && backupSpeaker !== primarySpeaker,
  );

  const subtle = isNight ? "text-night-muted" : "text-ink-muted";
  const strong = isNight ? "text-night-text" : "text-ink";

  return (
    <footer
      className={cn(
        "flex items-center justify-between gap-4 border-t pt-3",
        isNight ? "border-night-line/70" : "border-paper-line",
        subtle,
        className,
      )}
    >
      {/* Start of the RTL line = right-hand side. */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full border",
            isNight ? "border-gold-300/25 bg-night-raised" : "border-gold-400/30 bg-gold-100/60",
          )}
        >
          <Mic
            className={cn("size-3.5", isNight ? "text-gold-300" : "text-gold-500")}
            aria-hidden
          />
        </span>
        <span className="min-w-0">
          <span className="sr-only">المتحدث: </span>
          <span className={cn("block truncate type-body-sm font-semibold", strong)}>
            {speaker}
          </span>
        </span>

        {/* Cover switch. `aria-pressed` rather than a checkbox: this changes who
            is on stage, and the state belongs to the name beside it. */}
        {canSwitch ? (
          <button
            type="button"
            onClick={onToggleBackup}
            aria-pressed={backupActive}
            title={
              backupActive
                ? `العودة إلى ${primarySpeaker}`
                : `تسليم التقديم إلى ${backupSpeaker}`
            }
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 type-micro font-semibold transition-colors duration-200",
              backupActive
                ? isNight
                  ? "border-gold-300/50 bg-gold-300/15 text-gold-300"
                  : "border-gold-500/50 bg-gold-100 text-gold-700"
                : isNight
                  ? "border-night-line text-night-muted hover:border-gold-300/40 hover:text-night-text"
                  : "border-paper-line text-ink-muted hover:border-gold-400/50 hover:text-ink",
            )}
          >
            <UserCog className="size-3 shrink-0" aria-hidden />
            <span>{backupActive ? "الأساسي" : "تفعيل الاحتياطي"}</span>
          </button>
        ) : null}
      </div>

      {/* Duration — allotted vs. live. */}
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="hidden text-[0.7rem] tracking-wide sm:inline">
          مدة القسم:
        </span>
        <span
          className={cn(
            "tabular flex items-baseline gap-1.5 rounded-full border px-2.5 py-1",
            isNight
              ? "border-gold-300/25 bg-night-raised"
              : "border-gold-400/30 bg-gold-100/50",
          )}
        >
          <span className={cn("text-[0.82rem] font-bold", strong)} dir="ltr">
            {allotted}
          </span>
          {live !== null ? (
            <>
              <span aria-hidden className="text-[0.7rem] opacity-50">
                ←
              </span>
              <span
                className={cn(
                  "tabular text-[0.82rem] font-bold",
                  overrun ? "text-destructive" : "text-gold-500",
                )}
                dir="ltr"
              >
                {live}
              </span>
            </>
          ) : null}
        </span>
      </div>

      {/* End of the RTL line = left-hand side. */}
      <div className="flex shrink-0 items-center gap-2.5 type-body-sm">
        <CalendarDays className="size-3.5 opacity-60" aria-hidden />
        <span>
          <span className="sr-only">{presentation.dateLabel}: </span>
          <span className={cn("font-semibold", strong)}>{presentation.date}</span>
        </span>
      </div>
    </footer>
  );
}
