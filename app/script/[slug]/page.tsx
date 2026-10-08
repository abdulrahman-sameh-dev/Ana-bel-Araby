import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ScriptDocument } from "@/components/script/script-document";
import { SCRIPT_SLUGS, scriptFor } from "@/data/scripts";

/**
 * `/script/[slug]` — one speaker's script, one route per speaker.
 *
 * Four routes instead of one page with tabs: each script has its own address,
 * so a speaker can be sent theirs and can bookmark it, and the page title a
 * browser shows is their own name and their own chapter.
 *
 * A server shell around a server view — there is no state anywhere on this
 * page, which is what lets it render fully before any script is read.
 */

type RouteParams = { slug: string };

export function generateStaticParams(): RouteParams[] {
  return SCRIPT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const script = scriptFor(slug);
  if (!script) return {};

  return {
    title: `${script.speaker} — ${script.topic}`,
    description: `سكربت العرض الكامل لمحور ${script.shortTitle}: كلمات المتحدث بالترتيب، مع تعليمات الإلقاء والتسليم.`,
    /** A speaking aid, not a page meant to be found. */
    robots: { index: false, follow: false },
  };
}

export default async function ScriptPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const script = scriptFor(slug);
  if (!script) notFound();

  return <ScriptDocument script={script} />;
}
