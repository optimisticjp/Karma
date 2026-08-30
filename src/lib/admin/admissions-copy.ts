import type { AdminLocale } from "@/lib/admin/i18n";
import type { ApplicationStatus, ManualEnquirySource } from "@/lib/admin/admissions";

export type AdmissionsCopy = {
  title: string;
  lede: string;
  addEnquiry: string;
  addEnquiryHint: string;
  enquirySource: string;
  fullName: string;
  mobile: string;
  email: string;
  language: string;
  gujarati: string;
  english: string;
  courseInterest: string;
  noCourseYet: string;
  timing: string;
  timingChoose: string;
  morning: string;
  evening: string;
  area: string;
  ageBand: string;
  ageChoose: string;
  guardianName: string;
  guardianPhone: string;
  fatherName: string;
  referenceName: string;
  referencePhone: string;
  guardianEnquiryHint: string;
  enquiryNote: string;
  enquiryNotePlaceholder: string;
  createEnquiry: string;
  creating: string;
  sourceLabels: Record<ManualEnquirySource, string>;
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
  viewOnly: string;
  statuses: Record<ApplicationStatus, string>;
  errors: Record<"denied" | "invalid" | "missing" | "generic", string>;
  success: Record<"updated" | "noteAdded" | "created", string>;
};

const COPY = {
  en: {
    title: "Admissions",
    lede: "Keep every enquiry in one place — website, walk-in, phone, WhatsApp or referral — and always know who needs a follow-up next.",
    addEnquiry: "Add enquiry",
    addEnquiryHint: "Use this at the front desk for walk-ins, calls and WhatsApp enquiries. A website form is not required.",
    enquirySource: "How did this enquiry come?",
    fullName: "Name",
    mobile: "WhatsApp / mobile",
    email: "Email (optional)",
    language: "Preferred language",
    gujarati: "Gujarati",
    english: "English",
    courseInterest: "Course interest",
    noCourseYet: "Not decided yet",
    timing: "Preferred timing",
    timingChoose: "Not decided",
    morning: "Morning",
    evening: "Evening",
    area: "Area / locality",
    ageBand: "Age group",
    ageChoose: "Not recorded",
    guardianName: "Parent / guardian name",
    guardianPhone: "Parent / guardian mobile",
    fatherName: "Father's name",
    referenceName: "Reference name",
    referencePhone: "Reference mobile",
    guardianEnquiryHint:
      "Record a parent or guardian number whenever you have it. It becomes required at admission, so asking now saves a call later. Reference details are optional.",
    enquiryNote: "What are they looking for?",
    enquiryNotePlaceholder: "Example: wants machine practice, will visit on Sunday, asked about evening batch",
    createEnquiry: "Save enquiry",
    creating: "Saving enquiry…",
    sourceLabels: {
      walk_in: "Walk-in / studio visit",
      phone: "Phone call",
      whatsapp: "WhatsApp",
      referral: "Referral",
      instagram: "Instagram",
      google: "Google",
      other: "Other"
    },
    visible: "Enquiries shown",
    newApplications: "New enquiries",
    followUpsDue: "Follow-ups due",
    search: "Search",
    searchPlaceholder: "Name, reference or mobile",
    statusFilter: "Stage",
    allStatuses: "All stages",
    applyFilters: "Show",
    clearFilters: "Clear",
    empty: "No enquiries match these filters.",
    duplicate: "Repeat mobile",
    course: "Course interest",
    experience: "Experience",
    occupation: "Occupation",
    goal: "Enquiry note",
    source: "Source",
    applicant: "Enquiry",
    guardian: "Parent / guardian",
    created: "Received",
    assignedTo: "Handled by",
    unassigned: "Not assigned",
    nextFollowUp: "Next follow-up",
    closureReason: "Reason if not joining / closed",
    save: "Save changes",
    saving: "Saving…",
    notes: "Follow-up notes",
    noNotes: "No follow-up notes yet.",
    addNote: "Add follow-up note",
    notePlaceholder: "What happened on the call or visit? What should happen next?",
    viewOnly: "You can view enquiries. Updates require Applications manage permission.",
    statuses: {
      new: "New",
      contacted: "Contacted",
      demo_scheduled: "Demo booked",
      visit_done: "Visited studio",
      accepted: "Ready to join",
      waitlisted: "Waiting for batch",
      documents_pending: "Details pending",
      enrolled: "Joined",
      not_proceeding: "Not joining",
      closed: "Closed"
    },
    errors: {
      denied: "You do not have permission for this action.",
      invalid: "Please check the details and try again.",
      missing: "That enquiry, course or staff member could not be found. Reload and try again.",
      generic: "Could not save this right now. Please try again."
    },
    success: {
      updated: "Enquiry updated.",
      noteAdded: "Follow-up note added.",
      created: "Enquiry added."
    }
  },
  gu: {
    title: "Admissions",
    lede: "Website, walk-in, phone, WhatsApp કે referral — દરેક enquiry એક જ જગ્યાએ રાખો અને હવે કોને follow-up કરવાનું છે એ તરત જુઓ.",
    addEnquiry: "નવી Enquiry ઉમેરો",
    addEnquiryHint: "Walk-in, call કે WhatsApp enquiry માટે front desk પરથી અહીં જ entry કરો. Website form આવવું જરૂરી નથી.",
    enquirySource: "Enquiry ક્યાંથી આવી?",
    fullName: "નામ",
    mobile: "WhatsApp / Mobile",
    email: "Email (optional)",
    language: "પસંદની ભાષા",
    gujarati: "ગુજરાતી",
    english: "English",
    courseInterest: "કયા Courseમાં રસ છે?",
    noCourseYet: "હજુ નક્કી નથી",
    timing: "પસંદનો સમય",
    timingChoose: "હજુ નક્કી નથી",
    morning: "સવાર",
    evening: "સાંજ",
    area: "Area / locality",
    ageBand: "ઉંમર group",
    ageChoose: "નોંધ્યું નથી",
    guardianName: "માતા-પિતા / વાલીનું નામ",
    guardianPhone: "માતા-પિતા / વાલીનો મોબાઇલ",
    fatherName: "પિતાનું નામ",
    referenceName: "રેફરન્સનું નામ",
    referencePhone: "રેફરન્સનો મોબાઇલ",
    guardianEnquiryHint:
      "માતા-પિતા કે વાલીનો નંબર મળે ત્યારે નોંધી લો. એડમિશન વખતે એ ફરજિયાત છે, એટલે અત્યારે પૂછી લેવાથી પછી એક કૉલ બચે છે. રેફરન્સની વિગત વૈકલ્પિક છે.",
    enquiryNote: "શું શીખવું / કરવું છે?",
    enquiryNotePlaceholder: "ઉદાહરણ: machine practice જોઈએ, Sunday visit કરશે, evening batch વિશે પૂછ્યું",
    createEnquiry: "Enquiry Save કરો",
    creating: "Enquiry save થઈ રહી છે…",
    sourceLabels: {
      walk_in: "Walk-in / Studio visit",
      phone: "Phone call",
      whatsapp: "WhatsApp",
      referral: "Referral",
      instagram: "Instagram",
      google: "Google",
      other: "Other"
    },
    visible: "દેખાતી enquiries",
    newApplications: "નવી enquiries",
    followUpsDue: "આજે follow-up",
    search: "શોધો",
    searchPlaceholder: "નામ, reference કે mobile",
    statusFilter: "Stage",
    allStatuses: "બધા stages",
    applyFilters: "બતાવો",
    clearFilters: "સાફ કરો",
    empty: "આ filter પ્રમાણે કોઈ enquiry નથી.",
    duplicate: "આ mobile પહેલાં આવ્યો છે",
    course: "Course interest",
    experience: "Experience",
    occupation: "Occupation",
    goal: "Enquiry note",
    source: "ક્યાંથી આવી",
    applicant: "Enquiry",
    guardian: "Parent / Guardian",
    created: "મળ્યાનો સમય",
    assignedTo: "કોણ handle કરે છે",
    unassigned: "કોઈને assign નથી",
    nextFollowUp: "આગળનો follow-up",
    closureReason: "Join ન કરે / close કરવાનું કારણ",
    save: "ફેરફાર Save કરો",
    saving: "Save થઈ રહ્યું છે…",
    notes: "Follow-up notes",
    noNotes: "હજુ follow-up note નથી.",
    addNote: "Follow-up note ઉમેરો",
    notePlaceholder: "Call કે visitમાં શું વાત થઈ? હવે આગળ શું કરવાનું છે?",
    viewOnly: "તમે enquiries જોઈ શકો છો. ફેરફાર માટે Applications manage permission જોઈએ.",
    statuses: {
      new: "નવી",
      contacted: "વાત થઈ",
      demo_scheduled: "Demo booked",
      visit_done: "Studio visit થઈ",
      accepted: "Join કરવા તૈયાર",
      waitlisted: "Batchની રાહમાં",
      documents_pending: "Details બાકી",
      enrolled: "Join થઈ ગયું",
      not_proceeding: "Join નથી કરવું",
      closed: "Closed"
    },
    errors: {
      denied: "આ કામ કરવાની permission નથી.",
      invalid: "માહિતી ચેક કરીને ફરી try કરો.",
      missing: "આ enquiry, course કે staff member મળ્યો નથી. Reload કરીને ફરી try કરો.",
      generic: "હમણાં save થઈ શક્યું નથી. ફરી try કરો."
    },
    success: {
      updated: "Enquiry update થઈ.",
      noteAdded: "Follow-up note ઉમેરાયો.",
      created: "Enquiry ઉમેરાઈ ગઈ."
    }
  }
} satisfies Record<AdminLocale, AdmissionsCopy>;

export function admissionsCopy(locale: AdminLocale): AdmissionsCopy {
  return COPY[locale];
}
