import { redirect } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHead } from "@/components/admin/PageHead";
import { hasPermission } from "@/lib/auth/access";
import { catalogCopy } from "@/lib/admin/courses-copy";
import { BATCH_STATUSES, type BatchStatus } from "@/lib/admin/course-validation";
import { recordsCopy } from "@/lib/admin/records-copy";
import { canPerform } from "@/lib/admin/record-actions";
import { RecordMenu } from "@/components/admin/RecordMenu";
import { PrintLink } from "@/components/admin/PrintLink";
import { printCopy } from "@/lib/admin/print-copy";
import { kolkataDate } from "@/lib/admin/dates";
import { BatchForm, type BatchFormValue } from "../courses/CatalogForms";

/**
 * Batches — a first-class destination since 2026-08-31.
 *
 * It did not exist. A batch lived as a nested `<details>` two levels inside a
 * course row on /admin/courses, which is why Today deep-linked
 * `/admin/courses#batch-N` and why reaching the group running right now cost
 * a drawer, a page, a course row and then a batch row.
 *
 * Five things said the batch, not the course, is the daily object: it owns one
 * of the three Today queues; Today already addresses it as a record;
 * `batches.*` is already a permission key distinct from `courses.*` and
 * grouped under teaching; two of the nine A4 sheets hang off a batch; and the
 * owner had the catalogue's own import entry point removed because "the
 * catalogue is settled". A course is a thing you edit twice a year. A batch is
 * a thing you open every day.
 *
 * The row carries what an operator standing at a machine needs to decide
 * something — course, days, time, seats, trainer, start date — and its first
 * action is the register, because that is the task the batch exists for. Every
 * field comes from the query that already ran; the only addition is the course
 * name, one inner join, exactly as the attendance page already does it.
 */
export default async function BatchesPage({
  searchParams
}: {
  searchParams: Promise<{ archived?: string; course?: string }>;
}) {
  const session = await requireAdmin("/admin/batches");
  const copy = catalogCopy(session.staff.adminLocale);
  const records = recordsCopy(session.staff.adminLocale);
  const sheets = printCopy(session.staff.adminLocale);
  const { archived, course: courseFilter } = await searchParams;
  const showArchived = archived === "1";

  const canView =
    hasPermission(session.staff, "batches.view") || hasPermission(session.staff, "batches.manage");
  const canManage = hasPermission(session.staff, "batches.manage");
  const canAttendance =
    hasPermission(session.staff, "attendance.view") ||
    hasPermission(session.staff, "attendance.manage");

  if (!canView) redirect("/admin/no-access?reason=permission");

  const db = getDb();
  if (!db) {
    return (
      <div className="max-w-[72rem]">
        <PageHead title={copy.batchesTitle} context={copy.batchesLede} />
        <p className="alert alert-error mt-4">{copy.notConfigured}</p>
      </div>
    );
  }

  const courses = await db
    .select({
      id: schema.courses.id,
      nameEn: schema.courses.nameEn,
      nameGu: schema.courses.nameGu
    })
    .from(schema.courses)
    .where(isNull(schema.courses.archivedAt))
    .orderBy(asc(schema.courses.sortOrder), asc(schema.courses.nameEn));

  const selectedCourse = courses.find((c) => String(c.id) === courseFilter) ?? null;

  /* One query, one join. The course name used to come from the nesting; it is
     a column now, which is what lets a batch stand on its own row. */
  const rows = await db
    .select({
      id: schema.batches.id,
      courseId: schema.batches.courseId,
      courseNameEn: schema.courses.nameEn,
      courseNameGu: schema.courses.nameGu,
      label: schema.batches.label,
      days: schema.batches.days,
      startTime: schema.batches.startTime,
      endTime: schema.batches.endTime,
      startDate: schema.batches.startDate,
      endDate: schema.batches.endDate,
      seats: schema.batches.seats,
      seatsTaken: schema.batches.seatsTaken,
      language: schema.batches.language,
      trainerId: schema.batches.trainerId,
      trainerName: schema.staff.name,
      status: schema.batches.status,
      archivedAt: schema.batches.archivedAt
    })
    .from(schema.batches)
    .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
    .leftJoin(schema.staff, eq(schema.batches.trainerId, schema.staff.id))
    .where(
      and(
        showArchived ? undefined : isNull(schema.batches.archivedAt),
        selectedCourse ? eq(schema.batches.courseId, selectedCourse.id) : undefined
      )
    )
    .orderBy(asc(schema.batches.startDate), asc(schema.batches.startTime));

  const trainers = canManage
    ? await db
        .select({ id: schema.staff.id, name: schema.staff.name })
        .from(schema.staff)
        .where(and(eq(schema.staff.role, "trainer"), eq(schema.staff.active, true)))
        .orderBy(asc(schema.staff.name))
    : [];

  const subject = {
    role: session.role,
    has: (permission: Parameters<typeof hasPermission>[1]) =>
      hasPermission(session.staff, permission)
  };
  const batchCan = {
    archive: canPerform(subject, "batch", "archive"),
    restore: canPerform(subject, "batch", "restore"),
    delete: canPerform(subject, "batch", "delete")
  };

  const today = kolkataDate();
  const gu = session.staff.adminLocale === "gu";
  const running = rows.filter((b) => !b.archivedAt && (b.status === "open" || b.status === "started")).length;

  return (
    <div className="max-w-[72rem]">
      <PageHead title={copy.batchesTitle} context={copy.batchesLede} />

      <div className="console-metrics mt-3">
        <div>
          <span className="kv-label">{copy.batchesCount}</span>
          <span className="kv-value">{rows.length}</span>
        </div>
        <div>
          <span className="kv-label">{copy.statuses.started}</span>
          <span className="kv-value">{running}</span>
        </div>
      </div>

      {/* One compact row of filters: the course, and whether archived batches
          are in the picture. Horizontally scrollable rather than wrapping,
          because eleven course names stack to four rows in Gujarati. */}
      <form method="get" className="toolbar mt-3">
        <div className="chip-scroller" role="group" aria-label={copy.courseLabel}>
          <a
            className={`chip-filter ${selectedCourse ? "" : "is-on"}`}
            href={showArchived ? "?archived=1" : "?"}
          >
            {copy.allCourses}
          </a>
          {courses.map((c) => (
            <a
              key={c.id}
              className={`chip-filter ${selectedCourse?.id === c.id ? "is-on" : ""}`}
              href={`?course=${c.id}${showArchived ? "&archived=1" : ""}`}
            >
              {gu ? c.nameGu : c.nameEn}
            </a>
          ))}
        </div>
        <label className="choice-chip w-fit text-smallmeta">
          <input
            type="checkbox"
            name="archived"
            value="1"
            className="size-4 accent-vermilion"
            defaultChecked={showArchived}
          />
          {records.showArchived}
        </label>
        {selectedCourse ? (
          <input type="hidden" name="course" value={selectedCourse.id} />
        ) : null}
        <button className="btn btn-secondary !min-h-11 w-fit" type="submit">
          {copy.batchesTitle}
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="empty-state mt-3">{copy.noBatches}</p>
      ) : (
        <div className="data-list mt-3">
          {rows.map((batch) => {
            const status = asStatus(batch.status);
            const isArchived = Boolean(batch.archivedAt);
            const value: BatchFormValue = {
              id: batch.id,
              courseId: batch.courseId,
              label: batch.label,
              days: batch.days,
              startTime: batch.startTime.slice(0, 5),
              endTime: batch.endTime.slice(0, 5),
              startDate: batch.startDate,
              endDate: batch.endDate,
              seats: batch.seats,
              language: batch.language,
              trainerId: batch.trainerId,
              status
            };
            return (
              <details key={batch.id} id={`batch-${batch.id}`} className="record-anchor">
                <summary className={`data-row ${isArchived ? "is-archived" : ""}`}>
                  <span className="data-row__title">{batch.label}</span>
                  <span className="data-row__actions">
                    <span className={`chip ${isArchived ? "status-off" : statusTone(status)}`}>
                      {isArchived ? records.archived : copy.statuses[status]}
                    </span>
                  </span>
                  <span className="data-row__meta">
                    <span>{gu ? batch.courseNameGu : batch.courseNameEn}</span>
                    <span>{batch.days}</span>
                    <span>
                      {batch.startTime.slice(0, 5)}–{batch.endTime.slice(0, 5)}
                    </span>
                  </span>
                  <span className="data-row__meta">
                    <span className="data-num">
                      {batch.seatsTaken}/{batch.seats}
                    </span>
                    <span>{batch.trainerName ?? copy.noTrainer}</span>
                    <span>{formatDate(batch.startDate, session.staff.adminLocale)}</span>
                  </span>
                </summary>

                <div className="border-t border-line px-3 py-3 md:px-4">
                  <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                    {/* The register first: it is the task a batch exists for,
                        and the attendance page already accepts ?batch= and
                        ?date=, so this is an href and not a new query. */}
                    {canAttendance ? (
                      <a
                        className="tap text-smallmeta font-semibold text-vermilion-deep"
                        href={`/admin/attendance?batch=${batch.id}&date=${today}`}
                      >
                        {copy.takeAttendance}
                      </a>
                    ) : null}
                    <PrintLink href={`/admin/print/roster/${batch.id}`} label={sheets.roster} compact />
                    <PrintLink href={`/admin/print/register/${batch.id}`} label={sheets.register} compact />
                    {canManage || batchCan.delete ? (
                      <RecordMenu
                        entity="batch"
                        id={batch.id}
                        label={batch.label}
                        archived={isArchived}
                        canArchive={batchCan.archive && canManage}
                        canRestore={batchCan.restore && canManage}
                        canDelete={batchCan.delete}
                        copy={records}
                      />
                    ) : null}
                  </div>
                  {canManage ? (
                    <BatchForm
                      courseId={batch.courseId}
                      value={value}
                      trainers={trainers}
                      copy={copy}
                    />
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>
      )}

      {canManage && courses.length > 0 ? (
        <details className="panel mt-3">
          <summary className="panel-head cursor-pointer text-smallmeta font-semibold">
            {copy.addBatch}
          </summary>
          <div className="panel-body">
            <BatchForm
              courseId={selectedCourse?.id ?? courses[0].id}
              trainers={trainers}
              copy={copy}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}

function asStatus(value: string): BatchStatus {
  return BATCH_STATUSES.includes(value as BatchStatus) ? (value as BatchStatus) : "open";
}

function statusTone(status: BatchStatus) {
  if (status === "open" || status === "started") return "status-active";
  if (status === "full") return "status-pending";
  return "status-off";
}

function formatDate(value: string, locale: "en" | "gu") {
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short"
  }).format(new Date(`${value}T00:00:00+05:30`));
}
