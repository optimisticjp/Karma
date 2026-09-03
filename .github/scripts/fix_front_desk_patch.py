from pathlib import Path
import re
import subprocess


def read(path: str) -> str:
    return Path(path).read_text()


def write(path: str, text: str) -> None:
    Path(path).write_text(text)


def replace(path: str, old: str, new: str) -> None:
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"expected one anchor in {path}, found {count}: {old[:120]!r}")
    write(path, text.replace(old, new, 1))


def sub(path: str, pattern: str, replacement: str, flags: int = re.S) -> None:
    text = read(path)
    updated, count = re.subn(pattern, lambda _: replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"expected one regex match in {path}, found {count}: {pattern[:120]!r}")
    write(path, updated)


# The Fees page now uses a status selector; Today must link to the same filter.
replace(
    "src/app/admin/(console)/page.tsx",
    'moreHref="/admin/fees?pending=1"',
    'moreHref="/admin/fees?status=pending"',
)

# This test's security contract is audit.view. Content used to be one of many
# Today shortcuts; it is intentionally no longer a front-desk shortcut.
replace(
    "tests/console-completion.test.ts",
    '    expect(today).toContain(\'hasPermission(session.staff, "content.manage")\');',
    '    expect(today).toContain(\'hasPermission(session.staff, "fees.manage")\');',
)

# ---------------------------------------------------------------------------
# Student directory/detail fee totals must use the same canonical summariser as
# the Fees screen. SQL SUM over an enrolment joined to multiple fee rows repeats
# the agreement once per receipt and can overstate what a student owes.
# ---------------------------------------------------------------------------
p = "src/app/admin/(console)/students/page.tsx"
replace(
    p,
    'import { and, asc, desc, eq, inArray, isNull, or, sum } from "drizzle-orm";',
    'import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";',
)
replace(
    p,
    'import { feesCopy } from "@/lib/admin/fees-copy";',
    'import { feesCopy } from "@/lib/admin/fees-copy";\nimport { summariseFees } from "@/lib/admin/fee-status";',
)

sub(
    p,
    r'''  const \[currentEnrolments, balances\] = visibleIds\.length\n    \? await Promise\.all\(\[.*?      \]\)\n    : \[\[\], \[\]\];''',
    '''  const [currentEnrolments, directoryFeeRows] = visibleIds.length
    ? await Promise.all([
        db
          .select({
            studentId: schema.enrollments.studentId,
            status: schema.enrollments.status,
            batchLabel: schema.batches.label,
            courseNameEn: schema.courses.nameEn,
            courseNameGu: schema.courses.nameGu
          })
          .from(schema.enrollments)
          .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
          .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
          .where(inArray(schema.enrollments.studentId, visibleIds))
          .orderBy(desc(schema.enrollments.joinedOn)),
        db
          .select({
            studentId: schema.enrollments.studentId,
            enrollmentId: schema.enrollments.id,
            agreedFeeTotal: schema.enrollments.agreedFeeTotal,
            agreedAdmissionAmount: schema.enrollments.agreedAdmissionAmount,
            agreedBalanceDueOn: schema.enrollments.agreedBalanceDueOn,
            received: schema.feeRecords.received,
            discount: schema.feeRecords.discount,
            courseFee: schema.feeRecords.courseFee,
            dueDate: schema.feeRecords.dueDate
          })
          .from(schema.enrollments)
          .leftJoin(schema.feeRecords, eq(schema.feeRecords.enrollmentId, schema.enrollments.id))
          .where(inArray(schema.enrollments.studentId, visibleIds))
      ])
    : [[], []];''',
)

sub(
    p,
    r'''  const balanceByStudent = new Map<number, number>\(\);\n  for \(const row of balances\) \{.*?  \}\n  const selectedId =''',
    '''  const directoryByEnrollment = new Map<number, {
    studentId: number;
    agreement: { agreedFeeTotal: number | null; agreedAdmissionAmount: number | null; agreedBalanceDueOn: string | null };
    entries: Array<{ received: number; discount: number | null; courseFee: number | null; dueDate: string | null }>;
  }>();
  for (const row of directoryFeeRows) {
    let current = directoryByEnrollment.get(row.enrollmentId);
    if (!current) {
      current = {
        studentId: row.studentId,
        agreement: {
          agreedFeeTotal: row.agreedFeeTotal,
          agreedAdmissionAmount: row.agreedAdmissionAmount,
          agreedBalanceDueOn: row.agreedBalanceDueOn
        },
        entries: []
      };
      directoryByEnrollment.set(row.enrollmentId, current);
    }
    if (row.received != null) {
      current.entries.push({
        received: row.received,
        discount: row.discount,
        courseFee: row.courseFee,
        dueDate: row.dueDate
      });
    }
  }
  const balanceByStudent = new Map<number, number>();
  for (const enrollment of directoryByEnrollment.values()) {
    const summary = summariseFees(enrollment.agreement, enrollment.entries);
    if (summary.balance <= 0) continue;
    balanceByStudent.set(
      enrollment.studentId,
      (balanceByStudent.get(enrollment.studentId) ?? 0) + summary.balance
    );
  }
  const selectedId =''',
)

replace(
    p,
    '''  let enrollments: Array<{
    id: number; batchId: number; batchLabel: string; courseName: string; status: EnrollmentStatus;
    joinedOn: string | null; completedOn: string | null;
  }> = [];''',
    '''  let enrollments: Array<{
    id: number; batchId: number; batchLabel: string; courseName: string; status: EnrollmentStatus;
    joinedOn: string | null; completedOn: string | null;
    agreedFeeTotal: number | null; agreedAdmissionAmount: number | null; agreedBalanceDueOn: string | null;
  }> = [];''',
)

replace(
    p,
    '''        status: schema.enrollments.status,
        joinedOn: schema.enrollments.joinedOn,
        completedOn: schema.enrollments.completedOn
      }).from(schema.enrollments)''',
    '''        status: schema.enrollments.status,
        joinedOn: schema.enrollments.joinedOn,
        completedOn: schema.enrollments.completedOn,
        agreedFeeTotal: schema.enrollments.agreedFeeTotal,
        agreedAdmissionAmount: schema.enrollments.agreedAdmissionAmount,
        agreedBalanceDueOn: schema.enrollments.agreedBalanceDueOn
      }).from(schema.enrollments)''',
)

replace(
    p,
    '''      status: isEnrollmentStatus(e.status) ? e.status : "active",
      joinedOn: e.joinedOn,
      completedOn: e.completedOn
    }));''',
    '''      status: isEnrollmentStatus(e.status) ? e.status : "active",
      joinedOn: e.joinedOn,
      completedOn: e.completedOn,
      agreedFeeTotal: e.agreedFeeTotal,
      agreedAdmissionAmount: e.agreedAdmissionAmount,
      agreedBalanceDueOn: e.agreedBalanceDueOn
    }));''',
)

replace(
    p,
    '  const feeSummary = summarizeFees(fees);',
    '''  const feeRowsByEnrollment = new Map<number, typeof fees>();
  for (const row of fees) {
    const list = feeRowsByEnrollment.get(row.enrollmentId) ?? [];
    list.push(row);
    feeRowsByEnrollment.set(row.enrollmentId, list);
  }
  const selectedFeeSummaries = enrollments.map((enrollment) =>
    summariseFees(
      {
        agreedFeeTotal: enrollment.agreedFeeTotal,
        agreedAdmissionAmount: enrollment.agreedAdmissionAmount,
        agreedBalanceDueOn: enrollment.agreedBalanceDueOn
      },
      feeRowsByEnrollment.get(enrollment.id) ?? []
    )
  );
  const feeSummary = {
    received: selectedFeeSummaries.reduce((sum, summary) => sum + summary.received, 0),
    due: selectedFeeSummaries.reduce((sum, summary) => sum + summary.balance, 0)
  };''',
)

sub(
    p,
    r'''\nfunction summarizeFees\(rows: Array<\{ enrollmentId: number; courseFee: number; discount: number; received: number \}>\) \{.*?\n\}\n\n(?=function Fact)''',
    '\n',
)

# Regression: more than one receipt must never duplicate the agreement in the
# directory total, and the student detail must use the shared fee summariser.
path = "tests/front-desk-fees-ux.test.ts"
text = read(path)
anchor = '''  it("keeps the daily payment form free of an editable course-fee input", () => {
    const form = read("src/app/admin/(console)/fees/FeeForm.tsx");'''
addition = '''  it("uses the canonical fee summariser for student directory and detail balances", () => {
    const page = read("src/app/admin/(console)/students/page.tsx");
    expect(page).toContain("summariseFees(enrollment.agreement, enrollment.entries)");
    expect(page).toContain("const selectedFeeSummaries = enrollments.map");
    expect(page).not.toContain("agreed: sum(schema.enrollments.agreedFeeTotal)");
  });

'''
if text.count(anchor) != 1:
    raise SystemExit("front desk test anchor missing")
write(path, text.replace(anchor, addition + anchor, 1))

subprocess.run(["git", "diff", "--stat"], check=True)
