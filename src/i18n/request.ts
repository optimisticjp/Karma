import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

/**
 * Owner-confirmed operational corrections and catalogue-safe wording.
 *
 * The JSON catalogues intentionally remain translation assets, but public
 * availability is now controlled in Karma Console. Copy that states a fixed
 * course count or an obsolete closing time can therefore drift even when the
 * data layer is correct. These request-time overrides keep UI translations and
 * metadata aligned with the current operational contract until the next full
 * copy pass normalises the source JSON itself.
 */
const OWNER_CORRECTIONS: Record<Locale, {
  admissionsDescription: string;
  contactDescription: string;
  timingEvening: string;
  coursesDescription: string;
  heroSub: string;
  swatchMore: string;
  learnSub: string;
  bookSub: string;
  coursesTitle: string;
  catalogueEyebrow: string;
  aboutAcademyBody: string;
  servicesCapabilitySub: string;
}> = {
  en: {
    admissionsDescription:
      "Joining is simple: start with a free demo class. See upcoming batches, timings till 11:00 pm, the student handbook and the admission form.",
    contactDescription:
      "WhatsApp, call, or walk in. 302 Middle Point, Mahadev Chowk, near Dhara Arcade, Mota Varachha, Surat. Open daily, evening batches till 11:00 pm.",
    timingEvening: "Evening (till 11:00 pm)",
    coursesDescription:
      "Practical live-machine embroidery training in Mota Varachha, Surat. See the studio's current public course catalogue, timings and free-demo options.",
    heroSub:
      "Karma is an embroidery academy and design lab in Mota Varachha. Practical machine-embroidery techniques are taught on live production machines — start from zero, or fix the faults your machine already gives you. Start with a free demo.",
    swatchMore: "+{count} more",
    learnSub: "Current techniques · free demo · current batches",
    bookSub:
      "The studio's currently published techniques across three families. Each one is taught at the machine, with a trainer beside you. Open the one that makes what you want to make.",
    coursesTitle: "Embroidery techniques, taught on the machines that make them.",
    catalogueEyebrow: "Current catalogue",
    aboutAcademyBody:
      "The studio's current public courses span machine embroidery, modern techniques and design software. Training happens at the machine from the first session, in Gujarati and Hindi, in morning and evening batches.",
    servicesCapabilitySub:
      "The same techniques the school currently lists, on the same floor. This list follows the public course catalogue, so a hidden course does not keep appearing here as a current capability."
  },
  gu: {
    admissionsDescription:
      "જોડાવું સાવ સરળ: શરૂઆત ફ્રી ડેમો ક્લાસથી. આગામી બેચ, 11:00 સુધીના ટાઇમિંગ, સ્ટુડન્ટ હેન્ડબુક અને એડમિશન ફોર્મ જુઓ.",
    contactDescription:
      "WhatsApp કરો, ફોન કરો, અથવા સીધા આવો. ૩૦૨ મિડલ પોઇન્ટ, મહાદેવ ચોક, ધારા આર્કેડ પાસે, મોટા વરાછા, સુરત. રોજ ખુલ્લું, સાંજની બેચ 11:00 સુધી.",
    timingEvening: "સાંજ (11:00 સુધી)",
    coursesDescription:
      "મોટા વરાછા, સુરતમાં લાઇવ મશીન પર પ્રેક્ટિકલ એમ્બ્રોઇડરી ટ્રેનિંગ. સ્ટુડિયોની હાલની જાહેર કોર્સ યાદી, ટાઇમિંગ અને ફ્રી ડેમો વિકલ્પો જુઓ.",
    heroSub:
      "Karma મોટા વરાછામાં એમ્બ્રોઇડરી એકેડેમી અને ડિઝાઇન લેબ છે. પ્રેક્ટિકલ મશીન-એમ્બ્રોઇડરી ટેકનિક ચાલુ પ્રોડક્શન મશીન પર શીખવાય છે — સાવ શરૂઆતથી શીખો અથવા તમારી મશીનની ભૂલો સુધારો. શરૂઆત ફ્રી ડેમોથી કરો.",
    swatchMore: "+{count} વધુ",
    learnSub: "હાલની ટેકનિક · ફ્રી ડેમો · ચાલુ બેચ",
    bookSub:
      "સ્ટુડિયોની હાલમાં જાહેર કરેલી ટેકનિક ત્રણ ફેમિલીમાં ગોઠવેલી છે. દરેક મશીન પર, ટ્રેનર સાથે બેસીને શીખવાય છે. તમે જે બનાવવું છે એ કોર્સ ખોલો.",
    coursesTitle: "એમ્બ્રોઇડરી ટેકનિક, જે મશીન પર બને છે એ જ મશીન પર શીખવાય છે.",
    catalogueEyebrow: "હાલનો કેટલોગ",
    aboutAcademyBody:
      "સ્ટુડિયોના હાલના જાહેર કોર્સ મશીન એમ્બ્રોઇડરી, મોડર્ન ટેકનિક અને ડિઝાઇન સોફ્ટવેર સુધી ફેલાયેલા છે. પહેલા સેશનથી જ મશીન પર ટ્રેનિંગ, ગુજરાતી અને હિન્દીમાં, સવાર અને સાંજની બેચમાં થાય છે.",
    servicesCapabilitySub:
      "સ્કૂલની હાલની જાહેર કોર્સ યાદીમાં જે ટેકનિક છે એ જ ફ્લોર પર કામ થાય છે. કોર્સ છુપાવવામાં આવે તો તે અહીં હાલની ક્ષમતા તરીકે દેખાતો નથી."
  }
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const base = (await import(`../../messages/${locale}.json`)).default;
  const corrected = OWNER_CORRECTIONS[locale];

  return {
    locale,
    messages: {
      ...base,
      meta: {
        ...base.meta,
        admissions: {
          ...base.meta.admissions,
          description: corrected.admissionsDescription
        },
        contact: {
          ...base.meta.contact,
          description: corrected.contactDescription
        },
        courses: {
          ...base.meta.courses,
          description: corrected.coursesDescription
        }
      },
      admissionForm: {
        ...base.admissionForm,
        options: {
          ...base.admissionForm.options,
          timingEvening: corrected.timingEvening
        }
      },
      home: {
        ...base.home,
        hero: {
          ...base.home.hero,
          sub: corrected.heroSub,
          swatchMore: corrected.swatchMore
        },
        paths: {
          ...base.home.paths,
          learnSub: corrected.learnSub
        },
        book: {
          ...base.home.book,
          sub: corrected.bookSub
        }
      },
      coursesPage: {
        ...base.coursesPage,
        title: corrected.coursesTitle,
        catalogueEyebrow: corrected.catalogueEyebrow
      },
      aboutPage: {
        ...base.aboutPage,
        academyBody: corrected.aboutAcademyBody
      },
      servicesPage: {
        ...base.servicesPage,
        capabilitySub: corrected.servicesCapabilitySub
      }
    }
  };
});