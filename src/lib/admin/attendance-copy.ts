import type { AttendanceStatus } from "./attendance";

export type AttendanceCopy = ReturnType<typeof en>;

const en = () => ({
  title: "Attendance",
  lede: "Open the batch register, mark everyone quickly, and keep every later correction explainable.",
  batch: "Batch",
  date: "Class date",
  openRegister: "Open register",
  chooseBatch: "Choose a batch…",
  noBatch: "Choose a batch and date to open attendance.",
  roster: "Class register",
  students: "Students",
  marked: "Marked",
  presentToday: "Present / late",
  markAllPresent: "Mark all present",
  clearMarks: "Clear unsaved marks",
  save: "Save attendance",
  saving: "Saving…",
  lock: "Lock register",
  locked: "Register locked",
  lockedHint: "This register is locked. Any changed mark needs a correction reason and is recorded in the audit trail.",
  correctionReason: "Reason for correction",
  correctionPlaceholder: "Example: trainer confirmed the student arrived after attendance was saved",
  note: "Note (optional)",
  noStudents: "No active students are enrolled in this batch.",
  noRecord: "Not marked",
  viewOnly: "You can view attendance. Marking or corrections require Attendance manage permission.",
  statuses: {
    present: "Present",
    absent: "Absent",
    late: "Late",
    excused: "Excused"
  } satisfies Record<AttendanceStatus, string>,
  short: { present: "P", absent: "A", late: "L", excused: "E" } satisfies Record<AttendanceStatus, string>,
  success: { saved: "Attendance saved.", locked: "Register locked." },
  errors: {
    denied: "You do not have permission for this action.",
    invalid: "Check the batch, date and marks and try again.",
    missing: "That batch or attendance register could not be found.",
    outsideBatch: "That date is outside this batch's start/end dates.",
    locked: "This register is locked. Add a correction reason before changing a saved mark.",
    generic: "Could not save attendance right now. Please try again."
  }
});

const gu = () => ({
  title: "હાજરી",
  lede: "Batchનું register ખોલો, ઝડપથી હાજરી mark કરો અને પછીનો દરેક correction કારણ સાથે recordમાં રાખો.",
  batch: "Batch",
  date: "Classની તારીખ",
  openRegister: "Register ખોલો",
  chooseBatch: "Batch પસંદ કરો…",
  noBatch: "હાજરી લેવા batch અને તારીખ પસંદ કરો.",
  roster: "Class Register",
  students: "Students",
  marked: "Mark થયેલ",
  presentToday: "Present / Late",
  markAllPresent: "બધાને Present કરો",
  clearMarks: "Unsaved marks સાફ કરો",
  save: "હાજરી Save કરો",
  saving: "Save થઈ રહ્યું છે…",
  lock: "Register Lock કરો",
  locked: "Register locked છે",
  lockedHint: "આ register lock છે. હવે કોઈ mark બદલશો તો correction reason જરૂરી છે અને auditમાં record થશે.",
  correctionReason: "Correctionનું કારણ",
  correctionPlaceholder: "ઉદાહરણ: trainerએ confirm કર્યું કે student attendance પછી classમાં આવ્યો હતો",
  note: "Note (optional)",
  noStudents: "આ batchમાં હાલ કોઈ active student નથી.",
  noRecord: "Mark નથી",
  viewOnly: "તમે હાજરી જોઈ શકો છો. Mark કે correction માટે Attendance manage permission જોઈએ.",
  statuses: {
    present: "Present",
    absent: "Absent",
    late: "Late",
    excused: "Excused"
  } satisfies Record<AttendanceStatus, string>,
  short: { present: "P", absent: "A", late: "L", excused: "E" } satisfies Record<AttendanceStatus, string>,
  success: { saved: "હાજરી save થઈ ગઈ.", locked: "Register lock થઈ ગયું." },
  errors: {
    denied: "આ કામ કરવાની permission નથી.",
    invalid: "Batch, date અને marks ચેક કરીને ફરી try કરો.",
    missing: "આ batch કે attendance register મળ્યો નથી.",
    outsideBatch: "આ તારીખ batchની start/end dateની બહાર છે.",
    locked: "Register lock છે. Saved mark બદલવા correction reason લખો.",
    generic: "હમણાં હાજરી save થઈ શકી નથી. ફરી try કરો."
  }
});

export function attendanceCopy(locale: "en" | "gu"): AttendanceCopy { return locale === "gu" ? gu() : en(); }
