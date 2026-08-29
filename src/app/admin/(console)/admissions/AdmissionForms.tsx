"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AdmissionsCopy } from "@/lib/admin/admissions-copy";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/admin/admissions";
import {
  addApplicationNoteAction,
  updateApplicationAction,
  type AdmissionsState
} from "./actions";

const IDLE: AdmissionsState = { status: "idle", message: null };

type StaffOption = { id: number; name: string };

function ActionMessage({ state, copy }: { state: AdmissionsState; copy: AdmissionsCopy }) {
  if (state.status === "idle" || !state.message) return <div aria-live="polite" />;
  const text =
    state.status === "success"
      ? copy.success[state.message as keyof AdmissionsCopy["success"]] ?? copy.errors.generic
      : copy.errors[state.message as keyof AdmissionsCopy["errors"]] ?? copy.errors.generic;
  return (
    <div role="alert" aria-live="polite">
      <p className={`alert ${state.status === "success" ? "alert-success" : "alert-error"}`}>
        {text}
      </p>
    </div>
  );
}

function SubmitButton({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? busy : label}
    </button>
  );
}

export function ApplicationUpdateForm({
  applicationId,
  status,
  assignedTo,
  nextFollowUp,
  closureReason,
  staff,
  copy
}: {
  applicationId: number;
  status: ApplicationStatus;
  assignedTo: number | null;
  nextFollowUp: string | null;
  closureReason: string | null;
  staff: StaffOption[];
  copy: AdmissionsCopy;
}) {
  const [state, formAction] = useActionState<AdmissionsState, FormData>(updateApplicationAction, IDLE);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="applicationId" value={applicationId} />
      <ActionMessage state={state} copy={copy} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.statusFilter} htmlFor={`application-status-${applicationId}`}>
          <select
            id={`application-status-${applicationId}`}
            name="status"
            className="input"
            defaultValue={status}
          >
            {APPLICATION_STATUSES.map((item) => (
              <option key={item} value={item}>
                {copy.statuses[item]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.assignedTo} htmlFor={`application-assignee-${applicationId}`}>
          <select
            id={`application-assignee-${applicationId}`}
            name="assignedTo"
            className="input"
            defaultValue={assignedTo == null ? "" : String(assignedTo)}
          >
            <option value="">{copy.unassigned}</option>
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.nextFollowUp} htmlFor={`application-followup-${applicationId}`}>
          <input
            id={`application-followup-${applicationId}`}
            name="nextFollowUp"
            type="date"
            className="input"
            defaultValue={nextFollowUp ?? ""}
          />
        </Field>
      </div>
      <Field label={copy.closureReason} htmlFor={`application-closure-${applicationId}`}>
        <input
          id={`application-closure-${applicationId}`}
          name="closureReason"
          className="input"
          maxLength={200}
          defaultValue={closureReason ?? ""}
        />
      </Field>
      <div>
        <SubmitButton label={copy.save} busy={copy.saving} />
      </div>
    </form>
  );
}

export function ApplicationNoteForm({
  applicationId,
  copy
}: {
  applicationId: number;
  copy: AdmissionsCopy;
}) {
  const [state, formAction] = useActionState<AdmissionsState, FormData>(addApplicationNoteAction, IDLE);
  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="applicationId" value={applicationId} />
      <ActionMessage state={state} copy={copy} />
      <Field label={copy.addNote} htmlFor={`application-note-${applicationId}`}>
        <textarea
          id={`application-note-${applicationId}`}
          name="note"
          className="input min-h-28"
          required
          maxLength={2000}
          placeholder={copy.notePlaceholder}
        />
      </Field>
      <div>
        <SubmitButton label={copy.addNote} busy={copy.saving} />
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
