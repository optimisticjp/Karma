import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

/**
 * Owner-confirmed operational corrections that must override older catalogue
 * copy immediately. Keeping them here makes the correction apply to normal UI
 * translations AND metadata generated through `getTranslations`, while the
 * larger message catalogues can be normalized in a later copy-only pass.
 */
const OWNER_CORRECTIONS: Record<Locale, {
  admissionsDescription: string;
  contactDescription: string;
  timingEvening: string;
}> = {
  en: {
    admissionsDescription:
      "Joining is simple: start with a free demo class. See upcoming batches, timings till 11:00 pm, the student handbook and the admission form.",
    contactDescription:
      "WhatsApp, call, or walk in. 302 Middle Point, Mahadev Chowk, near Dhara Arcade, Mota Varachha, Surat. Open daily, evening batches till 11:00 pm.",
    timingEvening: "Evening (till 11:00 pm)"
  },
  gu: {
    admissionsDescription:
      "જોડાવું સાવ સરળ: શરૂઆત ફ્રી ડેમો ક્લાસથી. આગામી બેચ, 11:00 સુધીના ટાઇમિંગ, સ્ટુડન્ટ હેન્ડબુક અને એડમિશન ફોર્મ જુઓ.",
    contactDescription:
      "WhatsApp કરો, ફોન કરો, અથવા સીધા આવો. ૩૦૨ મિડલ પોઇન્ટ, મહાદેવ ચોક, ધારા આર્કેડ પાસે, મોટા વરાછા, સુરત. રોજ ખુલ્લું, સાંજની બેચ 11:00 સુધી.",
    timingEvening: "સાંજ (11:00 સુધી)"
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
        }
      },
      admissionForm: {
        ...base.admissionForm,
        options: {
          ...base.admissionForm.options,
          timingEvening: corrected.timingEvening
        }
      }
    }
  };
});
