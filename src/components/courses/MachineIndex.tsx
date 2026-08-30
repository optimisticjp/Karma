import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { MonoNote, StepIndex } from "@/components/ui/MonoNote";
import { ManifestPhoto } from "@/components/ui/PhotoSlot";
import { TechniqueSignature } from "@/components/ui/TechniqueSignature";
import { coursePhotoFor } from "@/content/photo-manifest";
import { families, type Course } from "@/content/courses";
import { verifiedOperationsFor } from "@/content/course-operations";

/**
 * The Machine Index — the catalogue as a workshop list, not a prospectus.
 *
 * WHY A LEDGER AND NOT ELEVEN CARDS
 * ---------------------------------
 * Eleven cards is the generic answer and gives a visitor eleven decisions with
 * no information to make them on. Three family columns looked balanced in the
 * abstract and is not: the split is 9 / 2 / 1, so machine work ran nine rows
 * deep beside two columns of white space.
 *
 * A dense index scans in one pass at 320px, scales past eleven courses without
 * a redesign, and puts the one thing that actually decides a course — what the
 * technique physically produces — on the row itself.
 *
 * PHOTOGRAPH LEADS WHERE THERE IS ONE, SIGNATURE WHERE THERE IS NOT
 * -----------------------------------------------------------------
 * The owner's shoot covers eight of the eleven courses. The other three are
 * not second-class rows and must not be quietly dropped or given a borrowed
 * photograph: they lead with their technique signature, which describes the
 * structure of the stitch. The layout is identical either way, so when the
 * eight photographs land nothing about this component changes.
 *
 * WHAT A ROW MAY CLAIM
 * --------------------
 * The produces line is trade knowledge about the technique, true regardless of
 * where you learn it. A duration appears ONLY where the owner has confirmed
 * one — today that is EMCAD DAHAO alone — because a duration next to ten other
 * rows reads as true of all of them. No fee appears here at all: fees are
 * discussed offline, and the one verified fee plan has its own block.
 */
export function MachineIndex({
  courses,
  locale,
  /** Where the row's index starts. The homepage teaser and /courses agree. */
  startAt = 1,
  /**
   * Optional per-course cue, keyed by slug. These are FACTS the owner
   * confirmed — which course most enquiries ask for, which one the others are
   * written in the vocabulary of — never an invented difficulty rating. No
   * course carries a "beginner" or "advanced" label, because every course here
   * is taught from zero.
   */
  cues,
  renderCue
}: {
  courses: Course[];
  locale: string;
  startAt?: number;
  cues?: Record<string, string>;
  renderCue?: (key: string) => string;
}) {
  const gu = locale === "gu";

  return (
    <ol className="machine-index">
      {courses.map((course, i) => {
        const photo = coursePhotoFor(course.slug);
        const verified = verifiedOperationsFor(course.slug);

        return (
          <li key={course.slug} className="mi-row">
            <Link href={`/courses/${course.slug}`} className="mi-link">
              <StepIndex n={startAt + i} className="mi-index" />

              <span className="mi-media">
                {photo ? (
                  <ManifestPhoto id={photo.id} compact editorial className="mi-photo" />
                ) : (
                  <TechniqueSignature slug={course.slug} className="mi-signature" />
                )}
              </span>

              <span className="mi-body">
                <span className="mi-name">
                  {gu ? course.nameGu : course.nameEn}
                  {cues?.[course.slug] && renderCue ? (
                    <span className={`course-cue course-cue--${cues[course.slug]}`}>
                      {renderCue(cues[course.slug])}
                    </span>
                  ) : null}
                </span>
                <span className="mi-produces">
                  {gu ? course.production.producesGu : course.production.producesEn}
                </span>
              </span>

              <span className="mi-meta">
                <MonoNote className="mi-family">
                  {gu ? families[course.family].nameGu : families[course.family].nameEn}
                </MonoNote>
                {verified?.durationMonths ? (
                  <MonoNote className="mi-duration">
                    {gu
                      ? `${verified.durationMonths} મહિના`
                      : `${verified.durationMonths} months`}
                  </MonoNote>
                ) : null}
                <MonoNote className="mi-practical" tone="vermilion">
                  {gu ? "લાઇવ પ્રેક્ટિકલ" : "Live practical"}
                </MonoNote>
              </span>

              <Icon name="arrow" size={18} className="mi-arrow arrow" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
