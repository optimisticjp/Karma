/**
 * Karma Design Studio admission norms — versioned.
 *
 * WHY A VERSIONED SOURCE MODULE RATHER THAN A CONSOLE-EDITABLE TABLE
 * ------------------------------------------------------------------
 * These are the rules a student signs against. Two things follow from that:
 *
 *  1. A published version is IMMUTABLE. If the institute changes a rule, a new
 *     version is added; the old one stays exactly as it was, because students
 *     who signed it agreed to that wording and an admission record points at a
 *     version number. Editing a published version in place would silently
 *     rewrite what past students agreed to — the same class of mistake as
 *     editing a course fee and changing an existing ledger.
 *  2. The text is legal-commercial wording supplied by the owner in Gujarati.
 *     It is reviewed and translated deliberately, not typed into a form
 *     between two enquiries.
 *
 * So versions live in git, are code-reviewed, and are referenced by number
 * from `courses.terms_version`, `applications.terms_version` and
 * `enrollments.terms_version`. If the owner later asks to edit norms from the
 * console, the upgrade path is a small `admission_terms` table seeded from
 * this file — the version number is already the join key.
 *
 * Source: the institute's printed admission sheet (owner-supplied, 2026-08-30).
 * The Gujarati is the ORIGINAL. The English is a faithful working translation
 * for the English site and for staff; where the two could be read differently,
 * the Gujarati governs.
 */

export type AdmissionTermsStatus = "active" | "superseded";

export type AdmissionTermsClause = {
  /** 1-based clause number as printed on the institute's own sheet. */
  n: number;
  gu: string;
  en: string;
};

export type AdmissionTermsVersion = {
  version: number;
  status: AdmissionTermsStatus;
  /** ISO date the version takes effect. */
  effectiveFrom: string;
  titleEn: string;
  titleGu: string;
  clauses: AdmissionTermsClause[];
  /** The declaration the student signs on the printed admission form. */
  declarationGu: string;
  declarationEn: string;
  /** Short consent line used by the public form's checkbox. */
  consentLabelEn: string;
  consentLabelGu: string;
};

export const ADMISSION_TERMS: AdmissionTermsVersion[] = [
  {
    version: 1,
    status: "active",
    effectiveFrom: "2026-08-30",
    titleEn: "Admission norms",
    titleGu: "એડમિશન નિયમો",
    clauses: [
      {
        n: 1,
        gu: "માત્ર EMCAD DAHAO Software ની જ તાલીમ આપવામાં આવે છે.",
        en: "Training is given in EMCAD DAHAO software only."
      },
      {
        n: 2,
        gu: "તમામ ડિઝાઇન 100% Live Practical Machine સાથે શીખવવામાં આવે છે.",
        en: "Every design is taught with 100% live practical machine work."
      },
      {
        n: 3,
        gu: "Wilcom અથવા અન્ય કોઈ Software અંગે માહિતી માંગીને પોતાનો અને ટ્રેનરનો સમય બગાડવો નહીં.",
        en: "Do not waste your own and the trainer's time asking about Wilcom or any other software."
      },
      {
        n: 4,
        gu: "મોબાઇલનો ઉપયોગ, વ્યક્તિગત કામ, મોડા આવવું, વહેલા જવું અને બિનજરૂરી રજા પાડવી મનાઈ છે.",
        en: "Mobile phone use, personal work, arriving late, leaving early and unnecessary absence are not allowed."
      },
      {
        n: 5,
        gu: "તમામ નિયમોનું પાલન કરનાર વિદ્યાર્થીને જરૂર પડે તો 3 મહિના પછી પણ નિઃશુલ્ક વધારાનો સમય આપવામાં આવશે.",
        en: "A student who follows every rule will be given extra time free of charge even after 3 months, if it is needed."
      },
      {
        n: 6,
        gu: "નિયમોનું પાલન નહીં કરનાર વિદ્યાર્થી માટે 3 મહિના પછી સેન્ટરની કોઈ જવાબદારી રહેશે નહીં.",
        en: "For a student who does not follow the rules, the centre carries no responsibility after 3 months."
      },
      {
        n: 7,
        gu: "ટ્રેનર, સ્ટાફ અને અન્ય વિદ્યાર્થીઓ સાથે સન્માનપૂર્ણ વર્તન રાખવું ફરજિયાત છે.",
        en: "Respectful behaviour towards the trainer, the staff and other students is compulsory."
      },
      {
        n: 8,
        gu: "ઝઘડો, ગાળો, અસભ્ય વર્તન અથવા સેન્ટરની સંપત્તિને નુકસાન પહોંચાડનાર વિદ્યાર્થીનું Admission Cancel કરવામાં આવશે અને Fees પરત આપવામાં આવશે નહીં.",
        en: "A student who fights, abuses, behaves indecently or damages centre property will have their admission cancelled, and fees will not be refunded."
      },
      {
        n: 9,
        gu: "મોટા અવાજે વાતચીત કરવી અથવા અન્ય વિદ્યાર્થીઓના અભ્યાસમાં વિક્ષેપ ઉભો કરવો મનાઈ છે.",
        en: "Talking loudly, or disturbing other students' study, is not allowed."
      },
      {
        n: 10,
        gu: "દરરોજ Book, Pen અને EMCAD DAHAO Hotkey Print સાથે લાવવું ફરજિયાત છે.",
        en: "Bringing a book, a pen and the EMCAD DAHAO hotkey print every day is compulsory."
      },
      {
        n: 11,
        gu: "સેન્ટરમાં ચાલતા Sample, Production અથવા અન્ય વિદ્યાર્થીના કામના Photo / Video પાડવાની મંજૂરી નથી. માત્ર પોતાની બનાવેલી Design માટે ટ્રેનરની મંજૂરીથી જ ફોટો અથવા વિડિયો લઈ શકાશે.",
        en: "Photographing or filming samples, production or another student's work running at the centre is not permitted. Photos or video may be taken only of your own design, and only with the trainer's permission."
      },
      {
        n: 12,
        gu: "પાન, મસાલા, ગુટખા, તમાકુ અથવા અન્ય કોઈપણ વસ્તુથી ગંદકી કરનાર વિદ્યાર્થીનું Admission Cancel કરવામાં આવશે અને Fees પરત આપવામાં આવશે નહીં.",
        en: "A student who dirties the centre with paan, masala, gutkha, tobacco or anything else will have their admission cancelled, and fees will not be refunded."
      },
      {
        n: 13,
        gu: "પસંદ કરેલ Batch માત્ર સેન્ટરની મંજૂરી અને ઉપલબ્ધતા મુજબ જ બદલવામાં આવશે.",
        en: "The chosen batch will be changed only with the centre's permission and subject to availability."
      },
      {
        n: 14,
        gu: "2 દિવસનો FREE Demo પૂર્ણ થયા બાદ Admission લીધા પછી જો વિદ્યાર્થી Admission Cancel કરે, તો ભરવામાં આવેલી કોઈપણ Fees કોઈપણ સંજોગોમાં પરત આપવામાં આવશે નહીં.",
        en: "If a student cancels their admission after taking admission following the completion of the 2-day free demo, no fees paid will be refunded under any circumstances."
      },
      {
        n: 15,
        gu: "નક્કી કરેલા સમય મુજબ Fees નહીં ભરનાર વિદ્યાર્થીના અભ્યાસ પર વિશેષ ધ્યાન આપવામાં આવશે નહીં. તેનાથી થતી શૈક્ષણિક ખોટ અથવા કોર્સમાં થતો વિલંબ માટે વિદ્યાર્થી પોતે સંપૂર્ણ જવાબદાર રહેશે.",
        en: "A student who does not pay fees by the agreed time will not be given special attention in their studies. The student alone is fully responsible for any resulting loss of learning or delay in the course."
      }
    ],
    declarationGu:
      "હું જાહેર કરું છું કે મેં KARMA DESIGN STUDIO ના તમામ નિયમો વાંચ્યા, સમજ્યા અને સ્વીકાર્યા છે. હું સેન્ટરના તમામ નિયમોનું પાલન કરવાની ખાતરી આપું છું.",
    declarationEn:
      "I declare that I have read, understood and accepted all the rules of Karma Design Studio. I give my assurance that I will follow every rule of the centre.",
    consentLabelEn:
      "I have read and accept Karma Design Studio's admission norms.",
    consentLabelGu:
      "મેં Karma Design Studio ના એડમિશન નિયમો વાંચ્યા છે અને સ્વીકારું છું."
  }
];

/** The version a new admission is recorded against. */
export const CURRENT_TERMS_VERSION: number =
  ADMISSION_TERMS.find((t) => t.status === "active")?.version ??
  ADMISSION_TERMS[ADMISSION_TERMS.length - 1].version;

export function admissionTerms(version: number): AdmissionTermsVersion | undefined {
  return ADMISSION_TERMS.find((t) => t.version === version);
}

export function currentAdmissionTerms(): AdmissionTermsVersion {
  const terms = admissionTerms(CURRENT_TERMS_VERSION);
  if (!terms) throw new Error("admission terms: no active version");
  return terms;
}

export function isKnownTermsVersion(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    ADMISSION_TERMS.some((t) => t.version === value)
  );
}
