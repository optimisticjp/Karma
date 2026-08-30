import { cn } from "@/lib/utils";

/**
 * The console page header.
 *
 * Compact by design: a title, an optional one-line context, and the actions
 * for this page on the same row where there is width for it. A console header
 * that takes 180px of a 640px phone screen has spent a third of the viewport
 * saying where you already know you are.
 *
 * `context` is the operational line — "18 students · 2 absent today" — not a
 * description of the page. If it does not change with the data, it does not
 * belong here.
 */
export function PageHead({
  title,
  context,
  actions,
  className
}: {
  title: string;
  context?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("console-head", className)}>
      <div className="console-head-text">
        <h1 className="console-head-title">{title}</h1>
        {context ? <p className="console-head-context">{context}</p> : null}
      </div>
      {actions ? <div className="console-head-actions">{actions}</div> : null}
    </div>
  );
}
