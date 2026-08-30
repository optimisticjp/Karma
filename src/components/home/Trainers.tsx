import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManifestPhoto, PhotoSlot } from "@/components/ui/PhotoSlot";
import { MonoNote } from "@/components/ui/MonoNote";
import { photosInGroup } from "@/content/photo-manifest";
import { Icon } from "@/components/ui/Icon";
import { trainers } from "@/content/collections";

/**
 * "Who will actually teach me" is a top-three question for any school, and the
 * one template sites answer with a stock photo and the words "expert faculty".
 *
 * This section used to answer it with three cards whose headings read
 * "Sample: lead trainer name" over empty photo frames — the most damaging
 * moment on the page, because a visitor cannot tell a placeholder from a
 * broken site. The homepage still answers it with what is actually true and
 * verified about how teaching works here, which is what a prospective student
 * is really asking about anyway.
 *
 * The full profiles live on /about, where each one carries its own sample tag
 * and there is room to say what a trainer is the one to ask about. A labelled
 * profile on a page a visitor chose to open is a different thing from a
 * placeholder ambushing them on the homepage.
 *
 * THE THREE PORTRAIT FRAMES
 * -------------------------
 * T1–T3 from the shoot list are reserved here, and the distinction that makes
 * that safe is worth keeping: a frame that names the PHOTOGRAPH it is waiting
 * for is a visible work-in-progress; a card headed "Sample: lead trainer name"
 * is a person who does not exist. So the frames carry their shoot brief and
 * nothing else — no invented name, no invented role, no invented speciality.
 * When the portraits and the confirmed profiles arrive together, the cards
 * below replace the frames without the layout moving.
 */
export function Trainers() {
  const t = useTranslations("home.trainers");
  const locale = useLocale();
  const gu = locale === "gu";
  const confirmed = trainers.filter((tr) => !tr.sample);
  const portraits = photosInGroup("trainer");
  /* The verified teaching facts carry the section on their own; the reserved
     portrait frames sit under them and the cards replace both the moment real
     profiles exist. Still no "profiles coming soon" banner — a frame that
     names its own photograph says that already, and better. */

  const practice: Array<[string, string]> = [
    [t("p1Label"), t("p1Value")],
    [t("p2Label"), t("p2Value")],
    [t("p3Label"), t("p3Value")],
    [t("p4Label"), t("p4Value")]
  ];

  return (
    <section className="section-compact band-human">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} />
          <Link
            href="/about"
            className="stitch-link mb-1 inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
          >
            {t("more")} <Icon name="arrow" size={16} className="arrow" />
          </Link>
        </div>

        <Reveal className="u-section-body">
          <dl className="spec-grid">
            {practice.map(([label, value]) => (
              <div key={label}>
                <dt className="spec-label">{label}</dt>
                <dd className="spec-value">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* The three reserved portraits. Frames, not people: each says which
            photograph it is waiting for and claims nothing else. */}
        {confirmed.length === 0 ? (
          <div className="trainer-frames">
            <MonoNote as="p">{t("portraitsLabel")}</MonoNote>
            <ul className="trainer-frame-list">
              {portraits.map((portrait, i) => (
                <Reveal as="li" key={portrait.id} delay={i * 60}>
                  <ManifestPhoto id={portrait.id} editorial />
                </Reveal>
              ))}
            </ul>
            <p className="trainer-frame-note">{t("portraitsNote")}</p>
          </div>
        ) : null}

        {confirmed.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {confirmed.map((tr, i) => (
              <Reveal as="li" key={tr.nameEn} delay={i * 80}>
                <article className="card card-lift h-full overflow-hidden">
                  <PhotoSlot
                    label={tr.photoLabel}
                    ratio="4/5"
                    className="card-img media-unveil rounded-none border-0"
                  />
                  <div className="p-6 md:p-8">
                    <h3 className="text-h4 card-title font-display">
                      {gu ? tr.nameGu : tr.nameEn}
                    </h3>
                    <p className="microlabel mt-2 !text-vermilion-deep">
                      {gu ? tr.roleGu : tr.roleEn}
                    </p>
                    <p className="mt-3 text-smallmeta text-stone">
                      {gu ? tr.focusGu : tr.focusEn}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
