"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => void;
    };
  }
}

/**
 * Cloudflare Turnstile (free, invisible-friendly). Renders nothing until
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured; the server skips
 * verification in that case too, with a loud console warning.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !ref.current || rendered.current) return;
    const render = () => {
      if (rendered.current || !ref.current || !window.turnstile) return;
      rendered.current = true;
      window.turnstile.render(ref.current, { sitekey: siteKey, callback: onToken });
    };
    if (window.turnstile) {
      render();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (existing) {
      existing.addEventListener("load", render);
      return () => existing.removeEventListener("load", render);
    }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.dataset.turnstile = "true";
    s.addEventListener("load", render);
    document.head.appendChild(s);
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="my-4" />;
}
