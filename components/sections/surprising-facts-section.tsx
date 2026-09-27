"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, ArrowLeft } from "lucide-react";

import {
  articulationGroups,
  discoveryFacts,
  type DiscoveryFact,
  type Section,
} from "@/data/presentation";
import { SectionHeader } from "@/components/presentation/section-header";
import { SpeakerMeta } from "@/components/presentation/speaker-meta";
import { cn } from "@/lib/utils";

/**
 * Stage 03 — Discovery.
 *
 * Metaphor: a night sky. Three constellations, each a fact. Only one is open at
 * a time, because a surprise needs room to land — the audience should have
 * nowhere else to look while it is being told.
 */
export function DiscoverySection({
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
  const [open, setOpen] = useState<string>(discoveryFacts[0].id);

  return (
    <section
      className="stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label={section.title}
    >
      <StarField />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1680px)] min-h-0 flex-1 flex-col gap-[var(--sp-stage)]">
        <SectionHeader
          numeral={section.numeral}
          kicker={section.kicker}
          title={section.title}
          align="center"
          className="shrink-0"
        />

        <div
          className="grid min-h-0 flex-1 gap-[var(--sp-block)] lg:grid-cols-3"
          data-keynav
          role="tablist"
          aria-label="الحقائق الثلاث"
        >
          {discoveryFacts.map((fact) => (
            <FactCard
              key={fact.id}
              fact={fact}
              open={open === fact.id}
              onOpen={() => setOpen(fact.id)}
            />
          ))}
        </div>
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

/* -------------------------------------------------------------------------- */

function FactCard({
  fact,
  open,
  onOpen,
}: {
  fact: DiscoveryFact;
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <article
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden rounded-xl border transition-colors duration-300",
        open
          ? "border-accent-star/45 bg-night shadow-deep"
          : "border-night-line/80 bg-night/85 hover:border-accent-star/35 hover:bg-night",
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={open}
        aria-expanded={open}
        onClick={onOpen}
        className="group flex flex-1 cursor-pointer flex-col items-start gap-1.5 p-[clamp(0.7rem,0.55rem+0.4vw,1.1rem)] text-start"
      >
        <span className="flex w-full items-center justify-between gap-2">
          <span className="kicker text-accent-star-soft">{fact.kicker}</span>
          <span className="tabular font-display type-display-sm leading-none font-bold text-gold-300/35">
            {fact.index}
          </span>
        </span>

        <span
          className={cn(
            "font-display type-display-sm font-bold leading-tight transition-colors duration-300",
            open ? "text-night-text" : "text-night-muted",
          )}
        >
          {fact.title}
        </span>

        <span
          className={cn(
            "type-body-sm leading-relaxed transition-colors duration-300",
            open ? "text-gold-200" : "text-night-muted/90",
          )}
        >
          {fact.headline}
        </span>

        <span className="mt-auto flex items-center gap-1.5 pt-1.5 type-micro font-semibold text-accent-star-soft">
          <Sparkles className="size-3" aria-hidden />
          {open ? "أغلق" : "اكتشف"}
          <ArrowLeft
            className={cn(
              "size-3 transition-transform duration-300",
              open ? "-translate-x-0.5" : "translate-x-0",
            )}
            aria-hidden
          />
        </span>
      </button>

      {/* The reveal. Each fact gets a different visual so the three do not
          blur into one repeated interaction. */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-night-line px-[clamp(0.7rem,0.55rem+0.4vw,1.1rem)] pt-[var(--sp-tight)] pb-[clamp(0.7rem,0.55rem+0.4vw,1.1rem)]">
              <FactVisual fact={fact} />
              <p className="mt-[var(--sp-tight)] type-body-sm leading-relaxed text-night-muted">
                {fact.detail}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fact 01 — Arabic → Maltese → Latin script                                 */
/* -------------------------------------------------------------------------- */

const MALTESE_SAMPLE = ["a", "b", "c", "d", "e"];

function MalteseVisual() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <FlowStep
        label="العربية"
        caption="اللغة الأصل"
        className="border-gold-300/30 bg-gold-300/8 font-serif text-night-text"
      />
      <FlowArrow />
      <FlowStep
        label="المالطية"
        caption="لغة تطورت منها"
        className="border-gold-300/40 bg-night-raised font-serif text-gold-200"
      />
      <FlowArrow />
      <FlowStep
        label="A · B · C"
        caption="تُكتب بالحروف اللاتينية"
        className="border-accent-star/40 bg-accent-star/10 font-latin text-night-text"
        latin
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fact 02 — a star named Aldebaran                                          */
/* -------------------------------------------------------------------------- */

function StarVisual() {
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => setStep((s) => (s + 1) % 3), 2200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const layers = [
    { text: "Aldebaran", latin: true, caption: "الاسم المتعارف عليه" },
    { text: "الدبران", latin: false, caption: "أصله في العربية" },
    { text: "التابع", latin: false, caption: "لأنه يبدو أنه يتبع مجموعة نجوم أخرى" },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* the star + the group it follows */}
      <div className="relative mb-2 h-[clamp(3.5rem,3rem+2vh,5rem)] w-full">
        <svg
          viewBox="0 0 200 64"
          className="h-full w-full"
          aria-hidden
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="starGlow">
              <stop offset="0%" stopColor="var(--gold-200)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--gold-200)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* the cluster it trails */}
          {[28, 44, 60, 74, 90].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={30 + (i % 2 === 0 ? -7 : 7)}
              r="2.6"
              fill="var(--night-muted)"
              opacity="0.75"
            />
          ))}
          {/* the path it follows */}
          <path
            d="M96 30 C 120 12, 150 48, 176 30"
            fill="none"
            stroke="var(--gold-300)"
            strokeWidth="1"
            strokeDasharray="5 6"
            className="animate-flow"
            opacity="0.7"
          />
          {/* the star itself */}
          <circle cx="176" cy="30" r="16" fill="url(#starGlow)" />
          <circle cx="176" cy="30" r="3.4" fill="var(--gold-100)" />
        </svg>
      </div>

      {/* the three layers, revealed one at a time */}
      <div className="relative flex h-[clamp(2.6rem,2.2rem+1.4vh,3.5rem)] w-full items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center"
          >
            <span
              className={cn(
                "type-display-sm font-bold leading-tight",
                layers[step].latin
                  ? "font-latin text-night-text"
                  : "font-serif text-gold-200",
              )}
              dir={layers[step].latin ? "ltr" : "rtl"}
            >
              {layers[step].text}
            </span>
            <span className="mt-0.5 type-micro text-night-muted">
              {layers[step].caption}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-1.5 flex gap-1.5" aria-hidden>
        {layers.map((l, i) => (
          <span
            key={l.text}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === step ? "w-5 bg-gold-300" : "w-1.5 bg-night-line",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fact 03 — Al-ʿAyn ordered by articulation, not by alphabet                */
/* -------------------------------------------------------------------------- */

function AinVisual() {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* A schematic head: the point is that the letters hang off where they
          are articulated, not where they sit in the alphabet. */}
      <div className="relative w-full max-w-[13rem]">
        <svg
          viewBox="0 0 160 120"
          className="mx-auto block w-full max-w-[10.5rem]"
          aria-hidden
        >
          {/* head profile, facing the start of the RTL line */}
          <path
            d="M118 18 C 92 10, 66 22, 62 44 C 59 60, 68 68, 66 78 C 64 88, 56 92, 58 102 L 96 102 C 96 92, 104 84, 106 70 C 110 48, 116 34, 118 18 Z"
            fill="none"
            stroke="var(--night-muted)"
            strokeWidth="1.2"
            opacity="0.7"
          />
          {/* throat → lips axis */}
          <line
            x1="72"
            y1="94"
            x2="98"
            y2="30"
            stroke="var(--gold-300)"
            strokeWidth="0.9"
            strokeDasharray="3 4"
            opacity="0.65"
          />
          {[
            { x: 70, y: 92, g: "throat" },
            { x: 82, y: 74, g: "tongue" },
            { x: 62, y: 96, g: "lips" },
            { x: 74, y: 44, g: "nose" },
          ].map((p) => (
            <circle
              key={p.g}
              cx={p.x}
              cy={p.y}
              r="3.6"
              fill="var(--accent-star)"
              opacity="0.85"
            />
          ))}
        </svg>
      </div>

      <ul className="grid w-full grid-cols-2 gap-1">
        {articulationGroups.map((group) => (
          <li
            key={group.id}
            className="rounded-md border border-night-line bg-night-raised/60 px-2 py-1"
          >
            <p className="type-micro font-bold text-gold-300">{group.label}</p>
            <p
              className="mt-0.5 font-serif type-body-lg leading-tight text-night-text"
              aria-label={`حروف ${group.label}`}
            >
              {group.letters.join(" ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function FactVisual({ fact }: { fact: DiscoveryFact }) {
  if (fact.id === "maltese") return <MalteseVisual />;
  if (fact.id === "aldebaran") return <StarVisual />;
  return <AinVisual />;
}

function FlowStep({
  label,
  caption,
  className,
  latin,
}: {
  label: string;
  caption: string;
  className?: string;
  latin?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-1",
        className,
      )}
    >
      <span
        className={cn(
          "type-body-lg font-bold leading-tight",
          latin ? "font-latin tracking-wide" : "font-serif",
        )}
        dir={latin ? "ltr" : "rtl"}
      >
        {label}
      </span>
      <span className="shrink-0 type-micro text-night-muted">{caption}</span>
    </div>
  );
}

function FlowArrow() {
  return (
    <span aria-hidden className="flex h-3 items-center">
      <svg width="10" height="14" viewBox="0 0 10 14" className="text-gold-300/50">
        <path
          d="M5 0 V10 M1 6 L5 11 L9 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/** A quiet, deterministic star field — no particle library, no randomness
 *  between renders. */
function StarField() {
  const stars = useMemoStars();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(75%_60%_at_50%_0%,var(--accent-star-soft)_0%,transparent_70%)]"
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className={cn("absolute rounded-full bg-gold-300", s.twinkle && "animate-twinkle")}
          style={{
            insetInlineStart: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${(i % 7) * 0.6}s`,
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

/** Fixed layout — a hand-tuned scatter, so the sky is identical every load. */
function useMemoStars() {
  return STAR_LAYOUT;
}

const STAR_LAYOUT = [
  { x: 6, y: 14, size: 2, twinkle: true },
  { x: 13, y: 30, size: 1, twinkle: false },
  { x: 21, y: 9, size: 1.5, twinkle: true },
  { x: 29, y: 22, size: 1, twinkle: false },
  { x: 38, y: 12, size: 2, twinkle: true },
  { x: 47, y: 27, size: 1, twinkle: false },
  { x: 55, y: 8, size: 1.5, twinkle: true },
  { x: 64, y: 19, size: 1, twinkle: false },
  { x: 72, y: 11, size: 2, twinkle: true },
  { x: 81, y: 26, size: 1, twinkle: false },
  { x: 90, y: 15, size: 1.5, twinkle: true },
  { x: 95, y: 33, size: 1, twinkle: false },
  { x: 3, y: 44, size: 1, twinkle: true },
  { x: 17, y: 52, size: 1.5, twinkle: false },
  { x: 33, y: 47, size: 1, twinkle: true },
  { x: 44, y: 58, size: 2, twinkle: false },
  { x: 58, y: 49, size: 1, twinkle: true },
  { x: 69, y: 60, size: 1.5, twinkle: false },
  { x: 79, y: 45, size: 1, twinkle: true },
  { x: 88, y: 55, size: 1, twinkle: false },
  { x: 97, y: 47, size: 1.5, twinkle: true },
  { x: 10, y: 68, size: 1, twinkle: false },
  { x: 26, y: 74, size: 1.5, twinkle: true },
  { x: 40, y: 66, size: 1, twinkle: false },
  { x: 53, y: 78, size: 2, twinkle: true },
  { x: 66, y: 70, size: 1, twinkle: false },
  { x: 76, y: 80, size: 1, twinkle: true },
  { x: 85, y: 68, size: 1.5, twinkle: false },
  { x: 94, y: 76, size: 1, twinkle: true },
];
