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

  /** Verified: the number the studio publishes for WhatsApp and mobile calls. */
  whatsapp: process.env.STUDIO_WHATSAPP ?? "919904376340",
  phoneDisplay: "+91 99043 76340",
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
