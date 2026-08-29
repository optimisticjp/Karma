"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  inviteAdminAction,
  setActiveAction,
  updatePermissionsAction,
  type TeamState
} from "./actions";

export type PermissionOption = { key: string; label: string };
export type PermissionGroupOption = { key: string; title: string; permissions: PermissionOption[] };
export type TemplateOption = { key: string; label: string; permissions: string[] };

export type TeamLabels = Record<string, string>;

const IDLE: TeamState = { status: "idle", message: null };

const TONE = {
  success: "alert-success",
  warning: "alert-warn",
  error: "alert-error"
} as const;

/**
 * Renders whatever the last action said, in one place: success, a success that
 * still needs attention, or a failure.
 */
function ActionMessage({ state, labels }: { state: TeamState; labels: TeamLabels }) {
  if (state.status === "idle" || !state.message) return <div role="alert" aria-live="polite" />;

  const prefix =
    state.status === "success"
      ? "success"
      : state.status === "warning"
        ? "warnings"
        : "errors";

  const text =
    (labels[`${prefix}.${state.message}`] ?? labels["errors.generic"]).replace(
      "{email}",
      state.email ?? ""
    );

  return (
    <div role="alert" aria-live="polite">
      <p className={`alert ${TONE[state.status]}`}>{text}</p>
    </div>
  );
}

function Submit({ label, busyLabel, variant = "primary", disabled = false }: {
  label: string;
  busyLabel: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`btn btn-${variant}`}
      disabled={pending || disabled}
    >
      {pending ? busyLabel : label}
    </button>
  );
}

/* ------------------------------ permissions -------------------------------- */

function PermissionPicker({
  groups,
  selected,
  onToggle,
  legend
}: {
  groups: PermissionGroupOption[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  legend: string;
}) {
  return (
    <fieldset className="grid gap-4">
      <legend className="label">{legend}</legend>
      {groups.map((group) => (
        <div key={group.key}>
          <p className="microlabel">{group.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.permissions.map((permission) => (
              <label key={permission.key} className="choice-chip text-smallmeta">
                <input
                  type="checkbox"
                  name="permissions"
                  value={permission.key}
                  checked={selected.has(permission.key)}
                  onChange={() => onToggle(permission.key)}
                  className="size-4 accent-vermilion"
                />
                {permission.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

/* -------------------------------- invite ----------------------------------- */

export function InviteAdminForm({
  groups,
  templates,
  labels,
  seatsFull,
  inviteUnavailable
}: {
  groups: PermissionGroupOption[];
  templates: TemplateOption[];
  labels: TeamLabels;
  seatsFull: boolean;
  inviteUnavailable: boolean;
}) {
  const [state, formAction] = useActionState<TeamState, FormData>(inviteAdminAction, IDLE);
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState(templates[0]?.key ?? "custom");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(templates[0]?.permissions ?? [])
  );

  function chooseTemplate(key: string) {
    setTemplate(key);
    setSelected(new Set(templates.find((t) => t.key === key)?.permissions ?? []));
  }

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (inviteUnavailable) {
    return <p className="alert alert-error">{labels["inviteUnavailable"]}</p>;
  }

  if (!open) {
    return (
      <div className="grid gap-3">
        <ActionMessage state={state} labels={labels} />
        {seatsFull ? (
          <p className="alert alert-error">{labels["seatsFull"]}</p>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            {labels["invite"]}
          </button>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="panel panel-body grid gap-5">
      <h3 className="text-h4">{labels["inviteTitle"]}</h3>
      <ActionMessage state={state} labels={labels} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="invite-name">
            {labels["name"]}
          </label>
          <input id="invite-name" name="name" required maxLength={120} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="invite-email">
            {labels["email"]}
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            maxLength={160}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="invite-template">
          {labels["template"]}
        </label>
        <select
          id="invite-template"
          name="template"
          className="input"
          value={template}
          onChange={(e) => chooseTemplate(e.target.value)}
        >
          {templates.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
        <p className="form-note mt-1.5">{labels["templateHint"]}</p>
      </div>

      <div>
        <label className="label" htmlFor="invite-locale">
          {labels["language"]}
        </label>
        <select id="invite-locale" name="locale" className="input" defaultValue="en">
          <option value="en">English</option>
          <option value="gu">ગુજરાતી</option>
        </select>
      </div>

      <PermissionPicker
        groups={groups}
        selected={selected}
        onToggle={toggle}
        legend={labels["permissions"]}
      />

      <div className="flex flex-wrap gap-3">
        <Submit label={labels["sendInvite"]} busyLabel={labels["sending"]} />
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          {labels["cancel"]}
        </button>
      </div>
    </form>
  );
}

/* ---------------------------- edit permissions ------------------------------ */

export function EditPermissionsForm({
  staffId,
  initial,
  groups,
  labels
}: {
  staffId: number;
  initial: string[];
  groups: PermissionGroupOption[];
  labels: TeamLabels;
}) {
  const [state, formAction] = useActionState<TeamState, FormData>(
    updatePermissionsAction,
    IDLE
  );
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="staffId" value={staffId} />
      <ActionMessage state={state} labels={labels} />
      <PermissionPicker
        groups={groups}
        selected={selected}
        onToggle={toggle}
        legend={labels["permissions"]}
      />
      <div>
        <Submit label={labels["save"]} busyLabel={labels["saving"]} variant="secondary" />
      </div>
    </form>
  );
}

/* --------------------------- activate / deactivate -------------------------- */

export function SetActiveForm({
  staffId,
  activate,
  labels
}: {
  staffId: number;
  activate: boolean;
  labels: TeamLabels;
}) {
  const [state, formAction] = useActionState<TeamState, FormData>(setActiveAction, IDLE);
  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="staffId" value={staffId} />
      <input type="hidden" name="activate" value={String(activate)} />
      <ActionMessage state={state} labels={labels} />
      <Submit
        label={activate ? labels["reactivate"] : labels["deactivate"]}
        busyLabel={labels["saving"]}
        variant="secondary"
      />
    </form>
  );
}
