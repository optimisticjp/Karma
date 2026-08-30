import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { MonoNote } from "@/components/ui/MonoNote";
import { photosInGroup } from "@/content/photo-manifest";
import { MaterialWall } from "@/components/work/MaterialWall";

/**
 * The material wall — six pieces, six different shapes.
 *
 * The wall itself is `<MaterialWall>`, shared with `/student-work` so the
 * homepage teaser and the archive cannot drift into two different ideas of
 * what a piece frame is. Why it is a wall and not a grid, and why exactly one
 * frame carries a registration mark, are explained there.
 *
 * WHAT IS AND IS NOT CLAIMED HERE
 * -------------------------------
 * These six frames are Karma's own work, shot at the studio. Until they exist
 * the frames are honestly empty and say what they are waiting for. Nothing is
 * borrowed, generated, or captioned with a student's name, outcome or earning
 * — the consent and verification gates for attributed proof live in Content
 * Desk, and this section deliberately makes no attributed claim at all.
 *
 * The database-backed gallery (`<Proof>`) is a different thing and stays: it
 * shows what staff have published, with its sample tags intact. This is the
 * photographed wall the shoot is for.
 */
export function StudentWorkWall() {
  const t = useTranslations("home.wall");
  const pieces = photosInGroup("work");

  return (
    <section className="section band-material">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} />
          <MonoNote className="mb-1 shrink-0">{t("count", { count: pieces.length })}</MonoNote>
        </div>

        <MaterialWall className="u-section-body" />

        <p className="u-actions">
          <Link href="/student-work" className="btn btn-secondary">
            {t("cta")} <Icon name="arrow" size={18} className="arrow" />
          </Link>
        </p>
      </div>
    </section>
  );
}
