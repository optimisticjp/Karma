"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { StudentsCopy } from "@/lib/admin/students-copy";
import { ENROLLMENT_STATUSES, type EnrollmentStatus } from "@/lib/admin/students";
import {
  addEnrollmentAction,
  convertApplicationAction,
  directAdmissionAction,
  updateEnrollmentAction,
  updateStudentAction,
  type StudentsState
} from "./actions";

const IDLE: StudentsState = { status: "idle", message: null };

export type BatchOption = { id: number; label: string; courseName: string; seats: number; seatsTaken: number; status: string };
export type EnquiryOption = { id: number; reference: string; fullName: string; courseSlug: string | null };
export type StudentEditValue = {
  id: number;
  fullName: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  area: string | null;
  /**
   * Which language this student is taught in.
   *
   * Karma teaches in Gujarati AND Hindi — a business fact, recorded in
   * `TEACHING_LANGUAGES` and published as `availableLanguage`. This column
   * cannot yet record "Hindi" because it shares the `{en, gu}` Postgres enum
   * with the website-locale columns, and widening it needs an applied
   * migration. A `hi` option was briefly offered here on 2026-08-31 while
   * that migration sat unapplied, which would have failed on save.
   *
   * ⚠ CONFIRM-WITH-OWNER: whether staff need to record a Hindi-preferring
   * student. If so this becomes its own enum, not a wider shared one.
   */
  languagePref: "en" | "gu";
  isMinor: boolean;
  photoConsent: boolean;
  notes: string | null;
  fatherName: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianRelation: string | null;
  referenceName: string | null;
  referencePhone: string | null;
};

function Message({ state, copy }: { state: StudentsState; copy: StudentsCopy }) {
  if (state.status === "idle" || !state.message) return <div aria-live="polite" />;
  const dictionary = state.status === "success" ? copy.success : copy.errors;
  const text = dictionary[state.message as keyof typeof dictionary] ?? copy.errors.generic;
  return <p role="alert" className={`alert ${state.status === "success" ? "alert-success" : "alert-error"}`}>{text}</p>;
}

function Submit({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? busy : label}</button>;
}

/**
 * The person half of the formal admission record, matching the institute's own
 * printed form: student, father, guardian, reference.
 *
 * `requireGuardian` is set on a NEW formal admission (owner decision,
 * 2026-08-30) and left off when editing an existing student, because the edit
 * form also has to be able to correct a record admitted before the rule
 * existed. The server applies exactly the same distinction — this attribute is
 * a courtesy to the operator, not the enforcement.
 */
function PersonFields({
  copy,
  value,
  requireGuardian = false
}: {
  copy: StudentsCopy;
  value?: StudentEditValue;
  requireGuardian?: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.fullName} htmlFor={`student-name-${value?.id ?? "new"}`}>
          <input id={`student-name-${value?.id ?? "new"}`} name="fullName" className="input" required maxLength={160} defaultValue={value?.fullName ?? ""} />
        </Field>
        <Field label={copy.phone} htmlFor={`student-phone-${value?.id ?? "new"}`}>
          <input id={`student-phone-${value?.id ?? "new"}`} name="phone" className="input" required inputMode="tel" maxLength={20} defaultValue={value?.phone ?? ""} />
        </Field>
        <Field label={copy.whatsapp} htmlFor={`student-whatsapp-${value?.id ?? "new"}`}>
          <input id={`student-whatsapp-${value?.id ?? "new"}`} name="whatsapp" className="input" inputMode="tel" maxLength={20} defaultValue={value?.whatsapp ?? ""} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.email} htmlFor={`student-email-${value?.id ?? "new"}`}>
          <input id={`student-email-${value?.id ?? "new"}`} name="email" className="input" type="email" maxLength={160} defaultValue={value?.email ?? ""} />
        </Field>
        <Field label={copy.area} htmlFor={`student-area-${value?.id ?? "new"}`}>
          <input id={`student-area-${value?.id ?? "new"}`} name="area" className="input" maxLength={160} defaultValue={value?.area ?? ""} placeholder="Mota Varachha" />
        </Field>
        <Field label={copy.language} htmlFor={`student-language-${value?.id ?? "new"}`}>
          <select id={`student-language-${value?.id ?? "new"}`} name="languagePref" className="input" defaultValue={value?.languagePref ?? "gu"}>
            <option value="gu">{copy.languageGu}</option><option value="en">{copy.languageEn}</option>
          </select>
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="choice-chip text-smallmeta"><input type="checkbox" name="isMinor" className="size-4 accent-vermilion" defaultChecked={value?.isMinor ?? false} />{copy.minor}</label>
        <label className="choice-chip text-smallmeta"><input type="checkbox" name="photoConsent" className="size-4 accent-vermilion" defaultChecked={value?.photoConsent ?? false} />{copy.photoConsent}</label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.fatherName} htmlFor={`father-name-${value?.id ?? "new"}`}><input id={`father-name-${value?.id ?? "new"}`} name="fatherName" className="input" maxLength={160} defaultValue={value?.fatherName ?? ""} /></Field>
        <Field label={copy.guardianName} htmlFor={`guardian-name-${value?.id ?? "new"}`}><input id={`guardian-name-${value?.id ?? "new"}`} name="guardianName" className="input" maxLength={160} defaultValue={value?.guardianName ?? ""} /></Field>
        <Field label={copy.guardianRelation} htmlFor={`guardian-relation-${value?.id ?? "new"}`}><input id={`guardian-relation-${value?.id ?? "new"}`} name="guardianRelation" className="input" maxLength={60} defaultValue={value?.guardianRelation ?? ""} placeholder="Mother / Father" /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.guardianPhone} htmlFor={`guardian-phone-${value?.id ?? "new"}`}><input id={`guardian-phone-${value?.id ?? "new"}`} name="guardianPhone" className="input" required={requireGuardian} inputMode="tel" maxLength={20} defaultValue={value?.guardianPhone ?? ""} /></Field>
        <Field label={copy.referenceName} htmlFor={`reference-name-${value?.id ?? "new"}`}><input id={`reference-name-${value?.id ?? "new"}`} name="referenceName" className="input" maxLength={160} defaultValue={value?.referenceName ?? ""} /></Field>
        <Field label={copy.referencePhone} htmlFor={`reference-phone-${value?.id ?? "new"}`}><input id={`reference-phone-${value?.id ?? "new"}`} name="referencePhone" className="input" inputMode="tel" maxLength={20} defaultValue={value?.referencePhone ?? ""} /></Field>
      </div>
      <p className="form-note">{requireGuardian ? copy.guardianRequiredHint : copy.referenceHint}</p>
      <Field label={copy.notes} htmlFor={`student-notes-${value?.id ?? "new"}`}><textarea id={`student-notes-${value?.id ?? "new"}`} name="notes" className="input min-h-24" maxLength={2000} defaultValue={value?.notes ?? ""} /></Field>
    </>
  );
}

export function DirectAdmissionForm({ batches, copy }: { batches: BatchOption[]; copy: StudentsCopy }) {
  const [state, action] = useActionState<StudentsState, FormData>(directAdmissionAction, IDLE);
  return (
    <form action={action} className="grid gap-5">
      <Message state={state} copy={copy} />
      <PersonFields copy={copy} requireGuardian />
      <div className="grid gap-4 md:grid-cols-2">
        <BatchField batches={batches} copy={copy} id="direct-batch" />
        <Field label={copy.joinedOn} htmlFor="direct-joined"><input id="direct-joined" name="joinedOn" type="date" className="input" /></Field>
      </div>
      <div><Submit label={copy.createAdmission} busy={copy.saving} /></div>
    </form>
  );
}

export function ConvertEnquiryForm({ enquiries, batches, copy }: { enquiries: EnquiryOption[]; batches: BatchOption[]; copy: StudentsCopy }) {
  const [state, action] = useActionState<StudentsState, FormData>(convertApplicationAction, IDLE);
  return (
    <form action={action} className="grid gap-5">
      <Message state={state} copy={copy} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={copy.selectEnquiry} htmlFor="convert-enquiry">
          <select id="convert-enquiry" name="applicationId" className="input" required defaultValue="">
            <option value="" disabled>{copy.choose}</option>
            {enquiries.map((e) => <option key={e.id} value={e.id}>{e.reference} · {e.fullName}</option>)}
          </select>
        </Field>
        <BatchField batches={batches} copy={copy} id="convert-batch" />
        <Field label={copy.joinedOn} htmlFor="convert-joined"><input id="convert-joined" name="joinedOn" type="date" className="input" /></Field>
      </div>
      <div><Submit label={copy.convert} busy={copy.converting} /></div>
    </form>
  );
}

export function StudentEditForm({ value, copy }: { value: StudentEditValue; copy: StudentsCopy }) {
  const [state, action] = useActionState<StudentsState, FormData>(updateStudentAction, IDLE);
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="studentId" value={value.id} />
      <Message state={state} copy={copy} />
      <PersonFields copy={copy} value={value} />
      <div><Submit label={copy.save} busy={copy.saving} /></div>
    </form>
  );
}

export function AddEnrollmentForm({ studentId, batches, copy }: { studentId: number; batches: BatchOption[]; copy: StudentsCopy }) {
  const [state, action] = useActionState<StudentsState, FormData>(addEnrollmentAction, IDLE);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-[1fr_12rem_auto] md:items-end">
      <input type="hidden" name="studentId" value={studentId} />
      <Message state={state} copy={copy} />
      <BatchField batches={batches} copy={copy} id={`add-batch-${studentId}`} />
      <Field label={copy.joinedOn} htmlFor={`add-joined-${studentId}`}><input id={`add-joined-${studentId}`} name="joinedOn" type="date" className="input" /></Field>
      <Submit label={copy.enroll} busy={copy.saving} />
    </form>
  );
}

export function EnrollmentStatusForm({ enrollmentId, status, completedOn, copy }: { enrollmentId: number; status: EnrollmentStatus; completedOn: string | null; copy: StudentsCopy }) {
  const [state, action] = useActionState<StudentsState, FormData>(updateEnrollmentAction, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
        <input type="hidden" name="enrollmentId" value={enrollmentId} />
        <Message state={state} copy={copy} />
        <Field label={copy.status} htmlFor={`enrollment-status-${enrollmentId}`}>
          <select id={`enrollment-status-${enrollmentId}`} name="status" className="input" defaultValue={status}>
            {ENROLLMENT_STATUSES.map((item) => <option key={item} value={item}>{copy.statuses[item]}</option>)}
          </select>
        </Field>
        <Field label={copy.completedOn} htmlFor={`enrollment-completed-${enrollmentId}`}><input id={`enrollment-completed-${enrollmentId}`} name="completedOn" type="date" className="input" defaultValue={completedOn ?? ""} /></Field>
        <Submit label={copy.updateEnrollment} busy={copy.saving} />
      </form>
      <div className="flex justify-end">
        <Link
          className="text-smallmeta font-semibold text-error underline underline-offset-4"
          href={`/admin/records/enrollment/${enrollmentId}/delete`}
        >
          {copy.deleteEnrollment}
        </Link>
      </div>
    </div>
  );
}

function BatchField({ batches, copy, id }: { batches: BatchOption[]; copy: StudentsCopy; id: string }) {
  return (
    <Field label={copy.selectBatch} htmlFor={id}>
      <select id={id} name="batchId" className="input" required defaultValue="">
        <option value="" disabled>{copy.choose}</option>
        {batches.map((b) => <option key={b.id} value={b.id}>{b.courseName} · {b.label} · {Math.max(0, b.seats - b.seatsTaken)} seats</option>)}
      </select>
    </Field>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>;
}
