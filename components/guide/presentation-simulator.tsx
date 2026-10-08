"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  HelpCircle,
  Keyboard,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  StickyNote,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatClock, toArabicDigits } from "@/lib/format";
import {
  behindTask,
  closing,
  presentation,
  SECTION_DURATION_SECONDS,
  sections,
  teamCredits,
  type Section,
} from "@/data/presentation";
import { pointsFor, type PresentationPoint } from "@/data/points";
import { handoffFor, openingChallenge } from "@/data/handoff";

import { ShortcutKey } from "./shortcut-key";

type SimStage =
  | { key: string; kind: "cover"; label: string }
  | { key: string; kind: "opening"; label: string }
  | {
      key: string;
      kind: "section";
      label: string;
      section: Section;
      points: PresentationPoint[];
    }
  | { key: string; kind: "behind"; label: string }
  | { key: string; kind: "ghaith"; label: string }
  | { key: string; kind: "closing"; label: string };

const SIM_STAGES: SimStage[] = [
  { key: "cover", kind: "cover", label: "الغلاف" },
  { key: "opening", kind: "opening", label: "سؤال الافتتاح" },
  ...sections.map<SimStage>((section) => ({
    key: section.id,
    kind: "section",
    label: `${section.numeral} · ${section.shortTitle}`,
    section,
    points: pointsFor(section.id),
  })),
  { key: "behind", kind: "behind", label: behindTask.title },
  { key: "ghaith", kind: "ghaith", label: "فريق غيث" },
  { key: "closing", kind: "closing", label: "الخلاصة" },
];

const STAGE_OFFSET = SIM_STAGES.findIndex((s) => s.kind === "section");
const OPENING_STEPS = 3;

type GuidedStep = {
  title: string;
  hint: string;
  keys: string[];
  ensureSection?: boolean;
};

const GUIDED_STEPS: GuidedStep[] = [
  {
    title: "النقطة التالية",
    hint: "اضغط ← للانتقال إلى النقطة التالية. في العربية يتقدّم العرض بالسهم الأيسر.",
    keys: ["ArrowLeft", "PageDown"],
  },
  {
    title: "النقطة السابقة",
    hint: "اضغط → للرجوع خطوة إلى الوراء.",
    keys: ["ArrowRight", "PageUp"],
  },
  {
    title: "مؤقّت المحور",
    hint: "اضغط مسافة لإيقاف مؤقّت المحور أو تشغيله.",
    keys: ["Space"],
    ensureSection: true,
  },
  {
    title: "ملء الشاشة",
    hint: "اضغط F لعرض الشرائح على كامل الشاشة.",
    keys: ["f", "F", "ب"],
  },
  {
    title: "ملاحظات المتحدث",
    hint: "اضغط N لإظهار ملاحظاتك ومؤقّت المحور على الشاشة.",
    keys: ["n", "N", "ن"],
  },
  {
    title: "إغلاق الطبقات",
    hint: "اضغط Esc لإغلاق الملاحظات أو أي نافذة مفتوحة.",
    keys: ["Escape"],
  },
  {
    title: "قائمة الاختصارات",
    hint: "اضغط ? لفتح قائمة الاختصارات في أي وقت.",
    keys: ["?"],
  },
];

const KEYPAD: { key: string; glyph: string; label: string }[] = [
  { key: "ArrowLeft", glyph: "←", label: "التالي" },
  { key: "ArrowRight", glyph: "→", label: "السابق" },
  { key: "Space", glyph: "مسافة", label: "المؤقّت" },
  { key: "f", glyph: "F", label: "ملء الشاشة" },
  { key: "n", glyph: "N", label: "ملاحظات" },
  { key: "?", glyph: "?", label: "الاختصارات" },
  { key: "Escape", glyph: "Esc", label: "إغلاق" },
];

const SHORTCUT_ROWS: [string, string][] = [
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

export function PresentationSimulator() {
  const frameRef = useRef<HTMLDivElement>(null);
  const flashTimer = useRef<number | null>(null);

  const [stageIndex, setStageIndex] = useState(0);
  const [pointIndex, setPointIndex] = useState(0);
  const [handoffVisible, setHandoffVisible] = useState(false);
  const [openingStep, setOpeningStep] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [backup, setBackup] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [armed, setArmed] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [status, setStatus] = useState(
    "المحاكي جاهز — انقر على النافذة ثم استخدم لوحة المفاتيح.",
  );
  const [guided, setGuided] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);

  const stage = SIM_STAGES[stageIndex];
  const isSection = stage.kind === "section";
  const section = stage.kind === "section" ? stage.section : null;
  const points = stage.kind === "section" ? stage.points : [];
  const point =
    points.length > 0 ? points[Math.min(pointIndex, points.length - 1)] : null;
  const hasHandoff = stage.kind === "section" && handoffFor(stage.section.id) !== null;
  const handoff = stage.kind === "section" ? handoffFor(stage.section.id) : null;

  const expectedKeys =
    guided && guidedStep < GUIDED_STEPS.length ? GUIDED_STEPS[guidedStep].keys : [];

  useEffect(() => {
    setPointIndex(0);
    setHandoffVisible(false);
    setOpeningStep(0);
    setShortcutsOpen(false);
  }, [stageIndex]);

  useEffect(() => {
    if (stage.kind !== "section") {
      setElapsed(0);
      setRunning(false);
      return;
    }
    setElapsed(0);
    setRunning(true);
  }, [stage.key, stage.kind]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!guided) return;
    if (GUIDED_STEPS[guidedStep]?.ensureSection && !isSection) {
      setStageIndex(STAGE_OFFSET);
    }
  }, [guided, guidedStep, isSection]);

  const flashKey = useCallback((key: string) => {
    setFlash(key);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 260);
  }, []);

  const goNext = useCallback(
    () => setStageIndex((i) => Math.min(SIM_STAGES.length - 1, i + 1)),
    [],
  );
  const goPrev = useCallback(() => setStageIndex((i) => Math.max(0, i - 1)), []);

  const advance = useCallback(() => {
    if (stage.kind === "opening") {
      if (openingStep < OPENING_STEPS - 1) setOpeningStep((s) => s + 1);
      else goNext();
      return;
    }
    if (stage.kind === "section") {
      if (handoffVisible) {
        goNext();
        return;
      }
      if (stage.points.length > 0 && pointIndex < stage.points.length - 1) {
        setPointIndex((i) => i + 1);
        return;
      }
      if (hasHandoff) {
        setHandoffVisible(true);
        return;
      }
    }
    goNext();
  }, [stage, openingStep, handoffVisible, pointIndex, hasHandoff, goNext]);

  const retreat = useCallback(() => {
    if (stage.kind === "opening" && openingStep > 0) {
      setOpeningStep((s) => s - 1);
      return;
    }
    if (stage.kind === "section") {
      if (handoffVisible) {
        setHandoffVisible(false);
        return;
      }
      if (pointIndex > 0) {
        setPointIndex((i) => i - 1);
        return;
      }
    }
    goPrev();
  }, [stage, openingStep, handoffVisible, pointIndex, goPrev]);

  const jump = useCallback((chapter: number) => {
    if (chapter < 0 || chapter >= sections.length) return;
    setStageIndex(chapter + STAGE_OFFSET);
  }, []);

  const runKey = useCallback(
    (key: string) => {
      flashKey(key);
      switch (key) {
        case "ArrowLeft":
        case "PageDown":
          advance();
          setStatus("انتقال إلى النقطة التالية");
          break;
        case "ArrowRight":
        case "PageUp":
          retreat();
          setStatus("رجوع إلى النقطة السابقة");
          break;
        case "Space":
          if (stage.kind === "cover" || stage.kind === "opening") {
            advance();
            setStatus("انتقال للأمام");
            break;
          }
          if (stage.kind === "section") {
            setRunning((r) => !r);
            setStatus(running ? "إيقاف مؤقّت المحور" : "تشغيل مؤقّت المحور");
          }
          break;
        case "f":
        case "F":
        case "ب":
          setFullscreen((v) => !v);
          setStatus("تبديل ملء الشاشة");
          break;
        case "n":
        case "N":
        case "ن":
          setNotesOpen((v) => !v);
          setStatus("تبديل ملاحظات المتحدث");
          break;
        case "?":
          setShortcutsOpen((v) => !v);
          setStatus("تبديل قائمة الاختصارات");
          break;
        case "Escape":
          if (shortcutsOpen) {
            setShortcutsOpen(false);
            setStatus("أُغلقت قائمة الاختصارات");
          } else if (notesOpen) {
            setNotesOpen(false);
            setStatus("أُغلقت الملاحظات");
          } else if (fullscreen) {
            setFullscreen(false);
            setStatus("خروج من ملء الشاشة");
          }
          break;
        default:
          if (/^[1-9]$/.test(key)) {
            const target = Number(key) - 1;
            if (target < sections.length) {
              jump(target);
              setStatus(`انتقال مباشر إلى المحور ${toArabicDigits(target + 1)}`);
            }
          }
      }
      if (guided) {
        const step = GUIDED_STEPS[guidedStep];
        if (step && step.keys.includes(key)) {
          setGuidedStep((s) => Math.min(s + 1, GUIDED_STEPS.length));
        }
      }
    },
    [
      advance,
      retreat,
      flashKey,
      jump,
      guided,
      guidedStep,
      notesOpen,
      shortcutsOpen,
      fullscreen,
      stage.kind,
      running,
    ],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const inTextEntry =
      !!target &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if (event.metaKey || event.ctrlKey || event.altKey || inTextEntry) return;

    const key = event.key;
    if (key === "ArrowUp" || key === "ArrowDown") return;

    if (key === " " || key === "Spacebar" || event.code === "Space") {
      event.preventDefault();
      runKey("Space");
      return;
    }

    const known =
      ["ArrowLeft", "ArrowRight", "PageDown", "PageUp", "Escape", "?"].includes(
        key,
      ) ||
      ["f", "F", "ب", "n", "N", "ن"].includes(key) ||
      /^[1-9]$/.test(key);
    if (!known) return;
    event.preventDefault();
    runKey(key);
  };

  const startGuided = () => {
    setStageIndex(0);
    setPointIndex(0);
    setHandoffVisible(false);
    setOpeningStep(0);
    setNotesOpen(false);
    setShortcutsOpen(false);
    setFullscreen(false);
    setGuidedStep(0);
    setGuided(true);
    setStatus("بدأ التدريب الموجّه — اضغط المفاتيح بالترتيب.");
    frameRef.current?.focus();
  };

  const reset = () => {
    setStageIndex(0);
    setPointIndex(0);
    setHandoffVisible(false);
    setOpeningStep(0);
    setNotesOpen(false);
    setShortcutsOpen(false);
    setFullscreen(false);
    setGuided(false);
    setGuidedStep(0);
    setStatus("أُعيد ضبط المحاكي.");
  };

  const remaining = Math.max(0, SECTION_DURATION_SECONDS - elapsed);
  const overrun = elapsed > SECTION_DURATION_SECONDS;
  const clock = formatClock(overrun ? elapsed : remaining);

  function renderScreen() {
    if (stage.kind === "cover") {
      return (
        <div className="text-center">
          <p className="kicker text-gold-300">{presentation.team}</p>
          <p className="stage-title type-display-sm mt-2 balance text-night-text">
            {presentation.title}
          </p>
          <p className="mt-1 type-body-sm text-night-muted">{presentation.subtitle}</p>
          <p className="mt-4 type-micro text-night-muted/70">
            اضغط مسافة أو ← للبدء
          </p>
        </div>
      );
    }
    if (stage.kind === "opening") {
      const step = Math.min(openingStep, OPENING_STEPS - 1);
      return (
        <div className="max-w-md text-center">
          {step === 0 ? (
            <>
              <p className="stage-title type-display-sm text-night-text">
                {openingChallenge.cardTitle}
              </p>
              <p className="mt-2 type-body-sm text-night-muted">
                {openingChallenge.cardLine}
              </p>
            </>
          ) : step === 1 ? (
            <p className="stage-title type-display-sm balance text-night-text">
              {openingChallenge.question}
            </p>
          ) : (
            <>
              <p className="type-body text-gold-100">{openingChallenge.takeaway}</p>
              <p className="mt-2 type-body-sm text-night-muted">
                {openingChallenge.connection}
              </p>
            </>
          )}
          <p className="tabular mt-4 type-micro text-gold-300">
            {toArabicDigits(step + 1)} من {toArabicDigits(OPENING_STEPS)}
          </p>
        </div>
      );
    }
    if (stage.kind === "section") {
      if (handoffVisible && handoff) {
        return (
          <div className="max-w-md text-center">
            <p className="kicker text-gold-300">تسليم المحور</p>
            <p className="mt-2 type-body text-night-text">{handoff.teaser}</p>
            <p className="mt-2 type-body-sm font-semibold text-gold-200">
              {handoff.line}
            </p>
          </div>
        );
      }
      if (point) {
        return (
          <div className="max-w-md text-center">
            <p className="kicker text-gold-300">
              {stage.section.numeral} · {stage.section.shortTitle}
            </p>
            <p className="stage-title type-display-sm mt-2 balance text-night-text">
              {point.title}
            </p>
            <p className="mt-1 type-body-sm text-night-muted">{point.headline}</p>
            <p className="tabular mt-3 type-micro text-gold-300">
              النقطة {point.index} من {toArabicDigits(points.length)}
            </p>
          </div>
        );
      }
    }
    if (stage.kind === "behind") {
      return (
        <div className="max-w-md text-center">
          <p className="kicker text-gold-300">{behindTask.kicker}</p>
          <p className="stage-title type-display-sm mt-2 text-night-text">
            {behindTask.title}
          </p>
          <p className="mt-2 type-body-sm text-night-muted">{behindTask.purpose}</p>
        </div>
      );
    }
    if (stage.kind === "ghaith") {
      return (
        <div className="max-w-md text-center">
          <p className="stage-title type-display-sm text-night-text">
            {teamCredits.headline}
          </p>
          <p className="mt-2 type-body-sm text-night-muted">{teamCredits.bridge}</p>
        </div>
      );
    }
    return (
      <div className="max-w-md text-center">
        <p className="stage-title type-display-sm balance text-night-text">
          {closing.question}
        </p>
        <p className="mt-2 type-body-sm text-night-muted">{closing.statement}</p>
      </div>
    );
  }

  function renderNotes() {
    if (!notesOpen) return null;
    return (
      <aside
        aria-label="ملاحظات المتحدث (محاكاة)"
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 z-20 max-h-[58%] overflow-y-auto border-t border-night-line bg-night-raised/95 p-4 backdrop-blur"
      >
        <div className="flex items-center justify-between">
          <p className="kicker text-gold-300">ملاحظات المتحدث</p>
          <button
            type="button"
            onClick={() => runKey("n")}
            className="type-micro text-night-muted hover:text-night-text"
          >
            إغلاق
          </button>
        </div>
        <p className="mt-1 type-body-sm font-bold text-night-text">{stage.label}</p>
        {point ? (
          <ol className="mt-2 space-y-1.5">
            {point.presenterNotes.map((cue, i) => (
              <li
                key={cue}
                className="flex items-start gap-2 type-body-sm leading-relaxed text-night-text"
              >
                <span className="tabular mt-0.5 shrink-0 font-bold text-gold-300/70" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{cue}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {section ? (
          <p className="mt-3 rounded-lg border border-gold-300/20 bg-gold-300/8 p-3 type-body-sm font-semibold text-night-text">
            {section.notes.anchor}
          </p>
        ) : (
          <p className="mt-3 type-body-sm text-night-muted">
            {stage.kind === "cover"
              ? "لا تتكلم هنا — اترك الغلاف يُرى، ثم انتقل."
              : "لا ملاحظات لهذه الشاشة؛ راجع ورقة المتحدث."}
          </p>
        )}
      </aside>
    );
  }

  function renderShortcutSheet() {
    if (!shortcutsOpen) return null;
    return (
      <div
        role="presentation"
        onClick={(e) => {
          e.stopPropagation();
          setShortcutsOpen(false);
        }}
        className="absolute inset-0 z-30 grid place-items-center bg-ink/50 p-4 backdrop-blur-[2px]"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="اختصارات لوحة المفاتيح"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xs rounded-xl border border-night-line bg-night-raised p-4 shadow-deep"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="stage-title type-body flex items-center gap-2 text-night-text">
              <HelpCircle className="size-4 text-gold-300" aria-hidden />
              الاختصارات
            </h3>
            <button
              type="button"
              onClick={() => runKey("Escape")}
              className="type-micro text-night-muted hover:text-night-text"
            >
              إغلاق
            </button>
          </div>
          <dl className="space-y-2">
            {SHORTCUT_ROWS.map(([k, label]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-4 border-b border-night-line/70 pb-2 last:border-0"
              >
                <dt>
                  <ShortcutKey>{k}</ShortcutKey>
                </dt>
                <dd className="type-micro text-night-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={frameRef}
        tabIndex={0}
        role="application"
        aria-label="محاكي التحكم بالعرض"
        onKeyDown={onKeyDown}
        onFocus={() => setArmed(true)}
        onBlur={() => setArmed(false)}
        onClick={() => frameRef.current?.focus()}
        className={cn(
          "relative flex flex-col overflow-hidden border bg-night shadow-deep outline-none transition-all duration-300",
          armed ? "border-gold-400/50 ring-2 ring-gold-400/25" : "border-night-line",
          fullscreen
            ? "fixed inset-0 z-50 rounded-none"
            : "min-h-[28rem] rounded-2xl",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-night-line/70 px-3 py-2">
          <p className="truncate type-micro font-bold text-night-text">
            غيث <span className="text-night-muted">— محاكاة العرض</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="ملاحظات المتحدث"
              aria-pressed={notesOpen}
              onClick={(e) => {
                e.stopPropagation();
                runKey("n");
              }}
              className={cn(
                "grid size-7 place-items-center rounded-full border transition-colors",
                notesOpen
                  ? "border-gold-300/50 text-gold-300"
                  : "border-night-line text-night-muted hover:text-night-text",
              )}
            >
              <StickyNote className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="ملء الشاشة"
              aria-pressed={fullscreen}
              onClick={(e) => {
                e.stopPropagation();
                runKey("f");
              }}
              className="grid size-7 place-items-center rounded-full border border-night-line text-night-muted transition-colors hover:text-night-text"
            >
              {fullscreen ? (
                <Minimize className="size-3.5" aria-hidden />
              ) : (
                <Expand className="size-3.5" aria-hidden />
              )}
            </button>
            <button
              type="button"
              aria-label="اختصارات لوحة المفاتيح"
              onClick={(e) => {
                e.stopPropagation();
                runKey("?");
              }}
              className="grid size-7 place-items-center rounded-full border border-night-line text-night-muted transition-colors hover:text-night-text"
            >
              <Keyboard className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative grid min-h-0 flex-1 place-items-center overflow-hidden px-4 py-6">
          {renderScreen()}

          {isSection && section ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBackup((v) => !v);
              }}
              aria-pressed={backup}
              className={cn(
                "absolute bottom-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 type-micro transition-colors",
                backup
                  ? "border-gold-300/50 bg-gold-300/10 text-gold-200"
                  : "border-night-line bg-night-raised/70 text-night-muted hover:text-night-text",
              )}
            >
              {backup
                ? `الاحتياطي: ${section.speakerBackup}`
                : `المتحدث: ${section.speaker}`}
            </button>
          ) : null}

          {renderNotes()}
          {renderShortcutSheet()}

          {fullscreen ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                runKey("f");
              }}
              className="absolute end-3 top-3 rounded-full border border-night-line bg-night-raised/80 px-3 py-1 type-micro text-night-muted hover:text-night-text"
            >
              خروج من ملء الشاشة · F
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-night-line/70 px-3 py-2">
          {isSection ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={running ? "إيقاف المؤقت مؤقتاً" : "استئناف المؤقت"}
                onClick={(e) => {
                  e.stopPropagation();
                  runKey("Space");
                }}
                className="grid size-6.5 place-items-center rounded-full bg-gold-300 text-night transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                {running ? (
                  <Pause className="size-3" aria-hidden />
                ) : (
                  <Play className="size-3 translate-x-px" aria-hidden />
                )}
              </button>
              <span
                className={cn(
                  "tabular min-w-[2.6rem] text-center type-body-sm font-bold",
                  overrun ? "text-destructive" : "text-night-text",
                )}
                dir="ltr"
              >
                {clock}
              </span>
              <button
                type="button"
                aria-label="تصفير المؤقت"
                onClick={(e) => {
                  e.stopPropagation();
                  setElapsed(0);
                }}
                className="grid size-6.5 place-items-center rounded-full text-night-muted transition-colors hover:text-night-text"
              >
                <RotateCcw className="size-3" aria-hidden />
              </button>
              {overrun ? (
                <span className="hidden type-micro font-semibold text-destructive sm:inline">
                  تجاوزت المدة
                </span>
              ) : null}
            </div>
          ) : (
            <span className="kicker truncate text-night-muted">{stage.label}</span>
          )}
          <span className="hidden type-micro text-night-muted/70 sm:block">
            {toArabicDigits(stageIndex + 1)} / {toArabicDigits(SIM_STAGES.length)}
          </span>
        </div>
      </div>

      <p aria-live="polite" className="type-micro text-night-muted">
        {status}
      </p>

      <div className="rounded-xl border border-night-line bg-night-raised/40 p-3">
        {guided ? (
          guidedStep < GUIDED_STEPS.length ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 type-micro font-semibold text-gold-200">
                  <Sparkles className="size-3.5" aria-hidden />
                  التدريب الموجّه · الخطوة {toArabicDigits(guidedStep + 1)} من{" "}
                  {toArabicDigits(GUIDED_STEPS.length)}: {GUIDED_STEPS[guidedStep].title}
                </p>
                <p className="mt-1 type-micro text-night-muted">
                  {GUIDED_STEPS[guidedStep].hint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGuided(false)}
                className="shrink-0 rounded-full border border-night-line px-3 py-1 type-micro text-night-muted hover:text-night-text"
              >
                إيقاف التدريب
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 type-micro font-semibold text-gold-200">
                <Sparkles className="size-3.5" aria-hidden />
                أكملت التدريب — أتقنت جميع المفاتيح.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startGuided}
                  className="rounded-full bg-gold-300 px-3 py-1 type-micro font-bold text-night hover:bg-gold-200"
                >
                  أعد التدريب
                </button>
                <button
                  type="button"
                  onClick={() => setGuided(false)}
                  className="rounded-full border border-night-line px-3 py-1 type-micro text-night-muted hover:text-night-text"
                >
                  إيقاف
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="type-micro text-night-muted">
              التقط المحاكي بيدك: انقر على النافذة أعلاه ثم اضغط المفاتيح. لا يتأثّر العرض
              الحقيقي بأيٍّ ممّا يحدث هنا.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startGuided}
                className="rounded-full bg-gold-300 px-3 py-1 type-micro font-bold text-night hover:bg-gold-200"
              >
                ابدأ التدريب الموجّه
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-night-line px-3 py-1 type-micro text-night-muted hover:text-night-text"
              >
                إعادة الضبط
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {KEYPAD.map((item) => {
            const isExpected = expectedKeys.includes(item.key);
            return (
              <button
                key={item.key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  runKey(item.key);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors",
                  isExpected
                    ? "border-gold-300 bg-gold-300/10"
                    : "border-night-line bg-night/60 hover:border-gold-300/40",
                )}
              >
                <ShortcutKey active={isExpected || flash === item.key}>
                  {item.glyph}
                </ShortcutKey>
                <span className="type-micro text-night-muted">{item.label}</span>
              </button>
            );
          })}
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                runKey(String(i + 1));
              }}
              className="flex items-center gap-2 rounded-lg border border-night-line bg-night/60 px-2.5 py-1.5 transition-colors hover:border-gold-300/40"
            >
              <ShortcutKey active={flash === String(i + 1)}>{s.numeral}</ShortcutKey>
              <span className="type-micro text-night-muted">{s.shortTitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
