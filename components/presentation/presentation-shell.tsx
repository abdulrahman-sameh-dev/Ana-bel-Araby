"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Transition, Variants } from "motion/react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { Keyboard } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  presentation,
  sections,
  behindTask,
  behindNotes,
  teamNotes,
  SECTION_DURATION_SECONDS,
  type NotesSource,
  type Section,
} from "@/data/presentation";
import {
  useFullscreen,
  usePrefersReducedMotion,
  useSectionTimer,
} from "@/hooks/use-presentation";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  PresentationProgress,
  PresentationNavigation,
} from "./presentation-navigation";
import { PresentationControls, ShortcutSheet } from "./presentation-controls";
import { SectionTimer } from "./section-timer";
import { PresenterNotes } from "./presenter-notes";

import { Introduction } from "@/components/sections/introduction";
import { IdentitySection } from "@/components/sections/identity-section";
import { TechnologySection } from "@/components/sections/technology-section";
import { DiscoverySection } from "@/components/sections/surprising-facts-section";
import { HistorySection } from "@/components/sections/history-section";
import { BehindSection } from "@/components/sections/behind-section";
import { TeamSection } from "@/components/sections/team-section";
import { ClosingSection } from "@/components/sections/closing-section";

/* -------------------------------------------------------------------------- */
/*  Stage model                                                                */
/* -------------------------------------------------------------------------- */

type StageView = {
  key: string;
  kind: "cover" | "section" | "extra" | "closing";
  section: Section | null;
  label: string;
};

/** Cover → four sections → the two credit stages → closing. */
const STAGES: StageView[] = [
  { key: "cover", kind: "cover", section: null, label: "المقدمة" },
  ...sections.map<StageView>((section) => ({
    key: section.id,
    kind: "section",
    section,
    label: `${section.numeral} · ${section.shortTitle}`,
  })),
  { key: "behind", kind: "extra", section: null, label: behindTask.title },
  { key: "team", kind: "extra", section: null, label: "فريق العمل" },
  { key: "closing", kind: "closing", section: null, label: "الخلاصة" },
];

/**
 * Which stage owns the dark ground. Only the technology section flips the
 * whole page, so the rails have exactly one exception to handle.
 */
const NIGHT_STAGES = new Set(["technology"]);

type Tone = "ink" | "night";

/* -------------------------------------------------------------------------- */
/*  Motion                                                                     */
/* -------------------------------------------------------------------------- */

const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * The deck pages the way an RTL book does: moving forward brings the next
 * stage in from the left and sends the old one out to the right, and back
 * navigation is the mirror of that.
 */
const stageVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * -56 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * 56 }),
};

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

type StageLayerProps = {
  custom?: number;
  variants?: Variants;
  initial?: "enter" | "center" | "exit" | false;
  animate?: "enter" | "center" | "exit";
  exit?: "enter" | "center" | "exit";
  transition?: Transition;
};

/**
 * One stage, pinned to the stage box.
 *
 * On a presentation screen the stage is locked to the viewport, so the layer is
 * absolutely positioned and the outgoing one is taken out of flow entirely.
 * Below the presentation breakpoint the deck becomes an ordinary scrolling
 * page and the layer goes back into normal flow, so a section is free to be
 * taller than the screen.
 *
 * `useIsPresent` is what keeps the outgoing stage from stealing a click meant
 * for the incoming one: during the cross-fade both are mounted, and the one on
 * its way out has to go deaf.
 */
function StageLayer({
  custom,
  variants,
  initial,
  animate,
  exit,
  transition,
  children,
}: StageLayerProps & { children: React.ReactNode }) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      custom={custom}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={cn(
        isPresent
          ? "relative flex grow flex-col lg:absolute lg:inset-0"
          : "absolute inset-0 flex flex-col",
      )}
      style={{ pointerEvents: isPresent ? "auto" : "none" }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shell                                                                      */
/* -------------------------------------------------------------------------- */

export function PresentationShell() {
  const reduced = usePrefersReducedMotion();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [notesOpen, setNotesOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  /**
   * Who is holding the floor right now.
   *
   * This is presentation state only. `section.speaker` and
   * `section.speakerBackup` are the record of who wrote and who covers, and
   * neither is ever reassigned: the shell resolves the displayed name from
   * this flag, so the credits page and the data stay true to the team.
   */
  const [backupPresenter, setBackupPresenter] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  /** Stops a held arrow key from running the deck away from the presenter. */
  const navLock = useRef(false);

  const fullscreen = useFullscreen();

  const stage = STAGES[index];
  const isSection = stage.kind === "section";
  const tone: Tone = NIGHT_STAGES.has(stage.key) ? "night" : "ink";

  /** -1 on the cover, 0–3 across the sections, 4 on the closing. */
  const sectionIndex =
    stage.kind === "section"
      ? index - 1
      : stage.kind === "closing"
        ? sections.length
        : -1;

  // The section's own identity is the clock's session key, so each of the four
  // speakers gets a fresh 90 seconds.
  const timer = useSectionTimer(
    SECTION_DURATION_SECONDS,
    isSection ? stage.key : null,
  );
  const { toggle: toggleTimer, reset: resetTimer } = timer;

  /**
   * The name the room should see. Falls back to the primary whenever the
   * section has no cover, so an absent cover can never blank the footer.
   */
  const activeSpeaker = stage.section
    ? backupPresenter
      ? stage.section.speakerBackup || stage.section.speaker
      : stage.section.speaker
    : "";

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setIndex(Math.min(STAGES.length - 1, Math.max(0, next)));
  }, []);

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrevious = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  /* ---------------------------------------------------------------------- */
  /*  Keyboard                                                               */
  /* ---------------------------------------------------------------------- */

  /**
   * Arrow Up / Down move within whatever the current stage marks as its
   * navigable strip. Each section tags its own control group with
   * `data-keynav`, so the shell stays out of every section's internal state:
   * it moves focus and activates, and the section keeps deciding what that
   * means. Returns false when the stage has no strip, leaving the key alone.
   */
  const moveWithinStage = useCallback((step: number) => {
    const group = stageRef.current?.querySelector<HTMLElement>("[data-keynav]");
    if (!group) return false;

    const items = Array.from(
      group.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [role="tab"]:not([aria-disabled="true"])',
      ),
    );
    if (items.length === 0) return false;

    const at = items.indexOf(document.activeElement as HTMLElement);
    const next = at === -1 ? 0 : (at + step + items.length) % items.length;
    items[next]?.focus();
    // Focus alone would move the eye without moving the content on sections
    // that only select on click, so the same target is activated too.
    items[next]?.click();
    return true;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      /**
       * Only text entry gets a blanket veto. A focused *button* must not
       * swallow the deck's keys: Arrow Up/Down exist precisely to walk the
       * section's axis while one of its buttons holds focus, and a presenter
       * reaching for N or F should not have to click into the void first.
       */
      const inTextEntry =
        !!target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (event.metaKey || event.ctrlKey || event.altKey || inTextEntry) return;

      // Esc unwinds the overlays. Leaving fullscreen is the browser's own job,
      // so that is not intercepted here.
      if (event.key === "Escape") {
        if (shortcutsOpen) setShortcutsOpen(false);
        else if (notesOpen) setNotesOpen(false);
        return;
      }

      if (event.key === "f" || event.key === "F" || event.key === "ب") {
        event.preventDefault();
        fullscreen.toggle();
        return;
      }

      if (event.key === "n" || event.key === "N" || event.key === "ن") {
        event.preventDefault();
        setNotesOpen((open) => !open);
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen((open) => !open);
        return;
      }

      if (shortcutsOpen) return;

      /**
       * A stage-level modal owns the keyboard while it is open. Without this
       * the deck would happily page itself away underneath a lightbox the
       * moment the presenter reached for an arrow key to compare two images.
       * Esc is handled above, so the modal can still be dismissed.
       */
      if (document.querySelector("[data-modal]")) return;

      if (event.code === "Space") {
        event.preventDefault();
        // On the cover, Space is the advertised way in. On a section it is the
        // presenter's clock, and it stays the clock even when a section button
        // holds focus: Enter still activates that button, and a presenter with
        // a clicker in one hand should not have to aim to pause.
        if (stage.kind === "cover") goNext();
        else if (isSection) toggleTimer();
        return;
      }

      if (event.key === "Enter" && stage.kind === "cover") {
        event.preventDefault();
        goNext();
        return;
      }

      /** Throttles a held arrow key to one stage per beat. */
      const beat = () => {
        if (navLock.current) return;
        navLock.current = true;
        window.setTimeout(() => {
          navLock.current = false;
        }, 280);
      };

      // Right-to-left: the left arrow carries the talk forward.
      if (event.key === "ArrowLeft" || event.key === "PageDown") {
        event.preventDefault();
        beat();
        goNext();
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageUp") {
        event.preventDefault();
        beat();
        goPrevious();
        return;
      }

      if (event.key === "ArrowDown") {
        if (moveWithinStage(1)) event.preventDefault();
        return;
      }

      if (event.key === "ArrowUp") {
        if (moveWithinStage(-1)) event.preventDefault();
        return;
      }

      // Direct jumps, so a speaker who runs long can be skipped to. The range
      // follows the section count rather than a typed-in `1-4`, so a fifth
      // chapter is reachable the day it is written.
      if (/^[1-9]$/.test(event.key)) {
        const target = Number(event.key) - 1;
        if (target < sections.length) {
          event.preventDefault();
          goTo(target + 1, target > sectionIndex ? 1 : -1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    fullscreen,
    goNext,
    goPrevious,
    goTo,
    isSection,
    moveWithinStage,
    notesOpen,
    sectionIndex,
    shortcutsOpen,
    stage.kind,
    toggleTimer,
  ]);

  /* ---------------------------------------------------------------------- */
  /*  Housekeeping on a stage swap                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setShortcutsOpen(false);
    // Presenter notes deliberately stay open across sections: someone
    // flipping back and forth should not have to reopen them every time.
  }, [index]);

  // The stage owns the viewport during a talk, so nothing may stay scrolled
  // behind it when the next section is swapped in.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [index]);

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                  */
  /* ---------------------------------------------------------------------- */

  const transition = reduced
    ? { duration: 0.001 }
    : { duration: 0.42, ease: EASE };

  const motionVariants = reduced ? fadeVariants : stageVariants;

  /**
   * What the notes panel shows. The four chapters carry their own record; the
   * two credit stages are not timed and have no single speaker, so they are
   * described here rather than being forced into a `Section` shape.
   */
  const notesSource: NotesSource | null =
    stage.kind === "section"
      ? stage.section
      : stage.kind === "extra"
        ? {
            numeral: null,
            shortTitle: stage.label,
            notes: stage.key === "behind" ? behindNotes : teamNotes,
            durationSeconds: null,
          }
        : null;

  const shared = {
    section: stage.section as Section,
    /** Resolved live — already reflects whoever is covering. */
    speaker: activeSpeaker,
    backupActive: backupPresenter,
    onToggleBackup: () => setBackupPresenter((on) => !on),
    elapsed: timer.elapsed,
    onNext: goNext,
    onPrevious: goPrevious,
  };

  function renderStage() {
    if (stage.kind === "cover") return <Introduction onStart={goNext} />;
    if (stage.kind === "closing") {
      return <ClosingSection onRestart={() => goTo(0, -1)} />;
    }
    if (stage.kind === "extra") {
      return stage.key === "behind" ? <BehindSection /> : <TeamSection />;
    }

    switch (stage.section?.stage) {
      case "technology":
        return <TechnologySection {...shared} />;
      case "discovery":
        return <DiscoverySection {...shared} />;
      case "history":
        return <HistorySection {...shared} />;
      default:
        return <IdentitySection {...shared} />;
    }
  }

  return (
    <TooltipProvider>
      <div
        data-stage={stage.key}
        className={cn(
          "flex min-h-dvh flex-col",
          "lg:h-dvh lg:overflow-hidden",
          tone === "night" ? "bg-night" : "bg-paper",
        )}
      >
        {/* What a screen reader hears when the stage changes. */}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {stage.kind === "section"
            ? `القسم ${stage.section?.numeral} — ${stage.section?.title} — المتحدث: ${activeSpeaker}`
            : stage.label}
        </p>

        {/* ===================== top rail ===================== */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-3 border-b px-[clamp(1rem,0.5rem+1.6vw,2.25rem)] py-2",
            tone === "night" ? "border-night-line/70" : "border-paper-line",
          )}
        >
          {/* Start of the RTL line: what is being shown, and by whom. */}
          <div className="flex min-w-0 items-center gap-3">
            <svg
              width="13"
              height="13"
              viewBox="0 0 12 12"
              aria-hidden
              className="size-3 shrink-0"
            >
              <path
                d="M6 0.4 L7.6 4.4 L11.6 6 L7.6 7.6 L6 11.6 L4.4 7.6 L0.4 6 L4.4 4.4 Z"
                fill="none"
                stroke={tone === "night" ? "var(--gold-300)" : "var(--gold-400)"}
                strokeWidth="0.9"
              />
            </svg>
            <span
              className={cn(
                "kicker hidden shrink-0 sm:inline",
                tone === "night" ? "text-night-muted" : "text-ink-muted",
              )}
            >
              {presentation.team}
            </span>
          </div>

          {/* End of the RTL line: progress, then movement, then utilities. */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <PresentationProgress
              activeIndex={sectionIndex}
              onSelect={(i) => goTo(i + 1, i > sectionIndex ? 1 : -1)}
              tone={tone}
            />
            <PresentationNavigation
              onPrevious={goPrevious}
              onNext={goNext}
              canGoPrevious={index > 0}
              canGoNext={index < STAGES.length - 1}
              tone={tone}
            />
            <PresentationControls
              isFullscreen={fullscreen.isFullscreen}
              onToggleFullscreen={fullscreen.toggle}
              notesOpen={notesOpen}
              onToggleNotes={() => setNotesOpen((open) => !open)}
              onShowShortcuts={() => setShortcutsOpen(true)}
              tone={tone}
            />
          </div>
        </div>

        {/* ===================== the stage ===================== */}
        {/* `grow` rather than `flex-1`: below `lg` the layer is in normal flow
            and the wrapper must take its height from the content, or a section
            taller than the screen would be clipped instead of scrolled. */}
        <div ref={stageRef} className="relative flex min-h-0 grow flex-col">
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <StageLayer
              key={stage.key}
              custom={direction}
              variants={motionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {renderStage()}
            </StageLayer>
          </AnimatePresence>
        </div>

        {/* ===================== bottom rail ===================== */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-3 border-t px-[clamp(1rem,0.5rem+1.6vw,2.25rem)] py-1.5",
            tone === "night" ? "border-night-line/70" : "border-paper-line",
          )}
        >
          {/* The presenter's clock, live only while a speaker is up. */}
          <div className="flex min-w-0 items-center gap-2.5">
            {isSection ? (
              <SectionTimer
                elapsed={timer.elapsed}
                durationSeconds={SECTION_DURATION_SECONDS}
                running={timer.running}
                onToggle={toggleTimer}
                onReset={resetTimer}
                tone={tone}
              />
            ) : (
              <span
                className={cn(
                  "kicker",
                  tone === "night" ? "text-night-muted" : "text-ink-faint",
                )}
              >
                {stage.label}
              </span>
            )}
          </div>

          {/* The shortcuts, taught once and then quiet. */}
          <p
            className={cn(
              "hidden items-center gap-1.5 type-micro md:flex",
              tone === "night" ? "text-night-muted/80" : "text-ink-faint",
            )}
          >
            <Keyboard className="size-3 shrink-0" aria-hidden />
            <span>
              ← التالي · → السابق · ↑ ↓ المحاور · مسافة المؤقت · F ملء
              الشاشة · N ملاحظات
            </span>
          </p>
        </div>

        {/* ===================== overlays ===================== */}
        <PresenterNotes
          section={notesSource}
          speaker={activeSpeaker || undefined}
          open={notesOpen}
          onClose={() => setNotesOpen(false)}
          elapsed={timer.elapsed}
          className={cn(
            "fixed z-40 overflow-y-auto overscroll-contain",
            "inset-x-0 bottom-0 max-h-[62dvh] rounded-t-2xl border-t border-night-line bg-night p-4 shadow-deep",
            "lg:inset-y-0 lg:end-0 lg:start-auto lg:max-h-none lg:w-[21.5rem] lg:rounded-none lg:border-s lg:border-t-0 lg:p-5",
          )}
        />

        <ShortcutSheet
          open={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
        />
      </div>
    </TooltipProvider>
  );
}
