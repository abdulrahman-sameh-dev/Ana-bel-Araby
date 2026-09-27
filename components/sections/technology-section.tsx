"use client";

import { useState } from "react";
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

import {
  techNodes,
  techTakeaway,
  techArtwork,
  type Section,
  type TechNode,
} from "@/data/presentation";
import { SectionHeader } from "@/components/presentation/section-header";
import { NextPointPreview } from "@/components/presentation/next-point-preview";
import { SpeakerMeta } from "@/components/presentation/speaker-meta";
import { OrnamentFrame } from "@/components/presentation/ornaments";
import { cn } from "@/lib/utils";

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
 * Metaphor: a system, not a list. Six nodes run down the right as a vertical
 * spine with a connecting line, so the audience reads a chain — CONTENT feeds
 * APPS feeds EDUCATION — instead of eight disconnected bullets. This is the
 * one dark stage: the deck's parchment gives way to charcoal to mark the shift
 * from heritage to tools.
 */
export function TechnologySection({
  section,
  speaker,
  backupActive,
  onToggleBackup,
  elapsed,
}: {
  section: Section;
  /** Already resolved by the shell: primary or cover. */
  speaker: string;
  /** True while the backup presenter is holding the floor. */
  backupActive: boolean;
  onToggleBackup: () => void;
  elapsed: number;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const [active, setActive] = useState(techNodes[0].id);
  const activeIndex = Math.max(
    0,
    techNodes.findIndex((n) => n.id === active),
  );
  const activeNode = techNodes[activeIndex] ?? techNodes[0];
  /** The axis about to turn — undefined on the last node, by design. */
  const nextNode = techNodes[activeIndex + 1];
  const ActiveIcon = ICONS[activeNode.icon];

  return (
    <section
      className="stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden bg-night text-night-text"
      aria-label={section.title}
    >
      {/* A cool glow, deliberately restrained — the only gradient on stage. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_0%,var(--accent-tech)_0%,transparent_65%)] opacity-[0.13]"
      />
      <OrnamentFrame className="inset-4 sm:inset-6" tone="night" />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1680px)] min-h-0 flex-1 flex-col gap-[var(--sp-block)] lg:flex-row">
        {/* ---------------- the spine ---------------- */}
        <div className="flex min-w-0 flex-1 flex-col">
          <SectionHeader
            numeral={section.numeral}
            kicker={section.kicker}
            title={section.title}
            tone="night"
          />

          <ol
            className="relative mt-[var(--sp-block)] flex min-h-0 flex-1 flex-col justify-between gap-px"
            data-keynav
            aria-label="محاور القسم"
          >
            {/* the connecting line */}
            <span
              aria-hidden
              className="absolute bottom-4 top-4 end-[calc(clamp(1.7rem,1.5rem+0.7vh,2.25rem)/2-0.5px)] w-px bg-gradient-to-b from-transparent via-gold-300/25 to-transparent"
            />

            {techNodes.map((node, i) => {
              const Icon = ICONS[node.icon];
              const isActive = node.id === active;
              return (
                <li key={node.id} className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => setActive(node.id)}
                    onMouseEnter={() => setActive(node.id)}
                    onFocus={() => setActive(node.id)}
                    aria-expanded={isActive}
                    className={cn(
                      "group flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-[clamp(0.35rem,0.25rem+0.35vh,0.6rem)] text-start transition-all duration-300",
                      isActive
                        ? "border-accent-tech/45 bg-night-raised"
                        : "border-transparent hover:border-night-line hover:bg-night-raised/60",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 grid size-[clamp(1.7rem,1.5rem+0.7vh,2.25rem)] shrink-0 place-items-center rounded-full border transition-all duration-300",
                        isActive
                          ? "border-accent-tech bg-accent-tech/15 text-night-text"
                          : "border-night-line bg-night text-night-muted group-hover:border-gold-300/40",
                      )}
                    >
                      <Icon className="size-[clamp(0.8rem,0.7rem+0.35vh,1rem)]" aria-hidden />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            "font-latin text-[0.66rem] font-semibold tracking-[0.14em] transition-colors duration-300",
                            isActive ? "text-accent-tech-soft" : "text-night-muted/80",
                          )}
                          dir="ltr"
                        >
                          {node.latin}
                        </span>
                        <span
                          className={cn(
                            "truncate type-body-sm font-bold transition-colors duration-300",
                            isActive ? "text-night-text" : "text-night-muted",
                          )}
                        >
                          {node.label}
                        </span>
                      </span>
                      {/* The sub-line repeats what the detail pane already
                          says, so a short viewport drops it (see
                          `.spine-headline`) and keeps six rows on screen. */}
                      <span
                        className={cn(
                          "spine-headline truncate type-body-sm transition-colors duration-300",
                          isActive ? "text-gold-200" : "text-night-muted/70",
                        )}
                      >
                        {node.headline}
                      </span>
                    </span>

                    <span
                      className={cn(
                        "tabular shrink-0 font-display type-body-sm font-bold transition-colors duration-300",
                        isActive ? "text-gold-300" : "text-night-muted/40",
                      )}
                    >
                      {node.index}
                    </span>
                  </button>

                </li>
              );
            })}
          </ol>
        </div>

        {/* ---------------- the reading pane ---------------- */}
        <div className="flex w-full shrink-0 flex-col gap-[var(--sp-tight)] lg:w-[23rem]">
          {/* What the active node means, said plainly. */}
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            className="shrink-0 rounded-lg border border-night-line bg-night-raised/70 p-[clamp(0.7rem,0.55rem+0.4vw,1rem)]"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-tech/20 text-accent-tech-soft">
                <ActiveIcon className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-latin text-[0.56rem] tracking-[0.18em] text-accent-tech-soft" dir="ltr">
                  {activeNode.latin}
                </p>
                <p className="truncate type-body-sm font-bold text-night-text">
                  {activeNode.label}
                </p>
              </div>
            </div>
            <p className="mt-2 type-body-sm leading-relaxed text-night-muted">
              {activeNode.detail}
            </p>
          </motion.div>

          {/* The team's own verse artwork, re-used verbatim. */}
          <figure className="relative flex-1 overflow-hidden rounded-lg border border-night-line bg-night-raised">
            <Image
              src={techArtwork.src}
              alt={techArtwork.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 24rem"
              className="object-cover opacity-90"
              loading="lazy"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent"
            />
            <figcaption className="absolute inset-x-3 bottom-2.5 type-micro text-night-muted">
              {techArtwork.caption}
            </figcaption>
          </figure>

          {/* The one line the section lands on — labelled as our summary. */}
          <div className="shrink-0 rounded-lg border border-gold-300/25 bg-gold-300/8 p-[clamp(0.7rem,0.55rem+0.4vw,1rem)]">
            <p className="kicker text-gold-300">خلاصة القسم</p>
            <p className="mt-1 type-body leading-relaxed font-semibold text-night-text balance">
              {techTakeaway}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,1680px)] pt-[var(--sp-tight)]">
        {/* Where the spine has got to, and the axis about to turn. */}
        <div className="mb-[var(--sp-tight)] flex justify-end">
          <NextPointPreview
            total={techNodes.length}
            current={activeIndex}
            currentLabel={activeNode.label}
            nextLabel={nextNode?.label ?? null}
            tone="night"
          />
        </div>

        <SpeakerMeta
          speaker={speaker}
          primarySpeaker={section.speaker}
          backupSpeaker={section.speakerBackup}
          backupActive={backupActive}
          onToggleBackup={onToggleBackup}
          durationSeconds={section.durationSeconds}
          elapsed={elapsed}
          tone="night"
        />
      </div>
    </section>
  );
}
