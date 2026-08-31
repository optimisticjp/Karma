/**
 * THE LOGO SLOT CONTRACT.
 *
 * Karma has no logo file. The owner may supply one later in any colour — red,
 * blue, green, gold, black, multicolour — and the site has to accept it without
 * a redesign (plan §1.4, §8.4).
 *
 * This is the one place that changes when it arrives. Point `logo` at the
 * asset, give it its intrinsic dimensions, and the header and footer pick it
 * up. Until then they render the wordmark fallback, which is a real mark
 * rather than a placeholder box.
 *
 * WHAT THE CONTRACT GUARANTEES, AND WHY EACH PART OF IT MATTERS
 * ------------------------------------------------------------
 *  - **The slot has a reserved height, not a reserved box.** `--logo-h` caps
 *    the rendered height and the width follows the asset's own ratio, so a
 *    wide horizontal lockup and a compact square mark both drop in. A fixed
 *    box would letterbox one of them.
 *  - **The container stays neutral.** The logo never sits on a brand-colour
 *    block, because a red block is wrong for a red logo and wrong again for a
 *    green one. It sits on paper.
 *  - **Nothing recolours it.** No `filter`, no `currentColor` mask, no
 *    forced monochrome — an owner who supplies a multicolour mark gets the
 *    multicolour mark. If a single-colour variant is ever needed, it is a
 *    second asset, not a CSS trick applied to the first.
 *  - **Alt text is the studio's name**, not "logo": a screen reader announcing
 *    "logo" tells a visitor nothing.
 *
 * `tests/kds-shell.test.ts` asserts all four.
 */

export type BrandLogo = {
  /** Path under `public/`, or a same-origin deployed asset path. */
  src: string;
  /** Intrinsic pixels. Used to reserve the right width and avoid layout shift. */
  width: number;
  height: number;
  /**
   * A second asset for cramped contexts — a square mark where the horizontal
   * lockup would be illegible. Optional: without it the main asset is used
   * everywhere and simply scales down.
   */
  compact?: { src: string; width: number; height: number };
};

/**
 * ⚠ CONFIRM-WITH-OWNER: no logo asset exists yet.
 *
 * Set this and nothing else. Do not add an `<img>` to the header by hand —
 * the fallback, the sizing rules and the tests all read from here.
 */
export const brandLogo: BrandLogo | null = null;
