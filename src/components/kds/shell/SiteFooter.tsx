import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site, waLink } from "@/lib/site";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { BrandMark } from "./BrandMark";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThreadLine } from "@/components/kds/marks";

/**
 * The footer. Light, compact, useful (plan §26).
 *
 * WHAT CHANGED FROM THE ONE IT REPLACES
 * -------------------------------------
 * The previous footer was a 1,031px slab on a phone. It opened with a
 * full-viewport restatement of the brand promise, then four course links, then
 * eventually the address. The single most valuable thing in it — the phone
 * number — sat 686px down, and had to be dragged up with `order-first` to be
 * reachable at all.
 *
 * This one is ordered by what a visitor at the bottom of a page actually
 * wants: **where you are and how to reach you first**, then where else to go,
 * then the legal line. The brand promise is one line above the rule rather
 * than a chapter.
 *
 * THE THREE NUMBERS
 * -----------------
 * Each is named by the channel it is for. Which mobile answers what has not
 * been confirmed by the owner, so they are listed separately rather than
 * merged, and the WhatsApp action opens `whatsapp` while a call action dials
 * `callPhone` — the two roles never collapse into one. See `src/lib/site.ts`.
 */
export function SiteFooter() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const year = new Date().getFullYear();

  const explore = [
    { href: "/courses", label: tn("courses") },
    { href: "/batches", label: tn("batches") },
    { href: "/student-work", label: tn("work") },
    { href: "/notes", label: tn("notes") },
    { href: "/services", label: tn("services") },
    { href: "/about", label: tn("studio") }
  ];

  const start = [
    { href: "/admission", label: t("admissionForm") },
    { href: "/admissions", label: tn("admissions") },
    { href: "/contact", label: tn("contact") },
    { href: "/verify", label: t("verify") }
  ];

  return (
    <footer className="site-foot on-cloth">
      <div className="wrap">
        {/* The promise, once, as a line — not a chapter. */}
        <div className="site-foot-spine">
          <BrandMark size="footer" asLink={false} />
          <p className="t-h4 site-foot-promise">{t("spine")}</p>
        </div>
        <ThreadLine className="site-foot-rule" />

        <div className="site-foot-grid">
          {/* WHERE AND HOW TO REACH US — first, because that is what somebody
              at the bottom of a page is looking for. */}
          <div className="site-foot-visit">
            <p className="t-micro">{t("visit")}</p>
            <address className="site-foot-address">
              <p>{pick(site, "address", locale)}</p>
              <p className="font-bold">{pick(site, "landmark", locale)}</p>
              <p className="t-meta">{pick(site, "hours", locale)}</p>
            </address>

            <dl className="site-foot-numbers">
              <div>
                <dt className="t-micro">{t("callFor")}</dt>
                <dd>
                  <a href={`tel:+${site.callPhone}`} className="link-thread numeric">
                    {site.callPhoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="t-micro">{t("waFor")}</dt>
                <dd>
                  <a href={`tel:+${site.whatsapp}`} className="link-thread numeric">
                    {site.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="t-micro">{t("landlineFor")}</dt>
                <dd>
                  <a href={`tel:+${site.landline}`} className="link-thread numeric">
                    {site.landlineDisplay}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="site-foot-actions">
              <a
                href={waLink(tc("waPrefillDemo"))}
                target="_blank"
                rel="noopener noreferrer"
                className="act act-primary"
              >
                {tc("whatsapp")}
              </a>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="act act-secondary"
              >
                {tc("directions")}
              </a>
            </div>
          </div>

          <nav className="site-foot-nav" aria-label={t("learn")}>
            <p className="t-micro">{t("learn")}</p>
            <ul>
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-thread">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="site-foot-nav" aria-label={t("students")}>
            <p className="t-micro">{t("students")}</p>
            <ul>
              {start.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-thread">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="t-micro site-foot-social-label">{t("follow")}</p>
            <ul className="site-foot-social">
              <li>
                <a className="link-thread" href={site.socials.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a className="link-thread" href={site.socials.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a className="link-thread" href={site.socials.youtube} target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="site-foot-legal">
          <p className="t-meta">{t("rights", { year })}</p>
          <div className="site-foot-legal-links">
            <LocaleSwitch />
            <Link href="/privacy" className="link-thread t-meta">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="link-thread t-meta">
              {t("terms")}
            </Link>
            <a href={`mailto:${site.email}?subject=Data%20request`} className="link-thread t-meta">
              {t("dataRequest")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
