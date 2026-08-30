import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { studentsCopy } from "@/lib/admin/students-copy";
import { isEnrollmentStatus, positiveId, type EnrollmentStatus } from "@/lib/admin/students";
import {
  AddEnrollmentForm,
  ConvertEnquiryForm,
  DirectAdmissionForm,
  EnrollmentStatusForm,
  StudentEditForm,
  type BatchOption,
  type StudentEditValue
} from "./StudentForms";

type Props = { searchParams: Promise<{ q?: string; student?: string }> };

export default async function StudentsPage({ searchParams }: Props) {
  const session = await requireAdmin("/admin/students");
  const canView = hasPermission(session.staff, "students.view") || hasPermission(session.staff, "students.manage");
  const canManage = hasPermission(session.staff, "students.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");
  const copy = studentsCopy(session.staff.adminLocale);
  const db = getDb();
  if (!db) return <div className="max-w-[76rem]"><Heading title={copy.title} lede={copy.lede} /><p className="alert alert-error mt-8">Database unavailable.</p></div>;

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 120) : "";
  const requestedStudent = positiveId(params.student);

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
      fatherName: schema.students.fatherName,
      referenceName: schema.students.referenceName,
      referencePhone: schema.students.referencePhone,
      createdAt: schema.students.createdAt
    }).from(schema.students).orderBy(desc(schema.students.createdAt)).limit(300),
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
      .where(and(eq(schema.courses.active, true), or(eq(schema.batches.status, "open"), eq(schema.batches.status, "started"))))
      .orderBy(asc(schema.courses.sortOrder), asc(schema.batches.startDate), asc(schema.batches.startTime)),
    db.select({ id: schema.applications.id, reference: schema.applications.reference, fullName: schema.applications.fullName, courseSlug: schema.applications.courseSlug })
      .from(schema.applications)
      .where(inArray(schema.applications.status, ["new", "contacted", "demo_scheduled", "visit_done", "accepted", "waitlisted", "documents_pending"]))
      .orderBy(desc(schema.applications.updatedAt))
      .limit(200)
  ]);

  const students = studentRows.filter((student) => !q || [student.fullName, student.admissionNo, student.phone, student.whatsapp ?? ""].some((v) => v.toLowerCase().includes(q)));
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
      <Heading title={copy.title} lede={copy.lede} />

      {canManage ? (
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <details className="panel">
            <summary className="panel-head cursor-pointer list-none"><div><h2 className="text-h4">{copy.directAdmission}</h2><p className="form-note mt-1">{copy.directAdmissionHint}</p></div><span aria-hidden className="text-h4">＋</span></summary>
            <div className="panel-body border-t border-rule"><DirectAdmissionForm batches={batches} copy={copy} /></div>
          </details>
          <details className="panel">
            <summary className="panel-head cursor-pointer list-none"><div><h2 className="text-h4">{copy.convertEnquiry}</h2><p className="form-note mt-1">{copy.convertEnquiryHint}</p></div><span aria-hidden className="text-h4">＋</span></summary>
            <div className="panel-body border-t border-rule"><ConvertEnquiryForm enquiries={enquiryRows} batches={batches} copy={copy} /></div>
          </details>
        </section>
      ) : <p className="form-note mt-6">{copy.viewOnly}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="panel self-start lg:sticky lg:top-6">
          <div className="panel-head"><h2 className="text-h4">{copy.directory}</h2></div>
          <div className="panel-body grid gap-4">
            <form method="get" className="grid gap-2">
              <label className="label" htmlFor="student-search">{copy.search}</label>
              <input id="student-search" name="q" className="input" defaultValue={params.q ?? ""} placeholder={copy.searchPlaceholder} />
              <button className="btn btn-secondary" type="submit">{copy.search}</button>
            </form>
            <div className="grid max-h-[58vh] gap-2 overflow-y-auto pr-1">
              {students.length === 0 ? <p className="empty-state">{copy.empty}</p> : students.map((student) => (
                <Link key={student.id} href={`/admin/students?student=${student.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`rounded-[var(--radius-card)] border p-3 ${selectedId === student.id ? "border-vermilion bg-vermilion/5" : "border-rule hover:border-vermilion"}`}>
                  <p className="font-semibold">{student.fullName}</p>
                  <p className="form-note mt-1">{student.admissionNo} · {student.phone}</p>
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
                  <span className="status status-active">{enrollments.some((e) => e.status === "active") ? copy.statuses.active : copy.all}</span>
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

function Heading({ title, lede }: { title: string; lede: string }) { return <div><h1 className="text-h2">{title}</h1><span aria-hidden className="rule-stitch is-in" /><p className="u-lede">{lede}</p></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="microlabel">{label}</dt><dd className="mt-1 text-smallmeta">{value}</dd></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="panel panel-body"><p className="microlabel">{label}</p><p className="text-h3 mt-2">{value}</p></div>; }
function formatInr(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00+05:30`)); }
