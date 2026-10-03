"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import type { PresentationPoint } from "@/data/points";

/**
 * One beat of a talk, at full size.
 *
 * The old layout put every point of a section on screen at once and let the
 * audience read the argument off a wall of cards. That is a handout, not a
 * talk. This is the fix: the point being spoken owns the stage, and the others
 * are reduced to a navigator so the room can still tell where it is.
 *
 * Two things are deliberately *not* here. There is no modal, because a popup
 * would put the speaker's content behind a dismissal and make the deck feel
 * like a web page. And there is no auto-advance, because the speaker decides
 * when a point is done; `advance()` is called from the shell's own key handler.
 *
 * ## The composition: a title at the top, the point centred beneath it
 *
 * Two columns — the point's content, and the section's visual — both of which
 * fill the height the stage leaves. Inside the content column the two halves
 * are positioned differently on purpose, because they are different kinds of
 * thing:
 *
 *   ┌─ content column ──────────┐   ┌─ visual ──┐
 *   │ SECTION TITLE             │   │           │
 *   │                           │   │  artwork  │
 *   │      POINT CONTENT        │   │  (fills)  │
 *   │      centred in what is   │   │           │
 *   │      left below           │   │           │
 *   └───────────────────────────┘   └───────────┘
 *
 * The section title is *chrome*. It names the chapter and does not change for
 * any of its points, so it sits at the top of the column, aligned to the same
 * edge as everything under it. The point content is what actually changes, and
 * it is centred in the space the title leaves — not centred on the stage, and
 * not stacked at the top either.
 *
 * Those two are different instructions, and running them together is wrong in
 * both directions. Centring the title with the point makes the title jump every
 * time the point's height changes. Pinning the point under the title puts every
 * point at the same y, so a one-line point floats in the middle of the screen
 * and a six-line point starts at the top — the stage looks different on every
 * beat, which is the thing a presenter notices from the back of the room.
 *
 * ### The title is not inside the point's transition
 *
 * This is the bug the structure exists to prevent, and it is worth stating
 * plainly because it is easy to reintroduce: `heading` is rendered *outside*
 * `AnimatePresence`, as a sibling of the keyed subtree.
 *
 * The first version of this layout put `{heading}` inside the keyed
 * `motion.div`. Because the key is `point.id`, that remounted the whole title
 * on every single point change — so the chapter title faded out, faded back in,
 * and slid up 12px each time the speaker advanced. To the room it read as a new
 * slide arriving every 20 seconds, which is precisely what a chapter title is
 * supposed to prevent. It is persistent section-level UI and it belongs
 * outside the boundary that the point controls.
 *
 * ### The column split is not a split, it is a remainder
 *
 * The content column is `minmax(0, 1fr)` and the visual column is whatever
 * `visualWidth` asks for. So the content takes what is left rather than
 * splitting the stage 50/50, and two sections with different artwork end up
 * with different columns: the portrait calligraphy gets a narrow one and the
 * landscape technology plate a wider one. Each section declares its visual's
 * budget as a `clamp()` mixing rem and percentage, so the column is bounded on
 * a small laptop and on a 1080p projector without either end being the design.
 *
 * `minmax(0, 1fr)` rather than `1fr` matters: a bare `1fr` column cannot shrink
 * below its content's intrinsic minimum, and one long Arabic headline is enough
 * to push the visual off the stage. `minmax(0, …)` lets it give way instead.
 *
 * The point content inside that column is `w-full` on purpose. A column is a
 * layout region, not a text box — it takes the remaining width and the *line
 * length* is what gets constrained further down, inside the section, where a
 * reading measure can be set per point. Letting the column shrink to its text
 * instead leaves a ragged gap between the content and the artwork that no
 * amount of centring hides.
 *
 * ## `visual` versus `children` — the reason this component has two slots
 *
 * `children` is the *point*, and it is keyed on `point.id` inside
 * `AnimatePresence`. `visual` is the *section*, and it is rendered outside that
 * boundary.
 *
 * This split exists because of one specific bug. The section artwork used to be
 * passed through `children`, which meant it sat inside the keyed subtree — so
 * every arrow key unmounted it and mounted it again. The side column of the
 * calligraphy faded and scaled in from `opacity: 0, scale: 0.98` on *every single
 * point change*, five times per chapter. To an audience that reads as a glitch:
 * the room has been told the section's visual is part of the point, when it is
 * the thing holding still while the point changes. That reading is the opposite
 * of what a persistent visual is for.
 *
 * Moving it out of the keyed subtree fixes the remount, and it changes the
 * meaning in the right direction. The visual now mounts once when the section
 * opens and stays for the whole chapter — so a slow drift or a reveal on the
 * artwork plays once, on entry, and the section has a visible steady state
 * against which the points can move.
 */
/**
 * Is a `visualAspect` string wider than it is tall?
 *
 * `visualAspect` is written the way CSS `aspect-ratio` wants it — `"8 / 5"` or
 * `"320 / 404"` — so `parseFloat` on the whole string reads the *first* number
 * and answers "320 > 1" for a portrait plate that is 0.79 wide. Both halves have
 * to be divided to get the ratio the layout actually cares about.
 *
 * Only the stacked (below `lg`) sizing branches on this; desktop fills the
 * column either way.
 */
function isLandscapeRatio(aspect?: string): boolean {
  if (!aspect) return false;
  const [w, h] = aspect.split("/").map((part) => Number.parseFloat(part.trim()));
  if (!Number.isFinite(w) || !Number.isFinite(h) || h === 0) return false;
  return w / h > 1;
}

export function SpotlightStage({
  point,
  points,
  index,
  onSelect,
  heading,
  visual,
  visualWidth = "clamp(15rem, 30%, 26rem)",
  visualAspect,
  showNavigator = true,
  tone = "ink",
  children,
  className,
}: {
  /** The point on stage. Drives the aria-live announcement. */
  point: PresentationPoint;
  /** The whole sequence, so the navigator can show progress. */
  points: PresentationPoint[];
  /** Zero-based index of `point`. */
  index: number;
  onSelect: (index: number) => void;
  /**
   * The chapter's contextual title, rendered inside the point's transition.
   *
   * See the note above: it is here rather than beside `children` so the chapter
   * title and the point arrive as one composition. Pass a `<SectionHeader
   * variant="context" />`.
   */
  heading?: React.ReactNode;
  /**
   * The section's persistent visual — artwork, diagram, or ornament.
   *
   * Rendered once per section, outside the point-keyed transition. Pass the same
   * element on every point; this component does not diff it.
   */
  visual?: React.ReactNode;
  /**
   * The visual column's width budget, as any CSS `width` value.
   *
   * A prop rather than a fixed value because the columns are not equal and
   * should not be: each section declares what its own artwork needs, in a
   * `clamp()` that mixes rem and percentage so the column is bounded on a
   * 1280×720 projector and on a 1920×1080 one without either end being the
   * design. A portrait drawing gets a narrow budget and a landscape plate a wide
   * one, and the content column takes the remainder either way.
   *
   * Tailwind cannot generate `lg:grid-cols-[minmax(0,1fr)_${visualWidth}]` from a
   * runtime string, so the value goes in as a custom property and the utility
   * class stays static.
   */
  visualWidth?: string;
  /**
   * The artwork's own aspect ratio, as a CSS `aspect-ratio` value — "320 / 404".
   *
   * Only meaningful on the stacked layout, and only needed where the artwork is
   * an image cropped by `object-cover`. With a plain `max-h` on a one-column
   * layout, a full-width box gets a *short* height, and a portrait plate forced
   * into it is cropped to a letterbox: at 768x1024 the calligraphy was drawn in
   * a 725x244 box, so two thirds of it was cut away. Setting the box's aspect
   * makes the max-height the binding constraint instead, so the width follows
   * the picture down and the crop stays close to the original frame.
   *
   * Omit it for visuals that size themselves, such as the history rail.
   */
  visualAspect?: string;
  /**
   * The navigator is a second index over the same points a section may already
   * be drawing. History has its own era rail and its own highlight, so it turns
   * this off rather than showing the audience two identical progress rows.
   */
  showNavigator?: boolean;
  tone?: "ink" | "night";
  /** The point's content. This is what transitions. */
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const isNight = tone === "night";
  const next = points[index + 1] ?? null;
  const isLandscape = isLandscapeRatio(visualAspect);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-(--sp-tight)",
        className,
      )}
    >
      {/* What a screen reader hears when the speaker moves on. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        النقطة {point.index} من {toArabicDigits(points.length)}: {point.title}
      </p>

      {/* ── the composition ──
          Two columns, both filling the height the rails leave.

          `items-stretch` — which is the grid default, and is why it is not
          written — is what gives the visual column the full stage height to
          fill. `items-center` here would make each column its own content
          height and hand the artwork nothing to stretch into. */}
      <div
        style={{ "--visual-w": visualWidth } as React.CSSProperties}
        data-composition="grid"
        className={cn(
          /* `grid-cols-[minmax(0,1fr)]` at *every* width, not just `lg`. The
             stacked layout was the broken one: with no explicit track the single
             implicit column is `auto`, and `auto` resolves to the column's
             max-content — so one long Arabic headline (404px of unbroken
             `max-w-lg` text) or one height-sized landscape plate (272 × 1.6 =
             435px) *widened the column past the phone viewport* instead of
             wrapping inside it. `minmax(0, 1fr)` pins the column to the space it
             actually has, and the text wraps there.

             RTL: the content column is the first child, so it sits on the right
             and the visual on the left.

             `minmax(0, 1fr)` and not `1fr`: a bare `1fr` refuses to shrink below
             its content's intrinsic minimum width, which is the same blowout by
             another name. */
          "grid grid-cols-[minmax(0,1fr)] min-h-0 flex-1 gap-(--sp-block)",
          visual && "lg:grid-cols-[minmax(0,1fr)_var(--visual-w)]",
        )}
      >
        {/* ── the content column.
            Persistent. `heading` is rendered here, above the point region, and
            is deliberately NOT inside `AnimatePresence`: the chapter title does
            not change from point to point, and keying it with the point made it
            remount and re-animate on every arrow key. See the note above. */}
        <div
          data-composition="content"
          className="flex min-h-0 min-w-0 flex-col gap-(--sp-block)"
        >
          {heading}

          {/* ── the point region: the part that changes.
              `flex-1` takes whatever the title did not use, and `items-center`
              centres the point inside that remainder. This is the vertical
              centring the layout is actually for, and it is scoped to this box
              so that the title above stays put. */}
          <div
            data-composition="point-region"
            className="flex min-h-0 flex-1 items-center"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={point.id}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: reduced ? 0.001 : 0.32, ease: EASE }}
                /* `w-full` so the point fills the column rather than shrink-
                   wrapping to the width of its own longest line. */
                className="flex w-full min-w-0 flex-col items-start gap-(--sp-tight)"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── persistent. Outside `AnimatePresence` on purpose: see the note
            above. It must not be re-keyed, re-mounted, or re-animated when the
            point changes.

            It fills the row height because the grid is `items-stretch`, and it
            bounds its own height on a one-column layout so a stacked visual
            cannot eat the content's share of a short screen.

            `h-full` on that column is load-bearing, and it is here because of a
            bug this layout introduced. When the grid was `items-center`, each
            column became its own content height rather than the row's, and the
            artworks fill their column with `h-full`. Handed an auto height,
            `h-full` has nothing to resolve against, so the artwork collapsed to
            0x0 and the chapter played with no picture on it at all — while every
            overflow check still passed, because a zero-sized box cannot
            overflow.

            And it stays a *block* box rather than a flex one. That second half
            matters as much as the first: the artworks are
            `<figure className="relative h-full overflow-hidden">` around an
            absolutely-positioned image, so a figure's only child is out of flow.
            As a block it takes the column's width, which is the width the image
            is then sized against. Made a flex item instead, it has no in-flow
            content at all and shrink-wraps to nothing — the figure went to 2px
            wide and the image with it, while the column itself measured a
            perfectly healthy 318px.
            ── */}
        {visual ? (
          <div
            data-composition="visual"
            style={
              visualAspect
                ? ({ "--visual-ar": visualAspect } as React.CSSProperties)
                : undefined
            }
            className={cn(
              "relative mx-auto min-h-0",
              visualAspect
                ? /* Stacked, with a real aspect to honour. The height has to be
                     the *definite* one: `aspect-ratio` back-propagates from
                     height to width, not the other way round, so a box that is
                     `w-full` with only a `max-h` keeps its full width and simply
                     violates the ratio — which is the letterbox this is here to
                     prevent. Height decides, width follows, and `mx-auto`
                     centres the result.

                     Landscape plates are the exception, on phones only
                     (`max-sm`). A landscape ratio back-propagates a *width*
                     from the height, so 34vh of an 800px-tall phone is 272px and
                     272 × 1.6 is 435px — wider than the 360px screen it was
                     meant to fit. `max-w-full` could not catch it either: with
                     the grid column sized to max-content, 100% *was* 435px.
                     Below `sm` the width is therefore the definite dimension, so
                     the ratio is honoured exactly and the plate simply gets
                     smaller. Portrait plates stay height-driven, because there
                     the derived width is the narrow one and already fits. */
                  isLandscape
                    ? "aspect-(--visual-ar) h-[min(34vh,24rem)] w-auto max-w-full max-sm:h-auto max-sm:w-full lg:h-full lg:w-full lg:max-h-none lg:aspect-auto"
                    : "aspect-(--visual-ar) h-[min(34vh,24rem)] w-auto max-w-full lg:h-full lg:w-full lg:max-h-none lg:aspect-auto"
                : /* No declared aspect — the visual sizes itself (the history
                     rail), so it simply fills the column and is capped on a
                     short screen. */
                  "h-full w-full max-h-[34vh] lg:max-h-none",
            )}
          >
            {visual}
          </div>
        ) : null}
      </div>

      {/* ── the navigator ──
          Compact on purpose: a row of ticks plus the point's name. It answers
          "where am I and what is next" without becoming a second list of the
          content the audience is meant to be reading. */}
      {showNavigator ? (
        <nav
          aria-label="محاور النقطة"
          data-keynav
          className={cn(
            "flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border px-2.5 py-2",
            isNight
              ? "border-night-line bg-night-raised/60"
              : "border-paper-line bg-paper-raised/60",
          )}
        >
          <ol className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {points.map((p, i) => {
              const isCurrent = i === index;
              const isPast = i < index;
              return (
                <li key={p.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-current={isCurrent ? "true" : undefined}
                    title={p.title}
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors duration-200",
                      isCurrent
                        ? isNight
                          ? "bg-gold-300/12 text-night-text"
                          : "bg-gold-100 text-ink"
                        : isNight
                          ? "text-night-muted hover:bg-night-raised hover:text-night-text"
                          : "text-ink-muted hover:bg-paper-raised hover:text-ink",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "block h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200",
                        isCurrent
                          ? isNight
                            ? "scale-125 bg-gold-300"
                            : "scale-125 bg-gold-500"
                          : isPast
                            ? isNight
                              ? "bg-gold-300/40"
                              : "bg-gold-400/50"
                            : isNight
                              ? "bg-night-muted/40"
                              : "bg-ink/20",
                      )}
                    />
                    <span className="truncate type-micro font-semibold">
                      {p.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Where to go next, said once and quietly. */}
          {next ? (
            <p
              className={cn(
                "flex shrink-0 items-center gap-1 type-micro",
                isNight ? "text-night-muted" : "text-ink-faint",
              )}
            >
              <span>التالي</span>
              <ChevronLeft className="size-3 shrink-0" aria-hidden />
              <span
                className={cn(
                  "max-w-[9rem] truncate font-semibold",
                  isNight ? "text-gold-300" : "text-gold-600",
                )}
              >
                {next.title}
              </span>
            </p>
          ) : (
            <p
              className={cn(
                "shrink-0 type-micro",
                isNight ? "text-night-muted" : "text-ink-faint",
              )}
            >
              آخر النقاط
            </p>
          )}
        </nav>
      ) : null}
    </div>
  );
}

const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];
