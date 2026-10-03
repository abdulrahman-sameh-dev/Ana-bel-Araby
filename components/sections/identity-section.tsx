"use client";

import Image from "next/image";
import { motion } from "motion/react";

import type { Section } from "@/data/presentation";
import type { PresentationPoint } from "@/data/points";
import { SectionHeader } from "@/components/presentation/section-header";
import { SpeakerMeta } from "@/components/presentation/speaker-meta";
import { ArabesqueField } from "@/components/presentation/ornaments";
import { SpotlightStage } from "@/components/presentation/spotlight-stage";
import { PointVisual } from "@/components/presentation/point-visual";
import { SectionHandoff } from "@/components/sections/section-handoff";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";

/**
 * Stage 01 — Identity.
 *
 * The argument is made in five steps and the screen follows the voice: the
 * verse fills the stage, then the saying, then the number, then the three
 * words, and only at the end the calligraphy. The other four are not on screen
 * as cards competing for attention — they are the navigator's tick marks, and
 * that is enough for the room to know where it is.
 */
export function IdentitySection({
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
  /** Already resolved by the shell: primary, cover, or backup. */
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
            /* The calligraphy is the subject of this section, so it stands
               beside the points as contextual weight rather than competing with
               them — and it stands *beside*, not instead: whichever point the
               speaker is on, this is the picture. Because it lives in the
               persistent slot it mounts once, and its reveal plays once, on
               entry to the chapter.

               The column used to be conditional — it dropped away on the final
               point, where the calligraphy is also that point's own visual, to
               avoid showing the same artwork twice. That conditional was the
               symptom rather than the cause: the two columns were really one
               idea duplicated in two places. Now the point visual and the
               section visual are separate things that happen to share a subject
               on one beat, and the artwork stays put. */
            /* A portrait calligraphy, so the column is narrow and the content
               takes the rest. The artwork used to be the last point's own
               visual as well, which meant the same picture appeared twice on one
               screen; it is now only the section's standing image. */
            visual={<IdentityArtwork />}
            visualWidth="clamp(13rem, 26%, 26rem)"
            /* 320x404, the plate's own frame. Below `lg` this keeps the crop
               honest instead of letterboxing a portrait into a wide short box. */
            visualAspect="320 / 404"
            heading={
              <SectionHeader
                numeral={section.numeral}
                kicker={section.kicker}
                title={section.title}
                hook={section.hook}
              />
            }
          >
            <p className="kicker text-gold-600">النقطة {point.index}</p>
            {/* The point is now the largest type on the stage. It was
                `type-display-sm` against the chapter's `type-display-md`,
                which had the argument the wrong way round: the chapter is
                constant for the whole talk, the point is what is being said
                right now. */}
            <h2 className="stage-title type-display-md balance text-ink">
              {point.title}
            </h2>
            <PointVisual visual={point.visual} tone="ink" className="w-[80%] py-6"/>
            <motion.p
              key={`${point.id}-headline`}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 }}
              className="type-body-lg balance text-ink-soft"
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
        />
      </div>
    </section>
  );
}

/**
 * The chapter's standing image.
 *
 * Split out of the render body so it can be handed to `SpotlightStage`'s
 * persistent slot as a single element. It is a plain component rather than
 * inline JSX for the same reason: inline JSX here would be a new element type
 * on every parent render, and the whole point of the slot is that this thing
 * does not get rebuilt as the point changes.
 *
 * Its entrance is a single fade on mount. No drift, no parallax — this is a
 * static drawing on a projector, and a loop would be motion with no meaning.
 */
function IdentityArtwork() {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 0.85 }}
      transition={{ duration: 0.5 }}
      className="relative h-full min-h-0 overflow-hidden rounded-lg border border-paper-line bg-paper-sunk"
    >
      <Image
        src="/media/artworks/calligraphy-portrait.jpg"
        alt="لوحة خط عربي على ورق كريمي"
        fill
        sizes="(max-width: 1024px) 100vw, 20rem"
        className="object-cover object-center"
        loading="lazy"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-paper/70 via-transparent to-transparent"
      />
    </motion.figure>
  );
}
