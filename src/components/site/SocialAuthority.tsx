import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { TrackedLink } from "@/components/site/TrackedLink";
import { site, ownerProvidedFacts } from "@/lib/site";

/**
 * Social authority, as links and rounded counts rather than embeds.
 *
 * The studio's real audience is on Instagram and Facebook, and the reels are
 * genuinely the best proof it has — but an embedded feed is several hundred
 * kilobytes of third-party JavaScript, a tracking surface, and a layout that
 * breaks whenever the platform changes it. This audience arrives on mobile
 * data. Four attributed counts and four outbound links do the same job for
 * the cost of a paragraph.
 *
 * Counts are owner-provided, rounded, and attributed to the platform they
 * came from. None of them is emitted as structured data.
 */
export function SocialAuthority() {
  const t = useTranslations("proof.social");

  const channels = [
    { key: "instagram", href: site.socials.instagram, label: "Instagram", value: ownerProvidedFacts.instagramFollowers },
    { key: "facebook", href: site.socials.facebook, label: "Facebook", value: ownerProvidedFacts.facebookFollowers },
    { key: "youtube", href: site.socials.youtube, label: "YouTube", value: t("watch") },
    { key: "threads", href: site.socials.threads, label: "Threads", value: t("follow") }
  ];

  return (
    <section className="section-compact bg-sand">
      <div className="container-site split">
        <div>
          <p className="eyebrow u-eyebrow-gap">{t("eyebrow")}</p>
          <h2 className="text-h3">{t("h2")}</h2>
          <p className="u-lede">{t("sub")}</p>
        </div>
        <ul className="social-rail">
          {channels.map((c) => (
            <li key={c.key}>
              <TrackedLink
                href={c.href}
                event="social_click"
                props={{ channel: c.key, surface: "stories" }}
                external
                className="social-link"
              >
                <span className="social-value tabular">{c.value}</span>
                <span className="social-label">{c.label}</span>
                <Icon name="arrow" size={16} className="arrow social-go" />
              </TrackedLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
