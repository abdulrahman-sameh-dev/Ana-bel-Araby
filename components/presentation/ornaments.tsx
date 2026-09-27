"use client";

import { cn } from "@/lib/utils";

/**
 * Eight-pointed star (khatam) lattice — the geometric ground for parchment
 * sections. Drawn once as an inline SVG tile so it costs no extra request and
 * can be recoloured per section through `currentColor`.
 */
export function ArabesqueField({
  className,
  tone = "ink",
  opacity = 0.05,
}: {
  className?: string;
  /** `ink` for light grounds, `gold` for a warmer, more decorative field. */
  tone?: "ink" | "gold" | "night";
  opacity?: number;
}) {
  const stroke =
    tone === "gold"
      ? "var(--gold-500)"
      : tone === "night"
        ? "var(--gold-300)"
        : "var(--ink)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full" width="100%" height="100%">
        <defs>
          <pattern
            id="khatam-lattice"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={stroke} strokeWidth="0.75">
              <path d="M36 4 L52 20 L36 36 L20 20 Z" />
              <path d="M36 36 L52 52 L36 68 L20 52 Z" />
              <path d="M4 36 L20 20 L36 36 L20 52 Z" opacity="0.55" />
              <path d="M68 36 L52 20 L36 36 L52 52 Z" opacity="0.55" />
              <circle cx="36" cy="36" r="3.2" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#khatam-lattice)" />
      </svg>
    </div>
  );
}

/**
 * The double rule that framed every slide of the original deck, reduced to a
 * hairline so it frames rather than boxes.
 */
export function OrnamentFrame({
  className,
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "neutral" | "night";
}) {
  const color =
    tone === "gold"
      ? "var(--gold-500)"
      : tone === "night"
        ? "var(--gold-300)"
        : "var(--ink)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        // 1px outer rule + 1px inner rule, exactly as in the source slides.
        border: `1px solid color-mix(in oklab, ${color} 22%, transparent)`,
        borderRadius: 2,
        inset: 0,
        boxShadow: `inset 0 0 0 5px transparent, inset 0 0 0 6px color-mix(in oklab, ${color} 11%, transparent)`,
      }}
    />
  );
}

/** Small rule + lozenge used to separate a kicker from its title. */
export function FiligreeRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("flex items-center gap-2 text-gold-400", className)}
    >
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-400/50" />
      <svg width="9" height="9" viewBox="0 0 9 9" className="shrink-0">
        <path
          d="M4.5 0 L9 4.5 L4.5 9 L0 4.5 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
        />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-400/50" />
    </div>
  );
}
