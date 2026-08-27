import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const gu = locale === "gu";
  return pageMeta({
    locale,
    path: "/privacy",
    title: gu ? "પ્રાઇવસી પોલિસી | Karma Design Studio" : "Privacy Policy | Karma Design Studio",
    description: gu
      ? "અમે કઈ વિગત લઈએ છીએ, શા માટે, અને તમારા હક્કો."
      : "What we collect, why, and your rights."
  });
}

/**
 * DPDP-aligned draft (plan 15.1). ⚠ Owner + legal review required before
 * launch; this is a working draft, honest and plain, not legal advice.
 */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const gu = locale === "gu";

  const sections: Array<{ h: string; p: string[] }> = gu
    ? [
        {
          h: "અમે કઈ વિગત લઈએ છીએ",
          p: [
            "એડમિશન ફોર્મ: નામ, WhatsApp નંબર, ઇમેઇલ (વૈકલ્પિક), પસંદ કરેલો કોર્સ અને સમય, ઉંમરનો ગાળો, વ્યવસાય, અનુભવ, વિસ્તાર, અને 18થી નાના માટે વાલીની વિગત.",
            "ડિઝાઇન બ્રીફ: નામ, ફોન, કંપની, પ્રોજેક્ટની વિગત અને તમે અપલોડ કરેલી ફાઇલ."
          ]
        },
        {
          h: "શા માટે",
          p: [
            "માત્ર તમારી અરજી કે બ્રીફ અંગે તમારો સંપર્ક કરવા. અમે વિગત વેચતા નથી અને જાહેરાત માટે વાપરતા નથી.",
            "18થી નાના અરજદાર માટે વાલીની સંમતિ ફોર્મમાં જ લેવાય છે."
          ]
        },
        {
          h: "ડિઝાઇન ફાઇલો",
          p: [
            "બિઝનેસ બ્રીફની ફાઇલ પ્રાઇવેટ સ્ટોરેજમાં રહે છે અને ક્યારેય પબ્લિક લિંકથી ખૂલતી નથી."
          ]
        },
        {
          h: "કેટલો સમય",
          p: [
            "એડમિશન અરજી: પ્રવેશ પ્રક્રિયા પૂરી થયા પછી વ્યાજબી સમય સુધી (નિયમ પ્રમાણે નક્કી થાય છે).",
            "તમે કહો એટલે અમે તમારી વિગત કાઢી નાખીએ છીએ, સિવાય કે કાયદા મુજબ રાખવી પડે."
          ]
        },
        {
          h: "તમારા હક્કો",
          p: [
            `તમારી વિગત જોવા, સુધારવા કે કઢાવવા ${site.email} પર 'Data request' લખીને મેઇલ કરો. અમે વ્યાજબી સમયમાં જવાબ આપીશું.`
          ]
        }
      ]
    : [
        {
          h: "What we collect",
          p: [
            "Admission form: name, WhatsApp number, optional email, chosen course and timing, age band, occupation, experience, area, and guardian details for applicants under 18.",
            "Design briefs: name, phone, company, project details and any files you upload."
          ]
        },
        {
          h: "Why",
          p: [
            "Only to contact you about your application or brief. We do not sell data and do not use it for advertising.",
            "For applicants under 18, guardian consent is collected in the form itself."
          ]
        },
        {
          h: "Design files",
          p: [
            "Business brief files live in private storage and are never served from public links."
          ]
        },
        {
          h: "How long",
          p: [
            "Admission applications: kept for a reasonable period after the admission cycle (finalised with policy review).",
            "Ask, and we delete your data, unless the law requires keeping it."
          ]
        },
        {
          h: "Your rights",
          p: [
            `To access, correct or erase your data, email ${site.email} with the subject 'Data request'. We respond within a reasonable time.`
          ]
        }
      ];

  return (
    <section className="section-compact">
      <div className="container-site max-w-3xl">
        <h1 className="text-h2 font-display">{gu ? "પ્રાઇવસી પોલિસી" : "Privacy Policy"}</h1>
        <p className="mt-3 rounded-lg border border-dashed border-vermilion bg-ivory-2 p-3 text-smallmeta font-semibold text-stone">
          ⚠ {gu
            ? "ડ્રાફ્ટ: લોન્ચ પહેલાં માલિક અને લીગલ રિવ્યૂ જરૂરી (DPDP Act 2023)."
            : "Draft: owner + legal review required before launch (DPDP Act 2023)."}
        </p>
        {sections.map((s) => (
          <div key={s.h} className="mt-8">
            <h2 className="text-h4 font-display">{s.h}</h2>
            {s.p.map((p) => (
              <p key={p} className="u-lede">{p}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
