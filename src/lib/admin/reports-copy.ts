import type { AdminLocale } from "@/lib/admin/i18n";

export type ReportsCopy = {
  title: string;
  lede: string;
  summary: string;
  activeStudents: string;
  openAdmissions: string;
  runningBatches: string;
  attendanceMarked: string;
  feesReceived: string;
  openDesignJobs: string;
  certificatesIssued: string;
  last30Days: string;
  exports: string;
  exportsHelp: string;
  download: string;
  exportStudents: string;
  exportAdmissions: string;
  exportAttendance: string;
  exportFees: string;
  exportDesign: string;
  audit: string;
  auditHelp: string;
  noAudit: string;
  databaseUnavailable: string;
  viewOnly: string;
};

const COPY = {
  en: {
    title: "Reports & records",
    lede: "A practical view of the institute: admissions, students, classes, fees and design work. Numbers here come only from Karma records.",
    summary: "Institute summary",
    activeStudents: "Students currently learning",
    openAdmissions: "Admissions still in follow-up",
    runningBatches: "Batches running now",
    attendanceMarked: "Attendance marks",
    feesReceived: "Fees received",
    openDesignJobs: "Open design jobs",
    certificatesIssued: "Certificates issued",
    last30Days: "Last 30 days",
    exports: "Download records",
    exportsHelp: "Use CSV when you need a working sheet, backup copy or office follow-up list. Downloads respect your staff permissions.",
    download: "Download CSV",
    exportStudents: "Student list",
    exportAdmissions: "Admission enquiries",
    exportAttendance: "Attendance register",
    exportFees: "Fee ledger",
    exportDesign: "Design jobs",
    audit: "Recent activity log",
    auditHelp: "Sensitive changes are recorded here so the owner can see what changed, when and by whom.",
    noAudit: "No recorded activity yet.",
    databaseUnavailable: "The database is unavailable on this deployment, so reports cannot be shown.",
    viewOnly: "You can see reports, but this account cannot download exports or view the audit trail unless those permissions are granted."
  },
  gu: {
    title: "રિપોર્ટ અને રેકોર્ડ",
    lede: "ઇન્સ્ટિટ્યૂટમાં શું ચાલી રહ્યું છે તેનો કામનો view: admission, students, batches, fees અને design jobs. અહીંના આંકડા ફક્ત Karma ના સાચા records માંથી આવે છે.",
    summary: "ઇન્સ્ટિટ્યૂટનો સાર",
    activeStudents: "હાલ શીખતા students",
    openAdmissions: "Follow-up માં બાકી admissions",
    runningBatches: "હાલ ચાલતી batches",
    attendanceMarked: "Attendance marks",
    feesReceived: "મળેલી fees",
    openDesignJobs: "ચાલુ design jobs",
    certificatesIssued: "આપેલા certificates",
    last30Days: "છેલ્લા 30 દિવસ",
    exports: "Records download કરો",
    exportsHelp: "Office follow-up, working sheet કે backup copy માટે CSV download કરો. દરેક download staff permission પ્રમાણે જ મળે છે.",
    download: "CSV download",
    exportStudents: "Student list",
    exportAdmissions: "Admission enquiries",
    exportAttendance: "Attendance register",
    exportFees: "Fee ledger",
    exportDesign: "Design jobs",
    audit: "તાજેતરની activity",
    auditHelp: "મહત્વના ફેરફારો અહીં record થાય છે જેથી owner જોઈ શકે કે શું, ક્યારે અને કોના દ્વારા બદલાયું.",
    noAudit: "હજુ કોઈ recorded activity નથી.",
    databaseUnavailable: "આ deployment પર database ઉપલબ્ધ નથી, એટલે reports બતાવી શકાતા નથી.",
    viewOnly: "આ account reports જોઈ શકે છે. CSV download અથવા audit trail માટે અલગ permission જરૂરી છે."
  }
} satisfies Record<AdminLocale, ReportsCopy>;

export function reportsCopy(locale: AdminLocale): ReportsCopy {
  return COPY[locale];
}
