import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { PageIntro } from "@/components/ui/PageIntro";
import { LedgerRow } from "@/components/ui/Ledger";

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
    <>
      <PageIntro
        eyebrow={gu ? "કાનૂની" : "Legal"}
        title={gu ? "શરતો" : "Terms"}
        lede={
          gu
            ? "ટ્રેનિંગ અને બિઝનેસ સર્વિસ માટેની મુખ્ય શરતો, સાદી ભાષામાં."
            : "The key terms for training and business services, in plain language."
        }
      />
      <section className="section">
        <div className="container-site">
          {/* Each term is a sentence, so it sits in the row's NOTE slot, not
              its title slot. As titles, six paragraphs read as six headlines
              and the page looked like an index of things it does not have. */}
          <ul className="reading-shell ledger is-prose">
            {items.map((item, i) => (
              <LedgerRow
                as="li"
                key={item}
                index={String(i + 1).padStart(2, "0")}
                title={item}
              />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
