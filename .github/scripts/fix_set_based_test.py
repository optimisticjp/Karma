from pathlib import Path

path = Path("tests/compact-density-console.test.ts")
text = path.read_text()
old = '''  it("keeps the new reads set-based, never per row", () => {
    /* The student row gained a course, a batch, an enrolment status and a
       balance. Two grouped queries over the ids already on screen — they
       shrink with the list rather than multiplying by it. */
    expect(students).toContain("inArray(schema.enrollments.studentId, visibleIds)");
    expect(students).toContain(".groupBy(schema.enrollments.studentId)");
    expect(students).not.toMatch(/for \\(const student of students\\)[\\s\\S]{0,200}await db/);
  });'''
new = '''  it("keeps the new reads set-based, never per row", () => {
    /* The student row gained a course, a batch, an enrolment status and a
       balance. Reads stay scoped to the ids already on screen and never become
       a query per student. Fee rows are joined raw and summarised per enrolment
       in memory so multiple receipts cannot duplicate the agreement total. */
    expect(students).toContain("inArray(schema.enrollments.studentId, visibleIds)");
    expect(students).toContain(".leftJoin(schema.feeRecords");
    expect(students).toContain("directoryByEnrollment");
    expect(students).not.toMatch(/for \\(const student of students\\)[\\s\\S]{0,200}await db/);
  });'''
if text.count(old) != 1:
    raise SystemExit("set-based density test anchor missing")
path.write_text(text.replace(old, new, 1))

# Keep the durable project-context note to exactly one trailing newline so the
# repository's whitespace gate stays clean after the patch appends its entry.
doc = Path("docs/project-context.md")
doc.write_text(doc.read_text().rstrip() + "\n")
