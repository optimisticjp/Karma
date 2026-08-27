import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Two doors, deliberately unequal (spec: asymmetry; B2B visible but never
 * competing with admissions). Learners get the large editorial card;
 * businesses get a precise, compact one.
 */
export function PathChooser() {
  const t = useTranslations("home.path");

  return (
    <section className="section">
      <div className="container-site">
        <SectionHeading title={t("h2")} />
        <div className="u-section-body grid gap-6 lg:gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="card card-lift flex h-full flex-col overflow-hidden">
              <PhotoSlot label={t("learnPhoto")} ratio="16/9" className="card-img media-unveil rounded-none border-0" />
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h3 className="text-h3"><span className="card-title">{t("learnTitle")}</span></h3>
                <p className="u-lede">{t("learnDesc")}</p>
                <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-6 font-semibold">
                  <Link className="stitch-link inline-flex items-center gap-1.5 text-vermilion-deep" href="/courses">
                    {t("learnA1")} <Icon name="arrow" size={16} className="arrow" />
                  </Link>
                  <Link className="stitch-link text-stone" href="/admissions">
                    {t("learnA2")}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-5">
            <div className="card card-lift flex h-full flex-col p-6 md:p-8">
              <Icon name="spool" size={28} className="text-vermilion-deep" />
              <h3 className="text-h3 mt-5"><span className="card-title">{t("bizTitle")}</span></h3>
              <p className="u-lede">{t("bizDesc")}</p>
              <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-6 font-semibold">
                <Link className="stitch-link inline-flex items-center gap-1.5 text-vermilion-deep" href="/services">
                  {t("bizA1")} <Icon name="arrow" size={16} className="arrow" />
                </Link>
                <Link className="stitch-link text-stone" href="/services">
                  {t("bizA2")}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
