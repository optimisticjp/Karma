import type { ReactNode } from "react";
import { ThreadLine } from "@/components/kds/marks";

/**
 * THE PAGE OPENING — eyebrow, title, lede, actions, and an optional aside.
 *
 * WHY THIS ONE IS SHARED WHEN THE BLOCKS BELOW IT ARE NOT
 * ------------------------------------------------------
 * A page opening genuinely is the same object every time: it names the page,
 * says what it is for, and offers the next step. The variety this site needs
 * lives in the blocks underneath, and using a different shape for each page's
 * FIRST screen would make the site feel unrelated to itself rather than
 * varied. The routes that earn a bespoke opening — the homepage, the
 * catalogue, a course, the notes archive — have one; everything else uses
 * this.
 *
 * The aside is where a page puts what a visitor needs before they act: the
 * confidentiality note on a brief, the studio hours before a visit, what a
 * certificate check will and will not tell you.
 */
export function PageHead({
  eyebrow,
  title,
  lede,
  actions,
  aside,
  ground = "on-paper",
  id = "page-heading"
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  ground?: "on-canvas" | "on-paper" | "on-cloth" | "on-mist";
  id?: string;
}) {
  return (
    <section className={`band-hero ${ground}`} aria-labelledby={id}>
      <div className="wrap">
        <div className={aside ? "split" : undefined}>
          <div className="min-w-0">
            {eyebrow ? <p className="t-micro">{eyebrow}</p> : null}
            <h1 id={id} className="t-h1 mt-3">
              {title}
            </h1>
            {lede ? <p className="t-lede mt-4 max-w-[48ch]">{lede}</p> : null}
            {actions ? (
              <>
                <ThreadLine draw className="my-6 w-28" />
                <div className="flex flex-wrap items-center gap-3">{actions}</div>
              </>
            ) : null}
          </div>
          {aside ? <aside className="courses-aside">{aside}</aside> : null}
        </div>
      </div>
    </section>
  );
}
