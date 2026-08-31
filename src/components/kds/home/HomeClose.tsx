import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicFaqs } from "@/lib/content/public";
import { FaqList } from "@/components/site/FaqList";
import { site, waLink } from "@/lib/site";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * The objections, then the close.
 *
 * Five FAQs and one action. Staff-managed published FAQs lead the list and the
 * source FAQs are the fallback, so the answers stay editable without a deploy.
 * `<details>`/`<summary>` keeps it keyboard-operable, searchable by the
 * browser's own find, and working with no JavaScript at all.
 *
 * WHY THE CLOSE IS ONE LINE AND TWO BUTTONS
 * -----------------------------------------
 * By this point a visitor has read the offer, seen the material, watched a
 * file become a stitch, been shown the fee and been told when they can come.
 * There is nothing left to argue. The plan asks for a short CTA and no
 * marketing essay, and the line the studio chose says it in eight words.
 */
export async function HomeClose() {
  const [t, tc, faqs] = await Promise.all([
    getTranslations("home.close"),
    getTranslations("common"),
    getPublicFaqs()
  ]);

  return (
    <section className="band on-canvas" aria-labelledby="close-heading">
      <div className="wrap">
        <div className="close-grid">
          <div>
            <p className="t-micro">{t("faqEyebrow")}</p>
            <h2 id="close-heading" className="t-h2 mt-1.5">
              {t("faqH2")}
            </h2>
            <p className="mt-4">
              <Link href="/admissions" className="act-quiet">
                {t("faqAll")} <Icon name="arrow" size={16} className="arrow" />
              </Link>
            </p>
          </div>
          <div className="min-w-0">
            <FaqList items={faqs.slice(0, 5)} />
          </div>
        </div>

        {/* The close. Bracketed by the same running stitch that has run down
            the whole page, because this is the last knot rather than a new
            idea. */}
        <div className="close-band">
          <ThreadLine />
          <div className="close-inner">
            <div className="min-w-0">
              <h2 className="t-h2 max-w-2xl">{t("h2")}</h2>
              <p className="t-lede mt-3 max-w-[46ch]">{t("sub")}</p>
              <div className="close-actions">
                <Link href="/admission" className="act act-primary">
                  {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
                </Link>
                <a
                  href={waLink(tc("waPrefillDemo"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="act act-secondary"
                >
                  <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
                </a>
                <a href={`tel:+${site.callPhone}`} className="act-quiet">
                  <Icon name="phone" size={16} /> {tc("call")}
                </a>
              </div>
            </div>
            <p className="t-h3 close-signoff">{t("signoff")}</p>
          </div>
          <ThreadLine />
        </div>
      </div>
    </section>
  );
}
