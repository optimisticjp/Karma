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

/* ------------------------------------------------------------------ *
 * The core workflows — Today, Admissions, Students, Fees
 *
 * Eleven of sixteen console screens showed ZERO complete records at
 * 390x844. The pattern was one pattern: a `sm:grid-cols-3` metric trio
 * that stacks to a single column on a phone, then a filter toolbar of
 * full-width rows, then — finally — the list.
 * ------------------------------------------------------------------ */

describe("the core admin workflows show records, not chrome", () => {
  const today = read("src/app/admin/(console)/page.tsx");
  const admissions = read("src/app/admin/(console)/admissions/page.tsx");
  const students = read("src/app/admin/(console)/students/page.tsx");
  const fees = read("src/app/admin/(console)/fees/page.tsx");

  it("replaces every stacked metric trio with the hairline strip", () => {
    for (const [name, source] of [
      ["today", today],
      ["admissions", admissions],
      ["fees", fees],
      ["courses", read("src/app/admin/(console)/courses/page.tsx")],
      ["batches", read("src/app/admin/(console)/batches/page.tsx")]
    ] as const) {
      expect(source, name).toContain("console-metrics");
      expect(source, name).not.toContain("sm:grid-cols-3");
    }
  });

  it("gives a fees-only admin something to do", () => {
    /* Their Today screen was literally empty — every queue was gated on a
       permission they do not hold, and they still paid for the counts. */
    expect(today).toContain("canFees");
    expect(today).toContain('count={c.feesOverdue}');
    expect(read("src/lib/admin/dashboard.ts")).toContain("feesOverdue");
  });

  it("derives every fee figure and stores none of them", () => {
    /* A `status` column would be a second source of truth for a number the
       ledger already holds, and the two would disagree the first time a
       receipt was corrected. This holds on the new Today queue as well. */
    const dashboard = read("src/lib/admin/dashboard.ts");
    expect(dashboard).toContain("sum(f.received)");
    expect(dashboard).not.toContain("fee_status");
    expect(students).toContain("summariseFees");
  });

  it("keeps the new reads set-based, never per row", () => {
    /* The student row gained a course, a batch, an enrolment status and a
       balance. Reads stay scoped to the ids already on screen and never become
       a query per student. Fee rows are joined raw and summarised per enrolment
       in memory so multiple receipts cannot duplicate the agreement total. */
    expect(students).toContain("inArray(schema.enrollments.studentId, visibleIds)");
    expect(students).toContain(".leftJoin(schema.feeRecords");
    expect(students).toContain("directoryByEnrollment");
    expect(students).not.toMatch(/for \(const student of students\)[\s\S]{0,200}await db/);
  });

  it("renders the fields it already fetched", () => {
    /* `demoSlot` was selected on every load and rendered nowhere: the one
       field that says when an applicant wants to come in for their free demo.
       `preferredSchedule` printed its raw storage key. Both now resolve
       through the course's own timetable — one more column on a SELECT that
       already runs. */
    expect(admissions).toContain("slotLabel(application.courseSlug, application.demoSlot)");
    expect(admissions).toContain("readCourseOperations");
    /* `latest` was computed on the fees page and read nowhere. It is the last
       receipt — the thing a parent at the counter is holding. */
    expect(fees).toContain("/admin/print/receipt/${card.latest.id}");
  });

  it("never states a status by colour alone, even in a compact row", () => {
    expect(students).toContain("status-dot");
    expect(students).toContain("copy.statuses[");
  });

  it("keeps money tabular wherever a column of it appears", () => {
    for (const [name, source] of [["fees", fees], ["students", students]] as const) {
      expect(source, name).toContain("data-num");
    }
  });
});

/* ------------------------------------------------------------------ *
 * The remaining workflows — Attendance, Certificates, Design Desk,
 * Content Desk, Reports, Team, account & security
 *
 * The same pattern in five more places, plus two shapes the core
 * workflows did not have: a 5-column table with `min-w-[52rem]` inside
 * a 366px panel, and a page whose entire body was one open form per
 * record.
 * ------------------------------------------------------------------ */

describe("the remaining admin workflows", () => {
  const attendance = read("src/app/admin/(console)/attendance/page.tsx");
  const attendanceForm = read("src/app/admin/(console)/attendance/AttendanceForm.tsx");
  const certificates = read("src/app/admin/(console)/certificates/page.tsx");
  const design = read("src/app/admin/(console)/design/page.tsx");
  const content = read("src/app/admin/(console)/content/page.tsx");
  const reports = read("src/app/admin/(console)/reports/page.tsx");
  const team = read("src/app/admin/(console)/team/page.tsx");
  const account = read("src/app/admin/(console)/account/security/page.tsx");

  it("replaces every remaining stacked metric trio with the hairline strip", () => {
    for (const [name, source] of [
      ["certificates", certificates],
      ["design", design],
      ["content", content],
      ["reports", reports]
    ] as const) {
      expect(source, name).toContain("console-metrics");
      expect(stripComments(source), name).not.toContain("sm:grid-cols-3");
    }
    /* Attendance is the exception, and deliberately so. Its three counts belong
       ON the register they describe, not in a strip above it: the operator
       reads "34 students, 12 marked" while marking, so they are one meta line
       inside the form itself. */
    expect(stripComments(attendance)).not.toContain("sm:grid-cols-3");
    expect(attendanceForm).toContain("data-row__meta");
    expect(stripComments(attendanceForm)).not.toContain("panel panel-body");
  });

  it("puts no record behind a full-width card on any of them", () => {
    /* `<article className="panel">` per record was the shape that made
       Certificates 362px, Design ~900px and Team 443px PER ROW. */
    for (const [name, source] of [
      ["certificates", certificates],
      ["design", design],
      ["content", content],
      ["team", team]
    ] as const) {
      expect(stripComments(source), name).not.toContain('<article className="panel"');
      expect(source, name).toContain("data-list");
      expect(source, name).toContain("data-row");
    }
  });

  it("gives a disclosure row a visible disclosure", () => {
    /* `.data-row` is `display: grid`, which silently drops the marker a
       `<summary>` draws for itself. Four modules put their record body behind
       such a row; without the caret the row reads as static text and the
       actions underneath are never found. */
    const body = ruleBody(premium, "summary.data-row");
    expect(body).toBeTruthy();
    expect(declaration(body!, "cursor")).toBe("pointer");
    const caret = ruleBody(premium, "summary.data-row::after");
    expect(caret).toBeTruthy();
    expect(declaration(caret!, "transform")).toContain("rotate");
    expect(premium).toContain("details[open] > summary.data-row::after");
  });

  it("keeps the attendance control both the display and the input", () => {
    /* A roster row is read and written in the same gesture. Splitting the two
       is what made each student a 212px bordered card. */
    expect(attendanceForm).toContain("data-row");
    expect(stripComments(attendanceForm)).not.toContain("MiniMetric");
  });

  it("does not rename an attendance field while compacting the row", () => {
    /* `saveAttendanceAction` reads `status:<id>` and `note:<id>` for the whole
       roster. A rename here would silently stop saving, and the failure would
       look like a UI bug weeks later. */
    expect(attendanceForm).toContain("`status:${row.studentId}`");
    expect(attendanceForm).toContain("`note:${row.studentId}`");
    const action = read("src/app/admin/(console)/attendance/actions.ts");
    expect(action).toContain("status:");
    expect(action).toContain("note:");
  });

  it("stops making a phone drag a 52rem table sideways", () => {
    /* Sixty audit rows in a 5-column table with `min-w-[52rem]` was 832px of
       content inside a 366px panel. Below `md` it is a list; the table is
       still the better scan on a laptop. */
    expect(stripComments(reports)).not.toContain("min-w-[52rem]");
    expect(reports).toContain("data-list mt-4 md:hidden");
    expect(reports).toContain("hidden overflow-x-auto md:block");
  });

  it("states the audit column headings in the operator's language", () => {
    const copy = read("src/lib/admin/reports-copy.ts");
    for (const key of ["auditWhen", "auditStaff", "auditAction", "auditRecord", "auditReason"]) {
      expect(reports, key).toContain(`copy.${key}`);
      /* Present in BOTH catalogs — the Gujarati console is not a translation
         of an English screen, it is the screen. */
      expect((copy.match(new RegExp(`${key}:`, "g")) ?? []).length, key).toBe(3);
    }
    expect(stripComments(reports)).not.toContain('<th className="px-4 py-3">When</th>');
  });

  it("does not repeat a qualifier the heading already states", () => {
    /* Three of seven figures carried a "Last 30 days" caption under the
       number, on a screen whose section heading says it once on the same
       line. */
    expect(reports).toContain("{copy.last30Days}");
    expect((reports.match(/copy\.last30Days/g) ?? []).length).toBe(1);
  });

  it("keeps Team owner-only, deletion-free and inside its invariants", () => {
    expect(team).toContain('requireOwner("/admin/team")');
    expect(team).toContain("MAX_ADMIN_SEATS");
    /* Accounts are deactivated, never removed: audit rows must keep pointing
       at a real staff record. Compacting the page must not introduce the one
       affordance the module has never had. */
    const clean = stripComments(team);
    expect(clean).not.toContain("deleteStaff");
    expect(clean).not.toMatch(/team\.delete/);
    expect(clean).not.toContain("PermanentDelete");
  });

  it("shows who has access to what without opening anything", () => {
    expect(team).toContain("team.permissionCount");
    expect(team).toContain("team.status.");
    expect(team).toContain("<summary className=\"data-row\">");
  });

  it("formats a console date in the console's own locale", () => {
    /* Team printed `en-IN` month abbreviations inside an otherwise Gujarati
       screen. */
    expect(team).toContain('locale === "gu" ? "gu-IN" : "en-IN"');
    expect(team).toContain("formatDate(admin.invitedAt, session.staff.adminLocale)");
  });

  it("does not spend a 500-row read on a form the caller cannot see", () => {
    /* The Content Desk student picker feeds create and edit, and both need
       `content.manage`. A view-only admin paid for it on every load. */
    expect(content).toContain("const students = canManage");
    expect(content).toContain(": [];");
  });

  it("keeps the Design Desk reads scoped to the jobs on screen", () => {
    expect(design).toContain("inArray");
    expect(stripComments(design)).not.toMatch(/\.from\(schema\.serviceFiles\)\s*;/);
  });

  it("does not restate four facts across a full phone screen", () => {
    expect(account).toContain("kv-grid");
    expect(stripComments(account)).not.toContain("sm:grid-cols-2");
  });

  it("leaves the certificate R2 note in place", () => {
    /* It is what stops the next session assuming a private file pipeline
       exists. R2 is deferred on purpose. */
    expect(certificates.toLowerCase()).toContain("r2");
  });
});
