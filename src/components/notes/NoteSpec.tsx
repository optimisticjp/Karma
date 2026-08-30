import { MonoNote, StepIndex } from "@/components/ui/MonoNote";
import { RegistrationPoint } from "@/components/ui/StitchMark";
import { cn } from "@/lib/utils";

/**
 * The Machine Note header block — the archive's technical notation.
 *
 *     MACHINE NOTE / 06
 *     SEQUENCE WORK
 *     Why does sequence work go out of registration?
 *     ──────────────────────────────────────────────
 *     ISSUE    Registration
 *
 * This is the one place on the site where the technical-archive language runs
 * at full strength. That is deliberate and it is also the limit: if the whole
 * site looked like this, the notation would stop meaning "this is a technical
 * record" and start meaning "this is how the brand decorates". A note is a
 * record; a course page is not.
 *
 * WHAT THE NOTATION IS ALLOWED TO CARRY
 * -------------------------------------
 * A note index, the technique, and the fault the note is about. Every one of
 * those is a real field. There is no measurement here, no RPM, no density
 * figure, no stitch count — the archive earns its authority by being right
 * about causes, not by printing numbers nobody supplied.
 *
 * The registration mark beside the ISSUE row means what it means everywhere
 * else: precision / reference. It is on the note header and nowhere else on
 * the page.
 */
export function NoteSpec({
  index,
  technique,
  issueLabel,
  issue,
  className
}: {
  /** Position in the archive, 1-based. */
  index: number;
  /** The technique this note belongs to. */
  technique?: string;
  issueLabel: string;
  issue: string;
  className?: string;
}) {
  return (
    <div className={cn("note-spec", className)}>
      <p className="note-spec-id">
        <MonoNote>Machine note</MonoNote>
        <span aria-hidden="true" className="note-spec-slash">
          /
        </span>
        <StepIndex n={index} />
      </p>
      {technique ? <MonoNote as="p" className="note-spec-technique">{technique}</MonoNote> : null}
      <div className="note-spec-rule" aria-hidden="true" />
      <dl className="note-spec-row">
        <dt>
          <RegistrationPoint size={14} tone="vermilion" className="note-spec-mark" />
          <MonoNote>{issueLabel}</MonoNote>
        </dt>
        <dd className="note-spec-issue">{issue}</dd>
      </dl>
    </div>
  );
}
