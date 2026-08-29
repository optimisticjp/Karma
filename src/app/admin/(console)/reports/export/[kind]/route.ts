import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { resolveAccess } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

const EXPORTS = ["students", "admissions", "attendance", "fees", "design"] as const;
type ExportKind = (typeof EXPORTS)[number];

type CsvRow = Record<string, unknown>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> }
) {
  const { decision } = await resolveAccess({ permission: "exports.run" });
  if (!decision.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: decision.reason === "signin" ? 401 : 403 });
  }

  const { kind } = await params;
  if (!EXPORTS.includes(kind as ExportKind)) {
    return NextResponse.json({ error: "unknown_export" }, { status: 404 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "database_unavailable" }, { status: 503 });

  let rows: CsvRow[];
  switch (kind as ExportKind) {
    case "students": {
      const result = await db.execute(sql`
        select admission_no, full_name, phone, whatsapp, email, area,
               language_pref, is_minor, notes, created_at
          from students
         order by admission_no
      `);
      rows = result.rows as CsvRow[];
      break;
    }
    case "admissions": {
      const result = await db.execute(sql`
        select reference, full_name, whatsapp, email, course_slug, preferred_timing,
               area, status, assigned_to, next_follow_up, closure_reason, created_at, updated_at
          from applications
         order by created_at desc
      `);
      rows = result.rows as CsvRow[];
      break;
    }
    case "attendance": {
      const result = await db.execute(sql`
        select s.session_date, b.label as batch, st.admission_no, st.full_name as student,
               ar.status, ar.note, ar.method, ar.marked_at
          from attendance_records ar
          join attendance_sessions s on s.id = ar.session_id
          join batches b on b.id = s.batch_id
          join students st on st.id = ar.student_id
         order by s.session_date desc, b.label, st.full_name
      `);
      rows = result.rows as CsvRow[];
      break;
    }
    case "fees": {
      const result = await db.execute(sql`
        select fr.receipt_no, st.admission_no, st.full_name as student, b.label as batch,
               fr.course_fee, fr.discount, fr.received, fr.method, fr.due_date,
               fr.notes, fr.created_at
          from fee_records fr
          join enrollments e on e.id = fr.enrollment_id
          join students st on st.id = e.student_id
          join batches b on b.id = e.batch_id
         order by fr.created_at desc
      `);
      rows = result.rows as CsvRow[];
      break;
    }
    case "design": {
      const result = await db.execute(sql`
        select reference, name, company, phone, email, product_type, technique,
               dimensions, quantity, colour_count, file_format, deadline, status,
               details, created_at, updated_at
          from service_enquiries
         order by created_at desc
      `);
      rows = result.rows as CsvRow[];
      break;
    }
  }

  const csv = toCsv(rows);
  const stamp = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return new NextResponse(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="karma-${kind}-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export function toCsv(rows: CsvRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvCell(row[header])).join(","));
  }
  return lines.join("\r\n");
}

function csvCell(value: unknown): string {
  if (value == null) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  // Spreadsheet-formula injection: preserve the visible value but force text.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
