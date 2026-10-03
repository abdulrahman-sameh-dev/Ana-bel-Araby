"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { timelineEras, historyClosing, type Section } from "@/data/presentation";
import type { PresentationPoint } from "@/data/points";
import { SectionHeader } from "@/components/presentation/section-header";
import { SpeakerMeta } from "@/components/presentation/speaker-meta";
import { ArabesqueField } from "@/components/presentation/ornaments";
import { SpotlightStage } from "@/components/presentation/spotlight-stage";
import { PointVisual } from "@/components/presentation/point-visual";
import { SectionHandoff } from "@/components/sections/section-handoff";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";

/**
 * Stage 04 — History.
 *
 * A timeline, walked one stop at a time. The rail beside the stage is the whole
 * journey: the stop on stage is lit and carries its period, the stops either
 * side of it stay dim, and the room can see how much road is left without being
 * able to read what is at the end of it.
 *
 * ## Why the rail replaced the side image
 *
 * This stage used to hold one artwork in the side column for all seven points.
 * That is the failure mode the brief calls out — the same idea picture repeated
 * because the section had multiple points. It also spent the widest column on
 * a static photograph while the thing that genuinely changes from point to
 * point, *where we are in time*, had nowhere to go.
 *
 * So the rail is content, not decoration: seven stops, the current one named
 * and dated by span, and no invented years — the source gives an order, not a
 * calendar. The team's own artwork is no longer stretched across the stage; it
 * stays on the closing slide where it can be looked at once.
 */
/** The chapter's last stop — the four European loanwords.
 *
 *  Named once because the id is `influence`, not `europe`: `europe` is the
 *  *era's* id, and a comparison against it matches nothing at all, which left
 *  the final stop with neither its lead line nor its period. */
const LAST_STOP = "influence";

export function HistorySection({
  section,
  speaker,
  backupActive,
  onToggleBackup,
  point,
  pointIndex,
  points,
  onSelectPoint,
  handoffVisible,
  onDismissHandoff,
  onAdvanceHandoff,
}: {
  section: Section;
  speaker: string;
  backupActive: boolean;
  onToggleBackup: () => void;
  point: PresentationPoint;
  pointIndex: number;
  points: PresentationPoint[];
  onSelectPoint: (index: number) => void;
  handoffVisible: boolean;
  onDismissHandoff: () => void;
  onAdvanceHandoff: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const era = timelineEras.find((e) => e.id === point.id);

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label={section.title}
    >
      <ArabesqueField tone="ink" opacity={0.04} />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1680px)] min-h-0 flex-1 flex-col gap-(--sp-stage)">
        {handoffVisible ? (
          <SectionHandoff
            handoffFrom={section.id}
            onContinue={onAdvanceHandoff}
            onBack={onDismissHandoff}
          />
        ) : (
          <SpotlightStage
            point={point}
            points={points}
            index={pointIndex}
            onSelect={onSelectPoint}
            /* The rail below is this chapter's own visual and its own era index,
               mounted once in the persistent slot with the stop on stage lit.
               The navigator underneath is the shared one — the same component,
               the same markup and the same `onSelect` the other three chapters
               use, not a history-specific one.

               It used to be switched off here, on the grounds that a rail and a
               tick row are two progress indicators for one sequence and only
               one of them earns its place. That was a defensible call about
               this chapter's composition, but it left the fourth chapter on a
               different navigation mechanism from the first three, which is not
               what consistency means: the audience should not have to learn a
               second way of moving between points at the last chapter. The rail
               stays — it names every era, which is what makes this stage this
               stage — and the shared navigator is now on, exactly as in
               chapters 01–03. */
            visual={<HistoryRail activeId={point.id} onSelect={onSelectPoint} />}
            visualWidth="15rem"
            /* The rail is this stage's visual, and the point navigator below it
               is the shared one. What makes this stage is the rail, not the
               treatment. */
            heading={
              <SectionHeader
                numeral={section.numeral}
                kicker={section.kicker}
                title={section.title}
                hook={section.hook}
              />
            }
          >
            {/* The journey. A vertical rail in RTL reading order, with the stop
                on stage lit and the stops either side dimmed. It replaces a side
                image that repeated on all seven points: the artwork says "this
                is history" once, and the rail says where we *are*, which is the
                thing that actually changes between one point and the next.

                Because it sits in the persistent slot it is mounted once for the
                chapter. It still re-renders per point — it has to, to move the
                highlight — but it does not unmount, so its entrance and its
                highlight transitions play on a component that has been there
                since the section opened. */}
            <div className="flex min-h-0 flex-col gap-(--sp-tight)">
              <p className="flex items-center gap-2.5">
                <span className="tabular grid size-8 shrink-0 place-items-center rounded-full border border-gold-400/60 bg-paper-raised font-display type-body-sm font-bold text-gold-600">
                  {point.index}
                </span>
                {era ? (
                  <span className="kicker text-gold-600">{era.period}</span>
                ) : (
                  <span className="kicker text-gold-600">أمثلة على التأثير</span>
                )}
              </p>

              <h2 className="stage-title type-display-md balance text-ink">
                {point.title}
              </h2>

              {/* ── on the final stop the four loanwords *are* the content, so
                  they take the whole stage and no headline repeats them. On
                  every other stop the period is a one-word typographic object
                  and the detail below carries the idea. ── */}
              {point.id === LAST_STOP ? (
                <>
                  <PointVisual visual={point.visual} tone="ink" />
                  <motion.p
                    key={`${point.id}-lead`}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.06 }}
                    className="type-body-lg balance text-ink-soft"
                  >
                    {historyClosing.lead}
                  </motion.p>
                </>
              ) : (
                <>
                  <PointVisual visual={point.visual} tone="ink" />
                  <motion.p
                    key={`${point.id}-detail`}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.06 }}
                    className="type-body-lg balance text-ink-soft"
                  >
                    {era?.detail}
                  </motion.p>
                </>
              )}
            </div>
          </SpotlightStage>
        )}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,1680px)] pt-(--sp-tight)">
        <SpeakerMeta
          speaker={speaker}
          primarySpeaker={section.speaker}
          backupSpeaker={section.speakerBackup}
          backupActive={backupActive}
          onToggleBackup={onToggleBackup}
        />
      </div>
    </section>
  );
}

/**
 * The chapter's chronology: every stop named, with the one on stage lit.
 *
 * Extracted so it can live in `SpotlightStage`'s persistent slot. It re-renders
 * whenever `activeId` changes — that is how the highlight moves — but it does not
 * remount, so the entrance below plays once when the section opens rather than
 * once per point. Its entrance is a short slide because the rail is arriving as
 * a *new object* in the composition; the highlight itself is a colour and scale
 * change on an element that never moved, which needs no entrance at all.
 *
 * Not a picture of a place: the stops are the content.
 */
function HistoryRail({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (index: number) => void;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.ol
      initial={reduced ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduced ? 0.001 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-label="محطات التاريخ"
      className="flex h-full min-h-0 flex-col justify-center gap-0"
    >
      {timelineEras.map((e, i) => {
        const active = e.id === activeId;
        return (
          <li key={e.id} className="relative flex items-stretch gap-2.5">
            {/* The node, and the connector down to the next stop. */}
            <span aria-hidden className="relative flex w-3 shrink-0 flex-col items-center">
              <span
                className={cn(
                  "mt-1 block size-2.5 shrink-0 rounded-full transition-all duration-300",
                  active ? "scale-125 bg-gold-500" : "bg-paper-line",
                )}
              />
              {i !== timelineEras.length - 1 ? (
                <span
                  className={cn(
                    "w-px flex-1 transition-colors duration-300",
                    active ? "bg-gold-400/60" : "bg-paper-line",
                  )}
                />
              ) : null}
            </span>

            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={active ? "step" : undefined}
              className="flex min-w-0 cursor-pointer flex-col items-start pb-2 text-start"
            >
              <span
                className={cn(
                  "font-display text-[clamp(0.8rem,0.74rem+0.3vw,1.05rem)] leading-tight transition-colors duration-300",
                  active ? "text-ink" : "text-ink-faint/70 hover:text-ink-muted",
                )}
              >
                {e.title}
              </span>
              {active ? (
                <span className="kicker mt-0.5 text-gold-600">{e.period}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </motion.ol>
  );
}
