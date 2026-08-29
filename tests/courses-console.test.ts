import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATALOG_AUDIT_ACTIONS } from "@/lib/admin/audit";

describe("courses and batches console", () => {
  const page = readFileSync("src/app/admin/(console)/courses/page.tsx", "utf8");
  const actions = readFileSync("src/app/admin/(console)/courses/actions.ts", "utf8");
  const layout = readFileSync("src/app/admin/(console)/layout.tsx", "utf8");

  it("is session-protected and refuses accounts with no catalogue view capability", () => {
    expect(page).toContain('requireAdmin("/admin/courses")');
    expect(page).toContain('hasPermission(session.staff, "courses.view")');
    expect(page).toContain('hasPermission(session.staff, "batches.view")');
    expect(page).toContain('redirect("/admin/no-access?reason=permission")');
  });

  it("guards every course mutation with courses.manage", () => {
    const create = actions.slice(actions.indexOf("export async function createCourseAction"));
    const update = actions.slice(actions.indexOf("export async function updateCourseAction"));
    expect(create).toContain('authorizeAction({ permission: "courses.manage" })');
    expect(update).toContain('authorizeAction({ permission: "courses.manage" })');
  });

  it("guards every batch mutation with batches.manage", () => {
    const create = actions.slice(actions.indexOf("export async function createBatchAction"));
    const update = actions.slice(actions.indexOf("export async function updateBatchAction"));
    expect(create).toContain('authorizeAction({ permission: "batches.manage" })');
    expect(update).toContain('authorizeAction({ permission: "batches.manage" })');
  });

  it("never permanently deletes a course or batch", () => {
    expect(actions).not.toContain("delete(schema.courses)");
    expect(actions).not.toContain("delete(schema.batches)");
  });

  it("writes distinct audit events for all four catalogue mutations", () => {
    expect(CATALOG_AUDIT_ACTIONS).toEqual({
      courseCreated: "catalog.course.created",
      courseUpdated: "catalog.course.updated",
      batchCreated: "catalog.batch.created",
      batchUpdated: "catalog.batch.updated"
    });
    for (const key of ["courseCreated", "courseUpdated", "batchCreated", "batchUpdated"]) {
      expect(actions).toContain(`CATALOG_AUDIT_ACTIONS.${key}`);
    }
  });

  it("only enables the navigation link when the signed-in staff can use the module", () => {
    expect(layout).toContain("const canUseCatalog");
    expect(layout).toContain('href: canUseCatalog ? "/admin/courses" : null');
    expect(layout).toContain("available: canUseCatalog");
  });
});

describe("password-only account screen", () => {
  const account = readFileSync("src/app/admin/(console)/account/security/page.tsx", "utf8");

  it("does not call Supabase MFA APIs or render authenticator state", () => {
    expect(account).not.toContain("getAssuranceLevel");
    expect(account).not.toContain("auth.mfa");
    expect(account).not.toContain('t("account.mfa")');
  });
});
