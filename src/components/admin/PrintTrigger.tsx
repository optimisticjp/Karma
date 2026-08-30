"use client";

/**
 * One button, one line of JavaScript.
 *
 * The certificate sheet used to render a Print button as a server component
 * with `onClick={undefined}` — inert by construction, with instruction text
 * telling staff to find the browser's print menu instead. This replaces that:
 * the island is a few bytes, and staff get the button the page appears to have.
 */
export function PrintTrigger({ label }: { label: string }) {
  return (
    <button type="button" className="is-primary" onClick={() => window.print()}>
      {label}
    </button>
  );
}
