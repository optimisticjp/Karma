"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";

/**
 * CERTIFICATE LOOKUP.
 *
 * A real `<form>` rather than an input beside a button: Enter submits, the
 * label is bound, and a browser's own autofill and keyboard behave the way the
 * person using them expects. The old version reimplemented Enter by hand,
 * which is the kind of thing that works until somebody uses a screen reader.
 *
 * NO MOTION LIVES HERE, and `tests/machine-lab-secondary.test.tsx` keeps it
 * that way. Somebody on this page is checking whether a certificate is real;
 * the restraint is the credibility.
 */
export function VerifyForm() {
  const t = useTranslations("verifyPage");
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      className="form-shell"
      onSubmit={(e) => {
        e.preventDefault();
        const v = value.trim().toUpperCase();
        if (v) router.push(`/verify/${encodeURIComponent(v)}`);
      }}
    >
      <label className="label" htmlFor="cert-no">
        {t("inputLabel")}
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
        <input
          id="cert-no"
          name="certNo"
          className="input cert-no uppercase"
          placeholder={t("inputPh")}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="act act-primary flex-none">
          {t("button")} <Icon name="arrow" size={17} className="arrow" />
        </button>
      </div>
    </form>
  );
}
