import type { AdminLocale } from "@/lib/admin/i18n";
import type { ApplicationStatus } from "@/lib/admin/admissions";

export type AdmissionsCopy = {
  title: string;
  lede: string;
  visible: string;
  newApplications: string;
  followUpsDue: string;
  search: string;
  searchPlaceholder: string;
  statusFilter: string;
  allStatuses: string;
  applyFilters: string;
  clearFilters: string;
  empty: string;
  duplicate: string;
  course: string;
  timing: string;
  area: string;
  experience: string;
  occupation: string;
  goal: string;
  source: string;
  applicant: string;
  guardian: string;
  created: string;
  assignedTo: string;
  unassigned: string;
  nextFollowUp: string;
  closureReason: string;
  save: string;
  saving: string;
  notes: string;
  noNotes: string;
  addNote: string;
  notePlaceholder: string;
  statuses: Record<ApplicationStatus, string>;
  errors: Record<"denied" | "invalid" | "missing" | "generic", string>;
  success: Record<"updated" | "noteAdded", string>;
};

const COPY = {
  en: {
    title: "Admissions CRM",
    lede: "Work every admission enquiry from first contact to a clear outcome. Assign ownership, schedule the next follow-up, and keep a durable note trail.",
    visible: "Visible applications",
    newApplications: "New",
    followUpsDue: "Follow-ups due",
    search: "Search",
    searchPlaceholder: "Name, reference or WhatsApp",
    statusFilter: "Status",
    allStatuses: "All statuses",
    applyFilters: "Apply filters",
    clearFilters: "Clear",
    empty: "No applications match these filters yet.",
    duplicate: "Repeat phone",
    course: "Course interest",
    timing: "Preferred timing",
    area: "Area",
    experience: "Experience",
    occupation: "Occupation",
    goal: "Goal / note from applicant",
    source: "Heard from",
    applicant: "Applicant",
    guardian: "Guardian",
    created: "Received",
    assignedTo: "Assigned to",
    unassigned: "Unassigned",
    nextFollowUp: "Next follow-up",
    closureReason: "Closure reason",
    save: "Save application",
    saving: "Saving…",
    notes: "Staff notes",
    noNotes: "No staff notes yet.",
    addNote: "Add note",
    notePlaceholder: "What happened, what was promised, or what needs to happen next",
    statuses: {
      new: "New",
      contacted: "Contacted",
      demo_scheduled: "Demo scheduled",
      visit_done: "Visit done",
      accepted: "Accepted",
      waitlisted: "Waitlisted",
      documents_pending: "Documents pending",
      enrolled: "Enrolled",
      not_proceeding: "Not proceeding",
      closed: "Closed"
    },
    errors: {
      denied: "You do not have permission to make that change.",
      invalid: "Check the fields and try again.",
      missing: "That application or assignee no longer exists. Reload and try again.",
      generic: "That did not work. Try again."
    },
    success: {
      updated: "Application updated.",
      noteAdded: "Note added."
    }
  },
  gu: {
    title: "એડમિશન CRM",
    lede: "દરેક admission enquiry ને પહેલા contact થી અંતિમ outcome સુધી સંભાળો. જવાબદારી assign કરો, next follow-up ગોઠવો અને staff notes નો સ્પષ્ટ record રાખો.",
    visible: "દેખાતી અરજીઓ",
    newApplications: "નવી",
    followUpsDue: "Follow-up બાકી",
    search: "શોધો",
    searchPlaceholder: "નામ, reference અથવા WhatsApp",
    statusFilter: "Status",
    allStatuses: "બધા status",
    applyFilters: "Filter લાગુ કરો",
    clearFilters: "સાફ કરો",
    empty: "આ filters માટે કોઈ application નથી.",
    duplicate: "ફોન ફરી આવ્યો",
    course: "કોર્સ રસ",
    timing: "પસંદનો સમય",
    area: "વિસ્તાર",
    experience: "અનુભવ",
    occupation: "વ્યવસાય",
    goal: "Applicant નો goal / note",
    source: "ક્યાંથી જાણ્યું",
    applicant: "Applicant",
    guardian: "Guardian",
    created: "મળ્યાની તારીખ",
    assignedTo: "જવાબદારી",
    unassigned: "કોઈને assign નથી",
    nextFollowUp: "આગળનો follow-up",
    closureReason: "બંધ કરવાનો કારણ",
    save: "Application સાચવો",
    saving: "સાચવી રહ્યું છે…",
    notes: "Staff notes",
    noNotes: "હજુ staff note નથી.",
    addNote: "Note ઉમેરો",
    notePlaceholder: "શું થયું, શું વચન આપ્યું, અથવા હવે શું કરવાનું છે",
    statuses: {
      new: "નવી",
      contacted: "Contacted",
      demo_scheduled: "Demo ગોઠવ્યો",
      visit_done: "Visit પૂર્ણ",
      accepted: "Accepted",
      waitlisted: "Waitlist",
      documents_pending: "Documents બાકી",
      enrolled: "Enrolled",
      not_proceeding: "આગળ નથી વધતા",
      closed: "Closed"
    },
    errors: {
      denied: "આ ફેરફાર કરવાની પરવાનગી તમારા account પાસે નથી.",
      invalid: "બધી વિગતો તપાસીને ફરી પ્રયાસ કરો.",
      missing: "આ application અથવા assignee હવે ઉપલબ્ધ નથી. Reload કરીને ફરી પ્રયાસ કરો.",
      generic: "ફેરફાર સાચવાયો નથી. ફરી પ્રયાસ કરો."
    },
    success: {
      updated: "Application અપડેટ થઈ.",
      noteAdded: "Note ઉમેરાયો."
    }
  }
} satisfies Record<AdminLocale, AdmissionsCopy>;

export function admissionsCopy(locale: AdminLocale): AdmissionsCopy {
  return COPY[locale];
}
