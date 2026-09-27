"use client";

import { motion } from "motion/react";
import { Mic, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  creditGroups,
  presenterLineup,
  teamBackupPresenter,
  presentation,
} from "@/data/presentation";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import { SectionHeader } from "@/components/presentation/section-header";
import { ArabesqueField, FiligreeRule } from "@/components/presentation/ornaments";

/**
 * Stage 06 — who did what.
 *
 * Credits read as a page of record, not as a wall of badges: the work is
 * grouped by the section it went into, and the people who stood on stage are
 * listed separately because that is a different kind of credit from having
 * written a slide.
 *
 * Every name here comes from `creditGroups` / the section records. Nobody is
 * listed for a section they are not on, and the cover presenter is named
 * separately from the four who actually spoke.
 */
export function TeamSection() {
  const reduced = usePrefersReducedMotion();

  const research = creditGroups.filter((g) => g.id !== "handout");
  const handout = creditGroups.find((g) => g.id === "handout");

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label="فريق العمل"
    >
      <ArabesqueField tone="gold" opacity={0.04} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,var(--gold-100)_0%,transparent_70%)] opacity-50"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1560px)] flex-1 flex-col">
        <SectionHeader kicker="من做了什么" title="فريق العمل" />

        <div className="mt-[var(--sp-block)] grid min-h-0 flex-1 grid-cols-1 gap-x-[clamp(1.5rem,1rem+3vw,4rem)] gap-y-[var(--sp-block)] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          {/* ---------- research & slides ---------- */}
          <motion.section
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            aria-labelledby="credit-research"
            className="flex min-w-0 flex-col"
          >
            <h2
              id="credit-research"
              className="kicker text-gold-600"
            >
              البحث وتجهيز الشرائح
            </h2>
            <FiligreeRule className="mt-2 w-full" />

            <dl className="mt-[var(--sp-block)] flex min-h-0 flex-1 flex-col justify-evenly">
              {research.map((group) => (
                <div
                  key={group.id}
                  className="grid grid-cols-1 gap-x-4 gap-y-1 border-b border-paper-line/70 py-[clamp(0.4rem,0.3rem+0.5vh,0.75rem)] last:border-0 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:items-baseline sm:gap-y-0"
                >
                  <dt className="type-body font-semibold leading-[1.45] text-ink">
                    {group.label}
                  </dt>
                  <dd className="flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:justify-end">
                    {group.members.map((member, i) => (
                      <span key={member} className="flex items-baseline gap-2">
                        {i > 0 ? (
                          <span aria-hidden className="text-gold-400/70">
                            ·
                          </span>
                        ) : null}
                        <span className="type-body text-ink-soft">
                          {member}
                        </span>
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.section>

          {/* ---------- on stage ---------- */}
          <motion.section
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            aria-labelledby="credit-stage"
            className="flex min-w-0 flex-col"
          >
            <h2 id="credit-stage" className="kicker text-gold-600">
              التقديم على المسرح
            </h2>
            <FiligreeRule className="mt-2 w-full" />

            <ul className="mt-[var(--sp-block)] flex flex-col">
              {presenterLineup.map((person) => (
                <li
                  key={person.section}
                  className="flex items-center gap-3 border-b border-paper-line/70 py-[clamp(0.35rem,0.28rem+0.45vh,0.65rem)] last:border-0"
                >
                  <span
                    className="tabular w-6 shrink-0 font-display font-bold text-gold-400/60"
                    style={{ fontSize: "var(--fs-display-sm)" }}
                    aria-hidden
                  >
                    {person.numeral}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate type-body-lg font-bold leading-tight text-ink">
                      {person.name}
                    </span>
                    <span className="block truncate type-micro text-ink-muted">
                      {person.section}
                    </span>
                  </span>
                  <Mic className="size-3.5 shrink-0 text-gold-500/70" aria-hidden />
                </li>
              ))}
            </ul>

            {/* The cover is a role, not a fifth turn at the podium. */}
            <p className="mt-[var(--sp-block)] flex items-center gap-2.5 rounded-lg border border-gold-400/40 bg-gold-100/50 px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-gold-400/40 bg-paper-raised/70">
                <LifeBuoy className="size-3.5 text-gold-600" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="kicker block text-gold-700">
                  مقدمة احتياطية
                </span>
                <span className="block type-body-lg font-bold leading-tight text-ink">
                  {teamBackupPresenter}
                </span>
              </span>
            </p>

            {handout ? (
              <div className="mt-[var(--sp-block)]">
                <h3 className="kicker text-ink-muted">{handout.label}</h3>
                <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  {handout.members.map((member, i) => (
                    <span key={member} className="flex items-baseline gap-2">
                      {i > 0 ? (
                        <span aria-hidden className="text-gold-400/70">
                          ·
                        </span>
                      ) : null}
                      <span className="type-body font-semibold text-ink-soft">
                        {member}
                      </span>
                    </span>
                  ))}
                </p>
              </div>
            ) : null}
          </motion.section>
        </div>

        <footer
          className={cn(
            "mt-[var(--sp-block)] flex items-center justify-between gap-4 border-t border-paper-line pt-2.5 type-body-sm text-ink-muted",
          )}
        >
          <span className="font-semibold text-ink">{presentation.team}</span>
          <span>
            <span className="sr-only">{presentation.dateLabel}: </span>
            <span className="font-semibold text-ink">{presentation.date}</span>
          </span>
        </footer>
      </div>
    </section>
  );
}
