/**
 * One operational number with its label. Deliberately plain: no sparkline, no
 * delta arrow, no donut. The vermilion emphasis is reserved for a figure that
 * means someone should act now.
 */
export function Metric({
  label,
  value,
  hint,
  emphasis = false
}: {
  label: string;
  value: number;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div className={emphasis ? "panel panel-body" : undefined}>
      <span className={`metric ${emphasis ? "metric-strong" : ""}`}>{value}</span>
      <span className="mt-1 block text-smallmeta font-semibold">{label}</span>
      {hint ? <span className="form-note block">{hint}</span> : null}
    </div>
  );
}
