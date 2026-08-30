/**
 * The 32 real photographs, as a typed manifest.
 *
 * The owner's final shoot brief (2026-08-30) specifies exactly 32 images. None
 * of them exist yet. This file is what lets the redesign be built around them
 * *now*, so that when the files arrive they drop into place without a single
 * layout being restructured.
 *
 * WHY A MANIFEST RATHER THAN A LABEL PER COMPONENT
 * ------------------------------------------------
 * The previous system passed a free-text shoot label into `<PhotoSlot>` at each
 * call site. That works until two pages describe the same shot slightly
 * differently, or a slot is built for a 3:2 frame and the photograph arrives
 * 4:5 — at which point the layout moves. Here every slot declares its id,
 * its intrinsic dimensions and therefore its aspect ratio, so:
 *
 *  - the placeholder reserves exactly the space the photograph will occupy,
 *    and swapping in the real file causes NO layout shift (CLS stays 0);
 *  - a slot cannot be used at the wrong ratio by accident;
 *  - `tests/machine-lab-system.test.ts` can assert the set is complete and
 *    that no slot is used twice for different things.
 *
 * THE RULE THAT MATTERS MOST
 * --------------------------
 * A slot with no photograph renders as an honest, named placeholder. It is
 * NEVER filled with stock photography, a generated image, another institute's
 * work, or another course's photograph. A labelled empty frame is a visible
 * work-in-progress; a borrowed photo is a false claim about this business that
 * would outlive the fix.
 */

export type PhotoGroup =
  | "hero"
  | "course"
  | "work"
  | "trainer"
  | "studio"
  | "story"
  | "process"
  | "floor";

export type PhotoSlotSpec = {
  /** Stable id from the owner's brief. Used as the component key. */
  id: string;
  group: PhotoGroup;
  /** Intrinsic pixel dimensions from the brief. The ratio derives from these. */
  width: number;
  height: number;
  /** What the photographer is being asked for, shown on the placeholder. */
  label: string;
  /**
   * Guidance for the alt text once the real file lands. Not the alt text
   * itself — that describes the actual photograph, which nobody has seen yet.
   */
  altGuidance: string;
  /** Course slug, for the eight course stations. */
  courseSlug?: string;
};

/* --------------------------------- hero ---------------------------------- */

const HERO: PhotoSlotSpec[] = [
  {
    id: "H1_EMCAD_SCREEN",
    group: "hero",
    width: 1600,
    height: 1200,
    label: "EMCAD DAHAO screen with a stitch design visible",
    altGuidance: "Name the design on screen and that it is EMCAD DAHAO."
  },
  {
    id: "H2_MACHINE_STITCHING",
    group: "hero",
    width: 1600,
    height: 1200,
    label: "Needle working on fabric — hands may be visible",
    altGuidance: "Name the technique being stitched and the material."
  },
  {
    id: "H3_FINISHED_PIECE",
    group: "hero",
    width: 1600,
    height: 1200,
    label: "Clean finished embroidery — ideally the same project as H1 and H2",
    altGuidance: "Name the finished piece and the technique that produced it."
  }
];

/* -------------------------------- courses -------------------------------- */

/**
 * Eight course stations, and only eight.
 *
 * The catalogue has ELEVEN courses. Flat Embroidery, Appliqué & 3D and Cross
 * Stitch have no photograph in this shoot. They are not dropped and they do not
 * borrow another course's image — their technique signature carries them until
 * the owner supplies a photograph. See `TECHNIQUE_SIGNATURES`.
 */
const COURSES: PhotoSlotSpec[] = [
  ["C1_ZARDOSI", "zardosi-machine-embroidery", "Zardosi machine running metallic work"],
  ["C2_FOUR_BEADS", "four-beads-machine-work", "4-Beads machine attaching beads to a path"],
  ["C3_SEQUENCE", "sequence-work", "Sequence machine laying discs on fabric"],
  ["C4_CODING", "coding-cording-machine", "Coding / cording machine following a curve"],
  ["C5_CHAIN_MULTI", "chain-multi-machine", "Chain / multi-head machine mid-run"],
  ["C6_LASER", "laser-work", "Laser station cutting or etching fabric"],
  ["C7_TUFTING", "tufting", "Tufting gun on a stretched frame"],
  ["C8_EMCAD_STATION", "emcad-embroidery-design", "EMCAD DAHAO workstation with a student designing"]
].map(([id, courseSlug, label]) => ({
  id,
  group: "course" as const,
  width: 1600,
  height: 1200,
  label,
  courseSlug,
  altGuidance: "Name the machine and what it is producing, not the brand of the camera."
}));

/* ------------------------------ student work ----------------------------- */

/**
 * Six pieces at THREE different aspect ratios, deliberately.
 *
 * Normalising these into identical card crops is the single easiest way to
 * make a textile gallery look like a stock grid. A bridal panel is tall, a
 * dupatta is square, a screen-and-result pair is wide — the mixed ratios are
 * the asset, and the layout is built to carry them.
 */
const WORK: PhotoSlotSpec[] = [
  { id: "G1_BRIDAL_ZARDOSI", width: 900, height: 1125, label: "Bridal zardosi panel" },
  { id: "G2_SEQUENCE_DUPATTA", width: 1000, height: 1000, label: "Sequence dupatta" },
  { id: "G3_EMCAD_AND_RESULT", width: 1200, height: 800, label: "EMCAD design beside its finished result" },
  { id: "G4_BEADS_BORDER", width: 900, height: 1125, label: "4-Beads border, close up" },
  { id: "G5_TUFTED_PIECE", width: 1000, height: 1000, label: "Colourful tufted piece" },
  { id: "G6_LASER_APPLIQUE", width: 900, height: 1125, label: "Laser-cut appliqué" }
].map((s) => ({
  ...s,
  group: "work" as const,
  altGuidance: "Name the technique and the garment or product. Student name only with consent."
}));

/* -------------------------------- trainers ------------------------------- */

const TRAINERS: PhotoSlotSpec[] = [
  { id: "T1_MAIN_TRAINER", label: "Main machine trainer at their machine" },
  { id: "T2_EMCAD_TRAINER", label: "EMCAD DAHAO trainer at the workstation" },
  { id: "T3_FOUNDER", label: "Founder on the machine floor" }
].map((s) => ({
  ...s,
  group: "trainer" as const,
  width: 800,
  height: 1000,
  altGuidance: "Name the person and their role — ONLY after written consent is recorded."
}));

/* --------------------------- studio and machines ------------------------- */

const STUDIO: PhotoSlotSpec[] = [
  { id: "A1_MACHINE_FLOOR", width: 1200, height: 1500, label: "Machine floor during a live batch" },
  { id: "A2_ENTRANCE_SIGNBOARD", width: 1200, height: 675, label: "Entrance and signboard" },
  { id: "A3_ZARDOSI_MACHINE", width: 800, height: 800, label: "Zardosi machine, straight on" },
  { id: "A4_BEADS_MACHINE", width: 800, height: 800, label: "4-Beads machine, straight on" },
  { id: "A5_LASER_MACHINE", width: 800, height: 800, label: "Laser machine, straight on" },
  { id: "A6_TUFTING_MACHINE", width: 800, height: 800, label: "Tufting setup, straight on" }
].map((s) => ({
  ...s,
  group: "studio" as const,
  altGuidance: "Describe the machine and the room. Do NOT state a model, head count or capacity."
}));

/* ----------------------------- student stories --------------------------- */

const STORIES: PhotoSlotSpec[] = [
  { id: "S1_STUDENT_STORY", label: "Student story portrait, at their machine" },
  { id: "S2_STUDENT_STORY", label: "Student story portrait, at their machine" }
].map((s) => ({
  ...s,
  group: "story" as const,
  width: 800,
  height: 1000,
  altGuidance: "Name the person and what they now do — ONLY with written consent."
}));

/* ----------------------- the screen-to-stitch triptych -------------------- */

/**
 * The signature interaction's media. All three MUST be the same project: the
 * whole point is that a visitor watches one design travel from a screen,
 * through a machine, onto fabric. Three unrelated photographs would say
 * "we have a screen, a machine and some embroidery" — which is not the claim.
 */
const PROCESS: PhotoSlotSpec[] = [
  { id: "P1_DESIGN", label: "The design in EMCAD DAHAO" },
  { id: "P2_MACHINE", label: "The same design stitching on the machine" },
  { id: "P3_RESULT", label: "The same design finished on fabric" }
].map((s) => ({
  ...s,
  group: "process" as const,
  width: 1200,
  height: 675,
  altGuidance: "Say which stage of the same project this is: design, machine, or result."
}));

const FLOOR: PhotoSlotSpec[] = [
  {
    id: "F1_STUDIO_FLOOR_WIDE",
    group: "floor",
    width: 1280,
    height: 720,
    label: "Studio floor, wide",
    altGuidance: "Describe the room and the work happening in it."
  }
];

export const PHOTO_MANIFEST: PhotoSlotSpec[] = [
  ...HERO,
  ...COURSES,
  ...WORK,
  ...TRAINERS,
  ...STUDIO,
  ...STORIES,
  ...PROCESS,
  ...FLOOR
];

/** The brief says 32. If this number moves, the brief moved — check with the owner. */
export const PHOTO_COUNT = 32;

const BY_ID = new Map(PHOTO_MANIFEST.map((slot) => [slot.id, slot]));

export function photoSlot(id: string): PhotoSlotSpec {
  const slot = BY_ID.get(id);
  /* Loud rather than silent: a typo would otherwise render a frame with no
     label and no reserved space, which is exactly the layout shift this
     manifest exists to prevent. */
  if (!slot) throw new Error(`photo-manifest: unknown slot "${id}"`);
  return slot;
}

export function photosInGroup(group: PhotoGroup): PhotoSlotSpec[] {
  return PHOTO_MANIFEST.filter((slot) => slot.group === group);
}

/** The course slugs that have a photograph in this shoot. Exactly eight. */
export const PHOTOGRAPHED_COURSE_SLUGS: string[] = COURSES.map((c) => c.courseSlug!).sort();

export function coursePhotoFor(slug: string): PhotoSlotSpec | undefined {
  return COURSES.find((c) => c.courseSlug === slug);
}

/** `width/height` as a CSS aspect-ratio string, e.g. "1600 / 1200". */
export function aspectOf(slot: PhotoSlotSpec): string {
  return `${slot.width} / ${slot.height}`;
}
