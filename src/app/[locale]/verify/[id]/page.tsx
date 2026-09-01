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

/** Certificate verification deliberately distinguishes an issued certificate
 * from a revoked one. A revoked record remains visible for auditability, but
 * must never receive the green "Verified" verdict. */
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

  const state = !dbConfigured
    ? "wait"
    : cert?.status === "revoked"
      ? "revoked"
      : cert
        ? "ok"
        : "bad";
  const heading =
    state === "wait"
      ? t("unavailableTitle")
      : state === "revoked"
        ? l === "gu"
          ? "રદ કરાયેલ"
          : "Revoked"
        : state === "ok"
          ? t("validTitle")
          : t("invalidTitle");
  const body =
    state === "wait"
      ? t("unavailable")
      : state === "revoked"
        ? t("revoked")
        : state === "ok"
          ? t("validBody")
          : t("invalidBody");
  const mark = state === "wait" ? "phone" : state === "ok" ? "check" : "misregistration";
  const visualState = state === "revoked" ? "bad" : state;

  return (
    <section className="band on-mist" aria-labelledby="verdict-heading">
      <div className="wrap">
        <div className="reading-shell">
          <p className="t-micro">{t("eyebrow")}</p>

          <div className={`verdict verdict-${visualState} mt-4`}>
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
            </div>
          </div>

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
