import { StitchRule } from "@/components/ui/StitchPath";
import { Icon } from "@/components/ui/Icon";
import type { VerifiedCourseOperations } from "@/content/course-operations";
import { slotHours } from "@/lib/admin/course-operations";

type Copy = {
  factsTitle: string;
  durationLabel: string;
  durationValue: string;
  softwareLabel: string;
  softwareNote: string;
  demoLabel: string;
  demoValue: string;
  batchTitle: string;
  batchSub: string;
  hours: (n: number) => string;
  demoTitle: string;
  demoSub: string;
  teachTitle: string;
  teachSub: string;
  practicalTitle: string;
  feeTitle: string;
  feeTotal: string;
  feeAdmission: string;
  feeBalance: string;
  feeBalanceNote: string;
  feeOffline: string;
};

const rupees = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

/**
 * The verified operational facts for a course, as the institute states them.
 *
 * Rendered ONLY for a course that has them (today: EMCAD DAHAO Embroidery
 * Designing). Every other course keeps the honest "ask at your demo" copy,
 * because their durations and fees are still unconfirmed.
 *
 * The fee block is deliberately plain and complete — total, what is due at
 * admission, what remains and by when. Transparency, not a pricing table: there
 * is no gateway, no checkout, no payment link and no UPI request anywhere here,
 * and none is to be added.
 */
export function CourseOperations({
  verified,
  locale,
  copy
}: {
  verified: VerifiedCourseOperations;
  locale: "en" | "gu";
  copy: Copy;
}) {
  const gu = locale === "gu";
  const ops = verified.operations;
  const balance = Math.max(0, verified.fees.feeTotal - verified.fees.feeAdmission);

  return (
    <section className="section bg-ivory-2">
      <div className="container-site">
        <p className="microlabel">{copy.factsTitle}</p>
        
        <dl className="ledger mt-7">
          <div className="ledger-row is-labelled">
            <dt className="ledger-title !text-smallmeta">{copy.durationLabel}</dt>
            <dd className="ledger-note !mt-0 font-semibold !text-carbon">{copy.durationValue}</dd>
          </div>
          <div className="ledger-row is-labelled">
            <dt className="ledger-title !text-smallmeta">{copy.softwareLabel}</dt>
            <dd className="ledger-note !mt-0 font-semibold !text-carbon">
              {verified.software}
              <span className="block font-normal text-stone">{copy.softwareNote}</span>
            </dd>
          </div>
          {ops.demo ? (
            <div className="ledger-row is-labelled">
              <dt className="ledger-title !text-smallmeta">{copy.demoLabel}</dt>
              <dd className="ledger-note !mt-0 font-semibold !text-carbon">{copy.demoValue}</dd>
            </div>
          ) : null}
        </dl>

        {ops.scheduleOptions.length ? (
          <div className="mt-4 md:mt-8">
            <h2 className="text-h3 font-display">{copy.batchTitle}</h2>
            <p className="u-section-body text-stone">{copy.batchSub}</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ops.scheduleOptions.map((slot) => (
                <li key={slot.key} className="border border-line bg-card p-4">
                  <p className="font-display text-h4 leading-tight">
                    {slot.startTime} – {slot.endTime}
                  </p>
                  <p className="form-note mt-1.5">
                    {copy.hours(slotHours(slot.startTime, slot.endTime))}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {ops.demo && ops.demo.slots.length ? (
          <div className="mt-4 md:mt-8">
            <h2 className="text-h3 font-display">{copy.demoTitle}</h2>
            <p className="u-section-body text-stone">{copy.demoSub}</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ops.demo.slots.map((slot) => (
                <li key={slot.key} className="border border-line bg-card p-4">
                  <p className="font-semibold">
                    {slot.startTime} – {slot.endTime}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {ops.curriculum.length ? (
          <div className="mt-4 split md:mt-8">
            <div>
              <h2 className="text-h3 font-display">{copy.teachTitle}</h2>
                            <p className="u-section-body text-stone">{copy.teachSub}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {ops.curriculum.map((item) => (
                  <li key={item.en} className="flex gap-3">
                    <Icon
                      name="check"
                      size={18}
                      className="mt-1.5 shrink-0 text-success"
                      strokeWidth={2}
                    />
                    <span>{gu ? item.gu : item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-h3 font-display">{copy.practicalTitle}</h2>
                            <ul className="mt-2 space-y-1.5">
                {ops.practical.map((item) => (
                  <li key={item.en} className="flex gap-3">
                    <Icon
                      name="check"
                      size={18}
                      className="mt-1.5 shrink-0 text-success"
                      strokeWidth={2}
                    />
                    <span>{gu ? item.gu : item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="mt-4 md:mt-8">
          <h2 className="text-h3 font-display">{copy.feeTitle}</h2>
          <StitchRule draw className="mt-2 max-w-[4.5rem]" />
          <dl className="ledger mt-6 max-w-2xl">
            <div className="ledger-row is-labelled">
              <dt className="ledger-title !text-smallmeta">{copy.feeTotal}</dt>
              <dd className="ledger-note !mt-0 font-semibold !text-carbon">
                {rupees(verified.fees.feeTotal)}
              </dd>
            </div>
            <div className="ledger-row is-labelled">
              <dt className="ledger-title !text-smallmeta">{copy.feeAdmission}</dt>
              <dd className="ledger-note !mt-0 font-semibold !text-carbon">
                {rupees(verified.fees.feeAdmission)}
              </dd>
            </div>
            <div className="ledger-row is-labelled">
              <dt className="ledger-title !text-smallmeta">{copy.feeBalance}</dt>
              <dd className="ledger-note !mt-0 font-semibold !text-carbon">
                {rupees(balance)}
                <span className="block font-normal text-stone">{copy.feeBalanceNote}</span>
              </dd>
            </div>
          </dl>
          <p className="form-note mt-5 max-w-2xl">{copy.feeOffline}</p>
        </div>
      </div>
    </section>
  );
}
