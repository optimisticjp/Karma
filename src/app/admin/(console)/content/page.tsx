import { redirect } from "next/navigation";
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
        <p className="alert alert-error mt-8">Database unavailable.</p>
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

  const students = await db
    .select({
      id: schema.students.id,
      admissionNo: schema.students.admissionNo,
      fullName: schema.students.fullName,
      photoConsent: schema.students.photoConsent
    })
    .from(schema.students)
    .orderBy(asc(schema.students.fullName))
    .limit(500);
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
        <div className="alert alert-error mt-8">
          <p className="font-semibold">{copy.migrationPending}</p>
          <p className="form-note mt-1">Run the repository's next Drizzle migration before staff starts using this module.</p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label={copy.existing} value={validRows.length} />
        <Metric label={copy.statuses.published} value={published} />
        <Metric label={copy.statuses.draft} value={drafts} />
      </div>

      {canManage && migrationReady ? (
        <section className="panel mt-8" aria-labelledby="content-create-heading">
          <div className="panel-head">
            <div>
              <h2 id="content-create-heading" className="text-h4">{copy.add}</h2>
              <p className="form-note mt-1 max-w-[58rem]">{copy.addHelp}</p>
            </div>
          </div>
          <div className="panel-body">
            <CreateContentForm students={studentOptions} isOwner={session.role === "owner"} copy={copy} />
          </div>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="content-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="content-list-heading" className="text-h4">{copy.existing}</h2>
          {!canManage ? <p className="form-note">View only</p> : null}
        </div>

        {!migrationReady || validRows.length === 0 ? (
          <p className="empty-state mt-4">{migrationReady ? copy.empty : copy.migrationPending}</p>
        ) : (
          <div className="mt-4 grid gap-4">
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
                <article key={row.id} className="panel">
                  <div className="panel-head flex-wrap gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="chip">{copy.kinds[row.kind]}</span>
                        <span className={`status ${statusTone(row.status)}`}>{copy.statuses[row.status]}</span>
                      </div>
                      <h3 className="text-h4 mt-2 break-words">{contentSummary(row.kind, row.payload)}</h3>
                      <p className="form-note mt-1">{row.slug} · #{row.id}</p>
                    </div>
                    <p className="form-note ml-auto text-right">
                      {formatIst(row.updatedAt, session.staff.adminLocale)}
                      {row.updatedByName ? <><br />{row.updatedByName}</> : null}
                    </p>
                  </div>
                  <div className="panel-body">
                    {canManage ? (
                      <details>
                        <summary className="cursor-pointer font-semibold text-vermilion-deep">{copy.edit}</summary>
                        <div className="mt-5 border-t border-rule pt-5">
                          <EditContentForm item={item} students={studentOptions} isOwner={session.role === "owner"} copy={copy} />
                        </div>
                      </details>
                    ) : (
                      <dl className="grid gap-4 sm:grid-cols-3">
                        <Fact label={copy.kind} value={copy.kinds[row.kind]} />
                        <Fact label={copy.status} value={copy.statuses[row.status]} />
                        <Fact label={copy.sortOrder} value={String(row.sortOrder)} />
                      </dl>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Header({ title, lede }: { title: string; lede: string }) {
  return <div><h1 className="text-h2">{title}</h1><span aria-hidden className="rule-stitch is-in" /><p className="u-lede">{lede}</p></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="panel panel-body"><p className="microlabel">{label}</p><p className="text-h3 mt-2">{value}</p></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><dt className="microlabel">{label}</dt><dd className="mt-1 text-smallmeta">{value}</dd></div>;
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
