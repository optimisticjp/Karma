import { cn } from "@/lib/utils";

/**
 * Machine notation.
 *
 * A small monospace treatment for the handful of places where the interface is
 * genuinely labelling a step, an index or a path: `01 DESIGN`, `02 MACHINE`,
 * `03 OUTPUT`, `EMCAD / PATH`, a Machine Note index, a course index.
 *
 * TWO DELIBERATE LIMITS
 * ---------------------
 * 1. No new font. This uses the platform monospace stack (`--font-mono`,
 *    declared in globals.css). A brand voice is not worth another 30KB on
 *    every page of a site people open on Surat mobile data.
 * 2. Not for body copy, navigation, buttons, or a wall of fake specifications.
 *    Monospace here means "this is a machine label". If it is used for prose it
 *    stops meaning that and starts meaning "someone wanted to look technical".
 *
 * Gujarati never uppercases and never letterspaces; `.mono-note` handles that
 * with a `:lang(gu)` override in machine-lab.css rather than at the call site.
 */
export function MonoNote({
  children,
  as: Tag = "span",
  tone = "stone",
  className
}: {
  children: React.ReactNode;
  as?: "span" | "p" | "dt" | "div";
  tone?: "stone" | "vermilion" | "needle";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "mono-note",
        tone === "vermilion" && "text-vermilion-deep",
        tone === "needle" && "text-needle",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A two-digit step index — `01`, `02`, `03`. Separate from <MonoNote> because
 * the number is the thing being aligned in ledger and process layouts, and it
 * needs tabular figures to stay in column.
 */
export function StepIndex({ n, className }: { n: number; className?: string }) {
  return <span className={cn("mono-note mono-index", className)}>{String(n).padStart(2, "0")}</span>;
}
