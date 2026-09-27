"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { presentation } from "@/data/presentation";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import { ArabesqueField, OrnamentFrame } from "@/components/presentation/ornaments";

/**
 * The words the opening is built around.
 *
 * They arrive one at a time, slowly — the pause is the point. Under `reduced
 * motion` they are simply all present.
 */
const HERO_WORDS = ["لغة", "هُويّة", "علم", "مستقبل"];

export function Introduction({ onStart }: { onStart: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(reduced ? HERO_WORDS.length : 0);

  useEffect(() => {
    if (reduced) return;
    if (revealed >= HERO_WORDS.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 620);
    return () => clearTimeout(t);
  }, [reduced, revealed]);

  const ready = revealed >= HERO_WORDS.length;

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden text-center"
      aria-label="مقدمة العرض"
    >
      <ArabesqueField tone="ink" opacity={0.045} />

      {/* The parchment image from the team's own cover, used as a soft
          ground rather than a backdrop so the new type sits cleanly on it. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 bg-cover bg-center mix-blend-multiply"
        style={{
          backgroundImage: "url(/media/reference/original-slide-01-cover.jpg)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/70 via-paper/55 to-paper/85"
      />

      <OrnamentFrame className="inset-4 sm:inset-6" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="kicker text-gold-600"
        >
          {presentation.team}
        </motion.p>

        {/* The question, asked before the answer. */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="stage-title mt-[var(--sp-block)] type-display-lg balance text-ink-soft"
        >
          {presentation.heroQuestion}
        </motion.h1>

        {/* The word composition — one word at a time. */}
        <div className="mt-[var(--sp-block)] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-5">
          {HERO_WORDS.map((word, i) => {
            const shown = i < revealed;
            return (
              <span key={word} className="flex items-center gap-3 sm:gap-5">
                <motion.span
                  initial={reduced ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={
                    shown
                      ? { opacity: 1, y: 0, filter: "blur(0px)" }
                      : { opacity: 0, y: 18, filter: "blur(6px)" }
                  }
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={cnWord(i)}
                >
                  {word}
                </motion.span>
                {i < HERO_WORDS.length - 1 ? (
                  <motion.span
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: shown ? 0.4 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-gold-400/60"
                  >
                    ·
                  </motion.span>
                ) : null}
              </span>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="mt-[var(--sp-block)] type-body-lg text-ink-soft balance"
        >
          {presentation.heroLine}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-1.5 type-body text-ink-muted"
        >
          {presentation.title} — {presentation.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-[var(--sp-block)] flex flex-col items-center gap-2.5"
        >
          <Button
            size="lg"
            onClick={onStart}
            className="group h-[clamp(2.6rem,2.3rem+1.4vh,3rem)] gap-2.5 rounded-full bg-ink px-6 font-sans type-body font-bold text-paper shadow-lift transition-all duration-200 hover:bg-gold-500 hover:text-ink"
          >
            ابدأ العرض
            <ArrowLeft
              className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden
            />
          </Button>

          <p className="flex items-center gap-1.5 type-micro text-ink-faint">
            <CornerDownLeft className="size-3" aria-hidden />
            أو اضغط مسافة · الأسهم للتنقل · F لملء الشاشة · N للملاحظات
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/** Word styling steps up as the composition fills: the last word is the point. */
function cnWord(i: number) {
  const base =
    "font-display type-display-xl leading-tight font-bold";
  if (i === 0) return `${base} text-ink`;
  if (i === 1) return `${base} text-gold-500`;
  if (i === 2) return `${base} text-ink-soft`;
  return `${base} text-ink`;
}
