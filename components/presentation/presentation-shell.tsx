"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Transition, Variants } from "motion/react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { Keyboard } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  presentation,
  sections,
  behindTask,
  behindNotes,
  coverNotes,
  closingNotes,
  teamNotes,
  closing,
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
import { TeamBrand } from "./team-brand";

import { IdentitySection } from "@/components/sections/identity-section";
import { TechnologySection } from "@/components/sections/technology-section";
import { DiscoverySection } from "@/components/sections/surprising-facts-section";
import { HistorySection } from "@/components/sections/history-section";
import { BehindSection } from "@/components/sections/behind-section";
import { TeamSection } from "@/components/sections/team-section";
import { CoverSection } from "@/components/sections/cover-section";
import { ClosingSection } from "@/components/sections/closing-section";
import { OpeningChallenge } from "@/components/sections/opening-challenge";
import { pointsFor, type PresentationPoint } from "@/data/points";
import {
  handoffFor,
  openingBudgetFor,
  openingNotes,
  openingStepAt,
  OPENING_STEPS,
} from "@/data/handoff";

/* -------------------------------------------------------------------------- */
/*  Stage model                                                                */
/* -------------------------------------------------------------------------- */

type StageView = {
  key: string;
  kind: "cover" | "opening" | "section" | "extra" | "ghaith" | "closing";
  section: Section | null;
  label: string;
};

/**
 * Cover → opening question → four chapters → behind the scenes → غيث → closing.
 *
 * The bookends exist because a talk needs both of them. Opening straight onto
 * the question means the room does not yet know what it is looking at or who is
 * standing in front of it; ending on the credits means the last thing read is
 * a list of names. The cover settles the first, and a closing stage that leads
 * with the gratitude settles the second.
 *
 * `STAGE_OFFSET` is the price of the two bookends: the chapters are no longer
 * at `index - 1`, so every place that maps a stage index onto the chapter rail
 * has to add it. It is declared once, here, and derived from the array rather
 * than typed in, so adding or removing a stage can never leave the rail showing
 * a different chapter from the one on screen.
 */
const STAGES: StageView[] = [
  { key: "cover", kind: "cover", section: null, label: "الافتتاح" },
  { key: "opening", kind: "opening", section: null, label: "سؤال الافتتاح" },
  ...sections.map<StageView>((section) => ({
    key: section.id,
    kind: "section",
    section,
    label: `${section.numeral} · ${section.shortTitle}`,
  })),
  { key: "behind", kind: "extra", section: null, label: behindTask.title },
  { key: "ghaith", kind: "ghaith", section: null, label: "فريق غيث" },
  { key: "closing", kind: "closing", section: null, label: "الخلاصة" },
];

/** Where the chapters start in `STAGES`. */
const STAGE_OFFSET = STAGES.findIndex((s) => s.kind === "section");

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
  /**
   * Which point of the current chapter is on stage, and whether the chapter
   * has finished and is handing over.
   *
   * These live here rather than inside the section components for two reasons.
   * The arrow keys have to walk points before they change stage, and the
   * presenter notes have to describe the point that is actually on screen —
   * neither of those can be done from inside a component that has never heard
   * of the others.
   */
  const [pointIndex, setPointIndex] = useState(0);
  const [handoffVisible, setHandoffVisible] = useState(false);
  /**
   * Whether the opening question has been answered.
   *
   * Part of the same state, for the same reason: the reveal changes what the
   * stage shows, and the stage is driven from here.
   */
  /**
   * Which of the opening's three screens is showing: 0 card, 1 question,
   * 2 answer. See `OPENING_STEPS`.
   *
   * An index rather than the old `revealed` boolean, because the opening is
   * three screens and a boolean cannot say which one is up — which is what the
   * presenter's clock needs in order to count the right budget.
   */
  const [openingStep, setOpeningStep] = useState(0);
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

  /** -1 outside the chapters, otherwise the chapter's position in the rail. */
  const sectionIndex = stage.kind === "section" ? index - STAGE_OFFSET : -1;

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

  /** The current chapter's points, and the one on stage. */
  const points = useMemo(
    () => (isSection ? pointsFor(stage.section?.id) : []),
    [isSection, stage.section?.id],
  );
  const point: PresentationPoint | null =
    points.length > 0 ? points[Math.min(pointIndex, points.length - 1)] : null;
  /** Not every chapter hands over: the last one goes straight to the credits. */
  const hasHandoff = isSection && handoffFor(stage.section?.id) !== null;

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setIndex(Math.min(STAGES.length - 1, Math.max(0, next)));
  }, []);

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrevious = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  /** Back to the cover, from the closing stage's restart. */
  const goStart = useCallback(() => goTo(0, -1), [goTo]);

  /**
   * Forward: next point, then the hand-off, then the next stage.
   *
   * A chapter is made of points, so one arrow press moves one point. Only when
   * the last point has been shown does the deck offer the hand-off, and only
   * from the hand-off does it move on. That gap is deliberate — it is where a
   * speaker finishes, the next one stands up, and the room can see the change
   * happen rather than discover it halfway through a new section.
   */
  const advance = useCallback(() => {
    // The opening takes three presses on purpose — card, question, answer —
    // and only then leaves. A clicker mashed out of nerves skips the silence
    // the whole talk is built around, and that silence is the only thing in the
    // deck that is not on the slides. Two presses cannot express "asked, then
    // answered", which is why this is an index and not the boolean it was.
    if (stage.kind === "opening") {
      if (openingStep < OPENING_STEPS.length - 1) {
        setOpeningStep((s) => s + 1);
      } else {
        goNext();
      }
      return;
    }
    if (isSection) {
      if (handoffVisible) {
        goNext();
        return;
      }
      if (points.length > 0 && pointIndex < points.length - 1) {
        setPointIndex((i) => i + 1);
        return;
      }
      if (hasHandoff) {
        setHandoffVisible(true);
        return;
      }
    }
    goNext();
  }, [
    goNext,
    hasHandoff,
    handoffVisible,
    isSection,
    openingStep,
    pointIndex,
    points.length,
    stage.kind,
  ]);

  /** Backwards: retract the hand-off, then the previous point, then the stage. */
  const retreat = useCallback(() => {
    // Stepping back off the opening un-reveals one screen at a time: a
    // presenter who answered too early can take the answer back, and one who
    // turned the card too soon can un-turn it, without losing the stage.
    if (stage.kind === "opening") {
      // Only while there is an earlier screen to go back to. On the card — step
      // 0 — this used to `return` unconditionally, which made the opening a
      // one-way door in both directions: the presenter could un-turn the card
      // and un-reveal the answer, but could not back out to the cover without
      // first walking the whole opening forwards again. Falling through once
      // the card is reached is what makes the arrow key mean "back" everywhere
      // in the deck instead of everywhere except here.
      if (openingStep > 0) {
        setOpeningStep((s) => s - 1);
        return;
      }
    }
    if (isSection) {
      if (handoffVisible) {
        setHandoffVisible(false);
        return;
      }
      if (pointIndex > 0) {
        setPointIndex((i) => i - 1);
        return;
      }
    }
    goPrevious();
  }, [goPrevious, handoffVisible, isSection, openingStep, pointIndex, stage.kind]);

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
        // On the cover and on the opening, Space is the advertised way in. On a
        // section it is the presenter's clock, and it stays the clock even when
        // a section button holds focus: Enter still activates that button, and a
        // presenter with a clicker in one hand should not have to aim to pause.
        if (stage.kind === "cover" || stage.kind === "opening") advance();
        else if (isSection) toggleTimer();
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
        advance();
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageUp") {
        event.preventDefault();
        beat();
        retreat();
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
      // chapter is reachable the day it is written. The target is offset by the
      // cover and the opening, so `1` is always chapter ٠١ and never the cover.
      if (/^[1-9]$/.test(event.key)) {
        const target = Number(event.key) - 1;
        if (target < sections.length) {
          event.preventDefault();
          const stageIndex = target + STAGE_OFFSET;
          goTo(stageIndex, stageIndex > index ? 1 : -1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    advance,
    fullscreen,
    goNext,
    goPrevious,
    goTo,
    index,
    isSection,
    moveWithinStage,
    notesOpen,
    retreat,
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

  /**
   * A new stage always opens at its first point with no hand-over pending, and
   * the opening restarts at its card. Landing mid-chapter would mean arriving
   * at a room already talking.
   */
  useEffect(() => {
    setPointIndex(0);
    setHandoffVisible(false);
    setOpeningStep(0);
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
   * What the notes panel shows.
   *
   * The four chapters carry their own record. Every *other* stage gets one
   * here, so `N` is never dead — which matters most on the two bookends: the
   * cover is where a speaker needs to be told to say nothing, and the closing
   * is where they need the reading order in front of them. The credit and
   * hand-off stages are not timed, so their duration stays `null` and the panel
   * draws no clock.
   */
  const notesSource: NotesSource | null = (() => {
    switch (stage.kind) {
      case "section":
        return stage.section;
      case "cover":
        return {
          numeral: null,
          shortTitle: stage.label,
          notes: coverNotes,
          durationSeconds: null,
        };
      case "opening":
        return {
          numeral: null,
          shortTitle: stage.label,
          notes: openingNotes,
          /* The budget of the screen currently up — 40s to ask and let the
             room think, then 20s to read the answer. Not the sum: the card is
             a beat, not part of either segment, and counting it would make the
             rail's clock disagree with what the presenter is doing. */
          durationSeconds: openingBudgetFor(openingStepAt(openingStep)),
        };
      case "extra":
        return {
          numeral: null,
          shortTitle: stage.label,
          notes: stage.key === "behind" ? behindNotes : teamNotes,
          durationSeconds: null,
        };
      case "ghaith":
        return {
          numeral: null,
          shortTitle: stage.label,
          notes: teamNotes,
          durationSeconds: null,
        };
      case "closing":
        return {
          numeral: null,
          shortTitle: stage.label,
          notes: closingNotes,
          durationSeconds: null,
        };
    }
  })();

  const shared = {
    section: stage.section as Section,
    /** Resolved live — already reflects whoever is covering. */
    speaker: activeSpeaker,
    backupActive: backupPresenter,
    onToggleBackup: () => setBackupPresenter((on) => !on),
    point: point as PresentationPoint,
    pointIndex,
    points,
    onSelectPoint: (i: number) => {
      setPointIndex(i);
      // Choosing a point is a decision to keep talking, so any hand-over
      // standing between the presenter and the content goes away.
      setHandoffVisible(false);
    },
    handoffVisible,
    onDismissHandoff: () => setHandoffVisible(false),
    onAdvanceHandoff: goNext,
  };

  function renderStage() {
    if (stage.kind === "cover") {
      return <CoverSection onStart={goNext} />;
    }
    if (stage.kind === "opening") {
      return (
        <OpeningChallenge
          speaker={activeSpeaker || undefined}
          step={openingStepAt(openingStep)}
          /* Both the card and the hand-off button advance the *opening*, which
             is why this steps rather than calling `goNext`: pressing the card
             flips it to the question, it does not leave the stage. */
          onContinue={() => advance()}
        />
      );
    }
    if (stage.kind === "ghaith") return <TeamSection onContinue={goNext} />;
    if (stage.kind === "closing") return <ClosingSection onRestart={goStart} />;
    if (stage.kind === "extra") return <BehindSection />;

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
          {handoffVisible
            ? `سؤال قبل المحور التالي: ${handoffFor(stage.section?.id)?.teaser ?? ""} — ثم يتابع ${handoffFor(stage.section?.id)?.to ?? ""}`
            : stage.kind === "section" && point
              ? `القسم ${stage.section?.numeral} — ${stage.section?.title} — النقطة ${point.index} من ${points.length}: ${point.title} — المتحدث: ${activeSpeaker}`
              : stage.kind === "cover"
                ? `غلاف العرض: ${presentation.title} — ${presentation.subtitle} — فريق ${presentation.team}`
                : stage.kind === "closing"
                  ? `${closing.thanks} — ${closing.statement}`
                  : stage.label}
        </p>

        {/* ===================== top rail ===================== */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-3 border-b px-[clamp(1rem,0.5rem+1.6vw,2.25rem)] py-2",
            tone === "night" ? "border-night-line/70" : "border-paper-line",
          )}
        >
          {/* Start of the RTL line: who is presenting.
              The brief asks for the logo and the team name to read as ONE
              compact lockup — `[logo] غيث` — rather than the mark parked at
              one edge with the name somewhere else, or the mark alone with the
              name pushed into an `alt` where nobody sees it. `TeamBrand` owns
              that grouping: the mark is fixed, the name rotates with a short
              tagline in a fixed-width slot so the toolbar never jumps, and
              neither is animated on its own clock. */}
          <TeamBrand tone={tone} />

          {/* End of the RTL line: progress, then movement, then utilities. */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <PresentationProgress
              activeIndex={sectionIndex}
              onSelect={(i) => {
                const stageIndex = i + STAGE_OFFSET;
                goTo(stageIndex, stageIndex > index ? 1 : -1);
              }}
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
            taller than the screen would be clipped instead of scrolled.

            `overflow-x: clip` keeps the decorative arabesque and the stage
            glow from nudging the document 2-3px sideways on a 360px phone.
            `clip` rather than `hidden` so this stays a non-scrolling
            container: vertical overflow must keep scrolling below `lg`. */}
        <div
          ref={stageRef}
          className="relative flex min-h-0 grow flex-col overflow-x-clip"
        >
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
          {/* ── the rail ──
              Two audiences, one screen.

              The deck is driven from a laptop that is also driving a projector,
              so anything in this strip is on the wall. Which means the presenter's
              clock and the keyboard reference are *presenter* material, and the
              brief is right that they do not belong on an audience screen: a
              running clock invites the room to watch the clock, and a row of key
              names is a control panel for the operator of a machine nobody in
              the audience is operating.

              So the strip is split by whether the notes overlay is open (`N`):

              - overlay closed — the audience view. Just the stage label: a
                neutral position readout, the same job as the progress rail,
                carrying no instruction and no timing.
              - overlay open — the presenter view. The live clock and the
                shortcut reference return, because that is when someone is
                actually driving and needs them.

              The label is deliberately not a timer even though the clock is
              already running underneath. Showing one would be an argument for
              showing the other. */}
          <div className="flex min-w-0 items-center gap-2.5">
            {notesOpen && isSection ? (
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
                  "kicker truncate",
                  tone === "night" ? "text-night-muted" : "text-ink-faint",
                )}
              >
                {stage.label}
              </span>
            )}
          </div>

          {/* The shortcuts, taught once and then quiet — and only to the
              person driving. There is deliberately no "press N" teaser in the
              closed state: a hint that something is hidden is still a hint, and
              the brief is specific that the audience sees no keyboard hints.
              `N` is documented on `/presenter` instead, which is the one surface
              the operator is already looking at before they go on stage. */}
          {notesOpen ? (
            <p
              className={cn(
                "hidden items-center gap-1.5 type-micro md:flex",
                tone === "night" ? "text-night-muted/80" : "text-ink-faint",
              )}
            >
              <Keyboard className="size-3 shrink-0" aria-hidden />
              <span>
                ← التالي · → السابق · ↑ ↓ المحاور · مسافة المؤقت · F ملء الشاشة
                · N ملاحظات
              </span>
            </p>
          ) : null}
        </div>

        {/* ===================== overlays ===================== */}
        <PresenterNotes
          section={notesSource}
          point={point}
          pointIndex={pointIndex}
          pointCount={points.length}
          speaker={activeSpeaker || undefined}
          open={notesOpen}
          onClose={() => setNotesOpen(false)}
          elapsed={timer.elapsed}
          className={cn(
            "fixed z-40 overflow-y-auto overscroll-contain",
            "inset-x-0 bottom-0 max-h-[62dvh] rounded-t-2xl border-t border-night-line bg-night p-4 shadow-deep",
            "lg:inset-y-0 lg:inset-e-0 lg:inset-s-auto lg:max-h-none lg:w-86 lg:rounded-none lg:border-s lg:border-t-0 lg:p-5",
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
