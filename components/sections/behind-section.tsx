"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ClipboardCheck, Maximize2, MessageCircleQuestion } from "lucide-react";
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
        <div className="mt-(--sp-block) grid min-h-0 flex-1 grid-cols-1 gap-x-[clamp(1.25rem,0.75rem+2.5vw,3.5rem)] gap-y-(--sp-block) lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
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
                      "kicker absolute top-1.5 inset-e-1.5 rounded-full border bg-paper/85 px-2 py-0.5 backdrop-blur-[1px]",
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
            <p className="type-body type-body-lg font-semibold leading-normal text-ink">
              {behindTask.lead}
            </p>

            <p className="mt-(--sp-block) flex items-start gap-2.5 rounded-lg border border-gold-400/35 bg-gold-100/45 px-3.5 py-[clamp(0.45rem,0.3rem+0.6vh,0.8rem)]">
              <ClipboardCheck
                className="mt-0.5 size-4 shrink-0 text-gold-600"
                aria-hidden
              />
              <span className="type-body-sm leading-[1.6] text-ink-soft">
                {behindTask.requirement}
              </span>
            </p>

            <p className="mt-(--sp-block) type-body-sm leading-[1.6] text-ink-muted">
              {behindTask.evidenceNote}
            </p>

            {/* The purpose, where the deadline used to be.

                This is the stage's argument rather than its logistics, so it is
                set as a question in the display face and given the emphasis the
                date used to get. The screenshots to its side are the evidence
                for it; nothing else on this stage competes with it. */}
            <p className="mt-(--sp-block) flex items-start gap-2.5 type-display-sm balance leading-[1.45] text-ink">
              <MessageCircleQuestion
                className="mt-1 size-4 shrink-0 text-gold-600"
                aria-hidden
              />
              {behindTask.purpose}
            </p>

            <FiligreeRule className="mt-auto w-full pt-(--sp-block)" />
          </div>
        </div>

        {/* ---- the other eight, as a rail of thumbnails ----
            This used to be nine buttons showing nothing but a case number, so
            the row read «١ ٢ ٣ …» and told the audience there were nine captures
            without ever showing one of them. Each item now carries the actual
            «بعد» capture as its thumbnail, so the gallery looks like the
            evidence it is. The number stays as a plate over the top corner so
            the presenter can still name a case out loud. */}
        <nav aria-label="بقية الحالات" className="mt-(--sp-block) shrink-0">
          <ol
            data-keynav
            className="flex flex-wrap items-center gap-1.5 sm:gap-2"
          >
            {evidencePairs.map((p, i) => {
              const state =
                i === current ? "active" : i < current ? "done" : "ahead";
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setCurrent(i)}
                    aria-current={state === "active" ? "true" : undefined}
                    aria-label={`الحالة ${p.index}`}
                    className="group relative block size-[clamp(2.75rem,2.2rem+2vw,3.5rem)] cursor-pointer overflow-hidden rounded-md border bg-paper-sunk p-0 transition-[border-color,transform] duration-200 hover:scale-105"
                  >
                    <Image
                      src={p.after.src}
                      alt=""
                      fill
                      sizes="56px"
                      className={cn(
                        // `object-top` is what makes the crop honest. Nine of
                        // these captures are tall phone screenshots — 720×1600,
                        // 922×2048 — so a default centre crop lands on the
                        // middle of someone's feed, where there is no name to
                        // compare. Anchored to the top it shows the profile
                        // header, which is the only part of the capture that
                        // distinguishes one case from another. `object-cover`
                        // then fills the square without distorting the shot.
                        "object-cover object-top transition-opacity duration-200",
                        state === "active"
                          ? "opacity-100"
                          : state === "done"
                            ? "opacity-80"
                            : "opacity-55 group-hover:opacity-90",
                      )}
                      loading="lazy"
                    />
                    <span
                      className={cn(
                        "tabular absolute top-0.5 inset-e-0.5 rounded-sm border px-1 font-semibold leading-[1.35] backdrop-blur-[2px]",
                        state === "active"
                          ? "border-gold-500/60 bg-paper/90 text-ink"
                          : "border-paper-line bg-paper/75 text-ink-muted",
                      )}
                      style={{ fontSize: "clamp(0.5rem,0.44rem+0.2vw,0.6rem)" }}
                    >
                      {p.index}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <footer className="mt-(--sp-block) flex shrink-0 items-center justify-between gap-4 border-t border-paper-line pt-2.5 type-body-sm text-ink-muted">
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
