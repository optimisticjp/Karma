"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { RecordsCopy } from "@/lib/admin/records-copy";
import type { ConfirmationStyle, RecordEntity } from "@/lib/admin/record-actions";
import { deleteRecordAction, type RecordActionState } from "@/app/admin/(console)/records/actions";

const IDLE: RecordActionState = { status: "idle", message: null };

/**
 * The typed confirmation.
 *
 * High-impact records ask the operator to type the record's OWN identifier — an
 * admission number, a course slug, a certificate number — rather than a generic
 * word. Typing "KDS-2026-0142" requires having read which student this is;
 * typing "DELETE" only requires wanting to get past a dialog.
 *
 * The submit button stays disabled until the confirmation matches and a reason
 * has been written, so the destructive click is never the first thing the
 * pointer lands on. The server re-checks both regardless: this is a courtesy to
 * the operator, not the enforcement.
 */
export function DeleteConfirmForm({
  entity,
  id,
  identifier,
  confirmation,
  copy
}: {
  entity: RecordEntity;
  id: number;
  identifier: string;
  confirmation: ConfirmationStyle;
  copy: RecordsCopy;
}) {
  const [state, action] = useActionState<RecordActionState, FormData>(deleteRecordAction, IDLE);
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");

  const expected = confirmation === "identifier" ? identifier : "DELETE";
  const matches = typed.trim().toLowerCase() === expected.trim().toLowerCase();
  const ready = matches && reason.trim().length >= 3;

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />

      {state.status === "error" && state.message ? (
        <p role="alert" className="alert alert-error">
          {copy.errors[state.message as keyof RecordsCopy["errors"]] ?? copy.errors.generic}
        </p>
      ) : null}

      <div>
        <label className="label" htmlFor="delete-confirm">
          {confirmation === "identifier"
            ? copy.confirmIdentifier.replace("{identifier}", identifier)
            : copy.confirmWord}
        </label>
        <input
          id="delete-confirm"
          name="confirm"
          className="input font-mono"
          autoComplete="off"
          spellCheck={false}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="delete-reason">
          {copy.reasonLabel}
        </label>
        <input
          id="delete-reason"
          name="reason"
          className="input"
          required
          minLength={3}
          maxLength={300}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <p className="form-note mt-1.5">{copy.reasonHint}</p>
      </div>

      <div>
        <DeleteButton ready={ready} copy={copy} />
      </div>
    </form>
  );
}

function DeleteButton({ ready, copy }: { ready: boolean; copy: RecordsCopy }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={!ready || pending}>
      {pending ? copy.deleting : copy.confirmDelete}
    </button>
  );
}
