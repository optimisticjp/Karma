import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const PAGES = {
  admissions: "src/app/admin/(console)/admissions/page.tsx",
  students: "src/app/admin/(console)/students/page.tsx",
  courses: "src/app/admin/(console)/courses/page.tsx",
  fees: "src/app/admin/(console)/fees/page.tsx"
} as const;

const today = read("src/app/admin/(console)/page.tsx");
const css = read("src/app/machine-lab.css");

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * One page header, not four copies of one
 * ------------------------------------------------------------------ */

describe("the console page header", () => {
  it("is the shared primitive on every operations page", () => {
    for (const [name, path] of Object.entries(PAGES)) {
      const source = read(path);
      expect(source, name).toContain("PageHead");
      /* And the local copy each page used to carry is gone. */
      expect(source, name).not.toMatch(/function (PageHeading|Heading)\(\{ title, lede \}/);
    }
  });

  it("is compact — smaller than the public site's page title", () => {
    const block = css.slice(css.indexOf(".console-head-title {"), css.indexOf(":lang(gu) .console-head-title"));
    /* text-h2 starts at 1.875rem; a console header that eats 180px of a
       640px phone screen has spent a third of the viewport saying where you
       already know you are. */
    expect(block).toContain("clamp(1.375rem");
  });
});

/* ------------------------------------------------------------------ *
 * Deep links from the work desk
 * ------------------------------------------------------------------ */

describe("queue rows reach the record", () => {
  it("anchors every deep-linkable row in its module list", () => {
    expect(read(PAGES.admissions)).toContain("id={`app-${application.id}`}");
    expect(read(PAGES.courses)).toContain("id={`batch-${batch.id}`}");
    expect(read(PAGES.courses)).toContain("id={`course-${course.id}`}");
    expect(read(PAGES.fees)).toContain("id={`fee-${card.enrollmentId}`}");
  });

  it("links the queues to those anchors", () => {
    expect(today).toContain("/admin/admissions#app-${row.id}");
    expect(today).toContain("/admin/courses#batch-${row.id}");
  });

  it("keeps a record id out of the path, where it would 404", () => {
    /* There are no per-record console routes. An id may only be a fragment. */
    expect(today).not.toMatch(/href=\{`\/admin\/[a-z]+\/\$\{/);
  });

  it("lands an anchored row below the sticky mobile header", () => {
    expect(css).toContain(".record-anchor {");
    const block = css.slice(css.indexOf(".record-anchor {"));
    expect(block).toContain("scroll-margin-top");
  });

  it("selects a student by query rather than by anchor, as that list already did", () => {
    /* Students is a master/detail list — the selection has to survive a
       reload and be shareable, which a fragment does not do. */
    expect(read(PAGES.students)).toContain("?student=${student.id}");
  });
});

/* ------------------------------------------------------------------ *
 * What these four screens must keep doing
 * ------------------------------------------------------------------ */

describe("admissions", () => {
  it("keeps direct admission available for walk-ins, calls and WhatsApp", () => {
    const forms = read("src/app/admin/(console)/admissions/AdmissionForms.tsx");
    expect(forms.length).toBeGreaterThan(500);
    expect(read(PAGES.admissions)).toContain("AdmissionForms");
  });

  it("keeps the record-action policy rather than inventing a second one", () => {
    expect(read(PAGES.admissions)).toContain("RecordMenu");
    expect(read(PAGES.admissions)).toContain("record-actions");
  });

  it("still shows status, course, follow-up date and who it is assigned to", () => {
    const source = read(PAGES.admissions);
    for (const field of ["reference", "courseName", "nextFollowUp", "assignedName"]) {
      expect(source, field).toContain(field);
    }
  });
});

describe("fees", () => {
  it("shows the whole money picture on one open record", () => {
    const source = read(PAGES.fees);
    for (const field of ["courseFee", "discount", "totalReceived", "balance", "dueDate"]) {
      expect(source, field).toContain(field);
    }
  });

  it("flags a short admission payment and an overdue balance", () => {
    const source = read(PAGES.fees);
    expect(source).toContain("admissionShort");
    expect(source).toContain("copy.overdue");
  });

  it("prints a receipt and a statement rather than emailing a link", () => {
    const source = read(PAGES.fees);
    expect(source).toContain("/admin/print/receipt/");
    expect(source).toContain("/admin/print/statement/");
  });

  it("adds no online payment", () => {
    const code = stripComments(read(PAGES.fees)).toLowerCase();
    for (const provider of ["razorpay", "stripe", "payu", "cashfree", "upi://", "pay now"]) {
      expect(code, provider).not.toContain(provider);
    }
  });

  it("never stores a paid flag — status is derived from the ledger", () => {
    const schema = read("src/lib/db/schema.ts");
    expect(schema).not.toMatch(/isPaid|paidFlag|payment_status/);
    expect(read("src/lib/admin/fee-status.ts").length).toBeGreaterThan(200);
  });
});

describe("courses and batches stay two different things", () => {
  it("keeps standing schedule options separate from dated batches", () => {
    /* A batch is a DATED run with seats; a schedule option is a STANDING
       timetable slot a visitor can ask for. Collapsing them would make the
       public admission form offer a seat on a date nobody opened.
       The separation is visible in where each is edited: the course form
       owns the standing timetable, the courses page lists the dated runs. */
    const form = read("src/app/admin/(console)/courses/CatalogForms.tsx");
    expect(form).toContain("scheduleStart");
    expect(form).toContain("scheduleEnd");

    const page = read(PAGES.courses);
    expect(page).toContain("batch");
    expect(page).toContain("startDate");

    /* And in the model itself. */
    expect(read("src/lib/admin/course-operations.ts")).toContain("scheduleOptions");
    expect(read("src/lib/db/schema.ts")).toContain('pgTable("batches"');
  });

  it("keeps the archive/restore/delete policy in one place", () => {
    expect(read(PAGES.courses)).toContain("RecordMenu");
    expect(read("src/lib/admin/record-actions.ts").length).toBeGreaterThan(500);
  });
});

describe("all four screens stay inside the console's visual rules", () => {
  it("imports nothing decorative from the public site", () => {
    for (const [name, path] of Object.entries(PAGES)) {
      const source = stripComments(read(path));
      for (const banned of ["TechniqueSignature", "ManifestPhoto", "MaterialWall", "machine-light"]) {
        expect(source, `${name} / ${banned}`).not.toContain(banned);
      }
    }
  });
});
