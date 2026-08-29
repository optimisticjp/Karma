"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CertificatesCopy } from "@/lib/admin/certificates-copy";
import { issueCertificateAction, revokeCertificateAction, type CertificateState } from "./actions";

const IDLE: CertificateState = { status: "idle", message: null };

function Message({ state, copy }: { state: CertificateState; copy: CertificatesCopy }) {
  if (state.status === "idle" || !state.message) return <div aria-live="polite" />;
  const dictionary = state.status === "success" ? copy.success : copy.errors;
  const text = dictionary[state.message as keyof typeof dictionary] ?? copy.errors.generic;
  return <p role="alert" className={`alert ${state.status === "success" ? "alert-success" : "alert-error"}`}>{text}</p>;
}

function Submit({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? busy : label}</button>;
}

export function IssueCertificateForm({ enrollmentId, copy }: { enrollmentId: number; copy: CertificatesCopy }) {
  const [state, action] = useActionState<CertificateState, FormData>(issueCertificateAction, IDLE);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
      <input type="hidden" name="enrollmentId" value={enrollmentId} />
      <Message state={state} copy={copy} />
      <Field label={copy.issuedOn} htmlFor={`cert-date-${enrollmentId}`}><input id={`cert-date-${enrollmentId}`} name="issuedOn" type="date" className="input" required defaultValue={today()} /></Field>
      <Field label={copy.grade} htmlFor={`cert-grade-${enrollmentId}`}><input id={`cert-grade-${enrollmentId}`} name="grade" className="input" maxLength={40} /></Field>
      <Submit label={copy.issue} busy={copy.issuing} />
    </form>
  );
}

export function RevokeCertificateForm({ certificateId, copy }: { certificateId: number; copy: CertificatesCopy }) {
  const [state, action] = useActionState<CertificateState, FormData>(revokeCertificateAction, IDLE);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <input type="hidden" name="certificateId" value={certificateId} />
      <Message state={state} copy={copy} />
      <Field label={copy.revokeReason} htmlFor={`cert-revoke-${certificateId}`}><input id={`cert-revoke-${certificateId}`} name="reason" className="input" required minLength={3} maxLength={300} placeholder={copy.revokePlaceholder} /></Field>
      <Submit label={copy.revoke} busy={copy.revoking} />
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }
function today() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()); }
