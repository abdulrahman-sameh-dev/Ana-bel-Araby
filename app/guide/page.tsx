import type { Metadata } from "next";

import { PresentationGuidePage } from "@/components/guide/presentation-guide-page";

export const metadata: Metadata = {
  title: "دليل العرض — التحكم والاختصارات",
  description:
    "دليل عملي لقيادة العرض: ما هي الصفحات، كيف تتقدّم بين الشرائح، اختصارات لوحة المفاتيح، ومحاكي تدريب لا يمسّ العرض الحقيقي.",
  /** A rehearsal aid, not a page meant to be found. */
  robots: { index: false, follow: false },
};

export default function GuidePage() {
  return <PresentationGuidePage />;
}
