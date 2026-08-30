import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { MonoNote } from "@/components/ui/MonoNote";
import { ownerProvidedFacts } from "@/lib/site";

/**
 * The trust rail — social proof, standing on its own.
 *
 * It used to sit inside the hero, under the machine facts. That put two
 * different kinds of claim in one row: "EMCAD DAHAO" and "3 months" are
 * verified operational facts about what Karma teaches, while a follower count
 * is a number the owner supplied about how many people watch. Mixing them made
 * the machine facts read like marketing, which is the one thing this hero
 * cannot afford.
 *
 * So the numbers moved here, one band below, attributed to the platform each
 * came from. None of it reaches structured data — see `ownerProvidedFacts` in
 * `src/lib/site.ts` for why a follower count is not a review rating.
 */
export function TrustRail() {
  const t = useTranslations("home.trust");

  const items: Array<[string, string]> = [
    [t("google"), ownerProvidedFacts.googleRating],
    [t("instagram"), ownerProvidedFacts.instagramFollowers],
    [t("facebook"), ownerProvidedFacts.facebookFollowers],
    [t("whereLabel"), t("whereValue")],
    [t("teachingLabel"), t("teachingValue")]
  ];

  return (
    <section className="band-info trust-band" aria-label={t("label")}>
      <Reveal className="container-site">
        <dl className="fact-rail">
          {items.map(([label, value]) => (
            <div key={label}>
              <dt className="fact-label">
                <MonoNote>{label}</MonoNote>
              </dt>
              <dd className="fact-value">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="trust-source">{t("source")}</p>
      </Reveal>
    </section>
  );
}
