/**
 * Course catalog.
 *
 * The first eight are the VERIFIED list from the studio's own YouTube bio
 * (Zardosi, 4-Beads, Coding, Chain, Multi, Sequence, Laser, Tufting + emCAD),
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
 * ⚠️ CONFIRM-WITH-OWNER (Q1): durations and module topics are drafts.
 * Content here is the Phase 1 source of truth; Phase 2 moves it to the DB
 * (seed script mirrors this file).
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
  photoLabel: string; // shoot-list label for the PhotoSlot
  modules: CourseModule[];
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
      "emCAD embroidery design: create the designs the machines stitch. The skill that turns an operator into a designer.",
    introGu:
      "emCAD એમ્બ્રોઇડરી ડિઝાઇન: મશીન જે સીવે છે એ ડિઝાઇન તમે બનાવો. ઓપરેટરમાંથી ડિઝાઇનર બનાવતી સ્કિલ.",
    photoLabel: "emCAD screen with visible stitch paths"
  }
} as const;

const draftModules = (topic: string, topicGu: string): CourseModule[] => [
  {
    titleEn: "Weeks 1-2: Machine, frame and material basics",
    titleGu: "અઠવાડિયું 1-2: મશીન, ફ્રેમ અને મટીરિયલ બેઝિક્સ",
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
    titleEn: `Weeks 3-4: Core ${topic} technique`,
    titleGu: `અઠવાડિયું 3-4: ${topicGu}ની મુખ્ય ટેકનિક`,
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
    titleEn: "Weeks 5-6: Speed, finish and production quality",
    titleGu: "અઠવાડિયું 5-6: સ્પીડ, ફિનિશ અને પ્રોડક્શન ક્વોલિટી",
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
    titleEn: "Final week: Your finished project",
    titleGu: "છેલ્લું અઠવાડિયું: તમારો ફાઇનલ પ્રોજેક્ટ",
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
    photoLabel: "Zardosi machine with gold thread work in progress",
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
    photoLabel: "Beads catching light on the 4-beads machine",
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
    photoLabel: "Sequence work shimmer, macro shot",
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
    photoLabel: "Cording machine laying dori along a curve",
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
    photoLabel: "Multi-head machine floor, all heads running",
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
    photoLabel: "Laser machine cutting pattern into fabric",
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
    photoLabel: "Tufting gun mid-stroke on stretched cloth",
    modules: draftModules("tufting", "ટફ્ટિંગ")
  },
  {
    slug: "emcad-embroidery-design",
    family: "software",
    nameEn: "emCAD Embroidery Design",
    nameGu: "emCAD એમ્બ્રોઇડરી ડિઝાઇન",
    leadEn:
      "Design on screen what the machines will stitch: punching, pathing and machine-ready files in emCAD.",
    leadGu:
      "મશીન જે સીવશે એ સ્ક્રીન પર ડિઝાઇન કરો: emCADમાં પંચિંગ, પાથિંગ અને મશીન-રેડી ફાઇલ.",
    whoEn:
      "For operators becoming designers, and for anyone who wants the best-paid seat in the embroidery workflow.",
    whoGu:
      "ઓપરેટરમાંથી ડિઝાઇનર બનવા માંગતા, અને એમ્બ્રોઇડરી વર્કફ્લોની સૌથી સારા પગારવાળી સીટ જોઈતી હોય એ દરેક માટે.",
    outcomesEn: [
      "Build clean, machine-ready designs in emCAD",
      "Understand stitch types, density and pathing",
      "Take a client brief from artwork to production file"
    ],
    outcomesGu: [
      "emCADમાં ચોખ્ખી, મશીન-રેડી ડિઝાઇન બનાવો",
      "સ્ટિચ ટાઇપ, ડેન્સિટી અને પાથિંગ સમજો",
      "ક્લાયન્ટના આર્ટવર્કથી પ્રોડક્શન ફાઇલ સુધી કામ કરો"
    ],
    durationWeeks: null,
    photoLabel: "Student at emCAD screen, stitch paths visible",
    modules: draftModules("emCAD design", "emCAD ડિઝાઇન")
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
    photoLabel: "Flat embroidery running on the machine, multi-colour design",
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
    photoLabel: "Appliqué panel with satin edge beside a 3D foam motif",
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
    photoLabel: "Cross stitch panel on a kurti, close-up of the grid",
    modules: draftModules("cross stitch", "ક્રોસ સ્ટિચ")
  }
];

export const courseBySlug = (slug: string) => courses.find((c) => c.slug === slug);

/**
 * Display order, grouped by family.
 *
 * The `courses` array above is STORAGE order and must stay stable, because the
 * owner's catalogue import derives `sortOrder` from array position. Anything
 * that shows a flat list to a visitor should use this instead, so newly
 * appended machine courses read next to the other machine courses rather than
 * trailing after emCAD.
 */
export const FAMILY_ORDER = ["machine", "modern", "software"] as const;
export const coursesByFamily: Course[] = FAMILY_ORDER.flatMap((family) =>
  courses.filter((course) => course.family === family)
);

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
