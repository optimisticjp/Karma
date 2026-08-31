/*
 * Measurement helpers for the compact-density redesign
 * (docs/karma-compact-density-redesign-plan.md).
 *
 * The plan states its targets as RENDERED PIXELS AT A PHONE WIDTH — "mobile
 * section gaps should usually land around 20-32px", "hero 30-36px max",
 * "admin row padding 10-14px". Almost every value in this codebase is a
 * `clamp()`, so a test that pins the literal `clamp(2.5rem, 1.9rem + 2.6vw,
 * 4.5rem)` is pinning an EXPRESSION rather than the rule, and any equivalent
 * re-expression fails it for no reason.
 *
 * These helpers let a test state the rule instead: parse the declaration,
 * evaluate it at 390px, and assert the number. A later session may re-express
 * the clamp however it likes as long as the phone value still holds.
 *
 * This module is NOT a test file (vitest collects `tests/**\/*.test.{ts,tsx}`),
 * but it IS typechecked — tsconfig includes `**\/*.ts`.
 */

/** The viewport the plan's density targets are written against. */
export const PHONE = 390;

/** The narrowest width the plan's matrix requires (§31). */
export const NARROW = 320;

/**
 * Strip CSS and JS comments before scanning source text.
 *
 * This repository has been bitten four separate times by a blunt substring
 * ban failing on the code's OWN honest prose — a doc comment explaining why a
 * rule exists is not a violation of that rule. Every scan runs through here.
 */
export const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/** Root font size. Nothing in this project changes it. */
const REM = 16;

/** `2.5rem` / `24px` / `0` -> a number of CSS pixels. */
export function lengthPx(value: string, viewport: number): number {
  const v = value.trim();
  let m = /^(-?[\d.]+)rem$/.exec(v);
  if (m) return Number(m[1]) * REM;
  m = /^(-?[\d.]+)em$/.exec(v);
  if (m) return Number(m[1]) * REM;
  m = /^(-?[\d.]+)px$/.exec(v);
  if (m) return Number(m[1]);
  m = /^(-?[\d.]+)vw$/.exec(v);
  if (m) return (Number(m[1]) / 100) * viewport;
  if (v === "0") return 0;
  throw new Error(`lengthPx: unsupported length ${JSON.stringify(value)}`);
}

/** `1.9rem + 2.6vw` — the only arithmetic shape the stylesheets actually use. */
function sumPx(expression: string, viewport: number): number {
  return expression
    .split("+")
    .map((part) => lengthPx(part, viewport))
    .reduce((a, b) => a + b, 0);
}

/**
 * Evaluate `clamp(min, preferred, max)` — or a plain length — at `viewport`.
 *
 * Throws rather than returning NaN on anything it cannot parse, so a value
 * expressed as `calc()`, `min()` or `oklch()` produces a legible failure
 * instead of a comparison that silently passes.
 */
export function clampAt(value: string, viewport: number = PHONE): number {
  const v = value.trim().replace(/;$/, "");
  const m = /^clamp\(([^,]+),([^,]+),([^)]+)\)$/.exec(v);
  if (!m) return lengthPx(v, viewport);
  const [min, preferred, max] = [sumPx(m[1], viewport), sumPx(m[2], viewport), sumPx(m[3], viewport)];
  return Math.min(Math.max(min, preferred), max);
}

/**
 * The body of one CSS rule, by exact selector.
 *
 * Slicing by selector rather than scanning the whole file is what stops an
 * unrelated `4rem` 2,000 lines away from passing or failing a check by
 * accident. Returns null when the selector is absent, so a test can assert
 * presence explicitly instead of silently measuring nothing.
 */
export function ruleBody(css: string, selector: string): string | null {
  const clean = stripComments(css);
  // The selector must end where it is written: `.section` may not match
  // `.section-major`, and the stylesheets align braces with runs of spaces.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const at = new RegExp(`(?:^|[\\s,{}])${escaped}\\s*\\{`, "m").exec(clean);
  if (!at) return null;
  const open = clean.indexOf("{", at.index + at[0].length - 1);
  const close = clean.indexOf("}", open);
  if (close === -1) return null;
  return clean.slice(open + 1, close);
}

/** One declaration's value out of a rule body. */
export function declaration(body: string, property: string): string | null {
  const m = new RegExp(`(?:^|;)\\s*${property}\\s*:([^;}]+)`).exec(body);
  return m ? m[1].trim() : null;
}

/** `--color-x: #aabbcc;` anywhere in a stylesheet. */
export function token(css: string, name: string): string | null {
  const m = new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(stripComments(css));
  return m ? m[1].trim() : null;
}

/** WCAG relative luminance, computed the way a browser does. */
export function luminance(hex: string): number {
  const h = hex.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) throw new Error(`luminance: unsupported colour ${JSON.stringify(hex)}`);
  const channels = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two 6-digit hex colours. */
export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
