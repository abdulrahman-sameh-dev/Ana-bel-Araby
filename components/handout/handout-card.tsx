import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import type { HandoutEntry } from "@/lib/handout-outline";

/**
 * One handout page: one section, one screen, no point-by-point navigation.
 *
 * This is a working document rather than a slide, so the design rules are
 * inverted from the stage: no artwork, no transitions, no decorative scale.
 * What is left is hierarchy — a label, a hairline, and the shortest possible
 * string under each label — because the reader is mid-sentence in front of an
 * audience and scanning, not browsing.
 *
 * Every block hides itself when it has nothing to say. An empty labelled box
 * costs more attention than the box is worth.
 */

/* -------------------------------------------------------------------------- */
/*  Small parts                                                                */
/* -------------------------------------------------------------------------- */

/** The label + hairline above each block. `count` is shown only when useful. */
function BlockLabel({
  children,
  count,
  className,
}: {
  children: React.ReactNode;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="kicker shrink-0 text-gold-600">{children}</span>
      <span aria-hidden className="h-px min-w-4 flex-1 bg-paper-line" />
      {count != null ? (
        <span className="tabular type-micro shrink-0 text-ink-faint">
          {toArabicDigits(count)}
        </span>
      ) : null}
    </div>
  );
}

/** A bordered block holding one group of cues. */
function Block({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-paper-line bg-paper/60 px-3 py-2.5 sm:px-4 sm:py-3",
        className,
      )}
    >
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  The page                                                                   */
/* -------------------------------------------------------------------------- */

export function HandoutCard({ entry }: { entry: HandoutEntry }) {
  const hasPoints = entry.points.length > 0;
  const hasMusts = entry.emphasis.length > 0 || entry.musts.length > 0;
  const hasInteraction = !!entry.interaction;

  return (
    <article className="flex flex-col gap-2.5 sm:gap-3">
      {/* ── header ─────────────────────────────────────────────────────── */}
      <header className="rounded-xl border border-paper-line bg-paper-raised px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {/* The opening's badge is a word («افتتاح»), the chapters' is a
              numeral — so the box is sized by what it holds. */}
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-md bg-ink font-display text-[0.7rem] leading-none font-bold text-paper",
              entry.kind === "opening" ? "px-2.5 py-1.5" : "tabular size-7",
            )}
          >
            {entry.numeral}
          </span>
          <span className="kicker text-gold-600">{entry.kicker}</span>
          <span aria-hidden className="h-px min-w-4 flex-1 bg-paper-line" />
          {entry.durationLabel ? (
            <span className="tabular type-micro rounded-full border border-paper-line bg-paper-sunk px-2 py-0.5 font-semibold text-ink-muted">
              {entry.durationLabel}
            </span>
          ) : null}
        </div>

        <h1 className="mt-2 font-display text-[clamp(1.1rem,0.95rem+1vw,1.7rem)] leading-[1.35] font-bold balance text-ink">
          {entry.title}
        </h1>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {entry.speaker ? (
            <span className="type-body-sm inline-flex items-center gap-1.5 font-semibold text-ink-soft">
              <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
              {entry.speaker}
            </span>
          ) : null}
          {entry.pacing ? (
            <span className="type-micro text-ink-faint">{entry.pacing}</span>
          ) : null}
        </div>
      </header>

      {/* ── the one line that matters ──────────────────────────────────── */}
      <Block className="border-r-2 border-r-gold-400 bg-gold-100/45">
        <BlockLabel>الخلاصة</BlockLabel>
        <p className="type-body-sm mt-1.5 leading-relaxed font-semibold text-ink balance">
          {entry.core}
        </p>
      </Block>

      {/* ── the دجداج interaction: question, cue, answer, bridge ────────── */}
      {hasInteraction && entry.interaction ? (
        <InteractionBlocks interaction={entry.interaction} />
      ) : null}

      {/* ── sequence + verbatim material ───────────────────────────────── */}
      {hasPoints || hasMusts ? (
        <div className="grid items-start gap-2.5 sm:gap-3 md:grid-cols-[1.15fr_1fr]">
          {hasPoints ? (
            <Block>
              <BlockLabel count={entry.points.length}>النقاط</BlockLabel>
              <ol className="mt-2 flex flex-col">
                {entry.points.map((p, i) => (
                  <li
                    key={p.index + p.title}
                    className={cn(
                      "flex items-baseline gap-2.5 py-1.5",
                      i !== 0 && "border-t border-dashed border-paper-line",
                    )}
                  >
                    <span className="tabular type-micro w-5 shrink-0 font-bold text-gold-500">
                      {p.index}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.92rem] leading-snug font-bold text-ink">
                        {p.title}
                      </span>
                      <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-muted balance">
                        {p.headline}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Block>
          ) : null}

          {hasMusts ? (
            <Block>
              <BlockLabel>لا تنسَ أن تقول</BlockLabel>

              {entry.emphasis.length > 0 ? (
                <p className="mt-1.5 type-micro font-semibold text-ink-faint">
                  شدّد على
                </p>
              ) : null}
              {entry.emphasis.length > 0 ? (
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {entry.emphasis.map((e) => (
                    <li
                      key={e}
                      className="rounded-md border border-gold-300/70 bg-gold-100/70 px-1.5 py-0.5 text-[0.78rem] leading-tight font-semibold text-gold-600"
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              ) : null}

              {entry.emphasis.length > 0 && entry.musts.length > 0 ? (
                <p className="mt-2 type-micro font-semibold text-ink-faint">
                  لابد من ذكره
                </p>
              ) : null}
              {entry.musts.length > 0 ? (
                <ul className="mt-1 flex flex-col gap-1.5">
                  {entry.musts.map((m, i) => (
                    <li
                      key={m.text}
                      className={
                        entry.emphasis.length === 0 && i === 0 ? "mt-1.5" : undefined
                      }
                    >
                      <span
                        className={cn(
                          "block text-[0.85rem] leading-snug text-ink",
                          m.latin &&
                            "font-latin text-[0.95rem] font-semibold tracking-wide",
                          m.latin ? "" : "font-semibold",
                        )}
                        dir={m.latin ? "ltr" : undefined}
                      >
                        {m.source ? `«${m.text}»` : m.text}
                      </span>
                      {m.source ? (
                        <span className="mt-0.5 block text-[0.75rem] text-ink-faint">
                          {m.source}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Block>
          ) : null}
        </div>
      ) : null}

      {/* ── how it ends ────────────────────────────────────────────────── */}
      {entry.close ? (
        <Block>
          <BlockLabel>كيف تُنهي</BlockLabel>
          <p className="type-body-sm mt-1.5 leading-relaxed text-ink-soft balance">
            {entry.close}
          </p>
        </Block>
      ) : null}

      {/* ── who is next ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-paper-line bg-paper-sunk px-3 py-2 sm:px-4">
        <span className="type-micro font-semibold text-ink-faint">التالي</span>
        <span aria-hidden className="text-gold-500">
          ←
        </span>
        <span className="type-body-sm font-bold text-ink">
          {entry.next ?? "نهاية العرض"}
        </span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  The opening interaction only                                               */
/* -------------------------------------------------------------------------- */

function InteractionBlocks({
  interaction,
}: {
  interaction: NonNullable<HandoutEntry["interaction"]>;
}) {
  return (
    <>
      <Block>
        <BlockLabel>اسأل ثم اصمت</BlockLabel>
        <p className="mt-1.5 font-serif text-[1.05rem] leading-relaxed font-semibold text-ink">
          «{interaction.ask}»
        </p>
        <ul className="mt-2 flex flex-col gap-1 border-t border-dashed border-paper-line pt-2">
          {interaction.cues.map((cue) => (
            <li
              key={cue}
              className="flex gap-2 text-[0.8rem] leading-snug text-ink-muted"
            >
              <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-gold-400" />
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block>
        <BlockLabel count={interaction.answer.length}>الإجابة</BlockLabel>
        <ol className="mt-2 flex flex-col gap-1.5">
          {interaction.answer.map((line, i) => (
            <li key={line} className="flex items-baseline gap-2.5">
              <span className="tabular type-micro w-4 shrink-0 font-bold text-gold-500">
                {toArabicDigits(i + 1)}
              </span>
              <span className="text-[0.85rem] leading-relaxed font-semibold text-ink balance">
                {line}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-2.5 border-t border-dashed border-paper-line pt-2 text-[0.82rem] leading-relaxed text-ink-soft balance">
          {interaction.connection}
        </p>
      </Block>
    </>
  );
}
