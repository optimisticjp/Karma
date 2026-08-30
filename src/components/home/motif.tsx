/**
 * The shared buta motif and its production states.
 *
 * Extracted from <ScreenToStitch> so the machine-proof section can render the
 * same object failing and being corrected. One motif in every state is the
 * whole argument: a visitor watches a single design travel from file to
 * finished piece, including the part that goes wrong. Two different drawings
 * would have read as two unrelated pictures.
 *
 * No hooks here beyond the `uid` each caller passes in, so this is usable
 * from both server and client components.
 */

/**
 * The shared motif: a buta (paisley), the shape this trade actually runs on
 * every second garment in Surat. One closed outline, one inner curl, a stem
 * and a bead run — drawn once and then treated in every production state, so
 * the page reads as one object changing rather than a set of pictures.
 */
export const MOTIF = {
  /* Closed buta: a round bulb at the lower left drawn up into the curled
     point at the upper right. Laid on its side so it fills a landscape frame
     the way a border motif fills a border. */
  body:
    "M336 46 C366 96, 350 158, 306 190 C254 226, 170 230, 122 198 " +
    "C68 164, 60 100, 100 68 C138 40, 196 44, 218 84 " +
    "C236 116, 276 122, 300 100 C318 84, 328 64, 336 46 Z",
  /* The inner echo, the way a border row repeats just inside the outline. */
  inner:
    "M316 76 C338 118, 322 160, 288 182 C244 210, 176 212, 136 184 " +
    "C92 154, 86 106, 116 82 C148 58, 194 62, 214 96 " +
    "C230 122, 266 128, 292 110",
  /* Filled forms worked inside the bulb. */
  flowers: [
    { cx: 160, cy: 140, r: 16 },
    { cx: 208, cy: 160, r: 11 },
    { cx: 132, cy: 174, r: 9 }
  ],
  /* Where the needle enters, walked around the outline in stitch order. */
  stitches: [
    [336, 46],
    [356, 112],
    [330, 168],
    [280, 208],
    [206, 228],
    [140, 212],
    [86, 166],
    [66, 108],
    [106, 66],
    [170, 44],
    [218, 84]
  ] as const,
  /* The handful of anchors an EMCAD DAHAO file would actually expose. */
  nodes: [
    [336, 46],
    [306, 190],
    [122, 198],
    [100, 68],
    [218, 84],
    [300, 100]
  ] as const
};

export function StageOutline({ uid }: { uid: string }) {
  return (
    <svg
      className="stage-layer"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern id={`${uid}-cad`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0v20" fill="none" stroke="var(--color-line)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="400" height="250" fill={`url(#${uid}-cad)`} />
      <g fill="none" stroke="var(--color-carbon)" strokeWidth="1.7" strokeLinejoin="round">
        <path d={MOTIF.body} />
        <path d={MOTIF.inner} strokeWidth="1.1" />
        {MOTIF.flowers.map((f) => (
          <circle key={`${f.cx}-${f.cy}`} cx={f.cx} cy={f.cy} r={f.r} strokeWidth="1.1" />
        ))}
      </g>
      {/* Control points: the giveaway that this is a file, not a photograph. */}
      <g fill="var(--color-card)" stroke="var(--color-vermilion)" strokeWidth="1.3">
        {MOTIF.nodes.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 3.5} y={y - 3.5} width="7" height="7" />
        ))}
      </g>
    </svg>
  );
}

export function StagePath() {
  return (
    <svg
      className="stage-layer"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <rect width="400" height="250" fill="var(--color-ivory-2)" />
      {/* The design, receded: the file is still underneath the path. */}
      <g fill="none" stroke="var(--color-carbon)" strokeWidth="0.9" opacity="0.22">
        <path d={MOTIF.body} />
        <path d={MOTIF.inner} />
        {MOTIF.flowers.map((f) => (
          <circle key={`${f.cx}-${f.cy}`} cx={f.cx} cy={f.cy} r={f.r} />
        ))}
      </g>
      {/* The travel path, dashed like thread, in the one accent colour. */}
      <g
        fill="none"
        stroke="var(--color-vermilion)"
        strokeWidth="2.3"
        strokeLinejoin="round"
        strokeDasharray="7 5"
      >
        <path d={MOTIF.body} />
        <path d={MOTIF.inner} strokeWidth="1.7" />
      </g>
      {/* Every point where the needle goes into the cloth. */}
      <g fill="var(--color-carbon)">
        {MOTIF.stitches.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.8" />
        ))}
      </g>
    </svg>
  );
}

export function StageFinished({ uid }: { uid: string }) {
  return (
    <svg
      className="stage-layer"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Satin fill: short parallel strokes, the way a filled area is
            actually stitched. Reads as embroidery, not as a flat vector. */}
        <pattern
          id={`${uid}-satin`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(38)"
        >
          <rect width="6" height="6" fill="var(--color-vermilion)" />
          <path d="M0 0v6" stroke="rgb(255 255 255 / 0.32)" strokeWidth="1.7" />
        </pattern>
        {/* The ground cloth. */}
        <pattern id={`${uid}-weave`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="var(--color-card)" />
          <path d="M0 4h8M4 0v8" stroke="var(--color-line)" strokeWidth="0.7" opacity="0.65" />
        </pattern>
      </defs>
      <rect width="400" height="250" fill={`url(#${uid}-weave)`} />
      <path
        d={MOTIF.body}
        fill={`url(#${uid}-satin)`}
        stroke="var(--color-vermilion)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d={MOTIF.inner} fill="none" stroke="rgb(255 255 255 / 0.6)" strokeWidth="3" />
      {/* Flowers worked in a second colour, beads on the outline. */}
      <g fill="var(--color-carbon)" opacity="0.88">
        {MOTIF.flowers.map((f) => (
          <circle key={`${f.cx}-${f.cy}`} cx={f.cx} cy={f.cy} r={f.r} />
        ))}
      </g>
      <g fill="var(--color-card)" stroke="var(--color-carbon)" strokeWidth="1.2">
        {MOTIF.stitches.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4.2" />
        ))}
      </g>
    </svg>
  );
}


/**
 * The failed sample.
 *
 * This is the panel no competitor publishes, and it is the most persuasive
 * one on the page: a first stitch-out that went wrong, with the four faults
 * a trainer would circle. Every fault here is ordinary trade knowledge, not a
 * claim about any student's work —
 *
 *   1. the ground puckered, because there is no underlay holding it
 *   2. the satin thinned and gapped, because the density is too low for the
 *      stitch length being run
 *   3. the inner echo registered off, because the travel order lets the hoop
 *      shift before it comes back to that line
 *   4. the thread broke, because needle, thread and material do not match
 */
export function StageFailed({ uid }: { uid: string }) {
  /* Four faults, each marked where it happens. */
  const faults = [
    { x: 336, y: 46, n: "1" },
    { x: 176, y: 148, n: "2" },
    { x: 292, y: 112, n: "3" },
    { x: 96, y: 176, n: "4" }
  ];

  return (
    <svg
      className="stage-layer"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Puckered ground: the same weave, but the grid no longer runs
            straight, which is exactly what a pulled fabric looks like. */}
        <pattern id={`${uid}-pucker`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="var(--color-card)" />
          <path
            d="M0 4 q2 -1.6 4 0 t4 0 M4 0 q-1.6 2 0 4 t0 4"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.8"
          />
        </pattern>
        {/* Thin satin: same pitch, less coverage, so the ground shows through
            between the strokes the way a starved fill does. */}
        <pattern
          id={`${uid}-thin`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(38)"
        >
          <rect width="7" height="7" fill="var(--color-card)" />
          <path d="M1.5 0v7" stroke="var(--color-vermilion)" strokeWidth="2.6" opacity="0.72" />
        </pattern>
        {/* Where the fill gave out completely. */}
        <mask id={`${uid}-gap`}>
          <rect width="400" height="250" fill="#fff" />
          <ellipse cx="188" cy="150" rx="34" ry="20" fill="#000" />
          <ellipse cx="252" cy="176" rx="18" ry="12" fill="#000" />
        </mask>
      </defs>

      <rect width="400" height="250" fill={`url(#${uid}-pucker)`} />

      <path
        d={MOTIF.body}
        fill={`url(#${uid}-thin)`}
        mask={`url(#${uid}-gap)`}
        stroke="var(--color-vermilion)"
        strokeWidth="1.1"
        strokeOpacity="0.75"
        strokeLinejoin="round"
      />

      {/* The inner echo, stitched out of register: same path, shifted. */}
      <path
        d={MOTIF.inner}
        fill="none"
        stroke="var(--color-carbon)"
        strokeWidth="2.2"
        strokeOpacity="0.5"
        transform="translate(7 -5)"
      />

      {/* A broken thread, still hanging off the last stitch that took. */}
      <path
        d="M336 46 c 14 10, 26 4, 33 16 c 5 9, -3 14, 3 22"
        fill="none"
        stroke="var(--color-vermilion)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <g>
        {faults.map((f) => (
          <g key={f.n}>
            <circle
              cx={f.x}
              cy={f.y}
              r="13"
              fill="none"
              stroke="var(--color-carbon)"
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />
            <circle cx={f.x + 15} cy={f.y - 13} r="8" fill="var(--color-carbon)" />
            <text
              x={f.x + 15}
              y={f.y - 13}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9.5"
              fontWeight="700"
              fill="var(--color-card)"
            >
              {f.n}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * The correction — made in the file, not at the machine.
 *
 * This is the argument the whole institute rests on: an operator who
 * compensates by slowing the head down ships the fault; a digitiser who fixes
 * the file ships the garment. So the corrections are drawn as edits to the
 * design — underlay added under the fill, density raised, travel order
 * re-cut — rather than as dials being turned.
 */
export function StageCorrection({ uid }: { uid: string }) {
  return (
    <svg
      className="stage-layer"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern id={`${uid}-fix`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0v20" fill="none" stroke="var(--color-line)" strokeWidth="0.6" />
        </pattern>
        {/* Underlay is laid *inside* the shape it supports. Unclipped, the
            lattice ran past the outline and read as stray construction
            lines rather than as stitching under the fill. */}
        <clipPath id={`${uid}-inside`}>
          <path d={MOTIF.body} />
        </clipPath>
      </defs>
      <rect width="400" height="250" fill={`url(#${uid}-fix)`} />

      {/* The design, held quiet: this panel is about what was added to it. */}
      <g fill="none" stroke="var(--color-carbon)" strokeWidth="1.3" strokeOpacity="0.45">
        <path d={MOTIF.body} />
        <path d={MOTIF.inner} strokeWidth="0.9" />
      </g>

      {/* Underlay: the lattice laid down first to stop the ground moving.
          Needle blue, because it is a technical layer, not the accent. */}
      <path
        d={MOTIF.body}
        fill="none"
        stroke="var(--color-needle)"
        strokeWidth="1.1"
        strokeDasharray="10 7"
        transform="translate(200 125) scale(0.9) translate(-200 -125)"
      />
      <g
        stroke="var(--color-needle)"
        strokeWidth="0.9"
        strokeOpacity="0.75"
        clipPath={`url(#${uid}-inside)`}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${104 + i * 44} 78 L${128 + i * 44} 196`} />
        ))}
      </g>

      {/* Density raised: the fill strokes are closer together than they were
          in the failed sample, drawn at the same angle so the change reads. */}
      <g
        stroke="var(--color-vermilion)"
        strokeWidth="2"
        strokeOpacity="0.85"
        clipPath={`url(#${uid}-inside)`}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M${150 + i * 9} 122 L${166 + i * 9} 168`} />
        ))}
      </g>

      {/* Travel order re-cut: the new sequence, with direction. */}
      <g fill="none" stroke="var(--color-carbon)" strokeWidth="1.6">
        <path d="M100 68 L218 84 L300 100 L336 46" strokeDasharray="6 4" />
        <path d="M328 56 l8 -10 l2 12" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* The three edits, numbered in the order a digitiser would make them. */}
      {[
        { x: 116, y: 84, n: "1" },
        { x: 178, y: 140, n: "2" },
        { x: 300, y: 100, n: "3" }
      ].map((m) => (
        <g key={m.n}>
          <circle cx={m.x} cy={m.y} r="9" fill="var(--color-vermilion)" />
          <text
            x={m.x}
            y={m.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontWeight="700"
            fill="var(--color-card)"
          >
            {m.n}
          </text>
        </g>
      ))}
    </svg>
  );
}
