"use client";

import { motion } from "motion/react";
import { Star, Languages, BookOpen, type LucideIcon } from "lucide-react";

import { discoveryFacts, type Section } from "@/data/presentation";
import type { PresentationPoint } from "@/data/points";
import { SectionHeader } from "@/components/presentation/section-header";
import { SpeakerMeta } from "@/components/presentation/speaker-meta";
import { ArabesqueField } from "@/components/presentation/ornaments";
import { SpotlightStage } from "@/components/presentation/spotlight-stage";
import { PointVisual } from "@/components/presentation/point-visual";
import { SectionHandoff } from "@/components/sections/section-handoff";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";

const ICONS: Record<string, LucideIcon> = {
  maltese: Languages,
  aldebaran: Star,
  alain: BookOpen,
};

/**
 * Stage 03 — Surprising facts.
 *
 * Strictly sequential: one fact owns the stage, and the room is meant to
 * react to it before the next one arrives. The star point gets a night-sky
 * treatment because that is the only one of the three with a picture worth
 * drawing — the other two are words, and words set large are the better
 * visual.
 */
export function DiscoverySection({
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
  const fact = discoveryFacts.find((f) => f.id === point.id);
  const Icon = ICONS[point.id] ?? Star;
  const isStar = point.id === "aldebaran";

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label={section.title}
    >
      <ArabesqueField tone="ink" opacity={0.04} />

      {/* The sky is always mounted. It used to be conditional on the star point,
          which meant it unmounted going into that beat and mounted again coming
          out — the field of stars faded up from nothing, held, then faded down,
          twice in a three-point section. A decorative field that disappears and
          comes back reads as a slide transition, which is exactly the effect the
          brief asks not to lean on.

          `strength` now carries the emphasis instead: the field is dimmed while
          the other two facts are up and brightens when the star is on stage.
          Same drawing, mounted once, and the change is a fade on an element
          that never moved — which is a crossfade, not a reload. */}
      <NightSky strength={isStar ? 1 : 0.4} />

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
            /* No `visual`: this stage's picture is the night sky, which is the
               page background rather than a thing in a column. So the
               composition is a single centred column, and the same `items-center`
               that balances a two-column stage balances this one. */
            heading={
              <SectionHeader
                numeral={section.numeral}
                kicker={section.kicker}
                title={section.title}
                hook={section.hook}
                align="center"
              />
            }
          >
            <div className="flex min-h-0 flex-col justify-center w-full items-center gap-(--sp-tight) text-center">
              <p
                className={cn(
                  "grid size-14 shrink-0 place-items-center rounded-full border",
                  isStar
                    ? "border-gold-400/60 bg-night text-gold-300"
                    : "border-gold-400/50 bg-paper-raised text-gold-600",
                )}
              >
                <Icon className="size-6" aria-hidden />
              </p>

              {fact ? (
                <p className="kicker text-gold-600">{fact.kicker}</p>
              ) : null}

              <h2 className="stage-title type-display-lg balance text-ink">
                {point.title}
              </h2>

              <div className="text-center items-center px-6">
                <PointVisual visual={point.visual} tone="ink" className="py-8"/>
              </div>

              <motion.p
                key={`${point.id}-headline`}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.06 }}
                className="type-body-lg max-w-2xl balance text-ink-soft"
              >
                {point.headline}
              </motion.p>
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
 * A field of stars. Purely decorative, and mounted for the whole section.
 *
 * Drawn rather than photographed: it stays sharp at any projector resolution,
 * it cannot be mis-cropped, and it costs no image weight. `strength` (0–1)
 * scales the whole field, and every part of it transitions, so the change is
 * one continuous fade rather than several parts snapping at different rates.
 */
function NightSky({ strength }: { strength: number }) {
  const stars = [
    [12, 22, 1.5], [28, 68, 1], [44, 14, 1.2], [58, 82, 1.6],
    [70, 34, 1], [84, 12, 1.3], [18, 86, 1.1], [90, 62, 1.4],
    [36, 46, 1], [64, 56, 1.2], [8, 52, 1], [96, 40, 1.1],
  ] as const;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(42,36,29,0.16) 0%, transparent 70%)",
          opacity: strength,
        }}
      />
      {stars.map(([x, y, s], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold-300 transition-opacity duration-500 ease-out"
          style={{
            insetInlineStart: `${x}%`,
            top: `${y}%`,
            width: `${s}px`,
            height: `${s}px`,
            opacity: strength * (0.35 + (i % 3) * 0.12),
          }}
        />
      ))}
    </div>
  );
}
