"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setPasswordAction, type WelcomeState } from "./actions";

type Labels = {
  password: string;
  confirm: string;
  submit: string;
  mismatch: string;
  tooShort: string;
  expired: string;
  denied: string;
  failed: string;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {label}
    </button>
  );
}

export function WelcomeForm({ labels }: { labels: Labels }) {
  const [state, formAction] = useActionState<WelcomeState, FormData>(setPasswordAction, {
    error: null
  });
  const message = state.error ? labels[state.error] : null;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <div role="alert" aria-live="polite">
        {message ? <p className="alert alert-error">{message}</p> : null}
      </div>

      <div>
        <label className="label" htmlFor="password">
          {labels.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          autoFocus
          className="input"
        />
        <p className="form-note mt-1.5">{labels.tooShort}</p>
      </div>

      <div>
        <label className="label" htmlFor="confirm">
          {labels.confirm}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="input"
        />
      </div>

      <Submit label={labels.submit} />
    </form>
  );
}
