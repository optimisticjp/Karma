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
    aEn: "Gujarati and Hindi, with English terms where the trade uses them (EMCAD DAHAO, machine names, and so on).",
    aGu: "ગુજરાતી અને હિન્દીમાં, અને જ્યાં ટ્રેડમાં English શબ્દો વપરાય છે ત્યાં એ જ (EMCAD DAHAO, મશીનનાં નામ વગેરે)."
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
    aEn: "Yes. Design development, EMCAD DAHAO digitizing, patches and production job work: see the Services page and send a brief.",
    aGu: "હા. ડિઝાઇન ડેવલપમેન્ટ, EMCAD DAHAO ડિજિટાઇઝિંગ, પેચિસ અને પ્રોડક્શન જોબ વર્ક: સર્વિસિસ પેજ જુઓ અને બ્રીફ મોકલો."
  },
  {
    qEn: "Is there an age limit? Can students under 18 join?",
    qGu: "ઉંમરની કોઈ મર્યાદા છે? 18થી નાના સ્ટુડન્ટ જોડાઈ શકે?",
    aEn: "Under-18 students join with a parent or guardian's consent, which the admission form collects.",
    aGu: "18થી નાના સ્ટુડન્ટ્સ માતા-પિતા/વાલીની સંમતિ સાથે જોડાય છે; એડમિશન ફોર્મમાં એ વિગત લેવાય છે."
  },
  {
    qEn: "Which software do you teach?",
    qGu: "કયું સોફ્ટવેર શીખવો છો?",
    aEn:
      "EMCAD DAHAO, and only EMCAD DAHAO. It is the package the studio digitises its own production files on, so a student learns the software the floor actually runs and stitches every design out on a live machine in the same session. Karma does not run classes in any other digitising package.",
    aGu:
      "EMCAD DAHAO, અને માત્ર EMCAD DAHAO. સ્ટુડિયો પોતાની પ્રોડક્શન ફાઇલ એના પર જ ડિજિટાઇઝ કરે છે, એટલે સ્ટુડન્ટ એ જ સોફ્ટવેર શીખે છે જે ફ્લોર પર ચાલે છે, અને દરેક ડિઝાઇન એ જ સેશનમાં લાઇવ મશીન પર સ્ટિચ કરે છે. Karma બીજા કોઈ ડિજિટાઇઝિંગ સોફ્ટવેરના ક્લાસ ચલાવતું નથી."
  },
  {
    qEn: "How long does a course take?",
    qGu: "કોર્સ કેટલો સમય ચાલે છે?",
    aEn:
      "EMCAD DAHAO Embroidery Designing runs for three months. For the machine techniques it depends on the technique and on how much machine time you can give it each week, so we would rather tell you at your demo than publish a number that turns out to be wrong for you.",
    aGu:
      "EMCAD DAHAO એમ્બ્રોઇડરી ડિઝાઇનિંગ ત્રણ મહિનાનો છે. મશીન ટેકનિક માટે એ ટેકનિક પર અને તમે અઠવાડિયે કેટલો મશીન ટાઇમ આપી શકો એના પર આધાર રાખે છે, એટલે ખોટો પડે એવો આંકડો છાપવા કરતાં ડેમો વખતે રૂબરૂ કહેવાનું અમને વધારે યોગ્ય લાગે છે."
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
  /**
   * The mini case study. Optional on purpose: a story published through
   * Content Desk carries the fields that form has, and adding five more to it
   * would be extending the CMS to solve a presentation problem. A story with
   * these renders as a case study; a story without renders as before → after.
   */
  whyEn?: string;
  whyGu?: string;
  learnedEn?: string;
  learnedGu?: string;
  changedEn?: string;
  changedGu?: string;
  nowEn?: string;
  nowGu?: string;
};

/**
 * ⚠️ SAMPLE stories — six archetypes, written to exercise the case-study
 * layout. Nobody here exists.
 *
 * These replaced two placeholders whose quote fields were editorial
 * instructions ("Replace with the student's own sentence…"), which meant the
 * page could only ever render empty. The owner asked for the whole visual
 * system populated before real content arrives, so these read like stories —
 * which makes the marking load-bearing rather than decorative:
 *
 *  1. `sample: true` on every row, and every card renders <SampleTag />;
 *  2. **none of this may enter Review or AggregateRating structured data**;
 *  3. names are a first name plus an initial, and none is reused from the old
 *     ValidTheme template's fake testimonials;
 *  4. **no earnings, salary, job or placement is claimed anywhere.** Each
 *     "now" describes work the person does, never a figure they earn.
 *
 * The six cover the routes people actually take into this trade, so the real
 * stories can be slotted into the same shapes: beginner → operator, tailor →
 * added a service, homemaker → paid work, operator → digitiser, student →
 * freelance designer, boutique owner → skill brought in-house.
 */
export const stories: Story[] = [
  {
    sample: true,
    nameEn: "Nikita B.",
    nameGu: "નિકિતા બ.",
    courseEn: "Zardosi Machine Embroidery",
    courseGu: "ઝરદોશી મશીન એમ્બ્રોઇડરી",
    quoteEn: "I had never sat at a machine. By the third week I was setting my own frame and choosing my own needle.",
    quoteGu: "મેં ક્યારેય મશીન પર બેઠી નહોતી. ત્રીજા અઠવાડિયે તો હું જાતે ફ્રેમ સેટ કરતી અને નીડલ પણ જાતે પસંદ કરતી.",
    beforeEn: "Never touched a machine",
    beforeGu: "ક્યારેય મશીનને હાથ નહોતો લગાડ્યો",
    afterEn: "Runs zardosi work on her own",
    afterGu: "જાતે ઝરદોશીનું કામ કરે છે",
    whyEn: "A cousin was doing zardosi job work and she wanted a skill that paid rather than a hobby class.",
    whyGu: "એક બહેન ઝરદોશીનું જોબ વર્ક કરતી હતી; એને શોખના ક્લાસ નહીં, કમાણી આપતી સ્કિલ જોઈતી હતી.",
    learnedEn: "Frame and stabiliser choice for heavy ground, metallic thread and needle pairing, and how to read relief height while working instead of after.",
    learnedGu: "હેવી ગ્રાઉન્ડ માટે ફ્રેમ અને સ્ટેબિલાઇઝર, મેટાલિક થ્રેડ અને નીડલનું જોડાણ, અને કામ પતી ગયા પછી નહીં પણ કરતાં કરતાં જ રિલીફની ઊંચાઈ વાંચવી.",
    changedEn: "Stopped guessing at the machine. Faults became things with causes rather than bad luck.",
    changedGu: "મશીન પર અંદાજ મારવાનું બંધ થયું. ભૂલો નસીબ નહીં, કારણવાળી વસ્તુ બની ગઈ.",
    nowEn: "Takes zardosi panel work for a local boutique.",
    nowGu: "એક લોકલ બુટિક માટે ઝરદોશી પેનલનું કામ લે છે.",
    photoLabel: "Student portrait at their machine (with consent)"
  },
  {
    sample: true,
    nameEn: "Mahesh V.",
    nameGu: "મહેશ વ.",
    courseEn: "Flat Embroidery",
    courseGu: "ફ્લેટ એમ્બ્રોઇડરી",
    quoteEn: "Customers kept asking for embroidery and I kept sending them somewhere else. Now the work stays in my shop.",
    quoteGu: "ગ્રાહકો એમ્બ્રોઇડરી માંગ્યા કરતા અને હું બીજે મોકલ્યા કરતો. હવે એ કામ મારી દુકાનમાં જ રહે છે.",
    beforeEn: "Tailor with a small shop",
    beforeGu: "નાની દુકાનવાળા ટેલર",
    afterEn: "Added embroidery to his own counter",
    afterGu: "પોતાના કાઉન્ટર પર એમ્બ્રોઇડરી ઉમેરી",
    whyEn: "He was sending every embroidery request to another unit and losing the customer along with the order.",
    whyGu: "એમ્બ્રોઇડરીની દરેક ઓર્ડર બીજા યુનિટમાં જતી, અને ઓર્ડરની સાથે ગ્રાહક પણ જતો રહેતો.",
    learnedEn: "Underlay, density and stitch direction, and how to hoop a garment that has already been stitched together.",
    learnedGu: "અન્ડરલે, ડેન્સિટી અને સ્ટિચ ડિરેક્શન, અને સીવાઈ ગયેલા ગારમેન્ટને હૂપમાં કેવી રીતે લેવું.",
    changedEn: "Small logo and monogram jobs stopped leaving the shop.",
    changedGu: "નાના લોગો અને મોનોગ્રામના કામ દુકાનની બહાર જવાનું બંધ થયું.",
    nowEn: "Runs tailoring and basic embroidery from the same counter.",
    nowGu: "એક જ કાઉન્ટર પરથી ટેલરિંગ અને બેઝિક એમ્બ્રોઇડરી ચલાવે છે.",
    photoLabel: "Student with finished piece (with consent)"
  },
  {
    sample: true,
    nameEn: "Bhavna S.",
    nameGu: "ભાવના સ.",
    courseEn: "Sequence (Sequins) Work",
    courseGu: "સિકવન્સ વર્ક",
    quoteEn: "Evening batch was the only reason I could do this at all. The house does not stop for a class.",
    quoteGu: "સાંજની બેચ હતી એટલે જ આ થઈ શક્યું. ઘર તો ક્લાસ માટે અટકતું નથી.",
    beforeEn: "Homemaker, no machine experience",
    beforeGu: "ગૃહિણી, મશીનનો કોઈ અનુભવ નહીં",
    afterEn: "Takes sequence job work from home",
    afterGu: "ઘરેથી સિકવન્સનું જોબ વર્ક લે છે",
    whyEn: "She wanted work she could do in her own hours, without leaving the house for a full day.",
    whyGu: "એને એવું કામ જોઈતું હતું જે પોતાના સમયે થાય, આખો દિવસ ઘરની બહાર રહ્યા વગર.",
    learnedEn: "Feed setup and registration, matching sequin size to the motif, and spotting a repeat that has drifted before the whole length is run.",
    learnedGu: "ફીડ સેટઅપ અને રજિસ્ટ્રેશન, મોટિફ પ્રમાણે સિકવન્સ સાઇઝ, અને આખી લંબાઈ ચલાવતાં પહેલાં ખસી ગયેલો રિપીટ પકડવો.",
    changedEn: "Finished a full dupatta length without a single re-run.",
    changedGu: "એક પણ વાર ફરીથી ચલાવ્યા વગર આખી દુપટ્ટાની લંબાઈ પૂરી કરી.",
    nowEn: "Takes sequence work for two nearby units.",
    nowGu: "આજુબાજુના બે યુનિટ માટે સિકવન્સનું કામ લે છે.",
    photoLabel: "Student portrait at their machine (with consent)"
  },
  {
    sample: true,
    nameEn: "Ashish T.",
    nameGu: "આશિષ ટ.",
    courseEn: "EMCAD DAHAO Embroidery Designing",
    courseGu: "EMCAD DAHAO એમ્બ્રોઇડરી ડિઝાઇનિંગ",
    quoteEn: "I ran other people's files for four years. I never knew a bad sample was usually a bad file.",
    quoteGu: "ચાર વર્ષ સુધી બીજાની ફાઇલ ચલાવી. મને ખબર જ નહોતી કે ખરાબ સેમ્પલ મોટે ભાગે ખરાબ ફાઇલનું પરિણામ હોય છે.",
    beforeEn: "Machine operator, four years",
    beforeGu: "મશીન ઓપરેટર, ચાર વર્ષ",
    afterEn: "Digitises the files he runs",
    afterGu: "જે ફાઇલ ચલાવે છે એ જાતે ડિજિટાઇઝ કરે છે",
    whyEn: "He was compensating at the machine for files he had not made, and losing time on every job.",
    whyGu: "જે ફાઇલ એણે બનાવી નહોતી એની ભરપાઈ મશીન પર કરતો, અને દરેક જોબમાં સમય ગુમાવતો.",
    learnedEn: "Stitch types, underlay, density and pull compensation in EMCAD DAHAO — then running his own file and correcting it from the sample.",
    learnedGu: "EMCAD DAHAO માં સ્ટિચ ટાઇપ, અન્ડરલે, ડેન્સિટી અને પુલ કોમ્પેન્સેશન — પછી પોતાની ફાઇલ ચલાવીને સેમ્પલ પરથી સુધારવી.",
    changedEn: "Fixes faults in the file now, so they stay fixed for every run.",
    changedGu: "હવે ભૂલો ફાઇલમાં જ સુધારે છે, એટલે દરેક રનમાં સુધરેલી જ રહે છે.",
    nowEn: "Operates and digitises at the same unit.",
    nowGu: "એક જ યુનિટમાં ઓપરેટિંગ અને ડિજિટાઇઝિંગ બંને કરે છે.",
    photoLabel: "Student at EMCAD DAHAO screen, stitch paths visible (with consent)"
  },
  {
    sample: true,
    nameEn: "Krupa D.",
    nameGu: "કૃપા દ.",
    courseEn: "EMCAD DAHAO Embroidery Designing",
    courseGu: "EMCAD DAHAO એમ્બ્રોઇડરી ડિઝાઇનિંગ",
    quoteEn: "Clients do not want a pretty picture. They want a file that runs.",
    quoteGu: "ક્લાયન્ટને સુંદર ચિત્ર નથી જોઈતું. એમને એવી ફાઇલ જોઈએ છે જે ચાલે.",
    beforeEn: "Design student, no production experience",
    beforeGu: "ડિઝાઇન સ્ટુડન્ટ, પ્રોડક્શનનો અનુભવ નહીં",
    afterEn: "Takes digitising work on her own",
    afterGu: "જાતે ડિજિટાઇઝિંગનું કામ લે છે",
    whyEn: "She could draw, but had never seen one of her designs on cloth and did not know why some worked and some did not.",
    whyGu: "એ દોરી શકતી હતી, પણ પોતાની ડિઝાઇન કાપડ પર જોઈ નહોતી, અને કઈ ચાલે ને કઈ નહીં એની ખબર નહોતી.",
    learnedEn: "Taking a client's artwork to a machine-ready file, then stitching it out and reading what the sample says about the file.",
    learnedGu: "ક્લાયન્ટના આર્ટવર્કથી મશીન-રેડી ફાઇલ સુધી, પછી એને સ્ટિચ કરીને સેમ્પલ ફાઇલ વિશે શું કહે છે એ વાંચવું.",
    changedEn: "Started quoting on stitch count and colour changes instead of guessing.",
    changedGu: "અંદાજને બદલે સ્ટિચ કાઉન્ટ અને કલર ચેન્જ પરથી ભાવ આપવાનું શરૂ કર્યું.",
    nowEn: "Freelances digitising for small units and boutiques.",
    nowGu: "નાના યુનિટ અને બુટિક માટે ફ્રીલાન્સ ડિજિટાઇઝિંગ કરે છે.",
    photoLabel: "Student at EMCAD DAHAO screen with a stitched sample (with consent)"
  },
  {
    sample: true,
    nameEn: "Priyanka R.",
    nameGu: "પ્રિયંકા ર.",
    courseEn: "Appliqué & 3D Embroidery",
    courseGu: "એપ્લિક અને 3D એમ્બ્રોઇડરી",
    quoteEn: "I was paying an outside unit and still fixing their edges myself. It made no sense to keep doing that.",
    quoteGu: "બહારના યુનિટને પૈસા આપતી અને છતાં એમની કિનારીઓ જાતે સુધારતી. આમ ચાલુ રાખવાનો કોઈ અર્થ નહોતો.",
    beforeEn: "Boutique owner, outsourcing embroidery",
    beforeGu: "બુટિક માલિક, એમ્બ્રોઇડરી બહાર કરાવતાં",
    afterEn: "Brought appliqué work in-house",
    afterGu: "એપ્લિકનું કામ પોતાની જગ્યાએ લાવ્યાં",
    whyEn: "Turnaround was slow and the finish came back inconsistent, which her customers noticed before she did.",
    whyGu: "કામ મોડું આવતું અને ફિનિશ દર વખતે અલગ રહેતી; એ વાત ગ્રાહકોએ એની પહેલાં નોંધી.",
    learnedEn: "Placement, tack-down and cover stitching, cutting cleanly in the frame, and matching foam thickness to letter width.",
    learnedGu: "પ્લેસમેન્ટ, ટેક-ડાઉન અને કવર સ્ટિચિંગ, ફ્રેમમાં જ સાફ કટિંગ, અને લેટરની પહોળાઈ પ્રમાણે ફોમની જાડાઈ.",
    changedEn: "Controls her own finish and her own delivery dates.",
    changedGu: "પોતાની ફિનિશ અને પોતાની ડિલિવરી ડેટ પોતાના હાથમાં.",
    nowEn: "Does appliqué and patch work for her own label.",
    nowGu: "પોતાના લેબલ માટે એપ્લિક અને પેચનું કામ કરે છે.",
    photoLabel: "Student with finished appliqué piece (with consent)"
  }
];

/* ---------------------------- machine case notes -------------------------- */

export type MachineCase = {
  /** Diagnosis notes are trade knowledge, so these are NOT sample content. */
  slug: string;
  techniqueEn: string;
  techniqueGu: string;
  /** The fault, as it presents on the floor. */
  problemEn: string;
  problemGu: string;
  /** What the sample actually told us. */
  diagnosisEn: string;
  diagnosisGu: string;
  /** The edit — in the file or in the setup. */
  changeEn: string;
  changeGu: string;
  /** The specific setting that moved. */
  settingEn: string;
  settingGu: string;
  /** What the next run produced. */
  resultEn: string;
  resultGu: string;
};

/**
 * Machine case notes: screen design → failed sample → diagnosis → correction →
 * finished output.
 *
 * These are **not sample content and carry no sample flag**, because they make
 * no claim about a person, a student, a client or an outcome. Each one is an
 * ordinary production fault with its ordinary cause — the note a supervisor
 * writes on the job card — and every statement in them is verifiable trade
 * knowledge that would be equally true in any embroidery unit in Surat.
 *
 * That is exactly why they are worth publishing. Generic praise from an
 * anonymous reviewer proves nothing; naming the fault, the diagnosis and the
 * setting that moved proves the studio runs production.
 */
export const machineCases: MachineCase[] = [
  {
    slug: "puckered-fill",
    techniqueEn: "Flat embroidery",
    techniqueGu: "ફ્લેટ એમ્બ્રોઇડરી",
    problemEn: "A filled motif came off the machine with the ground rippled around it. The design was fine; the fabric was not.",
    problemGu: "ભરેલું મોટિફ મશીન પરથી નીકળ્યું ત્યારે એની આસપાસ કાપડ લહેરાયેલું હતું. ડિઝાઇન બરાબર હતી, કાપડ નહીં.",
    diagnosisEn: "Puckering that follows the outline of a fill is the ground moving under the fill, not tension at the head. There was no underlay holding it.",
    diagnosisGu: "ફિલની આઉટલાઇન પ્રમાણે પકરિંગ થાય એટલે એ હેડનું ટેન્શન નહીં, ફિલ નીચે કાપડ ખસવાની નિશાની છે. એને પકડી રાખતું અન્ડરલે જ નહોતું.",
    changeEn: "Added an underlay layer under the fill and re-hooped with a firmer stabiliser for the cloth weight.",
    changeGu: "ફિલ નીચે અન્ડરલેનું લેયર ઉમેર્યું અને કાપડના વજન પ્રમાણે વધુ મજબૂત સ્ટેબિલાઇઝર સાથે ફરી હૂપ કર્યું.",
    settingEn: "File: edge-walk underlay added. Setup: stabiliser changed, hoop re-tensioned.",
    settingGu: "ફાઇલ: એજ-વોક અન્ડરલે ઉમેર્યું. સેટઅપ: સ્ટેબિલાઇઝર બદલ્યું, હૂપ ફરી ટાઇટ કર્યું.",
    resultEn: "Ground flat, fill edge clean, no re-hooping needed for the rest of the run.",
    resultGu: "કાપડ સપાટ, ફિલની કિનારી સાફ, બાકીના રનમાં ફરી હૂપ કરવાની જરૂર નહીં."
  },
  {
    slug: "thin-satin",
    techniqueEn: "Flat embroidery",
    techniqueGu: "ફ્લેટ એમ્બ્રોઇડરી",
    problemEn: "Satin columns looked starved — the ground showed through between the stitches in patches.",
    problemGu: "સાટિનના કોલમ ભૂખ્યા લાગતા હતા — જગ્યાએ જગ્યાએ ટાંકા વચ્ચેથી કાપડ દેખાતું હતું.",
    diagnosisEn: "Coverage failing only on the wider columns points at density set for a narrower stitch than the design actually runs.",
    diagnosisGu: "ફક્ત પહોળા કોલમમાં કવરેજ ખૂટે એટલે ડેન્સિટી ડિઝાઇન કરતાં સાંકડા સ્ટિચ માટે સેટ થયેલી છે એમ સમજવું.",
    changeEn: "Raised density on the affected columns and split the widest ones, rather than slowing the head to compensate.",
    changeGu: "અસરગ્રસ્ત કોલમની ડેન્સિટી વધારી અને સૌથી પહોળા કોલમ વિભાજિત કર્યા — હેડ ધીમી કરીને ભરપાઈ કરવાને બદલે.",
    settingEn: "File: density raised on wide columns; widest columns split into two passes.",
    settingGu: "ફાઇલ: પહોળા કોલમમાં ડેન્સિટી વધારી; સૌથી પહોળા કોલમ બે પાસમાં વહેંચ્યા.",
    resultEn: "Even coverage across the motif, and the same result on every machine the file was sent to.",
    resultGu: "આખા મોટિફમાં એકસરખું કવરેજ, અને ફાઇલ જે પણ મશીન પર મોકલી ત્યાં એ જ પરિણામ."
  },
  {
    slug: "sequence-registration",
    techniqueEn: "Sequence work",
    techniqueGu: "સિકવન્સ વર્ક",
    problemEn: "A repeat border drifted visibly across a dupatta length — the two ends did not match.",
    problemGu: "દુપટ્ટાની લંબાઈમાં રિપીટ બોર્ડર દેખીતી રીતે ખસી ગઈ — બંને છેડા સરખા નહોતા.",
    diagnosisEn: "Drift that accumulates along the length is registration, not feed. The travel order let the hoop shift before the design returned to that line.",
    diagnosisGu: "લંબાઈ સાથે વધતું જતું ખસવું એ ફીડ નહીં, રજિસ્ટ્રેશનની વાત છે. ડિઝાઇન એ લાઇન પર પાછી આવે એ પહેલાં ટ્રાવેલ ઓર્ડરે હૂપને ખસવા દીધું.",
    changeEn: "Re-cut the travel order so the border is completed in one direction before the fill returns, and re-framed with an extra hold point.",
    changeGu: "ટ્રાવેલ ઓર્ડર ફરી ગોઠવ્યો, જેથી ફિલ પાછું આવે એ પહેલાં બોર્ડર એક જ દિશામાં પૂરી થાય; અને એક વધારાના હોલ્ડ પોઇન્ટ સાથે ફરી ફ્રેમ કર્યું.",
    settingEn: "File: travel order re-sequenced. Setup: additional hold point in the frame.",
    settingGu: "ફાઇલ: ટ્રાવેલ ઓર્ડર ફરી ગોઠવ્યો. સેટઅપ: ફ્રેમમાં વધારાનો હોલ્ડ પોઇન્ટ.",
    resultEn: "Repeat held across the full length; both ends matched without trimming the panel.",
    resultGu: "આખી લંબાઈમાં રિપીટ જળવાયો; પેનલ કાપ્યા વગર બંને છેડા સરખા આવ્યા."
  },
  {
    slug: "metallic-breaks",
    techniqueEn: "Zardosi",
    techniqueGu: "ઝરદોશી",
    problemEn: "Metallic thread was shredding and snapping every few minutes on a heavy bridal ground.",
    problemGu: "હેવી બ્રાઇડલ ગ્રાઉન્ડ પર મેટાલિક થ્રેડ દર થોડી મિનિટે છોલાઈને તૂટતો હતો.",
    diagnosisEn: "Breaks clustered at direction changes rather than spread evenly: the thread was being asked to turn faster than a metallic will, through an eye that was too tight for it.",
    diagnosisGu: "તૂટવાનું સરખું ફેલાયેલું નહીં પણ દિશા બદલાય ત્યાં ભેગું થતું હતું: મેટાલિક જેટલી ઝડપે વળી શકે એના કરતાં ઝડપથી વળાવવામાં આવતું, અને આંખ પણ એના માટે સાંકડી હતી.",
    changeEn: "Moved to a needle with a larger eye and softened the sharpest direction changes in the path.",
    changeGu: "મોટી આંખવાળી નીડલ પર ગયા અને પાથમાં જે વળાંક સૌથી તીક્ષ્ણ હતા એ હળવા કર્યા.",
    settingEn: "Setup: larger-eye needle, top tension eased. File: sharpest corners rounded in the path.",
    settingGu: "સેટઅપ: મોટી આંખવાળી નીડલ, ઉપરનું ટેન્શન હળવું. ફાઇલ: પાથના સૌથી તીક્ષ્ણ ખૂણા ગોળ કર્યા.",
    resultEn: "Run completed without a break, and the relief height held where the corners had been losing it.",
    resultGu: "રન એક પણ વાર તૂટ્યા વગર પૂરો થયો, અને જ્યાં ખૂણે ઊંચાઈ ગુમાવાતી હતી ત્યાં પણ રિલીફ જળવાઈ."
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
    contextEn: "EMCAD DAHAO design",
    contextGu: "EMCAD DAHAO ડિઝાઇન",
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
  },
  {
    sample: true,
    nameEn: "Sneha K.",
    nameGu: "સ્નેહા ક.",
    contextEn: "Flat embroidery",
    contextGu: "ફ્લેટ એમ્બ્રોઇડરી",
    bodyEn:
      "Bija class ma khali jovanu male chhe. Ahiya potani machine par baithine kaam karvanu male chhe, ane bagade to pan sudharvanu shikhve chhe.",
    bodyGu:
      "બીજા ક્લાસમાં ખાલી જોવાનું મળે છે. અહીં પોતાની મશીન પર બેસીને કામ કરવાનું મળે છે, અને બગડે તો પણ સુધારવાનું શીખવે છે."
  },
  {
    sample: true,
    nameEn: "Alpesh P.",
    nameGu: "અલ્પેશ પ.",
    contextEn: "Appliqué and 3D work",
    contextGu: "એપ્લિક અને 3D વર્ક",
    bodyEn:
      "Cap ane jacket na patch ma foam dekhai jato hato. Ahiya letter width pramane foam ni jadai ane end kem band karva e shikhva malyu.",
    bodyGu:
      "કેપ અને જેકેટના પેચમાં ફોમ દેખાઈ જતો હતો. અહીં લેટરની પહોળાઈ પ્રમાણે ફોમની જાડાઈ અને છેડા કેમ બંધ કરવા એ શીખવા મળ્યું."
  },
  {
    sample: true,
    nameEn: "Foram T.",
    nameGu: "ફોરમ ટ.",
    contextEn: "Tufting",
    contextGu: "ટફ્ટિંગ",
    bodyEn:
      "Rug banavya pachhi pile nikli jato hato. Frame tension ane pachhal glue karvanu — be j vaat, pan koi kahe nahi. Ahiya pahela j divase kahi didhu.",
    bodyGu:
      "રગ બનાવ્યા પછી પાઇલ નીકળી જતો હતો. ફ્રેમ ટેન્શન અને પાછળ ગુંદર — બે જ વાત, પણ કોઈ કહે નહીં. અહીં પહેલા જ દિવસે કહી દીધું."
  },
  {
    sample: true,
    nameEn: "Dhaval S.",
    nameGu: "ધવલ સ.",
    contextEn: "Chain and multi machine",
    contextGu: "ચેઇન અને મલ્ટી મશીન",
    bodyEn:
      "Multi-head par badha head sarkha nahota aavta. Framing ane changeover ni shist — e j problem hato. Have traney panel sarkha aave chhe.",
    bodyGu:
      "મલ્ટી-હેડ પર બધા હેડ સરખા નહોતા આવતા. ફ્રેમિંગ અને ચેન્જઓવરની શિસ્ત — એ જ પ્રોબ્લેમ હતો. હવે ત્રણેય પેનલ સરખી આવે છે."
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
  /** Links the piece back to the course that produced it, where known. */
  courseSlug?: string;
  /** The technical thing this piece demonstrates — optional, and specific. */
  outcomeEn?: string;
  outcomeGu?: string;
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
    emcad: { labelEn: "EMCAD DAHAO", labelGu: "EMCAD DAHAO", color: "" }
  };

/**
 * ⚠️ SAMPLE gallery entries — these are shoot-list rows, not student work.
 *
 * They render with their `photoLabel` in a <PhotoSlot> and a visible
 * <SampleTag />, so what a visitor sees is an honest "this shot is planned"
 * rather than a fabricated piece. `outcome` names the technical thing each
 * piece is meant to demonstrate, which is the field that makes a gallery
 * useful to someone deciding what to learn.
 *
 * Content Desk replaces this list wholesale the moment one consented piece is
 * published — see `getPublicGallery`.
 */
export const galleryItems: GalleryItem[] = [
  { sample: true, technique: "zardosi", ratio: "4/5", titleEn: "Bridal zardosi panel", titleGu: "બ્રાઇડલ ઝરદોશી પેનલ", noteEn: "Final project, evening batch", noteGu: "ફાઇનલ પ્રોજેક્ટ, સાંજની બેચ", hasPair: true, photoLabel: "Zardosi bridal panel, macro", courseSlug: "zardosi-machine-embroidery", outcomeEn: "Relief height held through the corners", outcomeGu: "ખૂણા સુધી રિલીફની ઊંચાઈ જળવાઈ" },
  { sample: true, technique: "sequence", ratio: "1/1", titleEn: "Festive sequence dupatta", titleGu: "ફેસ્ટિવ સિકવન્સ દુપટ્ટા", noteEn: "Week 5 production drill", noteGu: "અઠવાડિયું 5, પ્રોડક્શન પ્રેક્ટિસ", hasPair: false, photoLabel: "Sequence dupatta shimmer", courseSlug: "sequence-work", outcomeEn: "Repeat held across a full dupatta length", outcomeGu: "આખી દુપટ્ટાની લંબાઈમાં રિપીટ જળવાયો" },
  { sample: true, technique: "emcad", ratio: "3/2", titleEn: "Peacock motif, screen to stitch", titleGu: "મોર મોટિફ, સ્ક્રીનથી સ્ટિચ સુધી", noteEn: "EMCAD DAHAO design + stitched result", noteGu: "EMCAD DAHAO ડિઝાઇન + સીવેલું પરિણામ", hasPair: true, photoLabel: "EMCAD DAHAO peacock design beside stitched fabric", courseSlug: "emcad-embroidery-design", outcomeEn: "File ran first time, no correction pass", outcomeGu: "ફાઇલ પહેલી જ વારમાં ચાલી, કરેક્શન વગર" },
  { sample: true, technique: "beads", ratio: "4/5", titleEn: "4-beads border run", titleGu: "4-બીડ્સ બોર્ડર રન", noteEn: "First full production run", noteGu: "પહેલો આખો પ્રોડક્શન રન", hasPair: false, photoLabel: "Beads border close-up", courseSlug: "four-beads-machine-work", outcomeEn: "Even spacing with no feed stoppage", outcomeGu: "ફીડ અટક્યા વગર એકસરખું સ્પેસિંગ" },
  { sample: true, technique: "tufting", ratio: "1/1", titleEn: "Tufted name board", titleGu: "ટફ્ટેડ નેમ બોર્ડ", noteEn: "Weekend batch product", noteGu: "વીકએન્ડ બેચની પ્રોડક્ટ", hasPair: false, photoLabel: "Tufted rug piece, colourful", courseSlug: "tufting", outcomeEn: "Even pile height, backing glued off", outcomeGu: "એકસરખી પાઇલ ઊંચાઈ, પાછળ ગુંદર લગાવેલું" },
  { sample: true, technique: "laser", ratio: "4/5", titleEn: "Laser-cut appliqué yoke", titleGu: "લેસર-કટ એપ્લિક યોક", noteEn: "Combined laser + embroidery", noteGu: "લેસર + એમ્બ્રોઇડરી સાથે", hasPair: true, photoLabel: "Laser-cut fabric layered piece", courseSlug: "laser-work", outcomeEn: "Sealed edges, no scorch on light ground", outcomeGu: "સીલ થયેલી કિનારી, હળવા ગ્રાઉન્ડ પર બળ્યા વગર" }
];

/* --------------------------------- services -------------------------------- */

export type ServiceItem = { titleEn: string; titleGu: string; descEn: string; descGu: string };

// ⚠️ CONFIRM-WITH-OWNER: final service list before launch (plan 9.6).
export const services: ServiceItem[] = [
  { titleEn: "Embroidery design development", titleGu: "એમ્બ્રોઇડરી ડિઝાઇન ડેવલપમેન્ટ", descEn: "Original designs developed for your garment, from concept to approved artwork.", descGu: "તમારા ગારમેન્ટ માટે ઓરિજિનલ ડિઝાઇન: કન્સેપ્ટથી ફાઇનલ આર્ટવર્ક સુધી." },
  { titleEn: "EMCAD DAHAO digitizing", titleGu: "EMCAD DAHAO ડિજિટાઇઝિંગ", descEn: "Your artwork converted into clean, machine-ready embroidery files.", descGu: "તમારું આર્ટવર્ક ચોખ્ખી, મશીન-રેડી એમ્બ્રોઇડરી ફાઇલમાં." },
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
/* --------------------------- studio (B2B) content ------------------------- */

export type StudioProblem = {
  slug: string;
  /** The situation a business arrives with. */
  askEn: string;
  askGu: string;
  /** What the studio calls that work. */
  serviceEn: string;
  serviceGu: string;
  /** What comes back. */
  returnsEn: string;
  returnsGu: string;
};

/**
 * Problem-led studio services.
 *
 * A business does not arrive looking for "digitising"; it arrives with a
 * sample it has no file for, or a design that stitches badly at production
 * speed. Naming the situation first and the service second is the difference
 * between a services page a buyer recognises themselves in and a list of
 * nouns.
 *
 * Every service named here is one the studio already advertises. Nothing was
 * invented to fill the section out.
 */
export const studioProblems: StudioProblem[] = [
  {
    slug: "no-source-file",
    askEn: "You have a physical sample and no source file.",
    askGu: "તમારી પાસે ફિઝિકલ સેમ્પલ છે પણ સોર્સ ફાઇલ નથી.",
    serviceEn: "Sample reconstruction",
    serviceGu: "સેમ્પલ રિકન્સ્ટ્રક્શન",
    returnsEn: "The piece read back into a machine-ready file — stitch types, density and travel order rebuilt so the next run matches the sample in your hand.",
    returnsGu: "એ પીસને વાંચીને મશીન-રેડી ફાઇલમાં ફેરવવું — સ્ટિચ ટાઇપ, ડેન્સિટી અને ટ્રાવેલ ઓર્ડર ફરી બનાવીને, જેથી પછીનો રન તમારા હાથમાંના સેમ્પલ જેવો જ આવે."
  },
  {
    slug: "fails-at-speed",
    askEn: "The file stitches badly once the machine is at production speed.",
    askGu: "મશીન પ્રોડક્શન સ્પીડ પર આવે એટલે ફાઇલ ખરાબ સીવાય છે.",
    serviceEn: "Production correction",
    serviceGu: "પ્રોડક્શન કરેક્શન",
    returnsEn: "The fault diagnosed from a stitch-out and fixed in the file — underlay, density, pathing, pull compensation — rather than by slowing the head down and shipping it anyway.",
    returnsGu: "સ્ટિચ-આઉટ પરથી ભૂલનું નિદાન અને ફાઇલમાં જ સુધારો — અન્ડરલે, ડેન્સિટી, પાથિંગ, પુલ કોમ્પેન્સેશન — હેડ ધીમી કરીને એમ જ માલ મોકલવાને બદલે."
  },
  {
    slug: "bead-sequence-setup",
    askEn: "You need bead or sequence placement that holds across a length.",
    askGu: "તમને બીડ કે સિકવન્સનું એવું પ્લેસમેન્ટ જોઈએ છે જે આખી લંબાઈમાં ટકે.",
    serviceEn: "Specialised digitising and setup",
    serviceGu: "સ્પેશિયલાઇઝ્ડ ડિજિટાઇઝિંગ અને સેટઅપ",
    returnsEn: "Feed, registration and travel order built for the machine that will run it, so a repeat does not drift between one end of a panel and the other.",
    returnsGu: "જે મશીન પર ચાલવાનું છે એના માટે ફીડ, રજિસ્ટ્રેશન અને ટ્રાવેલ ઓર્ડર — જેથી પેનલના એક છેડાથી બીજા છેડા સુધી રિપીટ ખસે નહીં."
  },
  {
    slug: "concept-to-sample",
    askEn: "You want a specific embellished look and no design for it yet.",
    askGu: "તમને ચોક્કસ એમ્બેલિશ્ડ લુક જોઈએ છે, પણ એની ડિઝાઇન હજી નથી.",
    serviceEn: "Design development",
    serviceGu: "ડિઝાઇન ડેવલપમેન્ટ",
    returnsEn: "Concept worked up against the technique that will actually produce it — zardosi, beads, sequence, appliqué, 3D — and taken to a sample you can approve.",
    returnsGu: "જે ટેકનિકથી ખરેખર બનવાનું છે એને ધ્યાનમાં રાખીને કન્સેપ્ટ તૈયાર — ઝરદોશી, બીડ્સ, સિકવન્સ, એપ્લિક, 3D — અને તમે મંજૂર કરી શકો એવા સેમ્પલ સુધી."
  }
];

export type StudioProject = {
  /** Always true: these are generic project types, not real commissions. */
  sample: boolean;
  titleEn: string;
  titleGu: string;
  techniqueEn: string;
  techniqueGu: string;
  briefEn: string;
  briefGu: string;
  deliveredEn: string;
  deliveredGu: string;
};

/**
 * ⚠️ SAMPLE studio projects — generic work types, not real commissions.
 *
 * The line these hold: a project type ("bridal blouse panel") is a description
 * of ordinary trade work and is safe to show as an illustration; a named
 * client, a logo, or an implied endorsement is not, and none appears here.
 * Every card is tagged, and none of it enters structured data.
 */
export const studioProjects: StudioProject[] = [
  {
    sample: true,
    titleEn: "Bridal blouse panel",
    titleGu: "બ્રાઇડલ બ્લાઉઝ પેનલ",
    techniqueEn: "Zardosi + beads",
    techniqueGu: "ઝરદોશી + બીડ્સ",
    briefEn: "A reference photograph and a fabric swatch, with no file and a fixed delivery date.",
    briefGu: "એક રેફરન્સ ફોટો અને કાપડનો નમૂનો, ફાઇલ વગર અને નક્કી ડિલિવરી ડેટ સાથે.",
    deliveredEn: "Digitised panel, one stitched sample for approval, then the production file.",
    deliveredGu: "ડિજિટાઇઝ કરેલી પેનલ, મંજૂરી માટે એક સીવેલું સેમ્પલ, પછી પ્રોડક્શન ફાઇલ."
  },
  {
    sample: true,
    titleEn: "Repeat border, by the metre",
    titleGu: "મીટરના હિસાબે રિપીટ બોર્ડર",
    techniqueEn: "Sequence work",
    techniqueGu: "સિકવન્સ વર્ક",
    briefEn: "An existing file that drifted out of register across a dupatta length.",
    briefGu: "એક જૂની ફાઇલ, જે દુપટ્ટાની લંબાઈમાં રજિસ્ટરની બહાર ખસી જતી હતી.",
    deliveredEn: "Travel order re-cut and framing advice, with a corrected file that holds across the full length.",
    deliveredGu: "ટ્રાવેલ ઓર્ડર ફરી ગોઠવ્યો અને ફ્રેમિંગની સલાહ, સાથે સુધારેલી ફાઇલ જે આખી લંબાઈમાં ટકે."
  },
  {
    sample: true,
    titleEn: "Uniform logo patches",
    titleGu: "યુનિફોર્મ લોગો પેચ",
    techniqueEn: "Flat + appliqué",
    techniqueGu: "ફ્લેટ + એપ્લિક",
    briefEn: "Artwork supplied at the wrong scale for the patch size required.",
    briefGu: "જે સાઇઝના પેચ જોઈએ એના માટે ખોટા સ્કેલનું આર્ટવર્ક મળ્યું.",
    deliveredEn: "Redrawn at size with legible small text, a sew-out for approval, and the file in the format the unit's machine takes.",
    deliveredGu: "સાઇઝ પ્રમાણે ફરી દોર્યું, નાનું લખાણ વંચાય એ રીતે; મંજૂરી માટે સ્યુ-આઉટ, અને યુનિટની મશીન લે એ ફોર્મેટમાં ફાઇલ."
  }
];

export type Trainer = {
  /** Always true today: no trainer has been confirmed by the owner. */
  sample: boolean;
  slug: string;
  nameEn: string;
  nameGu: string;
  roleEn: string;
  roleGu: string;
  focusEn: string;
  focusGu: string;
  /** What they are the person to ask about. */
  specialityEn: string;
  specialityGu: string;
  /** Machines they teach on. */
  machinesEn: string[];
  machinesGu: string[];
  /** Only where a trainer genuinely teaches software. */
  softwareEn?: string;
  softwareGu?: string;
  /** Stated as a range, never as a precise year count. */
  experienceEn: string;
  experienceGu: string;
  /** How they run a session — the thing students actually ask about. */
  teachingEn: string;
  teachingGu: string;
  /** Kinds of work, not named clients. */
  selectedWorkEn: string[];
  selectedWorkGu: string[];
  photoLabel: string;
};

/**
 * ⚠️ SAMPLE trainers — three invented identities, built to exercise the
 * profile layout. **No trainer at Karma has been confirmed by the owner**, and
 * `docs/content-checklist.md` tracks that as an open question.
 *
 * The rules that make this safe to ship on a publicly-reachable deployment:
 *
 *  1. `sample: true` and a visible <SampleTag /> on every profile;
 *  2. none of this becomes `Person` or `EducationalOrganization.employee`
 *     structured data — a fabricated named person in schema is a different
 *     order of problem from a labelled card;
 *  3. none of the old ValidTheme template's trainer names is reused;
 *  4. experience is a range, never a precise year count, and no award,
 *     certification, employer or student result is claimed.
 *
 * The three cover the teaching the catalogue actually needs: heavy machine
 * work, the modern techniques, and digitising.
 */
export const trainers: Trainer[] = [
  {
    sample: true,
    slug: "sample-machine-trainer",
    nameEn: "Sample: Rajesh M.",
    nameGu: "નમૂનો: રાજેશ મ.",
    roleEn: "Machine embroidery — heavy work",
    roleGu: "મશીન એમ્બ્રોઇડરી — હેવી વર્ક",
    focusEn: "Years on a production floor before teaching. Comes back to the same idea in every session: the fault has a cause, and the cause is usually upstream of where you noticed it.",
    focusGu: "ભણાવતાં પહેલાં પ્રોડક્શન ફ્લોર પર વર્ષોનો અનુભવ. દરેક સેશનમાં એક જ વાત ફરી ફરી કહે છે: ભૂલનું કારણ હોય છે, અને એ કારણ મોટે ભાગે તમે જ્યાં ભૂલ જોઈ ત્યાંથી પહેલાં હોય છે.",
    specialityEn: "Zardosi and heavy relief work on bridal ground.",
    specialityGu: "બ્રાઇડલ ગ્રાઉન્ડ પર ઝરદોશી અને હેવી રિલીફ વર્ક.",
    machinesEn: ["Zardosi hand-guided", "Flat embroidery", "4-beads"],
    machinesGu: ["ઝરદોશી હેન્ડ-ગાઇડેડ", "ફ્લેટ એમ્બ્રોઇડરી", "4-બીડ્સ"],
    experienceEn: "Over a decade on production machines",
    experienceGu: "પ્રોડક્શન મશીન પર દસ વર્ષથી વધુ",
    teachingEn: "Sits beside you at the machine rather than demonstrating from the front, and will make you re-run a sample until you can say why it failed.",
    teachingGu: "આગળ ઊભા રહીને બતાવવાને બદલે મશીન પર તમારી બાજુમાં બેસે છે, અને જ્યાં સુધી તમે જાતે ન કહી શકો કે સેમ્પલ કેમ બગડ્યું ત્યાં સુધી ફરી ચલાવડાવે છે.",
    selectedWorkEn: ["Bridal lehenga and dupatta panels", "Sherwani borders", "Boutique yoke and blouse work"],
    selectedWorkGu: ["બ્રાઇડલ લહેંગા અને દુપટ્ટા પેનલ", "શેરવાનીની બોર્ડર", "બુટિક યોક અને બ્લાઉઝનું કામ"],
    photoLabel: "Trainer portrait at their machine (with consent)"
  },
  {
    sample: true,
    slug: "sample-design-trainer",
    nameEn: "Sample: Nidhi P.",
    nameGu: "નમૂનો: નિધિ પ.",
    roleEn: "EMCAD DAHAO design and digitising",
    roleGu: "EMCAD DAHAO ડિઝાઇન અને ડિજિટાઇઝિંગ",
    focusEn: "Teaches digitising as a production job, not a drawing class: a file is not finished until it has stitched out and been corrected.",
    focusGu: "ડિજિટાઇઝિંગને ડ્રોઇંગ ક્લાસ નહીં, પ્રોડક્શન જોબ તરીકે શીખવે છે: ફાઇલ સ્ટિચ-આઉટ થઈને સુધરે નહીં ત્યાં સુધી પૂરી ન કહેવાય.",
    specialityEn: "Turning client artwork into files that run first time.",
    specialityGu: "ક્લાયન્ટના આર્ટવર્કને પહેલી જ વારમાં ચાલે એવી ફાઇલમાં ફેરવવું.",
    machinesEn: ["Design workstations", "Flat embroidery for stitch-outs"],
    machinesGu: ["ડિઝાઇન વર્કસ્ટેશન", "સ્ટિચ-આઉટ માટે ફ્લેટ એમ્બ્રોઇડરી"],
    softwareEn: "EMCAD DAHAO. Teaches the decisions — underlay, density, stitch types, pull compensation, travel order — against the machine that will run them.",
    softwareGu: "EMCAD DAHAO. અન્ડરલે, ડેન્સિટી, સ્ટિચ ટાઇપ, પુલ કોમ્પેન્સેશન અને ટ્રાવેલ ઓર્ડર — આ નિર્ણયો જે મશીન ચલાવવાની છે એની સામે રાખીને શીખવે છે.",
    experienceEn: "Several years digitising for production",
    experienceGu: "પ્રોડક્શન માટે ડિજિટાઇઝિંગનો કેટલાંક વર્ષોનો અનુભવ",
    teachingEn: "Every file gets stitched out in the same week it is built, so students learn from their own sample rather than from a screen preview.",
    teachingGu: "દરેક ફાઇલ જે અઠવાડિયે બને એ જ અઠવાડિયે સ્ટિચ-આઉટ થાય છે, જેથી સ્ટુડન્ટ સ્ક્રીન પ્રિવ્યૂ નહીં પણ પોતાના સેમ્પલ પરથી શીખે.",
    selectedWorkEn: ["Production files for multi-head runs", "Logo and monogram digitising", "Correction work on files that failed elsewhere"],
    selectedWorkGu: ["મલ્ટી-હેડ રન માટે પ્રોડક્શન ફાઇલ", "લોગો અને મોનોગ્રામ ડિજિટાઇઝિંગ", "બીજે બગડેલી ફાઇલોનું કરેક્શન"],
    photoLabel: "Trainer at EMCAD DAHAO screen, stitch paths visible (with consent)"
  },
  {
    sample: true,
    slug: "sample-modern-trainer",
    nameEn: "Sample: Kiran J.",
    nameGu: "નમૂનો: કિરણ જ.",
    roleEn: "Laser work and tufting",
    roleGu: "લેસર વર્ક અને ટફ્ટિંગ",
    focusEn: "The newer techniques, taught with their limits stated first — which materials must never go under a laser, and what a tufted piece needs before it will survive being walked on.",
    focusGu: "નવી ટેકનિક, જેની મર્યાદા પહેલાં કહેવાય છે — કયું મટીરિયલ લેસર નીચે ક્યારેય ન મૂકવું, અને ટફ્ટેડ પીસ પર ચાલી શકાય એ માટે એને શું જોઈએ.",
    specialityEn: "Cut-work layouts and tufted pieces that hold together.",
    specialityGu: "કટ-વર્ક લેઆઉટ અને ટકી રહે એવા ટફ્ટેડ પીસ.",
    machinesEn: ["Laser cutting and etching", "Tufting guns on frame"],
    machinesGu: ["લેસર કટિંગ અને એચિંગ", "ફ્રેમ પર ટફ્ટિંગ ગન"],
    experienceEn: "Several years on cut-work and tufted production",
    experienceGu: "કટ-વર્ક અને ટફ્ટેડ પ્રોડક્શનનો કેટલાંક વર્ષોનો અનુભવ",
    teachingEn: "Starts every material with a test piece, because the settings that worked yesterday belong to yesterday's cloth.",
    teachingGu: "દરેક મટીરિયલની શરૂઆત ટેસ્ટ પીસથી કરે છે, કારણ કે ગઈ કાલે ચાલેલી સેટિંગ ગઈ કાલના કાપડની હતી.",
    selectedWorkEn: ["Cut-work dupattas and dress panels", "Custom rugs and wall pieces", "Etched detail combined with embroidery"],
    selectedWorkGu: ["કટ-વર્ક દુપટ્ટા અને ડ્રેસ પેનલ", "કસ્ટમ રગ અને વોલ પીસ", "એમ્બ્રોઇડરી સાથે જોડેલી એચ કરેલી ડિટેલ"],
    photoLabel: "Trainer at the tufting frame (with consent)"
  }
];
