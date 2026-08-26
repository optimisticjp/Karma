import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

/** The signature motif: a dashed gold thread that draws itself on scroll. */
export function StitchDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("container-site", className)}>
      <Reveal variant="draw" />
    </div>
  );
}
