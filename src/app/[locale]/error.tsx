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
    <section className="band on-paper">
      <div className="wrap">
        <div className="reading-shell">
          <p className="t-micro">{t("eyebrow")}</p>
          <h1 className="t-h2 mt-3">{t("title")}</h1>
          <p className="t-lede mt-4">{t("body")}</p>
          {error.digest ? <p className="t-meta numeric mt-3">ref: {error.digest}</p> : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={reset} className="act act-primary">
              {t("retry")}
            </button>
            <a href={`tel:+${site.callPhone}`} className="act act-secondary">
              {t("callCta")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
