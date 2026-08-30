import Link from "next/link";
import { PageHead } from "@/components/admin/PageHead";
import { requireOwner } from "@/lib/auth/guard";
import { VERIFIED_CATALOG_ROWS, VERIFIED_OPERATIONS_ROWS } from "@/lib/admin/catalog-import";
import { applyVerifiedOperationsAction, importVerifiedCatalogAction } from "./actions";

export default async function ImportCourseCataloguePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireOwner("/admin/courses/import");
  const { error } = await searchParams;
  const gu = session.staff.adminLocale === "gu";

  return (
    <div className="max-w-[48rem]">
      <PageHead
        title={gu ? "કોર્સ કેટલોગ ઇમ્પોર્ટ" : "Import course catalogue"}
        context={
          gu
            ? "Karmaના verified course catalogueમાંથી missing courses ઉમેરો. પહેલેથી આવેલા slugs બદલાશે નહીં."
            : "Add missing courses from Karma's verified catalogue. Existing course slugs are left untouched."
        }
      />

      {error ? (
        <p className="alert alert-error mt-8">
          {error === "database"
            ? gu
              ? "Database હાલ ઉપલબ્ધ નથી. થોડા સમય પછી ફરી પ્રયાસ કરો."
              : "The database is not available right now. Try again shortly."
            : gu
              ? "Catalogue import પૂર્ણ થયો નથી. ફરી પ્રયાસ કરો."
              : "The catalogue import did not complete. Try again."}
        </p>
      ) : null}

      <section className="panel mt-8">
        <div className="panel-head">
          <h2 className="text-h4">
            {gu ? `${VERIFIED_CATALOG_ROWS.length} verified courses` : `${VERIFIED_CATALOG_ROWS.length} verified courses`}
          </h2>
        </div>
        <div className="panel-body grid gap-5">
          <p className="text-smallmeta">
            {gu
              ? "આ action idempotent છે: ફરી ચલાવશો તો existing courses duplicate નહીં થાય. Unconfirmed duration values blank જ રહેશે."
              : "This is idempotent: running it again will not duplicate existing courses. Unconfirmed duration values remain blank."}
          </p>

          <ul className="grid gap-2 text-smallmeta sm:grid-cols-2">
            {VERIFIED_CATALOG_ROWS.map((course) => (
              <li key={course.slug}>
                <span className="font-semibold">{course.nameEn}</span>
                <span className="block form-note">{course.nameGu}</span>
              </li>
            ))}
          </ul>

          <form action={importVerifiedCatalogAction}>
            <button type="submit" className="btn btn-primary">
              {gu ? "Verified catalogue import કરો" : "Import verified catalogue"}
            </button>
          </form>
        </div>
      </section>

      <section className="panel mt-6">
        <div className="panel-head">
          <h2 className="text-h4">
            {gu ? "Verified operational facts" : "Verified operational facts"}
          </h2>
        </div>
        <div className="panel-body grid gap-5">
          <p className="text-smallmeta">
            {gu
              ? "Owner એ લેખિતમાં confirm કરેલા operational facts — duration (months), software, fee plan, batch timings, free demo અને curriculum — પહેલેથી import થયેલા course rows પર લખે છે. આ action existing values OVERWRITE કરે છે અને દરેક ફેરફાર audit થાય છે."
              : "Writes the facts the owner has confirmed in writing — duration in months, the software taught, the fee plan, the batch timings, the free demo and the curriculum — onto course rows that already exist. Unlike the catalogue import this action OVERWRITES, and every course it changes is audited."}
          </p>
          <ul className="grid gap-2 text-smallmeta">
            {VERIFIED_OPERATIONS_ROWS.map((course) => (
              <li key={course.slug}>
                <span className="font-semibold">{course.slug}</span>
                <span className="block form-note">
                  {course.durationMonths} {gu ? "મહિના" : "months"} · {course.software} · ₹
                  {course.feeTotal?.toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
          <form action={applyVerifiedOperationsAction}>
            <button type="submit" className="btn btn-secondary">
              {gu ? "Verified operational facts લાગુ કરો" : "Apply verified operational facts"}
            </button>
          </form>
        </div>
      </section>

      <div className="u-actions">
        <Link href="/admin/courses" className="btn btn-secondary">
          {gu ? "Courses & Batches પર પાછા જાઓ" : "Back to Courses & Batches"}
        </Link>
      </div>
    </div>
  );
}
