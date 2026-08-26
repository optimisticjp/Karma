"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

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

  return (
    <section className="section">
      <div className="container-site max-w-2xl text-center">
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="mt-4 text-stone">{t("body")}</p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-stone">ref: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">
            {t("retry")}
          </button>
        </div>
      </div>
    </section>
  );
}
