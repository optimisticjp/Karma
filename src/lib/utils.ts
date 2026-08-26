export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(d: string | Date, locale: string) {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function pad(n: number, width = 4) {
  return String(n).padStart(width, "0");
}
