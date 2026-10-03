/**
 * Read-only helpers that turn a point's data into the two things a speaker
 * needs but cannot infer while holding a phone in one hand: what the room is
 * actually looking at, and who walks on next.
 *
 * These live apart from `/presenter` so the description of a visual is written
 * once, next to the union that defines it. Adding a ninth variant to
 * `PointVisual` without a line here is what would let the handout drift out of
 * step with the stage, so the switch below is deliberately exhaustive.
 */

import type { PointVisual, PresentationPoint } from "@/data/points";
import { toArabicDigits } from "@/lib/format";

/**
 * What the audience sees for this visual, in words.
 *
 * `onScreen` on the point already covers *what* is on stage. This covers *how
 * it is drawn* — that a term is a typographic specimen with a Latin line under
 * it, that the loanwords are four cards rather than a list. Knowing "a verse is
 * shown" is not the same as knowing it is set large with nothing else on the
 * screen; that difference is exactly what stops a speaker narrating the slide.
 */
export function describePointVisual(visual: PointVisual): string {
  switch (visual.kind) {
    case "verse":
      return "الآية وحدها على الشاشة، بخط كبير، ونسبتها تحتها. لا شيء بجانبها.";
    case "saying":
      return "المقولة في بطاقة داكنة واحدة، بخط واضح، واسم المتحدث أسفلها.";
    case "artwork":
      return "لوحة الفريق كاملة وبلا قصّ، هي العنصر الوحيد على الشاشة.";
    case "term":
      return visual.latin
        ? `الكلمة «${visual.text}» بحجم كبير، وتحتها اللاتينية «${visual.latin}».`
        : `الكلمة «${visual.text}» بحجم كبير، وحدها.`;
    case "loanwords":
      return `${toArabicCount(visual.words.length)} كلمات في بطاقات، كل بطاقة فيها الكلمة ومعناها، من اليمين إلى اليسار.`;
    case "articulation":
      return "رسم مبسّط لمواضع النطق، الحروف مجموعة حول الفم، والنقطة الحالية مُبرَزة.";
    case "beats":
      return `${toArabicCount(visual.items.length)} بنود، كل بند في سطر مستقل، والباقي صامت.`;
    case "evidence":
      return `${toArabicCount(visual.pairs)} أزواج لقطات، كل زوج قبل وبعد للحساب نفسه، والنقر على أي لقطة يكبّرها. ${visual.note}`;
  }
}

/** How long this point runs, said the way the header says it. */
export function spokenDuration(seconds: number): string {
  // Arabic-Indic digits, because this string sits next to point numbers that
  // are already Arabic-Indic. Mixing `15` into a deck of `١٥` reads as a bug to
  // the audience reading over a shoulder, and to the team proofreading.
  if (seconds < 60) return `نحو ${toArabicDigits(seconds)} ثانية`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s
    ? `${toArabicDigits(m)} دقيقة و${toArabicDigits(s)} ثانية`
    : `${toArabicDigits(m)} دقيقة`;
}

/** The words the point cannot be said without. Never empty. */
export function emphasisOf(point: PresentationPoint): string[] {
  return point.emphasis.length ? point.emphasis : [point.title];
}

function toArabicCount(n: number): string {
  const table = ["صفر", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
  return n <= 10 ? table[n] : String(n);
}
