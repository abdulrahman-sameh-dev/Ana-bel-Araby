/** Arabic-Indic digits, used everywhere a number is shown on stage. */
const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** `90` → `"٠١:٣٠"`. Latin digits are kept for the clock — they scan faster. */
export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** `1` → `"٠١"`, for chapter numerals. */
export function toArabicDigits(value: number | string) {
  return String(value).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/** `"01:30"` → `"١:٣٠"` for the fully-Arabic duration chip. */
export function clockToArabicDigits(clock: string) {
  return toArabicDigits(clock);
}
