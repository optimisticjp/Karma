import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { printCopy } from "@/lib/admin/print-copy";

const read = (p: string) => readFileSync(p, "utf8");
const PRINT_DIR = "src/app/admin/(print)/print";
const css = read("src/app/admin/(print)/print.css");

/** Every sheet's page file. */
function sheetFiles(dir = PRINT_DIR, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) sheetFiles(path, out);
    else if (entry === "page.tsx") out.push(path);
  }
  return out;
}

const sheets = sheetFiles();

describe("the sheets that exist", () => {
  it("covers every surface the studio prints", () => {
    // Nine sheets: the filled admission form and a blank one to hand a
    // walk-in, a receipt, a statement, a student record, a roster, a register,
    // a design brief and the certificate.
    expect(sheets).toHaveLength(9);
    for (const slug of [
      "admission/[studentId]",
      "admission/blank",
      "receipt/[feeId]",
      "statement/[enrollmentId]",
      "student/[studentId]",
      "roster/[batchId]",
      "register/[batchId]",
      "brief/[enquiryId]",
      "certificate/[certNo]"
    ]) {
      expect(existsSync(join(PRINT_DIR, slug, "page.tsx")), slug).toBe(true);
    }
  });

  it("moved the certificate out of the console shell, and kept its old URL working", () => {
    // Printing an operational screen produces a page with a navigation rail
    // down one side and a table cut in half at the page break.
    expect(existsSync("src/app/admin/(console)/certificates/print")).toBe(false);
    expect(read("next.config.ts")).toContain('source: "/admin/certificates/print/:certNo"');
    expect(read("next.config.ts")).toContain('destination: "/admin/print/certificate/:certNo"');
  });
});

describe("every sheet guards its own data", () => {
  it("re-checks a specific permission, not merely console access", () => {
    /**
     * The (print) layout runs requireAdmin, but reaching a print route is not
     * permission to read what it prints: a fee receipt must not be readable by
     * someone who can see students and not fees.
     */
    for (const file of sheets) {
      const source = read(file);
      expect(source, file).toContain("requireAdmin(");
      if (file.includes("blank")) continue; // an empty form discloses nothing
      expect(source, file).toContain("hasPermission(session.staff,");
      expect(source, file).toContain('redirect("/admin/no-access?reason=permission")');
    }
  });

  it("gates the money on a fees permission even inside a student's record", () => {
    const summary = read(join(PRINT_DIR, "student/[studentId]/page.tsx"));
    expect(summary).toContain("const canSeeFees =");
    expect(summary).toContain("canSeeFees ?");
  });

  it("renders per request and is never cached or prerendered", () => {
    for (const file of sheets) {
      expect(read(file), file).toContain('export const dynamic = "force-dynamic"');
    }
  });
});

describe("the print CSS is built for paper", () => {
  it("declares A4 with a margin that clears a home printer's unprintable edge", () => {
    expect(css).toContain("@page {");
    expect(css).toContain("size: A4 portrait");
    expect(css).toContain("margin: 14mm 13mm");
    // Rosters and registers are columns, so they say so themselves — and the
    // named page is actually APPLIED. Declaring `@page landscape` without a
    // `page:` property pointing at it does nothing, and the register prints
    // portrait with its right-hand columns cut off.
    expect(css).toContain("size: A4 landscape");
    expect(css).toContain("page: landscape;");
  });

  it("repeats table headings across pages and never splits a row", () => {
    // A register whose column numbers are on page one only is unusable on
    // page two.
    expect(css).toContain(".sheet-table thead { display: table-header-group; }");
    expect(css).toContain(".sheet-table tr { break-inside: avoid; page-break-inside: avoid; }");
  });

  it("keeps a declaration and its signature block together", () => {
    expect(css).toContain(".sheet-declaration");
    expect(css).toMatch(/\.sheet-signatures \{[^}]*break-inside: avoid;/s);
  });

  it("removes the toolbar and every non-sheet control when printing", () => {
    const print = css.slice(css.indexOf("@media print {"));
    expect(print).toContain(".sheet-toolbar,\n  .no-print { display: none !important; }");
  });

  it("keeps a meaningful background when the printer strips colour", () => {
    const print = css.slice(css.indexOf("@media print {"));
    expect(print).toContain("print-color-adjust: exact");
  });

  it("reads in black and white — no colour carries meaning on its own", () => {
    // A studio printer is monochrome. Anything whose meaning depended on a
    // hue would print as an indistinguishable grey.
    for (const banned of ["--color-vermilion", "--color-success", "--color-error", "--color-warn"]) {
      expect(css, banned).not.toContain(banned);
    }
  });

  it("never letterspaces or uppercases Gujarati", () => {
    // The sheet's headings and labels are uppercase and tracked, which is
    // exactly the style that breaks Gujarati (CLAUDE.md #1).
    for (const rule of [
      ":lang(gu) .sheet-brand",
      ":lang(gu) .sheet-doc-title",
      ":lang(gu) .sheet-label",
      ":lang(gu) .sheet-section-title",
      ":lang(gu) .sheet-table thead th"
    ]) {
      expect(css, rule).toContain(rule);
    }
  });
});

describe("what the sheets say", () => {
  it("heads every sheet with the institute's own training-centre line", () => {
    const frame = read("src/components/admin/PrintSheet.tsx");
    expect(frame).toContain("Karma Design Studio");
    expect(frame).toContain("TRAINING_CENTRE_LINE_EN");
    expect(frame).toContain("TRAINING_CENTRE_LINE_GU");
  });

  it("carries all fifteen admission norms and the declaration onto the form", () => {
    const parts = read("src/components/admin/SheetParts.tsx");
    expect(parts).toContain("terms.clauses.map");
    expect(parts).toContain("declarationGu");
    expect(parts).toContain("declarationEn");
    const form = read(join(PRINT_DIR, "admission/[studentId]/page.tsx"));
    expect(form).toContain("<SheetNorms");
    expect(form).toContain("<SheetSignatures");
  });

  it("gives the admission form the four signature lines and the office stamp", () => {
    const parts = read("src/components/admin/SheetParts.tsx");
    for (const key of ["studentSignature", "parentSignature", "trainerSignature", "officeStamp"]) {
      expect(parts, key).toContain(key);
    }
  });

  it("prints the fee agreement THIS student signed, not today's course fee", () => {
    const form = read(join(PRINT_DIR, "admission/[studentId]/page.tsx"));
    expect(form).toContain("agreedFeeTotal: enrolment.agreedFeeTotal");
    expect(form).toContain("summariseFees(");
    // The course row is read for the software and the curriculum, never for
    // the money.
    expect(form).not.toContain("schema.courses.feeTotal");
  });

  it("derives the certificate verification URL instead of hard-coding a host", () => {
    /**
     * The old page hard-coded the workers.dev origin, which would keep
     * pointing there after the domain cutover — exactly what the launch
     * checklist says never to do. A printed certificate outlives the deploy.
     */
    const cert = read(join(PRINT_DIR, "certificate/[certNo]/page.tsx"));
    expect(cert).toContain("${site.url}/en/verify/");
    // Match an actual hard-coded origin, not the comment explaining the fix.
    expect(cert).not.toContain("https://karma-design-studio");
    expect(cert).not.toContain("https://karmadesignstudio");
  });

  it("gives staff a print button that actually works", () => {
    // The old certificate page rendered one as a server component with
    // onClick={undefined} — inert by construction — and told staff to find the
    // browser's print menu instead.
    const trigger = read("src/components/admin/PrintTrigger.tsx");
    expect(trigger).toContain('"use client"');
    expect(trigger).toContain("window.print()");
  });

  it("takes no money and mentions no payment provider", () => {
    const everything = sheets.map(read).join("\n").toLowerCase();
    for (const banned of ["razorpay", "stripe", "payu", "cashfree", "paytm", "upi://", "pay now"]) {
      expect(everything, banned).not.toContain(banned);
    }
    // And says plainly where fees are actually received.
    expect(printCopy("en").offlineNote.toLowerCase()).toContain("no payment is taken on the website");
  });
});

describe("bilingual parity", () => {
  it("mirrors every print label in Gujarati", () => {
    // The console's per-module copy is not covered by the mechanical i18n
    // parity test, so it is checked here instead of assumed.
    const en = printCopy("en") as Record<string, string>;
    const gu = printCopy("gu") as Record<string, string>;
    expect(Object.keys(gu).sort()).toEqual(Object.keys(en).sort());
    for (const key of Object.keys(en)) {
      expect(gu[key], `${key} is empty in Gujarati`).toBeTruthy();
    }
  });
});
