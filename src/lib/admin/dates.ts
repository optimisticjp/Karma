/**
 * Dates that mean "today" to staff.
 *
 * The Worker's clock is UTC; the studio is in Surat. Between 00:00 and 05:30
 * IST those are different days, which is the window in which an attendance
 * register, a follow-up due date or a design deadline would silently belong to
 * yesterday. Every console surface that asks "what is today" asks here.
 *
 * This existed as an identical one-liner in three files. It is one file now
 * because a fourth copy was about to be written for the batches page, and a
 * timezone rule that lives in four places is a timezone rule that will
 * eventually disagree with itself.
 */
export function kolkataDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}
