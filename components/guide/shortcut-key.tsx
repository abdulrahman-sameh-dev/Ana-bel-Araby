import { cn } from "@/lib/utils";

export function ShortcutKey({
  children,
  active = false,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <kbd
      dir="ltr"
      className={cn(
        "inline-flex min-w-8 items-center justify-center rounded-md border px-1.5 py-1 font-latin text-[0.72rem] font-semibold leading-none transition-colors",
        active
          ? "border-gold-300 bg-gold-300/25 text-gold-100"
          : "border-night-line bg-night-raised text-night-muted",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
