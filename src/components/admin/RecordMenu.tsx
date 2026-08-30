"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { RecordsCopy } from "@/lib/admin/records-copy";
import type { RecordEntity } from "@/lib/admin/record-actions";
import {
  archiveRecordAction,
  restoreRecordAction,
  type RecordActionState
} from "@/app/admin/(console)/records/actions";

const IDLE: RecordActionState = { status: "idle", message: null };

/**
 * The actions for one record, next to that record.
 *
 * A dropdown on a laptop and a bottom sheet on a phone, from one `<details>`
 * element — no popover library, no portal, no focus-trap of our own, and it
 * works before hydration. The CSS decides which shape it takes; the markup does
 * not change.
 *
 * Archive and restore submit inline: they are reversible and cheap, and making
 * an operator visit another screen to archive one row is how a console becomes
 * slower than a notebook. **Permanent deletion is a link to its own page**,
 * because the operator has to be shown what depends on the record before being
 * asked to confirm — and a dependency count is a query, which is not something
 * to run for every row of a list on the chance somebody opens a menu.
 */
export function RecordMenu({
  entity,
  id,
  label,
  archived,
  editHref,
  canArchive,
  canRestore,
  canDelete,
  copy
}: {
  entity: RecordEntity;
  id: number;
  /** Names the record in the menu's accessible label, e.g. "KDS-2026-0142". */
  label: string;
  archived?: boolean;
  editHref?: string;
  canArchive?: boolean;
  canRestore?: boolean;
  canDelete?: boolean;
  copy: RecordsCopy;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  /* Clicking elsewhere or pressing Escape closes it, the way every menu does. */
  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      const el = ref.current;
      if (el?.open && !el.contains(event.target as Node)) el.open = false;
    };
    const onKey = (event: KeyboardEvent) => {
      const el = ref.current;
      if (event.key === "Escape" && el?.open) {
        el.open = false;
        el.querySelector<HTMLElement>("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const nothingToShow = !editHref && !canArchive && !canRestore && !canDelete;
  if (nothingToShow) return null;

  return (
    <details ref={ref} className="rec-menu">
      <summary className="tap" aria-label={`${copy.actions} — ${label}`}>
        <span aria-hidden>•••</span>
      </summary>
      <div className="rec-menu__panel">
        {editHref ? (
          <Link className="rec-menu__item" href={editHref}>
            {copy.edit}
          </Link>
        ) : null}
        {canArchive && !archived ? (
          <LifecycleItem
            entity={entity}
            id={id}
            action="archive"
            label={copy.archive}
          />
        ) : null}
        {canRestore && archived ? (
          <LifecycleItem
            entity={entity}
            id={id}
            action="restore"
            label={copy.restore}
          />
        ) : null}
        {canDelete ? (
          <Link
            className="rec-menu__item is-danger"
            href={`/admin/records/${entity}/${id}/delete`}
          >
            {copy.delete}
          </Link>
        ) : null}
      </div>
    </details>
  );
}

function LifecycleItem({
  entity,
  id,
  action,
  label
}: {
  entity: RecordEntity;
  id: number;
  action: "archive" | "restore";
  label: string;
}) {
  const [, submit] = useActionState<RecordActionState, FormData>(
    action === "archive" ? archiveRecordAction : restoreRecordAction,
    IDLE
  );
  return (
    <form action={submit}>
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />
      <LifecycleButton label={label} />
    </form>
  );
}

function LifecycleButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="rec-menu__item" disabled={pending}>
      {label}
    </button>
  );
}
