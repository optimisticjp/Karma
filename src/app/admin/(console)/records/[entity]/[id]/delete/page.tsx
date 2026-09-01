import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { recordsCopy } from "@/lib/admin/records-copy";
import { preflight } from "@/lib/admin/destructive";
import {
  RECORD_ENTITIES,
  canPerform,
  policyFor,
  type RecordEntity
} from "@/lib/admin/record-actions";
import { DeleteConfirmForm } from "./DeleteForm";
import { PageHead } from "@/components/admin/PageHead";

export const dynamic = "force-dynamic";

/**
 * The deliberate page a permanent deletion goes through.
 *
 * Everything destructive about this system is concentrated here on purpose. An
 * operator arrives from a record's own menu and is shown, before being asked to
 * confirm anything: what the record is, what depends on it, whether anything
 * blocks the deletion outright, and what the audit entry will keep. Only then
 * does a form appear, and only with a typed confirmation and a written reason.
 *
 * The page requires an active Console account and the centralized record policy
 * decides whether this caller may delete this entity. The server action repeats
 * the same authorization; a link or a hidden menu is never the security wall.
 */
export default async function DeleteRecordPage({
  params
}: {
  params: Promise<{ entity: string; id: string }>;
}) {
  const { entity: rawEntity, id: rawId } = await params;
  const session = await requireAdmin(`/admin/records/${rawEntity}/${rawId}/delete`);
  const copy = recordsCopy(session.staff.adminLocale);

  if (!(RECORD_ENTITIES as readonly string[]).includes(rawEntity)) notFound();
  const entity = rawEntity as RecordEntity;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const subject = {
    role: session.role,
    has: (permission: Parameters<typeof hasPermission>[1]) =>
      hasPermission(session.staff, permission)
  };
  if (!canPerform(subject, entity, "delete")) notFound();

  const policy = policyFor(entity);
  const db = getDb();
  if (!db) redirect("/admin");
  const report = await preflight(db, entity, id);
  if (!report) notFound();

  const entityName = copy.entityNames[entity];
  const blockers = report.dependencies.filter((d) => d.blocking && d.count > 0);
  const others = report.dependencies.filter((d) => !d.blocking && d.count > 0);
  const refusalBody =
    report.refusal === "locked"
      ? copy.lockedBody
      : report.refusal === "revokeFirst"
        ? copy.revokeFirstBody
        : null;

  return (
    <div className="max-w-[46rem]">
      <PageHead title={copy.deleteTitle} context={`${entityName} · ${copy.deleteLede}`} />

      <p className="kv-label">{entityName}</p>
      <p className="text-h4 mt-1 font-mono">{report.identifier}</p>

      <section className="mt-8">
        <h2 className="text-h4">{copy.whatDepends}</h2>
        {report.dependencies.every((d) => d.count === 0) ? (
          <p className="form-note mt-3">{copy.noDependencies}</p>
        ) : (
          <ul className="data-list mt-3">
            {[...blockers, ...others].map((dependency) => (
              <li key={dependency.entity} className="data-row">
                <span className="data-row__title">
                  {copy.entityNames[dependency.entity]}
                </span>
                <span className="data-row__actions">
                  <span className={`chip ${dependency.blocking ? "status-error" : "status-off"}`}>
                    {dependency.count}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {refusalBody ? (
        <section className="danger-zone mt-8">
          <p className="danger-title">{copy.blockedTitle}</p>
          <p>{refusalBody}</p>
        </section>
      ) : report.blocked ? (
        <section className="danger-zone mt-8">
          <p className="danger-title">{copy.blockedTitle}</p>
          <p>{copy.blockedBody}</p>
        </section>
      ) : (
        <section className="danger-zone mt-8">
          <p className="danger-title">{copy.deleteTitle}</p>
          <p className="form-note">{copy.tombstoneNote}</p>
          <DeleteConfirmForm
            entity={entity}
            id={id}
            identifier={report.identifier}
            confirmation={policy.confirmation}
            copy={copy}
          />
        </section>
      )}

      <div className="u-actions mt-8">
        <Link className="btn btn-secondary" href={backHref(entity)}>
          ← {copy.cancel}
        </Link>
      </div>
    </div>
  );
}

function backHref(entity: RecordEntity): string {
  switch (entity) {
    case "course":
    case "batch":
      return "/admin/courses";
    case "student":
    case "guardian":
    case "enrollment":
      return "/admin/students";
    case "application":
    case "application_note":
      return "/admin/admissions";
    case "attendance_session":
      return "/admin/attendance";
    case "fee_record":
      return "/admin/fees";
    case "certificate":
      return "/admin/certificates";
    case "service_enquiry":
      return "/admin/design";
    case "content_item":
      return "/admin/content";
    default:
      return "/admin";
  }
}
