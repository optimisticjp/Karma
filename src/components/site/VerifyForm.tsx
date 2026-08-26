"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function VerifyForm() {
  const t = useTranslations("verifyPage");
  const router = useRouter();
  const [value, setValue] = useState("");

  const go = () => {
    const v = value.trim().toUpperCase();
    if (v) router.push(`/verify/${encodeURIComponent(v)}`);
  };

  return (
    <div className="card p-6">
      <label className="label" htmlFor="cert-no">{t("inputLabel")}</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="cert-no"
          className="input font-mono uppercase"
          placeholder={t("inputPh")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
        />
        <button type="button" onClick={go} className="btn btn-primary">
          {t("button")}
        </button>
      </div>
    </div>
  );
}
