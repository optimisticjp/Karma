import type { FeeMethod } from "./fees";

export type FeesCopy = ReturnType<typeof en>;

const en = () => ({
  title: "Fees",
  lede: "A simple offline ledger for what was agreed, what was received and what is still due. No online payment happens here.",
  search: "Search student",
  searchPlaceholder: "Name, admission no. or mobile",
  all: "All",
  pendingOnly: "Pending only",
  show: "Show",
  totalAgreed: "Net fees",
  totalReceived: "Received",
  totalPending: "Pending",
  empty: "No enrollments match this view.",
  courseFee: "Agreed course fee",
  discount: "Discount",
  receivedNow: "Received now",
  method: "Received by",
  receiptNo: "Receipt no. (optional)",
  dueDate: "Next due date",
  notes: "Fee note",
  recordPayment: "Record fee / payment",
  save: "Add ledger entry",
  saving: "Saving…",
  paid: "Paid",
  due: "Due",
  noLedger: "Fee terms not entered yet.",
  history: "Payment history",
  receipt: "Receipt",
  methods: { cash: "Cash", upi: "UPI received", bank: "Bank transfer", other: "Other" } satisfies Record<FeeMethod, string>,
  viewOnly: "You can view fee status. Recording money requires Fees manage permission.",
  success: { saved: "Fee entry recorded." },
  errors: {
    denied: "You do not have permission for this action.",
    invalid: "Check the fee amounts and try again.",
    missing: "That enrollment could not be found.",
    overpaid: "Received amount would be more than the agreed net fee. Check the amounts first.",
    generic: "Could not save the fee entry right now. Please try again."
  }
});

const gu = () => ({
  title: "Fees",
  lede: "કેટલી fee નક્કી થઈ, કેટલી રકમ મળી અને કેટલી બાકી છે — તેનો સરળ offline ledger. અહીં online payment લેવાતું નથી.",
  search: "Student શોધો",
  searchPlaceholder: "નામ, admission no. કે mobile",
  all: "બધા",
  pendingOnly: "ફક્ત બાકી",
  show: "બતાવો",
  totalAgreed: "Net fees",
  totalReceived: "મળેલ રકમ",
  totalPending: "બાકી",
  empty: "આ viewમાં કોઈ enrollment નથી.",
  courseFee: "નક્કી થયેલી Course fee",
  discount: "Discount",
  receivedNow: "હમણાં મળેલ રકમ",
  method: "કઈ રીતે મળ્યું",
  receiptNo: "Receipt no. (optional)",
  dueDate: "આગળની due date",
  notes: "Fees note",
  recordPayment: "Fee / Payment નોંધો",
  save: "Ledger entry ઉમેરો",
  saving: "Save થઈ રહ્યું છે…",
  paid: "મળ્યું",
  due: "બાકી",
  noLedger: "Feesની માહિતી હજી નાખેલી નથી.",
  history: "Payment history",
  receipt: "Receipt",
  methods: { cash: "Cash", upi: "UPI મળ્યું", bank: "Bank transfer", other: "Other" } satisfies Record<FeeMethod, string>,
  viewOnly: "તમે fees status જોઈ શકો છો. રકમ નોંધવા Fees manage permission જોઈએ.",
  success: { saved: "Fee entry record થઈ ગઈ." },
  errors: {
    denied: "આ કામ કરવાની permission નથી.",
    invalid: "Fee amounts ચેક કરીને ફરી try કરો.",
    missing: "આ enrollment મળ્યું નથી.",
    overpaid: "મળેલ રકમ net fee કરતાં વધારે થઈ જાય છે. Amounts ચેક કરો.",
    generic: "હમણાં fee entry save થઈ શકી નથી. ફરી try કરો."
  }
});

export function feesCopy(locale: "en" | "gu"): FeesCopy { return locale === "gu" ? gu() : en(); }
