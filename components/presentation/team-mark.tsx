"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The team's identity, as an image rather than a wordmark typed in the UI.
 *
 * `public/logo.jpeg` is the master and is never touched. This renders derived
 * crops of it:
 *
 * - `lockup` — the whole composition (emblem + غيث + GHAITH). Measured on the
 *   master: ink at y 87–701, x 436–971, i.e. 536×615, aspect 0.874.
 * - `emblem` — the circular botanical mark alone. Measured the same way:
 *   y 87–635, x 436–971, i.e. 536×549, aspect 0.977. Its width profile is
 *   219px at the top, 534px at the middle and 285px at the bottom, which is what
 *   confirms the mark is round rather than rectangular — worth knowing, because
 *   the night plate below is shaped around that.
 *
 * The two variants differ in *scale*, not in design: nothing here redraws or
 * reinterprets the artwork.
 *
 * ## Why `*-tight.png` rather than the older baked-background crops
 *
 * The first pass at these derived files kept the parchment ground as pixels. On
 * a parchment stage that read fine, but it is a pasted cream rectangle on any
 * other ground, and it left ~31% dead margin on each side of the master, so the
 * emblem had to be displayed larger than its artwork to look its size. The
 * `-tight` files are cut from the master at the measured ink bounds with a soft
 * matte instead of a background, so the ground shows through and the mark is
 * displayed at its true size. They are still crops of the same pixels.
 */
export function TeamMark({
  variant = "emblem",
  className,
  transparent = false,
  priority = false,
  tone = "ink",
}: {
  variant?: "lockup" | "emblem";
  className?: string;
  /**
   * Retained for call-site compatibility. Both branches now resolve to a
   * matte-cut asset, so this no longer selects between two files — it is kept
   * rather than removed because it documents intent at the call sites that
   * would otherwise have nothing to say about the ground.
   */
  transparent?: boolean;
  priority?: boolean;
  /**
   * The ground this mark sits on.
   *
   * The artwork is a deep teal printed on parchment, so on the deck's night
   * stage it has to be knocked back to a light-on-dark plate. Without this the
   * emblem renders as an unreadable dark blob against `bg-night` — which is the
   * stage technology sits on. The plate is a circle, matching the emblem's own
   * measured roundness, so nothing about the artwork is cropped or overlaid.
   */
  tone?: "ink" | "night";
}) {
  const src =
    variant === "lockup" ? "/media/logo/lockup-tight.png" : "/media/logo/emblem-tight.png";

  const width = variant === "lockup" ? 512 : 512;
  const height = variant === "lockup" ? 586 : 524;

  if (tone === "night") {
    /*
     * The plate is a rounded square that hugs the artwork, NOT a circle.
     *
     * The mark is round-ish (536×549), which made `rounded-full` look like the
     * obvious choice — and it is measurably wrong. The emblem's own width
     * profile is 219px at the top, 534px across the middle and 285px at the
     * bottom, so its widest point sits at mid-height and it falls away sharply
     * above and below. An inscribed circle in the same box is only ~384px wide
     * where the artwork is 516px, so `rounded-full` was shaving off the mark's
     * shoulders at 65% of its height. A plate that matches the artwork's own
     * bounding box keeps every stroke.
     */
    return (
      <span
        style={{ aspectRatio: `${width} / ${height}` }}
        className={cn(
          "inline-block w-auto shrink-0 overflow-hidden rounded-lg bg-paper-raised",
          className,
        )}
      >
        <Image
          src={src}
          alt="شعار فريق غيث"
          width={width}
          height={height}
          priority={priority}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  /*
   * Sizing is the caller's, via `className`; keeping the artwork's proportions
   * is this component's job, and that turned out to need two mechanisms
   * because the call sites size differently:
   *
   * - the header and the handout pass `size-*`, which sets width *and* height;
   * - the cover, closing, and team slides pass only `h-[…]`.
   *
   * For the second shape the width has to be derived, which is what `w-auto`
   * plus `aspect-ratio` does. For the first, `w-auto` is inert because the
   * width is already specified.
   *
   * `object-contain` on the inner image is what makes this safe rather than
   * merely conventional: whichever way the two sizing shapes resolve, the mark
   * letterboxes instead of stretching. An earlier version put the `width` and
   * `height` attributes on the `<img>` itself, which quietly defeated the
   * `aspect-ratio` (presentational attribute hints count as specified
   * dimensions) and rendered the cover lockup at 610×66 — a 9.2:1 squash of a
   * 610×710 plate. The intrinsic size now lives on the wrapper instead, where
   * it describes the box rather than overriding it.
   */
  return (
    <span
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn("inline-block w-auto overflow-hidden align-middle", className)}
    >
      <Image
        src={src}
        alt="شعار فريق غيث"
        width={width}
        height={height}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
