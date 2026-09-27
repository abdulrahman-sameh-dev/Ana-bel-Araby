"use client";

import {
  Expand,
  Minimize,
  StickyNote,
  Keyboard,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/format";
import { sections } from "@/data/presentation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * The on-screen control cluster.
 *
 * Kept in the quiet corner and revealed a little more strongly on hover, so it
 * is available to whoever is driving but never competes with the stage.
 */
export function PresentationControls({
  isFullscreen,
  onToggleFullscreen,
  notesOpen,
  onToggleNotes,
  onShowShortcuts,
  tone = "ink",
  className,
}: {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  notesOpen: boolean;
  onToggleNotes: () => void;
  onShowShortcuts: () => void;
  tone?: "ink" | "night";
  className?: string;
}) {
  const controlClass = cn(
    "size-8 rounded-full border shadow-lift transition-colors duration-200",
    tone === "night"
      ? "border-night-line bg-night-raised/80 text-night-muted hover:border-gold-300/50 hover:bg-night-raised hover:text-night-text"
      : "border-paper-line bg-paper-raised/80 text-ink-muted hover:border-gold-400/60 hover:bg-gold-100/70 hover:text-ink",
  );

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={cn(controlClass, notesOpen && tone === "night" && "border-gold-300/50 text-gold-300")}
              onClick={onToggleNotes}
              aria-pressed={notesOpen}
              aria-label="ملاحظات المتحدث"
            />
          }
        >
          <StickyNote className="size-3.5" aria-hidden />
        </TooltipTrigger>
        <TooltipContent side="bottom">ملاحظات المتحدث · N</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={controlClass}
              onClick={onToggleFullscreen}
              aria-pressed={isFullscreen}
              aria-label={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
            />
          }
        >
          {isFullscreen ? (
            <Minimize className="size-3.5" aria-hidden />
          ) : (
            <Expand className="size-3.5" aria-hidden />
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">ملء الشاشة · F</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={cn(controlClass, "hidden sm:inline-flex")}
              onClick={onShowShortcuts}
              aria-label="اختصارات لوحة المفاتيح"
            />
          }
        >
          <Keyboard className="size-3.5" aria-hidden />
        </TooltipTrigger>
        <TooltipContent side="bottom">اختصارات لوحة المفاتيح</TooltipContent>
      </Tooltip>
    </div>
  );
}

/** Shortcut sheet. Opens on demand; never blocks the stage by default. */
export function ShortcutSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const rows: [string, string][] = [
    ["←", "القسم التالي"],
    ["→", "القسم السابق"],
    ["↑  ↓", "التنقل داخل المحاور التفاعلية"],
    ["مسافة", "إيقاف المؤقت / استئنافه"],
    ["F", "ملء الشاشة"],
    ["N", "ملاحظات المتحدث"],
    [`1 – ${toArabicDigits(sections.length)}`, "الانتقال المباشر إلى قسم"],
    ["?", "هذه القائمة"],
    ["Esc", "إغلاق الطبقات أو الخروج من ملء الشاشة"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-6 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="اختصارات لوحة المفاتيح"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-paper-line bg-paper-raised p-5 shadow-deep"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="stage-title type-body-lg flex items-center gap-2">
            <HelpCircle className="size-4 text-gold-500" aria-hidden />
            الاختصارات
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[0.7rem] text-ink-muted hover:text-ink"
          >
            إغلاق
          </button>
        </div>
        <dl className="space-y-2">
          {rows.map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 border-b border-paper-line/70 pb-2 last:border-0"
            >
              <dt>
                <kbd className="rounded border border-paper-line bg-paper-sunk px-1.5 py-0.5 font-latin text-[0.7rem] font-semibold">
                  {key}
                </kbd>
              </dt>
              <dd className="type-body-sm text-ink-soft">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
