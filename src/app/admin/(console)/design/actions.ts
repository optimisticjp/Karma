"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { auditValues, DESIGN_AUDIT_ACTIONS } from "@/lib/admin/audit";
import { designNote, isDesignStatus, positiveDesignId, validateDesignJob } from "@/lib/admin/design";
import { pad } from "@/lib/utils";

export type DesignState = {
  status: "idle" | "success" | "error";
  message: null | "created" | "updated" | "statusChanged" | "denied" | "invalid" | "missing" | "generic";
};
const ok = (message: DesignState["message"]): DesignState => ({ status: "success", message });
const fail = (message: DesignState["message"]): DesignState => ({ status: "error", message });

export async function createDesignJobAction(_prev: DesignState, formData: FormData): Promise<DesignState> {
  const auth = await authorizeAction({ permission: "design.manage" });
  if (!auth.ok) return fail("denied");
  const parsed = validateDesignJob(Object.fromEntries(formData.entries()));
  if (!parsed.ok) return fail("invalid");
  const db = getDb();
  if (!db) return fail("generic");
  try {
    const d = parsed.value;
    await db.transaction(async (tx) => {
      const placeholder = `KDS-BP-${crypto.randomUUID().slice(0, 10)}`;
      const rows = await tx.insert(schema.serviceEnquiries).values({ reference: placeholder, ...d, status: "new" }).returning({ id: schema.serviceEnquiries.id });
      const id = rows[0]?.id;
      if (!id) throw new Error("design job insert returned no id");
      const reference = `KDS-B-${pad(id)}`;
      await tx.update(schema.serviceEnquiries).set({ reference }).where(eq(schema.serviceEnquiries.id, id));
      await tx.insert(schema.serviceStatusHistory).values({ enquiryId: id, fromStatus: null, toStatus: "new", byStaff: auth.session.staff.id, note: "Front desk job created" });
      await tx.insert(schema.auditLogs).values(auditValues({ actor: String(auth.session.staff.id), action: DESIGN_AUDIT_ACTIONS.enquiryCreated, entity: "service_enquiry", entityId: id, newValue: { reference, phone: d.phone, productType: d.productType, deadline: d.deadline }, reason: "manual design job created" }));
    });
  } catch (error) {
    console.error("[design] create failed", error instanceof Error ? error.message : "unknown");
    return fail("generic");
  }
  revalidatePath("/admin/design"); revalidatePath("/admin"); return ok("created");
}

export async function updateDesignJobAction(_prev: DesignState, formData: FormData): Promise<DesignState> {
  const auth = await authorizeAction({ permission: "design.manage" });
  if (!auth.ok) return fail("denied");
  const enquiryId = positiveDesignId(formData.get("enquiryId"));
  const parsed = validateDesignJob(Object.fromEntries(formData.entries()));
  if (!enquiryId || !parsed.ok) return fail("invalid");
  const db = getDb(); if (!db) return fail("generic");
  try {
    const before = await db.select({ name: schema.serviceEnquiries.name, company: schema.serviceEnquiries.company, phone: schema.serviceEnquiries.phone, email: schema.serviceEnquiries.email, productType: schema.serviceEnquiries.productType, technique: schema.serviceEnquiries.technique, dimensions: schema.serviceEnquiries.dimensions, quantity: schema.serviceEnquiries.quantity, colourCount: schema.serviceEnquiries.colourCount, fileFormat: schema.serviceEnquiries.fileFormat, deadline: schema.serviceEnquiries.deadline, details: schema.serviceEnquiries.details, locale: schema.serviceEnquiries.locale })
      .from(schema.serviceEnquiries).where(eq(schema.serviceEnquiries.id, enquiryId)).limit(1);
    if (!before[0]) return fail("missing");
    await db.transaction(async (tx) => {
      await tx.update(schema.serviceEnquiries).set({ ...parsed.value, updatedAt: new Date() }).where(eq(schema.serviceEnquiries.id, enquiryId));
      await tx.insert(schema.auditLogs).values(auditValues({ actor: String(auth.session.staff.id), action: DESIGN_AUDIT_ACTIONS.enquiryUpdated, entity: "service_enquiry", entityId: enquiryId, oldValue: before[0], newValue: parsed.value, reason: "design job details updated" }));
    });
  } catch (error) { console.error("[design] update failed", error instanceof Error ? error.message : "unknown"); return fail("generic"); }
  revalidatePath("/admin/design"); return ok("updated");
}

export async function updateDesignStatusAction(_prev: DesignState, formData: FormData): Promise<DesignState> {
  const auth = await authorizeAction({ permission: "design.manage" });
  if (!auth.ok) return fail("denied");
  const enquiryId = positiveDesignId(formData.get("enquiryId"));
  const status = formData.get("status");
  const note = designNote(formData.get("note"));
  if (!enquiryId || !isDesignStatus(status)) return fail("invalid");
  const db = getDb(); if (!db) return fail("generic");
  try {
    const before = await db.select({ status: schema.serviceEnquiries.status }).from(schema.serviceEnquiries).where(eq(schema.serviceEnquiries.id, enquiryId)).limit(1);
    if (!before[0]) return fail("missing");
    await db.transaction(async (tx) => {
      await tx.update(schema.serviceEnquiries).set({ status, updatedAt: new Date() }).where(eq(schema.serviceEnquiries.id, enquiryId));
      await tx.insert(schema.serviceStatusHistory).values({ enquiryId, fromStatus: before[0].status, toStatus: status, byStaff: auth.session.staff.id, note });
      await tx.insert(schema.auditLogs).values(auditValues({ actor: String(auth.session.staff.id), action: DESIGN_AUDIT_ACTIONS.statusChanged, entity: "service_enquiry", entityId: enquiryId, oldValue: { status: before[0].status }, newValue: { status }, reason: note ?? "design job stage updated" }));
    });
  } catch (error) { console.error("[design] status failed", error instanceof Error ? error.message : "unknown"); return fail("generic"); }
  revalidatePath("/admin/design"); revalidatePath("/admin"); return ok("statusChanged");
}
