"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SetupLabels = {
  manualLabel: string;
  codeLabel: string;
  verify: string;
  verifying: string;
  invalidCode: string;
  enrollFailed: string;
  secretWarning: string;
};

type ChallengeLabels = {
  codeLabel: string;
  verify: string;
  verifying: string;
  invalidCode: string;
};

/** Six digits, nothing else, before anything is sent. */
function normaliseCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function CodeField({
  label,
  value,
  onChange,
  invalid,
  autoFocus
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor="mfa-code">
        {label}
      </label>
      <input
        id="mfa-code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(normaliseCode(e.target.value))}
        className={`input text-h4 tracking-[0.4em] ${invalid ? "input-error" : ""}`}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? "mfa-error" : undefined}
      />
    </div>
  );
}

/**
 * TOTP enrolment.
 *
 * Runs in the browser because that is where Supabase hands back the QR and the
 * one-time secret; sending them via our server would put the secret through an
 * extra hop for no benefit. The secret is rendered once, is never stored by
 * Karma, and never reaches `audit_logs` — the database has no column for it
 * and no code path writes one.
 */
export function MfaSetupForm({
  labels,
  nextPath
}: {
  labels: SetupLabels;
  nextPath: string;
}) {
  const router = useRouter();
  const [factor, setFactor] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const enroll = useCallback(async () => {
    try {
      const supabase = createClient();

      // A previous, abandoned attempt leaves an unverified factor behind and
      // Supabase refuses a second enrolment while it exists. Clear it first.
      const { data: existing } = await supabase.auth.mfa.listFactors();
      for (const f of existing?.all ?? []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Karma Console ${new Date().toISOString().slice(0, 10)}`
      });
      if (enrollError || !data) {
        setError(labels.enrollFailed);
        return;
      }
      setFactor({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    } catch {
      setError(labels.enrollFailed);
    }
  }, [labels.enrollFailed]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void enroll();
  }, [enroll]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!factor || code.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factor.id
      });
      if (challengeError || !challenge) {
        setError(labels.invalidCode);
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code
      });
      if (verifyError) {
        setError(labels.invalidCode);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError(labels.invalidCode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div role="alert" aria-live="polite">
        {error ? (
          <p id="mfa-error" className="alert alert-error">
            {error}
          </p>
        ) : null}
      </div>

      {factor ? (
        <>
          <div className="flex justify-center rounded-[0.875rem] border border-line bg-card p-4">
            {/* Supabase returns the QR as an SVG data URI. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- data URI, no optimisation to do */}
            <img src={factor.qr} alt="" width={200} height={200} />
          </div>

          <details className="text-smallmeta">
            <summary className="cursor-pointer font-semibold">{labels.manualLabel}</summary>
            <code className="mt-2 block break-all rounded-lg border border-line bg-ivory-2 p-3 font-mono text-smallmeta">
              {factor.secret}
            </code>
            <p className="form-note mt-2">{labels.secretWarning}</p>
          </details>

          <form onSubmit={verify} className="grid gap-4">
            <CodeField
              label={labels.codeLabel}
              value={code}
              onChange={setCode}
              invalid={Boolean(error)}
            />
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={busy || code.length !== 6}
            >
              {busy ? labels.verifying : labels.verify}
            </button>
          </form>
        </>
      ) : error ? null : (
        <div aria-hidden className="skeleton h-[13rem] w-full" />
      )}
    </div>
  );
}

/** TOTP challenge for someone who already has a verified authenticator. */
export function MfaChallengeForm({
  labels,
  nextPath
}: {
  labels: ChallengeLabels;
  nextPath: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find((f) => f.status === "verified") ?? factors?.totp?.[0];
      if (listError || !totp) {
        setError(labels.invalidCode);
        return;
      }
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totp.id
      });
      if (challengeError || !challenge) {
        setError(labels.invalidCode);
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code
      });
      if (verifyError) {
        setError(labels.invalidCode);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError(labels.invalidCode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div role="alert" aria-live="polite">
        {error ? (
          <p id="mfa-error" className="alert alert-error">
            {error}
          </p>
        ) : null}
      </div>
      <CodeField
        label={labels.codeLabel}
        value={code}
        onChange={setCode}
        invalid={Boolean(error)}
        autoFocus
      />
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={busy || code.length !== 6}
      >
        {busy ? labels.verifying : labels.verify}
      </button>
    </form>
  );
}
