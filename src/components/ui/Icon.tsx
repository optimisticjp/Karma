import { cn } from "@/lib/utils";

/**
 * The Karma Stitch icon family.
 *
 * Custom line icons, embroidery-native: no graduation caps, no rockets, no
 * generic education clip-art. One stroke width everywhere (1.5), round joins,
 * `currentColor`, 24×24 box.
 *
 * THE RULE THAT DECIDES WHETHER AN ICON GETS DRAWN HERE
 * ----------------------------------------------------
 * Branded concepts get niche icons. Universal actions keep universal icons.
 * A visitor must never have to decode a clever embroidery symbol to find
 * "Edit". So `pencil`, `trash`, `printer`, `search`, `arrow`, `phone` and
 * `map` are deliberately ordinary, and everything in the production /
 * technique / digitising / troubleshooting groups is deliberately ours.
 *
 * Nothing in here asserts a fact about the studio. An icon is a symbol for a
 * technique, not a claim about a machine Karma owns, so no icon names a
 * manufacturer, a model or a head count.
 */
const paths: Record<string, React.ReactNode> = {
  /* ------------------------------ production ------------------------------ */
  needle: (
    <>
      <path d="M19 5 7.5 16.5c-1.4 1.4-3.6 2.7-4.5 2.5.2-.9 1.1-3.1 2.5-4.5L17 3" />
      <path d="M17 3l4 4-1.5 1.5-4-4z" />
      <path d="M18.2 5.8l1 1" />
    </>
  ),
  /** The needle at the bottom of its stroke: the moment design becomes stitch. */
  "needle-down": (
    <>
      <path d="M12 3v11" />
      <ellipse cx="12" cy="6.2" rx="1" ry="1.7" />
      <path d="M10.5 14 12 18.4 13.5 14z" />
      <path d="M4 21h16" />
    </>
  ),
  spool: (
    <>
      <rect x="7" y="5" width="10" height="14" rx="1.5" />
      <path d="M5 5h14M5 19h14" />
      <path d="M7 9h10M7 12h10M7 15h10" />
    </>
  ),
  /** Thread cone on the stand — the shop-floor silhouette, not a spool. */
  cone: (
    <>
      <path d="M10 3.5h4l3 14.5H7z" />
      <ellipse cx="12" cy="18" rx="5" ry="1.8" />
      <path d="M9.4 9h5.2M8.7 13.5h6.6" />
    </>
  ),
  bobbin: (
    <>
      <ellipse cx="12" cy="6" rx="6" ry="2" />
      <ellipse cx="12" cy="18" rx="6" ry="2" />
      <path d="M6 6v12M18 6v12" />
      <path d="M9 9.5h6M9 12h6M9 14.5h6" />
    </>
  ),
  hoop: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 4.5V2.5M10.5 3.5h3" />
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
  /** A single embroidery head: body, needle bar, foot, bed. */
  "machine-head": (
    <>
      <rect x="4" y="3" width="12" height="8" rx="1.5" />
      <path d="M16 7h4.5" />
      <path d="M10 11v5" />
      <path d="M8.5 16h3" />
      <path d="M10 18v2" />
      <path d="M3 21h18" />
    </>
  ),
  /** Multi-head bed: the reason production embroidery is a machine trade. */
  "multi-head": (
    <>
      <rect x="2.5" y="3.5" width="5" height="6" rx="1" />
      <rect x="9.5" y="3.5" width="5" height="6" rx="1" />
      <rect x="16.5" y="3.5" width="5" height="6" rx="1" />
      <path d="M5 9.5v4M12 9.5v4M19 9.5v4" />
      <path d="M2.5 16.5h19M2.5 20.5h19" />
    </>
  ),

  /* ------------------------------- technique ------------------------------ */
  bead: (
    <>
      <path d="M2.5 18.5C7 18.5 9.5 12 15 9" />
      <circle cx="5.2" cy="18.2" r="1.7" />
      <circle cx="9.6" cy="14.6" r="1.7" />
      <circle cx="14.8" cy="10.4" r="1.7" />
      <circle cx="19.6" cy="8" r="1.7" />
    </>
  ),
  /** Overlapping perforated discs — sequence work reads as discs, not stars. */
  sequence: (
    <>
      <circle cx="8.5" cy="12" r="4.8" />
      <circle cx="15.5" cy="12" r="4.8" />
      <circle cx="8.5" cy="12" r="1.2" />
      <circle cx="15.5" cy="12" r="1.2" />
    </>
  ),
  /** Retained from v3 for the single-disc case. */
  sequin: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2" />
    </>
  ),
  /** Two parallel curves: a cord has thickness, a stitch line does not. */
  cording: (
    <>
      <path d="M2 13C6 4.5 9.5 17 13.5 8.5S19 5 22 8" />
      <path d="M2 18C6 9.5 9.5 22 13.5 13.5S19 10 22 13" />
    </>
  ),
  chain: (
    <>
      <path d="M4.5 12a3.2 3.2 0 0 1 3.2-3.2h1.6a3.2 3.2 0 0 1 0 6.4H7.7A3.2 3.2 0 0 1 4.5 12z" />
      <path d="M12.7 12a3.2 3.2 0 0 1 3.2-3.2h1.6a3.2 3.2 0 0 1 0 6.4h-1.6a3.2 3.2 0 0 1-3.2-3.2z" />
    </>
  ),
  /** Emitter, beam, clean cut in the line. No sparks, no fireworks. */
  laser: (
    <>
      <rect x="9" y="2.5" width="6" height="4" rx="1" />
      <path d="M12 6.5v5.5" />
      <path d="M10.4 18 12 12l1.6 6" />
      <path d="M3.5 18.5h6.2M14.3 18.5h6.2" />
    </>
  ),
  tuft: (
    <>
      <path d="M3 20h18" />
      <path d="M6 20v-4.2a2.1 2.1 0 1 1 4.2 0V20" />
      <path d="M11.2 20v-6.4a2.1 2.1 0 1 1 4.2 0V20" />
      <path d="M16.4 20v-3.4a2.1 2.1 0 1 1 4.2 0V20" />
    </>
  ),
  /** Tight parallel fill inside a shaped field — satin, and so zardosi. */
  satin: (
    <>
      <path d="M5 5.4C9 4.2 15 4.2 19 5.4" />
      <path d="M5 18.6C9 19.8 15 19.8 19 18.6" />
      <path d="M7.8 4.9v14.2M10.8 4.5v15M13.8 4.5v15M16.8 4.9v14.2" />
    </>
  ),
  /** A cut piece applied over ground, held by an edge. */
  applique: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <rect x="7.5" y="9" width="9" height="6" rx="1.5" />
      <path d="M4 6l3.5 3M20 6l-3.5 3M4 18l3.5-3M20 18l-3.5-3" />
    </>
  ),
  "cross-stitch": (
    <>
      <path d="M3.5 4l6 6M9.5 4l-6 6" />
      <path d="M14.5 4l6 6M20.5 4l-6 6" />
      <path d="M3.5 14l6 6M9.5 14l-6 6" />
      <path d="M14.5 14l6 6M20.5 14l-6 6" />
    </>
  ),

  /* ------------------------------ digitising ------------------------------ */
  /** Retained from v3: the path-with-nodes mark used across the EMCAD story. */
  nodes: (
    <>
      <path d="M4 17c4-8 8 4 16-8" />
      <circle cx="4" cy="17" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="9" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  /** A single vector node on a path: the smallest unit of a digitised design. */
  node: (
    <>
      <path d="M3 19C9 19 8 5 21 5" />
      <rect x="1.4" y="17.4" width="3.2" height="3.2" />
      <rect x="19.4" y="3.4" width="3.2" height="3.2" />
    </>
  ),
  handles: (
    <>
      <path d="M3 18C8 18 16 6 21 6" />
      <path d="M6.2 14.8 17.8 9.2" />
      <circle cx="5" cy="15.4" r="1.5" />
      <circle cx="19" cy="8.6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  density: <path d="M4 4v16M7 4v16M10 4v16M14.5 4v16M20 4v16" />,
  direction: (
    <>
      <path d="M3 18C8 18 8 6 20.5 6" />
      <path d="M17 3.2 20.8 6 17 8.8" />
    </>
  ),
  registration: (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  layers: (
    <>
      <path d="M12 4 4 8.5l8 4.5 8-4.5z" />
      <path d="M4 13l8 4.5 8-4.5" />
    </>
  ),

  /* ---------------------------- troubleshooting --------------------------- */
  "thread-break": (
    <>
      <path d="M2.5 12h6.5M15 12h6.5" />
      <path d="M9 12l1.8-2.4M9 12l2 2M15 12l-1.8 2.4M15 12l-2-2" />
    </>
  ),
  misregistration: (
    <>
      <rect x="3.5" y="3.5" width="11" height="11" rx="1" />
      <rect x="9.5" y="9.5" width="11" height="11" rx="1" />
    </>
  ),
  "density-problem": (
    <>
      <path d="M3.5 5v14M5.4 5v14M7.3 5v14M9.2 5v14" />
      <path d="M15 5v14M20.5 5v14" />
    </>
  ),
  correction: (
    <>
      <path d="M2.5 16.5c4 0 6.5-8 12-8" />
      <path d="M13 17.5l3 3 5-6.5" />
    </>
  ),

  /* ------------------ universal actions: deliberately ordinary ------------ */
  check: <path d="M4.5 12.5 10 18 19.5 6.5" />,
  arrow: <path d="M4 12h15m0 0-6-6m6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  pencil: (
    <>
      <path d="M4 20h4L20 8l-4-4L4 16z" />
      <path d="M14.5 5.5 18.5 9.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v5.5M14 11v5.5" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V3h10v6" />
      <path d="M5 9h14a2 2 0 0 1 2 2v5h-4M7 16H3v-5a2 2 0 0 1 2-2z" />
      <rect x="7" y="13.5" width="10" height="7" rx="1" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M15.8 15.8 21 21" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3 6.2v14L9 18l6 2 6-2.2v-14L15 6z" />
      <path d="M9 4v14M15 6v14" />
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

export const ICON_NAMES = Object.keys(paths) as IconName[];

/**
 * The four branded groups, plus the universal actions that are deliberately
 * NOT branded. Exported so `tests/machine-lab-system.test.ts` can hold the
 * family to the spec instead of the spec living only in a document.
 */
export const ICON_GROUPS = {
  production: ["needle", "needle-down", "cone", "bobbin", "hoop", "machine", "machine-head", "multi-head"],
  technique: [
    "bead",
    "sequence",
    "cording",
    "chain",
    "laser",
    "tuft",
    "satin",
    "applique",
    "cross-stitch"
  ],
  digitising: ["node", "handles", "density", "direction", "registration"],
  troubleshooting: ["thread-break", "misregistration", "density-problem", "correction"],
  /* Universal actions. Never replace one of these with an embroidery metaphor. */
  universal: ["pencil", "trash", "printer", "search", "arrow", "phone", "map", "check", "plus"]
} as const satisfies Record<string, readonly IconName[]>;

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
