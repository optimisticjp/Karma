/**
 * Single source of truth for business facts.
 * ⚠️ CONFIRM-WITH-OWNER items are tracked in docs/content-checklist.md (Q1-Q16).
 */
export const site = {
  name: "Karma Design Studio",
  descriptorEn: "Embroidery Academy & Design Lab",
  descriptorGu: "એમ્બ્રોઇડરી એકેડેમી અને ડિઝાઇન લેબ",
  tagline: "Skill શીખો, Future બનાવો",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://karmadesignstudio.in",
  // ⚠️ CONFIRM-WITH-OWNER (Q3): mobile from their YouTube; landline +91 261 4521383 also exists.
  whatsapp: process.env.STUDIO_WHATSAPP ?? "919904376340",
  phoneDisplay: "+91 99043 76340",
  email: process.env.STUDIO_EMAIL ?? "karmadesignclasses@gmail.com",
  // ⚠️ CONFIRM-WITH-OWNER (Q2): their site + YouTube say Middle Point; Justdial says Sumeru City Mall.
  addressEn: "302, Middle Point, Mahadev Chowk, Mota Varachha, Surat, Gujarat 394101",
  addressGu: "૩૦૨, મિડલ પોઇન્ટ, મહાદેવ ચોક, મોટા વરાછા, સુરત, ગુજરાત 394101",
  hoursEn: "Open daily · Evening batches till 10:30 pm",
  hoursGu: "રોજ ખુલ્લું · સાંજની બેચ 10:30 સુધી",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Karma+Design+Studio+Mota+Varachha+Surat",
  socials: {
    instagram: "https://www.instagram.com/karma_designstudio/",
    youtube: "https://youtube.com/@karma_design_studio",
    facebook: "https://www.facebook.com/" // ⚠️ CONFIRM-WITH-OWNER: exact page URL
  },
  youtubeChannelId: "UC1pOkjwa3hotcYKe35RLxaw",
  geo: { lat: 21.2379, lng: 72.8877 } // Mota Varachha approx; refine with owner pin
} as const;

/**
 * Public numeric claims stay OFF until the owner verifies each one
 * (docs/content-checklist.md Q9). Flip to true only with written confirmation.
 */
export const verifiedFacts = {
  studentsTrained500: false,
  googleRating48: false
} as const;

/** Bump when site content meaningfully changes (sitemap lastModified). */
export const CONTENT_LAST_UPDATED = new Date("2026-07-30");

export function waLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
