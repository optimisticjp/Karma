import { redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
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
import {
  BatchForm,
  CourseForm,
  type BatchFormValue,
  type CourseFormValue
} from "./CatalogForms";

export default async function CoursesPage() {
  const session = await requireAdmin("/admin/courses");
  const copy = catalogCopy(session.staff.adminLocale);

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
      active: schema.courses.active,
      sortOrder: schema.courses.sortOrder
    })
    .from(schema.courses)
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
          status: schema.batches.status
        })
        .from(schema.batches)
        .leftJoin(schema.staff, eq(schema.batches.trainerId, schema.staff.id))
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

  const activeCourses = courses.filter((course) => course.active).length;

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

      <section className="mt-10 grid gap-8" aria-label={copy.title}>
        {courses.length === 0 ? (
          <p className="empty-state">{copy.noCourses}</p>
        ) : (
          courses.map((course) => {
            const courseBatches = batchesByCourse.get(course.id) ?? [];
            const family = asFamily(course.family);
            const courseValue: CourseFormValue = {
              id: course.id,
              slug: course.slug,
              nameEn: course.nameEn,
              nameGu: course.nameGu,
              family,
              durationWeeks: course.durationWeeks,
              sortOrder: course.sortOrder,
              active: course.active
            };

            return (
              <article key={course.id} className="panel">
                <div className="panel-head flex-wrap gap-4">
                  <div>
                    <p className="microlabel">{copy.families[family]}</p>
                    <h2 className="text-h4 mt-1">{course.nameEn}</h2>
                    <p className="form-note">{course.nameGu}</p>
                  </div>
                  <span className={`status ${course.active ? "status-active" : "status-off"}`}>
                    {course.active ? copy.active : copy.inactive}
                  </span>
                </div>

                <div className="panel-body grid gap-6">
                  <dl className="grid gap-4 sm:grid-cols-3">
                    <Fact label={copy.courseFields.slug} value={course.slug} />
                    <Fact
                      label={copy.courseFields.durationWeeks}
                      value={course.durationWeeks == null ? "—" : String(course.durationWeeks)}
                    />
                    <Fact label={copy.courseFields.sortOrder} value={String(course.sortOrder)} />
                  </dl>

                  {canManageCourses ? (
                    <details>
                      <summary className="cursor-pointer text-smallmeta font-semibold">
                        {copy.editCourse}
                      </summary>
                      <div className="mt-5 rounded-[var(--radius-card)] border border-rule p-5">
                        <CourseForm value={courseValue} copy={copy} />
                      </div>
                    </details>
                  ) : null}

                  {canViewBatches ? (
                    <section aria-label={`${course.nameEn} — ${copy.batchesCount}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-h4">{copy.batchesCount}</h3>
                        <span className="form-note">{courseBatches.length}</span>
                      </div>

                      {courseBatches.length === 0 ? (
                        <p className="empty-state mt-4">{copy.noBatches}</p>
                      ) : (
                        <div className="mt-4 grid gap-4">
                          {courseBatches.map((batch) => {
                            const status = asStatus(batch.status);
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
                              <div key={batch.id} className="rounded-[var(--radius-card)] border border-rule p-5">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-smallmeta font-semibold">{batch.label}</h4>
                                    <p className="form-note mt-1">
                                      {batch.days} · {batch.startTime.slice(0, 5)}–{batch.endTime.slice(0, 5)}
                                    </p>
                                  </div>
                                  <span className={`status ${statusTone(status)}`}>
                                    {copy.statuses[status]}
                                  </span>
                                </div>

                                <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  <Fact
                                    label={copy.batchFields.startDate}
                                    value={formatDate(batch.startDate, session.staff.adminLocale)}
                                  />
                                  <Fact
                                    label={copy.batchFields.endDate}
                                    value={
                                      batch.endDate
                                        ? formatDate(batch.endDate, session.staff.adminLocale)
                                        : "—"
                                    }
                                  />
                                  <Fact
                                    label={copy.batchFields.seats}
                                    value={`${batch.seatsTaken} / ${batch.seats}`}
                                  />
                                  <Fact
                                    label={copy.batchFields.trainer}
                                    value={batch.trainerName ?? copy.noTrainer}
                                  />
                                  <Fact label={copy.batchFields.language} value={batch.language} />
                                </dl>

                                {canManageBatches ? (
                                  <details className="mt-5">
                                    <summary className="cursor-pointer text-smallmeta font-semibold">
                                      {copy.editBatch}
                                    </summary>
                                    <div className="mt-5">
                                      <BatchForm
                                        courseId={course.id}
                                        value={batchValue}
                                        trainers={trainers}
                                        copy={copy}
                                      />
                                    </div>
                                  </details>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {canManageBatches ? (
                        <details className="mt-5 rounded-[var(--radius-card)] border border-dashed border-rule p-5">
                          <summary className="cursor-pointer text-smallmeta font-semibold">
                            {copy.addBatch}
                          </summary>
                          <div className="mt-5">
                            <BatchForm courseId={course.id} trainers={trainers} copy={copy} />
                          </div>
                        </details>
                      ) : null}
                    </section>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="microlabel">{label}</dt>
      <dd className="mt-1 text-smallmeta">{value}</dd>
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
