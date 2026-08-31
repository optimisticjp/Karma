import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, count, isNull } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHead } from "@/components/admin/PageHead";
import { hasPermission } from "@/lib/auth/access";
import { catalogCopy } from "@/lib/admin/courses-copy";
import { COURSE_FAMILIES, type CourseFamily } from "@/lib/admin/course-validation";
import { readCourseOperations, operationsToForm } from "@/lib/admin/course-operations";
import { recordsCopy } from "@/lib/admin/records-copy";
import { canPerform } from "@/lib/admin/record-actions";
import { RecordMenu } from "@/components/admin/RecordMenu";
import { CourseForm, type CourseFormValue } from "./CatalogForms";

export default async function CoursesPage({
  searchParams
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const session = await requireAdmin("/admin/courses");
  const copy = catalogCopy(session.staff.adminLocale);
  const records = recordsCopy(session.staff.adminLocale);
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

  /* Batches moved to /admin/batches on 2026-08-31, so this page is the
     catalogue and nothing else. An operator holding only `batches.*` is not
     sent to a page of course rows they cannot edit — they get the batch list,
     which is the daily object anyway. */
  if (!canViewCourses) {
    redirect("/admin/no-access?reason=permission");
  }

  const db = getDb();
  if (!db) {
    return (
      <div className="max-w-[64rem]">
        <PageHead title={copy.title} context={copy.lede} />
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

  /* A COUNT, not a list. This page used to select every column of every batch
     with a trainer join, purely to nest them inside course rows — and then to
     render a number on the closed row. One grouped query answers the only
     question this page still asks about batches. */
  const batchCounts = canViewBatches
    ? await db
        .select({ courseId: schema.batches.courseId, total: count() })
        .from(schema.batches)
        .where(showArchived ? undefined : isNull(schema.batches.archivedAt))
        .groupBy(schema.batches.courseId)
    : [];
  const batchesByCourse = new Map(batchCounts.map((row) => [row.courseId, Number(row.total)]));
  const totalBatches = batchCounts.reduce((sum, row) => sum + Number(row.total), 0);

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

  return (
    <div className="max-w-[72rem]">
      <PageHead title={copy.title} context={copy.lede} />

      {/* A hairline strip, not three stacked cards. Three `panel panel-body`
          metrics went single-column at 390px and cost 308px before the first
          course row — on the page whose whole job is the catalogue. */}
      <div className="console-metrics mt-3">
        <div>
          <span className="kv-label">{copy.coursesCount}</span>
          <span className="kv-value">{courses.length}</span>
        </div>
        <div>
          <span className="kv-label">{copy.activeCoursesCount}</span>
          <span className="kv-value">{activeCourses}</span>
        </div>
        <div>
          <span className="kv-label">{copy.batchesCount}</span>
          <span className="kv-value">{totalBatches}</span>
        </div>
      </div>

      {canViewBatches ? (
        <p className="mt-3">
          <Link className="stitch-link text-smallmeta font-semibold" href="/admin/batches">
            {copy.batchesTitle} →
          </Link>
        </p>
      ) : null}

      {!canManageCourses ? <p className="form-note mt-3">{copy.viewOnly}</p> : null}

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
              const courseBatches = batchesByCourse.get(course.id) ?? 0;
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
                <details key={course.id} id={`course-${course.id}`} className="record-anchor">
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
                      <span>
                        {courseBatches} · {copy.batchesCount}
                      </span>
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

function asFamily(value: string): CourseFamily {
  return COURSE_FAMILIES.includes(value as CourseFamily) ? (value as CourseFamily) : "machine";
}

