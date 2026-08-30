"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll reveal, runs once. Audit fixes:
 *  - ONE shared IntersectionObserver for the whole page
 *  - `as` prop so list semantics stay valid (e.g. as="li" inside <ol>)
 *  - initial hidden state is .js-gated in CSS: content shows without JS
 */
let sharedIO: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver() {
  if (typeof window === "undefined") return null;
  if (!sharedIO) {
    sharedIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            callbacks.get(e.target)?.();
            sharedIO?.unobserve(e.target);
            callbacks.delete(e.target);
          }
        }
      },
      { threshold: 0.3 }
    );
  }
  return sharedIO;
}

export function Reveal({
  as = "div",
  children,
  className,
  variant = "up",
  delay = 0
}: {
  as?: "div" | "li" | "figure" | "section";
  children?: ReactNode;
  className?: string;
  variant?: "up" | "draw";
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    if (!io) {
      el.classList.add("is-in");
      return;
    }
    callbacks.set(el, () => el.classList.add("is-in"));
    io.observe(el);
    return () => {
      io.unobserve(el);
      callbacks.delete(el);
    };
  }, []);

  return createElement(
    as,
    {
      ref,
      className: cn(variant === "up" ? "reveal" : "stitch-line stitch-draw", className),
      style: delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined
    },
    children
  );
}

/**
 * Self-registering watcher for elements that hide themselves until `is-in`
 * lands: `.media-unveil` (photo unveil), `.stitch-wipe` (a stitch laying
 * itself down) and `.sig-play` (a technique signature building once).
 *
 * Why this exists: each of them hides itself until the class lands. Anything
 * relying on a <Reveal> ancestor would stay invisible forever if that ancestor
 * were missing, so
 * nothing is trusted to wrap them: this observes every such element on the
 * page directly, and re-scans after client navigation. A failed animation
 * must never cost a photo — or a section's only visible divider.
 */
const SELF_REVEAL =
  ".media-unveil:not(.is-in), .stitch-wipe:not(.is-in), .sig-play:not(.is-in)";

export function UnveilWatcher() {
  useEffect(() => {
    const io = getObserver();
    if (!io) return;

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELF_REVEAL).forEach((el) => {
        if (callbacks.has(el)) return;
        callbacks.set(el, () => el.classList.add("is-in"));
        io.observe(el);
      });
    };

    scan();
    // Catch nodes added by filtering, pagination or route changes.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    // Absolute failsafe: if anything above went wrong, reveal everything.
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".media-unveil, .stitch-wipe, .sig-play").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add("is-in");
      });
    }, 1200);

    return () => {
      mo.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return null;
}
