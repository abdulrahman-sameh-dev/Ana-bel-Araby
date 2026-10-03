"use client";

import { motion } from "motion/react";
import { Mic, LifeBuoy, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  creditRoles,
  presenterLineup,
  creditBackup,
  presentation,
  teamCredits,
} from "@/data/presentation";
import { usePrefersReducedMotion } from "@/hooks/use-presentation";
import { SectionHeader } from "@/components/presentation/section-header";
import { TeamMark } from "@/components/presentation/team-mark";
import { ArabesqueField, FiligreeRule } from "@/components/presentation/ornaments";

/**
 * Stage 07 — غيث, the record of who did the work.
 *
 * This is the credits page, and it says so. The closing sentence and the
 * gratitude live on their own stage after this one, so the two jobs stop
 * competing: here the room reads names, and there it reads the claim.
 *
 * ## Grouped by role, not by slide
 *
 * This used to list four research groups whose labels were all variations on
 * «بحث وتجهيز شرائح …» — «شرائح الهوية», «شرائح صلة العربية بعالمها», «شرائح
 * التاريخ», «شرائح المعلومات المفاجئة». On the projector that reads as four
 * almost identical rows, and it frames ten people as four rows of contributors
 * to slides rather than as the team behind a presentation. It is also the shape
 * of a developer credits page, which is not what this is.
 *
 * `creditRoles` groups by the work instead — البحث والكتابة · العرض ·
 * البرزنتيشن والهانداوت · التوعية — which is how the team describes what it did,
 * and which keeps the Facebook-account campaign visible as its own line rather
 * than folded into research where nobody would recognise it.
 *
 * The four who stood on stage stay in their own column, because speaking is a
 * different kind of credit from writing, and the backup is listed under them
 * rather than among the speakers.
 */
export function TeamSection({ onContinue }: { onContinue?: () => void }) {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      className="grain stage-page relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label="فريق غيث"
    >
      <ArabesqueField tone="gold" opacity={0.04} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,var(--gold-100)_0%,transparent_70%)] opacity-50"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,1560px)] flex-1 flex-col">
        {/* The emblem, the team, and the heading. */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          {/* Was 2.5rem–3.75rem, which put the closing lockup visibly below the
              cover's and made the last screen of the talk smaller than its
              first. Raised to 3.25rem–5.25rem: about 40% taller, still below
              the cover's 3.5rem–6.5rem so the deck does not open and close on
              the same size, and capped so the credits below keep their rows at
              720p. */}
          <TeamMark variant="lockup" className="h-[clamp(3.25rem,2.4rem+3.2vh,5.25rem)]" priority />
        </motion.div>

        <SectionHeader
          kicker={`${presentation.team} — ${presentation.dateLabel}`}
          title={teamCredits.headline}
          className="mt-[var(--sp-tight)]"
        />

        <div className="mt-[var(--sp-block)] grid min-h-0 flex-1 grid-cols-1 gap-x-[clamp(1.5rem,1rem+3vw,4rem)] gap-y-[var(--sp-block)] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          {/* ---------- the work, by role ---------- */}
          <motion.section
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            aria-labelledby="credit-roles"
            className="flex min-w-0 flex-col"
          >
            <h2 id="credit-roles" className="kicker text-gold-600">
              توزيع العمل
            </h2>
            <FiligreeRule className="mt-2 w-full" />

            <dl className="mt-[var(--sp-block)] flex min-h-0 flex-1 flex-col justify-evenly">
              {creditRoles.map((role) => (
                <div
                  key={role.id}
                  className="grid grid-cols-1 gap-x-4 gap-y-1 border-b border-paper-line/70 py-[clamp(0.4rem,0.3rem+0.5vh,0.75rem)] last:border-0 sm:grid-cols-[minmax(0,22ch)_minmax(0,1fr)] sm:items-baseline sm:gap-y-0"
                >
                  <dt className="type-body font-semibold leading-[1.45] text-ink">
                    {role.label}
                  </dt>
                  <dd className="flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:justify-end">
                    {role.members.map((member, i) => (
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
                  {creditBackup.label}
                </span>
                <span className="block type-body-lg font-bold leading-tight text-ink">
                  {creditBackup.name}
                </span>
              </span>
            </p>
          </motion.section>
        </div>

        {/* ── the way out of the credits, into the closing stage. ── */}
        {onContinue ? (
          <div className="mt-[var(--sp-block)] flex shrink-0 flex-col items-center gap-2.5">
            <p className="type-body balance text-ink-soft">{teamCredits.bridge}</p>
            <button
              type="button"
              onClick={onContinue}
              className="group flex h-[clamp(2.2rem,2rem+1vh,2.6rem)] cursor-pointer items-center gap-2 rounded-full bg-ink px-5 font-sans type-body-sm font-bold text-paper shadow-lift transition-colors duration-200 hover:bg-gold-500 hover:text-ink"
            >
              إلى الخاتمة
              <ArrowLeft
                className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
                aria-hidden
              />
            </button>
          </div>
        ) : null}

        <footer
          className={cn(
            "mt-[var(--sp-block)] flex items-center justify-between gap-4 border-t border-paper-line pt-2.5 type-body-sm text-ink-muted",
          )}
        >
          <span className="font-semibold text-ink">{presentation.team}</span>
          <span className="text-ink-faint">{presentation.subtitle}</span>
          <span>
            <span className="sr-only">{presentation.dateLabel}: </span>
            <span className="font-semibold text-ink">{presentation.date}</span>
          </span>
        </footer>
      </div>
    </section>
  );
}
