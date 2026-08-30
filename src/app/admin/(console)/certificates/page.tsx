import Link from "next/link";
import { PageHead } from "@/components/admin/PageHead";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { certificatesCopy } from "@/lib/admin/certificates-copy";
import { attendancePercent, certificateEligible } from "@/lib/admin/certificates";
import { IssueCertificateForm, RevokeCertificateForm } from "./CertificateForms";

export default async function CertificatesPage() {
  const session = await requireAdmin("/admin/certificates");
  const canView = hasPermission(session.staff, "certificates.view") || hasPermission(session.staff, "certificates.manage");
  const canManage = hasPermission(session.staff, "certificates.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");
  const copy = certificatesCopy(session.staff.adminLocale);
  const db = getDb();
  if (!db) return <div className="max-w-[78rem]"><PageHead title={copy.title} context={copy.lede} /><p className="alert alert-error mt-8">Database unavailable.</p></div>;

  const [enrollments, attendanceRows, certificates] = await Promise.all([
    db.select({
      enrollmentId: schema.enrollments.id,
      enrollmentStatus: schema.enrollments.status,
      completedOn: schema.enrollments.completedOn,
      studentId: schema.students.id,
      admissionNo: schema.students.admissionNo,
      studentName: schema.students.fullName,
      batchId: schema.batches.id,
      batchLabel: schema.batches.label,
      courseNameEn: schema.courses.nameEn,
      courseNameGu: schema.courses.nameGu
    }).from(schema.enrollments)
      .innerJoin(schema.students, eq(schema.enrollments.studentId, schema.students.id))
      .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
      .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
      .orderBy(desc(schema.enrollments.createdAt)),
    /* Aggregated in Postgres, not in Node.
       This used to select EVERY attendance record ever written — one row per
       student per session — and tally them in memory. A single batch of 30
       students over three months is already ~2,300 rows, and the table only
       grows; the page paid for all of it on every load to compute one
       percentage per enrolment. The group-by returns one row per
       (student, batch) and gives exactly the same answer. */
    db.select({
      studentId: schema.attendanceRecords.studentId,
      batchId: schema.attendanceSessions.batchId,
      total: sql<number>`count(*)::int`,
      present: sql<number>`(count(*) filter (where ${schema.attendanceRecords.status} in ('present', 'late')))::int`
    })
      .from(schema.attendanceRecords)
      .innerJoin(schema.attendanceSessions, eq(schema.attendanceRecords.sessionId, schema.attendanceSessions.id))
      .groupBy(schema.attendanceRecords.studentId, schema.attendanceSessions.batchId),
    db.select({ id: schema.certificates.id, certNo: schema.certificates.certNo, enrollmentId: schema.certificates.enrollmentId, studentName: schema.certificates.studentName, courseName: schema.certificates.courseName, issuedOn: schema.certificates.issuedOn, grade: schema.certificates.grade, status: schema.certificates.status })
      .from(schema.certificates).orderBy(desc(schema.certificates.createdAt))
  ]);

  const attendanceMap = new Map<string, { total: number; present: number }>();
  for (const row of attendanceRows) {
    attendanceMap.set(`${row.studentId}:${row.batchId}`, {
      total: Number(row.total),
      present: Number(row.present)
    });
  }
  const certsByEnrollment = new Map<number, typeof certificates>();
  for (const cert of certificates) {
    const list = certsByEnrollment.get(cert.enrollmentId) ?? [];
    list.push(cert);
    certsByEnrollment.set(cert.enrollmentId, list);
  }

  const candidates = enrollments.map((enrollment) => {
    const attendance = attendanceMap.get(`${enrollment.studentId}:${enrollment.batchId}`) ?? { total: 0, present: 0 };
    const rate = attendancePercent(attendance.total, attendance.present);
    const eligible = certificateEligible(enrollment.enrollmentStatus, rate);
    return { ...enrollment, rate, eligible, certs: certsByEnrollment.get(enrollment.enrollmentId) ?? [] };
  });
  const eligibleCount = candidates.filter((c) => c.eligible && !c.certs.some((cert) => cert.status === "issued")).length;
  const issuedCount = certificates.filter((cert) => cert.status === "issued").length;
  const revokedCount = certificates.filter((cert) => cert.status === "revoked").length;

  return (
    <div className="max-w-[80rem]">
      <PageHead title={copy.title} context={copy.lede} />
      <div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label={copy.eligible} value={eligibleCount} /><Metric label={copy.issued} value={issuedCount} /><Metric label={copy.revoked} value={revokedCount} /></div>
      <p className="form-note mt-5">{copy.r2Note}</p>
      {!canManage ? <p className="form-note mt-3">{copy.viewOnly}</p> : null}

      <section className="mt-8 grid gap-5">
        {candidates.length === 0 ? <p className="empty-state">{copy.noCandidates}</p> : candidates.map((item) => {
          const activeCert = item.certs.find((cert) => cert.status === "issued");
          const eligibilityLabel = item.enrollmentStatus !== "completed" ? copy.notCompleted : item.rate == null ? copy.noAttendance : item.rate < 75 ? copy.belowAttendance : copy.ready;
          return (
            <article key={item.enrollmentId} className="panel">
              <div className="panel-head flex-wrap gap-4">
                <div><p className="microlabel">{item.admissionNo}</p><h2 className="text-h4 mt-1">{item.studentName}</h2><p className="form-note mt-1">{session.staff.adminLocale === "gu" ? item.courseNameGu : item.courseNameEn} · {item.batchLabel}</p></div>
                <span className={`status ${item.eligible ? "status-active" : "status-pending"}`}>{eligibilityLabel}{item.rate != null ? ` · ${item.rate}%` : ""}</span>
              </div>
              <div className="panel-body grid gap-5">
                <dl className="grid gap-4 sm:grid-cols-3"><Fact label={copy.enrollment} value={item.enrollmentStatus} /><Fact label={copy.completed} value={item.completedOn ? formatDate(item.completedOn, session.staff.adminLocale) : "—"} /><Fact label={copy.attendance} value={item.rate == null ? "—" : `${item.rate}%`} /></dl>
                {item.certs.length ? <div className="grid gap-3 border-t border-rule pt-5">{item.certs.map((cert) => <div key={cert.id} className="rounded-[var(--radius-card)] border border-rule p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{cert.certNo}</p><p className="form-note mt-1">{formatDate(cert.issuedOn, session.staff.adminLocale)}{cert.grade ? ` · ${cert.grade}` : ""}</p></div><span className={`status ${cert.status === "issued" ? "status-active" : "status-off"}`}>{cert.status === "issued" ? copy.issued : copy.revoked}</span></div><div className="mt-3 flex flex-wrap gap-2"><Link className="btn btn-secondary" href={`/en/verify/${encodeURIComponent(cert.certNo)}`}>{copy.verify}</Link><Link className="btn btn-secondary" href={`/admin/print/certificate/${encodeURIComponent(cert.certNo)}`}>{copy.print}</Link></div>{canManage && cert.status === "issued" ? <div className="mt-4"><RevokeCertificateForm certificateId={cert.id} copy={copy} /></div> : null}</div>)}</div> : null}
                {canManage && item.eligible && !activeCert ? <div className="border-t border-rule pt-5"><IssueCertificateForm enrollmentId={item.enrollmentId} copy={copy} /></div> : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="panel panel-body"><p className="microlabel">{label}</p><p className="text-h3 mt-2">{value}</p></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="microlabel">{label}</dt><dd className="text-smallmeta mt-1">{value}</dd></div>; }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`)); }
