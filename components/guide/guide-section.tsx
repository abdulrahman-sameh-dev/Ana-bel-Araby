import { cn } from "@/lib/utils";

export function GuideSection({
  id,
  index,
  title,
  lead,
  children,
  className,
}: {
  id: string;
  index: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-24", className)}
    >
      <div className="flex items-baseline gap-3">
        <span
          className="tabular font-display text-sm font-bold text-gold-400"
          dir="ltr"
        >
          {index}
        </span>
        <h2 id={`${id}-title`} className="stage-title type-body-lg text-night-text">
          {title}
        </h2>
      </div>
      {lead ? (
        <p className="mt-2 max-w-prose type-body-sm leading-relaxed text-night-muted">
          {lead}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
