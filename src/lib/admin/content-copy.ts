import type { AdminLocale } from "@/lib/admin/i18n";
import type { ContentKind, ContentStatus, GalleryTechnique } from "@/lib/admin/content";

export type ContentCopy = {
  title: string;
  lede: string;
  add: string;
  addHelp: string;
  existing: string;
  empty: string;
  kind: string;
  slug: string;
  slugHelp: string;
  status: string;
  sortOrder: string;
  student: string;
  studentHelp: string;
  noStudent: string;
  consent: string;
  consentHelp: string;
  ownerVerified: string;
  ownerVerifiedHelp: string;
  save: string;
  saving: string;
  edit: string;
  archive: string;
  mediaUrl: string;
  mediaHelp: string;
  english: string;
  gujarati: string;
  question: string;
  answer: string;
  titleLabel: string;
  note: string;
  technique: string;
  personName: string;
  course: string;
  quote: string;
  before: string;
  after: string;
  statLabel: string;
  statValue: string;
  migrationPending: string;
  kinds: Record<ContentKind, string>;
  statuses: Record<ContentStatus, string>;
  techniques: Record<GalleryTechnique, string>;
  errors: Record<"denied" | "invalid" | "missing" | "duplicate" | "consent" | "owner" | "media" | "migration" | "generic", string>;
  success: Record<"created" | "updated" | "archived", string>;
};

const COPY = {
  en: {
    title: "Content Desk",
    lede: "Keep the website proof current without touching code. Add FAQs, consented student work, real student stories and owner-verified homepage numbers.",
    add: "Add website content",
    addHelp: "Save as Draft while collecting Gujarati copy, consent or the final photo. Publish only when the record is ready for the public website.",
    existing: "Website content",
    empty: "Nothing has been added in Content Desk yet. The website continues using its verified source content until you publish a replacement.",
    kind: "Content type",
    slug: "Short ID",
    slugHelp: "Lowercase English letters/numbers and hyphens only, for example evening-batch-faq.",
    status: "Website status",
    sortOrder: "Display order",
    student: "Linked student",
    studentHelp: "Student work can be published only when the linked Student 360 record has photo consent.",
    noStudent: "Not linked",
    consent: "Publishing consent is on file",
    consentHelp: "Required for a testimonial. Keep the actual consent record at the studio; this checkbox records that staff verified it.",
    ownerVerified: "Owner verified this number",
    ownerVerifiedHelp: "Homepage numbers are proof claims. Only the Owner can publish them.",
    save: "Save content",
    saving: "Saving…",
    edit: "Edit",
    archive: "Archive",
    mediaUrl: "Site photo path",
    mediaHelp: "Student-work photos need a real image before Publish. Use a deployed site path such as /photos/work/example.webp. Keep this item as Draft until the photo exists; upload tooling comes later.",
    english: "English",
    gujarati: "Gujarati / Gujlish",
    question: "Question",
    answer: "Answer",
    titleLabel: "Work title",
    note: "Short note",
    technique: "Technique",
    personName: "Student name",
    course: "Course",
    quote: "Student's own words",
    before: "Before",
    after: "Now",
    statLabel: "Proof label",
    statValue: "Number / value",
    migrationPending: "Content Desk is ready in the app, but its database migration has not been applied on this environment yet.",
    kinds: {
      faq: "FAQ",
      gallery: "Student work",
      testimonial: "Student story",
      homepage_stat: "Homepage number"
    },
    statuses: {
      draft: "Draft",
      published: "Published",
      archived: "Archived"
    },
    techniques: {
      zardosi: "Zardosi",
      beads: "4-Beads",
      sequence: "Sequence",
      coding: "Coding / Cording",
      chain: "Chain / Multi",
      flat: "Flat",
      applique: "Appliqué",
      crossstitch: "Cross Stitch",
      laser: "Laser",
      tufting: "Tufting",
      emcad: "emCAD"
    },
    errors: {
      denied: "Your role does not allow that content change.",
      invalid: "Check the fields in this content item and try again.",
      missing: "That content item or linked student no longer exists. Reload and try again.",
      duplicate: "That short ID is already used for this content type.",
      consent: "This cannot be published yet. Check the required student/quote consent first.",
      owner: "A homepage number can be published only after the Owner verifies it.",
      media: "Student work needs a real site photo path before it can be published.",
      migration: "The Content Desk database table is not available on this deployment yet.",
      generic: "That content change did not save. Try again."
    },
    success: {
      created: "Content item created.",
      updated: "Content item updated.",
      archived: "Content item archived."
    }
  },
  gu: {
    title: "કન્ટેન્ટ ડેસ્ક",
    lede: "કોડને હાથ લગાડ્યા વગર વેબસાઇટનું સાચું proof અપડેટ રાખો. FAQ, consentવાળું student work, સાચી student story અને Owner-verified numbers અહીંથી સંભાળો.",
    add: "વેબસાઇટ કન્ટેન્ટ ઉમેરો",
    addHelp: "Gujarati copy, consent અથવા final photo બાકી હોય તો Draft રાખો. Public website માટે record તૈયાર થાય પછી જ Publish કરો.",
    existing: "વેબસાઇટ કન્ટેન્ટ",
    empty: "હજુ Content Desk માં કશું ઉમેરાયું નથી. તમે replacement Publish ન કરો ત્યાં સુધી website હાલનું verified content જ બતાવશે.",
    kind: "કન્ટેન્ટ પ્રકાર",
    slug: "Short ID",
    slugHelp: "ફક્ત lowercase English letters/numbers અને hyphen. ઉદાહરણ: evening-batch-faq.",
    status: "વેબસાઇટ status",
    sortOrder: "દેખાવાનો ક્રમ",
    student: "જોડાયેલ student",
    studentHelp: "Student work ત્યારે જ Publish થઈ શકે જ્યારે Student 360 માં photo consent નોંધાયેલું હોય.",
    noStudent: "જોડાયેલ નથી",
    consent: "Publish કરવાની consent recordમાં છે",
    consentHelp: "Student story માટે જરૂરી. Actual consent studio પાસે રાખો; આ checkbox staffએ consent ચકાસી છે એ નોંધે છે.",
    ownerVerified: "Ownerએ આ number verify કર્યો છે",
    ownerVerifiedHelp: "Homepage numbers public proof છે. એને ફક્ત Owner જ Publish કરી શકે.",
    save: "કન્ટેન્ટ Save કરો",
    saving: "Save થાય છે…",
    edit: "Edit",
    archive: "Archive",
    mediaUrl: "Site photo path",
    mediaHelp: "Student work Publish કરવા real image જરૂરી છે. /photos/work/example.webp જેવી deployed site path નાખો. Photo તૈયાર ન હોય ત્યાં સુધી Draft રાખો; upload tooling પછી આવશે.",
    english: "English",
    gujarati: "ગુજરાતી / Gujlish",
    question: "Question",
    answer: "Answer",
    titleLabel: "Work title",
    note: "Short note",
    technique: "Technique",
    personName: "Student name",
    course: "Course",
    quote: "Studentના પોતાના શબ્દો",
    before: "પહેલાં",
    after: "હવે",
    statLabel: "Proof label",
    statValue: "Number / value",
    migrationPending: "Content Desk appમાં તૈયાર છે, પણ આ environment પર એની database migration હજી apply થઈ નથી.",
    kinds: {
      faq: "FAQ",
      gallery: "Student work",
      testimonial: "Student story",
      homepage_stat: "Homepage number"
    },
    statuses: {
      draft: "Draft",
      published: "Published",
      archived: "Archived"
    },
    techniques: {
      zardosi: "Zardosi",
      beads: "4-Beads",
      sequence: "Sequence",
      coding: "Coding / Cording",
      chain: "Chain / Multi",
      flat: "ફ્લેટ",
      applique: "એપ્લિક",
      crossstitch: "ક્રોસ સ્ટિચ",
      laser: "Laser",
      tufting: "Tufting",
      emcad: "emCAD"
    },
    errors: {
      denied: "તમારા role પાસે આ content change કરવાની permission નથી.",
      invalid: "આ contentની વિગતો ચકાસીને ફરી પ્રયાસ કરો.",
      missing: "આ content item અથવા linked student હવે મળતો નથી. Reload કરીને ફરી પ્રયાસ કરો.",
      duplicate: "આ content type માટે આ Short ID પહેલેથી વપરાઈ છે.",
      consent: "હજુ Publish કરી શકાતું નથી. જરૂરી student/quote consent પહેલાં ચકાસો.",
      owner: "Homepage number Owner verify કરે પછી જ Publish થઈ શકે.",
      media: "Student work Publish કરવા real site photo path જરૂરી છે.",
      migration: "આ deployment પર Content Desk database table હજી ઉપલબ્ધ નથી.",
      generic: "Content change Save થયો નથી. ફરી પ્રયાસ કરો."
    },
    success: {
      created: "Content item બનાવાયો.",
      updated: "Content item અપડેટ થયો.",
      archived: "Content item archive થયો."
    }
  }
} satisfies Record<AdminLocale, ContentCopy>;

export function contentCopy(locale: AdminLocale): ContentCopy {
  return COPY[locale];
}
