import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { certificatesCopy } from "@/lib/admin/certificates-copy";

export default async function PrintableCertificate({ params }: { params: Promise<{ certNo: string }> }) {
  const session = await requireAdmin();
  if (!hasPermission(session.staff, "certificates.view") && !hasPermission(session.staff, "certificates.manage")) redirect("/admin/no-access?reason=permission");
  const copy = certificatesCopy(session.staff.adminLocale);
  const { certNo: raw } = await params;
  const certNo = decodeURIComponent(raw).toUpperCase();
  const db = getDb();
  if (!db) notFound();
  const rows = await db.select({ certNo: schema.certificates.certNo, studentName: schema.certificates.studentName, courseName: schema.certificates.courseName, issuedOn: schema.certificates.issuedOn, grade: schema.certificates.grade, status: schema.certificates.status })
    .from(schema.certificates).where(eq(schema.certificates.certNo, certNo)).limit(1);
  const cert = rows[0];
  if (!cert) notFound();
  const verifyUrl = `https://karma-design-studio.essanciaonline.workers.dev/en/verify/${encodeURIComponent(cert.certNo)}`;

  return (
    <div className="max-w-[60rem]">
      <div className="mb-6 flex flex-wrap gap-2 print:hidden"><Link className="btn btn-secondary" href="/admin/certificates">← {copy.title}</Link><button className="btn btn-primary" type="button" onClick={undefined}>Use browser Print / Save as PDF</button></div>
      <article className="border-2 border-rule bg-paper p-8 md:p-14 text-center">
        <p className="microlabel">Karma Design Studio & Classes · Mota Varachha, Surat</p>
        <div aria-hidden className="rule-stitch is-in mx-auto mt-5 max-w-48" />
        <h1 className="text-h2 mt-8">Certificate of Completion</h1>
        <p className="u-lede">This certifies that</p>
        <p className="text-h2 mt-6 font-display">{cert.studentName}</p>
        <p className="u-lede">has completed</p>
        <p className="text-h3 mt-5">{cert.courseName}</p>
        {cert.grade ? <p className="mt-4 text-smallmeta">Result / Grade: <strong>{cert.grade}</strong></p> : null}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 text-left"><div><p className="microlabel">Issued on</p><p className="mt-1 font-semibold">{formatDate(cert.issuedOn)}</p></div><div><p className="microlabel">Certificate no.</p><p className="mt-1 font-mono font-semibold">{cert.certNo}</p></div></div>
        <div className="mt-10 border-t border-rule pt-6 text-left"><p className="microlabel">Verify this certificate</p><p className="mt-2 break-all text-smallmeta">{verifyUrl}</p></div>
        {cert.status === "revoked" ? <p className="alert alert-error mt-8">REVOKED — this certificate is no longer valid.</p> : null}
      </article>
      <p className="form-note mt-5 print:hidden">Open the browser menu and choose Print → Save as PDF when a digital copy is needed. Private R2 PDF storage is intentionally added later.</p>
    </div>
  );
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`)); }
