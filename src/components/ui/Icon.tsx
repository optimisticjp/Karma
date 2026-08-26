import { cn } from "@/lib/utils";

/**
 * Custom line icons, embroidery-native (Digital Thread spec: no graduation
 * caps, no rockets). One stroke width everywhere: 1.5, round joins,
 * currentColor. Sized via the size prop or className.
 */
const paths: Record<string, React.ReactNode> = {
  needle: (
    <>
      <path d="M19 5 7.5 16.5c-1.4 1.4-3.6 2.7-4.5 2.5.2-.9 1.1-3.1 2.5-4.5L17 3" />
      <path d="M17 3l4 4-1.5 1.5-4-4z" />
      <path d="M18.2 5.8l1 1" />
    </>
  ),
  spool: (
    <>
      <rect x="7" y="5" width="10" height="14" rx="1.5" />
      <path d="M5 5h14M5 19h14" />
      <path d="M7 9h10M7 12h10M7 15h10" />
    </>
  ),
  hoop: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 4.5V2.5M10.5 3.5h3" />
    </>
  ),
  nodes: (
    <>
      <path d="M4 17c4-8 8 4 16-8" />
      <circle cx="4" cy="17" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="9" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  machine: (
    <>
      <path d="M4 18V8a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3" />
      <path d="M11 6v6M11 12h6" />
      <path d="M11 12v3M10 18v-3h2v3" />
      <path d="M2.5 18h19" />
    </>
  ),
  layers: (
    <>
      <path d="M12 4 4 8.5l8 4.5 8-4.5z" />
      <path d="M4 13l8 4.5 8-4.5" />
    </>
  ),
  sequin: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6.5" r="2.5" />
      <circle cx="6" cy="17.5" r="2.5" />
      <path d="M8.2 8 20 17M8.2 16 20 7" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  check: <path d="M4.5 12.5 10 18 19.5 6.5" />,
  arrow: <path d="M4 12h15m0 0-6-6m6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  phone: (
    <path d="M5 4h4l1.5 4.5-2.2 1.6a12 12 0 0 0 5.6 5.6l1.6-2.2L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.5 20 4 13.5 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
  ),
  whatsapp: (
    <>
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z" />
      <path d="M9 8.5c-.5.5-.7 1.5-.2 2.7.6 1.3 1.6 2.6 3 3.6 1.1.7 2.1 1.1 3 1.1.6 0 1.2-.3 1.5-.8l-2-1-1 .8c-.6-.3-1.2-.7-1.8-1.3-.6-.6-1-1.2-1.3-1.8l.8-1-1-2z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.7-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  )
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.5
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {paths[name]}
    </svg>
  );
}
