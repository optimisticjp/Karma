"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileOptions = {
  sitekey: string;
  action: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  appearance: "interaction-only";
  size: "flexible";
  theme: "auto";
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOptions) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

function actionForPage() {
  const path = window.location.pathname;
  if (path.includes("/admission")) return "admission";
  if (path.includes("/services")) return "brief";
  return "public_form";
}

/**
 * Cloudflare Turnstile.
 *
 * The site key is intentionally loaded from a tiny runtime endpoint instead
 * of relying on NEXT_PUBLIC_* build-time substitution. That lets the Worker
 * owner add/rotate Turnstile in Cloudflare without rebuilding the Next bundle.
 * The key is public by design; the secret never leaves the Worker.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null
  );

  useEffect(() => {
    if (siteKey) return;
    let cancelled = false;
    void fetch("/api/turnstile/config", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { siteKey?: unknown } | null) => {
        if (!cancelled && typeof data?.siteKey === "string" && data.siteKey) {
          setSiteKey(data.siteKey);
        }
      })
      .catch(() => {
        // The protected API still fails closed in production when Turnstile is
        // required. A config fetch failure should not crash the form UI.
      });
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey || !ref.current || widgetId.current) return;

    const render = () => {
      if (widgetId.current || !ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        action: actionForPage(),
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
        appearance: "interaction-only",
        size: "flexible",
        theme: "auto"
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
      if (existing) {
        existing.addEventListener("load", render);
        return () => existing.removeEventListener("load", render);
      }
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      script.addEventListener("load", render);
      document.head.appendChild(script);
    }

    return () => {
      if (widgetId.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetId.current);
      }
      widgetId.current = null;
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="my-4 min-w-0" />;
}
