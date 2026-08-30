/**
 * Machine Notes — the studio's own writing.
 *
 * Karma's real audience already follows it on Instagram, where the strongest
 * content is a trainer explaining why a sample failed. That is authority a
 * search engine cannot see, because it lives inside a video on someone else's
 * platform. These notes are the same material in a form a search can index
 * and a visitor can read on mobile data.
 *
 * ## Why this is a typed source file and not a CMS section
 *
 * Content Desk exists for content the *owner* publishes: student work,
 * stories, verified numbers, all with a consent and verification workflow
 * behind them. Machine notes are technical writing that ships with the code,
 * is reviewed in a diff like code, and links directly to courses by slug. A
 * generic rich-text page builder would add an editing surface nobody has
 * asked for and lose the structure — the "what to check" list is a list, not
 * a paragraph someone might bold.
 *
 * ## What these notes are, and are not
 *
 * Every claim here is ordinary trade knowledge — the same thing a supervisor
 * tells a new operator — so **none of it carries a sample flag and none of it
 * needs owner verification**. What none of them do is quote a named student,
 * name a client, promise a result, or cite a statistic. The `example` field
 * describes a fault and its fix, never a person.
 *
 * ## Media
 *
 * `reelUrl`, `youtubeUrl` and `thumbnail` exist so a note can point at the
 * studio's own video when the owner supplies a verified link. They are unset
 * on every note today, because inventing a URL that points at the wrong reel
 * is worse than having no video. The UI renders the block only when a link
 * exists, and links outward rather than embedding a player.
 */

export type MachineNote = {
  slug: string;
  /** The course this note should send a reader to. */
  courseSlug: string;
  /** Search themes this note genuinely covers. Not keyword stuffing. */
  tags: string[];
  questionEn: string;
  questionGu: string;
  /** The answer, in two or three sentences, before any explanation. */
  answerEn: string;
  answerGu: string;
  whyEn: string;
  whyGu: string;
  /** What to check, in the order a person on the floor would check it. */
  checksEn: string[];
  checksGu: string[];
  /** The machine or software specific that a general answer would miss. */
  detailEn: string;
  detailGu: string;
  /**
   * The fault this note is about, in two or three words.
   *
   * A label, not a new claim: every one is drawn from the note's own body. It
   * exists so the archive index and the note header can carry an ISSUE row —
   * a reader scanning eight notes for the fault they are hitting today should
   * not have to read eight answers to find it.
   */
  issueEn: string;
  issueGu: string;
  /** A fault and its fix. Never a named person, client or outcome. */
  exampleEn: string;
  exampleGu: string;
  /** Owner-supplied video, when a verified link exists. Unset today. */
  reelUrl?: string;
  youtubeUrl?: string;
  thumbnail?: string;
};

export const machineNotes: MachineNote[] = [
  {
    slug: "read-a-failed-stitch-out",
    courseSlug: "flat-embroidery",
    tags: [
      "machine embroidery training Surat",
      "practical embroidery machine training"
    ],
    questionEn: "How do you read a failed stitch-out?",
    questionGu: "ખરાબ સ્ટિચ-આઉટ કેવી રીતે વાંચવું?",
    answerEn: "Look at where the fault is, not at how bad it looks. Puckering that follows a fill outline, thread breaks clustered at corners, and an inner line sitting off register are three different faults with three different causes — and each one tells you which stage to go back to.",
    answerGu: "ભૂલ કેટલી ખરાબ દેખાય છે એ નહીં, ક્યાં છે એ જુઓ. ફિલની આઉટલાઇન પ્રમાણે પકરિંગ, ખૂણે ભેગા થતા થ્રેડ બ્રેક, અને રજિસ્ટરની બહાર બેઠેલી અંદરની લાઇન — આ ત્રણ અલગ ભૂલ છે, ત્રણ અલગ કારણ સાથે. દરેક કહી દે છે કે કયા સ્ટેજ પર પાછા જવાનું છે.",
    whyEn: "A stitch-out is a record of every decision made before it: the file, the hoop, the stabiliser, the needle, the thread and the speed. Faults are not random, and they are not spread evenly. Where a fault sits on the piece is the fastest evidence you have about which of those decisions was wrong.",
    whyGu: "સ્ટિચ-આઉટ એ પહેલાં લેવાયેલા દરેક નિર્ણયનો રેકોર્ડ છે: ફાઇલ, હૂપ, સ્ટેબિલાઇઝર, નીડલ, થ્રેડ અને સ્પીડ. ભૂલો રેન્ડમ નથી હોતી, અને સરખી ફેલાયેલી પણ નથી હોતી. પીસ પર ભૂલ ક્યાં બેઠી છે એ જ સૌથી ઝડપી પુરાવો છે કે આમાંનો કયો નિર્ણય ખોટો હતો.",
    checksEn: [
      "Does the ripple follow the shape of a fill? Then it is the ground moving, not head tension — look for missing underlay.",
      "Are breaks clustered at direction changes rather than spread out? Then the path is turning faster than the thread will.",
      "Is only one line out of position? Then it is registration and travel order, not the machine.",
      "Does coverage fail only on the wider columns? Then density is set for a narrower stitch than the design runs."
    ],
    checksGu: [
      "લહેર ફિલના આકાર પ્રમાણે જાય છે? તો એ કાપડ ખસવાની વાત છે, હેડ ટેન્શનની નહીં — અન્ડરલે ખૂટે છે એ જુઓ.",
      "બ્રેક ફેલાયેલા નહીં પણ દિશા બદલાય ત્યાં ભેગા છે? તો થ્રેડ જેટલી ઝડપે વળી શકે એના કરતાં પાથ ઝડપથી વળે છે.",
      "ફક્ત એક જ લાઇન જગ્યાએથી ખસી છે? તો એ રજિસ્ટ્રેશન અને ટ્રાવેલ ઓર્ડર છે, મશીન નહીં.",
      "ફક્ત પહોળા કોલમમાં કવરેજ ખૂટે છે? તો ડિઝાઇન કરતાં સાંકડા સ્ટિચ માટે ડેન્સિટી સેટ થયેલી છે."
    ],
    detailEn: "Keep the failed sample. Mark the faults on it with a pen before you change anything, then change one thing and run it again. Two changes at once and you have learned nothing about either.",
    detailGu: "ખરાબ સેમ્પલ સાચવી રાખો. કંઈ પણ બદલતાં પહેલાં એના પર પેનથી ભૂલો માર્ક કરો, પછી એક જ વસ્તુ બદલીને ફરી ચલાવો. એકસાથે બે ફેરફાર કરો તો બેમાંથી એકે વિશે કશું શીખ્યા નહીં કહેવાય.",
    issueEn: "Diagnosis",
    issueGu: "નિદાન",
    exampleEn: "A filled motif came off with the ground rippled around it. The ripple followed the fill outline exactly, so it was not tension — there was no underlay holding the cloth. One edge-walk underlay and a firmer stabiliser, and the next run was flat.",
    exampleGu: "એક ભરેલું મોટિફ નીકળ્યું ત્યારે એની આસપાસ કાપડ લહેરાયેલું હતું. લહેર બરાબર ફિલની આઉટલાઇન પ્રમાણે હતી, એટલે એ ટેન્શન નહોતું — કાપડને પકડી રાખતું અન્ડરલે જ નહોતું. એક એજ-વોક અન્ડરલે અને વધુ મજબૂત સ્ટેબિલાઇઝર, અને પછીનો રન સપાટ આવ્યો."
  },
  {
    slug: "why-one-software",
    courseSlug: "emcad-embroidery-design",
    tags: [
      "emCAD DAHAO classes Surat",
      "EMCAD DAHAO embroidery training Surat",
      "computerised embroidery design course"
    ],
    questionEn: "Why learn one digitising package properly instead of three badly?",
    questionGu: "ત્રણ સોફ્ટવેર અધૂરાં શીખવા કરતાં એક બરાબર કેમ શીખવું?",
    answerEn: "Because the machine does not care which program wrote the file — it cares whether the underlay, the density, the stitch types, the pull compensation and the travel order are right. Those are learned once, at a machine, in one package. Karma teaches EMCAD DAHAO, and every design a student builds in it is stitched out on a live machine in the same session.",
    answerGu: "કારણ કે મશીનને એ નથી જોવું કે ફાઇલ કયા પ્રોગ્રામે લખી છે — એને એ જોવું છે કે અન્ડરલે, ડેન્સિટી, સ્ટિચ ટાઇપ, પુલ કોમ્પેન્સેશન અને ટ્રાવેલ ઓર્ડર સાચા છે કે નહીં. આ એક જ વાર, મશીન પાસે બેસીને, એક જ સોફ્ટવેરમાં શીખાય છે. Karma EMCAD DAHAO શીખવે છે, અને સ્ટુડન્ટ એમાં બનાવેલી દરેક ડિઝાઇન એ જ સેશનમાં લાઇવ મશીન પર સ્ટિચ થાય છે.",
    whyEn: "A course that tours several packages spends its hours on menus. Menus are the part you can pick up in a week. What takes three months is judgement — knowing, before you run it, that a 0.8mm satin column will not survive production speed, and knowing what to change. That judgement is built by digitising, stitching out, reading the sample and correcting the file, over and over, on one set of tools.",
    whyGu: "જે કોર્સ ઘણાં સોફ્ટવેર ફેરવે છે એ કલાકો મેનુમાં ખર્ચે છે. મેનુ તો અઠવાડિયામાં આવડી જાય. ત્રણ મહિના જે વસ્તુ માંગે છે એ છે સમજણ — ચલાવતાં પહેલાં જ ખબર પડવી કે 0.8mm ની સાટિન કોલમ પ્રોડક્શન સ્પીડમાં ટકશે નહીં, અને શું બદલવું એ ખબર હોવી. આ સમજણ ડિજિટાઇઝ કરીને, સ્ટિચ-આઉટ કરીને, સેમ્પલ વાંચીને અને ફાઇલ સુધારીને — વારંવાર, એક જ ટૂલસેટ પર — બને છે.",
    checksEn: [
      "Can you explain why a fill needs underlay, without naming a menu? That is the real test of whether you have learned digitising.",
      "Does your file run the same on someone else's machine? If not, the problem is in the file, not the software.",
      "Can you read a stitch-out and say which setting to change? That is the skill the hours are for.",
      "Have you connected and set the device yourself, or only watched? Production knowledge is hands, not slides."
    ],
    checksGu: [
      "મેનુનું નામ લીધા વગર તમે કહી શકો કે ફિલને અન્ડરલે કેમ જોઈએ? ડિજિટાઇઝિંગ ખરેખર આવડ્યું કે નહીં એની આ જ કસોટી છે.",
      "તમારી ફાઇલ બીજાની મશીન પર પણ એવી જ ચાલે છે? ના, તો પ્રોબ્લેમ ફાઇલમાં છે, સોફ્ટવેરમાં નહીં.",
      "સ્ટિચ-આઉટ વાંચીને કઈ સેટિંગ બદલવી એ કહી શકો છો? કલાકો આ જ સ્કિલ માટે છે.",
      "ડિવાઇસ જાતે કનેક્ટ અને સેટ કર્યું છે, કે ફક્ત જોયું છે? પ્રોડક્શન નોલેજ હાથનું કામ છે, સ્લાઇડનું નહીં."
    ],
    detailEn: "Karma teaches on EMCAD DAHAO because that is what the studio digitises its own production files on. A student sits at the same tools the floor runs, and can stitch out what they just built without leaving the room. The course does not run classes in any other digitising package.",
    detailGu: "Karma EMCAD DAHAO પર શીખવે છે, કારણ કે સ્ટુડિયો પોતાની પ્રોડક્શન ફાઇલ એના પર જ ડિજિટાઇઝ કરે છે. સ્ટુડન્ટ એ જ ટૂલ પર બેસે છે જે ફ્લોર પર ચાલે છે, અને હમણાં બનાવેલી ડિઝાઇન રૂમ છોડ્યા વગર સ્ટિચ કરી શકે છે. કોર્સ બીજા કોઈ ડિજિટાઇઝિંગ સોફ્ટવેરના ક્લાસ ચલાવતો નથી.",
    issueEn: "Software choice",
    issueGu: "સોફ્ટવેર પસંદગી",
    exampleEn: "An operator of four years learned EMCAD DAHAO and found the hardest part was not the software at all — it was accepting that the files he had been compensating for at the machine were fixable upstream.",
    exampleGu: "ચાર વર્ષના અનુભવવાળા એક ઓપરેટરે EMCAD DAHAO શીખ્યું, અને એને સૌથી અઘરું સોફ્ટવેર નહીં પણ આ સ્વીકારવાનું લાગ્યું: જે ફાઇલોની ભરપાઈ એ મશીન પર કરતો હતો, એ ઉપરથી જ સુધારી શકાતી હતી."
  },
  {
    slug: "needle-and-thread-matching",
    courseSlug: "flat-embroidery",
    tags: [
      "practical embroidery machine training",
      "machine embroidery training Surat"
    ],
    questionEn: "Needle and thread matching, in one minute",
    questionGu: "નીડલ અને થ્રેડનું મેચિંગ, એક મિનિટમાં",
    answerEn: "Match the needle to the thread and the fabric together, never one at a time. The eye must be large enough for the thread to pass without abrasion, the point must suit the weave, and the size must be the smallest that satisfies both.",
    answerGu: "નીડલ, થ્રેડ અને કાપડ — ત્રણેયનું મેચિંગ સાથે કરો, એક પછી એક નહીં. આંખ એટલી મોટી હોવી જોઈએ કે થ્રેડ ઘસાયા વગર નીકળે, પોઇન્ટ વણાટને અનુકૂળ હોવો જોઈએ, અને સાઇઝ એ બંને શરત પૂરી કરતી સૌથી નાની હોવી જોઈએ.",
    whyEn: "Every stitch drags the thread through the eye several times. If the eye is tight for that thread — metallics especially — the thread is being sanded on every pass, and it will break somewhere in the run rather than at a moment you can predict. Too large a needle instead leaves visible holes in a fine ground.",
    whyGu: "દરેક ટાંકે થ્રેડ આંખમાંથી કેટલીય વાર ખેંચાય છે. એ થ્રેડ માટે આંખ સાંકડી હોય — ખાસ કરીને મેટાલિકમાં — તો દર વખતે થ્રેડ ઘસાય છે, અને રનમાં ક્યાંક તૂટે છે, ધારેલી ક્ષણે નહીં. બીજી બાજુ, બહુ મોટી નીડલ ઝીણા કાપડમાં દેખાય એવા કાણાં પાડે છે.",
    checksEn: [
      "Metallic or heavy thread? Go up an eye size before you touch the tension.",
      "Knit or stretch fabric? A ball point pushes threads aside instead of cutting them.",
      "Tightly woven or coated ground? A sharp point makes a cleaner hole than a universal.",
      "Breaks in the same place every run? That is the path, not the needle. Breaks in random places is the needle."
    ],
    checksGu: [
      "મેટાલિક કે જાડો થ્રેડ? ટેન્શનને હાથ લગાડતાં પહેલાં આંખની સાઇઝ એક વધારો.",
      "નિટ કે સ્ટ્રેચ ફેબ્રિક? બોલ પોઇન્ટ દોરાને કાપવાને બદલે બાજુમાં ખસેડે છે.",
      "ગાઢ વણાટ કે કોટેડ ગ્રાઉન્ડ? યુનિવર્સલ કરતાં શાર્પ પોઇન્ટ સાફ કાણું પાડે છે.",
      "દર રનમાં એક જ જગ્યાએ તૂટે છે? એ પાથ છે, નીડલ નહીં. અલગ અલગ જગ્યાએ તૂટે તો નીડલ છે."
    ],
    detailEn: "Change the needle before you believe it is fine. A needle that has run a long job is blunt in a way you cannot see, and a blunt point is the cheapest fault on this list to rule out.",
    detailGu: "નીડલ બરાબર છે એવું માની લેતાં પહેલાં બદલી જુઓ. લાંબો જોબ ચલાવેલી નીડલ એવી રીતે બુઠ્ઠી થાય છે જે દેખાતી નથી, અને આ યાદીમાં બુઠ્ઠો પોઇન્ટ સૌથી સસ્તી રીતે નકારી શકાય એવી ભૂલ છે.",
    issueEn: "Thread breaks",
    issueGu: "થ્રેડ બ્રેક",
    exampleEn: "Metallic thread shredding every few minutes on a heavy bridal ground turned out to be a needle eye one size too small, plus two corners in the path sharper than a metallic will turn. Both fixed, the run finished without a break.",
    exampleGu: "હેવી બ્રાઇડલ ગ્રાઉન્ડ પર દર થોડી મિનિટે છોલાતો મેટાલિક થ્રેડ — કારણ નીકળ્યું એક સાઇઝ નાની આંખ, અને પાથમાં બે ખૂણા જે મેટાલિક વળી શકે એના કરતાં તીક્ષ્ણ હતા. બંને સુધાર્યા પછી રન એક પણ વાર તૂટ્યા વગર પૂરો થયો."
  },
  {
    slug: "sample-to-machine-ready-file",
    courseSlug: "emcad-embroidery-design",
    tags: [
      "computerised embroidery design course",
      "emCAD classes Surat"
    ],
    questionEn: "From a physical sample to a machine-ready file",
    questionGu: "ફિઝિકલ સેમ્પલથી મશીન-રેડી ફાઇલ સુધી",
    answerEn: "You are not tracing a picture, you are reading stitches. Work out the order the original was sewn in, the stitch type in each area and the direction each fill runs, then rebuild it — because a traced outline produces a design that looks right and stitches nothing like the sample.",
    answerGu: "તમે ચિત્ર ટ્રેસ નથી કરતા, ટાંકા વાંચો છો. મૂળ પીસ કયા ક્રમે સીવાયો, કયા ભાગમાં કયો સ્ટિચ ટાઇપ છે અને દરેક ફિલ કઈ દિશામાં ચાલે છે — એ સમજીને ફરી બનાવો. ટ્રેસ કરેલી આઉટલાઇનથી ડિઝાઇન દેખાવમાં સાચી લાગે છે પણ સેમ્પલ જેવી બિલકુલ સીવાતી નથી.",
    whyEn: "A photograph flattens a piece that has height, direction and layers. Two areas that look identical in a photo may be a satin column and a tatami fill, which behave completely differently on cloth. Reading the physical piece — under a light, at an angle — is what recovers that.",
    whyGu: "જે પીસમાં ઊંચાઈ, દિશા અને લેયર છે, એને ફોટો સપાટ કરી નાખે છે. ફોટોમાં એકસરખા દેખાતા બે ભાગ ખરેખર સાટિન કોલમ અને તાતામી ફિલ હોઈ શકે, જે કાપડ પર સાવ અલગ વર્તે છે. લાઇટ નીચે, ત્રાંસી નજરે ફિઝિકલ પીસ વાંચવાથી જ એ પાછું મળે છે.",
    checksEn: [
      "Turn the piece over. The back tells you the travel order and where the machine trimmed.",
      "Hold it at an angle to a light. Satin catches the light in one direction; a fill does not.",
      "Measure the smallest element. If it is under about 1mm wide it will not survive as satin at production speed.",
      "Count the colours, then count the colour changes. They are not the same number, and the second one drives cost."
    ],
    checksGu: [
      "પીસ ઊંધો કરો. પાછળનો ભાગ ટ્રાવેલ ઓર્ડર અને મશીને ક્યાં ટ્રિમ કર્યું એ કહી દે છે.",
      "લાઇટ સામે ત્રાંસો પકડો. સાટિન એક દિશામાં ચમકે છે, ફિલ નહીં.",
      "સૌથી નાનું એલિમેન્ટ માપો. લગભગ 1mm થી પાતળું હોય તો પ્રોડક્શન સ્પીડ પર સાટિન તરીકે ટકશે નહીં.",
      "રંગ ગણો, પછી કલર ચેન્જ ગણો. બંને આંકડા સરખા નથી હોતા, અને ખર્ચ બીજા પરથી નક્કી થાય છે."
    ],
    detailEn: "Rebuild at the size it will actually be stitched. Scaling a finished file up or down changes density and pull, so a file that ran perfectly at 4 inches is a new problem at 8.",
    detailGu: "જે સાઇઝમાં ખરેખર સીવવાનું છે એ જ સાઇઝમાં ફરી બનાવો. તૈયાર ફાઇલને મોટી-નાની કરવાથી ડેન્સિટી અને પુલ બદલાય છે — 4 ઇંચ પર બરાબર ચાલેલી ફાઇલ 8 ઇંચ પર નવો પ્રોબ્લેમ છે.",
    issueEn: "Digitising",
    issueGu: "ડિજિટાઇઝિંગ",
    exampleEn: "A bridal panel came in as a photograph and a fabric swatch with no file. Read back from the physical piece it turned out to be three stitch types, not the one the photo suggested — which is why the first traced attempt looked flat.",
    exampleGu: "એક બ્રાઇડલ પેનલ ફોટો અને કાપડના નમૂના સાથે આવી, ફાઇલ વગર. ફિઝિકલ પીસ પરથી વાંચતાં ખબર પડી કે એમાં ત્રણ સ્ટિચ ટાઇપ છે, ફોટો પરથી લાગતું હતું એમ એક નહીં — એટલે જ પહેલો ટ્રેસ કરેલો પ્રયાસ સપાટ લાગતો હતો."
  },
  {
    slug: "what-to-learn-first",
    courseSlug: "flat-embroidery",
    tags: [
      "embroidery design classes Surat",
      "machine embroidery training Surat"
    ],
    questionEn: "What should a new embroidery designer learn first?",
    questionGu: "નવા એમ્બ્રોઇડરી ડિઝાઇનરે સૌથી પહેલાં શું શીખવું?",
    answerEn: "Underlay, density and stitch direction — in that order, on a machine, on real cloth. Everything else in this trade is built on those three, and a designer who has only ever seen their work on a screen has not learned any of them.",
    answerGu: "અન્ડરલે, ડેન્સિટી અને સ્ટિચ ડિરેક્શન — આ જ ક્રમમાં, મશીન પર, સાચા કાપડ પર. આ ધંધામાં બાકીનું બધું આ ત્રણ પર જ ઊભું છે, અને જેણે પોતાનું કામ ફક્ત સ્ક્રીન પર જ જોયું છે એણે આમાંનું એકે શીખ્યું નથી.",
    whyEn: "A screen preview shows you a picture. Cloth shows you what the design does to the ground it sits on. Underlay is how you stop the ground moving, density is how much thread the ground can take, and direction is how light falls on the finished piece. None of them is visible in a preview.",
    whyGu: "સ્ક્રીન પ્રિવ્યૂ તમને ચિત્ર બતાવે છે. કાપડ બતાવે છે કે ડિઝાઇન એ કાપડ સાથે શું કરે છે. અન્ડરલે એટલે કાપડને ખસતું અટકાવવાની રીત, ડેન્સિટી એટલે કાપડ કેટલો દોરો સહન કરે, અને ડિરેક્શન એટલે તૈયાર પીસ પર પ્રકાશ કેવી રીતે પડે. પ્રિવ્યૂમાં આમાંનું કશું દેખાતું નથી.",
    checksEn: [
      "Have you stitched out your own file this week? If not, you are designing blind.",
      "Can you name the underlay under each fill in your last design?",
      "Do you know the density you used, or did you accept the default?",
      "Have you run the same file on two different fabrics and seen the difference?"
    ],
    checksGu: [
      "આ અઠવાડિયે તમે તમારી પોતાની ફાઇલ સ્ટિચ કરી છે? ના, તો તમે આંખ બંધ કરીને ડિઝાઇન કરો છો.",
      "તમારી છેલ્લી ડિઝાઇનમાં દરેક ફિલ નીચે કયું અન્ડરલે છે એ કહી શકો?",
      "તમે કઈ ડેન્સિટી વાપરી એ ખબર છે, કે ડિફોલ્ટ સ્વીકારી લીધી?",
      "એક જ ફાઇલ બે અલગ કાપડ પર ચલાવીને ફરક જોયો છે?"
    ],
    detailEn: "The fastest way to learn all three is to run one design badly on purpose: no underlay, then too much density, then the fill turned ninety degrees. Three ruined samples teach more than three finished ones.",
    detailGu: "ત્રણેય શીખવાની સૌથી ઝડપી રીત એ છે કે એક ડિઝાઇન જાણી જોઈને ખરાબ ચલાવો: પહેલાં અન્ડરલે વગર, પછી વધુ પડતી ડેન્સિટી સાથે, પછી ફિલ નેવું ડિગ્રી ફેરવીને. ત્રણ બગડેલા સેમ્પલ ત્રણ સારા સેમ્પલ કરતાં વધારે શીખવે છે.",
    issueEn: "Learning order",
    issueGu: "શીખવાનો ક્રમ",
    exampleEn: "A design student who could draw well found her first stitch-out flat and lifeless. The drawing was fine; every fill ran in the same direction, so the whole piece caught the light as one dull sheet.",
    exampleGu: "સરસ દોરી શકતી એક ડિઝાઇન સ્ટુડન્ટને પોતાનો પહેલો સ્ટિચ-આઉટ સપાટ અને નિર્જીવ લાગ્યો. ડ્રોઇંગ બરાબર હતું; પણ દરેક ફિલ એક જ દિશામાં ચાલતું હતું, એટલે આખો પીસ એક ફિક્કી ચાદરની જેમ પ્રકાશ ઝીલતો હતો."
  },
  {
    slug: "sequence-out-of-registration",
    courseSlug: "sequence-work",
    tags: [
      "beads and sequence training",
      "machine embroidery training Surat"
    ],
    questionEn: "Why does sequence work go out of registration?",
    questionGu: "સિકવન્સનું કામ રજિસ્ટરની બહાર કેમ જાય છે?",
    answerEn: "Because drift accumulates. A repeat that is a fraction out on each cycle is invisible for the first metre and obvious by the third — so the fault is almost never at the point where you noticed it.",
    answerGu: "કારણ કે ખસવાનું ભેગું થતું જાય છે. દરેક સાઇકલમાં જરાક ખસતો રિપીટ પહેલા મીટરમાં દેખાતો નથી અને ત્રીજા મીટરે સ્પષ્ટ થઈ જાય છે — એટલે તમે જ્યાં નોંધ્યું ત્યાં ભૂલ લગભગ ક્યારેય હોતી નથી.",
    whyEn: "Two things move: the hoop in the frame, and the design in the travel order. If the design leaves a line and comes back to it later, anything that shifted in between lands in the gap. On a length, that gap grows every repeat.",
    whyGu: "બે વસ્તુ ખસે છે: ફ્રેમમાં હૂપ, અને ટ્રાવેલ ઓર્ડરમાં ડિઝાઇન. ડિઝાઇન કોઈ લાઇન છોડીને પછી પાછી આવે, તો વચ્ચે જે ખસ્યું એ બધું એ ગેપમાં દેખાય છે. લંબાઈમાં એ ગેપ દરેક રિપીટે વધતો જાય છે.",
    checksEn: [
      "Measure the drift at the start, the middle and the end. Growing drift is registration; constant offset is placement.",
      "Does the border finish in one pass, or does the fill interrupt it? Re-cut the travel order so it completes in one direction.",
      "Is the frame holding the full length, or only near the head? Add a hold point.",
      "Is the sequin size right for the motif? Oversized sequins on a tight curve will not sit flat however good the registration is."
    ],
    checksGu: [
      "શરૂઆતમાં, વચ્ચે અને છેડે ખસવાનું માપો. વધતું જતું ખસવું એટલે રજિસ્ટ્રેશન; એકસરખું ખસવું એટલે પ્લેસમેન્ટ.",
      "બોર્ડર એક જ પાસમાં પૂરી થાય છે, કે વચ્ચે ફિલ આવે છે? ટ્રાવેલ ઓર્ડર એવો ગોઠવો કે એક જ દિશામાં પૂરી થાય.",
      "ફ્રેમ આખી લંબાઈ પકડે છે કે ફક્ત હેડ પાસે? એક હોલ્ડ પોઇન્ટ ઉમેરો.",
      "મોટિફ પ્રમાણે સિકવન્સની સાઇઝ બરાબર છે? ટાઇટ વળાંક પર મોટા સિકવન્સ ગમે એટલા સારા રજિસ્ટ્રેશનમાં પણ સપાટ નહીં બેસે."
    ],
    detailEn: "Test on the full length, not on a 10cm swatch. A swatch cannot show you an error that only becomes visible after twenty repeats, which is exactly the error that ruins a dupatta.",
    detailGu: "10 સેમીના નમૂના પર નહીં, આખી લંબાઈ પર ટેસ્ટ કરો. વીસ રિપીટ પછી જ દેખાય એવી ભૂલ નમૂનો બતાવી શકતો નથી — અને દુપટ્ટો બગાડતી ભૂલ બરાબર એ જ હોય છે.",
    issueEn: "Registration",
    issueGu: "રજિસ્ટ્રેશન",
    exampleEn: "A repeat border drifted visibly across a dupatta length. The travel order let the hoop shift before the design returned to the border line. Re-sequenced so the border completes in one direction, with one extra hold point in the frame, and both ends matched.",
    exampleGu: "દુપટ્ટાની લંબાઈમાં રિપીટ બોર્ડર દેખીતી રીતે ખસી ગઈ. ડિઝાઇન બોર્ડર લાઇન પર પાછી આવે એ પહેલાં ટ્રાવેલ ઓર્ડરે હૂપને ખસવા દીધું. બોર્ડર એક જ દિશામાં પૂરી થાય એ રીતે ફરી ગોઠવ્યું, ફ્રેમમાં એક વધારાનો હોલ્ડ પોઇન્ટ મૂક્યો, અને બંને છેડા સરખા આવ્યા."
  },
  {
    slug: "density-is-not-always-better",
    courseSlug: "flat-embroidery",
    tags: [
      "computerised embroidery design course",
      "practical embroidery machine training"
    ],
    questionEn: "Why more density is not always better",
    questionGu: "વધારે ડેન્સિટી હંમેશાં સારી કેમ નથી",
    answerEn: "Density is thread the ground has to carry. Past a point you are not improving coverage, you are stiffening the fabric, slowing the job and giving the needle more chances to break — and on a light ground you are pulling it out of shape.",
    answerGu: "ડેન્સિટી એટલે એટલો દોરો જે કાપડે ઝીલવાનો છે. એક હદ પછી તમે કવરેજ સુધારતા નથી, કાપડ કડક કરો છો, જોબ ધીમો કરો છો, અને નીડલને તૂટવાની વધારે તક આપો છો — અને હળવા ગ્રાઉન્ડ પર એને ખેંચીને બગાડો છો.",
    whyEn: "Every stitch makes a hole and every hole is a small loss of strength. Coverage problems usually come from stitch width and underlay being wrong, not from too few stitches — so raising density treats a symptom and adds three new problems.",
    whyGu: "દરેક ટાંકો એક કાણું પાડે છે અને દરેક કાણું થોડી મજબૂતી ઓછી કરે છે. કવરેજની તકલીફ સામાન્ય રીતે ટાંકાની પહોળાઈ અને અન્ડરલે ખોટા હોવાથી આવે છે, ટાંકા ઓછા હોવાથી નહીં — એટલે ડેન્સિટી વધારવી એ લક્ષણનો ઇલાજ છે અને ત્રણ નવા પ્રોબ્લેમ ઊભા કરે છે.",
    checksEn: [
      "Is coverage failing everywhere, or only on the wide columns? Only on wide ones means split them, not densify them.",
      "Does the fabric feel like card after stitching? You are over the ground's limit.",
      "Has the stitch count jumped without the design changing? Check what the density change cost you per piece.",
      "Is the underlay right? Fixing underlay solves more coverage complaints than density ever does."
    ],
    checksGu: [
      "કવરેજ બધે ખૂટે છે કે ફક્ત પહોળા કોલમમાં? ફક્ત પહોળામાં હોય તો એને વિભાજિત કરો, ડેન્સિટી ન વધારો.",
      "સીવ્યા પછી કાપડ પૂંઠા જેવું લાગે છે? તમે કાપડની મર્યાદા વટાવી ગયા છો.",
      "ડિઝાઇન બદલ્યા વગર સ્ટિચ કાઉન્ટ વધી ગયો? ડેન્સિટીના ફેરફારે પીસ દીઠ કેટલો ખર્ચ વધાર્યો એ જુઓ.",
      "અન્ડરલે બરાબર છે? ડેન્સિટી કરતાં અન્ડરલે સુધારવાથી કવરેજની વધારે ફરિયાદો ઉકલે છે."
    ],
    detailEn: "Density and cost are the same conversation. Stitch count drives machine time, and machine time is what a job is quoted on — so a design that runs 20% denser than it needs is 20% less profitable on every piece, forever.",
    detailGu: "ડેન્સિટી અને ખર્ચ એક જ વાત છે. સ્ટિચ કાઉન્ટ પરથી મશીન ટાઇમ નક્કી થાય છે, અને જોબનો ભાવ મશીન ટાઇમ પરથી અપાય છે — એટલે જરૂર કરતાં 20% વધારે ગાઢ ડિઝાઇન દરેક પીસ પર, હંમેશ માટે, 20% ઓછો નફો આપે છે.",
    issueEn: "Density",
    issueGu: "ડેન્સિટી",
    exampleEn: "A file with satin gapping on its widest columns was 'fixed' by raising density across the whole design. The gaps closed, the fabric stiffened, the run slowed, and the actual answer was to split two columns.",
    exampleGu: "સૌથી પહોળા કોલમમાં સાટિન ગેપ પડતું હતું, અને આખી ડિઝાઇનની ડેન્સિટી વધારીને એને 'સુધારી' દેવાયું. ગેપ બંધ થયા, કાપડ કડક થયું, રન ધીમો પડ્યો — અને સાચો જવાબ ફક્ત બે કોલમ વિભાજિત કરવાનો હતો."
  },
  {
    slug: "choosing-stitch-direction",
    courseSlug: "applique-3d-embroidery",
    tags: [
      "computerised embroidery design course",
      "embroidery design classes Surat"
    ],
    questionEn: "How do you choose stitch direction?",
    questionGu: "સ્ટિચ ડિરેક્શન કેવી રીતે પસંદ કરવી?",
    answerEn: "Direction is how the piece catches light, and how it pulls the ground. Run fills along the length of a shape so the sheen follows the form, and vary direction between adjacent areas so they read as separate — a design where everything runs one way looks flat however good the stitching is.",
    answerGu: "ડિરેક્શન એટલે પીસ પ્રકાશ કેવી રીતે ઝીલે અને કાપડને કઈ તરફ ખેંચે એ. ફિલ આકારની લંબાઈ પ્રમાણે ચલાવો, જેથી ચમક આકારને અનુસરે; અને બાજુ બાજુના ભાગમાં દિશા બદલો, જેથી એ અલગ દેખાય. જેમાં બધું એક જ દિશામાં ચાલે એ ડિઝાઇન ગમે એટલી સારી સીવાય તોય સપાટ લાગે છે.",
    whyEn: "Thread is shiny in one axis and matt in the other. Two areas stitched in the same direction merge into one shape to the eye; the same two at different angles separate cleanly. Direction also decides which way the fabric is pulled, which is why every fill in one direction warps a light ground.",
    whyGu: "દોરો એક દિશામાં ચમકે છે અને બીજીમાં ફિક્કો લાગે છે. એક જ દિશામાં સીવેલા બે ભાગ આંખને એક જ આકાર લાગે છે; એ જ બે અલગ ખૂણે હોય તો સાફ અલગ પડે છે. ડિરેક્શન એ પણ નક્કી કરે છે કે કાપડ કઈ તરફ ખેંચાશે — એટલે જ બધા ફિલ એક દિશામાં હોય તો હળવું કાપડ વળી જાય છે.",
    checksEn: [
      "Do two touching areas run at the same angle? Change one, and the shape appears without adding an outline.",
      "Does a long petal or leaf run across its width? Turn it to run along the length.",
      "Is the whole design pulling one way after stitching? Balance the directions.",
      "Does the piece look flat in a photograph but fine in the hand? That is direction doing too little."
    ],
    checksGu: [
      "અડીને આવેલા બે ભાગ એક જ ખૂણે ચાલે છે? એકને બદલો, અને આઉટલાઇન ઉમેર્યા વગર જ આકાર દેખાશે.",
      "લાંબી પાંખડી કે પાન એની પહોળાઈની આરપાર ચાલે છે? એને લંબાઈ પ્રમાણે ફેરવો.",
      "સીવ્યા પછી આખી ડિઝાઇન એક તરફ ખેંચાય છે? દિશાઓ સંતુલિત કરો.",
      "હાથમાં સારો લાગે પણ ફોટોમાં સપાટ? એ ડિરેક્શન ઓછું કામ કરે છે એની નિશાની."
    ],
    detailEn: "Appliqué and 3D work make this obvious fastest, because a raised area with the wrong direction reads as a mistake rather than as depth. Beginners usually under-vary direction, never over-vary it.",
    detailGu: "એપ્લિક અને 3D કામમાં આ સૌથી ઝડપથી સમજાય છે, કારણ કે ખોટી દિશાવાળો ઊપસેલો ભાગ ઊંડાણને બદલે ભૂલ જેવો દેખાય છે. બિગિનર્સ સામાન્ય રીતે દિશા ઓછી બદલે છે, વધારે ક્યારેય નહીં.",
    issueEn: "Stitch direction",
    issueGu: "સ્ટિચ ડિરેક્શન",
    exampleEn: "A motif with three overlapping petals looked like one blob until the middle petal was turned thirty degrees. Nothing else changed — no outline, no colour, no density.",
    exampleGu: "ત્રણ એકબીજા પર ચઢેલી પાંખડીવાળું મોટિફ એક ગઠ્ઠા જેવું લાગતું હતું, જ્યાં સુધી વચલી પાંખડી ત્રીસ ડિગ્રી ફેરવી નહીં. બીજું કશું બદલ્યું નહીં — આઉટલાઇન નહીં, રંગ નહીં, ડેન્સિટી નહીં."
  }
];

/** Look up one note. */
export const noteBySlug = (slug: string) => machineNotes.find((n) => n.slug === slug);

/** Notes that point at a given course, for the course page's own link block. */
export const notesForCourse = (courseSlug: string) =>
  machineNotes.filter((n) => n.courseSlug === courseSlug);
