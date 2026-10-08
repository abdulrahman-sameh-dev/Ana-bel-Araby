import Link from "next/link";
import {
  BookOpen,
  Compass,
  FileText,
  Gauge,
  Keyboard,
  ListChecks,
  MonitorPlay,
  ScrollText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { presentation, sections } from "@/data/presentation";
import { toArabicDigits } from "@/lib/format";
import { TeamMark } from "@/components/presentation/team-mark";

import { GuideSection } from "./guide-section";
import { ShortcutKey } from "./shortcut-key";
import { PresentationSimulator } from "./presentation-simulator";
import { PrePresentationChecklist } from "./pre-presentation-checklist";

const ANCHORS = [
  { id: "overview", label: "نظرة سريعة" },
  { id: "pages", label: "الصفحات" },
  { id: "how", label: "كيف يعمل العرض" },
  { id: "simulator", label: "المحاكي" },
  { id: "shortcuts", label: "الاختصارات" },
  { id: "checklist", label: "قبل البدء" },
  { id: "emergency", label: "الطوارئ" },
];

const OVERVIEW = [
  "افتح الصفحة الرئيسية على جهاز العرض، واضغط F لملء الشاشة.",
  "قدّم الشرائح بالنقطة: ← للتالي، → للسابق، ومسافة لإيقاف مؤقّت محورك.",
  "افتح N لترى ملاحظاتك ومؤقّتك، و? لقائمة الاختصارات.",
  "استخدم /presenter للتحضير، و/script للنص الكامل لكل متحدث.",
];

const PAGES = [
  {
    href: "/",
    icon: MonitorPlay,
    name: "العرض",
    path: "/",
    what: "الشاشة التي يراها الحضور على البروجكتور.",
    when: "على المنصة؛ تُفتح على الغلاف ثم تتقدّم بالنقاط.",
  },
  {
    href: "/presenter",
    icon: ScrollText,
    name: "ورقة المتحدث",
    path: "/presenter",
    what: "مرجع تحضيري على الهاتف لكل نقطة: ما تقوله وما يراه الحضور.",
    when: "قبل الصعود للمراجعة، وأثناء العرض لتدوين ملاحظتك.",
  },
  {
    href: "/handout",
    icon: FileText,
    name: "الهانداوت",
    path: "/handout",
    what: "ملخّص سريع لكل محور في صفحة واحدة.",
    when: "للطباعة أو المراجعة اللحظية.",
  },
  {
    href: "/script/batool",
    icon: BookOpen,
    name: "سكربت المتحدثين",
    path: "/script/{المتحدث}",
    what: "النص الكامل لكل من بتول وولاء وحنين وأنور، لكل واحد رابط خاص.",
    when: "للتدرّب وضبط الكلمات قبل العرض.",
  },
  {
    href: "/guide",
    icon: Compass,
    name: "دليل العرض",
    path: "/guide",
    what: "هذه الصفحة: التدريب على التحكم، الاختصارات، والطوارئ.",
    when: "قبل العرض للتدرّب، وعند الحاجة لمرجع سريع.",
  },
];

const FLOW = [
  {
    title: "الغلاف",
    body: "أول ما يراه الحضور. لا كلام هنا — اتركه ثوانٍ ثم تقدّم بـ ←.",
  },
  {
    title: "سؤال الافتتاح",
    body: "ثلاث شاشات: البطاقة، ثم السؤال، ثم الجواب. كل ضغطة ← تكشف شاشة واحدة.",
  },
  {
    title: `المحاور الأربعة`,
    body: "يتقدّم كل محور نقطة نقطة بـ ←. بعد آخر نقطة تظهر شاشة تسليم، ثم يبدأ المتحدث التالي.",
  },
  {
    title: "ما وراء العرض",
    body: "شاشة الأدلة — يمرّ عليها المتحدث بوتيرته الخاصة، بلا مؤقّت.",
  },
  {
    title: "فريق غيث",
    body: "شاشة الأسماء والفضل، ثم الانتقال إلى الخلاصة.",
  },
  {
    title: "الخلاصة",
    body: "الجملة الختامية، ثم السؤال، ثم الشكر — بهذا الترتيب.",
  },
];

const SHORTCUTS: { keys: string[]; label: string; note?: string }[] = [
  { keys: ["←", "PageDown"], label: "النقطة أو المحور التالي", note: "في العربية يتقدّم العرض بالسهم الأيسر." },
  { keys: ["→", "PageUp"], label: "النقطة أو المحور السابق" },
  {
    keys: ["↑", "↓"],
    label: "التنقل بين عناصر الشريحة التفاعلية",
    note: "مثل نجم الدبران والكلمات الأربع.",
  },
  {
    keys: ["مسافة"],
    label: "على الغلاف والافتتاح: تقدّم",
    note: "على المحور: إيقاف مؤقّت المحور أو تشغيله.",
  },
  { keys: ["F", "ب"], label: "ملء الشاشة" },
  { keys: ["N", "ن"], label: "ملاحظات المتحدث: تُظهر ملاحظاتك ومؤقّت المحور على الشاشة" },
  { keys: ["1", "–", "٤"], label: "الانتقال المباشر إلى محور" },
  { keys: ["?"], label: "قائمة الاختصارات" },
  {
    keys: ["Esc"],
    label: "إغلاق الطبقات المفتوحة",
    note: "الخروج من ملء الشاشة يتولّاه متصفحك.",
  },
];

const EMERGENCY = [
  {
    icon: ScrollText,
    title: "تعذّر على متحدث الحضور",
    body: "على شاشة المحور، اضغط زر «تسليم التقديم إلى …» ليتبدّل الاسم إلى الاحتياطي أ. ولاء حتى يعود. هذا الزر على الشاشة، وليس اختصاراً من لوحة المفاتيح.",
  },
  {
    icon: Gauge,
    title: "تجاوز مؤقّت المحور",
    body: "اضغط مسافة لإيقافه، ثم زر التصفير بجانب الساعة ليبدأ المحور التالي من جديد.",
  },
  {
    icon: Keyboard,
    title: "خرجت من ملء الشاشة أو نسيت مفتاحاً",
    body: "اضغط F للعودة إلى ملء الشاشة، و? لعرض قائمة الاختصارات في أي وقت.",
  },
  {
    icon: Sparkles,
    title: "تحتاج تخطّي محور أو الرجوع إليه",
    body: "اضغط ١ إلى ٤ للانتقال المباشر إلى المحور المطلوب، أو ← و → للتحرّك نقطة نقطة.",
  },
  {
    icon: ShieldAlert,
    title: "ظهرت نافذة صورة أو طبقة",
    body: "اضغط Esc لإغلاقها. أسهم التنقّل لا تعمل والنافذة مفتوحة، فذاك مقصود.",
  },
];

export function PresentationGuidePage() {
  return (
    <main className="min-h-dvh bg-night text-night-text">
      <header className="sticky top-0 z-20 border-b border-night-line bg-night/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <TeamMark variant="emblem" className="size-9 shrink-0" priority />
          <div className="min-w-0 flex-1">
            <p className="kicker text-gold-300">دليل العرض</p>
            <p className="truncate type-body-sm font-bold text-night-text">
              {presentation.title} · {presentation.team}
            </p>
          </div>
          <Link
            href="/"
            className="flex min-h-10 shrink-0 items-center rounded-full border border-night-line px-3.5 type-micro font-semibold text-night-muted transition-colors hover:border-gold-300/50 hover:text-night-text"
          >
            العرض
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-8">
        <section className="space-y-4">
          <p className="kicker text-gold-300">غيث · {presentation.date}</p>
          <h1 className="stage-title type-display-sm max-w-2xl balance text-night-text">
            كيف تقود هذا العرض
          </h1>
          <p className="max-w-prose type-body leading-relaxed text-night-muted">
            صفحة واحدة تجمع ما تحتاجه قبل أن تقف على المنصة وبعدها: ما هي الصفحات، كيف
            تنتقل بين الشرائح، وكيف تتصرّف إذا حدث أمر غير متوقّع. تدرّب على المحاكي
            هنا — لا شيء ممّا تفعله فيه يمسّ العرض الحقيقي.
          </p>
          <nav aria-label="أقسام الدليل" className="flex flex-wrap gap-1.5">
            {ANCHORS.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="rounded-full border border-night-line px-3 py-1.5 type-micro font-semibold text-night-muted transition-colors hover:border-gold-300/50 hover:text-night-text"
              >
                {a.label}
              </a>
            ))}
          </nav>
        </section>

        <GuideSection
          id="overview"
          index="أ"
          title="نظرة سريعة"
          lead="إن لم تقرأ شيئاً آخر، فاقرأ هذه الأربع خطوات."
        >
          <ol className="space-y-2.5">
            {OVERVIEW.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  className="tabular mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-gold-300/40 type-micro font-bold text-gold-200"
                  dir="ltr"
                >
                  {toArabicDigits(i + 1)}
                </span>
                <span className="type-body-sm leading-relaxed text-night-text">{step}</span>
              </li>
            ))}
          </ol>
        </GuideSection>

        <GuideSection
          id="pages"
          index="ب"
          title="الصفحات الموجودة"
          lead="خمس صفحات، لكلٍّ وظيفة مختلفة. لا تفتح ورقة المتحدث أمام الحضور، ولا تدخل العرض من السكربت."
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {PAGES.map((page) => {
              const Icon = page.icon;
              const isSelf = page.href === "/guide";
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={isSelf ? "page" : undefined}
                    className="flex h-full flex-col gap-2 rounded-xl border border-night-line bg-night-raised/40 p-4 transition-colors hover:border-gold-300/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-night-line bg-night text-gold-300">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="font-display type-body-sm font-bold text-night-text">
                        {page.name}
                      </span>
                      <span
                        dir="ltr"
                        className="ms-auto font-latin type-micro text-night-muted/70"
                      >
                        {page.path}
                      </span>
                    </div>
                    <p className="type-body-sm leading-relaxed text-night-text">{page.what}</p>
                    <p className="mt-auto type-micro leading-relaxed text-night-muted">
                      {page.when}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </GuideSection>

        <GuideSection
          id="how"
          index="ج"
          title="كيف يعمل العرض"
          lead="العرض شاشة واحدة تتغيّر بالنقاط، لا ملف شرائح تصفحه. هذا هو الترتيب من أول شاشة إلى آخرها."
        >
          <ol className="space-y-3">
            {FLOW.map((stage, i) => (
              <li
                key={stage.title}
                className="flex gap-3 rounded-xl border border-night-line bg-night-raised/40 p-4"
              >
                <span
                  className="tabular mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-gold-300/12 type-micro font-bold text-gold-200"
                  dir="ltr"
                >
                  {toArabicDigits(i + 1)}
                </span>
                <div className="min-w-0">
                  <p className="font-display type-body-sm font-bold text-night-text">
                    {stage.title}
                  </p>
                  <p className="mt-1 type-body-sm leading-relaxed text-night-muted">
                    {stage.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 type-micro leading-relaxed text-night-muted">
            عدد المحاور {toArabicDigits(sections.length)}، وكل محور له متحدثه الأساسي
            واحتياطيه. إذا تغيّر المتحدث، يتغيّر الاسم على الشاشة دون أن تتغيّر الشرائح.
          </p>
        </GuideSection>

        <GuideSection
          id="simulator"
          index="د"
          title="محاكي التحكم"
          lead="هذه هي الصفحة التي تتدرّب فيها فعلاً. انقر على النافذة ليلتقط المحاكي لوحة المفاتيح، ثم جرّب المفاتيح كما لو كنت على المنصة."
        >
          <PresentationSimulator />
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-gold-300/20 bg-gold-300/8 p-4">
            <p className="flex items-center gap-2 type-body-sm font-bold text-gold-200">
              <ListChecks className="size-4" aria-hidden />
              ما يفعله كل مفتاح داخل المحاكي
            </p>
            <ul className="space-y-1.5 type-body-sm leading-relaxed text-night-text">
              <li>← يتقدّم نقطة أو شاشة، و → يرجع.</li>
              <li>مسافة على الغلاف والافتتاح تتقدّم، وعلى المحور توقف المؤقّت أو تشغّله.</li>
              <li>F تملأ الشاشة، و N تُظهر الملاحظات، و ? تفتح قائمة الاختصارات، و Esc تغلقها.</li>
              <li>١–٤ تنتقل مباشرة إلى محور، وفي المحاكي يظهر ذلك في شريط الأسفل.</li>
            </ul>
            <p className="type-micro leading-relaxed text-night-muted">
              المحاكي هنا للتدريب فقط؛ لا يتحكّم في العرض الحقيقي ولا يرسل إليه أي أمر.
            </p>
          </div>
        </GuideSection>

        <GuideSection
          id="shortcuts"
          index="هـ"
          title="اختصارات لوحة المفاتيح"
          lead="هذه هي الخريطة الكاملة كما يعمل بها العرض فعلاً على المنصة."
        >
          <div className="overflow-hidden rounded-xl border border-night-line">
            <dl className="divide-y divide-night-line/70">
              {SHORTCUTS.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:gap-4"
                >
                  <dt className="flex shrink-0 items-center gap-1.5">
                    {row.keys.map((k, i) =>
                      k === "–" ? (
                        <span key={i} className="type-micro text-night-muted">
                          –
                        </span>
                      ) : (
                        <ShortcutKey key={i}>{k}</ShortcutKey>
                      ),
                    )}
                  </dt>
                  <dd className="min-w-0">
                    <p className="type-body-sm font-semibold text-night-text">{row.label}</p>
                    {row.note ? (
                      <p className="mt-0.5 type-micro leading-relaxed text-night-muted">
                        {row.note}
                      </p>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-3 type-micro leading-relaxed text-night-muted">
            بدائل: PageDown مثل ←، و PageUp مثل →. على لوحة المفاتيح العربية يعمل حرف
            F بحرف «ب»، وحرف N بحرف «ن».
          </p>
        </GuideSection>

        <GuideSection
          id="checklist"
          index="و"
          title="قبل البدء"
          lead="علّم كل بند قبل أن يدخل الحضور. القائمة لا تُحفظ — جرّبها الآن."
        >
          <PrePresentationChecklist />
        </GuideSection>

        <GuideSection
          id="emergency"
          index="ز"
          title="الطوارئ والاحتياطي"
          lead="الخلاصة: لا تغلق العرض مهما حدث. كل حالة هنا لها مخرج."
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {EMERGENCY.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-xl border border-night-line bg-night-raised/40 p-4"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-night-line bg-night text-gold-300">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display type-body-sm font-bold text-night-text">
                      {item.title}
                    </p>
                    <p className="mt-1 type-body-sm leading-relaxed text-night-muted">
                      {item.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 rounded-xl border border-gold-300/20 bg-gold-300/8 p-4">
            <p className="type-body-sm font-bold text-gold-200">
              الاحتياطي هو أ. ولاء في المحاور الأربعة.
            </p>
            <p className="mt-1 type-body-sm leading-relaxed text-night-text">
              لا يوجد اختصار لوحة مفاتيح له؛ التبديل يتم من زر «تسليم التقديم إلى …»
              الذي يظهر أسفل شاشة كل محور.
            </p>
          </div>
        </GuideSection>

        <footer className="border-t border-night-line pt-6 pb-4">
          <p className="type-micro leading-relaxed text-night-muted">
            هذا الدليل أداة تدريب، والعرض الحقيقي لا يقرأ منه. للتحضير الكامل، افتح{" "}
            <Link href="/presenter" className="text-gold-300 hover:text-gold-200">
              ورقة المتحدث
            </Link>
            ، وللنصّ الكامل لكل متحدث افتح{" "}
            <Link href="/script/batool" className="text-gold-300 hover:text-gold-200">
              السكربت
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
