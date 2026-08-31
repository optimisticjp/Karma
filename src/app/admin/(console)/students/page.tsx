import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, inArray, isNull, or, sum } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHead } from "@/components/admin/PageHead";
import { hasPermission } from "@/lib/auth/access";
import { studentsCopy } from "@/lib/admin/students-copy";
import { isEnrollmentStatus, positiveId, type EnrollmentStatus } from "@/lib/admin/students";
import { recordsCopy } from "@/lib/admin/records-copy";
import { canPerform } from "@/lib/admin/record-actions";
import { RecordMenu } from "@/components/admin/RecordMenu";
import { PrintLink } from "@/components/admin/PrintLink";
import { printCopy } from "@/lib/admin/print-copy";
import {
  AddEnrollmentForm,
  ConvertEnquiryForm,
  DirectAdmissionForm,
  EnrollmentStatusForm,
  StudentEditForm,
  type BatchOption,
  type StudentEditValue
} from "./StudentForms";

type Props = { searchParams: Promise<{ q?: string; student?: string; archived?: string }> };

export default async function StudentsPage({ searchParams }: Props) {
  const session = await requireAdmin("/admin/students");
  const canView = hasPermission(session.staff, "students.view") || hasPermission(session.staff, "students.manage");
  const canManage = hasPermission(session.staff, "students.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");
  const copy = studentsCopy(session.staff.adminLocale);
  const records = recordsCopy(session.staff.adminLocale);
  const sheets = printCopy(session.staff.adminLocale);
  const subject = {
    role: session.role,
    has: (permission: Parameters<typeof hasPermission>[1]) => hasPermission(session.staff, permission)
  };
  const studentCan = {
    archive: canPerform(subject, "student", "archive"),
    restore: canPerform(subject, "student", "restore"),
    delete: canPerform(subject, "student", "delete")
  };
  const db = getDb();
  if (!db) return <div className="max-w-[76rem]"><PageHead title={copy.title} context={copy.lede} /><p className="alert alert-error mt-8">Database unavailable.</p></div>;

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 120) : "";
  const requestedStudent = positiveId(params.student);
  /* Archived students stay findable — an archived record and a deleted one
     must never look the same — but they are out of the list by default. */
  const showArchived = params.archived === "1";

  const [studentRows, batchRows, enquiryRows] = await Promise.all([
    db.select({
      id: schema.students.id,
      admissionNo: schema.students.admissionNo,
      fullName: schema.students.fullName,
      phone: schema.students.phone,
      whatsapp: schema.students.whatsapp,
      email: schema.students.email,
      area: schema.students.area,
      languagePref: schema.students.languagePref,
      isMinor: schema.students.isMinor,
      photoConsent: schema.students.photoConsent,
      notes: schema.students.notes,
      archivedAt: schema.students.archivedAt,
      fatherName: schema.students.fatherName,
      referenceName: schema.students.referenceName,
      referencePhone: schema.students.referencePhone,
      createdAt: schema.students.createdAt
    })
      .from(schema.students)
      .where(showArchived ? undefined : isNull(schema.students.archivedAt))
      .orderBy(desc(schema.students.createdAt))
      .limit(300),
    db.select({
      id: schema.batches.id,
      label: schema.batches.label,
      seats: schema.batches.seats,
      seatsTaken: schema.batches.seatsTaken,
      status: schema.batches.status,
      courseNameEn: schema.courses.nameEn,
      courseNameGu: schema.courses.nameGu
    }).from(schema.batches)
      .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
      /* Archived courses and batches never appear in an admission picker. */
      .where(
        and(
          eq(schema.courses.active, true),
          isNull(schema.courses.archivedAt),
          isNull(schema.batches.archivedAt),
          or(eq(schema.batches.status, "open"), eq(schema.batches.status, "started"))
        )
      )
      .orderBy(asc(schema.courses.sortOrder), asc(schema.batches.startDate), asc(schema.batches.startTime)),
    db.select({ id: schema.applications.id, reference: schema.applications.reference, fullName: schema.applications.fullName, courseSlug: schema.applications.courseSlug })
      .from(schema.applications)
      .where(inArray(schema.applications.status, ["new", "contacted", "demo_scheduled", "visit_done", "accepted", "waitlisted", "documents_pending"]))
      .orderBy(desc(schema.applications.updatedAt))
      .limit(200)
  ]);

  const students = studentRows.filter((student) => !q || [student.fullName, student.admissionNo, student.phone, student.whatsapp ?? ""].some((v) => v.toLowerCase().includes(q)));

  /*
   * WHAT A DIRECTORY ROW MUST ANSWER
   *
   * The row carried a name, an admission number and a phone — and an ACTIVE
   * student's row carried no status at all, only an archived one did. So the
   * directory could not answer the two questions it is opened for: which
   * course is this person on, and do they owe anything.
   *
   * Two set-based reads over the ids already on screen, not a lookup per row.
   * The current enrolment comes from one grouped query; the balance from one
   * more that sums the ledger per enrolment. Both shrink with the list, and
   * both stay one round trip each — never N+1.
   *
   * The balance is DERIVED here exactly as `summariseFees` derives it on the
   * fees page: agreement snapshot minus discount minus received. Nothing
   * stores a paid flag, and this row must not become the place one appears.
   */
  const visibleIds = students.map((student) => student.id);
  const [currentEnrolments, balances] = visibleIds.length
    ? await Promise.all([
        db
          .select({
            studentId: schema.enrollments.studentId,
            status: schema.enrollments.status,
            batchLabel: schema.batches.label,
            courseNameEn: schema.courses.nameEn,
            courseNameGu: schema.courses.nameGu
          })
          .from(schema.enrollments)
          .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
          .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
          .where(inArray(schema.enrollments.studentId, visibleIds))
          .orderBy(desc(schema.enrollments.joinedOn)),
        db
          .select({
            studentId: schema.enrollments.studentId,
            agreed: sum(schema.enrollments.agreedFeeTotal),
            discount: sum(schema.feeRecords.discount),
            received: sum(schema.feeRecords.received)
          })
          .from(schema.enrollments)
          .leftJoin(schema.feeRecords, eq(schema.feeRecords.enrollmentId, schema.enrollments.id))
          .where(inArray(schema.enrollments.studentId, visibleIds))
          .groupBy(schema.enrollments.studentId)
      ])
    : [[], []];

  const enrolmentByStudent = new Map<number, (typeof currentEnrolments)[number]>();
  for (const row of currentEnrolments) {
    if (!enrolmentByStudent.has(row.studentId)) enrolmentByStudent.set(row.studentId, row);
  }
  const balanceByStudent = new Map<number, number>();
  for (const row of balances) {
    const agreed = Number(row.agreed ?? 0);
    if (!agreed) continue;
    const owed = agreed - Number(row.discount ?? 0) - Number(row.received ?? 0);
    balanceByStudent.set(row.studentId, Math.max(0, owed));
  }
  const selectedId = requestedStudent && studentRows.some((s) => s.id === requestedStudent)
    ? requestedStudent
    : students[0]?.id ?? null;
  const selected = selectedId ? studentRows.find((s) => s.id === selectedId) ?? null : null;
  const batches: BatchOption[] = batchRows.map((batch) => ({
    id: batch.id,
    label: batch.label,
    courseName: session.staff.adminLocale === "gu" ? batch.courseNameGu : batch.courseNameEn,
    seats: batch.seats,
    seatsTaken: batch.seatsTaken,
    status: batch.status
  }));

  let guardian: { name: string; phone: string; relation: string | null } | null = null;
  let enrollments: Array<{
    id: number; batchId: number; batchLabel: string; courseName: string; status: EnrollmentStatus;
    joinedOn: string | null; completedOn: string | null;
  }> = [];
  let attendance: Array<{ status: "present" | "absent" | "late" | "excused" }> = [];
  let fees: Array<{ enrollmentId: number; courseFee: number; discount: number; received: number; receiptNo: string | null; dueDate: string | null; createdAt: Date }> = [];
  let certificates: Array<{ certNo: string; courseName: string; issuedOn: string; grade: string | null; status: "issued" | "revoked" }> = [];

  if (selectedId) {
    const [guardianRows, enrollmentRows, attendanceRows] = await Promise.all([
      db.select({ name: schema.guardians.name, phone: schema.guardians.phone, relation: schema.guardians.relation })
        .from(schema.guardians).where(eq(schema.guardians.studentId, selectedId)).orderBy(asc(schema.guardians.id)).limit(1),
      db.select({
        id: schema.enrollments.id,
        batchId: schema.enrollments.batchId,
        batchLabel: schema.batches.label,
        courseNameEn: schema.courses.nameEn,
        courseNameGu: schema.courses.nameGu,
        status: schema.enrollments.status,
        joinedOn: schema.enrollments.joinedOn,
        completedOn: schema.enrollments.completedOn
      }).from(schema.enrollments)
        .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
        .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
        .where(eq(schema.enrollments.studentId, selectedId))
        .orderBy(desc(schema.enrollments.createdAt)),
      db.select({ status: schema.attendanceRecords.status }).from(schema.attendanceRecords).where(eq(schema.attendanceRecords.studentId, selectedId))
    ]);
    guardian = guardianRows[0] ?? null;
    enrollments = enrollmentRows.map((e) => ({
      id: e.id,
      batchId: e.batchId,
      batchLabel: e.batchLabel,
      courseName: session.staff.adminLocale === "gu" ? e.courseNameGu : e.courseNameEn,
      status: isEnrollmentStatus(e.status) ? e.status : "active",
      joinedOn: e.joinedOn,
      completedOn: e.completedOn
    }));
    attendance = attendanceRows;
    const enrollmentIds = enrollments.map((e) => e.id);
    if (enrollmentIds.length) {
      [fees, certificates] = await Promise.all([
        db.select({ enrollmentId: schema.feeRecords.enrollmentId, courseFee: schema.feeRecords.courseFee, discount: schema.feeRecords.discount, received: schema.feeRecords.received, receiptNo: schema.feeRecords.receiptNo, dueDate: schema.feeRecords.dueDate, createdAt: schema.feeRecords.createdAt })
          .from(schema.feeRecords).where(inArray(schema.feeRecords.enrollmentId, enrollmentIds)).orderBy(desc(schema.feeRecords.createdAt)),
        db.select({ certNo: schema.certificates.certNo, courseName: schema.certificates.courseName, issuedOn: schema.certificates.issuedOn, grade: schema.certificates.grade, status: schema.certificates.status })
          .from(schema.certificates).where(inArray(schema.certificates.enrollmentId, enrollmentIds)).orderBy(desc(schema.certificates.issuedOn))
      ]);
    }
  }

  const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : null;
  const feeSummary = summarizeFees(fees);
  const editValue: StudentEditValue | null = selected ? {
    id: selected.id,
    fullName: selected.fullName,
    phone: selected.phone,
    whatsapp: selected.whatsapp,
    email: selected.email,
    area: selected.area,
    languagePref: selected.languagePref,
    isMinor: selected.isMinor,
    photoConsent: selected.photoConsent,
    notes: selected.notes,
    fatherName: selected.fatherName,
    referenceName: selected.referenceName,
    referencePhone: selected.referencePhone,
    guardianName: guardian?.name ?? null,
    guardianPhone: guardian?.phone ?? null,
    guardianRelation: guardian?.relation ?? null
  } : null;

  return (
    <div className="max-w-[80rem]">
      <PageHead title={copy.title} context={copy.lede} />

      {canManage ? (
        <p className="mt-3">
          {/* A walk-in is a conversation at a counter; the record comes after.
              Making staff create a student row before they can print a form to
              fill in by hand gets that order backwards. */}
          <PrintLink href="/admin/print/admission/blank" label={sheets.blankForm} />
        </p>
      ) : null}

      {/* Two closed disclosures, each carrying an 86-90 character hint that
          rendered two lines at 15px whether or not the form was open: 358px of
          front desk before the directory. The hints belong with the forms they
          explain. */}
      {canManage ? (
        <section className="mt-3 grid gap-2 lg:grid-cols-2">
          <details className="panel">
            <summary className="panel-head cursor-pointer list-none"><h2 className="text-h4">{copy.directAdmission}</h2><span aria-hidden className="text-h4">＋</span></summary>
            <div className="panel-body border-t border-rule"><p className="form-note mb-3">{copy.directAdmissionHint}</p><DirectAdmissionForm batches={batches} copy={copy} /></div>
          </details>
          <details className="panel">
            <summary className="panel-head cursor-pointer list-none"><h2 className="text-h4">{copy.convertEnquiry}</h2><span aria-hidden className="text-h4">＋</span></summary>
            <div className="panel-body border-t border-rule"><p className="form-note mb-3">{copy.convertEnquiryHint}</p><ConvertEnquiryForm enquiries={enquiryRows} batches={batches} copy={copy} /></div>
          </details>
        </section>
      ) : <p className="form-note mt-3">{copy.viewOnly}</p>}

      <div className="mt-3 grid gap-3 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="panel self-start lg:sticky lg:top-6">
          <div className="panel-head"><h2 className="text-h4">{copy.directory}</h2></div>
          <div className="panel-body grid gap-2">
            <form method="get" className="grid gap-2">
              <label className="sr-only" htmlFor="student-search">{copy.search}</label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input id="student-search" name="q" className="input" defaultValue={params.q ?? ""} placeholder={copy.searchPlaceholder} />
                <button className="btn btn-secondary" type="submit">{copy.search}</button>
              </div>
              <label className="choice-chip w-fit text-smallmeta">
                <input type="checkbox" name="archived" value="1" className="size-4 accent-vermilion" defaultChecked={showArchived} />
                {records.showArchived}
              </label>
            </form>
            {/* A dense list: ~64px a student instead of ~92px, so a phone shows
                nine at a time instead of five, and each row still carries the
                admission number and the number to call. */}
            <div className="data-list max-h-[58vh] overflow-y-auto">
              {students.length === 0 ? <p className="empty-state">{copy.empty}</p> : students.map((student) => (
                <Link
                  key={student.id}
                  href={`/admin/students?student=${student.id}${q ? `&q=${encodeURIComponent(q)}` : ""}${showArchived ? "&archived=1" : ""}`}
                  className={`data-row ${student.archivedAt ? "is-archived" : ""} ${selectedId === student.id ? "bg-vermilion/5" : ""}`}
                >
                  <span className="data-row__title">{student.fullName}</span>
                  <span className="data-row__actions">
                    {student.archivedAt ? (
                      <span className="chip status-off">{records.archived}</span>
                    ) : (
                      /* A dot AND a word, never colour alone. */
                      <span
                        className={`status-light ${
                          enrolmentByStudent.get(student.id)?.status === "active" ? "is-ok" : "is-neutral"
                        }`}
                      >
                        <span aria-hidden="true" className="status-dot" />
                        {enrolmentByStudent.get(student.id)
                          ? copy.statuses[enrolmentByStudent.get(student.id)!.status]
                          : copy.noEnrollments}
                      </span>
                    )}
                  </span>
                  <span className="data-row__meta">
                    <span>{student.admissionNo}</span>
                    <span>
                      {enrolmentByStudent.get(student.id)
                        ? session.staff.adminLocale === "gu"
                          ? enrolmentByStudent.get(student.id)!.courseNameGu
                          : enrolmentByStudent.get(student.id)!.courseNameEn
                        : "—"}
                    </span>
                    <span>{enrolmentByStudent.get(student.id)?.batchLabel ?? "—"}</span>
                  </span>
                  <span className="data-row__meta">
                    <span>{student.phone}</span>
                    {balanceByStudent.get(student.id) ? (
                      <span className="data-num text-error">
                        {copy.balanceDue} {money(balanceByStudent.get(student.id)!)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main>
          {!selected ? <p className="empty-state">{copy.selectStudent}</p> : (
            <div className="grid gap-6">
              <section className="panel">
                <div className="panel-head flex-wrap gap-4">
                  <div><p className="microlabel">{selected.admissionNo}</p><h2 className="text-h3 mt-1">{selected.fullName}</h2><p className="form-note mt-1"><a href={`https://wa.me/91${selected.whatsapp ?? selected.phone}`}>WhatsApp {selected.whatsapp ?? selected.phone}</a>{selected.email ? ` · ${selected.email}` : ""}</p></div>
                  <div className="flex items-center gap-3">
                    <span className={`chip ${selected.archivedAt ? "status-off" : "status-active"}`}>
                      {selected.archivedAt
                        ? records.archived
                        : enrollments.some((e) => e.status === "active")
                          ? copy.statuses.active
                          : copy.all}
                    </span>
                    <PrintLink href={`/admin/print/admission/${selected.id}`} label={sheets.admissionForm} compact />
                    <PrintLink href={`/admin/print/student/${selected.id}`} label={sheets.studentSummary} compact />
                    <RecordMenu
                      entity="student"
                      id={selected.id}
                      label={selected.admissionNo}
                      archived={Boolean(selected.archivedAt)}
                      canArchive={studentCan.archive && canManage}
                      canRestore={studentCan.restore && canManage}
                      canDelete={studentCan.delete}
                      copy={records}
                    />
                  </div>
                </div>
                <div className="panel-body grid gap-6">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Fact label={copy.area} value={selected.area ?? "—"} />
                    <Fact label={copy.language} value={selected.languagePref === "gu" ? copy.languageGu : copy.languageEn} />
                    <Fact label={copy.guardian} value={guardian ? `${guardian.name} · ${guardian.phone}${guardian.relation ? ` · ${guardian.relation}` : ""}` : "—"} />
                    <Fact label={copy.photoConsent} value={selected.photoConsent ? "✓" : "—"} />
                  </dl>
                  {selected.notes ? <div><p className="microlabel">{copy.notes}</p><p className="text-smallmeta mt-2 whitespace-pre-wrap">{selected.notes}</p></div> : null}
                  {canManage && editValue ? <details className="border-t border-rule pt-5"><summary className="cursor-pointer font-semibold">{copy.editStudent}</summary><div className="mt-5"><StudentEditForm value={editValue} copy={copy} /></div></details> : null}
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-3">
                <Metric label={copy.totalClasses} value={String(attendance.length)} />
                <Metric label={copy.attendanceRate} value={attendanceRate == null ? "—" : `${attendanceRate}%`} />
                <Metric label={copy.due} value={formatInr(feeSummary.due)} />
              </div>

              <section className="panel">
                <div className="panel-head"><h3 className="text-h4">{copy.enrollments}</h3></div>
                <div className="panel-body grid gap-5">
                  {enrollments.length === 0 ? <p className="empty-state">{copy.noEnrollments}</p> : enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="rounded-[var(--radius-card)] border border-rule p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{enrollment.courseName}</p><p className="form-note mt-1">{enrollment.batchLabel}{enrollment.joinedOn ? ` · ${formatDate(enrollment.joinedOn, session.staff.adminLocale)}` : ""}</p></div><span className={`status ${enrollment.status === "active" ? "status-active" : enrollment.status === "applied" ? "status-pending" : "status-off"}`}>{copy.statuses[enrollment.status]}</span></div>
                      {canManage ? <div className="mt-4"><EnrollmentStatusForm enrollmentId={enrollment.id} status={enrollment.status} completedOn={enrollment.completedOn} copy={copy} /></div> : null}
                    </div>
                  ))}
                  {canManage ? <div className="border-t border-rule pt-5"><h4 className="font-semibold mb-3">{copy.addEnrollment}</h4><AddEnrollmentForm studentId={selected.id} batches={batches} copy={copy} /></div> : null}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="panel"><div className="panel-head"><h3 className="text-h4">{copy.fees}</h3></div><div className="panel-body"><div className="grid grid-cols-2 gap-4"><Fact label={copy.paid} value={formatInr(feeSummary.received)} /><Fact label={copy.due} value={formatInr(feeSummary.due)} /></div>{fees.length === 0 ? <p className="form-note mt-4">{copy.noFees}</p> : <p className="form-note mt-4">{fees.length} ledger entr{fees.length === 1 ? "y" : "ies"}</p>}</div></div>
                <div className="panel"><div className="panel-head"><h3 className="text-h4">{copy.certificates}</h3></div><div className="panel-body">{certificates.length === 0 ? <p className="form-note">{copy.noCertificates}</p> : <div className="grid gap-3">{certificates.map((cert) => <div key={cert.certNo} className="flex items-center justify-between gap-3 border-b border-rule pb-3 last:border-0 last:pb-0"><div><p className="font-semibold">{cert.courseName}</p><p className="form-note">{cert.certNo} · {formatDate(cert.issuedOn, session.staff.adminLocale)}</p></div><span className={`status ${cert.status === "issued" ? "status-active" : "status-off"}`}>{cert.status}</span></div>)}</div>}</div></div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function summarizeFees(rows: Array<{ enrollmentId: number; courseFee: number; discount: number; received: number }>) {
  const byEnrollment = new Map<number, { courseFee: number; discount: number; received: number }>();
  for (const row of rows) {
    const current = byEnrollment.get(row.enrollmentId);
    if (!current) byEnrollment.set(row.enrollmentId, { courseFee: row.courseFee, discount: row.discount, received: row.received });
    else current.received += row.received;
  }
  let agreed = 0, received = 0;
  for (const value of byEnrollment.values()) { agreed += Math.max(0, value.courseFee - value.discount); received += value.received; }
  return { received, due: Math.max(0, agreed - received) };
}

function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="microlabel">{label}</dt><dd className="mt-1 text-smallmeta">{value}</dd></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="panel panel-body"><p className="microlabel">{label}</p><p className="text-h3 mt-2">{value}</p></div>; }
function formatInr(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00+05:30`)); }

/** Whole rupees, tabular, so a column of balances lines up. */
function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}
