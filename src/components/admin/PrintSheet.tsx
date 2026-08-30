import Link from "next/link";
import { site } from "@/lib/site";
import { PrintTrigger } from "./PrintTrigger";
import { TRAINING_CENTRE_LINE_EN, TRAINING_CENTRE_LINE_GU } from "@/content/course-operations";

/**
 * The frame every printed Karma sheet shares: the institute's own letterhead,
 * a document title, the content, and a footer that says which sheet this is and
 * when it came off the printer.
 *
 * The toolbar is the one thing on the page that is not part of the sheet, and
 * the first thing `@media print` removes.
 */
export function PrintSheet({
  title,
  reference,
  locale,
  landscape,
  backHref,
  backLabel,
  printLabel,
  footerNote,
  children
}: {
  title: string;
  /** The document's own number — an admission no., a receipt no., a batch. */
  reference?: string;
  locale: "en" | "gu";
  landscape?: boolean;
  backHref: string;
  backLabel: string;
  printLabel: string;
  footerNote?: string;
  children: React.ReactNode;
}) {
  const gu = locale === "gu";
  const printedOn = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

  return (
    <>
      <div className="sheet-toolbar">
        <Link href={backHref}>← {backLabel}</Link>
        {/* A tiny client island rather than making every sheet a client
            component — the sheets stay server-rendered, which is what keeps a
            roster of eighty students out of the browser bundle. */}
        <PrintTrigger label={printLabel} />
        <span className="sheet-note">{landscape ? "A4 landscape" : "A4 portrait"}</span>
      </div>

      <div className={`sheet ${landscape ? "is-landscape" : ""}`}>
        <header className="sheet-head">
          <p className="sheet-brand">Karma Design Studio</p>
          <p className="sheet-centre">{gu ? TRAINING_CENTRE_LINE_GU : TRAINING_CENTRE_LINE_EN}</p>
          <p className="sheet-address">
            {gu ? site.addressGu : site.addressEn} · {site.callPhoneDisplay} · {site.email}
          </p>
          <p className="sheet-doc-title">{title}</p>
          {reference ? <p className="sheet-note">{reference}</p> : null}
        </header>

        {children}

        <footer className="sheet-foot">
          <span>{site.legalName}</span>
          {footerNote ? <span>{footerNote}</span> : null}
          <span>{printedOn} IST</span>
        </footer>
      </div>
    </>
  );
}

