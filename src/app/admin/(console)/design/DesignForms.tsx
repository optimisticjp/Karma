"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { DESIGN_STATUSES, type DesignStatus } from "@/lib/admin/design";
import type { DesignCopy } from "@/lib/admin/design-copy";
import { createDesignJobAction, updateDesignJobAction, updateDesignStatusAction, type DesignState } from "./actions";

const IDLE: DesignState = { status: "idle", message: null };

export type DesignValue = {
  id: number;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  productType: string | null;
  technique: string | null;
  dimensions: string | null;
  quantity: string | null;
  colourCount: string | null;
  fileFormat: string | null;
  deadline: string | null;
  details: string | null;
  locale: "en" | "gu";
};

function Message({ state, copy }: { state: DesignState; copy: DesignCopy }) {
  if (state.status === "idle" || !state.message) return <div aria-live="polite" />;
  const dict = state.status === "success" ? copy.success : copy.errors;
  const text = dict[state.message as keyof typeof dict] ?? copy.errors.generic;
  return <p role="alert" className={`alert ${state.status === "success" ? "alert-success" : "alert-error"}`}>{text}</p>;
}
function Submit({ label, busy }: { label: string; busy: string }) { const { pending } = useFormStatus(); return <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? busy : label}</button>; }

export function DesignJobForm({ copy, value }: { copy: DesignCopy; value?: DesignValue }) {
  const editing = Boolean(value);
  const [state, action] = useActionState<DesignState, FormData>(editing ? updateDesignJobAction : createDesignJobAction, IDLE);
  return (
    <form action={action} className="grid gap-5">
      {value ? <input type="hidden" name="enquiryId" value={value.id} /> : null}
      <Message state={state} copy={copy} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.client} htmlFor={`design-name-${value?.id ?? "new"}`}><input id={`design-name-${value?.id ?? "new"}`} name="name" className="input" required maxLength={160} defaultValue={value?.name ?? ""} /></Field>
        <Field label={copy.company} htmlFor={`design-company-${value?.id ?? "new"}`}><input id={`design-company-${value?.id ?? "new"}`} name="company" className="input" maxLength={160} defaultValue={value?.company ?? ""} /></Field>
        <Field label={copy.phone} htmlFor={`design-phone-${value?.id ?? "new"}`}><input id={`design-phone-${value?.id ?? "new"}`} name="phone" className="input" required inputMode="tel" maxLength={20} defaultValue={value?.phone ?? ""} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.email} htmlFor={`design-email-${value?.id ?? "new"}`}><input id={`design-email-${value?.id ?? "new"}`} name="email" className="input" type="email" maxLength={160} defaultValue={value?.email ?? ""} /></Field>
        <Field label={copy.language} htmlFor={`design-locale-${value?.id ?? "new"}`}><select id={`design-locale-${value?.id ?? "new"}`} name="locale" className="input" defaultValue={value?.locale ?? "en"}><option value="gu">ગુજરાતી</option><option value="en">English</option></select></Field>
        <Field label={copy.deadline} htmlFor={`design-deadline-${value?.id ?? "new"}`}><input id={`design-deadline-${value?.id ?? "new"}`} name="deadline" className="input" type="date" defaultValue={value?.deadline ?? ""} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label={copy.productType} htmlFor={`design-product-${value?.id ?? "new"}`}><input id={`design-product-${value?.id ?? "new"}`} name="productType" className="input" maxLength={120} defaultValue={value?.productType ?? ""} /></Field>
        <Field label={copy.technique} htmlFor={`design-technique-${value?.id ?? "new"}`}><input id={`design-technique-${value?.id ?? "new"}`} name="technique" className="input" maxLength={120} defaultValue={value?.technique ?? ""} /></Field>
        <Field label={copy.dimensions} htmlFor={`design-size-${value?.id ?? "new"}`}><input id={`design-size-${value?.id ?? "new"}`} name="dimensions" className="input" maxLength={120} defaultValue={value?.dimensions ?? ""} /></Field>
        <Field label={copy.quantity} htmlFor={`design-quantity-${value?.id ?? "new"}`}><input id={`design-quantity-${value?.id ?? "new"}`} name="quantity" className="input" maxLength={60} defaultValue={value?.quantity ?? ""} /></Field>
        <Field label={copy.colourCount} htmlFor={`design-colours-${value?.id ?? "new"}`}><input id={`design-colours-${value?.id ?? "new"}`} name="colourCount" className="input" maxLength={40} defaultValue={value?.colourCount ?? ""} /></Field>
      </div>
      <Field label={copy.fileFormat} htmlFor={`design-format-${value?.id ?? "new"}`}><input id={`design-format-${value?.id ?? "new"}`} name="fileFormat" className="input" maxLength={60} defaultValue={value?.fileFormat ?? ""} placeholder="DST / EMB / PDF / AI…" /></Field>
      <Field label={copy.details} htmlFor={`design-details-${value?.id ?? "new"}`}><textarea id={`design-details-${value?.id ?? "new"}`} name="details" className="input min-h-28" maxLength={4000} defaultValue={value?.details ?? ""} placeholder={copy.detailsPlaceholder} /></Field>
      <div><Submit label={editing ? copy.saveStage : copy.create} busy={copy.creating} /></div>
    </form>
  );
}

export function DesignStatusForm({ enquiryId, status, copy }: { enquiryId: number; status: DesignStatus; copy: DesignCopy }) {
  const [state, action] = useActionState<DesignState, FormData>(updateDesignStatusAction, IDLE);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-[15rem_1fr_auto] md:items-end">
      <input type="hidden" name="enquiryId" value={enquiryId} />
      <Message state={state} copy={copy} />
      <Field label={copy.stage} htmlFor={`design-stage-${enquiryId}`}><select id={`design-stage-${enquiryId}`} name="status" className="input" defaultValue={status}>{DESIGN_STATUSES.map((item) => <option key={item} value={item}>{copy.statuses[item]}</option>)}</select></Field>
      <Field label={copy.stageNote} htmlFor={`design-note-${enquiryId}`}><input id={`design-note-${enquiryId}`} name="note" className="input" maxLength={300} placeholder={copy.stageNotePlaceholder} /></Field>
      <Submit label={copy.saveStage} busy={copy.saving} />
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }
