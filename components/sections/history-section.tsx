"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Globe } from "lucide-react";

import {
  historyArtwork,
  historyClosing,
  influenceWords,
  timelineEras,
  type Section,
} from "@/data/presentation";
import { SectionHeader } from "@/components/presentation/section-header";
import { NextPointPreview } from "@/components/presentation/next-point-preview";
import { SpeakerMeta } from "@/components/presentation/speaker-meta";
import { cn } from "@/lib/utils";

/**
 * Stage 04 — History & influence.
 *
 * Metaphor: a single horizontal axis running right-to-left, the way the script
 * reads. Seven stops; the active one lifts off the line and explains itself
 * below. The influence words then leave the timeline entirely and travel out
 * to the right — the point being that Arabic stopped at the edge of the map.
 */
export function HistorySection({
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
  const [active, setActive] = useState(0);
  const era = timelineEras[active];
  const [word, setWord] = useState<string | null>(null);

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label={section.title}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_20%_0%,var(--accent-olive-soft)_0%,transparent_70%)] opacity-70"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1680px)] min-h-0 flex-1 flex-col gap-[var(--sp-stage)]">
        <SectionHeader
          numeral={section.numeral}
          kicker={section.kicker}
          title={section.title}
        />

        {/* ---------------- the axis ---------------- */}
        <div className="relative shrink-0 pt-1">
          {/* the rule */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-[1.75rem] h-px bg-gradient-to-l from-transparent via-paper-line to-transparent"
          />
          {/* the travelled part of the rule */}
          <motion.div
            aria-hidden
            className="absolute top-[1.75rem] h-px bg-gold-400/70"
            style={{ insetInlineStart: 0 }}
            initial={{ width: 0 }}
            animate={{
              width: `${((active + 0.5) / timelineEras.length) * 100}%`,
            }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />

          <ol
            className="relative grid grid-cols-7 gap-0.5"
            data-keynav
            aria-label="مراحل تاريخ اللغة"
          >
            {timelineEras.map((item, i) => {
              const isActive = i === active;
              const isPast = i < active;
              return (
                <li key={item.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive ? "step" : undefined}
                    className="group flex w-full cursor-pointer flex-col items-center gap-1 text-center"
                  >
                    <span
                      className={cn(
                        "tabular font-display type-micro font-bold transition-colors duration-300",
                        isActive
                          ? "text-accent-olive"
                          : isPast
                            ? "text-gold-500"
                            : "text-ink-faint",
                      )}
                    >
                      {item.index}
                    </span>

                    {/* the node on the line */}
                    <motion.span
                      animate={{
                        scale: isActive ? 1.25 : 1,
                        backgroundColor: isActive
                          ? "var(--accent-olive)"
                          : isPast
                            ? "var(--gold-400)"
                            : "var(--paper-raised)",
                      }}
                      transition={{ duration: 0.25 }}
                      className={cn(
                        "relative z-10 block size-[clamp(0.5rem,0.45rem+0.2vh,0.75rem)] rounded-full border-2",
                        isActive
                          ? "border-accent-olive"
                          : isPast
                            ? "border-gold-400"
                            : "border-paper-line",
                      )}
                    />

                    <span
                      className={cn(
                        "type-body-sm leading-tight transition-colors duration-300",
                        isActive
                          ? "font-bold text-ink"
                          : "text-ink-muted group-hover:text-ink-soft",
                      )}
                    >
                      {item.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ---------------- what the active stop means ---------------- */}
        <div className="grid min-h-0 flex-1 gap-[var(--sp-block)] lg:grid-cols-[1fr_19rem]">
          <div className="flex min-h-0 flex-col gap-[var(--sp-block)]">
            <motion.div
              key={era.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
              className="ornament-frame relative shrink-0 rounded-lg bg-paper-raised px-[clamp(0.9rem,0.65rem+0.7vw,1.4rem)] py-[var(--sp-block)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="tabular font-display type-display-md leading-none font-bold text-gold-400/50">
                  {era.index}
                </span>
                <div className="min-w-0">
                  <h3 className="stage-title type-body-lg text-ink">{era.title}</h3>
                  <p className="type-body-sm font-semibold text-accent-olive">
                    {era.period}
                  </p>
                </div>
              </div>
              <p className="mt-1.5 type-body leading-relaxed text-ink-soft">
                {era.detail}
              </p>
            </motion.div>

            {/* Arabic → Knowledge → World */}
            <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-paper-line bg-paper-raised/60 p-[clamp(0.7rem,0.55rem+0.4vw,1rem)]">
              <p className="kicker text-ink-faint">أثر العربية</p>

              <div className="mt-[var(--sp-tight)] flex items-center gap-2 text-center">
                <FlowPill label="العربية" tone="ink" />
                <ArrowLeft className="size-3.5 shrink-0 text-gold-400" aria-hidden />
                <FlowPill label="المعرفة" tone="olive" />
                <ArrowLeft className="size-3.5 shrink-0 text-gold-400" aria-hidden />
                <FlowPill label="العالم" tone="gold" />
              </div>

              <ul className="mt-[var(--sp-block)] grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {influenceWords.map((w) => {
                  const isOpen = word === w.word;
                  return (
                    <li key={w.word}>
                      <button
                        type="button"
                        onClick={() => setWord(isOpen ? null : w.word)}
                        aria-expanded={isOpen}
                        className={cn(
                          "flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-md border px-2.5 py-[clamp(0.3rem,0.22rem+0.3vh,0.6rem)] text-start transition-all duration-250",
                          isOpen
                            ? "border-gold-400/60 bg-gold-100/70"
                            : "border-paper-line bg-paper hover:border-gold-300/60 hover:bg-gold-100/40",
                        )}
                      >
                        <span className="tabular font-display type-micro font-bold text-gold-500">
                          {w.index}
                        </span>
                        <span
                          className="font-latin type-body-lg font-semibold text-ink"
                          dir="ltr"
                        >
                          {w.word}
                        </span>
                        <AnimatePresence initial={false}>
                          {isOpen ? (
                            <motion.span
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="block w-full overflow-hidden"
                            >
                              <span className="mt-1 block border-t border-dashed border-gold-300/60 pt-1 type-micro leading-relaxed text-ink-soft">
                                كلمة انتقلت إلى اللغات الأوروبية
                              </span>
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-auto pt-[var(--sp-tight)] type-body-sm leading-relaxed text-ink-soft balance">
                {historyClosing.lead}{" "}
                <span className="font-semibold text-ink">{historyClosing.tail}</span>
              </p>
            </div>
          </div>

          {/* the team's history artwork, kept in the corner as evidence */}
          <figure className="relative hidden overflow-hidden rounded-lg border border-paper-line bg-paper-sunk lg:block">
            <Image
              src={historyArtwork.src}
              alt={historyArtwork.alt}
              fill
              sizes="20rem"
              className="object-cover"
              loading="lazy"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper/85 via-paper/15 to-transparent"
            />
            <figcaption className="absolute inset-x-3 bottom-2 flex items-center gap-1.5 type-micro text-ink-muted">
              <Globe className="size-3" aria-hidden />
              {historyArtwork.caption}
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,1680px)] pt-[var(--sp-tight)]">
        {/* Where the axis has got to, and the era about to open. */}
        <div className="mb-[var(--sp-tight)] flex justify-end">
          <NextPointPreview
            total={timelineEras.length}
            current={active}
            currentLabel={era.title}
            nextLabel={timelineEras[active + 1]?.title ?? null}
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
        />
      </div>
    </section>
  );
}

function FlowPill({
  label,
  tone,
}: {
  label: string;
  tone: "ink" | "olive" | "gold";
}) {
  const tones = {
    ink: "border-ink/20 bg-ink text-paper",
    olive: "border-accent-olive/30 bg-accent-olive/10 text-accent-olive",
    gold: "border-gold-400/40 bg-gold-100/70 text-gold-600",
  } as const;

  return (
    <span
      className={cn(
        "flex-1 rounded-md border px-2 py-1 text-center type-body-sm font-bold",
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}
