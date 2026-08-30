"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CatalogCopy } from "@/lib/admin/courses-copy";
import { BATCH_STATUSES, COURSE_FAMILIES, type BatchStatus, type CourseFamily } from "@/lib/admin/course-validation";
/* Pure, dependency-free helpers — safe and cheap to pull into the client bundle. */
import { SLOT_ROWS, type operationsToForm } from "@/lib/admin/course-operations";
import {
  createBatchAction,
  createCourseAction,
  updateBatchAction,
  updateCourseAction,
  type CatalogState
} from "./actions";

const IDLE: CatalogState = { status: "idle", message: null };

type TrainerOption = { id: number; name: string };

export type CourseFormValue = {
  id: number;
  slug: string;
  nameEn: string;
  nameGu: string;
  family: CourseFamily;
  durationWeeks: number | null;
  durationMonths: number | null;
  software: string | null;
  feeTotal: number | null;
  feeAdmission: number | null;
  feeBalanceDueDays: number | null;
  termsVersion: number | null;
  publicVisible: boolean;
  sortOrder: number;
  active: boolean;
  /** The bounded lists, flattened for the form. */
  operations: ReturnType<typeof operationsToForm>;
};

export type BatchFormValue = {
  id: number;
  courseId: number;
  label: string;
  days: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string | null;
  seats: number;
  language: string;
  trainerId: number | null;
  status: BatchStatus;
};

function ActionMessage({ state, copy }: { state: CatalogState; copy: CatalogCopy }) {
  if (state.status === "idle" || !state.message) return <div aria-live="polite" />;
  const text =
    state.status === "success"
      ? copy.success[state.message as keyof CatalogCopy["success"]] ?? copy.errors.generic
      : copy.errors[state.message as keyof CatalogCopy["errors"]] ?? copy.errors.generic;
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

export function CourseForm({ value, copy }: { value?: CourseFormValue; copy: CatalogCopy }) {
  const editing = Boolean(value);
  const id = (name: string) => `course-${name}-${value?.id ?? "new"}`;
  const [state, formAction] = useActionState<CatalogState, FormData>(
    editing ? updateCourseAction : createCourseAction,
    IDLE
  );

  return (
    <form action={formAction} className="grid gap-5">
      {editing ? <input type="hidden" name="courseId" value={value?.id} /> : null}
      <ActionMessage state={state} copy={copy} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.courseFields.nameEn} htmlFor={`course-name-en-${value?.id ?? "new"}`}>
          <input
            id={`course-name-en-${value?.id ?? "new"}`}
            name="nameEn"
            className="input"
            required
            maxLength={160}
            defaultValue={value?.nameEn ?? ""}
          />
        </Field>
        <Field label={copy.courseFields.nameGu} htmlFor={`course-name-gu-${value?.id ?? "new"}`}>
          <input
            id={`course-name-gu-${value?.id ?? "new"}`}
            name="nameGu"
            className="input"
            required
            maxLength={160}
            defaultValue={value?.nameGu ?? ""}
          />
        </Field>
      </div>

      <Field label={copy.courseFields.slug} htmlFor={`course-slug-${value?.id ?? "new"}`}>
        <input
          id={`course-slug-${value?.id ?? "new"}`}
          name="slug"
          className="input"
          required
          maxLength={80}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          defaultValue={value?.slug ?? ""}
        />
        <p className="form-note mt-1.5">{copy.courseFields.slugHint}</p>
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={copy.courseFields.family} htmlFor={`course-family-${value?.id ?? "new"}`}>
          <select
            id={`course-family-${value?.id ?? "new"}`}
            name="family"
            className="input"
            defaultValue={value?.family ?? "machine"}
          >
            {COURSE_FAMILIES.map((family) => (
              <option key={family} value={family}>
                {copy.families[family]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.courseFields.durationWeeks} htmlFor={`course-duration-${value?.id ?? "new"}`}>
          <input
            id={`course-duration-${value?.id ?? "new"}`}
            name="durationWeeks"
            className="input"
            type="number"
            min={1}
            max={104}
            defaultValue={value?.durationWeeks ?? ""}
          />
        </Field>
        <Field label={copy.courseFields.sortOrder} htmlFor={`course-sort-${value?.id ?? "new"}`}>
          <input
            id={`course-sort-${value?.id ?? "new"}`}
            name="sortOrder"
            className="input"
            type="number"
            min={-999}
            max={999}
            defaultValue={value?.sortOrder ?? 0}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="choice-chip text-smallmeta w-fit">
          <input
            type="checkbox"
            name="active"
            className="size-4 accent-vermilion"
            defaultChecked={value?.active ?? true}
          />
          {copy.courseFields.active}
        </label>
        <label className="choice-chip text-smallmeta w-fit">
          <input
            type="checkbox"
            name="publicVisible"
            className="size-4 accent-vermilion"
            defaultChecked={value?.publicVisible ?? true}
          />
          {copy.courseFields.publicVisible}
        </label>
      </div>

      {/* ------------------------ operational detail ------------------------
          Everything below describes how the course actually runs, and is what
          the public course page and the admission form read. Blank means "not
          stated" — never a guess. A duration is recorded in MONTHS where the
          owner has confirmed one; weeks is the older field and is left alone.
      */}
      <details className="border border-rule">
        <summary className="cursor-pointer px-4 py-3 text-smallmeta font-semibold">
          {copy.operations.title}
        </summary>
        <div className="grid gap-5 border-t border-rule p-4">
          <p className="form-note">{copy.operations.hint}</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={copy.operations.durationMonths} htmlFor={id("months")}>
              <input id={id("months")} name="durationMonths" className="input" type="number" min={1} max={60} defaultValue={value?.durationMonths ?? ""} />
            </Field>
            <Field label={copy.operations.software} htmlFor={id("software")}>
              <input id={id("software")} name="software" className="input" maxLength={80} defaultValue={value?.software ?? ""} />
            </Field>
            <Field label={copy.operations.termsVersion} htmlFor={id("terms")}>
              <input id={id("terms")} name="termsVersion" className="input" type="number" min={1} defaultValue={value?.termsVersion ?? ""} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={copy.operations.feeTotal} htmlFor={id("feeTotal")}>
              <input id={id("feeTotal")} name="feeTotal" className="input" type="number" min={0} defaultValue={value?.feeTotal ?? ""} />
            </Field>
            <Field label={copy.operations.feeAdmission} htmlFor={id("feeAdmission")}>
              <input id={id("feeAdmission")} name="feeAdmission" className="input" type="number" min={0} defaultValue={value?.feeAdmission ?? ""} />
            </Field>
            <Field label={copy.operations.feeBalanceDueDays} htmlFor={id("feeDays")}>
              <input id={id("feeDays")} name="feeBalanceDueDays" className="input" type="number" min={0} max={365} defaultValue={value?.feeBalanceDueDays ?? ""} />
            </Field>
          </div>

          <fieldset>
            <legend className="label">{copy.operations.schedule}</legend>
            <p className="form-note mb-3">{copy.operations.scheduleHint}</p>
            <div className="grid gap-2">
              {slotRows(value?.operations.schedule).map((slot, index) => (
                <div key={`sched-${index}`} className="grid grid-cols-2 gap-2">
                  <input aria-label={`${copy.operations.from} ${index + 1}`} name="scheduleStart" className="input" type="time" defaultValue={slot.startTime} />
                  <input aria-label={`${copy.operations.to} ${index + 1}`} name="scheduleEnd" className="input" type="time" defaultValue={slot.endTime} />
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">{copy.operations.demo}</legend>
            <p className="form-note mb-3">{copy.operations.demoHint}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={copy.operations.demoDays} htmlFor={id("demoDays")}>
                <input id={id("demoDays")} name="demoDays" className="input" type="number" min={0} max={31} defaultValue={String(value?.operations.demoDays ?? "")} />
              </Field>
              <Field label={copy.operations.demoHours} htmlFor={id("demoHours")}>
                <input id={id("demoHours")} name="demoHours" className="input" type="number" min={0} max={12} step={0.5} defaultValue={String(value?.operations.demoHours ?? "")} />
              </Field>
              <label className="choice-chip text-smallmeta self-end">
                <input type="checkbox" name="demoFree" className="size-4 accent-vermilion" defaultChecked={value?.operations.demoFree ?? true} />
                {copy.operations.demoFree}
              </label>
            </div>
            <div className="mt-3 grid gap-2">
              {slotRows(value?.operations.demoSlots).map((slot, index) => (
                <div key={`demo-${index}`} className="grid grid-cols-2 gap-2">
                  <input aria-label={`${copy.operations.demo} ${copy.operations.from} ${index + 1}`} name="demoStart" className="input" type="time" defaultValue={slot.startTime} />
                  <input aria-label={`${copy.operations.demo} ${copy.operations.to} ${index + 1}`} name="demoEnd" className="input" type="time" defaultValue={slot.endTime} />
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">{copy.operations.curriculum}</legend>
            <p className="form-note mb-3">{copy.operations.listHint}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="English" htmlFor={id("curEn")}>
                <textarea id={id("curEn")} name="curriculumEn" className="input min-h-32" defaultValue={value?.operations.curriculumEn ?? ""} />
              </Field>
              <Field label="ગુજરાતી" htmlFor={id("curGu")}>
                <textarea id={id("curGu")} name="curriculumGu" className="input min-h-32" defaultValue={value?.operations.curriculumGu ?? ""} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">{copy.operations.practical}</legend>
            <p className="form-note mb-3">{copy.operations.listHint}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="English" htmlFor={id("pracEn")}>
                <textarea id={id("pracEn")} name="practicalEn" className="input min-h-24" defaultValue={value?.operations.practicalEn ?? ""} />
              </Field>
              <Field label="ગુજરાતી" htmlFor={id("pracGu")}>
                <textarea id={id("pracGu")} name="practicalGu" className="input min-h-24" defaultValue={value?.operations.practicalGu ?? ""} />
              </Field>
            </div>
          </fieldset>
        </div>
      </details>

      <div>
        <SubmitButton
          label={editing ? copy.saveCourse : copy.createCourse}
          busy={copy.saving}
        />
      </div>
    </form>
  );
}

/** Always renders the full set of rows; blank ones are ignored on submit. */
function slotRows<T extends { startTime: string; endTime: string }>(
  rows: T[] | undefined
): Array<{ startTime: string; endTime: string }> {
  return Array.from({ length: SLOT_ROWS }, (_, i) => rows?.[i] ?? { startTime: "", endTime: "" });
}

export function BatchForm({
  courseId,
  value,
  trainers,
  copy
}: {
  courseId: number;
  value?: BatchFormValue;
  trainers: TrainerOption[];
  copy: CatalogCopy;
}) {
  const editing = Boolean(value);
  const [state, formAction] = useActionState<CatalogState, FormData>(
    editing ? updateBatchAction : createBatchAction,
    IDLE
  );

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="courseId" value={courseId} />
      {editing ? <input type="hidden" name="batchId" value={value?.id} /> : null}
      <ActionMessage state={state} copy={copy} />

      <Field label={copy.batchFields.label} htmlFor={`batch-label-${value?.id ?? `new-${courseId}`}`}>
        <input
          id={`batch-label-${value?.id ?? `new-${courseId}`}`}
          name="label"
          className="input"
          required
          maxLength={80}
          defaultValue={value?.label ?? ""}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={copy.batchFields.days} htmlFor={`batch-days-${value?.id ?? `new-${courseId}`}`}>
          <input
            id={`batch-days-${value?.id ?? `new-${courseId}`}`}
            name="days"
            className="input"
            required
            maxLength={60}
            placeholder="Mon-Sat"
            defaultValue={value?.days ?? ""}
          />
        </Field>
        <Field label={copy.batchFields.startTime} htmlFor={`batch-start-${value?.id ?? `new-${courseId}`}`}>
          <input
            id={`batch-start-${value?.id ?? `new-${courseId}`}`}
            name="startTime"
            className="input"
            type="time"
            required
            defaultValue={value?.startTime ?? ""}
          />
        </Field>
        <Field label={copy.batchFields.endTime} htmlFor={`batch-end-${value?.id ?? `new-${courseId}`}`}>
          <input
            id={`batch-end-${value?.id ?? `new-${courseId}`}`}
            name="endTime"
            className="input"
            type="time"
            required
            defaultValue={value?.endTime ?? ""}
          />
        </Field>
        <Field label={copy.batchFields.seats} htmlFor={`batch-seats-${value?.id ?? `new-${courseId}`}`}>
          <input
            id={`batch-seats-${value?.id ?? `new-${courseId}`}`}
            name="seats"
            className="input"
            type="number"
            min={1}
            max={500}
            required
            defaultValue={value?.seats ?? 10}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.batchFields.startDate} htmlFor={`batch-date-${value?.id ?? `new-${courseId}`}`}>
          <input
            id={`batch-date-${value?.id ?? `new-${courseId}`}`}
            name="startDate"
            className="input"
            type="date"
            required
            defaultValue={value?.startDate ?? ""}
          />
        </Field>
        <Field label={copy.batchFields.endDate} htmlFor={`batch-end-date-${value?.id ?? `new-${courseId}`}`}>
          <input
            id={`batch-end-date-${value?.id ?? `new-${courseId}`}`}
            name="endDate"
            className="input"
            type="date"
            defaultValue={value?.endDate ?? ""}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={copy.batchFields.language} htmlFor={`batch-language-${value?.id ?? `new-${courseId}`}`}>
          <input
            id={`batch-language-${value?.id ?? `new-${courseId}`}`}
            name="language"
            className="input"
            required
            maxLength={60}
            defaultValue={value?.language ?? "ગુજરાતી + Hindi"}
          />
        </Field>
        <Field label={copy.batchFields.trainer} htmlFor={`batch-trainer-${value?.id ?? `new-${courseId}`}`}>
          <select
            id={`batch-trainer-${value?.id ?? `new-${courseId}`}`}
            name="trainerId"
            className="input"
            defaultValue={value?.trainerId == null ? "" : String(value.trainerId)}
          >
            <option value="">{copy.noTrainer}</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.batchFields.status} htmlFor={`batch-status-${value?.id ?? `new-${courseId}`}`}>
          <select
            id={`batch-status-${value?.id ?? `new-${courseId}`}`}
            name="status"
            className="input"
            defaultValue={value?.status ?? "open"}
          >
            {BATCH_STATUSES.map((status) => (
              <option key={status} value={status}>
                {copy.statuses[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <SubmitButton
          label={editing ? copy.saveBatch : copy.createBatch}
          busy={copy.saving}
        />
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
