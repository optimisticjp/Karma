import { describe, expect, it } from "vitest";
import { validateBatchInput, validateCourseInput } from "@/lib/admin/course-validation";

describe("course catalogue validation", () => {
  it("normalises a valid course slug and optional values", () => {
    const result = validateCourseInput({
      slug: "  Zardosi-Machine  ",
      nameEn: "Zardosi Machine",
      nameGu: "ઝરદોસી મશીન",
      family: "machine",
      durationWeeks: "12",
      sortOrder: "4",
      active: "on"
    });
    expect(result).toEqual({
      ok: true,
      value: {
        slug: "zardosi-machine",
        nameEn: "Zardosi Machine",
        nameGu: "ઝરદોસી મશીન",
        family: "machine",
        durationWeeks: 12,
        sortOrder: 4,
        active: true
      }
    });
  });

  it("accepts a blank duration and defaults sort order", () => {
    const result = validateCourseInput({
      slug: "emcad",
      nameEn: "emCAD Design",
      nameGu: "emCAD ડિઝાઇન",
      family: "software",
      durationWeeks: "",
      sortOrder: "",
      active: null
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.durationWeeks).toBeNull();
      expect(result.value.sortOrder).toBe(0);
      expect(result.value.active).toBe(false);
    }
  });

  it("rejects unsafe slugs and unknown families", () => {
    expect(
      validateCourseInput({
        slug: "../../admin",
        nameEn: "Course",
        nameGu: "કોર્સ",
        family: "machine"
      }).ok
    ).toBe(false);
    expect(
      validateCourseInput({
        slug: "valid-course",
        nameEn: "Course",
        nameGu: "કોર્સ",
        family: "mystery"
      }).ok
    ).toBe(false);
  });
});

describe("batch validation", () => {
  const valid = {
    courseId: "1",
    label: "Evening A",
    days: "Mon-Sat",
    startTime: "18:00",
    endTime: "20:00",
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    seats: "10",
    language: "ગુજરાતી + Hindi",
    trainerId: "",
    status: "open"
  };

  it("accepts a complete batch and a blank trainer", () => {
    const result = validateBatchInput(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.trainerId).toBeNull();
      expect(result.value.seats).toBe(10);
      expect(result.value.status).toBe("open");
    }
  });

  it("rejects a batch whose end time is not after start time", () => {
    expect(validateBatchInput({ ...valid, endTime: "17:00" }).ok).toBe(false);
    expect(validateBatchInput({ ...valid, endTime: "18:00" }).ok).toBe(false);
  });

  it("rejects an end date before the start date", () => {
    expect(validateBatchInput({ ...valid, endDate: "2026-08-31" }).ok).toBe(false);
  });

  it("allows an open-ended batch", () => {
    const result = validateBatchInput({ ...valid, endDate: "" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.endDate).toBeNull();
  });

  it("rejects impossible dates, invalid times and invalid seat counts", () => {
    expect(validateBatchInput({ ...valid, startDate: "2026-02-30" }).ok).toBe(false);
    expect(validateBatchInput({ ...valid, startTime: "25:00" }).ok).toBe(false);
    expect(validateBatchInput({ ...valid, seats: "0" }).ok).toBe(false);
  });

  it("rejects unknown batch statuses", () => {
    expect(validateBatchInput({ ...valid, status: "deleted" }).ok).toBe(false);
  });
});
