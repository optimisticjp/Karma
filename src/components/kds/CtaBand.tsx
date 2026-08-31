import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site, waLink } from "@/lib/site";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * THE CLOSE — one band, reused wherever a page ends on an action.
 *
 * Three actions in a fixed order, because they are three different levels of
 * commitment and the order is the argument: **book the demo** (the thing the
 * studio actually wants), **WhatsApp** (ask first, no commitment), **call**
 * (for someone who would rather talk). Never a form, never a payment link.
 *
 * The copy is a prop rather than a namespace, so each page closes in its own
 * words — a course page and the catalogue are ending different conversations —
 * while the shape, the actions and the phone roles stay identical everywhere.
 *
 * THE PHONE ROLES ARE NOT INTERCHANGEABLE
 * ---------------------------------------
 * The call action dials `site.callPhone`; the WhatsApp action opens
 * `site.whatsapp`. Which number answers which channel has not been confirmed
 * by the owner, so the two are never swapped or merged. See
 * `docs/project-context.md` §37.
 */
export async function CtaBand({
  title,
  sub,
  /** Where the primary action goes. A course page carries its own course. */
  demoHref = "/admission",
  /** The WhatsApp message to prefill. Defaults to the demo enquiry. */
  waText,
  ground = "on-canvas"
}: {
  title: string;
  sub: string;
  demoHref?: string;
  waText?: string;
  ground?: "on-canvas" | "on-paper" | "on-cloth" | "on-mist";
}) {
  const tc = await getTranslations("common");

  return (
    <section className={`band ${ground}`} aria-labelledby="cta-heading">
      <div className="wrap">
        <div className="close-band">
          <ThreadLine />
          <div className="close-inner">
            <div className="min-w-0">
              <h2 id="cta-heading" className="t-h2 max-w-2xl">
                {title}
              </h2>
              <p className="t-lede mt-3 max-w-[46ch]">{sub}</p>
              <div className="close-actions">
                <Link href={demoHref} className="act act-primary">
                  {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
                </Link>
                <a
                  href={waLink(waText ?? tc("waPrefillDemo"))}
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
          </div>
          <ThreadLine />
        </div>
      </div>
    </section>
  );
}
