import { getTranslations } from "next-intl/server";
import { socialChannels } from "@/content/proof";
import { SocialProof } from "@/components/kds/proof";

/** Instagram/Facebook/YouTube reach is an early trust signal, so it sits
 * directly below the hero instead of waiting until the end of the homepage. */
export async function HeroSocialProof() {
  const t = await getTranslations("home.trust");

  return (
    <section className="band-tight on-mist" aria-label={t("socialLabel")}>
      <div className="wrap">
        <SocialProof items={socialChannels} label={t("socialLabel")} followCta={t("follow")} />
      </div>
    </section>
  );
}
