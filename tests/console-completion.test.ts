import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateContentInput } from "../src/lib/admin/content";

describe("Content Desk validation", () => {
  it("accepts a bilingual FAQ draft", () => {
    expect(validateContentInput({
      kind: "faq",
      slug: "evening-batch-faq",
      status: "draft",
      sortOrder: "1",
      studentId: "",
      consentConfirmed: "false",
      ownerVerified: "false",
      questionEn: "Can I join after work?",
      questionGu: "કામ પછી batch join કરી શકું?",
      answerEn: "Yes, ask the studio for the current evening batch.",
      answerGu: "હા, હાલની evening batch માટે studioને પૂછો."
    }).ok).toBe(true);
  });

  it("requires a real same-origin photo before publishing student work", () => {
    expect(validateContentInput({
      kind: "gallery",
      slug: "zardosi-project",
      status: "published",
      sortOrder: "0",
      studentId: "4",
      technique: "zardosi",
      titleEn: "Zardosi final project",
      titleGu: "ઝરદોશી final project",
      noteEn: "Evening batch",
      noteGu: "Evening batch",
      mediaUrl: ""
    })).toEqual({ ok: false, reason: "media" });

    expect(validateContentInput({
      kind: "gallery",
      slug: "zardosi-project",
      status: "published",
      sortOrder: "0",
      studentId: "4",
      technique: "zardosi",
      titleEn: "Zardosi final project",
      titleGu: "ઝરદોશી final project",
      noteEn: "Evening batch",
      noteGu: "Evening batch",
      mediaUrl: "https://random.example/image.jpg"
    }).ok).toBe(false);

    expect(validateContentInput({
      kind: "gallery",
      slug: "zardosi-project",
      status: "published",
      sortOrder: "0",
      studentId: "4",
      technique: "zardosi",
      titleEn: "Zardosi final project",
      titleGu: "ઝરદોશી final project",
      noteEn: "Evening batch",
      noteGu: "Evening batch",
      mediaUrl: "/photos/work/zardosi-project.webp"
    }).ok).toBe(true);
  });

  it("requires a numeric value for homepage proof", () => {
    expect(validateContentInput({
      kind: "homepage_stat",
      slug: "students-trained",
      status: "draft",
      sortOrder: "0",
      studentId: "",
      labelEn: "Students trained",
      labelGu: "Training લીધેલા students",
      value: "many"
    }).ok).toBe(false);
    expect(validateContentInput({
      kind: "homepage_stat",
      slug: "students-trained",
      status: "draft",
      sortOrder: "0",
      studentId: "",
      labelEn: "Students trained",
      labelGu: "Training લીધેલા students",
      value: "250+"
    }).ok).toBe(true);
  });
});

describe("console completion source contracts", () => {
  const root = resolve(import.meta.dirname, "..");
  const read = (path: string) => readFileSync(resolve(root, path), "utf8");

  it("locks Content Desk behind permissions, consent gates and transactional audit", () => {
    const page = read("src/app/admin/(console)/content/page.tsx");
    const actions = read("src/app/admin/(console)/content/actions.ts");
    expect(page).toContain('hasPermission(session.staff, "content.view")');
    expect(page).toContain('hasPermission(session.staff, "content.manage")');
    expect(actions).toContain('authorizeAction({ permission: "content.manage" })');
    expect(actions).toContain('data.kind === "gallery"');
    expect(actions).toContain('student.photoConsent');
    expect(actions).toContain('data.kind === "testimonial" && !data.consentConfirmed');
    expect(actions).toContain('role !== "owner" || !data.ownerVerified');
    expect(actions).toContain("db.transaction");
    expect(actions).toContain("CONTENT_AUDIT_ACTIONS.itemPublished");
  });

  it("keeps the new content table out of the Supabase browser Data API", () => {
    const migration = read("drizzle/0003_content_desk.sql");
    expect(migration).toContain('ALTER TABLE "content_items" ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain("REVOKE ALL ON public.content_items");
    expect(migration).toContain("REVOKE ALL ON SEQUENCE public.content_items_id_seq");
  });

  it("makes published public proof owner-verified and removes samples once real work exists", () => {
    const source = read("src/lib/content/public.ts");
    expect(source).toContain('.filter((row) => row.ownerVerified)');
    expect(source).toContain("return managed.length > 0 ? managed : sourceStories");
    expect(source).toContain("return managed.length > 0 ? managed : sourceGallery");
  });

  it("shows only permission-backed console destinations", () => {
    const layout = read("src/app/admin/(console)/layout.tsx");
    for (const route of [
      "/admin/students",
      "/admin/fees",
      "/admin/attendance",
      "/admin/design",
      "/admin/certificates",
      "/admin/content",
      "/admin/reports"
    ]) expect(layout).toContain(route);
    expect(layout).toContain('hasPermission(session.staff, "content.view")');
    expect(layout).toContain('hasPermission(session.staff, "reports.view")');
  });

  it("does not expose audit activity on Today without audit.view", () => {
    const today = read("src/app/admin/(console)/page.tsx");
    expect(today).toContain('const canAudit = hasPermission(session.staff, "audit.view")');
    expect(today).toContain("canAudit ? getRecentActivity() : Promise.resolve([])");
    expect(today).toContain('hasPermission(session.staff, "applications.manage")');
    expect(today).toContain('hasPermission(session.staff, "attendance.manage")');
    expect(today).toContain('hasPermission(session.staff, "content.manage")');
  });

  it("removes the obsolete MFA product surface", () => {
    expect(existsSync(resolve(root, "src/app/admin/(auth)/mfa/MfaForms.tsx"))).toBe(false);
    expect(existsSync(resolve(root, "src/app/admin/(auth)/mfa/setup/page.tsx"))).toBe(false);
    expect(existsSync(resolve(root, "src/app/admin/(auth)/mfa/challenge/page.tsx"))).toBe(false);

    const en = JSON.parse(read("messages/en.json"));
    const gu = JSON.parse(read("messages/gu.json"));
    expect(en.admin.mfa).toBeUndefined();
    expect(gu.admin.mfa).toBeUndefined();
    expect(en.admin.welcome.lede.toLowerCase()).not.toContain("authenticator");
    expect(gu.admin.welcome.lede.toLowerCase()).not.toContain("authenticator");

    const redirect = read("src/lib/auth/redirect.ts");
    expect(redirect).not.toContain('return `/admin/mfa/');
  });

  it("guards report exports separately from report viewing", () => {
    const page = read("src/app/admin/(console)/reports/page.tsx");
    const route = read("src/app/admin/(console)/reports/export/[kind]/route.ts");
    expect(page).toContain('hasPermission(session.staff, "exports.run")');
    expect(route).toContain('permission: "exports.run"');
  });
});
