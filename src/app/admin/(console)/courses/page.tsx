import { redirect } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { catalogCopy } from "@/lib/admin/courses-copy";
import {
  BATCH_STATUSES,
  COURSE_FAMILIES,
  type BatchStatus,
  type CourseFamily
} from "@/lib/admin/course-validation";
import { readCourseOperations, operationsToForm } from "@/lib/admin/course-operations";
import { recordsCopy } from "@/lib/admin/records-copy";
import { canPerform } from "@/lib/admin/record-actions";
import { RecordMenu } from "@/components/admin/RecordMenu";
import { PrintLink } from "@/components/admin/PrintLink";
import { printCopy } from "@/lib/admin/print-copy";
import {
  BatchForm,
  CourseForm,
  type BatchFormValue,
  type CourseFormValue
} from "./CatalogForms";

export default async function CoursesPage({
  searchParams
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const session = await requireAdmin("/admin/courses");
  const copy = catalogCopy(session.staff.adminLocale);
  const records = recordsCopy(session.staff.adminLocale);
  const sheets = printCopy(session.staff.adminLocale);
  const { archived } = await searchParams;
  /**
   * Archived courses are OUT of the operational picture by default and one
   * checkbox away from being visible. Hiding them permanently would make an
   * archived course indistinguishable from a deleted one, which is the whole
   * distinction this page is trying to teach.
   */
  const showArchived = archived === "1";

  const canViewCourses =
    hasPermission(session.staff, "courses.view") || hasPermission(session.staff, "courses.manage");
  const canViewBatches =
    hasPermission(session.staff, "batches.view") || hasPermission(session.staff, "batches.manage");
  const canManageCourses = hasPermission(session.staff, "courses.manage");
  const canManageBatches = hasPermission(session.staff, "batches.manage");

  if (!canViewCourses && !canViewBatches) {
    redirect("/admin/no-access?reason=permission");
  }

  const db = getDb();
  if (!db) {
    return (
      <div className="max-w-[64rem]">
        <PageHeading title={copy.title} lede={copy.lede} />
        <p className="alert alert-error mt-8">{copy.notConfigured}</p>
      </div>
    );
  }

  const courses = await db
    .select({
      id: schema.courses.id,
      slug: schema.courses.slug,
      nameEn: schema.courses.nameEn,
      nameGu: schema.courses.nameGu,
      family: schema.courses.family,
      durationWeeks: schema.courses.durationWeeks,
      durationMonths: schema.courses.durationMonths,
      software: schema.courses.software,
      feeTotal: schema.courses.feeTotal,
      feeAdmission: schema.courses.feeAdmission,
      feeBalanceDueDays: schema.courses.feeBalanceDueDays,
      termsVersion: schema.courses.termsVersion,
      publicVisible: schema.courses.publicVisible,
      operations: schema.courses.operations,
      active: schema.courses.active,
      archivedAt: schema.courses.archivedAt,
      sortOrder: schema.courses.sortOrder
    })
    .from(schema.courses)
    .where(showArchived ? undefined : isNull(schema.courses.archivedAt))
    .orderBy(asc(schema.courses.sortOrder), asc(schema.courses.nameEn));

  const batches = canViewBatches
    ? await db
        .select({
          id: schema.batches.id,
          courseId: schema.batches.courseId,
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
        .leftJoin(schema.staff, eq(schema.batches.trainerId, schema.staff.id))
        .where(showArchived ? undefined : isNull(schema.batches.archivedAt))
        .orderBy(asc(schema.batches.startDate), asc(schema.batches.startTime))
    : [];

  const trainers = canManageBatches
    ? await db
        .select({ id: schema.staff.id, name: schema.staff.name })
        .from(schema.staff)
        .where(and(eq(schema.staff.role, "trainer"), eq(schema.staff.active, true)))
        .orderBy(asc(schema.staff.name))
    : [];

  const batchesByCourse = new Map<number, typeof batches>();
  for (const batch of batches) {
    const list = batchesByCourse.get(batch.courseId) ?? [];
    list.push(batch);
    batchesByCourse.set(batch.courseId, list);
  }

  const activeCourses = courses.filter((course) => course.active && !course.archivedAt).length;

  /* What the caller may do to a record of each kind. Navigation only — every
     action re-checks the same policy server-side. */
  const subject = {
    role: session.role,
    has: (permission: Parameters<typeof hasPermission>[1]) =>
      hasPermission(session.staff, permission)
  };
  const courseCan = {
    archive: canPerform(subject, "course", "archive"),
    restore: canPerform(subject, "course", "restore"),
    delete: canPerform(subject, "course", "delete")
  };
  const batchCan = {
    archive: canPerform(subject, "batch", "archive"),
    restore: canPerform(subject, "batch", "restore"),
    delete: canPerform(subject, "batch", "delete")
  };

  return (
    <div className="max-w-[72rem]">
      <PageHeading title={copy.title} lede={copy.lede} />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label={copy.coursesCount} value={courses.length} />
        <Metric label={copy.activeCoursesCount} value={activeCourses} />
        <Metric label={copy.batchesCount} value={batches.length} />
      </div>

      {!canManageCourses && !canManageBatches ? (
        <p className="form-note mt-6">{copy.viewOnly}</p>
      ) : null}

      {canManageCourses ? (
        <details className="panel mt-8">
          <summary className="panel-head cursor-pointer text-smallmeta font-semibold">
            {copy.addCourse}
          </summary>
          <div className="panel-body">
            <CourseForm copy={copy} />
          </div>
        </details>
      ) : null}

      {/* One dense list. Each course is a <details> whose <summary> IS the row,
          so opening a course costs no JavaScript and no page change — the
          operator stays exactly where they were in the list. */}
      <section className="mt-6" aria-label={copy.title}>
        <form method="get" className="toolbar">
          <label className="choice-chip text-smallmeta w-fit">
            <input
              type="checkbox"
              name="archived"
              value="1"
              className="size-4 accent-vermilion"
              defaultChecked={showArchived}
            />
            {records.showArchived}
          </label>
          <button className="btn btn-secondary !min-h-11 w-fit" type="submit">
            {copy.title}
          </button>
        </form>

        {courses.length === 0 ? (
          <p className="empty-state mt-4">{copy.noCourses}</p>
        ) : (
          <div className="data-list mt-4">
            {courses.map((course) => {
              const courseBatches = batchesByCourse.get(course.id) ?? [];
              const family = asFamily(course.family);
              const isArchived = Boolean(course.archivedAt);
              const courseValue: CourseFormValue = {
                id: course.id,
                slug: course.slug,
                nameEn: course.nameEn,
                nameGu: course.nameGu,
                family,
                durationWeeks: course.durationWeeks,
                durationMonths: course.durationMonths,
                software: course.software,
                feeTotal: course.feeTotal,
                feeAdmission: course.feeAdmission,
                feeBalanceDueDays: course.feeBalanceDueDays,
                termsVersion: course.termsVersion,
                publicVisible: course.publicVisible,
                sortOrder: course.sortOrder,
                active: course.active,
                operations: operationsToForm(readCourseOperations(course.operations))
              };

              return (
                <details key={course.id}>
                  <summary className={`data-row ${isArchived ? "is-archived" : ""}`}>
                    <span className="data-row__title">
                      {session.staff.adminLocale === "gu" ? course.nameGu : course.nameEn}
                    </span>
                    <span className="data-row__actions">
                      <span className={`chip ${isArchived ? "status-off" : course.active ? "status-active" : "status-pending"}`}>
                        {isArchived ? records.archived : course.active ? copy.active : copy.inactive}
                      </span>
                    </span>
                    <span className="data-row__meta">
                      <span>{copy.families[family]}</span>
                      <span>{course.slug}</span>
                      {course.durationMonths ? <span>{course.durationMonths} mo</span> : null}
                      {course.feeTotal != null ? <span className="data-num">{money(course.feeTotal)}</span> : null}
                      <span>{courseBatches.length} · {copy.batchesCount}</span>
                    </span>
                  </summary>

                  <div className="border-t border-line bg-ivory-2/40 px-3 py-4 md:px-4">
                    {canManageCourses || courseCan.delete ? (
                      <div className="mb-4 flex justify-end">
                        <RecordMenu
                          entity="course"
                          id={course.id}
                          label={course.nameEn}
                          archived={isArchived}
                          canArchive={courseCan.archive && canManageCourses}
                          canRestore={courseCan.restore && canManageCourses}
                          canDelete={courseCan.delete}
                          copy={records}
                        />
                      </div>
                    ) : null}

                    {canManageCourses ? (
                      <details className="border border-rule bg-card">
                        <summary className="cursor-pointer px-4 py-3 text-smallmeta font-semibold">
                          {copy.editCourse}
                        </summary>
                        <div className="border-t border-rule p-4">
                          <CourseForm value={courseValue} copy={copy} />
                        </div>
                      </details>
                    ) : null}

                    {canViewBatches ? (
                      <section className="mt-4" aria-label={`${course.nameEn} — ${copy.batchesCount}`}>
                        <p className="kv-label">{copy.batchesCount}</p>
                        {courseBatches.length === 0 ? (
                          <p className="empty-state mt-2">{copy.noBatches}</p>
                        ) : (
                          <div className="data-list mt-2">
                            {courseBatches.map((batch) => {
                              const status = asStatus(batch.status);
                              const batchArchived = Boolean(batch.archivedAt);
                              const batchValue: BatchFormValue = {
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
                                <details key={batch.id}>
                                  <summary className={`data-row ${batchArchived ? "is-archived" : ""}`}>
                                    <span className="data-row__title">{batch.label}</span>
                                    <span className="data-row__actions">
                                      <span className={`chip ${batchArchived ? "status-off" : statusTone(status)}`}>
                                        {batchArchived ? records.archived : copy.statuses[status]}
                                      </span>
                                    </span>
                                    <span className="data-row__meta">
                                      <span>{batch.days}</span>
                                      <span>{batch.startTime.slice(0, 5)}–{batch.endTime.slice(0, 5)}</span>
                                      <span>{formatDate(batch.startDate, session.staff.adminLocale)}</span>
                                      <span className="data-num">{batch.seatsTaken}/{batch.seats}</span>
                                      <span>{batch.trainerName ?? copy.noTrainer}</span>
                                    </span>
                                  </summary>
                                  <div className="border-t border-line px-3 py-4 md:px-4">
                                    <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
                                      <PrintLink href={`/admin/print/roster/${batch.id}`} label={sheets.roster} compact />
                                      <PrintLink href={`/admin/print/register/${batch.id}`} label={sheets.register} compact />
                                    </div>
                                    {canManageBatches || batchCan.delete ? (
                                      <div className="mb-4 flex justify-end">
                                        <RecordMenu
                                          entity="batch"
                                          id={batch.id}
                                          label={batch.label}
                                          archived={batchArchived}
                                          canArchive={batchCan.archive && canManageBatches}
                                          canRestore={batchCan.restore && canManageBatches}
                                          canDelete={batchCan.delete}
                                          copy={records}
                                        />
                                      </div>
                                    ) : null}
                                    {canManageBatches ? (
                                      <BatchForm
                                        courseId={course.id}
                                        value={batchValue}
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

                        {canManageBatches ? (
                          <details className="mt-3 border border-dashed border-rule bg-card">
                            <summary className="cursor-pointer px-4 py-3 text-smallmeta font-semibold">
                              {copy.addBatch}
                            </summary>
                            <div className="border-t border-rule p-4">
                              <BatchForm courseId={course.id} trainers={trainers} copy={copy} />
                            </div>
                          </details>
                        ) : null}
                      </section>
                    ) : null}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/** Whole rupees, with tabular figures so a column of fees does not jitter. */
function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function PageHeading({ title, lede }: { title: string; lede: string }) {
  return (
    <div>
      <h1 className="text-h2">{title}</h1>
      <span aria-hidden className="rule-stitch is-in" />
      <p className="u-lede">{lede}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel panel-body">
      <p className="microlabel">{label}</p>
      <p className="text-h3 mt-2">{value}</p>
    </div>
  );
}

function asFamily(value: string): CourseFamily {
  return COURSE_FAMILIES.includes(value as CourseFamily) ? (value as CourseFamily) : "machine";
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
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00+05:30`));
}
