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
  const showArchived = archived === "1";

  const canViewCourses =
    hasPermission(session.staff, "courses.view") || hasPermission(session.staff, "courses.manage");
  const canViewBatches =
    hasPermission(session.staff, "batches.view") || hasPermission(session.staff, "batches.manage");
  const canManageCourses = hasPermission(session.staff, "courses.manage");

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
  const gu = session.staff.adminLocale === "gu";

  return (
    <div className="max-w-[72rem]">
      <PageHead title={copy.title} context={copy.lede} />

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

      <div className="mt-3 rounded-xl border border-[var(--color-vermilion)] bg-[var(--brand-accent-soft)] px-4 py-3">
        <p className="text-smallmeta font-bold text-[var(--color-vermilion-deep)]">
          {gu ? "Fee અને admission terms હવે staff record છે" : "Fees and admission terms are staff records"}
        </p>
        <p className="form-note mt-1">
          {gu
            ? "Public website પર fee amount દેખાતી નથી. અહીં course ખોલો અને current fee, admission payment, balance days અને norms version અપડેટ રાખો."
            : "The public website does not show fee amounts. Open a course here to keep the current fee, admission payment, balance timing and norms version up to date."}
        </p>
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
              const balance =
                course.feeTotal != null && course.feeAdmission != null
                  ? Math.max(course.feeTotal - course.feeAdmission, 0)
                  : null;

              return (
                <details key={course.id} id={`course-${course.id}`} className="record-anchor">
                  <summary className={`data-row ${isArchived ? "is-archived" : ""}`}>
                    <span className="data-row__title">
                      {gu ? course.nameGu : course.nameEn}
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
                      <span>{courseBatches} · {copy.batchesCount}</span>
                    </span>
                  </summary>

                  <div className="border-t border-line bg-ivory-2/40 px-3 py-4 md:px-4">
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[var(--color-vermilion)] bg-card p-4">
                        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-[var(--color-vermilion-deep)]">
                          {gu ? "Internal fee record" : "Internal fee record"}
                        </p>
                        <p className="mt-2 text-lg font-extrabold text-carbon">
                          {course.feeTotal != null ? money(course.feeTotal) : (gu ? "હજુ સેટ નથી" : "Not set")}
                        </p>
                        {course.feeAdmission != null ? (
                          <p className="form-note mt-1">
                            {gu ? "Admission વખતે" : "At admission"}: {money(course.feeAdmission)}
                          </p>
                        ) : null}
                        {balance != null ? (
                          <p className="form-note mt-1">
                            {gu ? "બાકી" : "Balance"}: {money(balance)}
                            {course.feeBalanceDueDays != null ? ` · ${course.feeBalanceDueDays} ${gu ? "દિવસ" : "days"}` : ""}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs font-semibold text-[var(--color-vermilion-deep)]">
                          {gu ? "Staff only · public page પર amount નથી" : "Staff only · amount is not public"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-line bg-card p-4">
                        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-stone">
                          {gu ? "Admission norms" : "Admission norms"}
                        </p>
                        <p className="mt-2 text-lg font-extrabold text-carbon">
                          {gu ? "Version" : "Version"} {course.termsVersion ?? "—"}
                        </p>
                        <p className="form-note mt-1">
                          {gu
                            ? "Terms બદલાય ત્યારે અહીં લાગુ પડતું version અપડેટ કરો."
                            : "When terms change, update the applicable version here."}
                        </p>
                      </div>
                    </div>

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
