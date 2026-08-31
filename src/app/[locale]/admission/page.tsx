import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdmissionForm, type AdmissionContext } from "@/components/forms/AdmissionForm";
import { AdmissionNorms } from "@/components/site/AdmissionNorms";
import { getPublicCourseConfigs } from "@/lib/course/config";
import { CURRENT_TERMS_VERSION } from "@/content/admission-terms";
import { asLocale } from "@/i18n/routing";
import { NeedlePoint } from "@/components/kds/marks";
import { pageMeta } from "@/lib/seo";
import { ActionDock } from "@/components/kds/shell/ActionDock";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.admissionForm" });
  return pageMeta({ locale, path: "/admission", title: t("title"), description: t("description") });
}

/**
 * Context-preserving entry (audit fix): course/batch CTAs land preselected.
 *
 * Dynamic because the timetable and free-demo slots come from the database —
 * the same reason the course detail page is. A staff edit to a course's batch
 * times reaches this form on the next request rather than at the next deploy.
 */
export const dynamic = "force-dynamic";

export default async function AdmissionFormPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ course?: string; timing?: string; src?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const [t, tn] = await Promise.all([
    getTranslations("admissionForm"),
    getTranslations("admissionForm.norms")
  ]);

  /**
   * The catalogue WITH each course's timetable and free-demo slots, resolved
   * through the same function the admission API validates against — so the
   * form can never offer a slot the server would reject, and the server can
   * never reject a slot the form offered.
   */
  const configs = await getPublicCourseConfigs();
  const options = configs.map((c) => ({
    slug: c.slug,
    nameEn: c.nameEn,
    nameGu: c.nameGu,
    scheduleOptions: c.operations.scheduleOptions,
    demoSlots: c.operations.demo?.slots ?? []
  }));

  const context: AdmissionContext = {
    course: options.some((c) => c.slug === sp.course) ? sp.course : undefined,
    timing: sp.timing === "morning" || sp.timing === "evening" ? sp.timing : undefined,
    src: typeof sp.src === "string" ? sp.src.slice(0, 40) : undefined
  };

  const reassurance = t.raw("reassurance") as string[];

  return (
    <>
      {/* The form's own opening. Short on purpose: everything here is a
          reassurance somebody needs BEFORE they start typing, and anything
          longer is a wall between a visitor and the first field. */}
      <section className="band-tight on-canvas" aria-labelledby="form-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <p className="t-micro">{t("eyebrow")}</p>
              <h1 id="form-heading" className="t-h1 mt-3">
                {t("title")}
              </h1>
              <p className="t-lede mt-3 max-w-[46ch]">{t("sub")}</p>
            </div>

            <aside className="courses-aside">
              <p className="t-micro">{t("reassuranceTitle")}</p>
              <ul className="courses-facts" role="list">
                {reassurance.map((r) => (
                  <li key={r}>
                    <NeedlePoint state="done" />
                    <span className="t-body">{r}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="band-tight on-paper">
        <div className="wrap">
          <div className="form-column">
            <AdmissionForm
              courses={options}
              context={context}
              termsVersion={CURRENT_TERMS_VERSION}
              normsHref="#admission-norms"
            />
          </div>
        </div>
      </section>

      <AdmissionNorms
        version={CURRENT_TERMS_VERSION}
        locale={asLocale(locale)}
        title={tn("title")}
        intro={tn("intro")}
        languageNote={tn("languageNote")}
        declarationLabel={tn("declarationLabel")}
      />
      {/* Contextual conversion (plan §15). This is a high-intent route, so
          the dock belongs here — and NOT on the privacy policy, the terms
          page or the notes archive, which is where the permanent bar it
          replaces used to sit. */}
      <ActionDock surface={"admission"} demoHref="/admission" />
    </>
  );
}
