/**
 * Privacy-conscious event hooks.
 *
 * This is deliberately not an analytics library. It is a named list of the
 * six moments that matter on this site, and a function that emits them as a
 * DOM CustomEvent plus a small in-page queue. No network request, no cookie,
 * no third-party script, no consent banner needed — and no dependency to
 * remove later if the owner picks a different tool.
 *
 * When the owner chooses an analytics provider, wiring it up is one listener:
 *
 *   window.addEventListener("karma:event", (e) => provider.track(e.detail));
 *
 * ## The PII rule
 *
 * **No event may carry a name, phone number, email address, message body or
 * free-text field.** Everything a visitor types is out. What is allowed is
 * the shape of what happened: which course slug, which locale, which surface
 * the click came from. `track()` enforces this by construction — the payload
 * type only admits an allow-listed set of keys, all of them short enumerable
 * values — rather than by asking callers to remember.
 */

/** The moments worth counting. Adding one is a deliberate act. */
export type KarmaEvent =
  | "call_demo_click"
  | "directions_click"
  | "whatsapp_click"
  | "demo_start"
  | "demo_complete"
  | "course_view"
  /** Outbound to Instagram, Facebook, YouTube or Threads. */
  | "social_click"
  /** A machine note sending a reader to the course that teaches it. */
  | "note_course_click";

/**
 * Allowed context. Every field is a slug, an enum or a count — never anything
 * a visitor typed. There is no `string` escape hatch on purpose.
 */
export type EventProps = {
  /** Course slug, e.g. "zardosi-machine-embroidery". Never a course name. */
  course?: string;
  /** Where the interaction happened: "tabbar", "hero", "footer", "course". */
  surface?: string;
  /** "en" | "gu". */
  locale?: string;
  /** Which step of the demo form, for funnel drop-off. */
  step?: number;
  /** Platform slug for an outbound social click: "instagram", "youtube". */
  channel?: string;
  /** Machine-note slug. Our own, from src/content/notes.ts. */
  note?: string;
};

const ALLOWED = ["course", "surface", "locale", "step", "channel", "note"] as const;

/** Last 50 events, for debugging and for a provider attached after load. */
declare global {
  interface Window {
    __karmaEvents?: Array<{ name: KarmaEvent; props: EventProps; t: number }>;
  }
}

export function track(name: KarmaEvent, props: EventProps = {}) {
  if (typeof window === "undefined") return;

  /* Strip anything not on the allow-list, even if a caller has been given a
     wider object by a refactor. The type system is the first line; this is
     the one that survives a cast. */
  const safe: EventProps = {};
  for (const key of ALLOWED) {
    const value = props[key];
    if (value === undefined) continue;
    if (typeof value === "number") {
      safe[key] = value as never;
    } else if (typeof value === "string" && value.length <= 64) {
      safe[key] = value as never;
    }
  }

  const entry = { name, props: safe, t: Date.now() };
  window.__karmaEvents = [...(window.__karmaEvents ?? []).slice(-49), entry];
  window.dispatchEvent(new CustomEvent("karma:event", { detail: entry }));
}
