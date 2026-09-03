import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { clampAt, declaration, ruleBody, stripComments } from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const form = read("src/components/forms/AdmissionForm.tsx");
const globals = read("src/app/globals.css");
const premium = read("src/app/premium.css");

/*
 * The admission form is the one public surface where compaction can do real
 * damage: it is where consent is given, where a third party's phone number is
 * collected, and where a duplicate submission costs the studio a phantom lead.
 *
 * So this suite is in two halves. The first says the form got denser. The
 * second says NOTHING that protects a submission was traded for the density —
 * and it names each defence, so a later density pass has one checklist rather
 * than a diff to reason about.
 */

describe("the admission form got denser", () => {
  it("keeps the eleven course chips two-up at every width", () => {
    /* One column made step 1 a 659px scroll of chips before a visitor could
       even see the eleven options they were choosing between. */
    expect(stripComments(form)).toContain('className="grid grid-cols-2 gap-1.5"');
    expect(stripComments(form)).not.toContain('className="grid gap-3 sm:grid-cols-2"');
  });

  it("puts the action row within a thumb's reach on a phone", () => {
    /* On step 3 the Next control sat roughly 1,630px from the top of the
       document — about two screens — so a visitor who had filled everything in
       still had to scroll to say so. */
    expect(stripComments(form)).toContain('className="form-nav');
    const nav = ruleBody(premium, ".form-nav");
    expect(nav, ".form-nav must exist").not.toBeNull();
    expect(declaration(nav as string, "position")).toBe("sticky");
    /* Sticky, not fixed: it stays in flow, so it can never cover the field
       above it — and it clears the Call/Directions bar through the same token
       that bar reserves with, rather than a second hand-matched number. */
    expect(declaration(nav as string, "bottom")).toContain("var(--tabbar-h)");
    expect(declaration(nav as string, "bottom")).toContain("env(safe-area-inset-bottom)");
  });

  it("does not buy any of that from the control size", () => {
    for (const selector of [".input", ".choice-chip"]) {
      const rule = ruleBody(globals, selector);
      expect(rule, `${selector} must exist`).not.toBeNull();
      expect(
        clampAt(declaration(rule as string, "min-height") as string),
        `${selector} min-height`
      ).toBeGreaterThanOrEqual(44);
    }
    /* 16px on the input is deliberate and is NOT a density failure: below it
       iOS Safari zooms the page on focus, which is a worse experience than a
       slightly wider field. */
    expect(declaration(ruleBody(globals, ".input") as string, "font-size")).toBe("1rem");
  });
});

describe("nothing that protects a submission was traded for density", () => {
  const source = stripComments(form);

  it("keeps every public-form defence", () => {
    /* Each of these is load-bearing, and each is one careless "simplification"
       away from disappearing during a layout pass. */
    expect(source, "client idempotency key").toContain("idempotencyKey");
    expect(source, "saved draft for recoverable retries").toContain("DRAFT_KEY");
    const route = stripComments(read("src/app/api/admission/route.ts"));
    expect(route, "server Turnstile verification").toContain("verifyTurnstile");
    expect(route, "server rate limiting").toContain("rateLimit");
    expect(route, "server idempotency").toContain("idempotencyKey");
    /* A success sentinel that bypasses persistence is explicitly forbidden. */
    expect(route).not.toContain("KDS-RECEIVED");
    expect(source, "versioned admission norms").toContain("termsVersion");
    expect(source, "guardian mobile, required of every applicant").toContain("guardianPhone");
    /* The guardian number may not simply be the applicant's own again. */
    expect(source).toContain("errors.guardianSame");
    expect(source, "Turnstile widget").toContain("TurnstileWidget");
  });

  it("keeps the three consents as separate, explicit acts", () => {
    /* Privacy, communications and the versioned admission norms are three
       different agreements and each has its own control. They are stored as
       timestamps rather than booleans, which is why merging them into one
       "I agree" tickbox to save a row would be a data change, not a layout
       one. */
    expect(source).toContain('t("consents.privacy")');
    expect(source).toContain('t("consents.comms")');
    expect(source).toContain('errors.terms');
    /* And a submission may not proceed with any of the three missing. */
    expect(source).toContain("if (!data.privacy || !data.comms)");
    expect(source).toContain("if (!data.terms)");
  });

  it("keeps the error summary reachable and announced", () => {
    /* Compaction is exactly when an error summary becomes tempting to shrink
       into a colour. */
    expect(source).toContain('role="alert"');
    expect(source).toContain("errors.summaryTitle");
    expect(source).toContain("focusField");
    expect(source).toContain('aria-live="polite"');
  });

  it("keeps the consent step still", () => {
    /* Motion level 0 on the step that carries the consents and the norms:
       nothing a visitor has to read carefully and get right should be moving
       while they read it. */
    expect(source).toContain('step < 3 && "step-in"');
  });

  it("collapses the norms without hiding what is being agreed to", () => {
    /* Fifteen clauses in two languages is several kilobytes for a checkbox to
       reference, and the Worker has a size budget — so they are a server-
       rendered native <details>, not props into the client form. Collapsing
       them is legitimate progressive disclosure. Collapsing the CHECKBOX, or
       the version it records, would not be. */
    const norms = stripComments(read("src/components/site/AdmissionNorms.tsx"));
    expect(norms).toContain("<details");
    expect(norms).toContain("terms.clauses.map");
    expect(norms).toContain("declarationLabel");
    expect(source).toContain("termsVersion");
  });

  it("keeps the free-demo times a preference, never an inventory", () => {
    /* Karma keeps no per-date demo capacity. A compact chip row is the right
       shape for a preference and the wrong shape for a booking, and the
       difference is whether anything here could reserve a seat. */
    expect(source).toContain("demoSlot");
    expect(source).not.toContain('type="date"');
    expect(source).not.toContain("seatsLeft");
  });
});
