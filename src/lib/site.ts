/**
 * Single source of truth for business facts.
 *
 * Facts below marked "verified" are corroborated by at least two of: the
 * studio's own Google Business pin, karmadesignstudio.in, the studio's social
 * profiles, and its JustDial listing.
 *
 * ⚠️ IMPORTANT — karmadesignstudio.in is an unedited ValidTheme template.
 * Its contact page still lists `support@validtheme.com`, its About page places
 * the studio in *Vadodara*, and its events are Lorem Ipsum set in New York and
 * Paris. Every name, testimonial, rating and statistic on that site is
 * template filler and must NOT be treated as a source. Only the contact
 * details, social links and address below survived cross-checking.
 *
 * Remaining ⚠️ CONFIRM-WITH-OWNER items are tracked in docs/content-checklist.md.
 */
export const site = {
  name: "Karma Design Studio",
  /** Verified: the Google Business listing and the Facebook page both use "& Classes". */
  legalName: "Karma Design Studio & Classes",
  descriptorEn: "Embroidery Academy & Design Lab",
  descriptorGu: "એમ્બ્રોઇડરી એકેડેમી અને ડિઝાઇન લેબ",
  tagline: "Skill શીખો, Future બનાવો",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://karmadesignstudio.in",

  /**
   * ⚠️ TWO NUMBERS, TWO ROLES, NOT YET RECONCILED.
   *
   * `whatsapp` is the number the studio publishes for WhatsApp and has been
   * in this repo since the start. `callPhone` is the number the owner listed
   * on the studio's Facebook page and supplied directly in
   * `docs/screen-to-stitch-progress.md`.
   *
   * The owner has NOT confirmed which number answers what, so the two roles
   * are kept apart rather than merged:
   *
   *  - a "Call for demo" action dials `callPhone`;
   *  - a WhatsApp action opens `whatsapp`, and `callPhone` is never labelled
   *    as WhatsApp anywhere;
   *  - pages that list contact details show both, each labelled with the
   *    channel it is for, so nothing on the site contradicts anything else.
   *
   * Tracked in docs/content-checklist.md. Collapse to one number only when
   * the owner says which is which.
   */
  whatsapp: process.env.STUDIO_WHATSAPP ?? "919904376340",
  phoneDisplay: "+91 99043 76340",
  callPhone: process.env.STUDIO_CALL_PHONE ?? "918160517429",
  callPhoneDisplay: "+91 81605 17429",
  /** Verified: `tel:+912614521383` on the studio's own site header and contact page. */
  landline: "912614521383",
  landlineDisplay: "+91 261 4521383",

  email: process.env.STUDIO_EMAIL ?? "karmadesignclasses@gmail.com",

  /**
   * Verified: identical on the studio's Google pin, its own website and its
   * JustDial listing. This settles the earlier Middle Point vs Sumeru City
   * Mall ambiguity — Middle Point is correct.
   */
  addressEn: "302, Middle Point, Maruti Nandan Society, Mahadev Chowk, Mota Varachha, Surat, Gujarat 394101",
  addressGu: "૩૦૨, મિડલ પોઇન્ટ, મારુતિ નંદન સોસાયટી, મહાદેવ ચોક, મોટા વરાછા, સુરત, ગુજરાત 394101",

  /**
   * How people in Mota Varachha actually navigate. A PIN code does not get a
   * first-time visitor to the right door; "near Dhara Arcade" does.
   * Verified: Dhara Arcade from the Google pin, Krishna Township Road from the
   * JustDial listing.
   */
  landmarkEn: "Near Dhara Arcade, opposite Krishna Township Road",
  landmarkGu: "ધારા આર્કેડ પાસે, કૃષ્ણા ટાઉનશિપ રોડની સામે",

  hoursEn: "Open daily · Evening batches till 10:30 pm",
  hoursGu: "રોજ ખુલ્લું · સાંજની બેચ 10:30 સુધી",

  /**
   * The studio's actual Google Business pin, not a name search. `ftid` is the
   * feature id from the owner's own shared map link, so this opens the right
   * place rather than whatever a text query happens to match.
   */
  mapsUrl:
    "https://www.google.com/maps/place/?q=place_id:&ftid=0x3be04f25bcf75119:0xcf7a260c325f9fda",

  socials: {
    instagram: "https://www.instagram.com/karma_designstudio/",
    youtube: "https://youtube.com/@karma_design_studio",
    /** Verified: both of the studio's share links resolve to page id 61573902494333. */
    facebook: "https://www.facebook.com/profile.php?id=61573902494333",
    threads: "https://www.threads.com/@karma_designstudio"
  },
  youtubeChannelId: "UC1pOkjwa3hotcYKe35RLxaw",
  // ⚠️ CONFIRM-WITH-OWNER: Mota Varachha approximation. The owner's shared pin
  // does not expose coordinates; `mapsUrl` above is exact, so the map button is
  // correct regardless. Refine only from a reading taken at the studio door.
  geo: { lat: 21.2379, lng: 72.8877 }
} as const;

/**
 * Owner-provided trust facts.
 *
 * These come from the owner directly, in `docs/screen-to-stitch-progress.md`:
 * "These follower counts and rating may be used as owner-provided trust
 * content during this pre-domain visual-development stage. Do **not** claim
 * they were independently verified if they were not."
 *
 * So they are a third category, sitting between `verifiedFacts` (corroborated
 * by two independent sources) and sample content (invented for prototyping).
 * The rules that follow from that:
 *
 *  - They may be shown, rounded, in the trust rail.
 *  - The UI must attribute them to their source (Google, Instagram, Facebook)
 *    rather than presenting them as Karma's own audited claims.
 *  - **The 4.8 rating must never enter `AggregateRating` structured data.**
 *    Schema.org ratings assert a review count and a verified aggregate; we
 *    have neither, and emitting one would be a fabricated rich result.
 *  - Counts are stated as "39K+" / "10K+", never as a precise 39,300.
 */
export const ownerProvidedFacts = {
  googleRating: "4.8",
  instagramFollowers: "39K+",
  facebookFollowers: "10K+"
} as const;

/**
 * Public numeric claims stay OFF until the owner verifies each one
 * (docs/content-checklist.md Q9). Flip to true only with written confirmation.
 *
 * Note: "500+ students trained" and a 4.8 rating both appear online, but the
 * 500+ figure comes from the template site (which also claims 15+ instructors
 * and 25+ courses for a single studio floor) and the 4.8/147 figure is a
 * JustDial aggregate that could not be verified directly. Neither is usable
 * until the owner confirms it in writing.
 */
export const verifiedFacts = {
  studentsTrained500: false,
  googleRating48: false
} as const;

/** Bump when site content meaningfully changes (sitemap lastModified). */
export const CONTENT_LAST_UPDATED = new Date("2026-08-29");

export function waLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
