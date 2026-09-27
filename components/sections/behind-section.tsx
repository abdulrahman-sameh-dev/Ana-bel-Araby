"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { CalendarClock, ClipboardCheck, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import { behindTask, evidencePairs, presentation } from "@/data/presentation";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import { SectionHeader } from "@/components/presentation/section-header";
import { EvidenceLightbox } from "@/components/presentation/evidence-lightbox";
import { ArabesqueField, FiligreeRule } from "@/components/presentation/ornaments";

/**
 * Stage 05 — the work behind the slides.
 *
 * The brief for this stage is a *task*, not a result, so the stage states the
 * assignment and then shows the captures that came back from it. It reports no
 * tally of how many people were convinced: eighteen screenshots are eighteen
 * captures, and reading a number off them would mean guessing which account
 * each one belongs to.
 *
 * Composition: one case at a time, large. A phone screenshot is unreadable at
 * thumbnail size, so nine of them in a grid would say "there is evidence" and
 * show none of it. The case on stage is instead the size a person can be
 * identified from, with the other eight reduced to a numbered rail the
 * presenter steps through — the same move the discovery section makes with its
 * facts, for the same reason.
 */
export function BehindSection() {
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);

  const pair = evidencePairs[current];

  const step = useCallback((delta: number) => {
    setCurrent((i) => {
      const next = i + delta;
      if (next < 0 || next >= evidencePairs.length) return i;
      return next;
    });
  }, []);

  const shots = [
    { role: "قبل", shot: pair.before, edge: "border-paper-line", tone: "text-ink-faint" },
    { role: "بعد", shot: pair.after, edge: "border-gold-400/60", tone: "text-gold-600" },
  ] as const;

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label={behindTask.title}
    >
      <ArabesqueField tone="gold" opacity={0.04} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,var(--gold-100)_0%,transparent_70%)] opacity-50"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1560px)] flex-1 flex-col">
        <SectionHeader kicker={behindTask.kicker} title={behindTask.title} />

        {/* ---- the pair, dominant, beside the assignment ---- */}
        <div className="mt-[var(--sp-block)] grid min-h-0 flex-1 grid-cols-1 gap-x-[clamp(1.25rem,0.75rem+2.5vw,3.5rem)] gap-y-[var(--sp-block)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Right, in RTL: the captures. */}
          <motion.figure
            key={pair.id}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 min-w-0 flex-col"
          >
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3">
              {shots.map(({ role, shot, edge, tone }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setOpen(true)}
                  className={cn(
                    "group relative min-h-0 w-full cursor-zoom-in overflow-hidden rounded-lg border bg-paper-sunk",
                    edge,
                  )}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 1024px) 46vw, 24vw"
                    className="object-contain"
                    priority
                  />
                  <span
                    className={cn(
                      "kicker absolute top-1.5 end-1.5 rounded-full border bg-paper/85 px-2 py-0.5 backdrop-blur-[1px]",
                      role === "بعد"
                        ? "border-gold-400/60 text-gold-700"
                        : "border-paper-line text-ink-muted",
                    )}
                  >
                    {role}
                  </span>
                  <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-200 group-hover:bg-ink/10" />
                </button>
              ))}
            </div>
            <figcaption className="mt-2 flex items-center justify-between gap-3 type-micro text-ink-faint">
              <span className="tabular">
                الحالة <span className="font-bold text-ink">{pair.index}</span>{" "}
                من {toArabicDigits(evidencePairs.length)}
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 font-semibold text-ink-muted transition-colors hover:text-gold-600"
              >
                <Maximize2 className="size-3" aria-hidden />
                تكبير
              </button>
            </figcaption>
          </motion.figure>

          {/* Left, in RTL: what the task was, and how to move through it. */}
          <div className="flex min-h-0 min-w-0 flex-col">
            <p className="type-body type-body-lg font-semibold leading-[1.5] text-ink">
              {behindTask.lead}
            </p>

            <p className="mt-[var(--sp-block)] flex items-start gap-2.5 rounded-lg border border-gold-400/35 bg-gold-100/45 px-3.5 py-[clamp(0.45rem,0.3rem+0.6vh,0.8rem)]">
              <ClipboardCheck
                className="mt-0.5 size-4 shrink-0 text-gold-600"
                aria-hidden
              />
              <span className="type-body-sm leading-[1.6] text-ink-soft">
                {behindTask.requirement}
              </span>
            </p>

            <p className="mt-[var(--sp-block)] type-body-sm leading-[1.6] text-ink-muted">
              {behindTask.evidenceNote}
            </p>

            {/* Deadline, on the left column where there is room for it. */}
            <div className="mt-[var(--sp-block)] flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold-400/40 bg-gold-100/70">
                <CalendarClock className="size-4 text-gold-600" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="kicker block text-ink-faint">
                  {behindTask.deadlineLabel}
                </span>
                <span className="block type-body font-bold text-ink">
                  {behindTask.deadline}
                </span>
              </span>
            </div>

            <FiligreeRule className="mt-auto w-full pt-[var(--sp-block)]" />
          </div>
        </div>

        {/* ---- the other eight, as a rail ---- */}
        <nav aria-label="بقية الحالات" className="mt-[var(--sp-block)] shrink-0">
          <ol data-keynav className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {evidencePairs.map((p, i) => {
              const state = i === current ? "active" : i < current ? "done" : "ahead";
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setCurrent(i)}
                    aria-current={state === "active" ? "true" : undefined}
                    aria-label={`الحالة ${p.index}`}
                    className="group h-7 cursor-pointer p-0"
                  >
                    <span
                      className={cn(
                        "tabular grid h-7 min-w-7 place-items-center rounded-md border px-1.5 type-micro font-semibold transition-colors duration-200",
                        state === "active"
                          ? "border-gold-500/60 bg-gold-400/25 text-ink"
                          : state === "done"
                            ? "border-gold-400/35 bg-gold-100/60 text-ink-soft"
                            : "border-paper-line bg-paper-raised/60 text-ink-faint",
                      )}
                    >
                      {p.index}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <footer className="mt-[var(--sp-block)] flex shrink-0 items-center justify-between gap-4 border-t border-paper-line pt-2.5 type-body-sm text-ink-muted">
          <span className="font-semibold text-ink">{presentation.team}</span>
          <span>
            <span className="sr-only">{presentation.dateLabel}: </span>
            <span className="font-semibold text-ink">{presentation.date}</span>
          </span>
        </footer>
      </div>

      {open ? (
        <EvidenceLightbox
          pair={pair}
          index={current}
          total={evidencePairs.length}
          onClose={() => setOpen(false)}
          onStep={step}
        />
      ) : null}
    </section>
  );
}
