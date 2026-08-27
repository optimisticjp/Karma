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

/** Public certificate check: the anti-fraud page every cert QR points to (plan 10.4). */
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

  return (
    <section className="section-compact">
      <div className="container-site max-w-2xl">
        <h1 className="text-h2 font-display">{t("title")}</h1>

        {!dbConfigured ? (
          <div className="card mt-8 border-marigold p-6 md:p-8">
            <p className="font-semibold">{t("unavailable")}</p>
            <p className="mt-2 font-mono text-smallmeta text-stone">{certNo}</p>
            <p className="mt-3 text-smallmeta">
              <a className="stitch-link font-semibold" href={`tel:+${site.whatsapp}`}>{site.phoneDisplay}</a>
            </p>
          </div>
        ) : cert ? (
          <div className="card mt-8 border-success p-6 md:p-8">
            <div className="flex items-center gap-4">
              <span className="seal-in flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 border-dashed border-success">
                <Icon name="check" size={26} className="text-success" strokeWidth={2} />
              </span>
              <div>
                <p className="text-h3 font-display text-success">{t("validTitle")}</p>
                <p className="mt-1 text-stone">{t("validBody")}</p>
              </div>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-smallmeta font-bold text-stone">{t("fields.name")}</dt>
                <dd className="font-semibold">{cert.studentName}</dd>
              </div>
              <div>
                <dt className="text-smallmeta font-bold text-stone">{t("fields.course")}</dt>
                <dd className="font-semibold">{cert.courseName}</dd>
              </div>
              <div>
                <dt className="text-smallmeta font-bold text-stone">{t("fields.date")}</dt>
                <dd className="font-semibold">{formatDate(cert.issuedOn, l)}</dd>
              </div>
              <div>
                <dt className="text-smallmeta font-bold text-stone">{t("fields.certNo")}</dt>
                <dd className="font-mono font-semibold">{cert.certNo}</dd>
              </div>
            </dl>
            {cert.status === "revoked" ? (
              <p className="mt-5 rounded-lg bg-error/10 p-3 font-semibold text-error">{t("revoked")}</p>
            ) : null}
          </div>
        ) : (
          <div className="card mt-8 border-error p-6 md:p-8">
            <p className="text-h3 font-display text-error">{t("invalidTitle")}</p>
            <p className="mt-2 font-mono text-smallmeta text-stone">{certNo}</p>
            <p className="u-lede">{t("invalidBody")}</p>
          </div>
        )}

        <p className="mt-8">
          <Link href="/verify" className="stitch-link font-semibold text-vermilion-deep">← {t("button")}</Link>
        </p>
      </div>
    </section>
  );
}
