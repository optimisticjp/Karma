"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { track, type EventProps, type KarmaEvent } from "@/lib/analytics";

/**
 * Reports a view once, on mount.
 *
 * Renders nothing. It exists so a server-rendered page can emit one event
 * without becoming a client component, and it guards against React's
 * development double-invoke so a page view is counted once rather than twice.
 */
export function TrackView({ event, props }: { event: KarmaEvent; props?: EventProps }) {
  const locale = useLocale();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(event, { locale, ...props });
  }, [event, props, locale]);

  return null;
}
