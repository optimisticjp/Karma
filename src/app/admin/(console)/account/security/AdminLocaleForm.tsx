"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveAdminLocaleAction, type LocaleState } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-secondary" disabled={pending}>
      {label}
    </button>
  );
}

/** Console language for this account. Gujarati is never uppercased here. */
export function AdminLocaleForm({
  current,
  saveLabel,
  savedLabel,
  legend
}: {
  current: "en" | "gu";
  saveLabel: string;
  savedLabel: string;
  legend: string;
}) {
  const [state, formAction] = useActionState<LocaleState, FormData>(saveAdminLocaleAction, {
    saved: false
  });

  return (
    <form action={formAction} className="grid gap-4">
      <fieldset className="flex flex-wrap gap-3">
        <legend className="sr-only">{legend}</legend>
        <label className="choice-chip">
          <input type="radio" name="locale" value="en" defaultChecked={current === "en"} />
          English
        </label>
        <label className="choice-chip">
          <input type="radio" name="locale" value="gu" defaultChecked={current === "gu"} />
          ગુજરાતી
        </label>
      </fieldset>
      <div role="status" aria-live="polite">
        {state.saved ? <p className="alert alert-success">{savedLabel}</p> : null}
      </div>
      <div>
        <Submit label={saveLabel} />
      </div>
    </form>
  );
}
