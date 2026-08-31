"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { AttendanceCopy } from "@/lib/admin/attendance-copy";
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/lib/admin/attendance";
import { lockAttendanceAction, saveAttendanceAction, type AttendanceState } from "./actions";

const IDLE: AttendanceState = { status: "idle", message: null };

type RosterRow = {
  studentId: number;
  admissionNo: string;
  fullName: string;
  status: AttendanceStatus | null;
  note: string | null;
};

function Message({ state, copy }: { state: AttendanceState; copy: AttendanceCopy }) {
  if (state.status === "idle" || !state.message) return <div aria-live="polite" />;
  const dictionary = state.status === "success" ? copy.success : copy.errors;
  const text = dictionary[state.message as keyof typeof dictionary] ?? copy.errors.generic;
  return <p role="alert" className={`alert ${state.status === "success" ? "alert-success" : "alert-error"}`}>{text}</p>;
}

function SaveButton({ copy }: { copy: AttendanceCopy }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? copy.saving : copy.save}</button>;
}

export function AttendanceRegister({
  batchId,
  sessionDate,
  sessionId,
  locked,
  rows,
  canManage,
  copy
}: {
  batchId: number;
  sessionDate: string;
  sessionId: number | null;
  locked: boolean;
  rows: RosterRow[];
  canManage: boolean;
  copy: AttendanceCopy;
}) {
  const initial = useMemo(() => Object.fromEntries(rows.map((row) => [row.studentId, row.status ?? ""])) as Record<number, AttendanceStatus | "">, [rows]);
  const [marks, setMarks] = useState<Record<number, AttendanceStatus | "">>(initial);
  const [state, action] = useActionState<AttendanceState, FormData>(saveAttendanceAction, IDLE);
  const markedCount = Object.values(marks).filter(Boolean).length;
  const presentCount = Object.values(marks).filter((value) => value === "present" || value === "late").length;

  if (rows.length === 0) return <p className="empty-state">{copy.noStudents}</p>;

  return (
    <div className="grid gap-3">
      {/* Three counts as one line, not three cards. `sm:` is 640px, so at
          390px these stacked to 277px of tile above a register an operator is
          trying to mark while standing at a machine. */}
      <p className="data-row__meta">
        <span>
          {copy.students}: <strong className="text-carbon">{rows.length}</strong>
        </span>
        <span>
          {copy.marked}: <strong className="text-carbon">{markedCount}</strong>
        </span>
        <span>
          {copy.presentToday}: <strong className="text-carbon">{presentCount}</strong>
        </span>
      </p>

      {locked ? <div className="alert alert-warning"><strong>{copy.locked}</strong><div className="mt-1">{copy.lockedHint}</div></div> : null}
      {!canManage ? <p className="form-note">{copy.viewOnly}</p> : null}

      <form action={action} className="grid gap-3">
        <input type="hidden" name="batchId" value={batchId} />
        <input type="hidden" name="sessionDate" value={sessionDate} />
        <Message state={state} copy={copy} />

        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary !min-h-11" onClick={() => setMarks(Object.fromEntries(rows.map((row) => [row.studentId, "present"])))}>{copy.markAllPresent}</button>
            {!locked ? <button type="button" className="btn btn-secondary" onClick={() => setMarks(initial)}>{copy.clearMarks}</button> : null}
          </div>
        ) : null}

        {/* A ROW, not a card. Each student was a 212px bordered card, so an
            operator saw three at a time and scrolled ~225px past the fold
            before the first name was markable. The name and admission number
            share one line; the four-up P/A/L/E control is both the display and
            the input; the note collapses behind a toggle unless there is one.
            About 100px a student, so six or seven fit a screen.

            The field NAMES are unchanged — `status:<id>` and `note:<id>` are
            what `saveAttendanceAction` reads for the whole roster, and a
            reshape that renamed them would silently stop saving. */}
        <div className="data-list">
          {rows.map((row) => (
            <div key={row.studentId} className="px-2 py-2">
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-smallmeta font-semibold">{row.fullName}</span>
                <span className="text-[0.8125rem] text-stone">{row.admissionNo}</span>
              </p>
              <div className="mt-1.5 grid grid-cols-4 gap-1" role="group" aria-label={`${row.fullName} attendance`}>
                {ATTENDANCE_STATUSES.map((status) => (
                  <label key={status} className={`min-h-11 cursor-pointer rounded-[var(--radius-card)] border px-1 py-2 text-center text-smallmeta font-semibold ${marks[row.studentId] === status ? "border-vermilion bg-vermilion/10 text-vermilion-deep" : "border-rule"}`} title={copy.statuses[status]}>
                    <input
                      className="sr-only"
                      type="radio"
                      name={`status:${row.studentId}`}
                      value={status}
                      checked={marks[row.studentId] === status}
                      onChange={() => setMarks((current) => ({ ...current, [row.studentId]: status }))}
                      disabled={!canManage}
                    />
                    <span aria-hidden>{copy.short[status]}</span><span className="sr-only">{copy.statuses[status]}</span>
                  </label>
                ))}
              </div>
              {canManage ? (
                <details className="mt-1" open={Boolean(row.note)}>
                  <summary className="tap text-[0.8125rem] font-semibold text-stone">{copy.note}</summary>
                  <input name={`note:${row.studentId}`} className="input mt-1" maxLength={200} placeholder={copy.note} defaultValue={row.note ?? ""} />
                </details>
              ) : null}
            </div>
          ))}
        </div>

        {canManage && locked ? (
          <div><label className="label" htmlFor="attendance-correction-reason">{copy.correctionReason}</label><textarea id="attendance-correction-reason" name="correctionReason" className="input min-h-24" maxLength={300} placeholder={copy.correctionPlaceholder} /></div>
        ) : null}
        {canManage ? <div><SaveButton copy={copy} /></div> : null}
      </form>

      {canManage && sessionId && !locked ? <LockForm sessionId={sessionId} copy={copy} /> : null}
    </div>
  );
}

function LockForm({ sessionId, copy }: { sessionId: number; copy: AttendanceCopy }) {
  const [state, action] = useActionState<AttendanceState, FormData>(lockAttendanceAction, IDLE);
  return <form action={action} className="border-t border-rule pt-5"><input type="hidden" name="sessionId" value={sessionId} /><Message state={state} copy={copy} /><button type="submit" className="btn btn-secondary mt-3">{copy.lock}</button></form>;
}

