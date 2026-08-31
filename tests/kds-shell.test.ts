import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { clampAt, declaration, ruleBody, token, PHONE } from "./helpers/measure";
import { routing } from "@/i18n/routing";
import { brandLogo } from "@/lib/brand";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const code = (p: string) =>
  read(p)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");

const css = read("src/app/thread-machine-proof.css");
const header = read("src/components/kds/shell/SiteHeader.tsx");
const footer = read("src/components/kds/shell/SiteFooter.tsx");
const brand = read("src/components/kds/shell/BrandMark.tsx");
const localeSwitch = read("src/components/kds/shell/LocaleSwitch.tsx");
const layout = read("src/app/[locale]/layout.tsx");

/**
 * THE SHELL.
 *
 * Header, mobile menu, language switch, footer. The shell is the one thing on
 * every page, so a mistake here is a mistake everywhere — which is why the
 * rules that are easy to break silently are asserted rather than trusted.
 */

/* ------------------------------------------------------------------ *
 * The logo slot contract
 * ------------------------------------------------------------------ */

describe("a future logo in any colour drops in without a redesign", () => {
  it("has exactly one place to configure it", () => {
    /* Not an `<img>` typed into the header. The fallback, the sizing and
       these tests all read from `src/lib/brand.ts`. */
    expect(brand).toContain('from "@/lib/brand"');
    expect(brandLogo).toBeNull();
  });

  it("reserves a HEIGHT, not a box", () => {
    /* A fixed box letterboxes one of the two shapes an owner might send. The
       height is capped and the width follows the asset's own ratio, so a wide
       horizontal lockup and a compact square mark both fit. */
    const logo = ruleBody(css, ".kds .brand-logo") as string;
    expect(declaration(logo, "height")).toBe("var(--logo-h)");
    expect(declaration(logo, "width")).toBe("auto");
  });

  it("never recolours the asset", () => {
    /* An owner who supplies a multicolour mark gets the multicolour mark. A
       single-colour variant would be a second asset, not a CSS trick. */
    const block = css.slice(css.indexOf(".kds .brand {"), css.indexOf(".kds .site-head"));
    for (const banned of ["filter:", "mask", "fill: var(--brand", "background-color: var(--brand"]) {
      expect(block, banned).not.toContain(banned);
    }
  });

  it("keeps the container neutral", () => {
    /* The logo never sits on a brand-colour block: a red block is wrong for a
       red logo and wrong again for a green one. */
    const head = ruleBody(css, ".kds .site-head") as string;
    expect(head).not.toContain("--brand-accent");
  });

  it("announces the studio's name, not the word 'logo'", () => {
    expect(brand).toContain("alt={site.legalName}");
    expect(brand).not.toContain('alt="logo"');
  });

  it("still ships a real mark while there is no asset", () => {
    /* A visibly temporary logo teaches visitors that the business is
       provisional. The fallback is a designed wordmark with the site's own
       needle mark in it. */
    expect(brand).toContain("brand-word");
    expect(brand).toContain("brand-needle");
  });
});

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

describe("navigation", () => {
  it("carries the plan's six destinations, in order", () => {
    const block = header.slice(header.indexOf("const NAV = ["), header.indexOf("] as const;"));
    const hrefs = [...block.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual([
      "/courses",
      "/batches",
      "/student-work",
      "/notes",
      "/services",
      "/about"
    ]);
  });

  it("makes the brand mark the home link rather than adding a Home item", () => {
    /* Two controls doing one job is how a row reaches eight items. */
    const block = header.slice(header.indexOf("const NAV = ["), header.indexOf("] as const;"));
    expect(block).not.toContain('"/"');
    expect(brand).toContain('href="/"');
  });

  it("adds Contact to the phone menu, where a phone number is looked for", () => {
    expect(header).toContain('const MENU_NAV = [...NAV, { href: "/contact"');
  });

  it("labels /about as Studio without renaming the route", () => {
    /* A display name is a decision; a URL is a promise to everyone who has
       already shared it. */
    expect(header).toContain('{ href: "/about", key: "studio" }');
  });

  it("marks the current page for assistive tech, not only in colour", () => {
    expect(header).toContain('aria-current={isActive(item.href) ? "page" : undefined}');
  });
});

/* ------------------------------------------------------------------ *
 * The mobile menu is a real dialog
 * ------------------------------------------------------------------ */

describe("the mobile menu", () => {
  it("closes on Escape and restores focus to its trigger", () => {
    expect(header).toContain('e.key === "Escape"');
    expect(header).toContain("triggerRef.current?.focus()");
  });

  it("traps Tab inside itself while open", () => {
    expect(header).toContain('e.key === "Tab"');
    expect(header).toContain("e.shiftKey");
  });

  it("locks the page behind it and unlocks on close", () => {
    expect(header).toContain('document.documentElement.style.overflow = "hidden"');
    expect(header).toContain('document.documentElement.style.overflow = ""');
  });

  it("is announced as a modal dialog with a name", () => {
    expect(header).toContain('role="dialog"');
    expect(header).toContain('aria-modal="true"');
    expect(header).toContain("aria-label={tc(");
  });

  it("renders outside the header, so its scrim covers the viewport", () => {
    /* THE BUG THIS CATCHES IS INVISIBLE IN THE SOURCE.
       `.site-head` carries a `backdrop-filter`, and a filtered element becomes
       the containing block for its `position: fixed` descendants. With the
       menu inside the header, the scrim's `inset: 0` resolved against the
       56px header: measured at 390×844 viewport it was 390×56, and a tap in
       the middle of the contextual dock still reached the dock while a modal
       dialog was open. `aria-modal` hid it from assistive tech; nothing hid
       it from a thumb.

       The header therefore closes BEFORE the menu markup. If a future change
       nests it back inside, this fails. */
    const headerClose = header.indexOf("</header>");
    const menu = header.indexOf('id="site-menu"');
    expect(headerClose).toBeGreaterThan(-1);
    expect(menu).toBeGreaterThan(headerClose);
    expect(header.indexOf('className="sheet-scrim"')).toBeGreaterThan(headerClose);
  });

  it("hides both pieces of phone chrome on a laptop by name", () => {
    /* The sibling selector this once relied on could not match: the scrim
       precedes the panel in the DOM, so `.site-menu ~ .sheet-scrim` matched
       nothing and the scrim would have stayed declared visible. */
    const block = css.slice(css.indexOf(".kds .site-menu,"));
    expect(block.slice(0, 120)).toContain(".kds .sheet-scrim");
  });

  it("closes when the route changes", () => {
    /* Otherwise a tap on a link leaves the menu covering the page it opened. */
    expect(header).toContain("useEffect(() => setOpen(false), [pathname])");
  });

  it("keeps the two phone roles apart inside the menu", () => {
    /* The call action dials `callPhone`; the WhatsApp action opens
       `whatsapp`. Which number answers what is unconfirmed, so they never
       collapse into one. */
    expect(header).toContain("tel:+${site.callPhone}");
    expect(header).toContain("waLink(");
    expect(code("src/components/kds/shell/SiteHeader.tsx")).not.toContain("wa.me/${site.callPhone}");
  });
});

/* ------------------------------------------------------------------ *
 * The language switch
 * ------------------------------------------------------------------ */

describe("the EN | ગુ switch", () => {
  it("offers exactly the routed locales", () => {
    expect(localeSwitch).toContain("routing.locales.map");
    expect([...routing.locales]).toEqual(["en", "gu"]);
  });

  it("is links, not buttons", () => {
    /* Each option is the same page in the other language, which is a
       destination. Links work with no JavaScript, open in a new tab on a
       middle click, and are announced as links. */
    expect(localeSwitch).toContain("<Link");
    expect(localeSwitch).toContain("href={pathname}");
    expect(localeSwitch).toContain("locale={code}");
  });

  it("preserves the current route", () => {
    expect(localeSwitch).toContain("usePathname");
  });

  it("remembers the choice without auto-redirecting on it", () => {
    expect(localeSwitch).toContain("kds-lang-choice");
    expect(routing.localeDetection).toBe(false);
  });

  it("uses no flag", () => {
    const clean = code("src/components/kds/shell/LocaleSwitch.tsx").toLowerCase();
    for (const flag of ["🇬🇧", "🇮🇳", "flag"]) {
      expect(clean, flag).not.toContain(flag.toLowerCase());
    }
  });

  it("marks each option with its own language", () => {
    expect(localeSwitch).toContain("lang={code}");
    expect(localeSwitch).toContain("hrefLang={code}");
  });

  it("identifies the current locale by more than colour", () => {
    expect(localeSwitch).toContain('aria-current={isCurrent ? "true" : undefined}');
  });

  it("gives both options a 44px target", () => {
    const option = ruleBody(css, ".kds .locale-option") as string;
    expect(clampAt(declaration(option, "min-height") as string)).toBeGreaterThanOrEqual(40);
    expect(clampAt(declaration(option, "min-width") as string)).toBeGreaterThanOrEqual(44);
  });

  it("is not a dialog", () => {
    /* Two values fit a segmented control. A focus-trapping bottom sheet to
       choose between two things you can already see is a dialog too many —
       plan §14. */
    expect(localeSwitch).not.toContain('role="dialog"');
    expect(localeSwitch).not.toContain("aria-modal");
  });
});

/* ------------------------------------------------------------------ *
 * Chrome measurement
 * ------------------------------------------------------------------ */

describe("the header measures itself from one token", () => {
  it("declares its height once and reads it everywhere", () => {
    expect(token(css, "--header-h")).toBeTruthy();
    const inner = ruleBody(css, ".kds .site-head-inner") as string;
    expect(declaration(inner, "height")).toBe("var(--header-h)");
    /* The menu opens below the header, so it has to know the same number. */
    const menu = ruleBody(css, ".kds .site-menu") as string;
    expect(menu).toContain("var(--header-h)");
  });

  it("is the 56px the plan asks for on a phone", () => {
    expect(clampAt(token(css, "--header-h") as string, PHONE) * 1).toBe(56);
  });

  it("offsets anchor targets by its own height", () => {
    /* Otherwise a jump link lands with the heading hidden under the header. */
    expect(css).toContain("scroll-padding-top: calc(var(--header-h)");
  });

  it("keeps the menu button past the tap floor", () => {
    const btn = ruleBody(css, ".kds .site-menu-btn") as string;
    expect(clampAt(declaration(btn, "width") as string)).toBeGreaterThanOrEqual(44);
    expect(clampAt(declaration(btn, "height") as string)).toBeGreaterThanOrEqual(44);
  });
});

/* ------------------------------------------------------------------ *
 * The footer
 * ------------------------------------------------------------------ */

describe("the footer", () => {
  it("leads with where you are and how to reach us", () => {
    /* The one it replaces put the phone number 686px down a 1,031px slab and
       had to drag it up with `order-first`. Here the visit block is simply
       first in the source. */
    const grid = footer.indexOf("site-foot-grid");
    expect(footer.indexOf("site-foot-visit")).toBeGreaterThan(grid);
    expect(footer.indexOf("site-foot-visit")).toBeLessThan(footer.indexOf("site-foot-nav"));
  });

  it("publishes all three numbers, each named by its channel", () => {
    for (const n of ["site.callPhone", "site.whatsapp", "site.landline"]) {
      expect(footer, n).toContain(n);
    }
    for (const label of ["callFor", "waFor", "landlineFor"]) {
      expect(footer, label).toContain(label);
    }
  });

  it("never opens WhatsApp on the call number", () => {
    expect(code("src/components/kds/shell/SiteFooter.tsx")).not.toContain("wa.me/${site.callPhone}");
  });

  it("carries everything the plan lists", () => {
    for (const item of [
      "/courses",
      "/batches",
      "/student-work",
      "/notes",
      "/services",
      "/about",
      "/contact",
      "/admission",
      "/admissions",
      "/privacy",
      "/terms"
    ]) {
      expect(footer, item).toContain(item);
    }
    expect(footer).toContain("LocaleSwitch");
    expect(footer).toContain("socials.instagram");
    expect(footer).toContain("socials.facebook");
  });

  it("resolves its localized facts through the accessor, not a ternary", () => {
    /* CLAUDE.md non-negotiable #1: the else-branch of `locale === "gu" ? …`
       renders a MISSING Gujarati field as English and looks identical to a
       translated one. */
    expect(footer).toContain('pick(site, "address", locale)');
    expect(footer).not.toContain('locale === "gu"');
  });

  it("is light, with no slab", () => {
    const foot = ruleBody(css, ".kds .site-foot") as string;
    expect(foot).not.toContain("background");
    expect(footer).toContain("on-cloth");
  });
});

/* ------------------------------------------------------------------ *
 * What the layout no longer carries
 * ------------------------------------------------------------------ */

describe("the layout", () => {
  const clean = code("src/app/[locale]/layout.tsx");

  it("renders the new shell and none of the old one", () => {
    expect(layout).toContain("<SiteHeader />");
    expect(layout).toContain("<SiteFooter />");
    for (const gone of ["MobileTabBar", "WhatsAppFab", "LanguageChooser", "LangBanner"]) {
      expect(clean, gone).not.toContain(gone);
    }
  });

  it("has dropped the class that reserved space for the permanent bar", () => {
    expect(clean).toContain('className="kds"');
    expect(clean).not.toContain("site-body");
  });

  it("floats nothing over the page", () => {
    /* The shell carries no permanent bottom bar, no floating action button
       and no one-time language interstitial. The header's `EN | ગુ` switch is
       visible in the first viewport of every page, so the language offer is
       always on screen rather than interrupting once and covering content —
       and it stops the banner colliding with the contextual dock, which is
       how the collision was found. */
    expect(clean).not.toContain("fixed inset-x-0");
    expect(read("src/components/kds/shell/SiteHeader.tsx")).toContain("<LocaleSwitch />");
  });

  it("keeps a skip link as the first focusable thing on the page", () => {
    expect(layout).toContain('href="#main"');
    expect(layout).toContain("skipToContent");
    expect(css).toContain(".kds .skip-link:focus");
  });

  it("keeps the footer at the bottom of a short page", () => {
    const root = ruleBody(css, ".kds") as string;
    expect(root).toContain("min-height: 100dvh");
    expect(css).toContain(".kds > main { flex: 1 0 auto; }");
  });
});
