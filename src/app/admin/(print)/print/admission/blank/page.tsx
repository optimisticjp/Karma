import { requireAdmin } from "@/lib/auth/guard";
import { printCopy } from "@/lib/admin/print-copy";
import { CURRENT_TERMS_VERSION, currentAdmissionTerms } from "@/content/admission-terms";
import { EMCAD_DAHAO } from "@/content/course-operations";
import { PrintSheet } from "@/components/admin/PrintSheet";
import { SheetField, SheetNorms, SheetSection, SheetSignatures, inr } from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/**
 * A blank admission form, to hand to a walk-in.
 *
 * The reason this exists: the institute's admission is a conversation at a
 * counter, and the record is created afterwards. Making staff create a student
 * row before they can print a form to fill in by hand gets the order backwards
 * and produces half-empty records for people who then did not join.
 *
 * It carries the same fields, the same norms and the same signature block as
 * the filled sheet, and it prints the verified EMCAD DAHAO fee plan so the
 * numbers on the counter and the numbers in the console are the same numbers.
 */
export default async function BlankAdmissionForm() {
  const session = await requireAdmin("/admin/print/admission/blank");
  const locale = session.staff.adminLocale;
  const copy = printCopy(locale);
  const terms = currentAdmissionTerms();
  const balance = EMCAD_DAHAO.fees.feeTotal - EMCAD_DAHAO.fees.feeAdmission;

  return (
    <PrintSheet
      title={copy.blankForm}
      locale={locale}
      backHref="/admin/students"
      backLabel={copy.back}
      printLabel={copy.print}
      footerNote={`${copy.norms} v${terms.version}`}
    >
      <SheetSection title={copy.student} columns={3}>
        <SheetField label={copy.studentName} />
        <SheetField label={copy.fatherName} />
        <SheetField label={copy.admissionNo} />
        <SheetField label={copy.studentMobile} />
        <SheetField label={copy.whatsapp} />
        <SheetField label={copy.email} />
        <SheetField label={copy.area} />
        <SheetField label={copy.ageBand} />
        <SheetField label={copy.admissionDate} />
      </SheetSection>

      <SheetSection title={copy.guardian} columns={3}>
        <SheetField label={copy.guardianName} />
        <SheetField label={copy.guardianPhone} />
        <SheetField label={copy.guardianRelation} />
      </SheetSection>

      <SheetSection title={copy.reference} columns={2}>
        <SheetField label={copy.referenceName} />
        <SheetField label={copy.referencePhone} />
      </SheetSection>

      <SheetSection title={copy.course} columns={3}>
        <SheetField label={copy.courseName} />
        <SheetField label={copy.batch} />
        <SheetField label={copy.joiningDate} />
      </SheetSection>

      {/* The one course whose fee plan the owner has confirmed. Printed so the
          number on the counter and the number in the console are the same. */}
      <SheetSection title={`${copy.fees} — EMCAD DAHAO`} columns={3}>
        <SheetField label={copy.feeTotal} value={inr(EMCAD_DAHAO.fees.feeTotal)} money />
        <SheetField label={copy.feeAdmission} value={inr(EMCAD_DAHAO.fees.feeAdmission)} money />
        <SheetField label={copy.feeBalance} value={inr(balance)} money />
      </SheetSection>
      <p className="sheet-note">{copy.offlineNote}</p>

      <SheetNorms version={CURRENT_TERMS_VERSION} locale={locale} copy={copy} />
      <SheetSignatures copy={copy} />
    </PrintSheet>
  );
}
