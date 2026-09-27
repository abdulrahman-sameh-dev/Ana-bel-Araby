"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Clock3,
  Feather,
  ShieldCheck,
  Quote as QuoteIcon,
  type LucideIcon,
} from "lucide-react";

import {
  identityPoints,
  identityQuotes,
  calligraphyArtwork,
  type InfoPoint,
  type Section,
} from "@/data/presentation";
import { SectionHeader } from "@/components/presentation/section-header";
import { SpeakerMeta } from "@/components/presentation/speaker-meta";
import { ArabesqueField } from "@/components/presentation/ornaments";
import { cn } from "@/lib/utils";

const ICONS: Record<InfoPoint["icon"], LucideIcon> = {
  book: BookOpen,
  clock: Clock3,
  feather: Feather,
  shield: ShieldCheck,
  sparkle: QuoteIcon,
};

const verse = identityQuotes[0];
const saying = identityQuotes[1];

/**
 * Stage 01 — Identity.
 *
 * Metaphor: a page of calligraphy beside an argument. The top half holds the
 * two pieces of evidence — the verse in naskh, the saying in the dark card —
 * and the bottom half carries the four numbered points across the full width,
 * the way an argument is built rather than listed.
 */
export function IdentitySection({
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
  const [active, setActive] = useState(identityPoints[0].id);

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label={section.title}
    >
      <ArabesqueField tone="ink" opacity={0.04} />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1680px)] min-h-0 flex-1 flex-col gap-[var(--sp-stage)]">
        {/* ---------------- evidence row ---------------- */}
        <div className="grid min-h-0 flex-1 gap-[var(--sp-block)] lg:grid-cols-[1fr_23rem]">
          {/* right: masthead + the verse */}
          <div className="flex min-w-0 flex-col gap-[var(--sp-block)]">
            <SectionHeader
              numeral={section.numeral}
              kicker={section.kicker}
              title={section.title}
            />

            <motion.figure
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="ornament-frame relative overflow-hidden rounded-lg bg-gradient-to-br from-paper-raised to-gold-100/50 px-[clamp(1rem,0.7rem+0.9vw,1.75rem)] py-[var(--sp-block)]"
            >
              <QuoteIcon
                className="absolute -top-1 h-9 w-9 text-gold-300/40"
                aria-hidden
              />
              <blockquote className="scripture relative type-scripture font-bold text-ink balance">
                {verse.text}
              </blockquote>
              <figcaption className="mt-2 flex items-center gap-2 type-micro font-semibold text-gold-500">
                <span className="h-px w-6 bg-gold-400/60" aria-hidden />
                {verse.attribution}
              </figcaption>
            </motion.figure>
          </div>

          {/* left: the artwork and the saying */}
          <div className="flex min-h-0 flex-col gap-[var(--sp-block)]">
            <motion.figure
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="group relative min-h-0 flex-1 overflow-hidden rounded-lg border border-paper-line bg-paper-sunk"
            >
              <Image
                src={calligraphyArtwork.src}
                alt={calligraphyArtwork.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40rem"
                className="object-cover object-center"
                loading="lazy"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper/70 via-transparent to-transparent"
              />
            </motion.figure>

            {/* The saying — the hinge of the whole argument. */}
            <motion.blockquote
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.34 }}
              className="ornament-frame relative shrink-0 rounded-lg bg-ink px-[clamp(1rem,0.7rem+0.9vw,1.6rem)] py-[var(--sp-block)] text-paper"
            >
              <QuoteIcon
                className="absolute -top-0.5 h-7 w-7 rotate-180 text-gold-400/30"
                aria-hidden
              />
              <p className="scripture relative type-scripture leading-[1.75] font-bold text-paper balance">
                {saying.text}
              </p>
              <footer className="mt-2 flex items-center gap-2 type-micro font-semibold text-gold-300">
                <span className="h-px w-6 bg-gold-400/50" aria-hidden />
                {saying.attribution}
              </footer>
            </motion.blockquote>
          </div>
        </div>

        {/* ---------------- the four points, across the full width -------- */}
        <ol
          className="grid shrink-0 grid-cols-1 gap-[var(--sp-tight)] sm:grid-cols-2 lg:grid-cols-4"
          data-keynav
          aria-label="محاور القسم"
        >
          {identityPoints.map((point, i) => {
            const Icon = ICONS[point.icon];
            const isActive = point.id === active;
            return (
              <li key={point.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setActive(point.id)}
                  onMouseEnter={() => setActive(point.id)}
                  onFocus={() => setActive(point.id)}
                  aria-expanded={isActive}
                  className={cn(
                    "group relative flex h-full w-full cursor-pointer flex-col items-start gap-1 overflow-hidden rounded-lg border p-[clamp(0.6rem,0.45rem+0.4vw,0.9rem)] text-start transition-all duration-300",
                    isActive
                      ? "border-gold-400/60 bg-paper-raised shadow-lift"
                      : "border-paper-line bg-paper-raised/50 hover:border-gold-300/60 hover:bg-paper-raised/85",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 start-0 w-[3px] transition-colors duration-300",
                      isActive ? "bg-gold-400" : "bg-transparent",
                    )}
                  />
                  <span className="flex w-full items-center gap-2">
                    <span
                      className={cn(
                        "tabular font-display type-body-sm font-bold transition-colors duration-300",
                        isActive ? "text-gold-500" : "text-ink-faint",
                      )}
                    >
                      {point.index}
                    </span>
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0 transition-colors duration-300",
                        isActive ? "text-gold-500" : "text-ink-faint",
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "truncate type-body-sm font-bold transition-colors duration-300",
                        isActive ? "text-ink" : "text-ink-soft",
                      )}
                    >
                      {point.label}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "type-body-sm leading-relaxed transition-colors duration-300",
                      isActive ? "text-ink-soft" : "text-ink-muted",
                    )}
                  >
                    {point.headline}
                  </span>

                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.span
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="block w-full overflow-hidden"
                      >
                        <span className="mt-1.5 block border-t border-dashed border-gold-300/50 pt-1.5 type-body-sm leading-relaxed text-ink-soft">
                          {point.detail}
                        </span>
                      </motion.span>
                    ) : null}
                  </AnimatePresence>

                  <span className="sr-only">النقطة {i + 1}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,1680px)] pt-[var(--sp-tight)]">
        <SpeakerMeta
          speaker={speaker}
          primarySpeaker={section.speaker}
          backupSpeaker={section.speakerBackup}
          backupActive={backupActive}
          onToggleBackup={onToggleBackup}
          durationSeconds={section.durationSeconds}
          elapsed={elapsed}
        />
      </div>
    </section>
  );
}
