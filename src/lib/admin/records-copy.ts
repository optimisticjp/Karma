import type { RecordEntity } from "./record-actions";

export type RecordsCopy = ReturnType<typeof en>;

const entityNamesEn: Record<RecordEntity, string> = {
  course: "course",
  batch: "batch",
  application: "enquiry",
  application_note: "follow-up note",
  student: "student",
  guardian: "guardian contact",
  enrollment: "enrolment",
  attendance_session: "attendance session",
  attendance_record: "attendance mark",
  attendance_correction: "attendance correction",
  fee_record: "fee entry",
  certificate: "certificate",
  service_enquiry: "design brief",
  content_item: "content item",
  staff: "account",
  staff_permission: "permission",
  audit_log: "audit entry"
};

const entityNamesGu: Record<RecordEntity, string> = {
  course: "કોર્સ",
  batch: "બેચ",
  application: "enquiry",
  application_note: "follow-up નોંધ",
  student: "student",
  guardian: "વાલીનો સંપર્ક",
  enrollment: "enrolment",
  attendance_session: "હાજરી સેશન",
  attendance_record: "હાજરીની નોંધ",
  attendance_correction: "હાજરી કરેક્શન",
  fee_record: "Fee entry",
  certificate: "સર્ટિફિકેટ",
  service_enquiry: "ડિઝાઇન બ્રીફ",
  content_item: "Content item",
  staff: "એકાઉન્ટ",
  staff_permission: "Permission",
  audit_log: "Audit entry"
};

const en = () => ({
  actions: "Actions",
  edit: "Edit",
  archive: "Archive",
  restore: "Restore",
  delete: "Delete permanently",
  archived: "Archived",
  showArchived: "Include archived",
  entityNames: entityNamesEn,

  deleteTitle: "Delete permanently",
  deleteLede:
    "This removes the record from the database. Archiving is almost always the better answer: it takes the record out of every operational list and keeps its history. Deleting keeps nothing except the audit entry written below.",
  ownerOnly: "Permanent deletion is available to the Owner only.",
  whatDepends: "What depends on this record",
  noDependencies: "Nothing else in the system points at this record.",
  blockedTitle: "This cannot be deleted yet",
  blockedBody:
    "The records below belong to this one and would be destroyed with it. Deal with them deliberately first — archive, reassign or delete them — and then come back.",
  lockedBody:
    "This attendance session has been locked. Locking is the moment a register became a record, so it can no longer be removed. Use a correction instead.",
  revokeFirstBody:
    "This certificate is still valid, and its verification link may be with an employer. Revoke it first — a link that 404s reads as a forgery, while a revoked certificate reads as what it is.",
  confirmIdentifier: "Type {identifier} to confirm",
  confirmWord: "Type DELETE to confirm",
  reasonLabel: "Why is this being deleted?",
  reasonHint: "Recorded in the audit log with your name, before the record is removed.",
  cancel: "Cancel",
  confirmDelete: "Delete permanently",
  deleting: "Deleting…",
  tombstoneNote:
    "An audit entry is written before the record is removed, with what it was and why you deleted it. It never contains a password, a token or any credential.",

  success: {
    archived: "Archived. Its history is intact and it can be restored.",
    restored: "Restored.",
    deleted: "Deleted permanently. The audit entry remains."
  },
  errors: {
    denied: "You do not have permission for this action.",
    invalid: "That request was not valid.",
    missing: "That record no longer exists.",
    blocked: "Other records depend on this one. Deal with them first.",
    confirm: "Type the confirmation exactly, and give a reason.",
    locked: "A locked attendance session cannot be deleted.",
    revokeFirst: "Revoke this certificate before deleting it.",
    generic: "That did not complete. Please try again."
  }
});

const gu = (): RecordsCopy => ({
  actions: "Actions",
  edit: "Edit કરો",
  archive: "Archive કરો",
  restore: "પાછું લાવો",
  delete: "કાયમ માટે delete કરો",
  archived: "Archived",
  showArchived: "Archived પણ બતાવો",
  entityNames: entityNamesGu,

  deleteTitle: "કાયમ માટે delete કરો",
  deleteLede:
    "આનાથી record database માંથી નીકળી જશે. મોટા ભાગે Archive કરવું જ સાચો રસ્તો છે: record દરેક operational list માંથી હટી જાય છે અને એની history સચવાઈ રહે છે. Delete કર્યા પછી નીચે લખાતી audit entry સિવાય કશું બચતું નથી.",
  ownerOnly: "કાયમી delete માત્ર Owner કરી શકે છે.",
  whatDepends: "આ record સાથે શું જોડાયેલું છે",
  noDependencies: "System માં બીજું કશું આ record તરફ ઇશારો કરતું નથી.",
  blockedTitle: "આ હમણાં delete થઈ શકે એમ નથી",
  blockedBody:
    "નીચેના records આ record ના છે અને એની સાથે નાશ પામશે. પહેલાં એમને સમજી-વિચારીને હેન્ડલ કરો — archive કરો, બીજે ખસેડો કે delete કરો — પછી અહીં પાછા આવો.",
  lockedBody:
    "આ હાજરી સેશન lock થઈ ગયું છે. Lock થવું એટલે register એ record બની ગયું, એટલે હવે એ કાઢી શકાય નહીં. એના બદલે correction વાપરો.",
  revokeFirstBody:
    "આ સર્ટિફિકેટ હજી માન્ય છે, અને એની verification link કોઈ employer પાસે હોઈ શકે. પહેલાં revoke કરો — 404 થતી link બનાવટી લાગે છે, જ્યારે revoke થયેલું સર્ટિફિકેટ જે છે એ જ દેખાય છે.",
  confirmIdentifier: "Confirm કરવા {identifier} ટાઇપ કરો",
  confirmWord: "Confirm કરવા DELETE ટાઇપ કરો",
  reasonLabel: "આ કેમ delete થાય છે?",
  reasonHint: "Record નીકળે એ પહેલાં તમારા નામ સાથે audit log માં નોંધાય છે.",
  cancel: "રહેવા દો",
  confirmDelete: "કાયમ માટે delete કરો",
  deleting: "Delete થાય છે…",
  tombstoneNote:
    "Record નીકળે એ પહેલાં audit entry લખાય છે — શું હતું અને તમે કેમ delete કર્યું. એમાં password, token કે કોઈ credential ક્યારેય નથી હોતું.",

  success: {
    archived: "Archive થઈ ગયું. History સચવાયેલી છે અને પાછું લાવી શકાય છે.",
    restored: "પાછું આવી ગયું.",
    deleted: "કાયમ માટે delete થઈ ગયું. Audit entry રહે છે."
  },
  errors: {
    denied: "આ કામ કરવાની permission નથી.",
    invalid: "આ request બરાબર નથી.",
    missing: "આ record હવે નથી.",
    blocked: "બીજા records આના પર આધારિત છે. પહેલાં એ હેન્ડલ કરો.",
    confirm: "Confirmation બરાબર એ જ રીતે ટાઇપ કરો, અને કારણ લખો.",
    locked: "Lock થયેલું હાજરી સેશન delete થઈ શકે નહીં.",
    revokeFirst: "Delete કરતાં પહેલાં આ સર્ટિફિકેટ revoke કરો.",
    generic: "આ પૂરું થયું નથી. ફરી try કરો."
  }
});

export function recordsCopy(locale: "en" | "gu"): RecordsCopy {
  return locale === "gu" ? gu() : en();
}
