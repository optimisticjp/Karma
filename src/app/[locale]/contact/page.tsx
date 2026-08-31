import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManifestPhoto } from "@/components/ui/PhotoSlot";
import { Icon } from "@/components/ui/Icon";
import { site, waLink } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return pageMeta({ locale, path: "/contact", title: t("title"), description: t("description") });
}

/**
 * Contact.
 *
 * This audience reaches for WhatsApp first and a form last, so the channels
 * are ranked rather than presented as equal options, and each one says what
 * it is actually for. Every target is a full-width row: this page gets opened
 * on a phone, one-handed, usually while standing somewhere noisy.
 *
 * The icons here are deliberately ordinary — a phone, an envelope, a map.
 * Branded concepts get niche icons; universal actions keep universal ones, and
 * nobody standing on a footpath should have to decode an embroidery symbol to
 * find "email". (The email row used to carry a thread spool.)
 *
 * The entrance frame is the last thing that actually decides a visit: the
 * address gets someone to the road and the signboard gets them through the
 * door. It is a reserved manifest slot, not a stand-in photograph.
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, l] = await Promise.all([
    getTranslations("contactPage"),
    getTranslations("common"),
    getLocale()
  ]);
  const gu = l === "gu";

  const channels = [
    {
      href: waLink(tc("waPrefillDemo")),
      external: true,
      icon: "whatsapp" as const,
      label: tc("whatsapp"),
      value: site.phoneDisplay,
      note: t("waNote"),
      primary: true
    },
    {
      href: `tel:+${site.landline}`,
      external: false,
      icon: "phone" as const,
      label: t("landlineLabel"),
      value: site.landlineDisplay,
      note: t("landlineNote"),
      primary: false
    },
    /* Two mobile numbers, two roles, kept apart. The owner has not confirmed
       which answers what, so each row names its channel and nothing on the
       site labels the call number as WhatsApp. See src/lib/site.ts. */
    {
      href: `tel:+${site.callPhone}`,
      external: false,
      icon: "phone" as const,
      label: t("demoCallLabel"),
      value: site.callPhoneDisplay,
      note: t("demoCallNote"),
      primary: false
    },
    {
      href: `tel:+${site.whatsapp}`,
      external: false,
      icon: "phone" as const,
      label: t("mobileLabel"),
      value: site.phoneDisplay,
      note: t("callNote"),
      primary: false
    },
    {
      href: `mailto:${site.email}`,
      external: false,
      icon: "mail" as const,
      label: t("emailLabel"),
      value: site.email,
      note: t("emailNote"),
      primary: false
    }
  ];

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <>
            <Link href="/admission" className="btn btn-primary">
              {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Icon name="map" size={18} /> {t("mapCta")}
            </a>
          </>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("hoursLabel")}</p>
            <p className="mt-1.5">
              <strong>{gu ? site.hoursGu : site.hoursEn}</strong>
            </p>
            <p className="mt-1.5">{t("demoNote")}</p>
          </>
        }
      />

      <section className="section band-info">
        <div className="container-site grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading title={t("reachTitle")} sub={t("reachSub")} />
            {/* Rows, not cards. Each was 108px — 16px of padding, a 16/26px
                title and a value-plus-note line that wrapped to three lines at
                15px — so the first channel opened at ~906px on a phone and the
                page's whole job was below the fold. */}
            <ul className="u-section-body space-y-1.5">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="card card-lift flex min-h-11 items-center gap-3 p-2.5 md:p-3.5"
                  >
                    <Icon
                      name={c.icon}
                      size={20}
                      className={c.primary ? "shrink-0 text-vermilion" : "shrink-0 text-stone"}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="card-title block text-smallmeta font-semibold">{c.label}</span>
                      <span className="block break-all text-[0.8125rem] leading-snug text-stone">
                        {c.value} · {c.note}
                      </span>
                    </span>
                    <Icon name="arrow" size={18} className="arrow shrink-0 text-vermilion-deep" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading title={t("visitTitle")} sub={t("visitSub")} />
            <dl className="u-section-body ledger">
              <div className="ledger-row is-labelled">
                <dt className="ledger-title">{t("addressLabel")}</dt>
                <dd className="ledger-note">
                  {gu ? site.addressGu : site.addressEn}
                  <span className="mt-1 block font-semibold text-carbon">
                    {gu ? site.landmarkGu : site.landmarkEn}
                  </span>
                </dd>
              </div>
              <div className="ledger-row is-labelled">
                <dt className="ledger-title">{t("hoursLabel")}</dt>
                <dd className="ledger-note">{gu ? site.hoursGu : site.hoursEn}</dd>
              </div>
            </dl>
            {/* People in Mota Varachha navigate by landmark, not by PIN code.
                Both landmarks are verified: Dhara Arcade from the studio's own
                Google pin, Krishna Township Road from its JustDial listing. */}
            {/* What to look for from the road. */}
            <figure className="contact-entrance mt-6">
              <ManifestPhoto id="A2_ENTRANCE_SIGNBOARD" editorial />
              <figcaption className="contact-entrance-caption">{t("entranceCaption")}</figcaption>
            </figure>

            <div className="card mt-6 p-3.5 md:p-4">
              {/* The landmark already sits with the address above; repeating it
                  here would be emphasis by duplication. This card carries the
                  part the address cannot: which floor, and what to do if you
                  are outside and still cannot see it. */}
              <p className="microlabel !text-vermilion-deep">{t("directionsTitle")}</p>
              <p className="mt-3 text-stone">{t("directionsBody")}</p>
              <p className="mt-4">
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stitch-link inline-flex min-h-8 items-center gap-1.5 font-semibold text-vermilion-deep"
                >
                  {t("mapCta")} <Icon name="arrow" size={15} className="arrow" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
