import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  sub,
  className,
  onDark = false
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2 className={cn("text-h2", onDark && "text-ivory")}>{title}</h2>
      {sub ? (
        <p className={cn("mt-5 text-lead", onDark ? "text-ivory/80" : "text-stone")}>{sub}</p>
      ) : null}
    </div>
  );
}
