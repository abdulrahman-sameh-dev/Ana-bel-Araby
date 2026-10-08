"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import { handoutEntries, type HandoutEntry } from "@/lib/handout-outline";
import { HandoutCard } from "@/components/handout/handout-card";

/**
 * `/handout` — the quick-reference page.
 *
 * A separate page with its own navigation, deliberately nothing like the
 * audience deck's: five top-level pages, no points, no transitions, no shared
 * state with `/` or `/presenter`. The presenter jumps chapter to chapter here
 * while the room is looking at a projector, so the controls are large, always
 * on screen, and reachable with a thumb.
 *
 * The rule the whole page is built on: **one section, one page.** Nothing in
 * here can take the reader to a second screen for the same chapter — the
 * sequence, the quotes and the hand-off are all on the one card.
 */

const entries: HandoutEntry[] = handoutEntries();

/** Where to jump on a chapter change: the header, not wherever we left off. */
function useRevealOnPageChange(index: number) {
  const mainRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    mainRef.current?.focus({ preventScroll: true });
  }, [index]);
  return mainRef;
}

export function HandoutView() {
  const [index, setIndex] = useState(0);
  const entry = entries[index];
  const mainRef = useRevealOnPageChange(index);

  const go = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(entries.length - 1, next)));
  }, []);

  /* This page's own keyboard model — forward in the reading direction. It
     lives here, in the page, and touches nothing the deck owns. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Let typing in a field, or a focused control that wants arrows, be.
      if (target?.closest("input, textarea, select, [contenteditable]")) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((i) => Math.min(entries.length - 1, i + 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (event.key === "Home") {
        event.preventDefault();
        setIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setIndex(entries.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const atStart = index === 0;
  const atEnd = index === entries.length - 1;
  const counter =
    entry.kind === "opening"
      ? "افتتاح"
      : `${toArabicDigits(index)} / ${toArabicDigits(entries.length - 1)}`;

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {/* ── page header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-paper-line bg-paper/92 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-3 py-2.5 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="kicker text-gold-600">ورقة المتحدث</p>
            <p className="truncate text-[0.95rem] leading-tight font-bold text-ink">
              {entry.navLabel}
            </p>
          </div>
          <span className="tabular type-micro shrink-0 rounded-full border border-paper-line bg-paper-sunk px-2.5 py-1 font-semibold text-ink-muted">
            {counter}
          </span>
        </div>
      </header>

      {/* ── the one page ─────────────────────────────────────────────── */}
      <main
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-4xl flex-1 px-3 pt-3 pb-32 outline-none sm:px-6 sm:pt-5"
      >
        <HandoutCard entry={entry} />
      </main>

      {/* ── nav: always on screen, thumb-reachable ───────────────────── */}
      <nav
        aria-label="صفحات ورقة المتحدث"
        className="sticky bottom-0 z-10 border-t border-paper-line bg-paper/94 backdrop-blur-sm"
      >
        <div className="mx-auto w-full max-w-4xl px-3 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <NavButton
              direction="prev"
              disabled={atStart}
              onClick={() => go(index - 1)}
            />

            <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {entries.map((e, i) => {
                const current = i === index;
                return (
                  <li key={e.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={current ? "page" : undefined}
                      title={e.title}
                      className={cn(
                        "cursor-pointer rounded-lg px-2.5 py-1.5 text-[0.8rem] leading-none font-semibold whitespace-nowrap transition-colors",
                        current
                          ? "bg-ink text-paper"
                          : "border border-paper-line bg-paper-raised text-ink-muted hover:bg-paper-sunk hover:text-ink",
                      )}
                    >
                      {e.navLabel}
                    </button>
                  </li>
                );
              })}
            </ul>

            <NavButton
              direction="next"
              disabled={atEnd}
              onClick={() => go(index + 1)}
            />
          </div>
        </div>
      </nav>
    </div>
  );
}

/** In RTL the reading direction runs right-to-left, so "next" points left. */
function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isNext = direction === "next";
  const Icon = isNext ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isNext ? "الصفحة التالية" : "الصفحة السابقة"}
      className={cn(
        "grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border transition-colors",
        disabled
          ? "cursor-default border-paper-line bg-paper-sunk text-ink-faint/50"
          : "border-ink/15 bg-ink text-paper hover:bg-ink/85",
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
