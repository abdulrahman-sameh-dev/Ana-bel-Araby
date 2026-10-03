"use client";

import { Mic, CalendarDays, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { presentation } from "@/data/presentation";

/**
 * Footer rail shared by all four speaker sections.
 *
 * Two things are on it, and both are for the room: who is speaking, and the
 * date. Speaker on the **right** (the start of an RTL line), date on the left.
 *
 * ## The duration chip that used to be here
 *
 * This footer carried «مدة القسم» and a live countdown beside it — allotted on
 * the right, elapsed on the left, turning red past the allotment — plus a
 * «تفعيل الاحتياطي» switch with its own label. All of it is on the projected
 * screen, and all of it is information about the running of the event rather
 * than about Arabic, which puts it squarely under the brief's rule that the
 * audience's screen carries no timing and no presenter material. The live clock
 * was the worst of it: a red number ticking past 90 in the footer of a talk
 * about language, projected at people who were not asked to pace anything.
 *
 * It was here because the presenter needs it, and that is a real need — so the
 * timing did not disappear, it moved. The shell's rail shows a live clock only
 * while the presenter-notes overlay is open, `/presenter` carries each section's
 * budget on the handout, and the presenter page is the surface they are already
 * reading before they walk on.
 *
 * The backup switch keeps its target — a name on screen with no way to correct
 * it is a name that can be wrong — and loses its caption, for the same reason
 * the cards did: the icon carries the affordance and the `aria-label` and
 * `title` carry the name.
 */
export function SpeakerMeta({
  speaker,
  primarySpeaker,
  backupSpeaker,
  backupActive = false,
  onToggleBackup,
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
  tone?: "ink" | "night";
  className?: string;
}) {
  const isNight = tone === "night";
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
    // Two groups now instead of three, so this fits comfortably where the
    // timer used to sit. It still wraps rather than crushing the name: on a
    // phone the speaker matters more than the date.
    <footer
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-3",
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
            aria-label={
              backupActive
                ? `العودة إلى ${primarySpeaker}`
                : `تسليم التقديم إلى ${backupSpeaker}`
            }
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
            {/* `aria-pressed` is the state and `aria-label` is the name, so the
                wall shows one icon and nothing else. */}
            <span className="sr-only">
              {backupActive ? "الأساسي" : "تفعيل الاحتياطي"}
            </span>
          </button>
        ) : null}
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
