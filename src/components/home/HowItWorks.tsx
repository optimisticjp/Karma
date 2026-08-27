import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon, type IconName } from "@/components/ui/Icon";

const stepIcons: IconName[] = ["hoop", "nodes", "machine", "needle"];

/** The method as a node-and-path diagram: thread draws once, steps rise ≤12px. */
export function HowItWorks() {
  const t = useTranslations("home.how");
  const steps = [1, 2, 3, 4].map((n, i) => ({
    n: String(n).padStart(2, "0"),
    icon: stepIcons[i],
    title: t(`s${n}t` as "s1t"),
    desc: t(`s${n}d` as "s1d")
  }));

  return (
    <section className="section">
      <div className="container-site">
        <SectionHeading title={t("h2")} sub={t("line")} />
        <div className="relative u-section-body">
          <Reveal
            variant="draw"
            className="absolute left-0 right-0 top-[5px] hidden lg:block"
          />
          <ol className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 80} className="relative lg:pt-8">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 hidden h-3 w-3 rounded-full border-2 border-vermilion bg-ivory lg:block"
                  />
                  <div className="flex items-center gap-3">
                    <p className="numeral" aria-hidden="true">{s.n}</p>
                    <Icon name={s.icon} size={24} className="text-vermilion-deep" />
                  </div>
                  <h3 className="text-h4 mt-3 font-display">{s.title}</h3>
                  <p className="mt-2 text-smallmeta text-stone">{s.desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
