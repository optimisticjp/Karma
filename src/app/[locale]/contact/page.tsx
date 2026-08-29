import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
      href: `tel:+${site.whatsapp}`,
      external: false,
      icon: "phone" as const,
      label: tc("call"),
      value: site.phoneDisplay,
      note: t("callNote"),
      primary: false
    },
    {
      href: `mailto:${site.email}`,
      external: false,
      icon: "spool" as const,
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
              <Icon name="pin" size={18} /> {t("mapCta")}
            </a>
          </>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("hoursLabel")}</p>
            <p className="mt-3">
              <strong>{gu ? site.hoursGu : site.hoursEn}</strong>
            </p>
            <p className="mt-3">{t("demoNote")}</p>
          </>
        }
      />

      <section className="section">
        <div className="container-site grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading title={t("reachTitle")} sub={t("reachSub")} />
            <ul className="u-section-body space-y-3">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="card card-lift flex items-center gap-4 p-4 md:p-5"
                  >
                    <Icon
                      name={c.icon}
                      size={22}
                      className={c.primary ? "shrink-0 text-vermilion" : "shrink-0 text-stone"}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="card-title block font-semibold">{c.label}</span>
                      <span className="mt-0.5 block break-all text-smallmeta text-stone">
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
                <dd className="ledger-note">{gu ? site.addressGu : site.addressEn}</dd>
              </div>
              <div className="ledger-row is-labelled">
                <dt className="ledger-title">{t("hoursLabel")}</dt>
                <dd className="ledger-note">{gu ? site.hoursGu : site.hoursEn}</dd>
              </div>
            </dl>
            <p className="pending-block mt-6 text-smallmeta text-stone">
              <span className="pending-label">{t("directionsLabel")}</span>
              {t("directionsNote")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
