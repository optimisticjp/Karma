import Link from "next/link";
import { requireOwner } from "@/lib/auth/guard";
import { VERIFIED_CATALOG_ROWS } from "@/lib/admin/catalog-import";
import { importVerifiedCatalogAction } from "./actions";

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
      <h1 className="text-h2">{gu ? "કોર્સ કેટલોગ ઇમ્પોર્ટ" : "Import course catalogue"}</h1>
      <span aria-hidden className="rule-stitch is-in" />
      <p className="u-lede">
        {gu
          ? "Karmaના verified course catalogueમાંથી missing courses ઉમેરો. પહેલેથી આવેલા slugs બદલાશે નહીં."
          : "Add missing courses from Karma's verified catalogue. Existing course slugs are left untouched."}
      </p>

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

      <div className="u-actions">
        <Link href="/admin/courses" className="btn btn-secondary">
          {gu ? "Courses & Batches પર પાછા જાઓ" : "Back to Courses & Batches"}
        </Link>
      </div>
    </div>
  );
}
