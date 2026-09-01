"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileOptions = {
  sitekey: string;
  action: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  "timeout-callback": () => void;
  "refresh-expired": "auto";
  "refresh-timeout": "auto";
  "response-field": true;
  "response-field-name": string;
  appearance: "interaction-only";
  size: "flexible";
  theme: "auto";
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOptions) => string;
      remove?: (widgetId: string) => void;
      reset?: (widgetId: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile.
 *
 * Tokens are single-use and expire after five minutes. Admission is a multi-step
 * form, so the widget refreshes expired/time-out tokens automatically and can
 * also be reset after a failed submission. The native response field is named
 * `turnstileToken`, which makes multipart forms resilient even if a React state
 * update and a submit click happen in the same frame.
 */
export function TurnstileWidget({
  onToken,
  resetKey = 0
}: {
  onToken: (token: string) => void;
  resetKey?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const previousResetKey = useRef(resetKey);
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
        // The protected API still fails closed in production when Turnstile is required.
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
        action: "public_form",
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
        "timeout-callback": () => onToken(""),
        "refresh-expired": "auto",
        "refresh-timeout": "auto",
        "response-field": true,
        "response-field-name": "turnstileToken",
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

  useEffect(() => {
    if (resetKey === previousResetKey.current) return;
    previousResetKey.current = resetKey;
    onToken("");
    if (widgetId.current && window.turnstile?.reset) {
      window.turnstile.reset(widgetId.current);
    }
  }, [resetKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="my-4 min-w-0" />;
}
