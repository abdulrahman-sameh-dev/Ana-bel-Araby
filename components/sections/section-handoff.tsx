"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

import { HandoffState } from "@/components/sections/handoff-state";
import { handoffFor } from "@/data/handoff";

/**
 * The hand-off panel a section shows once its last point is done.
 *
 * It lives inside the section rather than beside it so the transition is a
 * state of the section, not a ninth stage: the speaker's clock, the footer,
 * and the progress rail all stay exactly where they were, and the deck does not
 * have to model "is this a section that happens to be handing over".
 */
export function SectionHandoff({
  handoffFrom,
  onContinue,
  onBack,
  tone = "ink",
}: {
  handoffFrom: string;
  onContinue: () => void;
  /** Step back to the last point rather than forward to the next section. */
  onBack: () => void;
  tone?: "ink" | "night";
}) {
  const handoff = handoffFor(handoffFrom);
  if (!handoff) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* No `nextTitle` and no next-speaker lookup. Both existed only to label
          the name, and the name was the leak. */}
      <HandoffState handoff={handoff} onContinue={onContinue} tone={tone} />
      {/* The escape hatch stays, but it stops announcing itself.

          Its caption told the room that the deck can be run backwards, which is
          a fact about the operator's clicker rather than about anything the
          room came for. It is still a real button with a real target, so it
          keeps an accessible name, a tooltip and a hover state; it just no
          longer prints its purpose at `type-micro` on the wall. */}
      <div className="flex shrink-0 justify-center pb-[var(--sp-tight)]">
        <button
          type="button"
          onClick={onBack}
          aria-label="العودة إلى آخر نقطة"
          title="العودة إلى آخر نقطة"
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors",
            tone === "night"
              ? "text-night-muted hover:bg-night-line/40 hover:text-night-text"
              : "text-ink-faint hover:bg-ink/5 hover:text-ink",
          )}
        >
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
