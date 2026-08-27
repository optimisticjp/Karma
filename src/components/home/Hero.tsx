import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Icon } from "@/components/ui/Icon";

/**
 * Hero (audit fix): one controlled media canvas, a collage of the three
 * stages connected by the vermilion thread: screen → machine → stitch.
 * Calm text column: one headline, one paragraph, two actions, trust row.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  const proofs = [t("proof1"), t("proof2"), t("proof3")];

  return (
    <section className="bg-grid section-major">
      <div className="container-site grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <p className="eyebrow">{t("eyebrow")}</p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="text-display mt-6 lg:text-display-xl">{t("h1")}</h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="u-lede">{t("sub")}</p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admission" className="btn btn-primary">
                {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
              <Link href="/courses" className="btn btn-secondary">
                {t("secondary")}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <ul className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-smallmeta font-semibold text-stone">
              {proofs.map((p, i) => (
                <li key={p} className="flex items-center gap-5">
                  {i > 0 ? <span aria-hidden="true" className="text-vermilion">•</span> : null}
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden border border-line bg-card sm:aspect-[16/11] lg:aspect-[16/13]">
              {/* connecting thread */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full text-vermilion"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M28 24 C 55 24, 55 50, 72 50 C 88 50, 60 78, 40 78"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.7"
                  strokeDasharray="2.4 1.8"
                />
              </svg>
              <div className="absolute left-[4%] top-[5%] h-[42%] w-[54%] border border-line bg-ivory">
                <PhotoSlot label={t("shot1")} ratio="free" className="rounded-none border-0" />
              </div>
              <div className="absolute right-[4%] top-[28%] z-10 h-[46%] w-[52%] border border-line bg-ivory shadow-sm">
                <PhotoSlot label={t("shot2")} ratio="free" className="rounded-none border-0" />
              </div>
              <div className="absolute bottom-[4%] left-[10%] z-20 h-[38%] w-[55%] border border-line bg-ivory shadow-sm">
                <PhotoSlot label={t("shot3")} ratio="free" className="rounded-none border-0" />
              </div>
            </div>
            {/* Stacked on small phones (Gujarati labels run long and three
                across truncates to nonsense), inline from sm upward. */}
            <figcaption className="mt-4 grid gap-2 text-smallmeta font-bold text-carbon sm:grid-cols-3 sm:gap-3">
              {[t("stage1"), t("stage2"), t("stage3")].map((label, i) => (
                <span key={label} className="flex items-baseline gap-2">
                  <span className="font-display text-vermilion-deep" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <span>{label}</span>
                </span>
              ))}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
