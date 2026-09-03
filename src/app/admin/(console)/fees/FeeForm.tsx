"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FeesCopy } from "@/lib/admin/fees-copy";
import { FEE_METHODS } from "@/lib/admin/fees";
import { addFeeRecordAction, updateAgreementAction, type FeeState } from "./actions";

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
  discount,
  dueDate,
  copy
}: {
  enrollmentId: number;
  discount: number;
  dueDate: string | null;
  copy: FeesCopy;
}) {
  const [state, action] = useActionState<FeeState, FormData>(addFeeRecordAction, IDLE);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="enrollmentId" value={enrollmentId} />
      <Message state={state} copy={copy} />
      <p className="form-note">{copy.paymentHint}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.receivedNow} htmlFor={`fee-received-${enrollmentId}`}>
          <input id={`fee-received-${enrollmentId}`} name="received" type="number" min={0} step={1} className="input" required defaultValue={0} inputMode="numeric" />
        </Field>
        <Field label={copy.method} htmlFor={`fee-method-${enrollmentId}`}>
          <select id={`fee-method-${enrollmentId}`} name="method" className="input" defaultValue="">
            <option value="">—</option>{FEE_METHODS.map((method) => <option key={method} value={method}>{copy.methods[method]}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.dueDate} htmlFor={`fee-due-${enrollmentId}`}>
          <input id={`fee-due-${enrollmentId}`} name="dueDate" type="date" className="input" defaultValue={dueDate ?? ""} />
        </Field>
        <Field label={copy.notes} htmlFor={`fee-note-${enrollmentId}`}>
          <input id={`fee-note-${enrollmentId}`} name="notes" className="input" maxLength={300} />
        </Field>
      </div>
      <details className="border-t border-rule pt-3">
        <summary className="cursor-pointer text-smallmeta font-semibold">{copy.moreOptions}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={copy.discountTotal} htmlFor={`fee-discount-${enrollmentId}`}>
            <input id={`fee-discount-${enrollmentId}`} name="discount" type="number" min={discount} step={1} className="input" defaultValue={discount} inputMode="numeric" />
            <p className="form-note mt-1">{copy.discountHint}</p>
          </Field>
          <Field label={copy.receiptNo} htmlFor={`fee-receipt-${enrollmentId}`}>
            <input id={`fee-receipt-${enrollmentId}`} name="receiptNo" className="input" maxLength={40} />
          </Field>
        </div>
      </details>
      <div><Submit copy={copy} /></div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }

/**
 * Changes what an existing student agreed to pay.
 *
 * Deliberately not part of the payment form. Recording a payment is a daily
 * act; moving a student's agreed fee is a rare one that changes what they owe,
 * so it lives behind its own disclosure, needs a written reason, and is audited
 * with its before and after.
 */
export function AgreementForm({
  enrollmentId,
  agreedFeeTotal,
  agreedAdmissionAmount,
  agreedBalanceDueOn,
  copy
}: {
  enrollmentId: number;
  agreedFeeTotal: number | null;
  agreedAdmissionAmount: number | null;
  agreedBalanceDueOn: string | null;
  copy: FeesCopy;
}) {
  const [state, action] = useActionState<FeeState, FormData>(updateAgreementAction, IDLE);
  const id = (name: string) => `agreement-${name}-${enrollmentId}`;
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="enrollmentId" value={enrollmentId} />
      <Message state={state} copy={copy} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={copy.agreedFeeTotal} htmlFor={id("total")}>
          <input id={id("total")} name="agreedFeeTotal" type="number" min={0} step={1} className="input" defaultValue={agreedFeeTotal ?? ""} />
        </Field>
        <Field label={copy.agreedAdmissionAmount} htmlFor={id("admission")}>
          <input id={id("admission")} name="agreedAdmissionAmount" type="number" min={0} step={1} className="input" defaultValue={agreedAdmissionAmount ?? ""} />
        </Field>
        <Field label={copy.agreedBalanceDueOn} htmlFor={id("due")}>
          <input id={id("due")} name="agreedBalanceDueOn" type="date" className="input" defaultValue={agreedBalanceDueOn ?? ""} />
        </Field>
      </div>
      <Field label={copy.agreementReason} htmlFor={id("reason")}>
        <input id={id("reason")} name="reason" className="input" required minLength={3} maxLength={300} />
      </Field>
      <div><AgreementSubmit copy={copy} /></div>
    </form>
  );
}

function AgreementSubmit({ copy }: { copy: FeesCopy }) {
  const { pending } = useFormStatus();
  return <button className="btn btn-secondary" type="submit" disabled={pending}>{pending ? copy.saving : copy.saveAgreement}</button>;
}
