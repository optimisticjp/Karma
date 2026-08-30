"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { site } from "@/lib/site";

/**
 * WhatsApp floating action button: appears after 600px scroll, no pulsing
 * (plan 7.1 #13). Hidden where the sticky action bar already covers it.
 */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("common");
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hasStickyBar =
    pathname.startsWith("/courses/") || pathname.startsWith("/admissions") || pathname.startsWith("/admission");
  if (hasStickyBar || !visible) return null;

  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t("waPrefillDemo"))}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="fixed bottom-6 right-5 z-40 hidden h-13 w-13 items-center justify-center rounded-full bg-vermilion text-ivory shadow-lg transition-transform duration-200 hover:scale-105 xl:flex"
      style={{ height: 52, width: 52 }}
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4Zm-3 4.2c-.2 0-.5.1-.7.3-.7.7-.9 1.8-.4 3 .5 1.3 1.6 2.7 3.2 3.8 1.2.8 2.2 1.2 3.2 1.4 1 .1 1.9-.2 2.4-.9.2-.3.3-.7.2-1l-.1-.2-1.9-.9c-.2-.1-.5-.1-.7.1l-.6.7c-.1.2-.4.2-.6.1-.6-.3-1.3-.7-1.9-1.3-.6-.6-1-1.2-1.3-1.8-.1-.2 0-.4.1-.6l.6-.6c.2-.2.2-.5.1-.7l-.9-1.9c-.1-.3-.4-.4-.7-.4Z" />
      </svg>
    </a>
  );
}
