import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { clampAt, declaration, ruleBody, stripComments, token } from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const globals = read("src/app/globals.css");
const premium = read("src/app/premium.css");
const shell = read("src/components/admin/ConsoleShell.tsx");
const layout = read("src/app/admin/(console)/layout.tsx");

/* ------------------------------------------------------------------ *
 * The bottom navigation
 *
 * The console is used standing up, between a machine and a counter.
 * Before this, every module switch cost a full-viewport drawer — the
 * owner's measured 795px, opened and closed dozens of times a shift to
 * reach four or five destinations.
 * ------------------------------------------------------------------ */

describe("the console bottom navigation", () => {
  it("takes at most four destinations plus More", () => {
    /* Four is not a style choice. A bar of five where one is dead is a fifth
       of the product's navigation, and the fifth slot is More, which is never
       dead. */
    expect(layout).toContain(".slice(0, 4)");
    expect(stripComments(shell)).toContain("moreLabel");
  });

  it("is built from the same permission booleans the rail uses", () => {
    /* One source of truth for what the caller can reach. The bar computing its
       own idea of that is how a tab and a rail entry disagree. */
    for (const flag of [
      "allowed: canUseAdmissions",
      "allowed: canUseStudents",
      "allowed: canUseBatches",
      "allowed: canUseFees",
      "allowed: canUseAttendance"
    ]) {
      expect(layout, flag).toContain(flag);
    }
  });

  it("omits a destination the caller cannot reach rather than greying it", () => {
    /* The rail shows an unavailable module plainly inert, which is right for a
       17rem sidebar and wrong for a five-slot bar. */
    expect(layout).toContain("tabCandidates.filter((c) => c.allowed)");
    const tabsBlock = layout.slice(layout.indexOf("tabCandidates"), layout.indexOf("const sections"));
    expect(tabsBlock).not.toContain("available:");
  });

  it("never puts Team in the bar", () => {
    /* Team is Owner-only with no permission key at all, and a bar that differs
       between the Owner and every Admin teaches the wrong muscle memory — for
       a destination used a handful of times a year. */
    const tabsBlock = layout.slice(layout.indexOf("tabCandidates"), layout.indexOf(".slice(0, 4)"));
    expect(tabsBlock).not.toContain("/admin/team");
  });

  it("keeps navigation a UX affordance, never the security boundary", () => {
    expect(stripComments(shell)).toContain("aria-current");
    expect(shell).toContain("re-checks authorization server-side");
    /* Every tab destination is a real route with its own server-side guard. */
    for (const href of ["/admin", "/admin/admissions", "/admin/students", "/admin/batches"]) {
      const page = href === "/admin"
        ? "src/app/admin/(console)/page.tsx"
        : `src/app/admin/(console)${href.replace("/admin", "")}/page.tsx`;
      expect(existsSync(join(process.cwd(), page)), page).toBe(true);
      expect(read(page), page).toContain("requireAdmin");
    }
  });

  it("keeps a compact tab comfortably tappable", () => {
    const tab = ruleBody(premium, ".console-tab");
    expect(tab, ".console-tab must exist").not.toBeNull();
    expect(clampAt(declaration(tab as string, "min-height") as string)).toBeGreaterThanOrEqual(44);
    /* A 20px icon and an 11px label inside a 44px box: the visible element and
       the hit area are separate boxes, the same resolution `.tap` uses. */
    const label = ruleBody(premium, ".console-tab-label");
    expect(clampAt(declaration(label as string, "font-size") as string)).toBeGreaterThanOrEqual(11);
  });

  it("never letterspaces a Gujarati tab label", () => {
    expect(premium).toContain(":lang(gu) .console-tab-label { letter-spacing: 0;");
  });

  it("clears the home indicator, and lets the record sheet clear the bar", () => {
    const bar = ruleBody(premium, ".console-bar");
    expect(declaration(bar as string, "padding-bottom")).toContain("env(safe-area-inset-bottom)");
    /* A destructive confirmation may not open underneath the console's own
       navigation. */
    const narrow = premium.split("@media (max-width: 1023px)").slice(1).join("\n");
    expect(narrow).toContain(".rec-menu__panel");
    expect(narrow).toContain("var(--console-bar-h)");
    /* And the work surface reserves exactly the chrome the shell draws. */
    expect(narrow).toContain(".console-main { padding-bottom: calc(var(--console-bar-h)");
  });
});

/* ------------------------------------------------------------------ *
 * Chrome heights, from tokens
 * ------------------------------------------------------------------ */

describe("the console chrome measures itself from tokens", () => {
  it("declares each height exactly once and reads it everywhere", () => {
    for (const name of ["--console-header-h", "--console-bar-h"]) {
      expect((globals.match(new RegExp(`${name}\\s*:`, "g")) ?? []).length, name).toBe(1);
    }
    expect(premium).toContain(".console-appbar { height: var(--console-header-h); }");
    /* The sticky toolbar was hand-matched to a `min-h-16` in the shell
       component, two files apart. */
    expect(declaration(ruleBody(premium, ".toolbar") as string, "top")).toBe("var(--console-header-h)");
  });

  it("keeps the app bar past the tap floor", () => {
    expect(clampAt(token(globals, "--console-header-h") as string)).toBeGreaterThanOrEqual(44);
    expect(clampAt(token(globals, "--console-bar-h") as string)).toBeGreaterThanOrEqual(44);
  });

  it("does not restate the operator's own identity on every screen", () => {
    /* The app bar carried `personName · roleLabel` under the brand, on every
       console route — identity the operator already knows, at the cost of 20px
       of every screen. It lives in the More sheet now, beside the account
       link, where it is a fact about the session rather than a page header. */
    const appbar = stripComments(shell).slice(
      stripComments(shell).indexOf("console-appbar"),
      stripComments(shell).indexOf("console-sheet-scrim")
    );
    expect(appbar).not.toContain("roleLabel");
    expect(stripComments(shell)).toContain("roleLabel");
  });
});

/* ------------------------------------------------------------------ *
 * Batches became a destination
 * ------------------------------------------------------------------ */

describe("batches are their own destination", () => {
  const batches = read("src/app/admin/(console)/batches/page.tsx");
  const courses = read("src/app/admin/(console)/courses/page.tsx");

  it("exists, and guards itself on its own permission key", () => {
    expect(batches).toContain('requireAdmin("/admin/batches")');
    expect(batches).toContain('hasPermission(session.staff, "batches.view")');
    expect(batches).toContain("/admin/no-access?reason=permission");
  });

  it("reads the course name from one join, not from nesting", () => {
    /* The course name used to come from the batch being rendered inside a
       course row. One inner join is what lets a batch stand on its own row —
       and it must stay ONE query, not a lookup per row. */
    expect(batches).toContain(".innerJoin(schema.courses");
    expect((batches.match(/await db/g) ?? []).length).toBeLessThanOrEqual(3);
  });

  it("leaves the catalogue a catalogue", () => {
    /* /admin/courses used to select every column of every batch with a trainer
       join, purely to nest them inside course rows and then render a count on
       the closed row. One grouped query answers the only question it still
       asks. */
    expect(courses).toContain("count()");
    expect(courses).toContain(".groupBy(schema.batches.courseId)");
    expect(courses).not.toContain("BatchForm");
    expect(courses).not.toContain("schema.batches.seatsTaken");
  });

  it("puts the register first on a batch row", () => {
    /* The task a batch exists for. The attendance page already accepts ?batch=
       and ?date=, so this is an href and not a new query. */
    expect(batches).toContain("/admin/attendance?batch=${batch.id}&date=${today}");
    expect(batches).toContain("kolkataDate");
  });

  it("keeps every deep link resolving to a real route", () => {
    /* There are no per-record routes: a queue row deep-links to a fragment
       anchor in a module list. Today's batch queue followed the batches. */
    const today = read("src/app/admin/(console)/page.tsx");
    expect(today).toContain("/admin/batches#batch-${row.id}");
    expect(batches).toContain("id={`batch-${batch.id}`}");
    expect(batches).toContain("record-anchor");
  });

  it("asks the timezone question in one place", () => {
    /* `kolkataDate` was an identical one-liner in three files and a fourth was
       about to be written here. A timezone rule that lives in four places is a
       timezone rule that will eventually disagree with itself — and the window
       it disagrees in is 00:00 to 05:30 IST, when an attendance register would
       silently belong to yesterday. */
    expect(existsSync(join(process.cwd(), "src/lib/admin/dates.ts"))).toBe(true);
    const copies = walkAdmin().filter((f) => read(f).includes("function kolkataDate"));
    expect(copies).toEqual([]);
  });
});

function walkAdmin(dir = "src/app/admin", out: string[] = []): string[] {
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) walkAdmin(rel, out);
    else if (rel.endsWith(".ts") || rel.endsWith(".tsx")) out.push(rel);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * One page header, and the metric strip
 * ------------------------------------------------------------------ */

describe("every console page uses the compact header", () => {
  const pages = walkAdmin("src/app/admin/(console)").filter((f) => f.endsWith("/page.tsx"));

  it("finds enough pages to be measuring something", () => {
    expect(pages.length).toBeGreaterThanOrEqual(12);
  });

  it("renders PageHead and nothing else", () => {
    for (const page of pages) {
      expect(read(page), page).toContain("PageHead");
    }
    /* The legacy `.console-page-head` trio is gone from the stylesheet too: a
       second header implementation with no callers is how a ninth copy creeps
       back. */
    expect(premium).not.toContain(".console-page-title");
    expect(premium).not.toContain(".console-page-head");
  });

  it("keeps the title inside the plan's admin band", () => {
    const machineLab = read("src/app/machine-lab.css");
    const title = ruleBody(machineLab, ".console-head-title");
    const px = clampAt(declaration(title as string, "font-size") as string);
    expect(px).toBeGreaterThanOrEqual(22);
    expect(px).toBeLessThanOrEqual(26);
  });

  it("makes a metric a row on a phone, not a card", () => {
    const metric = ruleBody(premium, ".console-metrics > *");
    expect(metric, ".console-metrics > * must exist").not.toBeNull();
    expect(declaration(metric as string, "display")).toBe("flex");
    expect(clampAt(declaration(metric as string, "padding")?.split(" ")[0] as string)).toBeLessThanOrEqual(14);
  });
});
