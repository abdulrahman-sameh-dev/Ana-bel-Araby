"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  Globe2,
  Smartphone,
  BookOpen,
  Clapperboard,
  Cpu,
  HandHeart,
  type LucideIcon,
} from "lucide-react";

import { techNodes, techArtwork, type Section, type TechNode } from "@/data/presentation";
import type { PresentationPoint } from "@/data/points";
import { SectionHeader } from "@/components/presentation/section-header";
import { SpeakerMeta } from "@/components/presentation/speaker-meta";
import { OrnamentFrame } from "@/components/presentation/ornaments";
import { SpotlightStage } from "@/components/presentation/spotlight-stage";
import { PointVisual } from "@/components/presentation/point-visual";
import { SectionHandoff } from "@/components/sections/section-handoff";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";

const ICONS: Record<TechNode["icon"], LucideIcon> = {
  globe: Globe2,
  smartphone: Smartphone,
  book: BookOpen,
  clapper: Clapperboard,
  cpu: Cpu,
  hands: HandHeart,
};

/**
 * Stage 02 — Technology.
 *
 * Still the one dark stage: the deck's parchment gives way to charcoal to mark
 * the shift from heritage to tools. The six nodes are no longer a spine the
 * audience has to read top to bottom — the point on stage is the whole visual,
 * and the spine has become the navigator strip under it.
 */
export function TechnologySection({
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
  const node = techNodes.find((n) => n.id === point.id);
  const ActiveIcon = node ? ICONS[node.icon] : Globe2;

  return (
    <section
      className="stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden bg-night text-night-text"
      aria-label={section.title}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_0%,var(--accent-tech)_0%,transparent_65%)] opacity-[0.13]"
      />
      <OrnamentFrame className="inset-4 sm:inset-6" tone="night" />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1680px)] min-h-0 flex-1 flex-col gap-(--sp-block)">
        {handoffVisible ? (
          <SectionHandoff
            handoffFrom={section.id}
            onContinue={onAdvanceHandoff}
            onBack={onDismissHandoff}
            tone="night"
          />
        ) : (
          <SpotlightStage
            point={point}
            points={points}
            index={pointIndex}
            onSelect={onSelectPoint}
            tone="night"
            /* Persistent for the whole chapter: this is the section's standing
               image, and the per-point content is what should be moving. It used
               to be inside the keyed content and re-faded on every point. See
               `SpotlightStage`. This one section is the night stage, so the
               column is 22rem rather than the 20rem used on the paper grounds. */
            visual={<TechnologyArtwork />}
            /* Landscape, so this one gets a wider budget than the portrait
               calligraphy — the columns are not meant to match. */
            visualWidth="clamp(16rem, 34%, 30rem)"
            /* The plate is 1.6:1. Same reason as the calligraphy below `lg`. */
            visualAspect="8 / 5"
            heading={
              <SectionHeader
                numeral={section.numeral}
                kicker={section.kicker}
                title={section.title}
                hook={section.hook}
                tone="night"
              />
            }
          >
            <p className="flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-tech/20 text-accent-tech-soft">
                <ActiveIcon className="size-4" aria-hidden />
              </span>
              <span className="kicker text-accent-tech-soft">
                النقطة {point.index}
              </span>
            </p>

            <h2 className="stage-title type-display-md balance text-night-text">
              {point.title}
            </h2>

            <PointVisual visual={point.visual} tone="night" className="w-full py-6" />

            <motion.p
              key={`${point.id}-headline`}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 }}
              className="type-body-lg balance text-gold-200"
            >
              {point.headline}
            </motion.p>
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
          tone="night"
        />
      </div>
    </section>
  );
}

/**
 * The chapter's standing image, held to the edge of the stage.
 *
 * Persistent, and faded once. A single fade on entry: on a dark projector a
 * looping animation on a photographic image is the most visible thing on
 * screen and the least meaningful, so it does not have one.
 */
function TechnologyArtwork() {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ duration: 0.5 }}
      className="relative h-full min-h-0 overflow-hidden rounded-lg border border-night-line bg-night-raised"
    >
      <Image
        src={techArtwork.src}
        alt={techArtwork.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 22rem"
        className="object-cover object-center"
        loading="lazy"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-night/80 via-transparent to-transparent"
      />
    </motion.figure>
  );
}
