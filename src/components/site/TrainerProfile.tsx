import { useLocale, useTranslations } from "next-intl";
import { SampleTag } from "@/components/ui/SampleTag";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import type { Trainer } from "@/content/collections";

/**
 * A trainer profile.
 *
 * The fields are the ones a prospective student actually weighs — what this
 * person is the one to ask about, which machines they teach on, and how they
 * run a session — rather than a biography.
 *
 * Every profile on the site is currently sample data, so the card says so.
 * That marking is load-bearing in two places: the visible <SampleTag />, and
 * the absence of any `Person` structured data anywhere on the site. A
 * fabricated named person in schema is a different order of problem from a
 * labelled card, and the owner has not confirmed a single trainer yet.
 */
export function TrainerProfile({ trainer }: { trainer: Trainer }) {
  const t = useTranslations("proof.trainers");
  const locale = useLocale();
  const gu = locale === "gu";

  const specs: Array<[string, string]> = [
    [t("speciality"), gu ? trainer.specialityGu : trainer.specialityEn],
    [t("machines"), (gu ? trainer.machinesGu : trainer.machinesEn).join(" · ")],
    ...(trainer.softwareEn
      ? ([[t("software"), gu ? trainer.softwareGu! : trainer.softwareEn]] as Array<[string, string]>)
      : []),
    [t("experience"), gu ? trainer.experienceGu : trainer.experienceEn],
    [t("teaching"), gu ? trainer.teachingGu : trainer.teachingEn]
  ];

  return (
    <article className="trainer-card">
      <div className="trainer-media">
        <PhotoSlot label={trainer.photoLabel} ratio="4/5" />
      </div>
      <div className="trainer-body">
        <h3 className="trainer-name">{gu ? trainer.nameGu : trainer.nameEn}</h3>
        <p className="trainer-role">{gu ? trainer.roleGu : trainer.roleEn}</p>
        <p className="trainer-focus">{gu ? trainer.focusGu : trainer.focusEn}</p>

        <dl className="trainer-specs">
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt className="trainer-spec-label">{label}</dt>
              <dd className="trainer-spec-value">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="trainer-spec-label mt-5">{t("selectedWork")}</p>
        <ul className="trainer-work">
          {(gu ? trainer.selectedWorkGu : trainer.selectedWorkEn).map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>

        {trainer.sample ? (
          <p className="mt-5">
            <SampleTag />
          </p>
        ) : null}
      </div>
    </article>
  );
}
