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
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric label={copy.students} value={rows.length} />
        <MiniMetric label={copy.marked} value={markedCount} />
        <MiniMetric label={copy.presentToday} value={presentCount} />
      </div>

      {locked ? <div className="alert alert-warning"><strong>{copy.locked}</strong><div className="mt-1">{copy.lockedHint}</div></div> : null}
      {!canManage ? <p className="form-note">{copy.viewOnly}</p> : null}

      <form action={action} className="grid gap-5">
        <input type="hidden" name="batchId" value={batchId} />
        <input type="hidden" name="sessionDate" value={sessionDate} />
        <Message state={state} copy={copy} />

        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setMarks(Object.fromEntries(rows.map((row) => [row.studentId, "present"])))}>{copy.markAllPresent}</button>
            {!locked ? <button type="button" className="btn btn-secondary" onClick={() => setMarks(initial)}>{copy.clearMarks}</button> : null}
          </div>
        ) : null}

        <div className="grid gap-3">
          {rows.map((row) => (
            <div key={row.studentId} className="rounded-[var(--radius-card)] border border-rule p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-semibold">{row.fullName}</p><p className="form-note mt-1">{row.admissionNo}</p></div>
                <span className="form-note">{marks[row.studentId] ? copy.statuses[marks[row.studentId] as AttendanceStatus] : copy.noRecord}</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2" role="group" aria-label={`${row.fullName} attendance`}>
                {ATTENDANCE_STATUSES.map((status) => (
                  <label key={status} className={`min-h-12 cursor-pointer rounded-[var(--radius-card)] border px-2 py-3 text-center font-semibold ${marks[row.studentId] === status ? "border-vermilion bg-vermilion/10 text-vermilion-deep" : "border-rule"}`} title={copy.statuses[status]}>
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
              {canManage ? <input name={`note:${row.studentId}`} className="input mt-3" maxLength={200} placeholder={copy.note} defaultValue={row.note ?? ""} /> : null}
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

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[var(--radius-card)] border border-rule p-4"><p className="microlabel">{label}</p><p className="text-h4 mt-1">{value}</p></div>;
}
