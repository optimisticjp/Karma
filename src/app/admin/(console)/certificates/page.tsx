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
      <div className="console-metrics mt-3">
        <div><span className="kv-label">{copy.eligible}</span><span className="kv-value">{eligibleCount}</span></div>
        <div><span className="kv-label">{copy.issued}</span><span className="kv-value">{issuedCount}</span></div>
        <div><span className="kv-label">{copy.revoked}</span><span className="kv-value">{revokedCount}</span></div>
      </div>
      {/* Certificates have no file pipeline — no R2, no PDF library, no signed
          URL. The note says so, and it stays: it is what stops the next
          session assuming one exists. */}
      <p className="form-note mt-2">{copy.r2Note}</p>
      {!canManage ? <p className="form-note mt-1">{copy.viewOnly}</p> : null}

      {/* Rows, not a 362px `<article class="panel">` per candidate. The issue
          form moves behind its own disclosure: it was rendered open for every
          eligible student, 254px each, on a screen that is scanned far more
          often than it is acted on. */}
      <section className="data-list mt-3">
        {candidates.length === 0 ? <p className="empty-state">{copy.noCandidates}</p> : candidates.map((item) => {
          const activeCert = item.certs.find((cert) => cert.status === "issued");
          const eligibilityLabel = item.enrollmentStatus !== "completed" ? copy.notCompleted : item.rate == null ? copy.noAttendance : item.rate < 75 ? copy.belowAttendance : copy.ready;
          return (
            <details key={item.enrollmentId}>
              <summary className="data-row">
                <span className="data-row__title">{item.studentName}</span>
                <span className="data-row__actions">
                  <span className={`chip ${item.eligible ? "status-active" : "status-pending"}`}>{eligibilityLabel}</span>
                </span>
                <span className="data-row__meta">
                  <span>{item.admissionNo}</span>
                  <span>{session.staff.adminLocale === "gu" ? item.courseNameGu : item.courseNameEn}</span>
                  <span>{item.batchLabel}</span>
                </span>
                <span className="data-row__meta">
                  <span>{item.enrollmentStatus}</span>
                  <span className="data-num">{item.rate == null ? "—" : `${item.rate}%`}</span>
                  <span>{item.completedOn ? formatDate(item.completedOn, session.staff.adminLocale) : "—"}</span>
                  {activeCert ? <span>{activeCert.certNo}</span> : null}
                </span>
              </summary>
              <div className="border-t border-line px-3 py-3 md:px-4">
                {item.certs.length ? (
                  <div className="data-list">
                    {item.certs.map((cert) => (
                      <div key={cert.id} className="data-row">
                        <span className="data-row__title data-num">{cert.certNo}</span>
                        <span className="data-row__actions">
                          <span className={`chip ${cert.status === "issued" ? "status-active" : "status-off"}`}>{cert.status === "issued" ? copy.issued : copy.revoked}</span>
                        </span>
                        <span className="data-row__meta">
                          <span>{formatDate(cert.issuedOn, session.staff.adminLocale)}</span>
                          {cert.grade ? <span>{cert.grade}</span> : null}
                          <Link className="tap font-semibold text-vermilion-deep" href={`/en/verify/${encodeURIComponent(cert.certNo)}`}>{copy.verify}</Link>
                          <Link className="tap font-semibold text-vermilion-deep" href={`/admin/print/certificate/${encodeURIComponent(cert.certNo)}`}>{copy.print}</Link>
                        </span>
                        {canManage && cert.status === "issued" ? (
                          <span className="data-row__meta"><RevokeCertificateForm certificateId={cert.id} copy={copy} /></span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {canManage && item.eligible && !activeCert ? (
                  <details className="mt-2 border border-rule bg-card">
                    <summary className="flex min-h-11 cursor-pointer items-center px-3 text-smallmeta font-semibold">{copy.issue}</summary>
                    <div className="border-t border-rule p-3"><IssueCertificateForm enrollmentId={item.enrollmentId} copy={copy} /></div>
                  </details>
                ) : null}
              </div>
            </details>
          );
        })}
      </section>
    </div>
  );
}

function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`)); }
