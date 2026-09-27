"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { closing, presentation, sections } from "@/data/presentation";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import { ArabesqueField, OrnamentFrame, FiligreeRule } from "@/components/presentation/ornaments";
import { cn } from "@/lib/utils";

/**
 * The closing stage.
 *
 * Structure: one claim, then four answers, then the four speakers standing
 * together. No "thank you" card — the recap *is* the ending, and the speakers'
 * names are the natural last thing on screen.
 */
export function ClosingSection({ onRestart }: { onRestart: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? closing.statements.length : 0);

  useEffect(() => {
    if (reduced) return;
    if (shown >= closing.statements.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 480);
    return () => clearTimeout(t);
  }, [reduced, shown]);

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden text-center"
      aria-label="الخلاصة"
    >
      <ArabesqueField tone="gold" opacity={0.05} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_55%_at_50%_45%,var(--gold-100)_0%,transparent_70%)] opacity-60"
      />
      <OrnamentFrame className="inset-4 sm:inset-6" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="kicker text-gold-600"
        >
          الخلاصة
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="stage-title mt-[var(--sp-block)] type-display-lg balance text-ink"
        >
          {closing.lead}
        </motion.h1>

        <FiligreeRule className="mt-[var(--sp-block)] w-32" />

        <ul className="mt-[var(--sp-block)] flex w-full flex-col items-stretch gap-1.5 sm:flex-row sm:justify-center sm:gap-3">
          {closing.statements.map((statement, i) => (
            <motion.li
              key={statement}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={
                i < shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
              }
              transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "rounded-lg border px-3 py-[clamp(0.35rem,0.25rem+0.4vh,0.7rem)] text-center type-body font-bold backdrop-blur-[1px]",
                i === closing.statements.length - 1
                  ? "border-gold-400/50 bg-gold-100/70 text-ink"
                  : "border-paper-line bg-paper-raised/70 text-ink-soft",
              )}
            >
              {statement}
            </motion.li>
          ))}
        </ul>

        {/* The four speakers, together for the first time. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: shown >= closing.statements.length ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="mt-[var(--sp-stage)] w-full"
        >
          <FiligreeRule className="w-full max-w-md" />
          <ul className="mt-[var(--sp-block)] grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {sections.map((section) => (
              <li key={section.id} className="min-w-0">
                <p className="tabular font-display type-body-lg font-bold text-gold-400/70">
                  {section.numeral}
                </p>
                <p className="truncate type-body-sm font-semibold text-ink-soft">
                  {section.speaker}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: shown >= closing.statements.length ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-[var(--sp-block)] flex flex-col items-center gap-2.5"
        >
          <Button
            variant="outline"
            onClick={onRestart}
            className="h-[clamp(2.2rem,2rem+1vh,2.5rem)] gap-2 rounded-full border-paper-line bg-paper-raised/70 px-5 font-sans type-body-sm font-semibold text-ink-soft hover:border-gold-400/60 hover:bg-gold-100/60 hover:text-ink"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            إعادة العرض
          </Button>
          <p className="type-micro text-ink-faint">
            {presentation.team} · {presentation.dateLabel}: {presentation.date}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
