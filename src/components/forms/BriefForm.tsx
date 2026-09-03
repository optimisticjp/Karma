"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TurnstileWidget } from "./TurnstileWidget";
import { waLink } from "@/lib/site";
import { MAX_FILE_BYTES, MAX_FILES } from "@/lib/files";
import { Link } from "@/i18n/navigation";

/** B2B design brief: one screen, files deferred to WhatsApp, quote by conversation. */
export function BriefForm() {
  const t = useTranslations("servicesPage");
  const te = useTranslations("admissionForm.errors");
  const tf = useTranslations("footer");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; filesStored: number } | null>(null);
  const [token, setToken] = useState<string | undefined>();
  const [challengeVersion, setChallengeVersion] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const filesDeferredCopy = t("form.filesDeferred").replace(
    "Private in-form upload is switched on with secure storage.",
    "Private in-form upload will be enabled only after secure private storage is connected."
  );
  const securityError =
    locale === "gu"
      ? "સિક્યોરિટી ચેક પૂરું થયું નથી. થોડી ક્ષણ રાહ જોઈ ફરી મોકલો."
      : "The security check has not finished. Wait a moment and send again.";
  const securityRetryError =
    locale === "gu"
      ? "સિક્યોરિટી ચેક રિફ્રેશ થયું છે. થોડી ક્ષણ પછી ફરી મોકલો."
      : "The security check was refreshed. Wait a moment, then send again.";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);
    if (token) fd.set("turnstileToken", token);

    /* Turnstile also writes a native hidden `turnstileToken` field. Prefer the
       callback token, but retain the native value so a same-frame React state
       update can never turn a valid challenge into a missing token. */
    const nativeToken = fd.get("turnstileToken");
    const challengeToken = token || (typeof nativeToken === "string" ? nativeToken : "");
    if (!challengeToken) {
      setError(securityError);
      return;
    }
    fd.set("turnstileToken", challengeToken);

    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_FILES || files.some((f) => f.size > MAX_FILE_BYTES)) {
      setError(te("generic"));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/brief", { method: "POST", body: fd });
      const data = (await res.json()) as {
        ok: boolean;
        reference?: string;
        filesStored?: number;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.reference) {
        if (data.error === "turnstile" || data.error === "turnstile_unavailable") {
          setChallengeVersion((v) => v + 1);
          setToken(undefined);
          setError(securityRetryError);
          return;
        }
        setError(te("generic"));
        return;
      }
      setDone({ reference: data.reference, filesStored: data.filesStored ?? 0 });
      form.reset();
    } catch {
      setChallengeVersion((v) => v + 1);
      setToken(undefined);
      setError(te("generic"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="form-shell">
        <p className="t-h3">{t("success.title")}</p>
        <p className="t-micro mt-4">{t("success.refLabel")}</p>
        <p className="t-h3 cert-no mt-1">{done.reference}</p>
        <p className="t-body mt-4 max-w-prose">{t("success.body")}</p>
        <p className="t-meta mt-2">{t("success.files", { count: done.filesStored })}</p>
        <p className="mt-6">
          <a
            href={waLink(t("success.waMessage", { ref: done.reference }))}
            target="_blank"
            rel="noopener noreferrer"
            className="act act-primary"
          >
            {t("success.waButton")}
          </a>
        </p>
      </div>
    );
  }

  const field = (name: string, label: string, opts?: { type?: string; required?: boolean; textarea?: boolean }) => (
    <div>
      <label className="label" htmlFor={`brief-${name}`}>{label}</label>
      {opts?.textarea ? (
        <textarea id={`brief-${name}`} name={name} rows={4} className="input" />
      ) : (
        <input
          id={`brief-${name}`}
          name={name}
          type={opts?.type ?? "text"}
          required={opts?.required}
          className="input"
        />
      )}
    </div>
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} className="form-shell space-y-5" noValidate={false}>
      <h3 className="t-h3">{t("formTitle")}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {field("name", t("form.name"), { required: true })}
        {field("company", t("form.company"))}
        {field("phone", t("form.phone"), { type: "tel", required: true })}
        {field("email", t("form.email"), { type: "email" })}
        {field("productType", t("form.productType"))}
        {field("technique", t("form.technique"))}
        {field("dimensions", t("form.dimensions"))}
        {field("quantity", t("form.quantity"))}
        {field("colourCount", t("form.colourCount"))}
        {field("fileFormat", t("form.fileFormat"))}
        {field("deadline", t("form.deadline"), { type: "date" })}
      </div>
      {field("details", t("form.details"), { textarea: true })}
      <div className="form-callout">
        <p className="t-micro">{t("form.files")}</p>
        <p className="t-meta mt-2">{filesDeferredCopy}</p>
        <p className="t-meta mt-2">{t("confidential")}</p>
      </div>
      <div key={challengeVersion}>
        <TurnstileWidget onToken={setToken} />
      </div>
      <div role="alert" aria-live="assertive" className="empty:hidden">
        {error ? <p className="field-error">{error}</p> : null}
      </div>
      <p className="t-meta">
        {t("form.privacyNote")}{" "}
        <Link href="/privacy" className="link-thread">{tf("privacy")}</Link>
      </p>
      <button
        type="submit"
        disabled={busy}
        aria-busy={busy || undefined}
        className="act act-primary w-full md:w-auto"
      >
        {busy ? t("form.submitting") : t("form.submit")}
      </button>
      <p aria-live="polite" className="sr-only">
        {busy ? t("form.submitting") : ""}
      </p>
    </form>
  );
}
