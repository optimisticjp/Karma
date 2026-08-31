/**
 * Course catalog.
 *
 * The first eight are the VERIFIED list from the studio's own YouTube bio
 * (Zardosi, 4-Beads, Coding, Chain, Multi, Sequence, Laser, Tufting + EMCAD DAHAO),
 * NOT the old template's fictional list. See master plan, decision log #1.
 *
 * Flat Embroidery, Appliqué & 3D and Cross Stitch were added after the owner
 * confirmed (2026-08-29) that they are taught. They are advertised on the
 * studio's own site; that site is otherwise template filler, so they were held
 * back until the owner said so directly.
 *
 * ORDERING: new courses are APPENDED, never inserted. `VERIFIED_CATALOG_ROWS`
 * derives `sortOrder` from array position, and the owner's import upserts with
 * `onConflictDoNothing` — so reordering this array would leave already-imported
 * rows holding stale sort positions and collide with the new ones. Public
 * surfaces group by family for display instead.
 *
 * ⚠️ CONFIRM-WITH-OWNER (Q1): durations and module topics are drafts for every
 * course EXCEPT emcad-embroidery-design, whose duration, fee plan, timetable,
 * free-demo policy and curriculum the owner confirmed in writing on
 * 2026-08-30. Those verified facts live in `src/content/course-operations.ts`
 * and must NOT be copied onto any other course.
 *
 * ⚠️ KARMA TEACHES EMCAD DAHAO, AND ONLY EMCAD DAHAO. It does not teach
 * Wilcom, and nothing on this site may imply that it does or invite the
 * question. Owner decision, 2026-08-30; it is also admission norm #1 and #3.
 *
 * Content here is the editorial source of truth; the `courses` table is the
 * operational one (seed and Karma Console import both project from this file).
 */

export type CourseModule = {
  titleEn: string;
  titleGu: string;
  pointsEn: string[];
  pointsGu: string[];
};

export type Course = {
  slug: string;
  family: "machine" | "modern" | "software";
  nameEn: string;
  nameGu: string;
  leadEn: string;
  leadGu: string;
  whoEn: string;
  whoGu: string;
  outcomesEn: string[];
  outcomesGu: string[];
  durationWeeks: number | null; // null = confirm with owner
  /**
   * Months, where the owner has confirmed a duration. Kept separate from weeks
   * on purpose: the institute says "3 Months", and silently rendering that as
   * "12 weeks" would be this repository restating a business fact in a shape
   * the business did not choose.
   */
  durationMonths: number | null;
  photoLabel: string; // shoot-list label for the PhotoSlot
  modules: CourseModule[];
  production: CourseProduction;
};

/**
 * What the technique makes, what it fixes, and what it runs on.
 *
 * This is trade knowledge about the technique — the same facts a supervisor
 * would give a new operator — NOT a claim about Karma. Nothing here asserts a
 * duration, a fee, a student outcome or a placement, and nothing here needs
 * owner confirmation to be true, because none of it is about this business.
 *
 * `software` is optional and deliberately so: only the design course teaches a
 * digitising package, and claiming otherwise would be a false statement about
 * what a course covers. Where it is set, it names EMCAD DAHAO — the one package
 * Karma teaches — and names nothing else.
 */
export type CourseProduction = {
  /** One sentence: what this technique physically produces. */
  producesEn: string;
  producesGu: string;
  /** Production faults this technique's training exists to prevent. */
  problemsEn: string[];
  problemsGu: string[];
  /** The machine it is run on. */
  machineEn: string;
  machineGu: string;
  /** Only where a course genuinely involves design software. */
  softwareEn?: string;
  softwareGu?: string;
  /** What the hands actually do on the floor. */
  practiceEn: string;
  practiceGu: string;
  /** What the finished work sells as. */
  outputsEn: string[];
  outputsGu: string[];
};

export const families = {
  machine: {
    nameEn: "Machine Embroidery",
    nameGu: "મશીન એમ્બ્રોઇડરી",
    introEn:
      "The work Surat is famous for. Flat, zardosi, 4-beads, sequence, coding, chain/multi, appliqué, 3D and cross stitch, learned the only way that works: at the machine, with a trainer beside you.",
    introGu:
      "જે કામ માટે સુરત જાણીતું છે એ જ કામ. ફ્લેટ, ઝરદોશી, 4-બીડ્સ, સિકવન્સ, કોડિંગ, ચેઇન/મલ્ટી, એપ્લિક, 3D અને ક્રોસ સ્ટિચ: મશીન પર બેસીને, ટ્રેનર સાથે શીખો. એ જ સાચી રીત છે.",
    photoLabel: "Zardosi machine close-up, hands guiding fabric"
  },
  modern: {
    nameEn: "Modern Techniques",
    nameGu: "મોડર્ન ટેકનિક્સ",
    introEn:
      "Laser work and tufting: the newer skills boutiques and studios are hiring for right now.",
    introGu:
      "લેસર વર્ક અને ટફ્ટિંગ: આજકાલ બુટિક અને સ્ટુડિયો જેની સૌથી વધુ માંગ કરે છે એ નવી સ્કિલ્સ.",
    photoLabel: "Tufting gun on frame, colourful yarn"
  },
  software: {
    nameEn: "Design Software",
    nameGu: "ડિઝાઇન સોફ્ટવેર",
    introEn:
      "EMCAD DAHAO embroidery designing: create the designs the machines stitch, and prove every one of them on the machine. The skill that turns an operator into a designer.",
    introGu:
      "EMCAD DAHAO એમ્બ્રોઇડરી ડિઝાઇનિંગ: મશીન જે સીવે છે એ ડિઝાઇન તમે બનાવો, અને દરેક ડિઝાઇન મશીન પર જ સાબિત કરો. ઓપરેટરમાંથી ડિઝાઇનર બનાવતી સ્કિલ.",
    photoLabel: "EMCAD DAHAO screen with visible stitch paths"
  }
} as const;

/**
 * The shared draft syllabus.
 *
 * **No module title may carry a week or a month.** These titles used to read
 * "Weeks 1-2", "Weeks 3-4", "Weeks 5-6" and "Final week", which published a
 * seven-week duration for ten courses whose duration the owner has NOT
 * confirmed — and contradicted the one course that has (three months). The
 * order is carried by the module index instead, which is what the order
 * actually is. See `CLAUDE.md` §3; `tests/kds-courses.test.ts` enforces it.
 */
const draftModules = (topic: string, topicGu: string): CourseModule[] => [
  {
    titleEn: "Machine, frame and material basics",
    titleGu: "મશીન, ફ્રેમ અને મટીરિયલ બેઝિક્સ",
    pointsEn: [
      "Machine parts, safety and daily care",
      "Frame setting and fabric tension, so your stitches stop breaking",
      "Thread, needle and material selection"
    ],
    pointsGu: [
      "મશીનના ભાગ, સેફ્ટી અને રોજની સંભાળ",
      "ફ્રેમ સેટિંગ અને ફેબ્રિક ટેન્શન, જેથી ટાંકા તૂટતા બંધ થાય",
      "દોરો, નીડલ અને મટીરિયલની પસંદગી"
    ]
  },
  {
    titleEn: `Core ${topic} technique`,
    titleGu: `${topicGu}ની મુખ્ય ટેકનિક`,
    pointsEn: [
      "Base stitches and control drills on live machines",
      "Reading a design and planning the work",
      "Common mistakes and how to fix them on the spot"
    ],
    pointsGu: [
      "લાઇવ મશીન પર બેઝિક ટાંકા અને કંટ્રોલ પ્રેક્ટિસ",
      "ડિઝાઇન વાંચીને કામનું પ્લાનિંગ",
      "સામાન્ય ભૂલો અને તરત સુધારવાની રીત"
    ]
  },
  {
    titleEn: "Speed, finish and production quality",
    titleGu: "સ્પીડ, ફિનિશ અને પ્રોડક્શન ક્વોલિટી",
    pointsEn: [
      "Production speed without losing finish",
      "Quality checks the market actually applies",
      "Costing basics: what this work is paid"
    ],
    pointsGu: [
      "ફિનિશ બગાડ્યા વગર પ્રોડક્શન સ્પીડ",
      "માર્કેટમાં ખરેખર ચાલતા ક્વોલિટી ચેક",
      "કોસ્ટિંગ બેઝિક્સ: આ કામના કેટલા મળે"
    ]
  },
  {
    titleEn: "Your finished project",
    titleGu: "તમારો ફાઇનલ પ્રોજેક્ટ",
    pointsEn: [
      "A complete piece, start to finish, on your own",
      "Trainer review and certificate eligibility check",
      "Career and business guidance session"
    ],
    pointsGu: [
      "એક આખો પીસ, શરૂઆતથી અંત સુધી, જાતે",
      "ટ્રેનર રિવ્યૂ અને સર્ટિફિકેટ એલિજિબિલિટી ચેક",
      "કરિયર અને બિઝનેસ ગાઇડન્સ સેશન"
    ]
  }
];

export const courses: Course[] = [
  {
    slug: "zardosi-machine-embroidery",
    family: "machine",
    nameEn: "Zardosi Machine Embroidery",
    nameGu: "ઝરદોશી મશીન એમ્બ્રોઇડરી",
    leadEn:
      "From frame setting and needle control to bridal-grade production work, on live zardosi machines from day one.",
    leadGu:
      "ફ્રેમ સેટિંગ અને નીડલ કંટ્રોલથી લઈને બ્રાઇડલ-ગ્રેડ પ્રોડક્શન કામ સુધી: પહેલા દિવસથી જ લાઇવ ઝરદોશી મશીન પર.",
    whoEn:
      "Beginners who've never touched a machine, tailors adding zardosi to their shop, and homemakers who want paying work from a real skill. Bring your interest; we bring the machines.",
    whoGu:
      "જેમણે ક્યારેય મશીનને હાથ નથી લગાડ્યો એવા બિગિનર્સ, પોતાની દુકાનમાં ઝરદોશી ઉમેરવા માંગતા ટેલર્સ, અને સાચી સ્કિલથી કમાવા માંગતાં ગૃહિણીઓ. તમે રસ લાવો; મશીન અમે લાવીશું.",
    outcomesEn: [
      "Run a zardosi machine confidently, from setup to finish",
      "Produce bridal-grade pieces the market pays for",
      "Know your costing, speed and quality benchmarks"
    ],
    outcomesGu: [
      "સેટઅપથી ફિનિશ સુધી ઝરદોશી મશીન આત્મવિશ્વાસથી ચલાવો",
      "માર્કેટ જેના પૈસા આપે એવા બ્રાઇડલ-ગ્રેડ પીસ બનાવો",
      "કોસ્ટિંગ, સ્પીડ અને ક્વોલિટીના માપદંડ સમજો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Zardosi machine with gold thread work in progress",
    production: {
      producesEn: "Raised metallic work — zari, dabka and kasab laid in relief on bridal lehengas, dupattas, sherwanis and heavy blouse panels.",
      producesGu: "ઊપસેલું મેટાલિક કામ — બ્રાઇડલ લહેંગા, દુપટ્ટા, શેરવાની અને હેવી બ્લાઉઝ પેનલ પર રિલીફમાં લગાવેલા ઝરી, ડબકા અને કસબ.",
      problemsEn: [
        "Metallic thread shredding and snapping mid-run",
        "Relief that flattens under the presser or collapses after washing",
        "Heavy panels puckering because the ground was never stabilised"
      ],
      problemsGu: [
        "મેટાલિક થ્રેડ વચ્ચે જ છોલાઈને તૂટવો",
        "પ્રેસર નીચે ઊંચાઈ દબાઈ જવી, કે ધોયા પછી બેસી જવી",
        "ગ્રાઉન્ડ સ્ટેબલ ન કર્યું હોવાથી હેવી પેનલ પકરાવું"
      ],
      machineEn: "Zardosi hand-guided machines, on the studio floor.",
      machineGu: "ઝરદોશી હેન્ડ-ગાઇડેડ મશીન, સ્ટુડિયોના ફ્લોર પર.",
      practiceEn: "Frame and stabiliser choice for heavy ground, needle and metallic-thread pairing, guiding speed, and reading relief height as you work rather than after.",
      practiceGu: "હેવી ગ્રાઉન્ડ માટે ફ્રેમ અને સ્ટેબિલાઇઝર પસંદગી, નીડલ અને મેટાલિક થ્રેડનું જોડાણ, ગાઇડિંગ સ્પીડ, અને કામ પતી ગયા પછી નહીં પણ કરતાં કરતાં જ રિલીફની ઊંચાઈ વાંચવી.",
      outputsEn: [
        "Bridal lehenga and dupatta panels",
        "Sherwani and jacket borders",
        "Blouse and yoke work for boutiques"
      ],
      outputsGu: [
        "બ્રાઇડલ લહેંગા અને દુપટ્ટા પેનલ",
        "શેરવાની અને જેકેટની બોર્ડર",
        "બુટિક માટે બ્લાઉઝ અને યોકનું કામ"
      ]
    },
    modules: draftModules("zardosi", "ઝરદોશી")
  },
  {
    slug: "four-beads-machine-work",
    family: "machine",
    nameEn: "4-Beads Machine Work",
    nameGu: "4-બીડ્સ મશીન વર્ક",
    leadEn:
      "Beadwork at production speed: feeding, tension and finish on live 4-beads machines.",
    leadGu:
      "પ્રોડક્શન સ્પીડ પર બીડ વર્ક: લાઇવ 4-બીડ્સ મશીન પર ફીડિંગ, ટેન્શન અને ફિનિશ.",
    whoEn:
      "For anyone who wants the bead and embellishment work that Surat's fashion units order every single day.",
    whoGu:
      "સુરતના ફેશન યુનિટ્સ રોજેરોજ જે બીડ અને એમ્બેલિશમેન્ટ કામના ઓર્ડર આપે છે, એ શીખવા માંગતા દરેક માટે.",
    outcomesEn: [
      "Set up and run 4-beads machines without supervision",
      "Handle beads, feeding and breakage like a professional",
      "Deliver consistent finish across a full production run"
    ],
    outcomesGu: [
      "કોઈની દેખરેખ વગર 4-બીડ્સ મશીન સેટ કરીને ચલાવો",
      "બીડ્સ, ફીડિંગ અને તૂટવાની સમસ્યા પ્રોફેશનલની જેમ સંભાળો",
      "આખા પ્રોડક્શન રનમાં એકસરખી ફિનિશ આપો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Beads catching light on the 4-beads machine",
    production: {
      producesEn: "Bead and stone embellishment laid at production speed — all-over scatter, borders and motif fills on fashion and festive wear.",
      producesGu: "પ્રોડક્શન સ્પીડ પર બીડ અને સ્ટોનનું એમ્બેલિશમેન્ટ — ફેશન અને ફેસ્ટિવ વેર પર ઓલઓવર સ્કેટર, બોર્ડર અને મોટિફ ફિલ.",
      problemsEn: [
        "Beads jamming or feeding short so the run stops every few metres",
        "Beads sitting proud and catching, or lying flat and dull",
        "Spacing drifting across a panel so two halves do not match"
      ],
      problemsGu: [
        "બીડ જામ થવા કે ઓછા ફીડ થવા, જેથી દર થોડા મીટરે રન અટકે",
        "બીડ બહાર નીકળીને ભરાઈ જવા, કે સપાટ પડીને ફિક્કા લાગવા",
        "પેનલ પર સ્પેસિંગ ખસી જવું, જેથી બે બાજુ સરખી ન રહે"
      ],
      machineEn: "4-beads machines with live bead feed.",
      machineGu: "લાઇવ બીડ ફીડ સાથેની 4-બીડ્સ મશીન.",
      practiceEn: "Loading and clearing the feed, tension for the bead size in hand, spacing set from the design rather than by eye, and keeping finish consistent across a full run.",
      practiceGu: "ફીડ ભરવું અને ક્લિયર કરવું, હાથમાં જે સાઇઝના બીડ છે એ પ્રમાણે ટેન્શન, આંખના અંદાજને બદલે ડિઝાઇનમાંથી નક્કી થતું સ્પેસિંગ, અને આખા રનમાં એકસરખી ફિનિશ જાળવવી.",
      outputsEn: [
        "All-over bead work on dress fabric",
        "Bead borders and neck patterns",
        "Festive and party-wear panels"
      ],
      outputsGu: [
        "ડ્રેસ ફેબ્રિક પર ઓલઓવર બીડ વર્ક",
        "બીડની બોર્ડર અને નેક પેટર્ન",
        "ફેસ્ટિવ અને પાર્ટી-વેર પેનલ"
      ]
    },
    modules: draftModules("4-beads", "4-બીડ્સ")
  },
  {
    slug: "sequence-work",
    family: "machine",
    nameEn: "Sequence (Sequins) Work",
    nameGu: "સિકવન્સ વર્ક",
    leadEn:
      "The sequins work the trade calls 'sequence': layout, density and shine, done right on the machine.",
    leadGu:
      "ટ્રેડમાં જેને 'સિકવન્સ' કહે છે એ કામ: લેઆઉટ, ડેન્સિટી અને ચમક, મશીન પર બરાબર રીતે.",
    whoEn:
      "For learners aiming at partywear, bridal and festive production, where sequence work never goes out of demand.",
    whoGu:
      "પાર્ટીવેર, બ્રાઇડલ અને ફેસ્ટિવ પ્રોડક્શન તરફ જનારા માટે, જ્યાં સિકવન્સ કામની માંગ ક્યારેય ઓછી થતી નથી.",
    outcomesEn: [
      "Plan sequin layouts that look expensive, not crowded",
      "Control density, direction and shine on the machine",
      "Finish festive and bridal orders to market standard"
    ],
    outcomesGu: [
      "ભરચક નહીં, મોંઘા લાગે એવા સિકવન્સ લેઆઉટ પ્લાન કરો",
      "મશીન પર ડેન્સિટી, દિશા અને ચમક કંટ્રોલ કરો",
      "ફેસ્ટિવ અને બ્રાઇડલ ઓર્ડર માર્કેટ સ્ટાન્ડર્ડ પ્રમાણે પૂરા કરો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Sequence work shimmer, macro shot",
    production: {
      producesEn: "Sequin work with a consistent lie and light — the shimmer Surat's fashion units order by the metre, in scatter, border and filled motif.",
      producesGu: "એકસરખી બેઠક અને ચમક સાથેનું સિકવન્સ કામ — સ્કેટર, બોર્ડર અને ભરેલા મોટિફમાં, જે ચમક સુરતના ફેશન યુનિટ મીટરના હિસાબે મંગાવે છે.",
      problemsEn: [
        "Sequins landing out of register so a repeat visibly shifts",
        "Sequins flipping or overlapping and killing the light",
        "Thread cutting the sequin edge and the run failing halfway"
      ],
      problemsGu: [
        "સિકવન્સ રજિસ્ટરની બહાર બેસવા, જેથી રિપીટ દેખીતી રીતે ખસી જાય",
        "સિકવન્સ ઊંધા પડવા કે એકબીજા પર ચઢવા, અને ચમક મરી જવી",
        "થ્રેડથી સિકવન્સની કિનારી કપાવી અને રન વચ્ચે જ બગડવો"
      ],
      machineEn: "Sequence machines with live sequin feed.",
      machineGu: "લાઇવ સિકવન્સ ફીડ સાથેની સિકવન્સ મશીન.",
      practiceEn: "Feed setup and registration, holding stitch and travel order, matching sequin size to the motif, and correcting a repeat that has drifted before the whole length is run.",
      practiceGu: "ફીડ સેટઅપ અને રજિસ્ટ્રેશન, હોલ્ડિંગ સ્ટિચ અને ટ્રાવેલ ઓર્ડર, મોટિફ પ્રમાણે સિકવન્સ સાઇઝ, અને આખી લંબાઈ ચલાવતાં પહેલાં ખસી ગયેલો રિપીટ સુધારવો.",
      outputsEn: [
        "Sequin dupattas and sarees",
        "Repeat borders by the metre",
        "Party and festive garment panels"
      ],
      outputsGu: [
        "સિકવન્સ દુપટ્ટા અને સાડી",
        "મીટરના હિસાબે રિપીટ બોર્ડર",
        "પાર્ટી અને ફેસ્ટિવ ગારમેન્ટ પેનલ"
      ]
    },
    modules: draftModules("sequence", "સિકવન્સ")
  },
  {
    slug: "coding-cording-machine",
    family: "machine",
    nameEn: "Coding / Cording Machine",
    nameGu: "કોડિંગ / કોર્ડિંગ મશીન",
    leadEn:
      "Cord, dori and outline work: the coding machine skills behind Surat's signature surfaces.",
    leadGu:
      "કોર્ડ, દોરી અને આઉટલાઇન વર્ક: સુરતની ઓળખ સમા સરફેસ પાછળની કોડિંગ મશીન સ્કિલ.",
    whoEn:
      "For operators and beginners who want the outline and texture work that lifts a design from flat to finished.",
    whoGu:
      "ડિઝાઇનને સાદીમાંથી શાનદાર બનાવતું આઉટલાઇન અને ટેક્સચર કામ શીખવા માંગતા ઓપરેટર્સ અને બિગિનર્સ માટે.",
    outcomesEn: [
      "Run cording work cleanly along complex design paths",
      "Combine coding with other techniques on one piece",
      "Maintain the machine and troubleshoot on your own"
    ],
    outcomesGu: [
      "જટિલ ડિઝાઇન પાથ પર પણ ચોખ્ખું કોર્ડિંગ કામ કરો",
      "એક જ પીસ પર કોડિંગને બીજી ટેકનિક સાથે જોડો",
      "મશીનની જાળવણી અને નાની ખામી જાતે ઉકેલો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Cording machine laying dori along a curve",
    production: {
      producesEn: "Corded outline and raised line work — the drawn, rope-like line that defines borders, monograms and structured motifs.",
      producesGu: "કોર્ડેડ આઉટલાઇન અને ઊપસેલી લાઇનનું કામ — દોરેલી, દોરડા જેવી લાઇન જે બોર્ડર, મોનોગ્રામ અને સ્ટ્રક્ચર્ડ મોટિફને આકાર આપે છે.",
      problemsEn: [
        "Cord wandering off the drawn line on curves",
        "Cord showing through the covering stitch in patches",
        "Ends unravelling because the start and finish were never locked"
      ],
      problemsGu: [
        "વળાંક પર કોર્ડ દોરેલી લાઇનથી ખસી જવો",
        "કવરિંગ સ્ટિચમાંથી જગ્યાએ જગ્યાએ કોર્ડ દેખાવો",
        "શરૂઆત અને છેડો લોક ન કર્યા હોવાથી છેડા ઉકલી જવા"
      ],
      machineEn: "Coding / cording machines.",
      machineGu: "કોડિંગ / કોર્ડિંગ મશીન.",
      practiceEn: "Cord thickness against stitch width, feeding through curves and corners, locking starts and ends, and holding an even line at speed.",
      practiceGu: "સ્ટિચની પહોળાઈ સામે કોર્ડની જાડાઈ, વળાંક અને ખૂણામાં ફીડિંગ, શરૂઆત અને છેડા લોક કરવા, અને સ્પીડ પર એકસરખી લાઇન જાળવવી.",
      outputsEn: [
        "Corded borders and outlines",
        "Monograms and logo work",
        "Structured motif work on jackets and kurtas"
      ],
      outputsGu: [
        "કોર્ડેડ બોર્ડર અને આઉટલાઇન",
        "મોનોગ્રામ અને લોગોનું કામ",
        "જેકેટ અને કુર્તા પર સ્ટ્રક્ચર્ડ મોટિફ કામ"
      ]
    },
    modules: draftModules("coding", "કોડિંગ")
  },
  {
    slug: "chain-multi-machine",
    family: "machine",
    nameEn: "Chain & Multi Machine",
    nameGu: "ચેઇન અને મલ્ટી મશીન",
    leadEn:
      "Chain stitch character and multi-head production: two machines, one complete skill set.",
    leadGu:
      "ચેઇન સ્ટિચની ખાસિયત અને મલ્ટી-હેડ પ્રોડક્શન: બે મશીન, એક સંપૂર્ણ સ્કિલ સેટ.",
    whoEn:
      "For those heading into production units, where multi-head machine operators are always in demand.",
    whoGu:
      "પ્રોડક્શન યુનિટ તરફ જનારા માટે, જ્યાં મલ્ટી-હેડ મશીન ઓપરેટરની માંગ હંમેશા રહે છે.",
    outcomesEn: [
      "Operate chain and multi-head machines confidently",
      "Read production sheets and hit daily targets",
      "Quality-check output across all heads"
    ],
    outcomesGu: [
      "ચેઇન અને મલ્ટી-હેડ મશીન આત્મવિશ્વાસથી ચલાવો",
      "પ્રોડક્શન શીટ વાંચીને રોજના ટાર્ગેટ પૂરા કરો",
      "બધા હેડ પર આઉટપુટની ક્વોલિટી ચેક કરો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Multi-head machine floor, all heads running",
    production: {
      producesEn: "Chain-stitch fill and outline, and multi-head running of the same design across several panels at once.",
      producesGu: "ચેઇન-સ્ટિચ ફિલ અને આઉટલાઇન, અને મલ્ટી-હેડ પર એક જ ડિઝાઇન એકસાથે ઘણી પેનલ પર ચલાવવી.",
      problemsEn: [
        "Chain skipping stitches or unravelling from the tail",
        "Heads drifting out of match so panel three does not equal panel one",
        "Downtime lost to threading and frame changes on a multi-head"
      ],
      problemsGu: [
        "ચેઇનમાં સ્ટિચ સ્કિપ થવા કે પૂંછડીથી ઉકલવું",
        "હેડ એકબીજાથી ખસી જવા, જેથી ત્રીજી પેનલ પહેલી જેવી ન રહે",
        "મલ્ટી-હેડ પર થ્રેડિંગ અને ફ્રેમ બદલવામાં સમય બગડવો"
      ],
      machineEn: "Chain machines and multi-head machines.",
      machineGu: "ચેઇન મશીન અને મલ્ટી-હેડ મશીન.",
      practiceEn: "Chain tension and lock-off, framing several panels to match, changeover discipline, and keeping every head producing the same piece.",
      practiceGu: "ચેઇન ટેન્શન અને લોક-ઓફ, ઘણી પેનલ સરખી બેસે એ રીતે ફ્રેમિંગ, ચેન્જઓવરની શિસ્ત, અને દરેક હેડ પરથી એકસરખો પીસ કઢાવવો.",
      outputsEn: [
        "Chain-stitch dress and kurta panels",
        "Repeat orders across multiple pieces",
        "Job work for units that sell by volume"
      ],
      outputsGu: [
        "ચેઇન-સ્ટિચ ડ્રેસ અને કુર્તા પેનલ",
        "ઘણા પીસ પર રિપીટ ઓર્ડર",
        "વોલ્યુમમાં વેચતાં યુનિટ માટે જોબ વર્ક"
      ]
    },
    modules: draftModules("chain & multi", "ચેઇન અને મલ્ટી")
  },
  {
    slug: "laser-work",
    family: "modern",
    nameEn: "Laser Work",
    nameGu: "લેસર વર્ક",
    leadEn:
      "Laser cutting and appliqué effects: precise, modern surface work boutiques ask for by name.",
    leadGu:
      "લેસર કટિંગ અને એપ્લિક ઇફેક્ટ્સ: ચોકસાઈવાળું, મોડર્ન સરફેસ વર્ક, જે બુટિક નામ લઈને માંગે છે.",
    whoEn:
      "For designers and tailors who want to add high-margin modern finishes to their offering.",
    whoGu:
      "પોતાના કામમાં વધુ માર્જિનવાળી મોડર્ન ફિનિશ ઉમેરવા માંગતા ડિઝાઇનર્સ અને ટેલર્સ માટે.",
    outcomesEn: [
      "Prepare files and fabrics for clean laser cuts",
      "Combine laser work with embroidery on one garment",
      "Price and sell laser work as a premium service"
    ],
    outcomesGu: [
      "ચોખ્ખા લેસર કટ માટે ફાઇલ અને ફેબ્રિક તૈયાર કરો",
      "એક જ ગારમેન્ટ પર લેસર અને એમ્બ્રોઇડરી જોડો",
      "લેસર વર્કને પ્રીમિયમ સર્વિસ તરીકે વેચતા શીખો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Laser machine cutting pattern into fabric",
    production: {
      producesEn: "Laser cutting and etching on fabric and leather — cut-work panels, perforated patterns and sealed edges that need no hemming.",
      producesGu: "ફેબ્રિક અને લેધર પર લેસર કટિંગ અને એચિંગ — કટ-વર્ક પેનલ, પરફોરેટેડ પેટર્ન અને સીલ થયેલી કિનારી, જેને હેમની જરૂર નથી.",
      problemsEn: [
        "Scorched or yellowed edges on light fabric",
        "Cuts not going fully through, or going through the backing too",
        "Synthetics melting and welding to the layer beneath"
      ],
      problemsGu: [
        "હળવા કાપડ પર કિનારી બળી જવી કે પીળી પડવી",
        "કટ પૂરો ન થવો, કે બેકિંગ સુધ્ધાં કપાઈ જવું",
        "સિન્થેટિક ઓગળીને નીચેના લેયર સાથે ચોંટી જવું"
      ],
      machineEn: "Laser cutting and etching equipment.",
      machineGu: "લેસર કટિંગ અને એચિંગ મશીન.",
      practiceEn: "Power and speed against material, test cuts before a run, nesting a layout to save cloth, and knowing which materials must not go under a laser at all.",
      practiceGu: "મટીરિયલ પ્રમાણે પાવર અને સ્પીડ, રન પહેલાં ટેસ્ટ કટ, કાપડ બચાવવા લેઆઉટ ગોઠવવો, અને કયું મટીરિયલ લેસર નીચે મૂકવું જ નહીં એ સમજવું.",
      outputsEn: [
        "Cut-work dupattas and dress panels",
        "Perforated leather and faux-leather pieces",
        "Etched detail combined with embroidery"
      ],
      outputsGu: [
        "કટ-વર્ક દુપટ્ટા અને ડ્રેસ પેનલ",
        "પરફોરેટેડ લેધર અને ફોક્સ-લેધર પીસ",
        "એમ્બ્રોઇડરી સાથે જોડેલી એચ કરેલી ડિટેલ"
      ]
    },
    modules: draftModules("laser", "લેસર")
  },
  {
    slug: "tufting",
    family: "modern",
    nameEn: "Tufting",
    nameGu: "ટફ્ટિંગ",
    leadEn:
      "Rugs, wall pieces and textured products with the tufting gun: a new craft with a young, growing market.",
    leadGu:
      "ટફ્ટિંગ ગનથી રગ્સ, વોલ પીસ અને ટેક્સચર્ડ પ્રોડક્ટ્સ: નવી કળા, નવું અને વધતું માર્કેટ.",
    whoEn:
      "For creators and small-business builders: tufted products sell directly on Instagram and at exhibitions.",
    whoGu:
      "ક્રિએટર્સ અને નાના બિઝનેસ શરૂ કરનારા માટે: ટફ્ટેડ પ્રોડક્ટ્સ સીધા Instagram અને એક્ઝિબિશનમાં વેચાય છે.",
    outcomesEn: [
      "Handle the tufting gun, frame and backing correctly",
      "Finish pieces: shearing, gluing, backing, edges",
      "Turn tufting into products you can actually sell"
    ],
    outcomesGu: [
      "ટફ્ટિંગ ગન, ફ્રેમ અને બેકિંગ સાચી રીતે વાપરો",
      "પીસ ફિનિશ કરો: શિયરિંગ, ગ્લુઇંગ, બેકિંગ, કિનારી",
      "ટફ્ટિંગમાંથી ખરેખર વેચાય એવી પ્રોડક્ટ બનાવો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Tufting gun mid-stroke on stretched cloth",
    production: {
      producesEn: "Tufted pile work — rugs, wall pieces and textured panels built by punching yarn into a stretched backing.",
      producesGu: "ટફ્ટેડ પાઇલ વર્ક — તાણેલા બેકિંગમાં યાર્ન પંચ કરીને બનતા રગ, વોલ પીસ અને ટેક્સચર્ડ પેનલ.",
      problemsEn: [
        "Pile pulling out because the backing was never glued off",
        "Uneven pile height so the surface reads patchy",
        "Backing sagging in the frame and the shape distorting"
      ],
      problemsGu: [
        "બેકિંગ પર ગુંદર ન લગાવ્યું હોવાથી પાઇલ નીકળી જવો",
        "પાઇલની ઊંચાઈ અસમાન અને સપાટી ડાઘાળી લાગવી",
        "ફ્રેમમાં બેકિંગ ઢીલું પડવું અને શેપ બગડવો"
      ],
      machineEn: "Tufting guns on a stretched frame.",
      machineGu: "તાણેલી ફ્રેમ પર ટફ્ટિંગ ગન.",
      practiceEn: "Frame tension, gun height and pace for an even pile, cut versus loop, gluing off the back, and trimming and carving to finish.",
      practiceGu: "ફ્રેમ ટેન્શન, સરખો પાઇલ મળે એ માટે ગનની ઊંચાઈ અને ગતિ, કટ કે લૂપ, પાછળ ગુંદર લગાવવું, અને ફિનિશ માટે ટ્રિમિંગ અને કાર્વિંગ.",
      outputsEn: [
        "Custom rugs and mats",
        "Textured wall pieces",
        "Logo and lettering rugs for shops and studios"
      ],
      outputsGu: [
        "કસ્ટમ રગ અને મેટ",
        "ટેક્સચર્ડ વોલ પીસ",
        "દુકાન અને સ્ટુડિયો માટે લોગો અને લેટરિંગ રગ"
      ]
    },
    modules: draftModules("tufting", "ટફ્ટિંગ")
  },
  {
    slug: "emcad-embroidery-design",
    family: "software",
    nameEn: "EMCAD DAHAO Embroidery Designing",
    nameGu: "EMCAD DAHAO એમ્બ્રોઇડરી ડિઝાઇનિંગ",
    leadEn:
      "Three months on EMCAD DAHAO: design on screen what the machines will stitch, then run it on a live machine in the same session. Multi, sequence, coding, beads, laser, looping, chain, towel, boring, zardoshi and ribbon work.",
    leadGu:
      "EMCAD DAHAO પર ત્રણ મહિના: મશીન જે સીવશે એ સ્ક્રીન પર ડિઝાઇન કરો, અને એ જ સેશનમાં લાઇવ મશીન પર ચલાવો. મલ્ટી, સિકવન્સ, કોડિંગ, બીડ્સ, લેસર, લૂપિંગ, ચેઇન, ટોવેલ, બોરિંગ, ઝરદોશી અને રિબન વર્ક.",
    whoEn:
      "For operators becoming designers, and for anyone who wants the best-paid seat in the embroidery workflow.",
    whoGu:
      "ઓપરેટરમાંથી ડિઝાઇનર બનવા માંગતા, અને એમ્બ્રોઇડરી વર્કફ્લોની સૌથી સારા પગારવાળી સીટ જોઈતી હોય એ દરેક માટે.",
    outcomesEn: [
      "Build clean, machine-ready designs in EMCAD DAHAO",
      "Understand stitch types, density and pathing",
      "Connect and set the device, and read a machine that is misbehaving",
      "Take a client brief from artwork to production file, and prove it on the machine"
    ],
    outcomesGu: [
      "EMCAD DAHAO માં ચોખ્ખી, મશીન-રેડી ડિઝાઇન બનાવો",
      "સ્ટિચ ટાઇપ, ડેન્સિટી અને પાથિંગ સમજો",
      "ડિવાઇસ કનેક્ટ અને સેટ કરો, અને મશીન ખોટું ચાલે ત્યારે વાંચી શકો",
      "ક્લાયન્ટના આર્ટવર્કથી પ્રોડક્શન ફાઇલ સુધી કામ કરો, અને મશીન પર સાબિત કરો"
    ],
    /* Weeks stays null: the institute states this course in MONTHS. */
    durationWeeks: null,
    durationMonths: 3,
    photoLabel: "Student at EMCAD DAHAO screen, stitch paths visible",
    production: {
      producesEn: "Machine-ready embroidery files — the digitised design that decides, before a single stitch is run, whether the job comes out right.",
      producesGu: "મશીન-રેડી એમ્બ્રોઇડરી ફાઇલ — ડિજિટાઇઝ કરેલી એ ડિઝાઇન, જે એક પણ ટાંકો પડ્યા પહેલાં નક્કી કરી દે છે કે જોબ સારો આવશે કે નહીં.",
      problemsEn: [
        "A design that looks right on screen and puckers on cloth",
        "Stitch count and colour changes making a job too slow to be worth running",
        "Files that have to be re-worked at every machine they are sent to"
      ],
      problemsGu: [
        "સ્ક્રીન પર સાચી લાગતી અને કાપડ પર પકરાતી ડિઝાઇન",
        "સ્ટિચ કાઉન્ટ અને કલર ચેન્જના કારણે જોબ એટલો ધીમો કે પોસાય નહીં",
        "દરેક મશીન પર મોકલતાં ફરીથી સુધારવી પડતી ફાઇલો"
      ],
      machineEn: "Design workstations, with every design stitched out on the studio's live production machines.",
      machineGu: "ડિઝાઇન વર્કસ્ટેશન, અને દરેક ડિઝાઇન સ્ટુડિયોની લાઇવ પ્રોડક્શન મશીન પર સ્ટિચ-આઉટ.",
      softwareEn: "EMCAD DAHAO, and only EMCAD DAHAO. It is the package the studio digitises production files on, so what a student learns here is exactly what the floor runs — one package, taught properly, on the machines it drives.",
      softwareGu: "EMCAD DAHAO, અને માત્ર EMCAD DAHAO. સ્ટુડિયો પ્રોડક્શન ફાઇલ એના પર જ ડિજિટાઇઝ કરે છે, એટલે સ્ટુડન્ટ જે શીખે છે એ જ ફ્લોર પર ચાલે છે — એક જ સોફ્ટવેર, બરાબર શીખવેલું, જે મશીન ચલાવે છે એની ઉપર જ.",
      practiceEn: "Digitise a design, run it on a machine, read the sample, and correct the file. The loop is the course: a file is not finished until it has stitched out. Device connection and setting, machine troubleshooting and production knowledge are part of it, not an extra.",
      practiceGu: "ડિઝાઇન ડિજિટાઇઝ કરો, મશીન પર ચલાવો, સેમ્પલ વાંચો, અને ફાઇલ સુધારો. આ લૂપ જ કોર્સ છે: ફાઇલ સ્ટિચ-આઉટ થાય નહીં ત્યાં સુધી પૂરી ન કહેવાય. ડિવાઇસ કનેક્શન અને સેટિંગ, મશીન ટ્રબલશૂટિંગ અને પ્રોડક્શન નોલેજ પણ એનો જ ભાગ છે, અલગ નહીં.",
      outputsEn: [
        "Digitising job work for units and boutiques",
        "Production files for your own machines",
        "Sampling and correction before a bulk run"
      ],
      outputsGu: [
        "યુનિટ અને બુટિક માટે ડિજિટાઇઝિંગ જોબ વર્ક",
        "પોતાની મશીન માટે પ્રોડક્શન ફાઇલ",
        "બલ્ક રન પહેલાં સેમ્પલિંગ અને કરેક્શન"
      ]
    },
    modules: draftModules("EMCAD DAHAO design", "EMCAD DAHAO ડિઝાઇન")
  },
  {
    slug: "flat-embroidery",
    family: "machine",
    nameEn: "Flat Embroidery",
    nameGu: "ફ્લેટ એમ્બ્રોઇડરી",
    leadEn:
      "The foundation every other technique sits on: clean direct stitching, fine detail and multi-colour work on live machines.",
    leadGu:
      "બીજી બધી ટેકનિકનો પાયો: લાઇવ મશીન પર સાફ ડાયરેક્ટ સ્ટિચિંગ, ઝીણી ડિટેલ અને મલ્ટી-કલર કામ.",
    whoEn:
      "Complete beginners, and operators who can already run a machine but whose flat work still comes out uneven. If you are not sure which course to pick, this is the one to start with.",
    whoGu:
      "સાવ બિગિનર્સ, અને એવા ઓપરેટર્સ જે મશીન ચલાવી તો શકે છે પણ જેમનું ફ્લેટ કામ હજી એકસરખું નથી આવતું. કયો કોર્સ લેવો એ નક્કી ન હોય તો અહીંથી શરૂ કરો.",
    outcomesEn: [
      "Stitch clean flat work with even density and no puckering",
      "Handle fine detail and multi-colour designs without thread breaks",
      "Set up a job on the machine yourself, start to finish"
    ],
    outcomesGu: [
      "એકસરખી ડેન્સિટી સાથે સાફ ફ્લેટ કામ કરો, કાપડ ખેંચાયા વગર",
      "દોરો તૂટ્યા વગર ઝીણી ડિટેલ અને મલ્ટી-કલર ડિઝાઇન કરો",
      "મશીન પર કામ જાતે સેટ કરો, શરૂઆતથી અંત સુધી"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Flat embroidery running on the machine, multi-colour design",
    production: {
      producesEn: "Flat surface embroidery — satin, fill and outline. The foundation every other machine technique is built on.",
      producesGu: "ફ્લેટ સરફેસ એમ્બ્રોઇડરી — સાટિન, ફિલ અને આઉટલાઇન. બાકીની દરેક મશીન ટેકનિકનો પાયો આ જ છે.",
      problemsEn: [
        "Fabric puckering under a fill because no underlay was laid",
        "Satin thinning and gapping, or so dense it stiffens the cloth",
        "Outlines landing off the fill edge"
      ],
      problemsGu: [
        "અન્ડરલે ન નાખ્યું હોવાથી ફિલ નીચે કાપડ પકરાવું",
        "સાટિન પાતળું પડીને ગેપ પડવા, કે એટલું ગાઢ કે કાપડ કડક થઈ જાય",
        "આઉટલાઇન ફિલની કિનારીથી બહાર બેસવી"
      ],
      machineEn: "Flat embroidery machines.",
      machineGu: "ફ્લેટ એમ્બ્રોઇડરી મશીન.",
      practiceEn: "Underlay, density and stitch direction; hooping and stabiliser for the cloth in hand; needle, thread and tension chosen together rather than one at a time.",
      practiceGu: "અન્ડરલે, ડેન્સિટી અને સ્ટિચ ડિરેક્શન; હાથમાં જે કાપડ છે એ માટે હૂપિંગ અને સ્ટેબિલાઇઝર; નીડલ, થ્રેડ અને ટેન્શન એક પછી એક નહીં પણ સાથે નક્કી કરવા.",
      outputsEn: [
        "Logo and monogram work",
        "Dress, kurta and saree panels",
        "Sampling before a production run"
      ],
      outputsGu: [
        "લોગો અને મોનોગ્રામનું કામ",
        "ડ્રેસ, કુર્તા અને સાડીની પેનલ",
        "પ્રોડક્શન રન પહેલાંનું સેમ્પલિંગ"
      ]
    },
    modules: draftModules("flat embroidery", "ફ્લેટ એમ્બ્રોઇડરી")
  },
  {
    slug: "applique-3d-embroidery",
    family: "machine",
    nameEn: "Appliqué & 3D Embroidery",
    nameGu: "એપ્લિક અને 3D એમ્બ્રોઇડરી",
    leadEn:
      "Two ways to lift a design off the cloth: fabric appliqué with a clean satin edge, and 3D foam work that stands up and holds its shape.",
    leadGu:
      "ડિઝાઇનને કાપડથી ઉપર ઉઠાવવાની બે રીત: સાફ સાટીન કિનારી સાથે ફેબ્રિક એપ્લિક, અને ફોમ પર 3D કામ જે ઊભું રહે અને આકાર જાળવે.",
    whoEn:
      "Students who already run flat work and want the finishes that raise the rate on a piece: boutique panels, jacket backs, lehenga motifs and logo work.",
    whoGu:
      "જે સ્ટુડન્ટ્સ ફ્લેટ કામ કરી લે છે અને પીસનો ભાવ વધારે એવી ફિનિશ શીખવા માંગે છે: બુટિક પેનલ, જેકેટ બેક, લહેંગા મોટિફ અને લોગો વર્ક.",
    outcomesEn: [
      "Place, tack and cut appliqué with a satin edge that does not fray",
      "Build 3D foam work with the density and underlay it actually needs",
      "Judge which designs suit appliqué, which suit foam, and which suit neither"
    ],
    outcomesGu: [
      "એપ્લિક પ્લેસ કરો, ટેક કરો અને એવી સાટીન કિનારી સાથે કાપો જે ઉખડે નહીં",
      "3D ફોમ કામ માટે જરૂરી ડેન્સિટી અને અંડરલે સાથે કામ કરો",
      "કઈ ડિઝાઇન એપ્લિક માટે છે, કઈ ફોમ માટે, અને કઈ બેમાંથી એકેય માટે નહીં એ સમજો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Appliqué panel with satin edge beside a 3D foam motif",
    production: {
      producesEn: "Applied fabric shapes and raised foam work — patches, cut-away appliqué and the 3D lettering used on caps, jackets and stage wear.",
      producesGu: "લગાવેલા ફેબ્રિક શેપ અને ઊપસેલું ફોમ વર્ક — પેચ, કટ-અવે એપ્લિક, અને કેપ, જેકેટ તથા સ્ટેજ વેર પર વપરાતું 3D લેટરિંગ.",
      problemsEn: [
        "Applied fabric fraying at the cut edge after a wash",
        "Foam showing at the ends of a 3D letter",
        "Patch edges lifting because the tack-down never held"
      ],
      problemsGu: [
        "ધોયા પછી લગાવેલા કાપડની કાપેલી કિનારી ઉકલવી",
        "3D લેટરના છેડે ફોમ દેખાવો",
        "ટેક-ડાઉન બરાબર ન પકડ્યું હોવાથી પેચની કિનારી ઊંચકાવી"
      ],
      machineEn: "Flat and multi-head machines, with appliqué and 3D foam setups.",
      machineGu: "ફ્લેટ અને મલ્ટી-હેડ મશીન, એપ્લિક અને 3D ફોમ સેટઅપ સાથે.",
      practiceEn: "Placement, tack-down and cover stitching; cutting cleanly in the frame; foam thickness against letter width, and closing the ends so no foam shows.",
      practiceGu: "પ્લેસમેન્ટ, ટેક-ડાઉન અને કવર સ્ટિચિંગ; ફ્રેમમાં જ સાફ કટિંગ; લેટરની પહોળાઈ સામે ફોમની જાડાઈ, અને છેડા એવા બંધ કરવા કે ફોમ ન દેખાય.",
      outputsEn: [
        "Caps, jackets and uniform patches",
        "3D lettering for teams and events",
        "Cut-away appliqué on ethnic wear"
      ],
      outputsGu: [
        "કેપ, જેકેટ અને યુનિફોર્મના પેચ",
        "ટીમ અને ઇવેન્ટ માટે 3D લેટરિંગ",
        "એથનિક વેર પર કટ-અવે એપ્લિક"
      ]
    },
    modules: draftModules("appliqué and 3D", "એપ્લિક અને 3D")
  },
  {
    slug: "cross-stitch",
    family: "machine",
    nameEn: "Cross Stitch",
    nameGu: "ક્રોસ સ્ટિચ",
    leadEn:
      "The hand-worked look at machine speed: cross stitch for kurtis, dupattas and suit panels.",
    leadGu:
      "હાથના કામ જેવો દેખાવ, મશીનની સ્પીડે: કુર્તી, દુપટ્ટા અને સૂટ પેનલ માટે ક્રોસ સ્ટિચ.",
    whoEn:
      "Students aiming at the kurti and dupatta market, and tailors who want to offer a hand-worked finish without hand-work timelines.",
    whoGu:
      "કુર્તી અને દુપટ્ટા માર્કેટ માટે તૈયાર થતા સ્ટુડન્ટ્સ, અને એવા ટેલર્સ જે હાથના કામ જેવી ફિનિશ આપવા માંગે છે પણ હાથના કામનો સમય નથી આપી શકતા.",
    outcomesEn: [
      "Run cross stitch cleanly on kurti, dupatta and suit panels",
      "Hold grid alignment and spacing consistent across a full panel",
      "Match a hand-worked look while keeping production timelines"
    ],
    outcomesGu: [
      "કુર્તી, દુપટ્ટા અને સૂટ પેનલ પર સાફ ક્રોસ સ્ટિચ કરો",
      "આખી પેનલમાં ગ્રિડ એલાઇનમેન્ટ અને સ્પેસિંગ એકસરખું રાખો",
      "પ્રોડક્શન ટાઇમલાઇન સાચવીને હાથના કામ જેવો દેખાવ લાવો"
    ],
    durationWeeks: null,
    durationMonths: null,
    photoLabel: "Cross stitch panel on a kurti, close-up of the grid",
    production: {
      producesEn: "Counted cross-stitch worked on the machine — the grid-based motif and border work used on home textiles and traditional garment panels.",
      producesGu: "મશીન પર કરેલું કાઉન્ટેડ ક્રોસ સ્ટિચ — હોમ ટેક્સટાઇલ અને પરંપરાગત ગારમેન્ટ પેનલ પર વપરાતું ગ્રિડ આધારિત મોટિફ અને બોર્ડરનું કામ.",
      problemsEn: [
        "Crosses drifting off the grid so the motif skews",
        "Arms of the cross landing unequal and the fill reading uneven",
        "Ground distorting because the count was set for a different weave"
      ],
      problemsGu: [
        "ક્રોસ ગ્રિડથી ખસી જવા અને મોટિફ ત્રાંસું થવું",
        "ક્રોસના હાથ અસમાન બેસવા અને ફિલ અસમાન દેખાવું",
        "બીજા વણાટ માટે કાઉન્ટ સેટ કર્યો હોવાથી ગ્રાઉન્ડ બગડવું"
      ],
      machineEn: "Embroidery machines set up for counted cross work.",
      machineGu: "કાઉન્ટેડ ક્રોસ કામ માટે સેટ કરેલી એમ્બ્રોઇડરી મશીન.",
      practiceEn: "Reading a chart onto the grid, holding the count against the weave, keeping the arms even, and planning the travel so the back stays clean.",
      practiceGu: "ચાર્ટને ગ્રિડ પર વાંચવો, વણાટ સામે કાઉન્ટ જાળવવો, હાથ સરખા રાખવા, અને ટ્રાવેલ એવો ગોઠવવો કે પાછળનો ભાગ સાફ રહે.",
      outputsEn: [
        "Home textiles: cushions, runners and wall pieces",
        "Traditional motif borders",
        "Gift and personalised pieces"
      ],
      outputsGu: [
        "હોમ ટેક્સટાઇલ: કુશન, રનર અને વોલ પીસ",
        "પરંપરાગત મોટિફ બોર્ડર",
        "ગિફ્ટ અને પર્સનલાઇઝ્ડ પીસ"
      ]
    },
    modules: draftModules("cross stitch", "ક્રોસ સ્ટિચ")
  }
];

export const courseBySlug = (slug: string) => courses.find((c) => c.slug === slug);

/**
 * Display order, grouped by family.
 *
 * The `courses` array above is STORAGE order and must stay stable, because the
 * owner's catalogue import derives `sortOrder` from array position. Presentation
 * order is a separate, freely editable decision — which is what this is.
 *
 * Owner decision (2026-08-29): **Zardosi leads.** It is the work Surat is known
 * for and the reason most enquiries arrive. Flat Embroidery follows it, because
 * it is the foundation the other techniques sit on and the honest answer to
 * "I have never touched a machine" — appending it left it sixth of eight, which
 * was an artefact of the storage constraint, not a decision anyone made.
 *
 * A slug missing from this list sorts to the end of its family rather than
 * disappearing; `tests/catalog-import.test.ts` fails if it drifts out of sync.
 */
export const FAMILY_ORDER = ["machine", "modern", "software"] as const;

export const COURSE_DISPLAY_ORDER: readonly string[] = [
  "zardosi-machine-embroidery",
  "flat-embroidery",
  "four-beads-machine-work",
  "sequence-work",
  "coding-cording-machine",
  "chain-multi-machine",
  "applique-3d-embroidery",
  "cross-stitch",
  "laser-work",
  "tufting",
  "emcad-embroidery-design"
];

const displayRank = (slug: string) => {
  const index = COURSE_DISPLAY_ORDER.indexOf(slug);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

export const coursesByFamily: Course[] = FAMILY_ORDER.flatMap((family) =>
  courses
    .filter((course) => course.family === family)
    .sort((a, b) => displayRank(a.slug) - displayRank(b.slug))
);

/** Courses of one family, in display order. */
export const coursesInFamily = (family: Course["family"]) =>
  coursesByFamily.filter((course) => course.family === family);

/* ------------------- sample batches (pre-database fallback) ---------------- */

export type BatchRow = {
  id: number;
  label: string;
  days: string;
  startTime: string;
  endTime: string;
  startDate: string;
  seats: number;
  seatsTaken: number;
  language: string;
  courseSlug: string;
  courseNameEn: string;
  courseNameGu: string;
};

/** Generates believable upcoming sample rows (always future-dated). */
export function sampleBatches(courseSlug?: string): BatchRow[] {
  const base = new Date();
  const plus = (d: number) => {
    const x = new Date(base);
    x.setDate(x.getDate() + d);
    return x.toISOString().slice(0, 10);
  };
  const defs: Array<[string, string, string, string, number, number]> = [
    ["zardosi-machine-embroidery", "Mon-Sat", "10:00", "12:00", 7, 4],
    ["zardosi-machine-embroidery", "Mon-Sat", "19:00", "21:00", 10, 8],
    ["sequence-work", "Mon-Sat", "16:00", "18:00", 12, 3],
    ["emcad-embroidery-design", "Mon/Wed/Fri", "18:00", "20:00", 14, 5],
    ["four-beads-machine-work", "Mon-Sat", "14:00", "16:00", 18, 2],
    ["tufting", "Sat-Sun", "11:00", "14:00", 21, 6]
  ];
  return defs
    .map(([slug, days, st, et, offset, taken], i) => {
      const c = courseBySlug(slug)!;
      return {
        id: -(i + 1),
        label: `${c.nameEn.split(" ")[0]} ${Number(st.slice(0, 2)) >= 16 ? "Evening" : "Day"} batch`,
        days,
        startTime: st,
        endTime: et,
        startDate: plus(offset),
        seats: 10,
        seatsTaken: taken,
        language: "ગુજરાતી + Hindi",
        courseSlug: slug,
        courseNameEn: c.nameEn,
        courseNameGu: c.nameGu
      };
    })
    .filter((b) => !courseSlug || b.courseSlug === courseSlug);
}
