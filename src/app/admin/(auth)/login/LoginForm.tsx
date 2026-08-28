"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInAction, type LoginState } from "./actions";

type Labels = {
  email: string;
  password: string;
  submit: string;
  submitting: string;
  genericError: string;
  unavailable: string;
  throttled: string;
};

function SubmitButton({ labels }: { labels: Labels }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? labels.submitting : labels.submit}
    </button>
  );
}

export function LoginForm({ labels, next }: { labels: Labels; next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(signInAction, {
    error: null
  });

  const message =
    state.error === "throttled"
      ? labels.throttled
      : state.error === "unavailable"
        ? labels.unavailable
        : state.error
          ? labels.genericError
          : null;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {/* One live region for the one message this form ever shows. */}
      <div role="alert" aria-live="polite">
        {message ? <p className="alert alert-error">{message}</p> : null}
      </div>

      <div>
        <label className="label" htmlFor="email">
          {labels.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className="input"
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          {labels.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      <SubmitButton labels={labels} />
    </form>
  );
}
