import { ownerProvidedFacts } from "@/lib/site";

/**
 * THE PROOF REGISTRY — one typed source for everything the site claims about
 * itself that is not an operational fact.
 *
 * WHY THIS EXISTS
 * ---------------
 * The owner would rather review a trust-rich preview with clearly managed
 * sample content than a cautious site that looks unfinished
 * (`docs/karma-creative-freedom-trust-proof-addendum.md` §§6–9, §27). So the
 * site ships complete review, testimonial, story, trainer, partner and social
 * modules on the Workers.dev preview, populated from here.
 *
 * That is only safe if three things are true, and this file is what makes them
 * true:
 *
 *  1. **Every item declares what it is.** `status` is the whole point.
 *  2. **Nothing is scattered through JSX.** A sample name typed into a
 *     component is invisible to the replacement audit and will survive to
 *     launch. Everything is here.
 *  3. **Sample proof cannot reach structured data.** `verifiedOnly()` is the
 *     only door to schema, and `tests/kds-proof-firewall.test.ts` fails the
 *     build if a JSON-LD builder reads anything else.
 *
 * THE THREE STATES
 * ----------------
 * `sample`         Written for the preview. Fictional. Visibly marked on
 *                  screen, excluded from schema, and listed by the pre-launch
 *                  gate so it cannot quietly become a fact.
 * `owner_provided` A real figure the owner supplied that nobody has
 *                  independently checked — the follower counts, the Google
 *                  rating. Publishable as the studio's own statement,
 *                  attributed, and still outside rating schema.
 * `verified`       Confirmed in writing and independently checkable. Only
 *                  these may enter structured data.
 *
 * Today the ONLY `verified` entries are three operational facts — eleven
 * techniques, live machine practical, the two-day demo — every one of which
 * is checkable against `src/content/course-operations.ts` and the catalogue.
 * No review, story, trainer or partner is verified yet, and that is the
 * honest state rather than a gap: nothing has been through the confirmation
 * gate. `remainingSampleProof()` is what the launch checklist calls to list
 * what still has to be replaced.
 *
 * WHAT IS NOT HERE
 * ----------------
 * Operational facts — EMCAD DAHAO's duration, fee, timetable and demo — are
 * verified business data and live in `src/content/course-operations.ts`. They
 * are not proof and must never be given a `sample` sibling.
 *
 * The older sample arrays in `src/content/collections.ts` (`sampleReviews`,
 * `stories`, `trainers`) still serve the pages that have not yet been rebuilt.
 * Each rebuild phase moves its page onto this registry; the old arrays are
 * deleted once nothing reads them. Until then, `collections.ts` carries a
 * pointer here so nobody adds a twelfth sample review to the wrong file.
 */

export type ProofStatus = "sample" | "owner_provided" | "verified";

export type ProofKind =
  | "review"
  | "testimonial"
  | "story"
  | "trainer"
  | "partner"
  | "social"
  | "rating"
  | "stat";

type Base = {
  /** Stable id. Used as a React key and as the handle in the launch audit. */
  id: string;
  kind: ProofKind;
  status: ProofStatus;
  /**
   * What has to happen for this to become `verified`. Written for the person
   * doing the replacement round, not for a visitor.
   */
  replaceWith?: string;
};

/** A short public review, as a visitor would meet one on a listing. */
export type Review = Base & {
  kind: "review";
  author: string;
  /** Where the review was left. Never rendered as a platform endorsement. */
  source: "google" | "walk-in" | "whatsapp";
  /** 1–5. Never aggregated into schema while any review here is not verified. */
  rating: number;
  textEn: string;
  textGu: string;
  /** Course slug, where the reviewer names one. */
  courseSlug?: string;
};

/** A longer quote, paired with media. The featured-review treatment. */
export type Testimonial = Base & {
  kind: "testimonial";
  author: string;
  roleEn: string;
  roleGu: string;
  quoteEn: string;
  quoteGu: string;
  /** A slot id from the 32-shot manifest, where a photograph is planned. */
  photoId?: string;
  courseSlug?: string;
};

/** BEFORE → LEARNED → NOW. The stitched journey. */
export type Story = Base & {
  kind: "story";
  name: string;
  beforeEn: string;
  beforeGu: string;
  learnedEn: string;
  learnedGu: string;
  nowEn: string;
  nowGu: string;
  photoId?: string;
  courseSlug?: string;
};

/** Someone who teaches. */
export type Trainer = Base & {
  kind: "trainer";
  name: string;
  roleEn: string;
  roleGu: string;
  /** What they actually teach. Never a year count, never a credential. */
  focusEn: string;
  focusGu: string;
  photoId?: string;
};

/**
 * A trusted-by mark.
 *
 * Fictional placeholders are explicitly allowed during preview (addendum §9),
 * and the two hard rules are: never reproduce a real company's logo without
 * evidence of a relationship, and never imply a real brand endorses Karma.
 * These are invented Surat-shaped names, drawn as stitched garment labels
 * rather than as grey SaaS logos, and each is trivially replaceable by a real
 * SVG when one arrives.
 */
export type Partner = Base & {
  kind: "partner";
  name: string;
  /** The kind of business, which is the honest part of the claim. */
  typeEn: string;
  typeGu: string;
};

/** A social channel and its size. */
export type Social = Base & {
  kind: "social";
  platform: "instagram" | "facebook" | "youtube";
  handle: string;
  url: string;
  /** As the owner supplied it — a string, because "39K+" is not a number. */
  followers: string;
};

/** A star rating with its source. */
export type Rating = Base & {
  kind: "rating";
  source: "google";
  value: string;
  /**
   * Review COUNT. Deliberately optional and deliberately absent: an
   * `AggregateRating` needs a count, and publishing one nobody has checked is
   * how a business ends up with a fabricated rich result. See the firewall.
   */
  count?: number;
  url?: string;
};

/** A number worth showing. */
export type Stat = Base & {
  kind: "stat";
  value: string;
  labelEn: string;
  labelGu: string;
};

export type ProofItem = Review | Testimonial | Story | Trainer | Partner | Social | Rating | Stat;

/* ------------------------------------------------------------------ *
 * The registry
 * ------------------------------------------------------------------ */

const REVIEWS: Review[] = [
  {
    id: "rv-anjali",
    kind: "review",
    status: "sample",
    replaceWith: "A real Google review, with the reviewer's consent to reuse it on the site.",
    author: "Anjali P.",
    source: "google",
    rating: 5,
    courseSlug: "emcad-embroidery-design",
    textEn:
      "I came in knowing nothing about design software. By the end I was making my own files and running them on the machine the same day. The trainer sits with you until the sample comes out right.",
    textGu:
      "હું design software વિશે કંઈ જ જાણતી નહોતી. છેલ્લે હું મારી પોતાની file બનાવીને એ જ દિવસે machine પર ચલાવતી હતી. Sample બરાબર ન આવે ત્યાં સુધી trainer સાથે બેસે છે."
  },
  {
    id: "rv-hitesh",
    kind: "review",
    status: "sample",
    replaceWith: "A real review from a working operator.",
    author: "Hitesh V.",
    source: "google",
    rating: 5,
    textEn:
      "I already run a machine at a unit in Katargam. I joined to fix the puckering I could not solve. They showed me it was the file, not the machine. Worth it for that alone.",
    textGu:
      "હું Katargam ના unit માં machine ચલાવું છું. જે puckering હલ નહોતું થતું એ માટે જોડાયો. એમણે બતાવ્યું કે વાંક machine નો નહીં, file નો હતો. એટલા માટે જ ફાયદો થયો."
  },
  {
    id: "rv-priyanka",
    kind: "review",
    status: "sample",
    replaceWith: "A real review that mentions the free demo.",
    author: "Priyanka M.",
    source: "walk-in",
    rating: 5,
    textEn:
      "The two demo days were genuinely free and nobody pushed me to pay on the spot. I decided after I had actually sat at the machine.",
    textGu:
      "બે demo દિવસ ખરેખર free હતા અને કોઈએ તરત પૈસા ભરવાનું દબાણ ન કર્યું. Machine પર બેસ્યા પછી જ મેં નક્કી કર્યું."
  },
  {
    id: "rv-rekha",
    kind: "review",
    status: "sample",
    replaceWith: "A real review from a boutique owner.",
    author: "Rekha S.",
    source: "google",
    rating: 4,
    courseSlug: "sequence-work",
    textEn:
      "Learned sequence work here for my own boutique. Small room, real machines, and they let you keep practising until your hand is steady.",
    textGu:
      "મારા boutique માટે અહીં sequence work શીખી. જગ્યા નાની છે, machine સાચી છે, અને હાથ બેસી ન જાય ત્યાં સુધી practice કરવા દે છે."
  },
  {
    id: "rv-farhan",
    kind: "review",
    status: "sample",
    replaceWith: "A real review that mentions Gujarati/Hindi teaching.",
    author: "Farhan Q.",
    source: "whatsapp",
    rating: 5,
    textEn:
      "Everything is taught in Gujarati and Hindi, which made a real difference to me. The English words that matter — the software terms — they teach you those properly.",
    textGu:
      "બધું ગુજરાતી અને હિન્દીમાં શીખવે છે, જે મારા માટે મોટો ફરક હતો. જે English શબ્દો જરૂરી છે — software ના terms — એ બરાબર શીખવે છે."
  },
  {
    id: "rv-mitesh",
    kind: "review",
    status: "sample",
    replaceWith: "A real review from a job-work customer.",
    author: "Mitesh D.",
    source: "google",
    rating: 5,
    textEn:
      "Gave them a digitising job for a saree border. File came back clean and it stitched first time. Now I send them the difficult ones.",
    textGu:
      "સાડીની border માટે digitising નું કામ આપ્યું. File સાફ આવી અને પહેલી જ વારમાં સરસ stitch થઈ. હવે અઘરા કામ એમને જ મોકલું છું."
  }
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: "ts-featured",
    kind: "testimonial",
    status: "sample",
    replaceWith:
      "A real student quote with written consent, photographed at their machine (slot S1).",
    author: "Kajal T.",
    roleEn: "Finished the EMCAD DAHAO course",
    roleGu: "EMCAD DAHAO course પૂરો કર્યો",
    courseSlug: "emcad-embroidery-design",
    photoId: "S1_STUDENT_STORY",
    quoteEn:
      "I thought design meant drawing. Here it meant deciding what the needle does next — the order, the direction, the density. The first time my own file came off the machine clean, that was the day it made sense.",
    quoteGu:
      "મને લાગતું હતું કે design એટલે દોરવું. અહીં એનો અર્થ હતો — needle પછી શું કરશે એ નક્કી કરવું: order, direction, density. જે દિવસે મારી પોતાની file machine પરથી સાફ ઊતરી, એ દિવસે સમજાયું."
  },
  {
    id: "ts-operator",
    kind: "testimonial",
    status: "sample",
    replaceWith: "A real quote from a working operator, with consent.",
    author: "Sanjay B.",
    roleEn: "Machine operator, Mota Varachha",
    roleGu: "Machine operator, મોટા વરાછા",
    photoId: "S2_STUDENT_STORY",
    quoteEn:
      "Eleven years on the machine and nobody had ever shown me why a fill gaps. Turns out I had been fixing it at the machine when it needed fixing in the file.",
    quoteGu:
      "અગિયાર વર્ષથી machine પર છું અને fill કેમ ગેપ પડે એ કોઈએ સમજાવ્યું નહોતું. ખબર પડી કે હું machine પર સુધારતો હતો, જ્યારે સુધારો file માં કરવાનો હતો."
  }
];

const STORIES: Story[] = [
  {
    id: "st-1",
    kind: "story",
    status: "sample",
    replaceWith: "A real student journey with written consent for each stage.",
    name: "Nisha",
    courseSlug: "emcad-embroidery-design",
    photoId: "S1_STUDENT_STORY",
    beforeEn: "Stitching at home on a domestic machine, copying designs by eye.",
    beforeGu: "ઘરે domestic machine પર, નજરથી design ઉતારીને કામ કરતી હતી.",
    learnedEn: "EMCAD DAHAO digitising, stitch order, underlay, and how to read a failed sample.",
    learnedGu: "EMCAD DAHAO digitising, stitch order, underlay, અને બગડેલો sample કેમ વાંચવો.",
    nowEn: "Makes her own files and takes small border jobs for two local boutiques.",
    nowGu: "પોતાની file બનાવે છે અને બે local boutique માટે નાના border ના કામ લે છે."
  },
  {
    id: "st-2",
    kind: "story",
    status: "sample",
    replaceWith: "A real student journey with written consent for each stage.",
    name: "Imran",
    courseSlug: "zardosi-machine-embroidery",
    photoId: "S2_STUDENT_STORY",
    beforeEn: "Helper at a job-work unit, loading frames and cutting thread.",
    beforeGu: "Job-work unit માં helper — frame ચડાવવા અને દોરો કાપવાનું કામ.",
    learnedEn: "Zardosi setup, tension, and running a full panel without supervision.",
    learnedGu: "Zardosi નું setup, tension, અને દેખરેખ વગર આખું panel ચલાવવું.",
    nowEn: "Runs a zardosi machine on his own shift at the same unit.",
    nowGu: "એ જ unit માં પોતાની shift માં zardosi machine ચલાવે છે."
  }
];

const TRAINERS: Trainer[] = [
  {
    id: "tr-machine",
    kind: "trainer",
    status: "sample",
    replaceWith: "The real trainer's name and focus, confirmed by the owner (⚠ checklist Q3).",
    name: "Machine floor trainer",
    roleEn: "Machine techniques",
    roleGu: "Machine techniques",
    focusEn: "Zardosi, 4-beads, sequence and cording, taught at the machine.",
    focusGu: "Zardosi, 4-beads, sequence અને cording — machine પર જ શીખવે છે.",
    photoId: "T1_MAIN_TRAINER"
  },
  {
    id: "tr-emcad",
    kind: "trainer",
    status: "sample",
    replaceWith: "The real trainer's name and focus, confirmed by the owner (⚠ checklist Q3).",
    name: "EMCAD DAHAO trainer",
    roleEn: "Design software",
    roleGu: "Design software",
    focusEn: "Digitising, stitch order, underlay and correcting a file after a test run.",
    focusGu: "Digitising, stitch order, underlay અને test run પછી file સુધારવી.",
    photoId: "T2_EMCAD_TRAINER"
  },
  {
    id: "tr-founder",
    kind: "trainer",
    status: "sample",
    replaceWith: "The founder's name and their own account of starting the studio.",
    name: "Founder",
    roleEn: "Karma Design Studio & Classes",
    roleGu: "Karma Design Studio & Classes",
    focusEn: "Runs the studio floor and the commercial design work.",
    focusGu: "Studio floor અને commercial design નું કામ સંભાળે છે.",
    photoId: "T3_FOUNDER"
  }
];

const PARTNERS: Partner[] = [
  { id: "pt-1", kind: "partner", status: "sample", name: "Varachha Textile Co.", typeEn: "Garment unit", typeGu: "Garment unit", replaceWith: "A real client, with permission to name them." },
  { id: "pt-2", kind: "partner", status: "sample", name: "Anmol Boutique", typeEn: "Boutique", typeGu: "Boutique", replaceWith: "A real client, with permission to name them." },
  { id: "pt-3", kind: "partner", status: "sample", name: "Surat Saree House", typeEn: "Saree wholesaler", typeGu: "Saree wholesaler", replaceWith: "A real client, with permission to name them." },
  { id: "pt-4", kind: "partner", status: "sample", name: "Meera Bridal", typeEn: "Bridal studio", typeGu: "Bridal studio", replaceWith: "A real client, with permission to name them." },
  { id: "pt-5", kind: "partner", status: "sample", name: "Kapadia Embroidery", typeEn: "Embroidery unit", typeGu: "Embroidery unit", replaceWith: "A real client, with permission to name them." },
  { id: "pt-6", kind: "partner", status: "sample", name: "Nova Apparel", typeEn: "Apparel brand", typeGu: "Apparel brand", replaceWith: "A real client, with permission to name them." }
];

/**
 * The social figures. `owner_provided`, not `sample` and not `verified`: these
 * are real numbers the studio supplied and nobody has independently counted.
 * They are publishable as the studio's own statement and stay out of schema.
 */
const SOCIAL: Social[] = [
  {
    id: "so-instagram",
    kind: "social",
    status: "owner_provided",
    platform: "instagram",
    handle: "@karmadesignstudio",
    url: "https://www.instagram.com/karma_design_studio_classes/",
    followers: ownerProvidedFacts.instagramFollowers,
    replaceWith: "Refresh from the live profile before launch; it only ever grows stale."
  },
  {
    id: "so-facebook",
    kind: "social",
    status: "owner_provided",
    platform: "facebook",
    handle: "Karma Design Studio",
    url: "https://www.facebook.com/karmadesignstudioclasses/",
    followers: ownerProvidedFacts.facebookFollowers,
    replaceWith: "Refresh from the live page before launch."
  }
];

const RATINGS: Rating[] = [
  {
    id: "rt-google",
    kind: "rating",
    status: "owner_provided",
    source: "google",
    value: ownerProvidedFacts.googleRating,
    /* `count` is deliberately absent. An AggregateRating needs one, and the
       figure circulating online is a JustDial aggregate nobody could verify.
       Publishing a review count nobody has checked is exactly how a business
       ends up with a fabricated rich result. */
    replaceWith:
      "The real Google rating AND review count, read from the Business Profile, before any rating schema is emitted."
  }
];

const STATS: Stat[] = [
  {
    id: "sx-techniques",
    kind: "stat",
    status: "verified",
    value: "11",
    labelEn: "techniques taught",
    labelGu: "techniques શીખવાય છે"
  },
  {
    id: "sx-practical",
    kind: "stat",
    status: "verified",
    value: "100%",
    labelEn: "live machine practical",
    labelGu: "લાઇવ machine practical"
  },
  {
    id: "sx-demo",
    kind: "stat",
    status: "verified",
    value: "2 days",
    labelEn: "free demo, EMCAD DAHAO",
    labelGu: "ફ્રી ડેમો, EMCAD DAHAO"
  }
];

/**
 * Everything, in one array.
 *
 * The pre-launch gate walks THIS, so a proof item that is not in it is a proof
 * item nobody will audit.
 */
export const PROOF: ProofItem[] = [
  ...REVIEWS,
  ...TESTIMONIALS,
  ...STORIES,
  ...TRAINERS,
  ...PARTNERS,
  ...SOCIAL,
  ...RATINGS,
  ...STATS
];

/* ------------------------------------------------------------------ *
 * Reading the registry
 * ------------------------------------------------------------------ */

export const reviews = REVIEWS;
export const testimonials = TESTIMONIALS;
export const stories = STORIES;
export const trainers = TRAINERS;
export const partners = PARTNERS;
export const socialChannels = SOCIAL;
export const googleRating = RATINGS[0];
export const stats = STATS;

/** True when an item must carry a visible preview marker. */
export function isSample(item: { status: ProofStatus }): boolean {
  return item.status === "sample";
}

/**
 * THE FIREWALL.
 *
 * The only supported way to get proof into structured data. Anything that is
 * not independently confirmed is filtered out here rather than at each schema
 * builder, because a firewall with two doors is not a firewall.
 *
 * `tests/kds-proof-firewall.test.ts` asserts that `src/lib/schema.ts` reaches
 * the registry through this function and no other, and that it emits no
 * `Review`, `AggregateRating` or `Person` while any contributing item is
 * unverified.
 */
export function verifiedOnly<T extends ProofItem>(items: T[]): T[] {
  return items.filter((i) => i.status === "verified");
}

/**
 * What the pre-launch gate reports (addendum §24).
 *
 * Every item that is not `verified`, with the instruction for replacing it.
 * The launch checklist runs this and refuses to sign off while anything
 * unexpected is still on the list.
 */
export function remainingSampleProof(): Array<{
  id: string;
  kind: ProofKind;
  status: ProofStatus;
  replaceWith: string;
}> {
  return PROOF.filter((i) => i.status !== "verified").map((i) => ({
    id: i.id,
    kind: i.kind,
    status: i.status,
    replaceWith: i.replaceWith ?? "⚠ No replacement instruction recorded."
  }));
}
