import { useTranslations } from "next-intl";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";

/**
 * Where the courses lead — the one thing a list of eleven cannot say.
 *
 * Four stages on one thread: foundation at the machine, one technique in
 * depth, EMCAD DAHAO design, then production or a unit of your own. It is
 * drawn as a seam rather than as four cards because it is a sequence, and the
 * sequence is the point: the third stage is where an operator becomes a
 * designer, and a visitor who has only ever been offered "a course" has
 * usually never been shown that there is a route.
 *
 * **No timeline, no promise.** There is no "in six months" and no outcome
 * claim attached to any stage — only EMCAD DAHAO has a confirmed duration, and
 * nobody has given this site a verified outcome for anybody.
 */
export function CoursePathway() {
  const t = useTranslations("coursesPage");
  const stages = t.raw("pathway.stages") as Array<{ t: string; d: string }>;

  return (
    <section className="band on-paper" aria-labelledby="pathway-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("pathwayEyebrow")}</p>
            <h2 id="pathway-heading" className="t-h2 mt-1.5">
              {t("pathway.h2")}
            </h2>
            <p className="t-lede mt-3">{t("pathway.line")}</p>
            <p className="t-meta mt-4 max-w-[44ch]">{t("pathwayNote")}</p>
          </div>

          <ol className="pathway" role="list">
            {stages.map((s, i) => (
              <li key={s.t} className="pathway-step">
                <span className="pathway-mark" aria-hidden="true">
                  <NeedlePoint state={i === stages.length - 1 ? "todo" : "done"} />
                  {i < stages.length - 1 ? <ThreadLine vertical className="pathway-thread" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-h4 mt-0.5 block">{s.t}</span>
                  <span className="t-meta mt-1 block">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
