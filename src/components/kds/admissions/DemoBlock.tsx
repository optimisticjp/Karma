import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CourseConfig } from "@/lib/course/config";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** The demo block renders only the current Console-resolved demo policy. */
export function DemoBlock({
  demo
}: {
  demo: CourseConfig["operations"]["demo"];
}) {
  const t = useTranslations("admissionsPage.demo");
  if (!demo) return null;

  const facts: Array<[string, string]> = [
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
