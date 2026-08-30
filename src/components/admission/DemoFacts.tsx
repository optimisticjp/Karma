import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { MonoNote } from "@/components/ui/MonoNote";
import { EMCAD_DAHAO } from "@/content/course-operations";

/**
 * The free demo, stated exactly as the studio runs it.
 *
 * The demo is the whole conversion: nobody in this trade commits three months
 * and a fee to a place they have not stood in. So the page says what it
 * actually is — two days, two hours a session, free, bring nothing — instead
 * of the vague "book a free demo class" a visitor has read on ten other
 * institute sites.
 *
 * THE FIGURES COME FROM THE VERIFIED RECORD
 * -----------------------------------------
 * Days, hours and the four askable times all render from
 * `src/content/course-operations.ts`. The message catalogue holds labels and
 * sentences and no numbers, so the demo cannot be described one way here and
 * another way on the course page.
 *
 * THE TIMES ARE PREFERENCES, NOT INVENTORY
 * ----------------------------------------
 * Karma keeps no per-date demo capacity. Rendering these as bookable slots
 * would have the site promise a seat nobody has reserved, so the copy says
 * plainly that they are times you can ask for, and the section carries no
 * date picker.
 */
export function DemoFacts() {
  const t = useTranslations("admissionsPage.demo");
  const locale = useLocale();
  const gu = locale === "gu";
  const demo = EMCAD_DAHAO.operations.demo;
  if (!demo) return null;

  const length = gu
    ? `${demo.days} દિવસ · દરેક ${demo.hours} કલાક`
    : `${demo.days} days · ${demo.hours} hours a session`;

  const facts: Array<[string, string]> = [
    [t("daysLabel"), length],
    [t("costLabel"), t("costValue")],
    [t("bringLabel"), t("bringValue")]
  ];

  return (
    <section className="section band-info" id="demo">
      <div className="container-site">
        <SectionHeading title={t("title")} sub={t("sub")} rule />

        <div className="u-section-body demo-grid">
          <dl className="demo-facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>
                  <MonoNote>{label}</MonoNote>
                </dt>
                <dd className="demo-fact-value">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="demo-slots">
            <MonoNote as="p">{t("slotsLabel")}</MonoNote>
            <ul className="demo-slot-list">
              {demo.slots.map((slot) => (
                <li key={slot.key} className="demo-slot">
                  {slot.startTime}–{slot.endTime}
                </li>
              ))}
            </ul>
            <p className="demo-slot-note">{t("slotsNote")}</p>
            <p className="u-actions">
              <Link href="/admission" className="btn btn-primary btn-stitch">
                {t("cta")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
