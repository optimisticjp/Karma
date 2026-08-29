import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdmissionForm, type AdmissionContext } from "@/components/forms/AdmissionForm";
import { coursesByFamily } from "@/content/courses";
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

  const options = coursesByFamily.map((c) => ({
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
            <AdmissionForm courses={options} context={context} />
          </div>
        </div>
      </section>
    </>
  );
}
