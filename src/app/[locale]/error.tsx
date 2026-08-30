"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { site } from "@/lib/site";

/** Route error boundary: honest failure, retry, WhatsApp fallback. */
export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error("[boundary]", error.digest ?? "", error.message);
  }, [error]);

  /* Left-aligned like every other page. A centred apology was the only
     composition on the site that broke the editorial setting, on the one
     screen where a visitor most needs to recognise where they still are. */
  return (
    <section className="section">
      <div className="container-site">
        <div className="reading-shell">
          <p className="eyebrow u-eyebrow-gap">{t("eyebrow")}</p>
          <h1 className="text-h2 font-display">{t("title")}</h1>
          <p className="u-lede">{t("body")}</p>
          {error.digest ? (
            <p className="mt-3 font-mono text-xs text-stone">ref: {error.digest}</p>
          ) : null}
          <div className="u-actions action-row">
            <button type="button" onClick={reset} className="btn btn-primary">
              {t("retry")}
            </button>
            <a href={`tel:+${site.callPhone}`} className="btn btn-secondary">
              {t("callCta")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
