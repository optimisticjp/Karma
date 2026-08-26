"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

/**
 * Mobile bottom bar for course + admissions pages (plan 7.1 #13):
 * the conversion action never further than a thumb.
 */
export function StickyActionBar({ waText, courseSlug }: { waText?: string; courseSlug?: string }) {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur transition-transform duration-300 md:hidden " +
        (visible ? "translate-y-0" : "translate-y-full")
      }
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-2 p-2.5">
        <Link
          href={courseSlug ? { pathname: "/admission", query: { course: courseSlug, src: "sticky" } } : "/admission"}
          className="btn btn-primary flex-1 !py-3 text-sm"
        >
          {t("bookDemo")}
        </Link>
        <a
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(waText ?? t("waPrefillDemo"))}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("whatsapp")}
          className="btn btn-secondary !px-4 !py-3 text-sm"
        >
          <Icon name="whatsapp" size={20} />
        </a>
        <a href={`tel:+${site.whatsapp}`} aria-label={t("call")} className="btn btn-secondary !px-4 !py-3 text-sm">
          <Icon name="phone" size={20} />
        </a>
      </div>
    </div>
  );
}
