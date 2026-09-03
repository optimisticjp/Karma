import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { consoleCopy } from "@/lib/admin/console-copy";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("admin console redesign", () => {
  it("keeps EN and GU console UX copy structurally identical", () => {
    const en = consoleCopy("en");
    const gu = consoleCopy("gu");
    expect(Object.keys(gu.sections)).toEqual(Object.keys(en.sections));
    expect(Object.keys(gu.primary)).toEqual(Object.keys(en.primary));
    expect(Object.keys(gu.language)).toEqual(Object.keys(en.language));
    expect(Object.keys(gu.home)).toEqual(Object.keys(en.home));
  });

  it("groups the rail around front-desk work and omits inaccessible destinations", () => {
    const layout = read("src/app/admin/(console)/layout.tsx");
    expect(layout).toContain("console.sections.frontDesk");
    expect(layout).toContain("console.sections.studio");
    expect(layout).toContain("console.sections.other");
    expect(layout).toContain("compact([");
    expect(layout).toContain('entry(canUseFees, "/admin/fees"');
    expect(layout).toContain('entry(canUseAttendance, "/admin/attendance"');
  });

  it("shows the current module and a permission-backed primary action in the shell", () => {
    const shell = read("src/components/admin/ConsoleShell.tsx");
    const layout = read("src/app/admin/(console)/layout.tsx");
    expect(shell).toContain("const currentLabel = activeEntry?.label ?? brand");
    expect(shell).toContain("console-appbar-title");
    expect(shell).toContain("primaryAction");
    expect(layout).toContain('hasPermission(session.staff, "students.manage")');
    expect(layout).toContain("console.primary.newAdmission");
  });

  it("makes Today task-first instead of a wall of modules", () => {
    const today = read("src/app/admin/(console)/page.tsx");
    expect(today).toContain("console-home-actions");
    expect(today).toContain("console-attention-grid");
    expect(today).toContain("console-activity");
    expect(today).toContain('href: "/admin/fees?status=pending"');
    expect(today).toContain('href: "/admin/attendance"');
    expect(today).not.toContain("chip-scroller");
  });

  it("keeps the language switch available without letting it dominate every page", () => {
    const language = read("src/components/admin/AdminLanguageBar.tsx");
    expect(language).toContain("console-language-bar");
    expect(language).toContain("console-language-switch");
    expect(language).not.toContain("brand-accent-soft");
  });

  it("adds a console-only visual layer with generous touch targets", () => {
    const css = read("src/app/admin-console.css");
    expect(css).toContain(".admin-console");
    expect(css).toContain(".console-action-card");
    expect(css).toContain(".console-attention-card");
    expect(css).toContain("min-height: 2.75rem");
    expect(css).toContain("prefers-reduced-motion");
  });
});
