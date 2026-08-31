import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { EMCAD_DAHAO } from "../src/content/course-operations";

/**
 * THE THREE CONVERSION ROUTES: `/batches`, `/admissions`, `/admission`.
 *
 * `tests/mtl-routes.test.ts` still holds the batch-data rules and
 * `tests/machine-lab-admission.test.tsx` still holds every form defence — the
 * honeypot, the minimum-fill window, the idempotency key, the guardian mobile,
 * the norms version, the consents and the no-PII analytics rule. **Nothing in
 * this phase was allowed to weaken any of them**, and this suite does not
 * restate them; it asserts what the rebuilt COMPOSITION has to keep.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const code = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const batchesPage = read("src/app/[locale]/batches/page.tsx");
const admissionsPage = read("src/app/[locale]/admissions/page.tsx");
const formPage = read("src/app/[locale]/admission/page.tsx");
const board = read("src/components/kds/batches/BatchBoard.tsx");
const form = read("src/components/forms/AdmissionForm.tsx");
const css = read("src/app/thread-machine-proof.css");

const ground = (file: string) => {
  const GROUNDS = ["on-canvas", "on-paper", "on-cloth", "on-mist"] as const;
  const source = code(read(file));
  const found = GROUNDS.filter((g) => source.includes(`${g}"`) || source.includes(`${g} `));
  expect(found.length, `${file} declares exactly one ground`).toBe(1);
  return found[0];
};

/* ------------------------------------------------------------------ *
 * /batches
 * ------------------------------------------------------------------ */

describe("the batch board", () => {
  it("composes an intro, the board, the joining seam and a close", () => {
    for (const tag of ["BatchesIntro", "BatchBoard", "JoiningSteps", "CtaBand"]) {
      expect(batchesPage, tag).toContain(tag);
    }
    for (const gone of ["PageIntro", "SectionHeading", "MonoNote", "Ledger"]) {
      expect(batchesPage, gone).not.toContain(gone);
    }
  });

  it("builds its filters from the rows, not from the catalogue", () => {
    /* A filter offering eleven courses when two have an open batch teaches a
       visitor that the page is a brochure. */
    expect(board).toContain("for (const row of rows)");
    expect(board).not.toContain("coursesByFamily");
    /* The timing chips appear only when the board holds both. */
    expect(board).toContain("hasMorning && hasEvening");
  });

  it("reads morning and evening from the data, never as a stored field", () => {
    expect(board).toContain("const isEvening = (startTime: string)");
    expect(board).toContain("EVENING_FROM");
  });

  it("keeps every open batch visible before a filter is touched", () => {
    expect(board).toContain('useState<string>("all")');
    expect(board).toContain('useState<"all" | "morning" | "evening">("all")');
  });

  it("tells an empty board apart from a broken one", () => {
    /* "Nothing is open" is the normal state between intakes; "we could not
       load the list" is a failure. Showing the first for the second tells a
       visitor there are no batches when there may be several. */
    expect(batchesPage).toContain("result.error || result.unavailable");
    expect(batchesPage).toContain("errorTitle");
    expect(batchesPage).toContain("emptyTitle");
    /* And a filter that matches nothing is a third thing again, with the
       control that caused it one tap away. */
    expect(board).toContain("filterEmpty");
    expect(board).toContain("filterClear");
  });

  it("still bounds the query and never calls the sample generator", () => {
    expect(batchesPage).toMatch(/getUpcomingBatches\(\{\s*limit:\s*\d+/);
    expect(code(batchesPage)).not.toContain("sampleBatches");
    expect(code(board)).not.toContain("sampleBatches");
  });
});

/* ------------------------------------------------------------------ *
 * /admissions
 * ------------------------------------------------------------------ */

describe("the admissions decision page", () => {
  it("composes six blocks and no second batch list", () => {
    for (const tag of ["AdmissionsIntro", "AdmissionSteps", "DemoBlock", "BeforeYouCome", "CtaBand"]) {
      expect(admissionsPage, tag).toContain(tag);
    }
    /* Twelve batch rows two thirds of the way down were a second copy of a
       page that now exists. `/batches` owns them; this page links to it. */
    expect(admissionsPage).not.toContain("BatchTable");
    expect(read("src/components/kds/admissions/BeforeYouCome.tsx")).toContain('href="/batches"');
  });

  it("never puts two blocks with the same ground next to each other", () => {
    const grounds = [
      "src/components/kds/admissions/AdmissionsIntro.tsx",
      "src/components/kds/admissions/AdmissionSteps.tsx",
      "src/components/kds/admissions/DemoBlock.tsx",
      "src/components/kds/admissions/BeforeYouCome.tsx"
    ].map((f) => ({ f, g: ground(f) }));
    for (let i = 1; i < grounds.length; i += 1) {
      expect(grounds[i - 1].g === grounds[i].g, `${grounds[i - 1].f} → ${grounds[i].f}`).toBe(false);
    }
    expect(new Set(grounds.map((g) => g.g)).size).toBe(4);
  });

  it("states the demo from the verified record and offers nothing bookable", () => {
    const demo = read("src/components/kds/admissions/DemoBlock.tsx");
    expect(demo).toContain("EMCAD_DAHAO.operations.demo");
    expect(demo).not.toContain("<input");
    expect(EMCAD_DAHAO.operations.demo?.slots).toHaveLength(4);
    for (const cat of [en, gu]) {
      /* The figures are rendered, so the catalogue holds none of them. */
      expect(JSON.stringify(cat.admissionsPage.demo)).not.toMatch(/\b2 days\b/);
    }
  });

  it("says out loud that nothing is paid on this website", () => {
    expect(en.admissionsPage.asideNoPayment.toLowerCase()).toContain("no gateway");
    expect(en.admissionsPage.asideNoPayment.toLowerCase()).toContain("no booking fee");
  });
});

/* ------------------------------------------------------------------ *
 * /admission — the form
 * ------------------------------------------------------------------ */

describe("the admission form's presentation", () => {
  it("keeps the form at a reading measure rather than a full-width field", () => {
    expect(formPage).toContain("form-column");
    expect(css).toContain(".kds .form-column { max-width:");
  });

  it("runs the design system's own primitives", () => {
    expect(form).toContain("ThreadProgress");
    expect(form).toContain("form-shell");
    expect(form).toContain("act act-primary");
    /* And nothing from the palette the public site left behind. */
    for (const gone of ["vermilion", "ivory", "text-stone", "text-carbon", "btn btn-"]) {
      expect(form, gone).not.toContain(gone);
    }
  });

  it("restyles the shared form classes INSIDE the public scope only", () => {
    /* The markup keeps `.label`, `.input` and `.choice-chip` — they carry
       security-critical structure that was not worth re-typing for a colour —
       so the public sheet restyles them under `.kds`, and the Console's
       identical class names are untouched. */
    for (const selector of [".kds .label", ".kds .input", ".kds .choice-chip", ".kds .field-error"]) {
      expect(css, selector).toContain(selector);
    }
    const globals = read("src/app/globals.css");
    expect(globals).not.toContain("--brand-accent");
  });

  it("gives every control a control-sized target", () => {
    for (const selector of [".kds .input", ".kds .choice-chip"]) {
      const start = css.indexOf(`${selector} {`);
      expect(start, selector).toBeGreaterThan(-1);
      const body = css.slice(start, css.indexOf("}", start));
      expect(body, selector).toContain("min-height: 2.75rem");
    }
  });

  it("names the current step for assistive tech on every width", () => {
    /* Four step names do not fit on a phone; the current one is in the
       heading above, so the others lose their LABEL and keep their mark. */
    expect(css).toContain('.kds .progress li:not([aria-current="step"]) > .t-micro');
    expect(form).toContain('aria-live="polite"');
  });
});

/* ------------------------------------------------------------------ *
 * What none of the three may do
 * ------------------------------------------------------------------ */

describe("the conversion routes", () => {
  const sources = [
    ...readdirSync("src/components/kds/batches").map((f) =>
      code(read(join("src/components/kds/batches", f)))
    ),
    ...readdirSync("src/components/kds/admissions").map((f) =>
      code(read(join("src/components/kds/admissions", f)))
    ),
    code(batchesPage),
    code(admissionsPage),
    code(formPage),
    code(form)
  ];

  it("offer no way to pay online", () => {
    const everything = sources.join(" ").toLowerCase();
    for (const provider of ["razorpay", "stripe", "payu", "cashfree", "paytm", "upi://", "pay now"]) {
      expect(everything, provider).not.toContain(provider);
    }
  });

  it("resolve every locale through pick(), never a ternary", () => {
    for (const source of sources) {
      expect(source).not.toMatch(/locale === "gu" \?/);
    }
  });

  it("keep the contextual dock on all three, and nowhere it does not belong", () => {
    for (const page of [batchesPage, admissionsPage, formPage]) {
      expect(page).toContain("<ActionDock");
    }
    for (const quiet of [
      "src/app/[locale]/privacy/page.tsx",
      "src/app/[locale]/terms/page.tsx",
      "src/app/[locale]/notes/page.tsx"
    ]) {
      expect(read(quiet), quiet).not.toContain("<ActionDock");
    }
  });

  it("promise no outcome, salary or placement", () => {
    const copy = (
      JSON.stringify(en.batchesPage) +
      JSON.stringify(gu.batchesPage) +
      JSON.stringify(en.admissionsPage) +
      JSON.stringify(gu.admissionsPage)
    ).toLowerCase();
    for (const banned of ["salary", "placement", "guaranteed job", "earn ₹"]) {
      expect(copy, banned).not.toContain(banned);
    }
  });
});
