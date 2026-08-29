"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CONTENT_KINDS,
  CONTENT_STATUSES,
  GALLERY_TECHNIQUES,
  type ContentKind,
  type ContentStatus
} from "@/lib/admin/content";
import type { ContentCopy } from "@/lib/admin/content-copy";
import {
  archiveContentAction,
  createContentAction,
  updateContentAction,
  type ContentState
} from "./actions";

const IDLE: ContentState = { status: "idle", message: null };

type StudentOption = {
  id: number;
  label: string;
  photoConsent: boolean;
};

export type EditableContent = {
  id: number;
  kind: ContentKind;
  slug: string;
  payload: Record<string, unknown>;
  studentId: number | null;
  status: ContentStatus;
  sortOrder: number;
  consentConfirmed: boolean;
  ownerVerified: boolean;
};

function ActionMessage({ state, copy }: { state: ContentState; copy: ContentCopy }) {
  if (state.status === "idle" || !state.message) return <div aria-live="polite" />;
  const text = state.status === "success"
    ? copy.success[state.message as keyof ContentCopy["success"]] ?? copy.errors.generic
    : copy.errors[state.message as keyof ContentCopy["errors"]] ?? copy.errors.generic;
  return <p role="status" className={`alert ${state.status === "success" ? "alert-success" : "alert-error"}`}>{text}</p>;
}

function Submit({ copy }: { copy: ContentCopy }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? copy.saving : copy.save}</button>;
}

function text(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

function Field({ label, htmlFor, help, children }: { label: string; htmlFor: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {help ? <p className="form-note mt-1">{help}</p> : null}
    </div>
  );
}

function LocalizedPair({
  idPrefix,
  enName,
  guName,
  label,
  enValue,
  guValue,
  multiline = false,
  copy
}: {
  idPrefix: string;
  enName: string;
  guName: string;
  label: string;
  enValue?: string;
  guValue?: string;
  multiline?: boolean;
  copy: ContentCopy;
}) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={`${label} · ${copy.english}`} htmlFor={`${idPrefix}-en`}>
        <Tag id={`${idPrefix}-en`} name={enName} className={`input ${multiline ? "min-h-28" : ""}`} defaultValue={enValue ?? ""} required />
      </Field>
      <Field label={`${label} · ${copy.gujarati}`} htmlFor={`${idPrefix}-gu`}>
        <Tag id={`${idPrefix}-gu`} name={guName} className={`input ${multiline ? "min-h-28" : ""}`} defaultValue={guValue ?? ""} required />
      </Field>
    </div>
  );
}

function KindFields({ kind, payload, idPrefix, copy }: { kind: ContentKind; payload: Record<string, unknown>; idPrefix: string; copy: ContentCopy }) {
  if (kind === "faq") {
    return (
      <div className="grid gap-4">
        <LocalizedPair idPrefix={`${idPrefix}-question`} enName="questionEn" guName="questionGu" label={copy.question} enValue={text(payload, "questionEn")} guValue={text(payload, "questionGu")} copy={copy} />
        <LocalizedPair idPrefix={`${idPrefix}-answer`} enName="answerEn" guName="answerGu" label={copy.answer} enValue={text(payload, "answerEn")} guValue={text(payload, "answerGu")} multiline copy={copy} />
      </div>
    );
  }

  if (kind === "gallery") {
    return (
      <div className="grid gap-4">
        <Field label={copy.technique} htmlFor={`${idPrefix}-technique`}>
          <select id={`${idPrefix}-technique`} name="technique" className="input" defaultValue={text(payload, "technique") || "zardosi"}>
            {GALLERY_TECHNIQUES.map((technique) => <option key={technique} value={technique}>{copy.techniques[technique]}</option>)}
          </select>
        </Field>
        <LocalizedPair idPrefix={`${idPrefix}-title`} enName="titleEn" guName="titleGu" label={copy.titleLabel} enValue={text(payload, "titleEn")} guValue={text(payload, "titleGu")} copy={copy} />
        <LocalizedPair idPrefix={`${idPrefix}-note`} enName="noteEn" guName="noteGu" label={copy.note} enValue={text(payload, "noteEn")} guValue={text(payload, "noteGu")} copy={copy} />
        <Field label={copy.mediaUrl} htmlFor={`${idPrefix}-media`} help={copy.mediaHelp}>
          <input id={`${idPrefix}-media`} name="mediaUrl" className="input" maxLength={500} defaultValue={text(payload, "mediaUrl")} />
        </Field>
      </div>
    );
  }

  if (kind === "testimonial") {
    return (
      <div className="grid gap-4">
        <LocalizedPair idPrefix={`${idPrefix}-name`} enName="nameEn" guName="nameGu" label={copy.personName} enValue={text(payload, "nameEn")} guValue={text(payload, "nameGu")} copy={copy} />
        <LocalizedPair idPrefix={`${idPrefix}-course`} enName="courseEn" guName="courseGu" label={copy.course} enValue={text(payload, "courseEn")} guValue={text(payload, "courseGu")} copy={copy} />
        <LocalizedPair idPrefix={`${idPrefix}-quote`} enName="quoteEn" guName="quoteGu" label={copy.quote} enValue={text(payload, "quoteEn")} guValue={text(payload, "quoteGu")} multiline copy={copy} />
        <LocalizedPair idPrefix={`${idPrefix}-before`} enName="beforeEn" guName="beforeGu" label={copy.before} enValue={text(payload, "beforeEn")} guValue={text(payload, "beforeGu")} copy={copy} />
        <LocalizedPair idPrefix={`${idPrefix}-after`} enName="afterEn" guName="afterGu" label={copy.after} enValue={text(payload, "afterEn")} guValue={text(payload, "afterGu")} copy={copy} />
        <Field label={copy.mediaUrl} htmlFor={`${idPrefix}-media`} help={copy.mediaHelp}>
          <input id={`${idPrefix}-media`} name="mediaUrl" className="input" maxLength={500} defaultValue={text(payload, "mediaUrl")} />
        </Field>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <LocalizedPair idPrefix={`${idPrefix}-label`} enName="labelEn" guName="labelGu" label={copy.statLabel} enValue={text(payload, "labelEn")} guValue={text(payload, "labelGu")} copy={copy} />
      <Field label={copy.statValue} htmlFor={`${idPrefix}-value`}>
        <input id={`${idPrefix}-value`} name="value" className="input" maxLength={24} defaultValue={text(payload, "value")} required />
      </Field>
    </div>
  );
}

function ContentEditor({
  mode,
  item,
  students,
  isOwner,
  copy
}: {
  mode: "create" | "edit";
  item?: EditableContent;
  students: StudentOption[];
  isOwner: boolean;
  copy: ContentCopy;
}) {
  const action = mode === "create" ? createContentAction : updateContentAction;
  const [state, formAction] = useActionState<ContentState, FormData>(action, IDLE);
  const [kind, setKind] = useState<ContentKind>(item?.kind ?? "faq");
  const idPrefix = item ? `content-${item.id}` : "content-new";
  const payload = item?.payload ?? {};

  return (
    <form action={formAction} className="grid gap-5">
      {item ? <input type="hidden" name="contentId" value={item.id} /> : null}
      <ActionMessage state={state} copy={copy} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Field label={copy.kind} htmlFor={`${idPrefix}-kind`}>
          <select id={`${idPrefix}-kind`} name="kind" className="input" value={kind} onChange={(event) => setKind(event.target.value as ContentKind)}>
            {CONTENT_KINDS.map((value) => <option key={value} value={value}>{copy.kinds[value]}</option>)}
          </select>
        </Field>
        <Field label={copy.slug} htmlFor={`${idPrefix}-slug`} help={copy.slugHelp}>
          <input id={`${idPrefix}-slug`} name="slug" className="input" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={item?.slug ?? ""} />
        </Field>
        <Field label={copy.status} htmlFor={`${idPrefix}-status`}>
          <select id={`${idPrefix}-status`} name="status" className="input" defaultValue={item?.status ?? "draft"}>
            {CONTENT_STATUSES.map((status) => <option key={status} value={status}>{copy.statuses[status]}</option>)}
          </select>
        </Field>
        <Field label={copy.sortOrder} htmlFor={`${idPrefix}-sort`}>
          <input id={`${idPrefix}-sort`} name="sortOrder" type="number" min={0} max={10000} className="input" defaultValue={item?.sortOrder ?? 0} />
        </Field>
      </div>

      <KindFields key={`${idPrefix}-${kind}`} kind={kind} payload={item?.kind === kind ? payload : {}} idPrefix={idPrefix} copy={copy} />

      {(kind === "gallery" || kind === "testimonial") ? (
        <Field label={copy.student} htmlFor={`${idPrefix}-student`} help={copy.studentHelp}>
          <select id={`${idPrefix}-student`} name="studentId" className="input" defaultValue={item?.studentId ? String(item.studentId) : ""}>
            <option value="">{copy.noStudent}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>{student.label}{student.photoConsent ? " · consent ✓" : ""}</option>
            ))}
          </select>
        </Field>
      ) : <input type="hidden" name="studentId" value="" />}

      {kind === "testimonial" ? (
        <label className="flex items-start gap-3 text-smallmeta">
          <input name="consentConfirmed" type="checkbox" className="mt-1" defaultChecked={item?.consentConfirmed ?? false} />
          <span><strong>{copy.consent}</strong><span className="form-note mt-1 block">{copy.consentHelp}</span></span>
        </label>
      ) : <input type="hidden" name="consentConfirmed" value="false" />}

      {kind === "homepage_stat" ? (
        isOwner ? (
          <label className="flex items-start gap-3 text-smallmeta">
            <input name="ownerVerified" type="checkbox" className="mt-1" defaultChecked={item?.ownerVerified ?? false} />
            <span><strong>{copy.ownerVerified}</strong><span className="form-note mt-1 block">{copy.ownerVerifiedHelp}</span></span>
          </label>
        ) : (
          <p className="alert">{copy.ownerVerifiedHelp}</p>
        )
      ) : <input type="hidden" name="ownerVerified" value="false" />}

      <div className="flex flex-wrap gap-3">
        <Submit copy={copy} />
      </div>
    </form>
  );
}

export function CreateContentForm({ students, isOwner, copy }: { students: StudentOption[]; isOwner: boolean; copy: ContentCopy }) {
  return <ContentEditor mode="create" students={students} isOwner={isOwner} copy={copy} />;
}

export function EditContentForm({ item, students, isOwner, copy }: { item: EditableContent; students: StudentOption[]; isOwner: boolean; copy: ContentCopy }) {
  return (
    <div className="grid gap-4">
      <ContentEditor mode="edit" item={item} students={students} isOwner={isOwner} copy={copy} />
      {item.status !== "archived" ? (
        <form action={archiveContentAction}>
          <input type="hidden" name="contentId" value={item.id} />
          <button type="submit" className="btn btn-secondary">{copy.archive}</button>
        </form>
      ) : null}
    </div>
  );
}
