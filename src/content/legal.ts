/**
 * THE TWO LEGAL PAGES — Privacy and Terms — as content rather than as markup.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Both pages used to hold their English and Gujarati copy inline, chosen with
 * `locale === "gu" ? … : …`. CLAUDE.md non-negotiable #1 rules that shape out
 * everywhere: the else-branch of that ternary renders a MISSING Gujarati
 * string as English and looks exactly like a translated one. Here the copy is
 * a suffixed record read through `pick()` / `pickList()`, so a missing
 * translation is loud in development instead of invisible.
 *
 * It is a content module rather than a message-catalogue namespace because
 * these are DOCUMENTS: ordered sections whose numbering is part of the
 * reading, and whose next revision is an edit to a document rather than to a
 * UI string. `messages/*.json` stays what it is — interface copy.
 *
 * ⚠ BOTH ARE WORKING DRAFTS. They are honest and plain, and they are not legal
 * advice. `docs/content-checklist.md` carries the owner + legal review as an
 * open item, and `/terms` is `noIndex` until that review lands. Do not remove
 * the noIndex as part of a visual change; it comes off when the owner approves
 * the text, and that decision is recorded in the checklist.
 *
 * `{email}` in a body line is substituted with the studio's address at render
 * so that the contact route lives in `src/lib/site.ts` alone.
 */

export type LegalSection = {
  id: string;
  headingEn: string;
  headingGu: string;
  bodyEn: string[];
  bodyGu: string[];
};

/** DPDP-aligned draft. Sections read in the order a data question is asked. */
export const privacySections: LegalSection[] = [
  {
    id: "collect",
    headingEn: "What we collect",
    headingGu: "અમે કઈ વિગત લઈએ છીએ",
    bodyEn: [
      "Admission form: name, WhatsApp number, optional email, chosen course and timing, age band, occupation, experience, area, and guardian details for applicants under 18.",
      "Design briefs: name, phone, company, project details and any files you upload."
    ],
    bodyGu: [
      "એડમિશન ફોર્મ: નામ, WhatsApp નંબર, ઇમેઇલ (વૈકલ્પિક), પસંદ કરેલો કોર્સ અને સમય, ઉંમરનો ગાળો, વ્યવસાય, અનુભવ, વિસ્તાર, અને 18થી નાના માટે વાલીની વિગત.",
      "ડિઝાઇન બ્રીફ: નામ, ફોન, કંપની, પ્રોજેક્ટની વિગત અને તમે અપલોડ કરેલી ફાઇલ."
    ]
  },
  {
    id: "why",
    headingEn: "Why",
    headingGu: "શા માટે",
    bodyEn: [
      "Only to contact you about your application or brief. We do not sell data and do not use it for advertising.",
      "For applicants under 18, guardian consent is collected in the form itself."
    ],
    bodyGu: [
      "માત્ર તમારી અરજી કે બ્રીફ અંગે તમારો સંપર્ક કરવા. અમે વિગત વેચતા નથી અને જાહેરાત માટે વાપરતા નથી.",
      "18થી નાના અરજદાર માટે વાલીની સંમતિ ફોર્મમાં જ લેવાય છે."
    ]
  },
  {
    id: "files",
    headingEn: "Design files",
    headingGu: "ડિઝાઇન ફાઇલો",
    bodyEn: [
      "Business brief files live in private storage and are never served from public links."
    ],
    bodyGu: [
      "બિઝનેસ બ્રીફની ફાઇલ પ્રાઇવેટ સ્ટોરેજમાં રહે છે અને ક્યારેય પબ્લિક લિંકથી ખૂલતી નથી."
    ]
  },
  {
    id: "retention",
    headingEn: "How long",
    headingGu: "કેટલો સમય",
    bodyEn: [
      "Admission applications: kept for a reasonable period after the admission cycle (finalised with policy review).",
      "Ask, and we delete your data, unless the law requires keeping it."
    ],
    bodyGu: [
      "એડમિશન અરજી: પ્રવેશ પ્રક્રિયા પૂરી થયા પછી વ્યાજબી સમય સુધી (નિયમ પ્રમાણે નક્કી થાય છે).",
      "તમે કહો એટલે અમે તમારી વિગત કાઢી નાખીએ છીએ, સિવાય કે કાયદા મુજબ રાખવી પડે."
    ]
  },
  {
    id: "rights",
    headingEn: "Your rights",
    headingGu: "તમારા હક્કો",
    bodyEn: [
      "To access, correct or erase your data, email {email} with the subject 'Data request'. We respond within a reasonable time."
    ],
    bodyGu: [
      "તમારી વિગત જોવા, સુધારવા કે કઢાવવા {email} પર 'Data request' લખીને મેઇલ કરો. અમે વ્યાજબી સમયમાં જવાબ આપીશું."
    ]
  }
];

export type LegalTerm = { id: string; textEn: string; textGu: string };

/**
 * The terms a student or a business actually needs before they commit. Note
 * what is NOT here: no fee figure, no refund schedule, no duration for a
 * course whose duration is unconfirmed. Those are the owner's to state, and a
 * terms page is the worst possible place to guess one.
 */
export const termsItems: LegalTerm[] = [
  {
    id: "payment",
    textEn:
      "No online payment exists on this website. Fees and receipts happen in person at the studio.",
    textGu: "આ વેબસાઇટ પર કોઈ ઓનલાઇન પેમેન્ટ નથી. ફી અને રસીદ સ્ટુડિયોમાં રૂબરૂ થાય છે."
  },
  {
    id: "seats",
    textEn: "Seats are limited per batch; admission is final once confirmed at the studio.",
    textGu: "સીટ બેચ પ્રમાણે લિમિટેડ છે; એડમિશન સ્ટુડિયોમાં કન્ફર્મ થાય પછી પાકું ગણાય."
  },
  {
    id: "certificate",
    textEn:
      "Certificates require the attendance, practicals and final project stated on the Admissions page.",
    textGu:
      "સર્ટિફિકેટ માટે એડમિશન પેજ પર દર્શાવેલી હાજરી, પ્રેક્ટિકલ અને ફાઇનલ પ્રોજેક્ટ જરૂરી છે."
  },
  {
    id: "machines",
    textEn:
      "Care of machines and equipment is part of training; deliberate damage is the student's responsibility.",
    textGu:
      "સ્ટુડિયોમાં મશીન અને સાધનોની સંભાળ ટ્રેનિંગનો ભાગ છે; જાણી જોઈને નુકસાનની જવાબદારી સ્ટુડન્ટની રહે છે."
  },
  {
    id: "services",
    textEn:
      "For business services: work begins after quote approval; design ownership transfers to the client on delivery and payment.",
    textGu:
      "બિઝનેસ સર્વિસમાં: ક્વોટ મંજૂર થયા પછી કામ શરૂ થાય છે; ડિઝાઇનની માલિકી ડિલિવરી અને પેમેન્ટ પછી ક્લાયન્ટની."
  },
  {
    id: "consent",
    textEn: "Photos of student work appear on this website only after consent (form/written).",
    textGu: "સ્ટુડન્ટના કામના ફોટા સંમતિ (ફોર્મ/લેખિત) પછી જ વેબસાઇટ પર મુકાય છે."
  }
];
