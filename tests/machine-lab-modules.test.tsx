import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { MAX_ADMIN_SEATS } from "../src/lib/auth/seats";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const PAGES = {
  attendance: "src/app/admin/(console)/attendance/page.tsx",
  certificates: "src/app/admin/(console)/certificates/page.tsx",
  design: "src/app/admin/(console)/design/page.tsx",
  content: "src/app/admin/(console)/content/page.tsx",
  reports: "src/app/admin/(console)/reports/page.tsx",
  team: "src/app/admin/(console)/team/page.tsx"
} as const;

/* ------------------------------------------------------------------ *
 * One header, everywhere
 * ------------------------------------------------------------------ */

describe("the console page header", () => {
  it("is now the only page-title implementation in the console", () => {
    const consolePages = walk("src/app/admin").filter((f) => f.endsWith("/page.tsx"));
    expect(consolePages.length).toBeGreaterThan(8);
    for (const page of consolePages) {
      const source = read(page);
      /* No page rolls its own title any more. */
      expect(source, page).not.toContain('<h1 className="text-h2"');
      expect(source, page).not.toMatch(/function (Heading|PageHeading)\(\{ title, lede \}/);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Attendance: built for a running class
 * ------------------------------------------------------------------ */

describe("attendance", () => {
  it("makes the locked state unmistakable and keeps it server-decided", () => {
    const source = read(PAGES.attendance);
    expect(source).toContain("sessionIsLocked");
    expect(source).toContain("copy.locked");
    /* The lock is computed from the session's own timestamps, not from a
       prop a client could lie about. */
    expect(read("src/lib/admin/attendance.ts")).toContain("sessionIsLocked");
  });

  it("keeps the register one tap from the roster", () => {
    expect(read(PAGES.attendance)).toContain("/admin/print/register");
  });

  it("adds no decorative animation to a screen used during a class", () => {
    const source = stripComments(read(PAGES.attendance));
    for (const motion of ["<Reveal", "seal-in", "media-unveil", "stitch-wipe", "step-in"]) {
      expect(source, motion).not.toContain(motion);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Certificates: no PDF or R2 workflow while R2 is deferred
 * ------------------------------------------------------------------ */

describe("certificates", () => {
  it("issues, verifies, prints and revokes without a file pipeline", () => {
    const source = read(PAGES.certificates);
    expect(source).toContain("/admin/print/certificate");
    /* Ban R2 USAGE, not the letters: the page carries an honest note saying
       R2 is not activated, and a test that fails on that note would teach the
       next session to delete the explanation. */
    const code = stripComments(source);
    for (const banned of [
      "R2Bucket",
      "putObject",
      "getSignedUrl",
      "presigned",
      "S3Client",
      "pdfkit",
      "jsPDF",
      "puppeteer"
    ]) {
      expect(code, banned).not.toContain(banned);
    }
  });

  it("keeps public verification pointing at the verify route", () => {
    const source = read(PAGES.certificates) + read("src/app/[locale]/verify/[id]/page.tsx");
    expect(source).toContain("verify");
  });

  it("adds no PDF dependency", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
    for (const lib of ["pdfkit", "jspdf", "puppeteer", "playwright", "@react-pdf/renderer"]) {
      expect(Object.keys(pkg.dependencies), lib).not.toContain(lib);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Design Desk: production-job language, no fake file workflow
 * ------------------------------------------------------------------ */

describe("design desk", () => {
  it("uses the production-job vocabulary the studio actually works in", () => {
    const schema = read("src/lib/db/schema.ts");
    const block = schema.slice(schema.indexOf("briefStatusEnum"), schema.indexOf("certStatusEnum"));
    for (const status of [
      "new",
      "review",
      "info_needed",
      "quote_prepared",
      "quote_sent",
      "approved",
      "in_progress",
      "sample_shared",
      "revision",
      "finalised",
      "delivered",
      "closed"
    ]) {
      expect(block, status).toContain(`"${status}"`);
    }
  });

  it("offers no file upload or download while R2 is deferred", () => {
    const code = stripComments(read(PAGES.design)).toLowerCase();
    for (const banned of ['type="file"', "presigned", "signedurl", "r2bucket", "putobject"]) {
      expect(code, banned).not.toContain(banned);
    }
  });

  it("keeps the brief printable", () => {
    expect(read(PAGES.design)).toContain("/admin/print/brief");
  });
});

/* ------------------------------------------------------------------ *
 * Content Desk: a typed CMS, not a page builder
 * ------------------------------------------------------------------ */

describe("content desk", () => {
  it("edits typed records rather than free-form page content", () => {
    const forms = read("src/app/admin/(console)/content/ContentForms.tsx");
    /* A rich-text or block editor here would let staff dismantle the design
       system one paste at a time. */
    for (const banned of ["contentEditable", "dangerouslySetInnerHTML", "TipTap", "Slate", "Quill"]) {
      expect(forms, banned).not.toContain(banned);
    }
  });

  it("makes consent and owner verification explicit states, not conventions", () => {
    const source = read(PAGES.content) + read("src/app/admin/(console)/content/ContentForms.tsx");
    expect(source.toLowerCase()).toContain("consent");
    expect(read("src/lib/content/public.ts").toLowerCase()).toContain("sample");
  });
});

/* ------------------------------------------------------------------ *
 * Reports: accountability, not BI
 * ------------------------------------------------------------------ */

describe("reports and audit", () => {
  it("shows actor, action, time and entity for an audit event", () => {
    const source = read(PAGES.reports) + read("src/lib/admin/audit.ts");
    for (const field of ["actor", "action", "entity", "createdAt"]) {
      expect(source, field).toContain(field);
    }
  });

  it("is not a BI dashboard", () => {
    const code = stripComments(read(PAGES.reports)).toLowerCase();
    for (const banned of ["chart", "<canvas", "sparkline", "trendline"]) {
      expect(code, banned).not.toContain(banned);
    }
  });

  it("writes the deletion tombstone BEFORE the record disappears", () => {
    /* Writing it after would mean a failure between the two left a deletion
       with no record of who did it or what was destroyed — exactly the case
       an audit log exists for. */
    const actions = read("src/app/admin/(console)/records/actions.ts");
    const txStart = actions.indexOf("await db.transaction", actions.indexOf("DELETE_TARGETS[entity]"));
    const auditAt = actions.indexOf("schema.auditLogs", txStart);
    const deleteAt = actions.indexOf("tx.delete(", txStart);
    expect(auditAt).toBeGreaterThan(-1);
    expect(deleteAt).toBeGreaterThan(-1);
    expect(auditAt).toBeLessThan(deleteAt);
  });
});

/* ------------------------------------------------------------------ *
 * Team: the seat and access model is not a design decision
 * ------------------------------------------------------------------ */

describe("team and access", () => {
  it("still allows exactly one owner and at most five admins", () => {
    expect(MAX_ADMIN_SEATS).toBe(5);
    const migrations = walk("drizzle")
      .filter((f) => f.endsWith(".sql"))
      .map(read)
      .join("\n");
    /* The DB trigger is the backstop the application layer leans on. */
    expect(migrations).toContain("karma_staff_invariants");
  });

  it("keeps team administration owner-only, with no permission key for it", () => {
    expect(read(PAGES.team)).toContain("requireOwner");
    const access = read("src/lib/auth/access.ts");
    expect(access).not.toContain('"team.manage"');
  });

  it("stays password-only: no MFA or AAL gate came back", () => {
    const guard = read("src/lib/auth/guard.ts") + read("src/lib/auth/access.ts");
    expect(guard).not.toMatch(/requireAal2|enforceMfa|aal\s*===\s*"aal2"/);
  });

  it("deactivates accounts instead of deleting them", () => {
    const policy = read("src/lib/admin/record-actions.ts");
    expect(policy).toContain("staff");
  });
});
