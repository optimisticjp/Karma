import { useLocale, useTranslations } from "next-intl";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/lib/site";

/** The physical-institute proof block: address, hours, map, one tap to talk. */
export function VisitStudio() {
  const t = useTranslations("home.visit");
  const tc = useTranslations("common");
  const tcp = useTranslations("contactPage");
  const locale = useLocale();
  const gu = locale === "gu";

  return (
    <section className="section-compact bg-ivory-2">
      <div className="container-site grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading title={t("h2")} sub={t("sub")} />
          <dl className="mt-6 space-y-4 text-stone">
            <div className="flex gap-3">
              <Icon name="pin" size={20} className="mt-1 text-vermilion-deep" />
              <div>
                <dt className="microlabel">{tcp("addressLabel")}</dt>
                <dd className="mt-0.5">{gu ? site.addressGu : site.addressEn}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Icon name="hoop" size={20} className="mt-1 text-vermilion-deep" />
              <div>
                <dt className="microlabel">{tcp("hoursLabel")}</dt>
                <dd className="mt-0.5">{gu ? site.hoursGu : site.hoursEn}</dd>
              </div>
            </div>
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillDemo"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
            </a>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              {tcp("mapCta")}
            </a>
            <a href={`tel:+${site.whatsapp}`} className="btn btn-ghost">
              <Icon name="phone" size={18} /> {site.phoneDisplay}
            </a>
          </div>
          <p className="mt-4 text-smallmeta text-stone">{tcp("demoNote")}</p>
        </div>
        <PhotoSlot label={tcp("entranceLabel")} ratio="16/9" className="rounded-none" />
      </div>
    </section>
  );
}
