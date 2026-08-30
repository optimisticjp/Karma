import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EMCAD_DAHAO } from "../src/content/course-operations";
import { ICON_GROUPS } from "../src/components/ui/Icon";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const form = read("src/components/forms/AdmissionForm.tsx");
const progress = read("src/components/ui/StitchProgress.tsx");
const demoFacts = read("src/components/admission/DemoFacts.tsx");
const contact = read("src/app/[locale]/contact/page.tsx");
const css = read("src/app/machine-lab.css");

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * The security and data model this phase was not allowed to weaken
 * ------------------------------------------------------------------ */

describe("the admission form keeps every defence it had", () => {
  it("still runs the layered public-form defence", () => {
    for (const guard of ["honeypot", "TurnstileWidget", "idemKey", "startedAt"]) {
      expect(form, guard).toContain(guard);
    }
    /* The minimum-fill window is enforced on the server, where a bot cannot
       skip it. The client only reports when the form was opened. */
    const route = read("src/app/api/admission/route.ts");
    expect(route).toContain("Date.now() - d.startedAt");
    expect(read("src/lib/validation.ts")).toContain("startedAt");
  });

  it("still collects the required parent/guardian mobile", () => {
    expect(form).toContain("guardianPhone");
    for (const cat of [en, gu]) {
      expect(cat.admissionForm.fields.guardianPhone).toBeTruthy();
    }
  });

  it("still records the admission-norms version that was accepted", () => {
    expect(form).toContain("termsVersion");
    expect(read("src/app/[locale]/admission/page.tsx")).toContain("CURRENT_TERMS_VERSION");
  });

  it("still keeps both consents separate from the norms acceptance", () => {
    expect(form).toContain('set("privacy"');
    expect(form).toContain('set("comms"');
    expect(form).toContain('set("terms"');
  });

  it("sends no typed value to analytics", () => {
    /* A tracked event may carry the surface and the course slug. It may never
       carry a name, a phone number or an area. */
    const tracked = form.match(/track\([^)]*\)/gs) ?? [];
    expect(tracked.length).toBeGreaterThan(0);
    for (const call of tracked) {
      for (const pii of ["fullName", "whatsapp", "guardianPhone", "area", "reference"]) {
        expect(call, pii).not.toContain(pii);
      }
    }
  });

  it("offers no online payment on any admission surface", () => {
    for (const [name, source] of [
      ["form", form],
      ["admission page", read("src/app/[locale]/admission/page.tsx")],
      ["admissions page", read("src/app/[locale]/admissions/page.tsx")],
      ["demo facts", demoFacts]
    ] as const) {
      const code = stripComments(source).toLowerCase();
      for (const provider of ["razorpay", "stripe", "payu", "cashfree", "upi://", "pay now"]) {
        expect(code, `${name}/${provider}`).not.toContain(provider);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * The progress seam
 * ------------------------------------------------------------------ */

describe("the progress seam", () => {
  it("keeps the progressbar semantics the plain bar had", () => {
    expect(progress).toContain('role="progressbar"');
    expect(progress).toContain("aria-valuemin");
    expect(progress).toContain("aria-valuemax");
    expect(progress).toContain("aria-valuenow");
    expect(progress).toContain("aria-label");
    /* The visual step list repeats what the label says, so it is hidden from
       assistive tech rather than read out twice. */
    expect(progress).toContain('aria-hidden="true"');
  });

  it("leaves the form's own live region and focus move intact", () => {
    expect(form).toContain('aria-live="polite"');
    expect(form).toContain("stepHeading.current?.focus()");
  });

  it("draws done, current and future as three different things", () => {
    const block = css.slice(css.indexOf(".stitch-progress {"));
    /* done: the running stitch at exact pixel scale */
    expect(block).toContain("var(--color-vermilion) 0 9px, transparent 9px 15px");
    /* current: the needle penetration point */
    expect(block).toContain(".sp-step.is-current .sp-seg::after");
    /* future: a faint construction line, not a stitch */
    expect(block).toContain("background-size: 100% 1px");
  });

  it("renders four steps with the current one marked", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { StitchProgress } = await import("../src/components/ui/StitchProgress");
    const html = renderToStaticMarkup(
      <StitchProgress steps={["Course", "You", "Details", "Review"]} current={1} label="Step 2 of 4" />
    );
    /* `sp-steps` is the list; `sp-step` is a step. Match the boundary. */
    expect((html.match(/class="sp-step[ "]/g) ?? [])).toHaveLength(4);
    expect((html.match(/is-current/g) ?? [])).toHaveLength(1);
    expect((html.match(/is-done/g) ?? [])).toHaveLength(1);
    expect(html).toContain('aria-valuenow="2"');
  });
});

describe("motion level 0 where it matters", () => {
  it("does not animate the step that carries the consents and the norms", () => {
    /* Nothing a visitor has to read carefully and get right should be moving
       while they read it. */
    expect(form).toContain('step < 3 && "step-in"');
  });
});

/* ------------------------------------------------------------------ *
 * The demo, stated as it runs
 * ------------------------------------------------------------------ */

describe("the demo decision surface", () => {
  it("renders its figures from the verified record, never from a message", () => {
    expect(demoFacts).toContain("EMCAD_DAHAO.operations.demo");
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.admissionsPage.demo);
      expect(block).not.toMatch(/\b2 days\b/);
      expect(block).not.toMatch(/\b10:00\b/);
    }
    expect(EMCAD_DAHAO.operations.demo?.days).toBe(2);
    expect(EMCAD_DAHAO.operations.demo?.hours).toBe(2);
    expect(EMCAD_DAHAO.operations.demo?.slots).toHaveLength(4);
  });

  it("presents the times as preferences, not as reservable inventory", () => {
    /* The studio keeps no per-date demo capacity. A date picker here would
       have the site promise a seat nobody has reserved. */
    expect(demoFacts).not.toContain("input");
    expect(demoFacts).not.toContain("<button");
    expect(en.admissionsPage.demo.slotsNote.toLowerCase()).toContain("preference");
    expect(en.admissionsPage.demo.slotsNote.toLowerCase()).toContain("do not hold a seat");
  });

  it("says the fee for the ten is still shared in person", () => {
    expect(en.admissionsPage.feesBody).toContain("EMCAD DAHAO");
    expect(en.admissionsPage.feesBody.toLowerCase()).toContain("other ten");
    expect(en.admissionsPage.feesBody.toLowerCase()).toContain("receipt");
  });
});

/* ------------------------------------------------------------------ *
 * Channel hierarchy
 * ------------------------------------------------------------------ */

describe("the contact channels", () => {
  it("keeps universal actions on universal icons", () => {
    /* Nobody standing on a footpath should decode an embroidery symbol to
       find "email". The row used to carry a thread spool. */
    expect(contact).toContain('icon: "mail" as const');
    expect(contact).not.toContain('icon: "spool" as const');
    expect(ICON_GROUPS.universal as readonly string[]).toContain("mail");
  });

  it("uses a map icon for directions", () => {
    expect(contact).toContain('<Icon name="map"');
  });

  it("still names each mobile by its channel and never merges the two", () => {
    expect(contact).toContain("site.callPhone");
    expect(contact).toContain("site.whatsapp");
    expect(contact).not.toContain("wa.me/${site.callPhone}");
  });

  it("shows what to look for from the road", () => {
    expect(contact).toContain("A2_ENTRANCE_SIGNBOARD");
    expect(en.contactPage.entranceCaption.length).toBeGreaterThan(30);
  });
});
