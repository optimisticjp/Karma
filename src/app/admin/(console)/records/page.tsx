import Link from "next/link";
import { desc } from "drizzle-orm";
import { PageHead } from "@/components/admin/PageHead";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { recordsCopy } from "@/lib/admin/records-copy";
import {
  canPerform,
  deletableEntities,
  type RecordEntity
} from "@/lib/admin/record-actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ entity?: string }> };
type CleanupRow = { id: number; label: string; meta: string };
type Db = NonNullable<ReturnType<typeof getDb>>;

/**
 * A single cleanup desk for test, duplicate and mistaken operational records.
 *
 * Module pages remain the normal place to add, edit and archive. This page is
 * intentionally different: it makes permanent deletion discoverable for every
 * record type the caller is actually allowed to manage, including small child
 * records that do not deserve a permanent destructive button in everyday UI.
 *
 * It does NOT delete anything itself. Every row links to the existing preflight
 * route, which re-checks authorization, dependency counts, lock/revocation
 * rules, typed confirmation and the written reason before the transactional
 * tombstone + delete can run.
 */
export default async function RecordCleanupPage({ searchParams }: Props) {
  const session = await requireAdmin("/admin/records");
  const copy = recordsCopy(session.staff.adminLocale);
  const subject = {
    role: session.role,
    has: (permission: Parameters<typeof hasPermission>[1]) =>
      hasPermission(session.staff, permission)
  };

  const allowed = deletableEntities().filter((entity) =>
    canPerform(subject, entity, "delete")
  );
  const params = await searchParams;
  const requested = typeof params.entity === "string" ? params.entity : null;
  const selected = allowed.includes(requested as RecordEntity)
    ? (requested as RecordEntity)
    : allowed[0] ?? null;

  const db = getDb();
  const rows = db && selected
    ? await loadRows(db, selected, session.staff.adminLocale === "gu")
    : [];

  return (
    <div className="max-w-[76rem]">
      <PageHead title={copy.cleanupTitle} context={copy.cleanupLede} />
      <p className="form-note mt-2">{copy.ownerOnly}</p>

      {allowed.length === 0 ? (
        <p className="empty-state mt-6">{copy.errors.denied}</p>
      ) : (
        <>
          <nav className="chip-scroller mt-4" aria-label={copy.cleanupTitle}>
            {allowed.map((entity) => (
              <Link
                key={entity}
                className={`chip-filter ${selected === entity ? "is-on" : ""}`}
                href={`/admin/records?entity=${entity}`}
              >
                {copy.entityNames[entity]}
              </Link>
            ))}
          </nav>

          {!db ? (
            <p className="alert alert-error mt-6">Database unavailable.</p>
          ) : rows.length === 0 ? (
            <p className="empty-state mt-6">{copy.cleanupEmpty}</p>
          ) : (
            <div className="data-list mt-4">
              {rows.map((row) => (
                <div key={row.id} className="data-row">
                  <span className="data-row__title">{row.label}</span>
                  <span className="data-row__actions">
                    <Link
                      className="tap text-smallmeta font-semibold text-error underline underline-offset-4"
                      href={`/admin/records/${selected}/${row.id}/delete`}
                    >
                      {copy.cleanupOpen}
                    </Link>
                  </span>
                  <span className="data-row__meta">
                    <span>#{row.id}</span>
                    {row.meta ? <span>{row.meta}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

async function loadRows(db: Db, entity: RecordEntity, gu: boolean): Promise<CleanupRow[]> {
  switch (entity) {
    case "course": {
      const rows = await db
        .select({ id: schema.courses.id, slug: schema.courses.slug, nameEn: schema.courses.nameEn, nameGu: schema.courses.nameGu })
        .from(schema.courses)
        .orderBy(desc(schema.courses.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: gu ? r.nameGu : r.nameEn, meta: r.slug }));
    }
    case "batch": {
      const rows = await db
        .select({ id: schema.batches.id, label: schema.batches.label, days: schema.batches.days, startTime: schema.batches.startTime })
        .from(schema.batches)
        .orderBy(desc(schema.batches.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: r.label, meta: `${r.days} · ${r.startTime.slice(0, 5)}` }));
    }
    case "application": {
      const rows = await db
        .select({ id: schema.applications.id, reference: schema.applications.reference, fullName: schema.applications.fullName })
        .from(schema.applications)
        .orderBy(desc(schema.applications.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: r.fullName, meta: r.reference }));
    }
    case "application_note": {
      const rows = await db
        .select({ id: schema.applicationNotes.id, applicationId: schema.applicationNotes.applicationId, createdAt: schema.applicationNotes.createdAt })
        .from(schema.applicationNotes)
        .orderBy(desc(schema.applicationNotes.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: `Note #${r.id}`, meta: `Enquiry #${r.applicationId} · ${formatDate(r.createdAt)}` }));
    }
    case "student": {
      const rows = await db
        .select({ id: schema.students.id, admissionNo: schema.students.admissionNo, fullName: schema.students.fullName })
        .from(schema.students)
        .orderBy(desc(schema.students.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: r.fullName, meta: r.admissionNo }));
    }
    case "guardian": {
      const rows = await db
        .select({ id: schema.guardians.id, name: schema.guardians.name, studentId: schema.guardians.studentId, relation: schema.guardians.relation })
        .from(schema.guardians)
        .orderBy(desc(schema.guardians.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: r.name, meta: `Student #${r.studentId ?? "—"}${r.relation ? ` · ${r.relation}` : ""}` }));
    }
    case "enrollment": {
      const rows = await db
        .select({ id: schema.enrollments.id, studentId: schema.enrollments.studentId, batchId: schema.enrollments.batchId, status: schema.enrollments.status })
        .from(schema.enrollments)
        .orderBy(desc(schema.enrollments.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: `Enrolment #${r.id}`, meta: `Student #${r.studentId} · Batch #${r.batchId} · ${r.status}` }));
    }
    case "attendance_session": {
      const rows = await db
        .select({ id: schema.attendanceSessions.id, batchId: schema.attendanceSessions.batchId, sessionDate: schema.attendanceSessions.sessionDate, lockedAt: schema.attendanceSessions.lockedAt })
        .from(schema.attendanceSessions)
        .orderBy(desc(schema.attendanceSessions.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: r.sessionDate, meta: `Batch #${r.batchId}${r.lockedAt ? " · locked" : ""}` }));
    }
    case "fee_record": {
      const rows = await db
        .select({ id: schema.feeRecords.id, receiptNo: schema.feeRecords.receiptNo, enrollmentId: schema.feeRecords.enrollmentId, received: schema.feeRecords.received })
        .from(schema.feeRecords)
        .orderBy(desc(schema.feeRecords.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: r.receiptNo ?? `Fee entry #${r.id}`, meta: `Enrolment #${r.enrollmentId} · ₹${r.received}` }));
    }
    case "certificate": {
      const rows = await db
        .select({ id: schema.certificates.id, certNo: schema.certificates.certNo, studentName: schema.certificates.studentName, status: schema.certificates.status })
        .from(schema.certificates)
        .orderBy(desc(schema.certificates.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: r.certNo, meta: `${r.studentName} · ${r.status}` }));
    }
    case "service_enquiry": {
      const rows = await db
        .select({ id: schema.serviceEnquiries.id, reference: schema.serviceEnquiries.reference, name: schema.serviceEnquiries.name, company: schema.serviceEnquiries.company })
        .from(schema.serviceEnquiries)
        .orderBy(desc(schema.serviceEnquiries.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: r.reference, meta: `${r.name}${r.company ? ` · ${r.company}` : ""}` }));
    }
    case "content_item": {
      const rows = await db
        .select({ id: schema.contentItems.id, kind: schema.contentItems.kind, slug: schema.contentItems.slug, status: schema.contentItems.status })
        .from(schema.contentItems)
        .orderBy(desc(schema.contentItems.id))
        .limit(200);
      return rows.map((r) => ({ id: r.id, label: `${r.kind}/${r.slug}`, meta: r.status }));
    }
    default:
      return [];
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}
