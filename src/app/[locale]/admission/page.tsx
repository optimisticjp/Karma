import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdmissionForm, type AdmissionContext } from "@/components/forms/AdmissionForm";
import { courses } from "@/content/courses";
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

/** Context-preserving entry (audit fix): course/batch CTAs land preselected. */
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
  const t = await getTranslations("admissionForm");

  const options = courses.map((c) => ({
    slug: c.slug,
    nameEn: c.nameEn,
    nameGu: c.nameGu,
    family: c.family
  }));

  const context: AdmissionContext = {
    course: options.some((c) => c.slug === sp.course) ? sp.course : undefined,
    timing: sp.timing === "morning" || sp.timing === "evening" ? sp.timing : undefined,
    src: typeof sp.src === "string" ? sp.src.slice(0, 40) : undefined
  };

  return (
    <section className="section-compact">
      <div className="container-site max-w-3xl">
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="mt-3 text-stone">{t("sub")}</p>
        <div className="mt-8">
          <AdmissionForm courses={options} context={context} />
        </div>
      </div>
    </section>
  );
}
