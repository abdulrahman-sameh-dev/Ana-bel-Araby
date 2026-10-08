"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";

const ITEMS = [
  "وصّل اللابتوب بالبروجكتور، وافتح الصفحة الرئيسية.",
  "تأكّد من الإضاءة والصوت قبل أن يدخل الحضور.",
  "اضغط F لتملأ الشاشة قبل البدء.",
  "أبلغ المتحدث الأول: ← التالي، → السابق.",
  "افتح N وتأكّد من ظهور ملاحظاتك ومؤقّت المحور.",
  "جرّب ? الآن — لا تنتظر حتى تنساها على المنصة.",
  "افتح /presenter على هاتفك كمرجع أثناء العرض.",
  "تأكّد أن من سيحلّ عند الحاجة (أ. ولاء) موجود.",
];

export function PrePresentationChecklist() {
  const [done, setDone] = useState<boolean[]>(() => ITEMS.map(() => false));
  const count = done.filter(Boolean).length;

  const toggle = (i: number) =>
    setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="rounded-xl border border-night-line bg-night-raised/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="type-micro text-night-muted">جاهزية البدء</p>
        <p className="tabular type-micro font-semibold text-gold-200" dir="rtl">
          {toArabicDigits(count)} / {toArabicDigits(ITEMS.length)}
        </p>
      </div>
      <ul className="mt-3 space-y-1.5">
        {ITEMS.map((item, i) => {
          const isDone = done[i];
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isDone}
                className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-night/50"
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded border transition-colors",
                    isDone
                      ? "border-gold-300 bg-gold-300 text-night"
                      : "border-night-line text-transparent",
                  )}
                >
                  <Check className="size-3" aria-hidden />
                </span>
                <span
                  className={cn(
                    "type-body-sm leading-relaxed",
                    isDone ? "text-night-muted line-through" : "text-night-text",
                  )}
                >
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
