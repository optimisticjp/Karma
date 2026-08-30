"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { track, type KarmaEvent, type EventProps } from "@/lib/analytics";

/**
 * An outbound action that reports itself.
 *
 * Most of this site is server-rendered, and `track()` needs a click handler,
 * so rather than turning whole pages into client components for the sake of
 * one link, the tracking lives in this leaf. It is the only thing that has to
 * ship as JS.
 *
 * The locale is filled in here so no caller has to remember to pass it, and
 * no caller can pass anything else: `EventProps` admits four enumerable keys
 * and nothing a visitor typed.
 */
export function TrackedLink({
  href,
  event,
  props,
  external = false,
  className,
  children,
  ...rest
}: {
  href: string;
  event: KarmaEvent;
  props?: EventProps;
  external?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">) {
  const locale = useLocale();
  return (
    <a
      href={href}
      className={className}
      onClick={() => track(event, { locale, ...props })}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
