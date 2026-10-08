import Link from "next/link";

import {
  chapterEmphasis,
  chapterSeconds,
  scripts,
  SCRIPT_SLUGS,
  type ScriptChapter,
  type ScriptLine,
  type SpeakerScript,
} from "@/data/scripts";
import { toArabicDigits } from "@/lib/format";

const scriptsBySlug = Object.fromEntries(scripts.map((s) => [s.slug, s]));

/**
 * One speaker's script, read top to bottom.
 *
 * A server component on purpose: nothing here needs state, and a script page
 * that can be read without booting a client runtime is a script page that
 * opens on a phone with no network to spare.
 *
 * The typographic contract is the whole design. Spoken words are soft and
 * loosely leaded because they are being read aloud; instructions never look
 * like words — a delivery marker is a pill, a speaker-only aside is a ruled
 * margin note, and an approved quote is a block with its attribution. Bold is
 * reserved for the phrases the stage already emphasises, so what a speaker
 * underlines on the script is what the room underlines on the screen.
 */

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                               */
/* -------------------------------------------------------------------------- */

/** `[انتقل]` alone, or a marker followed by the instruction that explains it. */
function Marker({ text }: { text: string }) {
  const match = /^(\[[^\]]*\])\s*([\s\S]*)$/.exec(text);
  const label = match ? match[1] : `[${text}]`;
  const rest = match?.[2]?.trim() ?? "";

  return (
    <span className="mt-1 mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="inline-flex shrink-0 items-center rounded-full border border-paper-line bg-paper-sunk px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-[0.06em] text-ink-soft">
        {label}
      </span>
      {rest ? (
        <span className="text-[0.82rem] leading-relaxed text-ink-muted">
          {rest}
        </span>
      ) : null}
    </span>
  );
}

/** Bold every approved emphasis phrase that appears in the spoken text. */
function Spoken({ text, emphasis }: { text: string; emphasis: readonly string[] }) {
  const phrases = emphasis.filter(Boolean);
  if (phrases.length === 0) return <>{text}</>;

  const pattern = new RegExp(
    `(${phrases
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length)
      .join("|")})`,
    "g",
  );

  return (
    <>
      {text.split(pattern).map((part, i) =>
        phrases.includes(part) ? (
          <strong key={i} className="font-bold text-ink">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Lines                                                                      */
/* -------------------------------------------------------------------------- */

function Answer({ items }: { items: readonly string[] }) {
  return (
    <ol className="my-4 space-y-3 rounded-lg border border-gold-300/60 bg-gold-100/50 p-4 sm:p-5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 leading-[1.95] text-ink">
          <span className="mt-0.5 shrink-0 font-display text-[0.8rem] font-bold text-gold-600">
            {toArabicDigits(i + 1)}
          </span>
          <span className="text-[0.98rem]">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Line({ line, emphasis }: { line: ScriptLine; emphasis: readonly string[] }) {
  switch (line.t) {
    case "say":
      return (
        <div className="my-2.5">
          {line.mark ? <Marker text={line.mark} /> : null}
          <p className="text-[1.05rem] leading-[2.15] text-ink-soft">
            <Spoken text={line.text} emphasis={emphasis} />
          </p>
        </div>
      );

    case "quote":
      return (
        <figure className="my-5 border-s-2 border-gold-500 ps-4 sm:ps-5">
          {line.lead ? (
            <figcaption className="mb-1.5 text-[0.82rem] text-ink-muted">
              {line.lead}
            </figcaption>
          ) : null}
          <blockquote className="font-serif text-[1.2rem] leading-[2] text-ink sm:text-[1.3rem]">
            {line.text}
          </blockquote>
          <cite className="mt-2 block text-[0.78rem] not-italic text-ink-muted">
            {line.by}
          </cite>
        </figure>
      );

    case "answer":
      return <Answer items={line.items} />;

    case "cue":
      return <Marker text={line.text} />;

    case "note":
      return (
        <p className="my-3 border-s-2 border-paper-line ps-3 text-[0.84rem] leading-[1.9] text-ink-muted">
          {line.text}
        </p>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*  Chapters                                                                   */
/* -------------------------------------------------------------------------- */

function ChapterBlock({
  script,
  chapter,
  order,
}: {
  script: SpeakerScript;
  chapter: ScriptChapter;
  order: number;
}) {
  const emphasis = chapterEmphasis(script, chapter);
  const seconds = chapterSeconds(script, chapter);
  const tone =
    chapter.tone === "opening"
      ? "border-gold-300/70 bg-gold-100/35"
      : chapter.tone === "final"
        ? "border-paper-line bg-paper-sunk/60"
        : "border-paper-line";

  return (
    <section
      id={chapter.id}
      className={`mt-8 rounded-xl border p-4 sm:mt-10 sm:p-6 ${tone}`}
    >
      <header className="mb-3 border-b border-paper-line/80 pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-[0.72rem] font-bold tracking-[0.14em] text-gold-600">
              {toArabicDigits(order)}
            </span>
            <h2 className="stage-title text-[1.15rem] text-ink sm:text-[1.25rem]">
              {chapter.heading}
            </h2>
          </div>
          {(() => {
            const label =
              chapter.durationLabel ??
              (seconds !== null ? `${toArabicDigits(seconds)} ثانية` : null);
            if (!label) return null;
            return (
              <span className="tabular rounded-full border border-paper-line bg-paper px-2 py-0.5 text-[0.7rem] text-ink-muted">
                {label}
              </span>
            );
          })()}
        </div>
        {chapter.cue ? (
          <p className="mt-1.5 text-[0.78rem] tracking-[0.04em] text-ink-muted">
            سلّم الذاكرة: {chapter.cue}
          </p>
        ) : null}
      </header>

      {chapter.lines.map((line, i) => (
        <Line key={i} line={line} emphasis={emphasis} />
      ))}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                 */
/* -------------------------------------------------------------------------- */

function SpeakerNav({ activeSlug }: { activeSlug: string }) {
  return (
    <nav
      aria-label="سكربتات المتحدثين"
      className="sticky top-0 z-10 border-b border-paper-line bg-paper/92 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[42rem] flex-wrap items-center gap-1.5 px-4 py-2.5 sm:px-6">
        <span className="me-1 text-[0.7rem] font-semibold tracking-[0.1em] text-ink-muted">
          السكربت
        </span>
        {SCRIPT_SLUGS.map((slug) => {
          const script = scriptsBySlug[slug];
          const active = slug === activeSlug;
          const short = script.speaker.replace(/^أ\.\s*/, "").split(" ")[0];
          return (
            <Link
              key={slug}
              href={`/script/${slug}`}
              aria-current={active ? "page" : undefined}
              aria-label={script.speaker}
              className={[
                "rounded-full px-3 py-1 text-[0.8rem] transition-colors",
                active
                  ? "bg-ink font-semibold text-paper"
                  : "border border-paper-line text-ink-soft hover:border-gold-400 hover:text-ink",
              ].join(" ")}
            >
              {short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Document                                                                   */
/* -------------------------------------------------------------------------- */

export function ScriptDocument({ script }: { script: SpeakerScript }) {
  return (
    <article className="min-h-screen bg-paper text-ink">
      <SpeakerNav activeSlug={script.slug} />

      <div className="mx-auto w-full max-w-[42rem] px-4 pb-16 pt-7 sm:px-6 sm:pt-10">
        {/* ── header ─────────────────────────────────────────────── */}
        <header>
          <p className="kicker text-gold-600">
            المحور {script.numeral} · {script.shortTitle}
          </p>
          <h1 className="stage-title mt-2 text-[1.65rem] leading-tight text-ink sm:text-[2.1rem]">
            {script.speaker}
          </h1>
          <p className="mt-2 text-[1.02rem] leading-[1.9] text-ink-soft">
            {script.topic}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.76rem]">
            <span className="tabular rounded-full border border-paper-line bg-paper-sunk px-2.5 py-1 text-ink-soft">
              زمن المحور {script.durationLabel}
            </span>
            <span className="rounded-full border border-paper-line px-2.5 py-1 text-ink-muted">
              {toArabicDigits(script.chapters.length)} مقاطع
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-gold-300/70 bg-gold-100/50 p-4 sm:p-5">
            <p className="kicker mb-1.5 text-gold-600">الخلاصة</p>
            <p className="text-[1.08rem] font-semibold leading-[1.95] text-ink">
              {script.anchor}
            </p>
            <p className="mt-3 border-t border-gold-300/50 pt-3 text-[0.82rem] leading-[1.9] text-ink-soft">
              سلّم الذاكرة: {script.memoryCue}
            </p>
          </div>

          <p className="mt-3 border-s-2 border-paper-line ps-3 text-[0.84rem] leading-[1.9] text-ink-muted">
            الإيقاع: {script.pacing}
          </p>
        </header>

        {/* ── script ─────────────────────────────────────────────── */}
        {script.chapters.map((chapter, i) => (
          <ChapterBlock
            key={chapter.id}
            script={script}
            chapter={chapter}
            order={i + 1}
          />
        ))}

        {/* ── hand-off ───────────────────────────────────────────── */}
        {script.handoff ? (
          <section className="mt-8 rounded-xl border border-dashed border-paper-line p-4 sm:mt-10 sm:p-6">
            <p className="kicker mb-2 text-ink-muted">التسليم</p>
            <p className="text-[1.02rem] leading-[2.05] text-ink-soft">
              {script.handoff.teaser}
            </p>
            <p className="mt-2 text-[1.05rem] font-semibold leading-[1.95] text-ink">
              {script.handoff.line}
            </p>
            <Link
              href={`/script/${script.handoff.toSlug}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-paper-line px-3.5 py-1.5 text-[0.82rem] text-ink-soft hover:border-gold-400 hover:text-ink"
            >
              التالي: {script.handoff.to}
            </Link>
          </section>
        ) : null}

        <p className="mt-10 text-center text-[0.78rem] text-ink-muted">
          {script.speaker} · {script.topic}
        </p>
      </div>
    </article>
  );
}
