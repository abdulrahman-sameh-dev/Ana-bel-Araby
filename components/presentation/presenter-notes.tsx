"use client";

import { AnimatePresence, motion } from "motion/react";
import { X, Target, Timer, ListOrdered } from "lucide-react";
import type { NotesSource } from "@/data/presentation";
import { formatClock } from "@/lib/format";

/**
 * Presenter notes — hidden until the presenter presses `N`.
 *
 * Cues only, never a script: the goal is to jog memory in the two seconds
 * between sections, not to be read aloud. The panel docks to the side on wide
 * screens and becomes a bottom sheet on narrow ones, so it never covers the
 * part of the stage the audience is looking at.
 */
export function PresenterNotes({
  section,
  open,
  onClose,
  elapsed,
  speaker,
  className,
}: {
  section: NotesSource | null;
  open: boolean;
  onClose: () => void;
  elapsed: number;
  /** Resolved live, so a cover presenter sees their own name here too. */
  speaker?: string;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {open && section ? (
        <motion.aside
          key="notes"
          role="complementary"
          aria-label="لوحة ملاحظات المتحدث"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={className}
        >
          <div className="flex items-start justify-between gap-3 border-b border-night-line pb-3">
            <div className="min-w-0">
              <p className="kicker text-gold-300">ملاحظات المتحدث</p>
              <h3 className="mt-1 truncate type-body-sm font-bold text-night-text">
                {section.numeral ? `${section.numeral} · ` : ""}
                {section.shortTitle}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق الملاحظات"
              className="grid size-7 shrink-0 place-items-center rounded-full text-night-muted transition-colors hover:bg-night-raised hover:text-night-text"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-3 space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-gold-300/20 bg-gold-300/8 p-3">
              <Target
                className="mt-0.5 size-3.5 shrink-0 text-gold-300"
                aria-hidden
              />
              <p className="type-body-sm leading-relaxed font-semibold text-night-text">
                {section.notes.anchor}
              </p>
            </div>

            <div className="flex items-center gap-2 text-night-muted">
              <Timer className="size-3.5" aria-hidden />
              <span className="text-[0.7rem]">{section.notes.pacing}</span>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-semibold text-night-muted">
                <ListOrdered className="size-3.5" aria-hidden />
                محاور الحديث
              </p>
              <ul className="space-y-1.5">
                {section.notes.cues.map((cue, i) => (
                  <motion.li
                    key={cue}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 + i * 0.035 }}
                    className="flex items-start gap-2 type-body-sm leading-relaxed text-night-muted"
                  >
                    <span
                      className="tabular mt-0.5 shrink-0 font-bold text-gold-300/70"
                      dir="ltr"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{cue}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-night-line pt-3 text-[0.7rem] text-night-muted">
            {speaker ? <span>المتحدث: {speaker}</span> : <span />}
            {section.durationSeconds === null ? null : (
              <span className="tabular" dir="ltr">
                {formatClock(elapsed)} / {formatClock(section.durationSeconds)}
              </span>
            )}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
