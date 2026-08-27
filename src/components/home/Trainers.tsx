import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SampleTag } from "@/components/ui/SampleTag";
import { Icon } from "@/components/ui/Icon";
import { trainers } from "@/content/collections";

/**
 * "Who will actually teach me" is a top-three question for any school, and
 * the one template sites answer with a stock photo and the words "expert
 * faculty". Real names, real specialities, real portraits. Until the owner
 * confirms them (checklist Q7) each card carries a sample tag: honest
 * placeholders beat invented staff.
 */
export function Trainers() {
  const t = useTranslations("home.trainers");

  return (
    <section className="section">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={t("h2")} sub={t("sub")} />
          <Link
            href="/about"
            className="stitch-link mb-1 inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
          >
            {t("more")} <Icon name="arrow" size={16} className="arrow" />
          </Link>
        </div>

        <ul className="u-section-body grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {trainers.map((tr, i) => (
            <Reveal as="li" key={tr.nameEn} delay={i * 80}>
              <article className="card card-lift h-full overflow-hidden">
                <PhotoSlot
                  label={tr.photoLabel}
                  ratio="4/5"
                  className="card-img media-unveil rounded-none border-0"
                />
                <div className="p-6 md:p-8">
                  <h3 className="text-h4 card-title font-display">{tr.nameEn}</h3>
                  <p className="microlabel mt-2 !text-vermilion-deep">{tr.roleEn}</p>
                  <p className="mt-3 text-smallmeta text-stone">{tr.focusEn}</p>
                  {tr.sample ? (
                    <p className="mt-4">
                      <SampleTag />
                    </p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
