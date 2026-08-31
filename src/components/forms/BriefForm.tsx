"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TurnstileWidget } from "./TurnstileWidget";
import { waLink } from "@/lib/site";
/* The size and count guards stay live: the submit handler still checks
   anything that posts files, even with the input deferred. `ACCEPT_ATTR`
   comes back with the field — see the note in the form body. */
import { MAX_FILE_BYTES, MAX_FILES } from "@/lib/files";
import { Link } from "@/i18n/navigation";

/** B2B design brief (plan 9.6/10.2): one screen, files optional, quote by conversation. */
export function BriefForm() {
  const t = useTranslations("servicesPage");
  const te = useTranslations("admissionForm.errors");
  const tf = useTranslations("footer");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; filesStored: number } | null>(null);
  const [token, setToken] = useState<string | undefined>();
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);
    fd.set("startedAt", String(startedAt.current));
    if (token) fd.set("turnstileToken", token);

    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_FILES || files.some((f) => f.size > MAX_FILE_BYTES)) {
      setError(te("generic"));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/brief", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; reference?: string; filesStored?: number };
      if (!res.ok || !data.ok || !data.reference) throw new Error("failed");
      setDone({ reference: data.reference, filesStored: data.filesStored ?? 0 });
      form.reset();
    } catch {
      setError(te("generic"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <p className="text-h3 font-display">✔ {t("success.title")}</p>
        <p className="mt-3 text-smallmeta text-stone">{t("success.refLabel")}</p>
        <p className="font-mono text-lead font-bold text-vermilion-deep">{done.reference}</p>
        <p className="prose-measure mx-auto mt-4 text-stone">{t("success.body")}</p>
        <p className="mt-2 text-smallmeta text-stone">{t("success.files", { count: done.filesStored })}</p>
        <a
          href={waLink(t("success.waMessage", { ref: done.reference }))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-6"
        >
          {t("success.waButton")}
        </a>
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
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-5 p-3.5 md:p-5" noValidate={false}>
      <h3 className="text-h3 font-display">{t("formTitle")}</h3>
      <div className="grid gap-5 md:grid-cols-2">
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
      {/* Deferred upload, stated honestly.
       *
       * Private file storage (R2) is not switched on yet. With the binding
       * missing, an attached file either fails the request in production or is
       * silently dropped in demo mode — so offering a file input here would be
       * promising something that cannot happen, and losing a business's
       * artwork is the most expensive way to find that out.
       *
       * The field returns unchanged the day the bucket is bound; until then
       * the brief says how to send files, and the API still accepts them if
       * anything else posts one. `ACCEPT_ATTR` and the size limits stay
       * imported for exactly that restoration.
       */}
      <div className="seam-note seam-note-accent">
        <p className="label">{t("form.files")}</p>
        <p className="mt-2 text-xs text-stone">{t("form.filesDeferred")}</p>
        <p className="mt-2 text-xs text-stone">🔒 {t("confidential")}</p>
      </div>
      {/* Honeypot: hidden from humans, tempting to bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="brief-website">Website</label>
        <input id="brief-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <TurnstileWidget onToken={setToken} />
      {/* A persistent live region, not an element that appears on error.
          `role="alert"` on a node inserted into the DOM is announced by most
          screen readers most of the time; a region that is already present
          and then filled is announced reliably by all of them. */}
      <div role="alert" aria-live="assertive" className="empty:hidden">
        {error ? <p className="field-error">{error}</p> : null}
      </div>
      <p className="text-xs text-stone">
        {t("form.privacyNote")}{" "}
        <Link href="/privacy" className="stitch-link font-semibold">{tf("privacy")}</Link>
      </p>
      <button
        type="submit"
        disabled={busy}
        aria-busy={busy || undefined}
        className="btn btn-primary w-full md:w-auto"
      >
        {busy ? t("form.submitting") : t("form.submit")}
      </button>
      <p aria-live="polite" className="sr-only">
        {busy ? t("form.submitting") : ""}
      </p>
    </form>
  );
}
