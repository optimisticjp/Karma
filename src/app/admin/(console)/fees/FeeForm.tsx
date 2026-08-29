"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FeesCopy } from "@/lib/admin/fees-copy";
import { FEE_METHODS } from "@/lib/admin/fees";
import { addFeeRecordAction, type FeeState } from "./actions";

const IDLE: FeeState = { status: "idle", message: null };

function Message({ state, copy }: { state: FeeState; copy: FeesCopy }) {
  if (state.status === "idle" || !state.message) return <div aria-live="polite" />;
  const dictionary = state.status === "success" ? copy.success : copy.errors;
  const text = dictionary[state.message as keyof typeof dictionary] ?? copy.errors.generic;
  return <p role="alert" className={`alert ${state.status === "success" ? "alert-success" : "alert-error"}`}>{text}</p>;
}

function Submit({ copy }: { copy: FeesCopy }) {
  const { pending } = useFormStatus();
  return <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? copy.saving : copy.save}</button>;
}

export function FeeEntryForm({
  enrollmentId,
  courseFee,
  discount,
  dueDate,
  copy
}: {
  enrollmentId: number;
  courseFee: number;
  discount: number;
  dueDate: string | null;
  copy: FeesCopy;
}) {
  const [state, action] = useActionState<FeeState, FormData>(addFeeRecordAction, IDLE);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="enrollmentId" value={enrollmentId} />
      <Message state={state} copy={copy} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={copy.courseFee} htmlFor={`fee-total-${enrollmentId}`}><input id={`fee-total-${enrollmentId}`} name="courseFee" type="number" min={0} step={1} className="input" required defaultValue={courseFee} /></Field>
        <Field label={copy.discount} htmlFor={`fee-discount-${enrollmentId}`}><input id={`fee-discount-${enrollmentId}`} name="discount" type="number" min={0} step={1} className="input" required defaultValue={discount} /></Field>
        <Field label={copy.receivedNow} htmlFor={`fee-received-${enrollmentId}`}><input id={`fee-received-${enrollmentId}`} name="received" type="number" min={0} step={1} className="input" required defaultValue={0} /></Field>
        <Field label={copy.method} htmlFor={`fee-method-${enrollmentId}`}>
          <select id={`fee-method-${enrollmentId}`} name="method" className="input" defaultValue="">
            <option value="">—</option>{FEE_METHODS.map((method) => <option key={method} value={method}>{copy.methods[method]}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={copy.receiptNo} htmlFor={`fee-receipt-${enrollmentId}`}><input id={`fee-receipt-${enrollmentId}`} name="receiptNo" className="input" maxLength={40} /></Field>
        <Field label={copy.dueDate} htmlFor={`fee-due-${enrollmentId}`}><input id={`fee-due-${enrollmentId}`} name="dueDate" type="date" className="input" defaultValue={dueDate ?? ""} /></Field>
        <Field label={copy.notes} htmlFor={`fee-note-${enrollmentId}`}><input id={`fee-note-${enrollmentId}`} name="notes" className="input" maxLength={300} /></Field>
      </div>
      <div><Submit copy={copy} /></div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }
