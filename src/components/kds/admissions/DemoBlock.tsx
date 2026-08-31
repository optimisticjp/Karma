import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EMCAD_DAHAO } from "@/content/course-operations";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * The free demo, exactly as the studio runs it.
 *
 * The demo IS the conversion: nobody in this trade commits three months and a
 * fee to a place they have not stood in. So the page states what it actually
 * is — two days, two hours a session, free, bring nothing — instead of the
 * vague "book a free demo class" a visitor has read on ten other institute
 * sites.
 *
 * **The figures render from the verified record.** Days, hours and the four
 * askable times all come from `src/content/course-operations.ts`; the message
 * catalogue holds labels and sentences and no numbers, so the demo cannot be
 * described one way here and another way on a course page.
 *
 * **The times are preferences, not inventory.** Karma keeps no per-date demo
 * capacity, so rendering these as bookable slots would have the site promise a
 * seat nobody reserved. The copy says so, and there is no date picker.
 */
export function DemoBlock() {
  const t = useTranslations("admissionsPage.demo");
  const demo = EMCAD_DAHAO.operations.demo;
  if (!demo) return null;

  const facts: Array<[string, string]> = [
    /* The sentence is a catalogue string and the FIGURES are the verified
       record's — so neither language can drift from the other, and neither
       can drift from `course-operations.ts`. */
    [t("daysLabel"), t("daysValue", { days: demo.days, hours: demo.hours })],
    [t("costLabel"), t("costValue")],
    [t("bringLabel"), t("bringValue")]
  ];

  return (
    <section className="band on-mist" id="demo" aria-labelledby="demo-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h2 id="demo-heading" className="t-h2 mt-1.5">
              {t("title")}
            </h2>
            <p className="t-lede mt-3 max-w-[46ch]">{t("sub")}</p>

            <dl className="emcad-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="t-micro">{label}</dt>
                  <dd className="t-h4 mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="fee-sheet">
            <p className="t-micro">{t("slotsLabel")}</p>
            <ul className="emcad-timing-list" role="list">
              {demo.slots.map((slot) => (
                <li key={slot.key} className="t-body numeric">
                  {slot.startTime}–{slot.endTime}
                </li>
              ))}
            </ul>
            <p className="t-meta mt-3">{t("slotsNote")}</p>

            <ThreadLine className="my-5" />

            <Link href="/admission" className="act act-primary">
              {t("cta")} <Icon name="arrow" size={17} className="arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
