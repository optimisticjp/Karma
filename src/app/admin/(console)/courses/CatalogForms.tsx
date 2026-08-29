"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CatalogCopy } from "@/lib/admin/courses-copy";
import { BATCH_STATUSES, COURSE_FAMILIES, type BatchStatus, type CourseFamily } from "@/lib/admin/course-validation";
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
  sortOrder: number;
  active: boolean;
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

      <label className="choice-chip text-smallmeta w-fit">
        <input
          type="checkbox"
          name="active"
          className="size-4 accent-vermilion"
          defaultChecked={value?.active ?? true}
        />
        {copy.courseFields.active}
      </label>

      <div>
        <SubmitButton
          label={editing ? copy.saveCourse : copy.createCourse}
          busy={copy.saving}
        />
      </div>
    </form>
  );
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
