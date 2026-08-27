"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SampleTag } from "@/components/ui/SampleTag";
import { techniqueChips, type GalleryItem } from "@/content/collections";
import { cn } from "@/lib/utils";

/**
 * Editorial masonry (spec): varied proportions, small technique labels,
 * no heavy overlays. Filters stay as chips; on mobile they scroll
 * horizontally. (Future: bottom-sheet filters, per spec's mobile note.)
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const t = useTranslations("workPage");
  const locale = useLocale();
  const [active, setActive] = useState<string>("all");

  const present = Array.from(new Set(items.map((i) => i.technique)));
  const filtered = active === "all" ? items : items.filter((i) => i.technique === active);

  const filterBtn = (key: string, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setActive(key)}
      aria-pressed={active === key}
      className={cn(
        "flex-none rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        active === key
          ? "border-carbon bg-carbon text-ivory"
          : "border-line bg-card text-stone hover:text-carbon"
      )}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        role="group"
        aria-label={t("sub")}
      >
        {filterBtn("all", t("all"))}
        {present.map((k) =>
          filterBtn(k, locale === "gu" ? techniqueChips[k]?.labelGu ?? k : techniqueChips[k]?.labelEn ?? k)
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-stone">{t("empty")}</p>
      ) : (
        <ul className="masonry mt-8">
          {filtered.map((g) => {
            const chip = techniqueChips[g.technique];
            return (
              <li key={g.titleEn} className="card card-lift overflow-hidden">
                <div className="relative">
                  <PhotoSlot label={g.photoLabel} ratio={g.ratio} className="card-img media-unveil rounded-none border-0" />
                  <span className="chip absolute left-3 top-3">
                    {locale === "gu" ? chip?.labelGu : chip?.labelEn}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold">{locale === "gu" ? g.titleGu : g.titleEn}</p>
                  <p className="text-smallmeta text-stone">{locale === "gu" ? g.noteGu : g.noteEn}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {g.hasPair ? (
                      <span className="rounded-full border border-vermilion px-2.5 py-0.5 text-xs font-bold text-vermilion-deep">
                        {t("pairTag")}
                      </span>
                    ) : null}
                    {g.sample ? <SampleTag /> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
