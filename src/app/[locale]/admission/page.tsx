import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdmissionForm, type AdmissionContext } from "@/components/forms/AdmissionForm";
import { AdmissionNorms } from "@/components/site/AdmissionNorms";
import { getPublicCourseConfigs } from "@/lib/course/config";
import { CURRENT_TERMS_VERSION } from "@/content/admission-terms";
import { PageIntro } from "@/components/ui/PageIntro";
import { Icon } from "@/components/ui/Icon";
import { pageMeta } from "@/lib/seo";

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
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("reassuranceTitle")}</p>
            <ul className="mt-4 space-y-2.5">
              {reassurance.map((r) => (
                <li key={r} className="flex gap-2.5">
                  <Icon
                    name="check"
                    size={16}
                    strokeWidth={2}
                    className="mt-1 shrink-0 text-vermilion-deep"
                  />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </>
        }
      />
      <section className="section">
        <div className="container-site">
          <div className="reading-shell">
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
        locale={locale === "gu" ? "gu" : "en"}
        title={tn("title")}
        intro={tn("intro")}
        languageNote={tn("languageNote")}
        declarationLabel={tn("declarationLabel")}
      />
    </>
  );
}
