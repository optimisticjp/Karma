import { redirect } from "next/navigation";
import { PageHead } from "@/components/admin/PageHead";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { contentCopy } from "@/lib/admin/content-copy";
import {
  contentSummary,
  isContentKind,
  isContentStatus,
  type ContentKind,
  type ContentStatus
} from "@/lib/admin/content";
import { CreateContentForm, EditContentForm, type EditableContent } from "./ContentForms";

export const dynamic = "force-dynamic";

type ContentRow = {
  id: number;
  kind: string;
  slug: string;
  payload: unknown;
  studentId: number | null;
  status: string;
  sortOrder: number;
  consentConfirmed: boolean;
  ownerVerified: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  updatedByName: string | null;
};

function pgCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : null;
}

function payloadRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export default async function ContentPage() {
  const session = await requireAdmin("/admin/content");
  const canView = hasPermission(session.staff, "content.view") || hasPermission(session.staff, "content.manage");
  const canManage = hasPermission(session.staff, "content.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");

  const copy = contentCopy(session.staff.adminLocale);
  const db = getDb();
  if (!db) {
    return (
      <div className="max-w-[72rem]">
        <Header title={copy.title} lede={copy.lede} />
        <p className="alert alert-error mt-6">Database unavailable.</p>
      </div>
    );
  }

  let rows: ContentRow[] = [];
  let migrationReady = true;
  try {
    rows = await db
      .select({
        id: schema.contentItems.id,
        kind: schema.contentItems.kind,
        slug: schema.contentItems.slug,
        payload: schema.contentItems.payload,
        studentId: schema.contentItems.studentId,
        status: schema.contentItems.status,
        sortOrder: schema.contentItems.sortOrder,
        consentConfirmed: schema.contentItems.consentConfirmed,
        ownerVerified: schema.contentItems.ownerVerified,
        publishedAt: schema.contentItems.publishedAt,
        updatedAt: schema.contentItems.updatedAt,
        updatedByName: schema.staff.name
      })
      .from(schema.contentItems)
      .leftJoin(schema.staff, eq(schema.contentItems.updatedBy, schema.staff.id))
      .orderBy(asc(schema.contentItems.kind), asc(schema.contentItems.sortOrder), desc(schema.contentItems.updatedAt));
  } catch (error) {
    if (pgCode(error) === "42P01") migrationReady = false;
    else console.error("[content] list failed", error instanceof Error ? error.message : "unknown");
  }

  /* The student picker feeds the create and edit forms, and both need
     `content.manage`. A view-only admin was paying for 500 student rows on
     every page load to populate two forms they are never shown. */
  const students = canManage
    ? await db
        .select({
          id: schema.students.id,
          admissionNo: schema.students.admissionNo,
          fullName: schema.students.fullName,
          photoConsent: schema.students.photoConsent
        })
        .from(schema.students)
        .orderBy(asc(schema.students.fullName))
        .limit(500)
    : [];
  const studentOptions = students.map((student) => ({
    id: student.id,
    label: `${student.fullName} · ${student.admissionNo}`,
    photoConsent: student.photoConsent
  }));

  const validRows = rows.flatMap((row) => {
    if (!isContentKind(row.kind) || !isContentStatus(row.status)) return [];
    return [{ ...row, kind: row.kind as ContentKind, status: row.status as ContentStatus }];
  });
  const published = validRows.filter((row) => row.status === "published").length;
  const drafts = validRows.filter((row) => row.status === "draft").length;

  return (
    <div className="max-w-[76rem]">
      <Header title={copy.title} lede={copy.lede} />

      {!migrationReady ? (
        <div className="alert alert-error mt-6">
          <p className="font-semibold">{copy.migrationPending}</p>
          <p className="form-note mt-1">Run the next repository Drizzle migration before staff starts using this module.</p>
        </div>
      ) : null}

      <div className="console-metrics mt-3">
        <div><span className="kv-label">{copy.existing}</span><span className="kv-value">{validRows.length}</span></div>
        <div><span className="kv-label">{copy.statuses.published}</span><span className="kv-value">{published}</span></div>
        <div><span className="kv-label">{copy.statuses.draft}</span><span className="kv-value">{drafts}</span></div>
      </div>

      {/* The create panel was rendered OPEN for anyone with manage rights —
          170px of head plus the whole form, before a single content item. It
          is a disclosure now, and the three-line help sits inside it with the
          form it explains. */}
      {canManage && migrationReady ? (
        <details className="panel mt-3" aria-labelledby="content-create-heading">
          <summary className="panel-head cursor-pointer list-none">
            <h2 id="content-create-heading" className="text-h4">{copy.add}</h2>
            <span aria-hidden className="text-h4">＋</span>
          </summary>
          <div className="panel-body border-t border-rule">
            <p className="form-note mb-3 max-w-[58rem]">{copy.addHelp}</p>
            <CreateContentForm students={studentOptions} isOwner={session.role === "owner"} copy={copy} />
          </div>
        </details>
      ) : null}

      <section className="mt-3" aria-labelledby="content-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="content-list-heading" className="kv-label">{copy.existing}</h2>
          {!canManage ? <p className="form-note">View only</p> : null}
        </div>

        {!migrationReady || validRows.length === 0 ? (
          <p className="empty-state mt-4">{migrationReady ? copy.empty : copy.migrationPending}</p>
        ) : (
          <div className="data-list mt-2">
            {validRows.map((row) => {
              const item: EditableContent = {
                id: row.id,
                kind: row.kind,
                slug: row.slug,
                payload: payloadRecord(row.payload),
                studentId: row.studentId,
                status: row.status,
                sortOrder: row.sortOrder,
                consentConfirmed: row.consentConfirmed,
                ownerVerified: row.ownerVerified
              };
              return (
                /* A 224px `<article class="panel">` whose entire manage-mode
                   body was one `<details><summary>Edit</summary>` line. The
                   row IS the summary now. The view-only branch dropped its
                   three-Fact list: kind and status are already in the row, and
                   the sort order is not a fact a reader needs. */
                <details key={row.id}>
                  <summary className="data-row">
                    <span className="data-row__title break-words">{contentSummary(row.kind, row.payload)}</span>
                    <span className="data-row__actions">
                      <span className="chip">{copy.kinds[row.kind]}</span>
                      <span className={`chip ${statusTone(row.status)}`}>{copy.statuses[row.status]}</span>
                    </span>
                    <span className="data-row__meta">
                      <span>{row.slug}</span>
                      <span>#{row.id}</span>
                      <span>{formatIst(row.updatedAt, session.staff.adminLocale)}</span>
                      {row.updatedByName ? <span>{row.updatedByName}</span> : null}
                    </span>
                  </summary>
                  {canManage ? (
                    <div className="border-t border-line px-3 py-3 md:px-4">
                      <EditContentForm item={item} students={studentOptions} isOwner={session.role === "owner"} copy={copy} />
                    </div>
                  ) : null}
                </details>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Header({ title, lede }: { title: string; lede: string }) {
  return <PageHead title={title} context={lede} />;
}

function statusTone(status: ContentStatus) {
  if (status === "published") return "status-active";
  if (status === "draft") return "status-pending";
  return "status-off";
}

function formatIst(value: Date | string, locale: "en" | "gu") {
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
