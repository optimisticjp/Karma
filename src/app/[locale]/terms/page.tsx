import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
    path: "/terms",
    title: gu ? "શરતો | Karma Design Studio" : "Terms | Karma Design Studio",
    description: gu ? "ટ્રેનિંગ અને સર્વિસની મુખ્ય શરતો." : "Key terms for training and services.",
    noIndex: true // draft: remove after owner review
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const gu = locale === "gu";

  const items: string[] = gu
    ? [
        "આ વેબસાઇટ પર કોઈ ઓનલાઇન પેમેન્ટ નથી. ફી અને રસીદ સ્ટુડિયોમાં રૂબરૂ થાય છે.",
        "સીટ બેચ પ્રમાણે લિમિટેડ છે; એડમિશન સ્ટુડિયોમાં કન્ફર્મ થાય પછી પાકું ગણાય.",
        "સર્ટિફિકેટ માટે એડમિશન પેજ પર દર્શાવેલી હાજરી, પ્રેક્ટિકલ અને ફાઇનલ પ્રોજેક્ટ જરૂરી છે.",
        "સ્ટુડિયોમાં મશીન અને સાધનોની સંભાળ ટ્રેનિંગનો ભાગ છે; જાણી જોઈને નુકસાનની જવાબદારી સ્ટુડન્ટની રહે છે.",
        "બિઝનેસ સર્વિસમાં: ક્વોટ મંજૂર થયા પછી કામ શરૂ થાય છે; ડિઝાઇનની માલિકી ડિલિવરી અને પેમેન્ટ પછી ક્લાયન્ટની.",
        "સ્ટુડન્ટના કામના ફોટા સંમતિ (ફોર્મ/લેખિત) પછી જ વેબસાઇટ પર મુકાય છે."
      ]
    : [
        "No online payment exists on this website. Fees and receipts happen in person at the studio.",
        "Seats are limited per batch; admission is final once confirmed at the studio.",
        "Certificates require the attendance, practicals and final project stated on the Admissions page.",
        "Care of machines and equipment is part of training; deliberate damage is the student's responsibility.",
        "For business services: work begins after quote approval; design ownership transfers to the client on delivery and payment.",
        "Photos of student work appear on this website only after consent (form/written)."
      ];

  return (
    <section className="section-compact">
      <div className="container-site max-w-3xl">
        <h1 className="text-h2 font-display">{gu ? "શરતો" : "Terms"}</h1>
        <p className="mt-3 rounded-lg border border-dashed border-vermilion bg-ivory-2 p-3 text-smallmeta font-semibold text-stone">
          ⚠ {gu ? "ડ્રાફ્ટ: લોન્ચ પહેલાં માલિક રિવ્યૂ જરૂરી." : "Draft: owner review required before launch."}
        </p>
        <ul className="mt-8 space-y-4">
          {items.map((i) => (
            <li key={i} className="flex gap-3 text-stone">
              <span aria-hidden="true" className="text-vermilion-deep">–</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
