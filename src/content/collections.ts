/**
 * Bilingual collections. Anything not yet verified with the owner carries
 * sample: true and renders with a visible "Sample: replace before launch"
 * tag (no-ghost-content rule, master plan 2.5). Real assets replace these
 * via docs/content-checklist.md.
 */

export type Faq = { qEn: string; qGu: string; aEn: string; aGu: string };

export const faqs: Faq[] = [
  {
    qEn: "I've never touched a machine. Can I still join?",
    qGu: "મેં ક્યારેય મશીનને હાથ નથી લગાડ્યો. તો પણ જોડાઈ શકું?",
    aEn: "Yes. Most of our students start from zero. Training begins at the machine on day one, at your pace, with a trainer beside you.",
    aGu: "હા. અમારા મોટા ભાગના સ્ટુડન્ટ્સ શૂન્યથી શરૂ કરે છે. પહેલા દિવસથી જ મશીન પર, તમારી ઝડપે, ટ્રેનર સાથે ટ્રેનિંગ થાય છે."
  },
  {
    qEn: "Is machine practice really included, or is it mostly theory?",
    qGu: "મશીન પ્રેક્ટિસ ખરેખર મળે છે કે મોટા ભાગે થિયરી જ છે?",
    aEn: "Training is hands-on at live machines; theory appears only where it makes your hands better.",
    aGu: "ટ્રેનિંગ લાઇવ મશીન પર હાથે કરીને થાય છે; થિયરી એટલી જ, જેટલી કામમાં આવે."
  },
  {
    qEn: "Which language is training in?",
    qGu: "ટ્રેનિંગ કઈ ભાષામાં થાય છે?",
    aEn: "Gujarati and Hindi, with English terms where the trade uses them (emCAD, machine names, and so on).",
    aGu: "ગુજરાતી અને હિન્દીમાં, અને જ્યાં ટ્રેડમાં English શબ્દો વપરાય છે ત્યાં એ જ (emCAD, મશીનનાં નામ વગેરે)."
  },
  {
    qEn: "I work during the day. Are evening batches available?",
    qGu: "હું દિવસે કામ કરું છું. સાંજની બેચ મળે?",
    aEn: "Yes. The studio runs evening batches until 10:30 pm, exactly for working people and homemakers.",
    aGu: "હા. કામ કરતા લોકો અને ગૃહિણીઓ માટે જ સ્ટુડિયોમાં સાંજની બેચ રાત્રે 10:30 સુધી ચાલે છે."
  },
  {
    qEn: "Do I need to pay online to book a demo?",
    qGu: "ડેમો બુક કરવા ઓનલાઇન પેમેન્ટ કરવું પડે?",
    aEn: "No. The demo class is free and no online payment exists on this website. Fees are discussed in person or on WhatsApp before you decide anything.",
    aGu: "ના. ડેમો ક્લાસ ફ્રી છે અને આ વેબસાઇટ પર કોઈ ઓનલાઇન પેમેન્ટ નથી. તમે નિર્ણય લો એ પહેલાં ફી રૂબરૂ અથવા WhatsApp પર જણાવવામાં આવે છે."
  },
  {
    qEn: "What are the fees?",
    qGu: "ફી કેટલી છે?",
    aEn: "Fees depend on the course and batch. We share the exact fee at your demo or on WhatsApp, before you decide anything.",
    aGu: "ફી કોર્સ અને બેચ પ્રમાણે હોય છે. તમે નિર્ણય લો એ પહેલાં, ડેમો વખતે અથવા WhatsApp પર અમે ચોક્કસ ફી જણાવીશું."
  },
  {
    qEn: "Will I get a certificate?",
    qGu: "સર્ટિફિકેટ મળશે?",
    aEn: "Yes, on completing attendance, practicals and your final project. Every certificate carries a QR code anyone can verify on this website.",
    aGu: "હા, હાજરી, પ્રેક્ટિકલ અને ફાઇનલ પ્રોજેક્ટ પૂરા કરવા પર. દરેક સર્ટિફિકેટ પર QR કોડ હોય છે, જે કોઈ પણ આ વેબસાઇટ પર ચકાસી શકે."
  },
  {
    qEn: "What if I miss classes?",
    qGu: "ક્લાસ ચૂકી જાઉં તો?",
    aEn: "Tell your trainer; missed practicals are adjusted within your batch where possible. Certificate eligibility needs the attendance shown on the Admissions page.",
    aGu: "ટ્રેનરને જણાવો; શક્ય હોય ત્યાં ચૂકેલી પ્રેક્ટિકલ તમારી બેચમાં ગોઠવી અપાય છે. સર્ટિફિકેટ માટે એડમિશન પેજ પર દર્શાવેલી હાજરી જરૂરી છે."
  },
  {
    qEn: "Can I visit the studio before applying?",
    qGu: "એપ્લાય કરતાં પહેલાં સ્ટુડિયો જોવા આવી શકું?",
    aEn: "Please do. Walk in during studio hours or message us on WhatsApp first; the free demo is the best way to see how we teach.",
    aGu: "જરૂર આવો. સ્ટુડિયોના સમયમાં સીધા આવો અથવા પહેલા WhatsApp કરો; અમે કેવી રીતે શીખવીએ છીએ એ જોવાનો શ્રેષ્ઠ રસ્તો ફ્રી ડેમો છે."
  },
  {
    qEn: "Do you also take business design or job-work orders?",
    qGu: "તમે બિઝનેસ ડિઝાઇન કે જોબ-વર્કના ઓર્ડર પણ લો છો?",
    aEn: "Yes. Design development, emCAD digitizing, patches and production job work: see the Services page and send a brief.",
    aGu: "હા. ડિઝાઇન ડેવલપમેન્ટ, emCAD ડિજિટાઇઝિંગ, પેચિસ અને પ્રોડક્શન જોબ વર્ક: સર્વિસિસ પેજ જુઓ અને બ્રીફ મોકલો."
  },
  {
    qEn: "Is there an age limit? Can students under 18 join?",
    qGu: "ઉંમરની કોઈ મર્યાદા છે? 18થી નાના સ્ટુડન્ટ જોડાઈ શકે?",
    aEn: "Under-18 students join with a parent or guardian's consent, which the admission form collects.",
    aGu: "18થી નાના સ્ટુડન્ટ્સ માતા-પિતા/વાલીની સંમતિ સાથે જોડાય છે; એડમિશન ફોર્મમાં એ વિગત લેવાય છે."
  },
  {
    qEn: "Which software do you teach — emCAD or Wilcom?",
    qGu: "કયું સોફ્ટવેર શીખવો છો — emCAD કે Wilcom?",
    aEn:
      "The design course is taught on emCAD, which is what the studio digitises production files on. The thinking transfers: underlay, density, stitch types, pull compensation and travel order are the same decisions in any digitising package, so an operator who understands them in emCAD reads a Wilcom file without starting over.",
    aGu:
      "ડિઝાઇન કોર્સ emCAD પર શીખવાય છે, કારણ કે સ્ટુડિયોમાં પ્રોડક્શન ફાઇલ એના પર જ ડિજિટાઇઝ થાય છે. સમજણ બધે કામ લાગે: અન્ડરલે, ડેન્સિટી, સ્ટિચ ટાઇપ, પુલ કોમ્પેન્સેશન અને ટ્રાવેલ ઓર્ડર — આ નિર્ણય દરેક સોફ્ટવેરમાં એકસરખા છે. emCAD માં આ સમજી લેનાર Wilcom ની ફાઇલ પણ નવેસરથી શીખ્યા વગર વાંચી શકે."
  },
  {
    qEn: "How long does a course take?",
    qGu: "કોર્સ કેટલો સમય ચાલે છે?",
    aEn:
      "It depends on the technique and on how much machine time you can give it each week, so we would rather tell you at your demo than publish a number that turns out to be wrong for you. Ask for the current duration when you call or come in.",
    aGu:
      "એ ટેકનિક પર અને તમે અઠવાડિયે કેટલો મશીન ટાઇમ આપી શકો એના પર આધાર રાખે છે. એટલે ખોટો પડે એવો આંકડો છાપવા કરતાં ડેમો વખતે રૂબરૂ કહેવાનું અમને વધારે યોગ્ય લાગે છે. કૉલ કરો કે રૂબરૂ આવો ત્યારે અત્યારની ડ્યુરેશન પૂછી લેજો."
  },
  {
    qEn: "When does the next batch start?",
    qGu: "નવી બેચ ક્યારે શરૂ થાય છે?",
    aEn:
      "Batches start through the year, morning and evening, and seats per batch are limited because every student needs a machine. Upcoming batches are listed on the admissions page; for what is running right now, call — that is always more current than a web page.",
    aGu:
      "બેચ આખું વર્ષ ચાલુ થાય છે, સવારે અને સાંજે. દરેક સ્ટુડન્ટને મશીન જોઈએ એટલે બેચ દીઠ સીટ મર્યાદિત હોય છે. આગામી બેચ એડમિશન પેજ પર છે; અત્યારે શું ચાલે છે એ માટે કૉલ કરો — વેબ પેજ કરતાં એ હંમેશાં વધારે તાજું હોય છે."
  },
  {
    qEn: "After the course, can I take job work or start my own unit?",
    qGu: "કોર્સ પછી જોબ વર્ક લઈ શકું કે પોતાનું યુનિટ શરૂ કરી શકું?",
    aEn:
      "Both paths exist in this trade — working on someone's machines, taking job work at home, or running your own unit — and the course is built around the production skills all three need: reading a design, digitising it, setting the machine and correcting a sample. What we will not do is promise you a job, an income or a placement. Come to a demo and ask us directly what the work looks like.",
    aGu:
      "આ ધંધામાં ત્રણેય રસ્તા છે — બીજાના મશીન પર કામ, ઘરેથી જોબ વર્ક, કે પોતાનું યુનિટ. કોર્સ એ જ પ્રોડક્શન સ્કિલ પર બનેલો છે જે ત્રણેયમાં જોઈએ: ડિઝાઇન વાંચવી, ડિજિટાઇઝ કરવી, મશીન સેટ કરવી અને સેમ્પલ સુધારવું. પણ નોકરી, કમાણી કે પ્લેસમેન્ટનું વચન અમે નહીં આપીએ. ડેમોમાં આવો અને કામ ખરેખર કેવું છે એ સીધું પૂછો."
  }
];

/* ------------------------------ success stories --------------------------- */

export type Story = {
  sample: boolean;
  nameEn: string;
  nameGu: string;
  courseEn: string;
  courseGu: string;
  quoteEn: string;
  quoteGu: string;
  beforeEn: string;
  beforeGu: string;
  afterEn: string;
  afterGu: string;
  photoLabel: string;
};

// ⚠️ SAMPLE stories: layout demonstrations only. Replace with six real,
// consented outcomes (content-checklist Q8) before launch. The sample flag
// renders a visible tag so nothing fake can ship silently.
export const stories: Story[] = [
  {
    sample: true,
    nameEn: "Sample: student name",
    nameGu: "નમૂનો: સ્ટુડન્ટનું નામ",
    courseEn: "Sample: course name",
    courseGu: "નમૂનો: કોર્સનું નામ",
    quoteEn:
      "Replace with the student's own sentence about what changed after the course.",
    quoteGu: "કોર્સ પછી શું બદલાયું એ વિશે સ્ટુડન્ટનું પોતાનું વાક્ય અહીં મૂકો.",
    beforeEn: "Tailor with a small shop",
    beforeGu: "નાની દુકાનવાળા ટેલર",
    afterEn: "Runs a 3-machine zardosi unit",
    afterGu: "3 મશીનનું ઝરદોશી યુનિટ ચલાવે છે",
    photoLabel: "Student portrait at their machine (with consent)"
  },
  {
    sample: true,
    nameEn: "Sample: student name",
    nameGu: "નમૂનો: સ્ટુડન્ટનું નામ",
    courseEn: "Sample: course name",
    courseGu: "નમૂનો: કોર્સનું નામ",
    quoteEn:
      "Replace with a real quote: what they struggled with, and what they do now.",
    quoteGu: "સાચું ક્વોટ મૂકો: શું અઘરું લાગતું હતું, અને હવે શું કરે છે.",
    beforeEn: "Homemaker, new to machines",
    beforeGu: "ગૃહિણી, મશીનથી અજાણ",
    afterEn: "Takes boutique orders from home",
    afterGu: "ઘરેથી બુટિકના ઓર્ડર લે છે",
    photoLabel: "Student with finished piece (with consent)"
  }
];

/* --------------------------------- reviews -------------------------------- */

export type Review = {
  /** Always true today. Nothing here has been collected from a real reviewer. */
  sample: boolean;
  nameEn: string;
  nameGu: string;
  /** What they came for — never a claimed outcome, salary or placement. */
  contextEn: string;
  contextGu: string;
  bodyEn: string;
  bodyGu: string;
};

/**
 * ⚠️ SAMPLE reviews — written to exercise the review-card layout, not
 * collected from anyone.
 *
 * The owner asked for the full visual system populated before real content
 * arrives, so unlike the older placeholders these read like reviews rather
 * than like instructions. That makes the marking load-bearing:
 *
 *  1. `sample: true` on every row, and the public card renders <SampleTag />;
 *  2. **none of this may enter Review or AggregateRating structured data** —
 *     a fabricated rich result is a different order of problem from a
 *     visibly-labelled placeholder card;
 *  3. names are a first name plus an initial, deliberately generic, and none
 *     is reused from the old ValidTheme template's fake testimonials;
 *  4. nothing here claims earnings, a job, a placement or a pass rate. They
 *     describe teaching and machine time, which is what the studio controls.
 *
 * Replace wholesale from the owner's real Google reviews before the domain
 * cutover — tracked in docs/content-checklist.md.
 */
export const sampleReviews: Review[] = [
  {
    sample: true,
    nameEn: "Hetal P.",
    nameGu: "હેતલ પ.",
    contextEn: "Zardosi batch, evenings",
    contextGu: "ઝરદોશી બેચ, સાંજે",
    bodyEn:
      "Machine par baithine shikhvanu male chhe, e sauthi moti vaat chhe. First week thi j thread aur needle change karvanu potaje karyu. Sir dhairya thi samjave chhe.",
    bodyGu:
      "મશીન પર બેસીને શીખવાનું મળે છે, એ સૌથી મોટી વાત છે. પહેલા અઠવાડિયાથી જ થ્રેડ અને નીડલ ચેન્જ કરવાનું જાતે કર્યું. સર ધીરજથી સમજાવે છે."
  },
  {
    sample: true,
    nameEn: "Rina M.",
    nameGu: "રીના મ.",
    contextEn: "emCAD design",
    contextGu: "emCAD ડિઝાઇન",
    bodyEn:
      "Design screen par saras lagti hati pan fabric par bagadti hati. Ahiya density ane underlay samjaya pachhi problem j nathi thati. File ma sudharo karvanu shikhva malyu.",
    bodyGu:
      "ડિઝાઇન સ્ક્રીન પર સરસ લાગતી હતી પણ ફેબ્રિક પર બગડતી હતી. અહીં ડેન્સિટી અને અન્ડરલે સમજાયા પછી પ્રોબ્લેમ જ નથી થતી. ફાઇલમાં સુધારો કરવાનું શીખવા મળ્યું."
  },
  {
    sample: true,
    nameEn: "Jignesh D.",
    nameGu: "જિજ્ઞેશ દ.",
    contextEn: "Sequence and coding work",
    contextGu: "સિકવન્સ અને કોડિંગ વર્ક",
    bodyEn:
      "Mari pase pahelethi machine hati pan setting nathi aavdti hati. Demo ma j batavi didhu ke shu khotu chhe. Batch timing sanje hovathi kaam sathe fave chhe.",
    bodyGu:
      "મારી પાસે પહેલેથી મશીન હતી પણ સેટિંગ નહોતી આવડતી. ડેમોમાં જ બતાવી દીધું કે શું ખોટું છે. બેચ ટાઇમિંગ સાંજે હોવાથી કામ સાથે ફાવે છે."
  }
];

/* --------------------------------- gallery -------------------------------- */

export type GalleryItem = {
  sample: boolean;
  technique: string;
  ratio: "4/5" | "1/1" | "3/2";
  titleEn: string;
  titleGu: string;
  noteEn: string;
  noteGu: string;
  hasPair: boolean; // screen-to-stitch pair available
  photoLabel: string;
};

export const techniqueChips: Record<string, { labelEn: string; labelGu: string; color: string }> =
  {
    zardosi: { labelEn: "Zardosi", labelGu: "ઝરદોશી", color: "" },
    beads: { labelEn: "Beads", labelGu: "બીડ્સ", color: "" },
    sequence: { labelEn: "Sequence", labelGu: "સિકવન્સ", color: "" },
    coding: { labelEn: "Coding", labelGu: "કોડિંગ", color: "" },
    // `chain` was in GALLERY_TECHNIQUES but never here, so any item tagged
    // chain rendered an empty chip on the public gallery.
    chain: { labelEn: "Chain / Multi", labelGu: "ચેઇન / મલ્ટી", color: "" },
    flat: { labelEn: "Flat", labelGu: "ફ્લેટ", color: "" },
    applique: { labelEn: "Appliqué", labelGu: "એપ્લિક", color: "" },
    crossstitch: { labelEn: "Cross Stitch", labelGu: "ક્રોસ સ્ટિચ", color: "" },
    laser: { labelEn: "Laser", labelGu: "લેસર", color: "" },
    tufting: { labelEn: "Tufting", labelGu: "ટફ્ટિંગ", color: "" },
    emcad: { labelEn: "emCAD", labelGu: "emCAD", color: "" }
  };

export const galleryItems: GalleryItem[] = [
  { sample: true, technique: "zardosi", ratio: "4/5", titleEn: "Bridal zardosi panel", titleGu: "બ્રાઇડલ ઝરદોશી પેનલ", noteEn: "Final project, evening batch", noteGu: "ફાઇનલ પ્રોજેક્ટ, સાંજની બેચ", hasPair: true, photoLabel: "Zardosi bridal panel, macro" },
  { sample: true, technique: "sequence", ratio: "1/1", titleEn: "Festive sequence dupatta", titleGu: "ફેસ્ટિવ સિકવન્સ દુપટ્ટા", noteEn: "Week 5 production drill", noteGu: "અઠવાડિયું 5, પ્રોડક્શન પ્રેક્ટિસ", hasPair: false, photoLabel: "Sequence dupatta shimmer" },
  { sample: true, technique: "emcad", ratio: "3/2", titleEn: "Peacock motif, screen to stitch", titleGu: "મોર મોટિફ, સ્ક્રીનથી સ્ટિચ સુધી", noteEn: "emCAD design + stitched result", noteGu: "emCAD ડિઝાઇન + સીવેલું પરિણામ", hasPair: true, photoLabel: "emCAD peacock design beside stitched fabric" },
  { sample: true, technique: "beads", ratio: "4/5", titleEn: "4-beads border run", titleGu: "4-બીડ્સ બોર્ડર રન", noteEn: "First full production run", noteGu: "પહેલો આખો પ્રોડક્શન રન", hasPair: false, photoLabel: "Beads border close-up" },
  { sample: true, technique: "tufting", ratio: "1/1", titleEn: "Tufted name board", titleGu: "ટફ્ટેડ નેમ બોર્ડ", noteEn: "Weekend batch product", noteGu: "વીકએન્ડ બેચની પ્રોડક્ટ", hasPair: false, photoLabel: "Tufted rug piece, colourful" },
  { sample: true, technique: "laser", ratio: "4/5", titleEn: "Laser-cut appliqué yoke", titleGu: "લેસર-કટ એપ્લિક યોક", noteEn: "Combined laser + embroidery", noteGu: "લેસર + એમ્બ્રોઇડરી સાથે", hasPair: true, photoLabel: "Laser-cut fabric layered piece" }
];

/* --------------------------------- services -------------------------------- */

export type ServiceItem = { titleEn: string; titleGu: string; descEn: string; descGu: string };

// ⚠️ CONFIRM-WITH-OWNER: final service list before launch (plan 9.6).
export const services: ServiceItem[] = [
  { titleEn: "Embroidery design development", titleGu: "એમ્બ્રોઇડરી ડિઝાઇન ડેવલપમેન્ટ", descEn: "Original designs developed for your garment, from concept to approved artwork.", descGu: "તમારા ગારમેન્ટ માટે ઓરિજિનલ ડિઝાઇન: કન્સેપ્ટથી ફાઇનલ આર્ટવર્ક સુધી." },
  { titleEn: "emCAD digitizing", titleGu: "emCAD ડિજિટાઇઝિંગ", descEn: "Your artwork converted into clean, machine-ready embroidery files.", descGu: "તમારું આર્ટવર્ક ચોખ્ખી, મશીન-રેડી એમ્બ્રોઇડરી ફાઇલમાં." },
  { titleEn: "Sampling & stitch-path optimisation", titleGu: "સેમ્પલિંગ અને સ્ટિચ-પાથ ઓપ્ટિમાઇઝેશન", descEn: "Sample runs, density and pathing fixes before production, so production doesn't pay for mistakes.", descGu: "પ્રોડક્શન પહેલાં સેમ્પલ, ડેન્સિટી અને પાથિંગ સુધારા, જેથી ભૂલોની કિંમત પ્રોડક્શન ન ચૂકવે." },
  { titleEn: "Customised embroidered patches", titleGu: "કસ્ટમાઇઝ્ડ એમ્બ્રોઇડરી પેચિસ", descEn: "Logo and brand patches, small or bulk quantities.", descGu: "લોગો અને બ્રાન્ડ પેચિસ, નાની કે મોટી માત્રામાં." },
  { titleEn: "Production job work", titleGu: "પ્રોડક્શન જોબ વર્ક", descEn: "Zardosi, beads, sequence, coding and laser job work on your material.", descGu: "તમારા મટીરિયલ પર ઝરદોશી, બીડ્સ, સિકવન્સ, કોડિંગ અને લેસર જોબ વર્ક." },
  { titleEn: "Design corrections & consulting", titleGu: "ડિઝાઇન કરેક્શન અને કન્સલ્ટિંગ", descEn: "Fixing files that stitch badly, and advice on technique, material and cost.", descGu: "ખરાબ સીવાતી ફાઇલોના સુધારા, અને ટેકનિક, મટીરિયલ તથા કોસ્ટ પર સલાહ." }
];

/* ------------------------------- trainers ---------------------------------
 * ⚠ CONFIRM-WITH-OWNER (content-checklist Q7): real names, roles, photos and
 * consent. Until then every entry stays sample:true and renders a SampleTag.
 * NEVER invent a trainer. Delete a row rather than guess at one.
 * -------------------------------------------------------------------------- */
export type Trainer = {
  sample: boolean;
  nameEn: string;
  nameGu: string;
  roleEn: string;
  roleGu: string;
  focusEn: string;
  focusGu: string;
  photoLabel: string;
};

export const trainers: Trainer[] = [
  {
    sample: true,
    nameEn: "Sample: lead trainer name",
    nameGu: "નમૂનો: મુખ્ય ટ્રેનરનું નામ",
    roleEn: "Machine embroidery, all techniques",
    roleGu: "મશીન એમ્બ્રોઇડરી, બધી ટેકનિક",
    focusEn:
      "Years on the production floor before teaching. Specialities and student results appear here once confirmed.",
    focusGu:
      "ભણાવતાં પહેલાં પ્રોડક્શન ફ્લોર પર વર્ષોનો અનુભવ. કન્ફર્મ થયા પછી અહીં સ્પેશિયાલિટી અને પરિણામ આવશે.",
    photoLabel: "Trainer portrait at their machine (with consent)"
  },
  {
    sample: true,
    nameEn: "Sample: design trainer name",
    nameGu: "નમૂનો: ડિઝાઇન ટ્રેનરનું નામ",
    roleEn: "emCAD design and digitizing",
    roleGu: "emCAD ડિઝાઇન અને ડિજિટાઇઝિંગ",
    focusEn:
      "Works on live client files, so classes use the same standards production actually demands.",
    focusGu:
      "લાઇવ ક્લાયન્ટ ફાઇલ પર કામ કરે છે, એટલે ક્લાસમાં પ્રોડક્શન જેવા જ ધોરણો શીખવાય છે.",
    photoLabel: "Trainer portrait at the emCAD station (with consent)"
  },
  {
    sample: true,
    nameEn: "Sample: founder name",
    nameGu: "નમૂનો: સ્થાપકનું નામ",
    roleEn: "Founder, Karma Design Studio",
    roleGu: "સ્થાપક, Karma Design Studio",
    focusEn:
      "The reason the studio exists, in their own words, once the founding interview is recorded.",
    focusGu:
      "સ્ટુડિયો શા માટે શરૂ થયો, એ એમના પોતાના શબ્દોમાં, ઇન્ટરવ્યૂ રેકોર્ડ થયા પછી.",
    photoLabel: "Owner portrait at a machine (shoot list)"
  }
];
