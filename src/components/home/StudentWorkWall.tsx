import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { MonoNote } from "@/components/ui/MonoNote";
import { ManifestPhoto } from "@/components/ui/PhotoSlot";
import { photosInGroup } from "@/content/photo-manifest";

/**
 * The material wall — six pieces, six different shapes.
 *
 * A uniform grid of six identical tiles is what a stock-photo site does, and
 * it flattens the one thing that makes textile work worth showing: a bridal
 * zardosi panel is tall, a dupatta is square, a screen-and-result pair is
 * wide. The manifest already carries each shot's real dimensions, so the wall
 * simply asks each frame for its own ratio. It is a mixed-ratio editorial
 * wall today with placeholders and stays exactly that wall when the six
 * photographs land — no relayout, no CLS.
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

        <ul className="work-wall u-section-body">
          {pieces.map((piece, i) => (
            <Reveal as="li" key={piece.id} delay={i * 40} className="work-wall-item">
              <ManifestPhoto id={piece.id} editorial />
            </Reveal>
          ))}
        </ul>

        <p className="u-actions">
          <Link href="/student-work" className="btn btn-secondary">
            {t("cta")} <Icon name="arrow" size={18} className="arrow" />
          </Link>
        </p>
      </div>
    </section>
  );
}
