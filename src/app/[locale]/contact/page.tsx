import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/i18n/localized";
import { asLocale, routing } from "@/i18n/routing";
import { site, waLink } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { PageHead } from "@/components/kds/PageHead";
import { PhotoFrame } from "@/components/kds/Frame";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";
import { PageCrumbs } from "@/components/kds/PageCrumbs";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
 * CONTACT.
 *
 * This audience reaches for WhatsApp first and a form last, so the channels
 * are RANKED rather than presented as equal options, and each one says what it
 * is actually for. Every target is a full-width row: this page gets opened on
 * a phone, one-handed, usually while standing somewhere noisy.
 *
 * **Two mobile numbers, two roles, kept apart.** The owner has not confirmed
 * which number answers which channel, so each row names its own and nothing on
 * this site labels the call number as WhatsApp. See `src/lib/site.ts` §37.
 *
 * The icons are deliberately ordinary — a phone, an envelope, a map. Branded
 * concepts get niche icons; universal actions keep universal ones, and nobody
 * standing on a footpath should have to decode an embroidery symbol to find
 * "email".
 *
 * The entrance frame is the last thing that actually decides a visit: the
 * address gets somebody to the road, the signboard gets them through the door.
 * It is a reserved manifest slot, never a stand-in photograph.
 *
 * **No dock here.** This page puts call, WhatsApp and directions in its own
 * first viewport, which is better than a bar covering them.
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, rawLocale] = await Promise.all([
    getTranslations("contactPage"),
    getTranslations("common"),
    getLocale()
  ]);
  const l = asLocale(rawLocale);

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
      <PageCrumbs page="contact" path="/contact" />
      <PageHead
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <>
            <Link href="/admission" className="act act-primary">
              {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
            </Link>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="act act-secondary"
            >
              <Icon name="map" size={17} /> {t("mapCta")}
            </a>
          </>
        }
        aside={
          <>
            <p className="t-micro">{t("hoursLabel")}</p>
            <p className="t-h4 mt-1">{pick(site, "hours", l)}</p>
            <ThreadLine className="my-5" />
            <p className="t-body">{t("demoNote")}</p>
          </>
        }
      />

      {/* The channels, ranked. Each row is a whole tap target. */}
      <section className="band on-canvas" aria-labelledby="reach-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <h2 id="reach-heading" className="t-h2">
                {t("reachTitle")}
              </h2>
              <p className="t-lede mt-3 max-w-[42ch]">{t("reachSub")}</p>
            </div>

            <ul className="channels" role="list">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={c.primary ? "channel channel-primary" : "channel"}
                  >
                    <Icon name={c.icon} size={20} className="channel-icon" />
                    <span className="min-w-0">
                      <span className="t-micro">{c.label}</span>
                      <span className="t-h4 numeric mt-0.5 block">{c.value}</span>
                      <span className="t-meta mt-1 block">{c.note}</span>
                    </span>
                    <Icon name="arrow" size={17} className="channel-arrow arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Where to come, and what to look for from the road. */}
      <section className="band on-cloth" aria-labelledby="visit-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <h2 id="visit-heading" className="t-h2">
                {t("visitTitle")}
              </h2>
              <p className="t-lede mt-3 max-w-[42ch]">{t("visitSub")}</p>

              <dl className="before-grid !mt-6">
                <div>
                  <dt className="t-h4">{t("addressLabel")}</dt>
                  <dd className="t-body mt-2">
                    <address className="when-address">
                      <p>{pick(site, "address", l)}</p>
                      <p className="font-bold">{pick(site, "landmark", l)}</p>
                    </address>
                  </dd>
                </div>
                <div>
                  <dt className="t-h4">{t("hoursLabel")}</dt>
                  <dd className="t-body mt-2">{pick(site, "hours", l)}</dd>
                </div>
              </dl>

              <p className="mt-6">
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="act act-secondary"
                >
                  <Icon name="pin" size={17} /> {tc("directions")}
                </a>
              </p>
            </div>

            <figure className="min-w-0">
              <PhotoFrame id="A2_ENTRANCE_SIGNBOARD" scale="feature" />
              <figcaption className="t-meta mt-2">{t("entranceCaption")}</figcaption>
            </figure>
          </div>

          <div className="fee-sheet mt-8">
            <p className="t-micro">{t("directionsTitle")}</p>
            <p className="t-body mt-2 max-w-prose">{t("directionsBody")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
