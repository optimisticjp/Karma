import { useLocale, useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Icon } from "@/components/ui/Icon";
import { site, waLink } from "@/lib/site";

/**
 * The physical-institute proof block. For this audience, "there is a real
 * floor you can walk onto" outranks anything the copy can claim, so the
 * address, the hours and one tap to talk carry the section.
 *
 * The old right-hand column was an empty entrance-photo frame. It now answers
 * the question that actually stops people from coming — what happens if I
 * just turn up — which needs no photograph and no promise we cannot keep.
 */
export function VisitStudio() {
  const t = useTranslations("home.visit");
  const tc = useTranslations("common");
  const tcp = useTranslations("contactPage");
  const locale = useLocale();
  const gu = locale === "gu";
  const steps = t.raw("firstSteps") as Array<{ t: string; d: string }>;

  return (
    <section className="section-compact">
      <div className="container-site grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
        <div>
          <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />

          <dl className="u-section-body ledger">
            <div className="ledger-row is-labelled">
              <dt className="ledger-title">{tcp("addressLabel")}</dt>
              <dd className="ledger-note">
                {gu ? site.addressGu : site.addressEn}
                {/* The landmark is what actually gets a first-timer to the
                    door in Mota Varachha; the PIN code never has. */}
                <span className="mt-1 block font-semibold text-carbon">
                  {gu ? site.landmarkGu : site.landmarkEn}
                </span>
              </dd>
            </div>
            <div className="ledger-row is-labelled">
              <dt className="ledger-title">{tcp("hoursLabel")}</dt>
              <dd className="ledger-note">{gu ? site.hoursGu : site.hoursEn}</dd>
            </div>
            {/* Each number named by its channel rather than pooled under
                "Phone": which one answers what is unconfirmed, and a pooled
                list is exactly the contradictory label to avoid. */}
            <div className="ledger-row is-labelled">
              <dt className="ledger-title">{t("callLabel")}</dt>
              <dd className="ledger-note">
                <a
                  href={`tel:+${site.callPhone}`}
                  className="stitch-link inline-flex min-h-8 items-center font-semibold text-carbon"
                >
                  {site.callPhoneDisplay}
                </a>
              </dd>
            </div>
            <div className="ledger-row is-labelled">
              <dt className="ledger-title">{t("waLabel")}</dt>
              <dd className="ledger-note flex flex-wrap gap-x-5">
                <a
                  href={`tel:+${site.whatsapp}`}
                  className="stitch-link inline-flex min-h-8 items-center font-semibold text-carbon"
                >
                  {site.phoneDisplay}
                </a>
                <a
                  href={`tel:+${site.landline}`}
                  className="stitch-link inline-flex min-h-8 items-center font-semibold text-carbon"
                >
                  {site.landlineDisplay}
                </a>
              </dd>
            </div>
          </dl>

          <div className="u-actions flex flex-wrap gap-3">
            <a
              href={waLink(tc("waPrefillDemo"))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
            </a>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Icon name="pin" size={18} /> {tcp("mapCta")}
            </a>
          </div>
        </div>

        <div className="feature-surface p-5 md:p-6">
          <h3 className="text-h4 font-display">{t("firstTitle")}</h3>
          <span aria-hidden="true" className="rule-stitch" />
          <Ledger as="ol" className="mt-6">
            {steps.map((s, i) => (
              <LedgerRow
                key={s.t}
                index={String(i + 1).padStart(2, "0")}
                title={s.t}
                note={s.d}
              />
            ))}
          </Ledger>
          <p className="mt-6 text-smallmeta text-stone">{tcp("demoNote")}</p>
        </div>
      </div>
    </section>
  );
}
