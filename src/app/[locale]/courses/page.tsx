import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MachineIndex } from "@/components/courses/MachineIndex";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { coursesByFamily, coursesInFamily, families } from "@/content/courses";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.courses" });
  return pageMeta({ locale, path: "/courses", title: t("title"), description: t("description") });
}

/**
 * The machine floor catalogue.
 *
 * This page used to be eleven cards in a grid, which asks a visitor to compare
 * eleven things on the only axis a card offers — the name. The catalogue now
 * leads with what each technique *produces*, because that is what someone is
 * actually choosing between: bridal zardosi panels, sequin dupattas by the
 * metre, tufted rugs, machine-ready files.
 *
 * Two cues are marked, and both are facts rather than opinions:
 *
 *  - **Flat Embroidery is the foundation.** Underlay, density and stitch
 *    direction are the vocabulary every other machine technique is written in.
 *  - **Zardosi leads.** The owner confirmed it is what most enquiries ask for
 *    (2026-08-29), which is also why it heads `COURSE_DISPLAY_ORDER`.
 *
 * No course carries an invented "beginner" or "advanced" label. Every course
 * here is taught from zero, which is stated once rather than eleven times.
 *
 * The rows are `<MachineIndex>`, the same component the homepage uses, so the
 * two surfaces cannot drift apart in what a course row is allowed to claim:
 * what the technique produces, its family, a duration only where the owner
 * confirmed one, and no fee at all. Photography leads a row where the shoot
 * covers that course; the technique signature leads where it does not, in the
 * same slot at the same size, so the three signature-led courses never read as
 * the leftovers.
 */

/** Facts, not difficulty ratings. See the note above. */
const CUE: Record<string, "foundation" | "leads"> = {
  "flat-embroidery": "foundation",
  "zardosi-machine-embroidery": "leads"
};

/**
 * One branded mark per family. A family is not a technique, so it gets an icon
 * rather than a technique signature — a signature belongs to exactly one
 * course, and borrowing one to head nine would be a small lie about what the
 * mark means.
 */
const FAMILY_ICON: Record<string, IconName> = {
  machine: "machine-head",
  modern: "laser",
  software: "node"
};

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, l] = await Promise.all([
    getTranslations("coursesPage"),
    getTranslations("common"),
    getLocale()
  ]);
  const gu = l === "gu";
  const keys = Object.keys(families) as Array<keyof typeof families>;
  const stages = t.raw("pathway.stages") as Array<{ t: string; d: string }>;

  // One continuous catalogue numbering across all three families, so a
  // visitor can say "number six" and mean the same course we do.
  let counter = 0;

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("intro")}
        actions={
          <>
            <Link href="/admission" className="btn btn-primary">
              {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <Link href="/admissions#batches" className="btn btn-secondary">
              {t("batchesCta")}
            </Link>
          </>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("factsTitle")}</p>
            <ul className="mt-4 space-y-2.5">
              {(t.raw("facts") as string[]).map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Icon name="check" size={16} strokeWidth={2} className="mt-1 shrink-0 text-vermilion-deep" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </>
        }
      />

      {keys.map((key, idx) => {
        const f = families[key];
        const list = coursesInFamily(key);
        const startAt = counter + 1;
        counter += list.length;
        return (
          <section key={key} className={idx % 2 === 1 ? "section bg-ivory-2" : "section"}>
            <div className="container-site">
              <div className="family-head">
                <div className="family-plate family-mark">
                  <Icon name={FAMILY_ICON[key]} size={40} className="text-vermilion-deep" />
                </div>
                <SectionHeading
                  eyebrow={`${String(idx + 1).padStart(2, "0")} · ${t("familyLabel", { count: list.length })}`}
                  title={gu ? f.nameGu : f.nameEn}
                  sub={gu ? f.introGu : f.introEn}
                />
              </div>

              <div className="u-section-body">
                <MachineIndex
                  courses={list}
                  locale={l}
                  startAt={startAt}
                  cues={CUE}
                  renderCue={(cue) => t(`cue.${cue}` as "cue.foundation")}
                />
              </div>
            </div>
          </section>
        );
      })}

      {/* How the families relate: the one thing a list of eleven cannot say. */}
      <section className="section-compact bg-sand">
        <div className="container-site split">
          <div>
            <SectionHeading title={t("relate.h2")} sub={t("relate.line")} />
          </div>
          <Reveal className="surface surface-feature">
            <ol className="stack-lines">
              {(t.raw("relate.points") as Array<{ t: string; d: string }>).map((r) => (
                <li key={r.t}>
                  <p className="font-display text-h4">{r.t}</p>
                  <p className="mt-1.5 text-smallmeta text-stone">{r.d}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="section border-t border-line">
        <div className="container-site split">
          <div>
            <SectionHeading title={t("pathway.h2")} sub={t("pathway.line")} />
          </div>
          <Ledger as="ol">
            {stages.map((s, i) => (
              <LedgerRow
                key={s.t}
                index={String(i + 1).padStart(2, "0")}
                title={s.t}
                note={s.d}
              />
            ))}
          </Ledger>
        </div>
      </section>

      <p className="sr-only">{t("countNote", { count: coursesByFamily.length })}</p>
    </>
  );
}
