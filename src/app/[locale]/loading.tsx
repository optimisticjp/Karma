/** Route transition state: quiet skeleton, screen-reader announced. */
export default function Loading() {
  return (
    <div className="container-site section-compact" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="skeleton h-10 w-2/3 max-w-md" />
      <div className="skeleton mt-4 h-5 w-full max-w-xl" />
      <div className="skeleton mt-2 h-5 w-5/6 max-w-lg" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="skeleton h-48" />
        <div className="skeleton h-48" />
        <div className="skeleton h-48" />
      </div>
    </div>
  );
}
