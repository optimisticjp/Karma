export type ConsoleCopy = ReturnType<typeof en>;

const en = () => ({
  sections: {
    frontDesk: "Front desk",
    studio: "Classes & studio",
    other: "Other work",
    administration: "Administration"
  },
  primary: {
    newAdmission: "New admission",
    reviewAdmissions: "Review enquiries",
    collectFee: "Collect fee"
  },
  language: {
    label: "Admin language",
    hint: "Changes only the staff console"
  },
  home: {
    startTitle: "Start here",
    startHint: "The four jobs staff use most often.",
    newAdmission: "New admission",
    newAdmissionHint: "Create the student, choose a batch and set their fee agreement.",
    collectFee: "Collect fee",
    collectFeeHint: "Find a student and record the money received today.",
    attendance: "Mark attendance",
    attendanceHint: "Open today’s batch register and mark the class.",
    findStudent: "Find a student",
    findStudentHint: "Search by name, admission number or mobile.",
    reviewAdmissions: "Review enquiries",
    reviewAdmissionsHint: "Call new applicants and schedule the next follow-up.",
    attentionTitle: "Needs attention",
    attentionHint: "These numbers are clickable. Zero means nothing is waiting.",
    newApplications: "New enquiries",
    followUps: "Follow-ups due",
    overdueFees: "Fees overdue",
    runningBatches: "Batches running",
    nextTitle: "Next up",
    nextHint: "Open a row and continue the work without hunting through menus.",
    otherTitle: "Other work",
    activityTitle: "Recent admin activity",
    allClear: "All clear",
    noDailyWork: "No front-desk actions are assigned to this account."
  }
});

const gu = () => ({
  sections: {
    frontDesk: "Front desk",
    studio: "Classes & studio",
    other: "બીજું કામ",
    administration: "Administration"
  },
  primary: {
    newAdmission: "નવું admission",
    reviewAdmissions: "Enquiries જુઓ",
    collectFee: "Fee લો"
  },
  language: {
    label: "Admin ભાષા",
    hint: "ફક્ત staff console બદલાય છે"
  },
  home: {
    startTitle: "અહીંથી શરૂ કરો",
    startHint: "Staff રોજ સૌથી વધુ કરતા ચાર કામ.",
    newAdmission: "નવું admission",
    newAdmissionHint: "Student બનાવો, batch પસંદ કરો અને તેની fee નક્કી કરો.",
    collectFee: "Fee લો",
    collectFeeHint: "Student શોધો અને આજે મળેલી રકમ નોંધો.",
    attendance: "Attendance ભરો",
    attendanceHint: "આજનો batch register ખોલીને attendance ભરો.",
    findStudent: "Student શોધો",
    findStudentHint: "નામ, admission number કે mobileથી શોધો.",
    reviewAdmissions: "Enquiries જુઓ",
    reviewAdmissionsHint: "નવા applicantsને call કરો અને આગળનો follow-up મૂકો.",
    attentionTitle: "હમણાં ધ્યાન આપવાનું",
    attentionHint: "આ numbers પર tap કરી શકો છો. Zero એટલે કંઈ pending નથી.",
    newApplications: "નવી enquiries",
    followUps: "Follow-ups due",
    overdueFees: "Fees overdue",
    runningBatches: "ચાલતા batches",
    nextTitle: "આગળ શું કરવું",
    nextHint: "Row ખોલો અને menuમાં શોધ્યા વગર સીધું કામ ચાલુ રાખો.",
    otherTitle: "બીજું કામ",
    activityTitle: "Recent admin activity",
    allClear: "બધું clear",
    noDailyWork: "આ accountને front-deskના daily actions આપેલા નથી."
  }
});

export function consoleCopy(locale: "en" | "gu"): ConsoleCopy {
  return locale === "gu" ? gu() : en();
}
