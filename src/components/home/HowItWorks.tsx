import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
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
    <div className="mt-12 border-t border-line pt-8">
      <p className="eyebrow u-eyebrow-gap">{t("h2")}</p>
      <ol className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
        {steps.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 60}>
            <div className="flex items-center gap-3">
              <p className="numeral !text-[2.5rem]" aria-hidden="true">{s.n}</p>
              <Icon name={s.icon} size={22} className="text-vermilion-deep" />
            </div>
            <h3 className="text-h4 mt-2 font-display">{s.title}</h3>
            <p className="mt-1.5 text-smallmeta text-stone">{s.desc}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
