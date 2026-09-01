import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCertificate } from "@/lib/db/queries";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false, follow: false } };
}

/**
 * THE ANSWER.
 *
 * The anti-fraud page every certificate QR points to. It says one word first —
 * verified, not found, or unavailable — and then shows the record behind it.
 *
 * THREE SIGNALS, NEVER ONE
 * ------------------------
 * The verdict carries a word, an icon and a rule down its left edge. Colour is
 * the fourth signal and never the only one, because this page gets printed,
 * forwarded and read on a cracked phone in daylight.
 *
 * NOTHING MOVES. The result used to arrive inside a `seal-in` animation on a
 * dashed circle: a certificate stamping itself is precisely the gesture a fake
 * one would make. `tests/machine-lab-secondary.test.tsx` holds the rule.
 *
 * "NOT FOUND" IS NOT AN ACCUSATION. A number that does not resolve can be a
 * typo, an old paper certificate, or a record not yet entered — so the copy
 * sends the reader to the studio's phone rather than concluding anything about
 * the person holding the certificate.
 */
export default async function VerifyResultPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("verifyPage");
  const l = await getLocale();
  const certNo = decodeURIComponent(id).toUpperCase();

  const dbConfigured = getDb() !== null;
  const cert = dbConfigured ? await getCertificate(certNo) : null;

  const state = !dbConfigured ? "wait" : cert ? "ok" : "bad";
  /* The heading is a WORD, and the sentence sits under it. Setting the long
     "records system is coming online" line as the heading made a paragraph
     look like a verdict. */
  const heading =
    state === "wait"
      ? t("unavailableTitle")
      : state === "ok"
        ? t("validTitle")
        : t("invalidTitle");
  const body = state === "wait" ? t("unavailable") : state === "ok" ? t("validBody") : t("invalidBody");
  const mark = state === "wait" ? "phone" : state === "ok" ? "check" : "misregistration";

  return (
    <section className="band on-mist" aria-labelledby="verdict-heading">
      <div className="wrap">
        <div className="reading-shell">
          <p className="t-micro">{t("eyebrow")}</p>

          <div className={`verdict verdict-${state} mt-4`}>
            <span className="verdict-mark" aria-hidden="true">
              <Icon name={mark} size={22} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h1 id="verdict-heading" className="t-h3">
                {heading}
              </h1>
              <p className="t-body mt-2">{body}</p>
              <p className="t-meta cert-no mt-3">{certNo}</p>

              {cert ? (
                <dl className="cert-fields">
                  <div>
                    <dt className="t-micro">{t("fields.name")}</dt>
                    <dd className="t-body mt-1">{cert.studentName}</dd>
                  </div>
                  <div>
                    <dt className="t-micro">{t("fields.course")}</dt>
                    <dd className="t-body mt-1">{cert.courseName}</dd>
                  </div>
                  <div>
                    <dt className="t-micro">{t("fields.date")}</dt>
                    <dd className="t-body numeric mt-1">{formatDate(cert.issuedOn, l)}</dd>
                  </div>
                  <div>
                    <dt className="t-micro">{t("fields.certNo")}</dt>
                    <dd className="t-body cert-no mt-1">{cert.certNo}</dd>
                  </div>
                </dl>
              ) : null}

              {cert?.status === "revoked" ? (
                <p className="form-callout mt-4">{t("revoked")}</p>
              ) : null}
            </div>
          </div>

          {/* Whatever the verdict, the studio's phone is the next step. */}
          <p className="t-meta mt-5">
            <a className="act-quiet" href={`tel:+${site.whatsapp}`}>
              <Icon name="phone" size={15} /> {site.phoneDisplay}
            </a>
          </p>

          <p className="mt-6">
            <Link href="/verify" className="act act-secondary">
              {t("again")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
