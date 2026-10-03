"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import type { EvidencePair } from "@/data/presentation";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";

/**
 * Full-height view of one before/after pair.
 *
 * The thumbnails on the stage are cropped to the profile header, because that
 * is where the name lives. This is the uncropped original: the whole capture,
 * at a size the audience can actually read, side by side so the change is the
 * only difference left between them.
 *
 * `data-modal` is load-bearing: the shell checks for it and hands over the
 * keyboard, so arrow keys compare images instead of turning the deck.
 */
export function EvidenceLightbox({
  pair,
  index,
  total,
  onClose,
  onStep,
}: {
  pair: EvidencePair;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  // Move focus into the dialog so the next Tab lands on the close button
  // rather than back up in the grid underneath.
  useEffect(() => {
    closeRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        // RTL: left carries the viewer forward, matching the rest of the deck.
        event.preventDefault();
        onStep(1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onStep(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onStep]);

  const shots = [
    { role: "قبل", shot: pair.before, dim: "border-paper-line" },
    { role: "بعد", shot: pair.after, dim: "border-gold-400/60" },
  ];

  return (
    <div
      data-modal
      // `grid-rows-[minmax(0,1fr)]` gives the single child a definite row to
      // fill. A bare `grid` sizes its implicit row to content, which is zero
      // for absolutely-positioned images, so the dialog would have nothing to
      // lay the screenshots out in.
      className="fixed inset-0 z-50 grid grid-rows-[minmax(0,1fr)] place-items-center bg-ink/80 p-4 backdrop-blur-[3px] sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        key={pair.id}
        role="dialog"
        aria-modal="true"
        aria-label={`الحالة ${pair.index} — لقطة قبل وبعد تغيير الاسم`}
        initial={reduced ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0.001 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        // `h-full` is load-bearing, not decoration. The images below are
        // `next/image` with `fill`, so they are taken out of flow and
        // contribute no height of their own. Without a definite height here
        // the flex column would size to that zero, the `grow` wrapper would
        // resolve to 0, and the dialog would open showing only the counter and
        // the "قبل / بعد" captions with the screenshots invisible.
        className="flex h-full max-h-full w-full max-w-4xl flex-col gap-3"
      >
        {/* Bar: which case, and the way out. */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="stage-title type-body-lg text-night-text">
            <span className="text-gold-300">{pair.index}</span>
            <span className="mx-2 text-night-muted">/</span>
            <span className="text-night-muted">{toArabicDigits(index + 1)} من {toArabicDigits(total)}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStep(-1)}
              disabled={index === 0}
              aria-label="الحالة السابقة"
              className="grid size-8 place-items-center rounded-full border border-night-line text-night-muted transition-colors hover:border-gold-300/50 hover:text-night-text disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              disabled={index === total - 1}
              aria-label="الحالة التالية"
              className="grid size-8 place-items-center rounded-full border border-night-line text-night-muted transition-colors hover:border-gold-300/50 hover:text-night-text disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="grid size-8 place-items-center rounded-full border border-night-line text-night-muted transition-colors hover:border-gold-300/50 hover:text-night-text"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* The pair, uncropped, at reading size. */}
        <div className="grid min-h-0 grow grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          {shots.map(({ role, shot, dim }) => (
            <figure key={role} className="flex min-h-0 flex-col gap-1.5">
              <figcaption
                className={cn(
                  "kicker shrink-0",
                  role === "بعد" ? "text-gold-300" : "text-night-muted",
                )}
              >
                {role}
              </figcaption>
              <div
                className={cn(
                  "relative min-h-0 grow overflow-hidden rounded-md border bg-night-raised",
                  dim,
                )}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 640px) 92vw, 30vw"
                  className="object-contain"
                  priority
                />
              </div>
            </figure>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
