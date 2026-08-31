import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { declaration, ruleBody, stripComments } from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const premium = read("src/app/premium.css");
const storyCase = read("src/components/site/StoryCase.tsx");
const services = read("src/app/[locale]/services/page.tsx");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

/* ------------------------------------------------------------------ *
 * Phase 10 — the final pass
 *
 * The plan's twelve questions, asked of measured section heights at
 * 390px rather than of an impression. The three that had answers:
 * "can secondary information collapse", "can the copy be shorter", and
 * "is anything stated twice".
 * ------------------------------------------------------------------ */

describe("a long story is scannable before it is readable", () => {
  it("puts the case-study body behind one disclosure", () => {
    /* Six full cases measured 5,004px on /success-stories at 390px — six
       viewports to read six stories nobody can compare, because only one fits
       on screen at a time. */
    expect(storyCase).toContain('<details className="story-more">');
    expect(storyCase).toContain('<summary className="story-more-toggle">{t("readMore")}</summary>');
    const body = ruleBody(premium, ".story-more-toggle");
    expect(body).toBeTruthy();
    /* It is a control, so it takes the standalone-control floor. */
    expect(declaration(body!, "min-height")).toBe("2.75rem");
    expect(declaration(body!, "cursor")).toBe("pointer");
  });

  it("hides nothing from a reader who cannot open it", () => {
    /* `<details>` keeps the content in the DOM: findable by Ctrl-F, readable
       by a screen reader, and present with JavaScript off. Nothing is
       truncated and no text is dropped — this is the whole reason the arc did
       not become a line clamp. */
    expect(storyCase).not.toContain("line-clamp");
    expect(storyCase).not.toContain("slice(0,");
    expect(storyCase).toContain("story-arc-steps");
    expect(storyCase).toContain("story-steps");
  });

  it("names the disclosure in both languages", () => {
    for (const [name, cat] of [["en", en], ["gu", gu]] as const) {
      expect(cat.proof.stories.readMore, name).toBeTruthy();
    }
    /* And in Gujarati it is Gujarati, not the English string copied across. */
    expect(gu.proof.stories.readMore).not.toBe(en.proof.stories.readMore);
  });

  it("does not restate the arrow it already drew", () => {
    /* The teaser's head carries `before → after` on one line, and the numbered
       arc below it repeated BEFORE and NOW: 354px of restatement on a homepage
       that runs nineteen sections. */
    expect(storyCase).toContain("compact ? [] : [");
  });
});

describe("the page does not promise what the product cannot do", () => {
  it("stops offering an uploader that is not there", () => {
    /* `form.filesHelp` — "Up to 3 files, 8 MB each: PNG, JPG, WebP, PDF, AI or
       ZIP" — rendered in the services aside as guidance for an in-form upload
       that does not exist, beside a form that says in its own words that files
       go over WhatsApp until private storage is switched on. R2 is deferred on
       purpose; the page has to say so consistently. */
    expect(stripComments(services)).not.toContain('t("form.filesHelp")');
  });

  it("keeps the copy for the day R2 is activated", () => {
    /* Deleting the key would lose the limits the API still enforces. */
    for (const [name, cat] of [["en", en], ["gu", gu]] as const) {
      expect(cat.servicesPage.form.filesHelp, name).toBeTruthy();
    }
  });

  it("still tells the sender how to send a file today", () => {
    const brief = read("src/components/forms/BriefForm.tsx");
    expect(brief).toContain('t("form.filesDeferred")');
    expect(brief).toContain('t("confidential")');
  });

  it("does not state the confidentiality line twice on one screen", () => {
    /* The form's file note already carries it, forty lines up the same page. */
    expect((stripComments(services).match(/t\("confidential"\)/g) ?? []).length)
      .toBeLessThanOrEqual(1);
  });
});

/* ------------------------------------------------------------------ *
 * The two console screens a browser can actually reach
 *
 * Everything behind `requireAdmin` needs a database and a session, so
 * the console was measured by computation in Phases 6-8. `/admin/login`
 * and `/admin/no-access` are public, and measuring them found two
 * controls below their floor on the screen every staff member signs
 * into.
 * ------------------------------------------------------------------ */

describe("the screens before sign-in", () => {
  it("gives the console language switch a real hit area", () => {
    /* 21.7px tall and 44.6px wide — the only control on `/admin/login`
       besides the form itself. */
    const toggle = read("src/components/admin/LocaleToggle.tsx");
    expect(toggle).toContain('className="tap stitch-link');
    /* And it is still a no-JavaScript form posting to a server action, which
       is the reason it exists in this shape at all. */
    expect(toggle).toContain("<form action={setAdminLocaleCookie}>");
    expect(toggle).toContain('type="submit"');
  });

  it("gives the way back to the public site one too", () => {
    /* Its `<p>` holds nothing else, so it is a standalone control rather than
       a link inside a sentence: WCAG 2.5.8's inline exception does not cover
       it. Measured at 19px. */
    const shell = read("src/app/admin/(auth)/AuthShell.tsx");
    expect(shell).toContain('className="tap stitch-link"');
  });

  it("still says nothing about why sign-in failed", () => {
    /* Density work must not turn a deliberately vague auth screen into a
       user-enumeration oracle. */
    const login = read("src/app/admin/(auth)/login/LoginForm.tsx");
    const clean = stripComments(login).toLowerCase();
    for (const leak of ["no such user", "user not found", "wrong password", "unknown email"]) {
      expect(clean, leak).not.toContain(leak);
    }
  });
});
