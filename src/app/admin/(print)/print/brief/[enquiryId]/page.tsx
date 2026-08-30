import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { printCopy } from "@/lib/admin/print-copy";
import { PrintSheet } from "@/components/admin/PrintSheet";
import { SheetField, SheetSection, day, moment } from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/**
 * A B2B design brief on paper — the sheet that goes to the floor with a job.
 *
 * Product, technique, dimensions, quantity, colours, the file format the
 * client's machine takes and the deadline, plus the status trail so whoever
 * picks the job up can see what has already been agreed.
 *
 * No turnaround time is printed, because Karma does not state one (it depends
 * on technique, quantity and floor load). Attached files are listed by name
 * only: R2 is not bound, so there is nothing to fetch, and a sheet that
 * implied otherwise would send someone looking for a file that does not exist.
 */
export default async function DesignBriefSheet({
  params
}: {
  params: Promise<{ enquiryId: string }>;
}) {
  const { enquiryId: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const session = await requireAdmin(`/admin/print/brief/${raw}`);
  if (!hasPermission(session.staff, "design.view") && !hasPermission(session.staff, "design.manage")) {
    redirect("/admin/no-access?reason=permission");
  }
  const locale = session.staff.adminLocale;
  const copy = printCopy(locale);

  const db = getDb();
  if (!db) notFound();

  const rows = await db
    .select()
    .from(schema.serviceEnquiries)
    .where(eq(schema.serviceEnquiries.id, id))
    .limit(1);
  const brief = rows[0];
  if (!brief) notFound();

  const history = await db
    .select({
      id: schema.serviceStatusHistory.id,
      fromStatus: schema.serviceStatusHistory.fromStatus,
      toStatus: schema.serviceStatusHistory.toStatus,
      note: schema.serviceStatusHistory.note,
      createdAt: schema.serviceStatusHistory.createdAt,
      byName: schema.staff.name
    })
    .from(schema.serviceStatusHistory)
    .leftJoin(schema.staff, eq(schema.serviceStatusHistory.byStaff, schema.staff.id))
    .where(eq(schema.serviceStatusHistory.enquiryId, id))
    .orderBy(asc(schema.serviceStatusHistory.createdAt));

  return (
    <PrintSheet
      title={copy.brief}
      reference={brief.reference}
      locale={locale}
      backHref="/admin/design"
      backLabel={copy.back}
      printLabel={copy.print}
    >
      <SheetSection title={copy.contact} columns={3}>
        <SheetField label={copy.studentName} value={brief.name} />
        <SheetField label={copy.company} value={brief.company} />
        <SheetField label={copy.status} value={brief.status} />
        <SheetField label={copy.studentMobile} value={brief.phone} />
        <SheetField label={copy.email} value={brief.email} />
        <SheetField label={copy.feeDate} value={moment(brief.createdAt, locale)} />
      </SheetSection>

      <SheetSection title={copy.brief} columns={3}>
        <SheetField label={copy.productType} value={brief.productType} />
        <SheetField label={copy.technique} value={brief.technique} />
        <SheetField label={copy.dimensions} value={brief.dimensions} />
        <SheetField label={copy.quantity} value={brief.quantity} />
        <SheetField label={copy.colourCount} value={brief.colourCount} />
        <SheetField label={copy.fileFormat} value={brief.fileFormat} />
        <SheetField label={copy.deadline} value={day(brief.deadline, locale)} />
      </SheetSection>

      {brief.details ? (
        <section className="sheet-section">
          <h2 className="sheet-section-title">{copy.details}</h2>
          <p style={{ fontSize: "9.5pt", whiteSpace: "pre-wrap" }}>{brief.details}</p>
        </section>
      ) : null}

      {history.length ? (
        <section className="sheet-section">
          <h2 className="sheet-section-title">{copy.status}</h2>
          <table className="sheet-table">
            <thead>
              <tr>
                <th>{copy.feeDate}</th>
                <th>{copy.status}</th>
                <th>{copy.trainer}</th>
                <th>{copy.feeNotes}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td>{moment(row.createdAt, locale)}</td>
                  <td>
                    {row.fromStatus ? `${row.fromStatus} → ` : ""}
                    {row.toStatus}
                  </td>
                  <td>{row.byName ?? "—"}</td>
                  <td>{row.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <div className="sheet-signatures" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div className="sheet-sign">
          <div className="sheet-sign-line" />
          <p className="sheet-sign-label">{copy.trainerSignature}</p>
        </div>
        <div className="sheet-sign">
          <div className="sheet-stamp">{copy.officeStamp}</div>
          <p className="sheet-sign-label">{copy.date}</p>
        </div>
      </div>
    </PrintSheet>
  );
}
