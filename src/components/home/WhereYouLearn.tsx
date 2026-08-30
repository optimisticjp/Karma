import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MonoNote } from "@/components/ui/MonoNote";
import { ManifestPhoto } from "@/components/ui/PhotoSlot";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Where you actually learn.
 *
 * For this audience, "there is a real floor you can walk onto, with machines
 * on it" outranks anything the copy can claim. So the section is evidence:
 * the floor wide, the entrance and signboard you will look for from the road,
 * and the four machine stations.
 *
 * NO INVENTED MACHINE SPECIFICATIONS
 * ----------------------------------
 * Each station is named by the technique it runs — zardosi, beads, laser,
 * tufting — and by nothing else. No head count, no model, no RPM, no
 * production speed, no capacity. The studio has not supplied any of those, and
 * a specification invented to look authoritative is the same lie as a stock
 * photograph. If the owner later supplies real machine details, they belong
 * here; until then the honest claim is simply which machines are on the floor.
 */

const STATIONS: Array<{ id: string; icon: IconName; key: string }> = [
  { id: "A3_ZARDOSI_MACHINE", icon: "satin", key: "zardosi" },
  { id: "A4_BEADS_MACHINE", icon: "bead", key: "beads" },
  { id: "A5_LASER_MACHINE", icon: "laser", key: "laser" },
  { id: "A6_TUFTING_MACHINE", icon: "tuft", key: "tufting" }
];

export function WhereYouLearn() {
  const t = useTranslations("home.studio");

  return (
    <section className="section band-human">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />

        <div className="u-section-body studio-grid">
          <Reveal className="studio-floor">
            <ManifestPhoto id="A1_MACHINE_FLOOR" editorial />
            <p className="studio-caption">{t("floorCaption")}</p>
          </Reveal>

          <div className="studio-side">
            <Reveal delay={60}>
              <ManifestPhoto id="A2_ENTRANCE_SIGNBOARD" editorial />
              <p className="studio-caption">{t("entranceCaption")}</p>
            </Reveal>
            <Reveal delay={100}>
              <ManifestPhoto id="F1_STUDIO_FLOOR_WIDE" editorial />
              <p className="studio-caption">{t("wideCaption")}</p>
            </Reveal>
          </div>
        </div>

        <div className="studio-stations">
          <MonoNote as="p">{t("stationsLabel")}</MonoNote>
          <ul className="studio-station-list">
            {STATIONS.map((station, i) => (
              <Reveal as="li" key={station.id} delay={i * 40} className="studio-station">
                <ManifestPhoto id={station.id} compact editorial />
                <p className="studio-station-name">
                  <Icon name={station.icon} size={17} className="text-vermilion-deep" />
                  {t(`station_${station.key}` as "station_zardosi")}
                </p>
              </Reveal>
            ))}
          </ul>
          <p className="studio-note">{t("noSpecsNote")}</p>
        </div>
      </div>
    </section>
  );
}
