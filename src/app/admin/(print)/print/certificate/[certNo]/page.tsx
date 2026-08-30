import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { printCopy } from "@/lib/admin/print-copy";
import { site } from "@/lib/site";
import { PrintSheet } from "@/components/admin/PrintSheet";
import { day } from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/**
 * The certificate, moved out of the console shell into the print group.
 *
 * Two things changed with the move, and both were bugs:
 *
 *  1. The old page rendered a Print button as a SERVER component with
 *     `onClick={undefined}` — inert by construction — plus instruction text
 *     asking staff to find the browser's print menu. It now has a real button.
 *  2. It hard-coded the `workers.dev` origin into the verification URL. That
 *     would keep pointing at `workers.dev` after the domain cutover — exactly
 *     what `docs/launch-checklist.md` says never to do — so the URL now derives
 *     from `site.url` like every other canonical in the codebase.
 */
export default async function CertificateSheet({
  params
}: {
  params: Promise<{ certNo: string }>;
}) {
  const { certNo: raw } = await params;
  const session = await requireAdmin(`/admin/print/certificate/${raw}`);
  if (
    !hasPermission(session.staff, "certificates.view") &&
    !hasPermission(session.staff, "certificates.manage")
  ) {
    redirect("/admin/no-access?reason=permission");
  }
  const locale = session.staff.adminLocale;
  const copy = printCopy(locale);

  const certNo = decodeURIComponent(raw).toUpperCase();
  const db = getDb();
  if (!db) notFound();

  const rows = await db
    .select({
      certNo: schema.certificates.certNo,
      studentName: schema.certificates.studentName,
      courseName: schema.certificates.courseName,
      issuedOn: schema.certificates.issuedOn,
      grade: schema.certificates.grade,
      status: schema.certificates.status
    })
    .from(schema.certificates)
    .where(eq(schema.certificates.certNo, certNo))
    .limit(1);
  const cert = rows[0];
  if (!cert) notFound();

  /* Derived, never hard-coded: the cutover is a change to one environment
     variable, and a printed certificate outlives the deploy that made it. */
  const verifyUrl = `${site.url}/en/verify/${encodeURIComponent(cert.certNo)}`;

  return (
    <PrintSheet
      title={copy.certificate}
      reference={cert.certNo}
      locale={locale}
      backHref="/admin/certificates"
      backLabel={copy.back}
      printLabel={copy.print}
    >
      <div className="sheet-keep" style={{ textAlign: "center", paddingTop: "14mm" }}>
        <p style={{ fontSize: "11pt" }}>This certifies that</p>
        <p style={{ fontSize: "22pt", fontWeight: 800, marginTop: "4mm" }}>{cert.studentName}</p>
        <p style={{ fontSize: "11pt", marginTop: "4mm" }}>has completed</p>
        <p style={{ fontSize: "15pt", fontWeight: 700, marginTop: "3mm" }}>{cert.courseName}</p>
        {cert.grade ? (
          <p style={{ fontSize: "10pt", marginTop: "3mm" }}>
            {copy.grade}: <strong>{cert.grade}</strong>
          </p>
        ) : null}

        {cert.status === "revoked" ? (
          <p
            style={{
              marginTop: "6mm",
              padding: "2mm",
              border: "1pt solid #111",
              fontWeight: 800
            }}
          >
            {copy.revoked}
          </p>
        ) : null}
      </div>

      <div className="sheet-fields is-three" style={{ marginTop: "14mm" }}>
        <div className="sheet-field">
          <p className="sheet-label">{copy.issuedOn}</p>
          <p className="sheet-value">{day(cert.issuedOn, locale)}</p>
        </div>
        <div className="sheet-field">
          <p className="sheet-label">{copy.certificate}</p>
          <p className="sheet-value">{cert.certNo}</p>
        </div>
        <div className="sheet-field">
          <p className="sheet-label">{copy.trainerSignature}</p>
          <p className="sheet-value" />
        </div>
      </div>

      <p className="sheet-note" style={{ marginTop: "8mm", textAlign: "center" }}>
        {copy.verifyAt} {verifyUrl}
      </p>
    </PrintSheet>
  );
}
