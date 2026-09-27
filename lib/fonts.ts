/**
 * Self-hosted Arabic + Latin typefaces.
 *
 * The `.woff2` files live in `public/fonts` and are declared manually (rather
 * than through `next/font/google`) so the presentation builds without network
 * access. Each family is split into an `arabic` and a `latin` subset and paired
 * with the original Google Fonts `unicode-range` so the browser can mix Arabic
 * and Latin glyphs from the same family without a fallback flash.
 */

export const ARABIC_RANGE =
  "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC4, U+10EFC-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1";

export const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

/** Font families, each resolving Arabic + Latin from a single `font-family`. */
export const FONT_STACKS = {
  /** UI + body copy. Cairo: modern, highly legible Arabic grotesque. */
  sans: '"Cairo Arabic", "Cairo", system-ui, sans-serif',
  /** Display headings. Noto Kufi Arabic: geometric kufic, editorial weight. */
  display: '"Noto Kufi Arabic", "Cairo Arabic", system-ui, sans-serif',
  /** Naskh for the Qur'anic verse, poetry and pull-quotes. */
  serif: '"Amiri Arabic", "Amiri", "Times New Roman", serif',
  /** Latin-only surface for Romanised words (Aldebaran, Algebra, …). */
  latin: '"Inter Latin", "Inter", system-ui, sans-serif',
} as const;

/** Files preloaded in the document head (critical for first paint). */
export const CRITICAL_FONT_FILES = [
  "/fonts/cairo-arabic-normal-400_1000.woff2",
  "/fonts/kufi-arabic-normal-400_900.woff2",
  "/fonts/amiri-arabic-normal-400.woff2",
  "/fonts/inter-latin-normal-300_700.woff2",
] as const;
