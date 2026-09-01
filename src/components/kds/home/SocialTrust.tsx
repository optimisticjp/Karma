import { getTranslations } from "next-intl/server";
import { socialChannels } from "@/content/proof";
import { SocialProof } from "@/components/kds/proof";

/** Social reach belongs immediately after the hero so visitors see trust before choosing a path. */
export async function SocialTrust() {
  const t = await getTranslations("home.trust");

  return (
    <section className="band-tight on-cloth" aria-label={t("socialLabel")}>
      <div className="wrap">
        <SocialProof items={socialChannels} label={t("socialLabel")} followCta={t("follow")} />
      </div>
    </section>
  );
}
