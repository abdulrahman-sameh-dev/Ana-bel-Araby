import type { Metadata } from "next";

import { HandoutView } from "@/components/handout/handout-view";

/**
 * `/handout` — the speaker's quick-reference page.
 *
 * A server shell around a client view: it exists so this route can declare its
 * own `metadata` while the view below owns its navigation state. Nothing else
 * in the app imports either file.
 */

export const metadata: Metadata = {
  title: "ورقة المتحدث — مرجع سريع",
  description:
    "مرجع سريع للمتحدث: كل محور في صفحة واحدة — الخلاصة، النقاط، ما لا يُنسى، والتسليم.",
  /** A speaking aid, not a page meant to be found. */
  robots: { index: false, follow: false },
};

export default function HandoutPage() {
  return <HandoutView />;
}
