import type { AdminLocale } from "@/lib/admin/i18n";

export type CatalogCopy = {
  title: string;
  lede: string;
  notConfigured: string;
  coursesCount: string;
  activeCoursesCount: string;
  batchesCount: string;
  addCourse: string;
  editCourse: string;
  addBatch: string;
  editBatch: string;
  noCourses: string;
  noBatches: string;
  viewOnly: string;
  courseFields: {
    slug: string;
    slugHint: string;
    nameEn: string;
    nameGu: string;
    family: string;
    durationWeeks: string;
    sortOrder: string;
    active: string;
  };
  batchFields: {
    label: string;
    days: string;
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
    seats: string;
    seatsTaken: string;
    language: string;
    trainer: string;
    status: string;
  };
  families: Record<"machine" | "modern" | "software", string>;
  statuses: Record<"open" | "full" | "started" | "done", string>;
  active: string;
  inactive: string;
  noTrainer: string;
  saveCourse: string;
  createCourse: string;
  saveBatch: string;
  createBatch: string;
  saving: string;
  errors: Record<"denied" | "invalid" | "duplicate" | "missing" | "generic", string>;
  success: Record<"courseCreated" | "courseUpdated" | "batchCreated" | "batchUpdated", string>;
};

const COPY = {
  en: {
    title: "Courses & Batches",
    lede: "Maintain the course catalogue and the live teaching schedule. Nothing is deleted: courses can be made inactive and batches can be closed when they finish.",
    notConfigured: "The database is not connected on this deployment, so courses and batches cannot be managed.",
    coursesCount: "Courses",
    activeCoursesCount: "Active courses",
    batchesCount: "Batches",
    addCourse: "Add course",
    editCourse: "Edit course",
    addBatch: "Add batch",
    editBatch: "Edit batch",
    noCourses: "No courses yet. Add the first course to start building the studio schedule.",
    noBatches: "No batches for this course yet.",
    viewOnly: "You can view this section, but your account does not have permission to edit it.",
    courseFields: {
      slug: "Slug",
      slugHint: "Lowercase letters, numbers and hyphens only; for example zardosi-machine.",
      nameEn: "English name",
      nameGu: "Gujarati name",
      family: "Course family",
      durationWeeks: "Duration (weeks)",
      sortOrder: "Sort order",
      active: "Active course"
    },
    batchFields: {
      label: "Batch label",
      days: "Days",
      startTime: "Start time",
      endTime: "End time",
      startDate: "Start date",
      endDate: "End date",
      seats: "Seats",
      seatsTaken: "Seats taken",
      language: "Teaching language",
      trainer: "Trainer",
      status: "Status"
    },
    families: {
      machine: "Machine technique",
      modern: "Modern / advanced",
      software: "Software / emCAD"
    },
    statuses: {
      open: "Open",
      full: "Full",
      started: "Started",
      done: "Done"
    },
    active: "Active",
    inactive: "Inactive",
    noTrainer: "No trainer assigned",
    saveCourse: "Save course",
    createCourse: "Create course",
    saveBatch: "Save batch",
    createBatch: "Create batch",
    saving: "Saving…",
    errors: {
      denied: "You do not have permission to make that change.",
      invalid: "Check the fields and try again.",
      duplicate: "That course slug is already in use.",
      missing: "That course, batch or trainer no longer exists. Reload the page and try again.",
      generic: "That did not work. Try again."
    },
    success: {
      courseCreated: "Course created.",
      courseUpdated: "Course updated.",
      batchCreated: "Batch created.",
      batchUpdated: "Batch updated."
    }
  },
  gu: {
    title: "કોર્સ અને બેચ",
    lede: "કોર્સ કેટલોગ અને લાઇવ ક્લાસ શેડ્યૂલ અહીં સંભાળો. કંઈપણ ડિલીટ થતું નથી: કોર્સને inactive કરી શકાય અને પૂર્ણ થયેલી બેચને બંધ કરી શકાય.",
    notConfigured: "આ deployment પર database જોડાયેલું નથી, તેથી courses અને batches મેનેજ કરી શકાતા નથી.",
    coursesCount: "કોર્સ",
    activeCoursesCount: "ચાલુ કોર્સ",
    batchesCount: "બેચ",
    addCourse: "કોર્સ ઉમેરો",
    editCourse: "કોર્સ સંપાદિત કરો",
    addBatch: "બેચ ઉમેરો",
    editBatch: "બેચ સંપાદિત કરો",
    noCourses: "હજુ કોઈ કોર્સ નથી. સ્ટુડિયો શેડ્યૂલ બનાવવા માટે પહેલો કોર્સ ઉમેરો.",
    noBatches: "આ કોર્સ માટે હજી કોઈ બેચ નથી.",
    viewOnly: "તમે આ વિભાગ જોઈ શકો છો, પરંતુ ફેરફાર કરવાની પરવાનગી તમારા account પાસે નથી.",
    courseFields: {
      slug: "Slug",
      slugHint: "માત્ર lowercase letters, numbers અને hyphens; ઉદાહરણ: zardosi-machine.",
      nameEn: "English નામ",
      nameGu: "ગુજરાતી નામ",
      family: "કોર્સ family",
      durationWeeks: "અવધિ (અઠવાડિયા)",
      sortOrder: "Sort order",
      active: "ચાલુ કોર્સ"
    },
    batchFields: {
      label: "બેચ નામ",
      days: "દિવસો",
      startTime: "શરૂઆતનો સમય",
      endTime: "અંતનો સમય",
      startDate: "શરૂઆતની તારીખ",
      endDate: "અંતની તારીખ",
      seats: "Seats",
      seatsTaken: "ભરાયેલી seats",
      language: "શિક્ષણ ભાષા",
      trainer: "Trainer",
      status: "Status"
    },
    families: {
      machine: "Machine technique",
      modern: "Modern / advanced",
      software: "Software / emCAD"
    },
    statuses: {
      open: "Open",
      full: "Full",
      started: "Started",
      done: "Done"
    },
    active: "ચાલુ",
    inactive: "બંધ",
    noTrainer: "Trainer પસંદ નથી",
    saveCourse: "કોર્સ સાચવો",
    createCourse: "કોર્સ બનાવો",
    saveBatch: "બેચ સાચવો",
    createBatch: "બેચ બનાવો",
    saving: "સાચવી રહ્યું છે…",
    errors: {
      denied: "આ ફેરફાર કરવાની પરવાનગી તમારા account પાસે નથી.",
      invalid: "બધી વિગતો તપાસીને ફરી પ્રયાસ કરો.",
      duplicate: "આ course slug પહેલેથી વપરાયેલ છે.",
      missing: "આ course, batch અથવા trainer હવે ઉપલબ્ધ નથી. Page reload કરીને ફરી પ્રયાસ કરો.",
      generic: "ફેરફાર સાચવાયો નથી. ફરી પ્રયાસ કરો."
    },
    success: {
      courseCreated: "કોર્સ બનાવ્યો.",
      courseUpdated: "કોર્સ અપડેટ થયો.",
      batchCreated: "બેચ બનાવી.",
      batchUpdated: "બેચ અપડેટ થઈ."
    }
  }
} satisfies Record<AdminLocale, CatalogCopy>;

export function catalogCopy(locale: AdminLocale): CatalogCopy {
  return COPY[locale];
}
