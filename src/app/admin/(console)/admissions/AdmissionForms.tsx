"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AdmissionsCopy } from "@/lib/admin/admissions-copy";
import {
  APPLICATION_STATUSES,
  MANUAL_ENQUIRY_SOURCES,
  type ApplicationStatus
} from "@/lib/admin/admissions";
import {
  addApplicationNoteAction,
  createManualEnquiryAction,
  updateApplicationAction,
  type AdmissionsState
} from "./actions";

const IDLE: AdmissionsState = { status: "idle", message: null };

type StaffOption = { id: number; name: string };
type CourseOption = { slug: string; name: string };

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

export function ManualEnquiryForm({
  staff,
  courses,
  defaultAssignee,
  copy
}: {
  staff: StaffOption[];
  courses: CourseOption[];
  defaultAssignee: number;
  copy: AdmissionsCopy;
}) {
  const [state, formAction] = useActionState<AdmissionsState, FormData>(createManualEnquiryAction, IDLE);

  return (
    <form action={formAction} className="grid gap-5">
      <ActionMessage state={state} copy={copy} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.enquirySource} htmlFor="manual-enquiry-source">
          <select id="manual-enquiry-source" name="heardFrom" className="input" defaultValue="walk_in">
            {MANUAL_ENQUIRY_SOURCES.map((source) => (
              <option key={source} value={source}>{copy.sourceLabels[source]}</option>
            ))}
          </select>
        </Field>
        <Field label={copy.fullName} htmlFor="manual-enquiry-name">
          <input id="manual-enquiry-name" name="fullName" className="input" required maxLength={160} autoComplete="name" />
        </Field>
        <Field label={copy.mobile} htmlFor="manual-enquiry-mobile">
          <input id="manual-enquiry-mobile" name="whatsapp" className="input" required inputMode="tel" maxLength={20} placeholder="98765 43210" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.email} htmlFor="manual-enquiry-email">
          <input id="manual-enquiry-email" name="email" className="input" type="email" maxLength={160} />
        </Field>
        <Field label={copy.language} htmlFor="manual-enquiry-locale">
          <select id="manual-enquiry-locale" name="locale" className="input" defaultValue="gu">
            <option value="gu">{copy.gujarati}</option>
            <option value="en">{copy.english}</option>
          </select>
        </Field>
        <Field label={copy.area} htmlFor="manual-enquiry-area">
          <input id="manual-enquiry-area" name="area" className="input" maxLength={160} placeholder="Mota Varachha" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.courseInterest} htmlFor="manual-enquiry-course">
          <select id="manual-enquiry-course" name="courseSlug" className="input" defaultValue="">
            <option value="">{copy.noCourseYet}</option>
            {courses.map((course) => <option key={course.slug} value={course.slug}>{course.name}</option>)}
          </select>
        </Field>
        <Field label={copy.timing} htmlFor="manual-enquiry-timing">
          <select id="manual-enquiry-timing" name="preferredTiming" className="input" defaultValue="">
            <option value="">{copy.timingChoose}</option>
            <option value="morning">{copy.morning}</option>
            <option value="evening">{copy.evening}</option>
          </select>
        </Field>
        <Field label={copy.assignedTo} htmlFor="manual-enquiry-assignee">
          <select id="manual-enquiry-assignee" name="assignedTo" className="input" defaultValue={String(defaultAssignee)}>
            <option value="">{copy.unassigned}</option>
            {staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.nextFollowUp} htmlFor="manual-enquiry-followup">
          <input id="manual-enquiry-followup" name="nextFollowUp" className="input" type="date" />
        </Field>
        <Field label={copy.ageBand} htmlFor="manual-enquiry-age">
          <select id="manual-enquiry-age" name="ageBand" className="input" defaultValue="">
            <option value="">{copy.ageChoose}</option>
            <option value="under18">Under 18</option>
            <option value="18-25">18–25</option>
            <option value="26-40">26–40</option>
            <option value="40plus">40+</option>
          </select>
        </Field>
        <div />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={copy.guardianName} htmlFor="manual-enquiry-guardian-name">
          <input id="manual-enquiry-guardian-name" name="guardianName" className="input" maxLength={160} />
        </Field>
        <Field label={copy.guardianPhone} htmlFor="manual-enquiry-guardian-phone">
          <input id="manual-enquiry-guardian-phone" name="guardianPhone" className="input" inputMode="tel" maxLength={20} />
        </Field>
      </div>

      <Field label={copy.enquiryNote} htmlFor="manual-enquiry-note">
        <textarea id="manual-enquiry-note" name="goal" className="input min-h-28" maxLength={2000} placeholder={copy.enquiryNotePlaceholder} />
      </Field>

      <div><SubmitButton label={copy.createEnquiry} busy={copy.creating} /></div>
    </form>
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
          <select id={`application-status-${applicationId}`} name="status" className="input" defaultValue={status}>
            {APPLICATION_STATUSES.map((item) => (
              <option key={item} value={item}>{copy.statuses[item]}</option>
            ))}
          </select>
        </Field>
        <Field label={copy.assignedTo} htmlFor={`application-assignee-${applicationId}`}>
          <select id={`application-assignee-${applicationId}`} name="assignedTo" className="input" defaultValue={assignedTo == null ? "" : String(assignedTo)}>
            <option value="">{copy.unassigned}</option>
            {staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </Field>
        <Field label={copy.nextFollowUp} htmlFor={`application-followup-${applicationId}`}>
          <input id={`application-followup-${applicationId}`} name="nextFollowUp" type="date" className="input" defaultValue={nextFollowUp ?? ""} />
        </Field>
      </div>
      <Field label={copy.closureReason} htmlFor={`application-closure-${applicationId}`}>
        <input id={`application-closure-${applicationId}`} name="closureReason" className="input" maxLength={200} defaultValue={closureReason ?? ""} />
      </Field>
      <div><SubmitButton label={copy.save} busy={copy.saving} /></div>
    </form>
  );
}

export function ApplicationNoteForm({ applicationId, copy }: { applicationId: number; copy: AdmissionsCopy }) {
  const [state, formAction] = useActionState<AdmissionsState, FormData>(addApplicationNoteAction, IDLE);
  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="applicationId" value={applicationId} />
      <ActionMessage state={state} copy={copy} />
      <Field label={copy.addNote} htmlFor={`application-note-${applicationId}`}>
        <textarea id={`application-note-${applicationId}`} name="note" className="input min-h-28" required maxLength={2000} placeholder={copy.notePlaceholder} />
      </Field>
      <div><SubmitButton label={copy.addNote} busy={copy.saving} /></div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>;
}
