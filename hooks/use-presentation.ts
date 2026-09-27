"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** True once the component has mounted — gates entrance animations. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Respect the OS "reduce motion" setting.
 *
 * Motion components read this so they can swap animated transitions for plain
 * ones rather than relying on a global CSS override alone.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/**
 * The section clock.
 *
 * Starts when a section is entered and never advances the deck on its own — the
 * presenter stays in control. `sessionKey` is the id of the section on stage
 * (or `null` when no speaker is up); changing it re-arms the clock from zero.
 * `elapsed` ticks in whole seconds; `remaining` clamps at zero and `overrun`
 * reports time spent past the allotted 90s.
 */
export function useSectionTimer(
  durationSeconds: number,
  sessionKey: string | null,
) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const lastTick = useRef<number | null>(null);

  const reset = useCallback(() => {
    lastTick.current = null;
    setElapsed(0);
    // Reset re-arms *and* runs. A presenter reaches for it when they started
    // late, so a clock that came back paused would just have to be started a
    // second time.
    setRunning(true);
  }, []);

  // Re-arm the clock whenever the presenter enters a *different* section. A
  // boolean "is active" flag cannot do this: it stays true from one section to
  // the next, so the 90 seconds would run straight through all four speakers.
  // The session key is the section identity, and `null` means no clock at all.
  useEffect(() => {
    lastTick.current = null;
    setElapsed(0);
    setRunning(sessionKey !== null);
  }, [sessionKey]);

  useEffect(() => {
    if (!running) {
      lastTick.current = null;
      return;
    }

    let frame = 0;
    // Frames arrive every ~16ms, so per-frame deltas never reach the 1s
    // threshold on their own — they have to be summed before being tested.
    let acc = 0;
    const tick = (now: number) => {
      if (lastTick.current === null) lastTick.current = now;
      acc += (now - lastTick.current) / 1000;
      lastTick.current = now;
      // Only whole seconds are published: the clock is read by the audience,
      // so there is nothing to gain from re-rendering the section four times a
      // second, and a visible step each second is what a clock should do.
      if (acc >= 1) {
        setElapsed((prev) => Math.floor(prev + acc));
        acc = 0;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  // A hidden tab must not silently burn the presenter's 90 seconds.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) lastTick.current = null;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const toggle = useCallback(() => setRunning((r) => !r), []);

  const remaining = Math.max(0, durationSeconds - elapsed);
  const overrun = Math.max(0, elapsed - durationSeconds);
  const ratio = durationSeconds > 0 ? elapsed / durationSeconds : 0;

  return {
    elapsed,
    running,
    remaining,
    overrun,
    ratio,
    toggle,
    reset,
    setRunning,
  };
}

/** Fullscreen helpers with graceful no-ops where the API is unavailable. */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const enter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* blocked by the browser — the deck still works windowed */
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) void exit();
    else void enter();
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
