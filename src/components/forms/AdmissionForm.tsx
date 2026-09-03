"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TurnstileWidget } from "./TurnstileWidget";
import { site, waLink } from "@/lib/site";
import { track } from "@/lib/analytics";
import { cleanIndianMobile } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { ThreadProgress } from "@/components/kds/marks";

/**
 * A course as the form needs it: identity, plus the timetable and free-demo
 * slots the institute actually runs. Both lists come from
 * `getPublicCourseConfigs()`, the same resolver the API route validates
 * against, so the form can never offer a slot the server rejects.
 */
export type CourseOption = {
  slug: string;
  nameEn: string;
  nameGu: string;
  scheduleOptions: Array<{ key: string; startTime: string; endTime: string; partOfDay: string }>;
  demoSlots: Array<{ key: string; startTime: string; endTime: string }>;
};
export type AdmissionContext = { course?: string; timing?: "morning" | "evening"; src?: string };

type Data = {
  locale: "en" | "gu";
  fullName: string;
  whatsapp: string;
  email: string;
  courseSlug: string;
  preferredTiming: "" | "morning" | "evening";
  preferredSchedule: string;
  demoSlot: string;
  ageBand: "" | "under18" | "18-25" | "26-40" | "40plus";
  fatherName: string;
  guardianName: string;
  guardianPhone: string;
  referenceName: string;
  referencePhone: string;
  occupation: string;
  experience: string;
  area: string;
  heardFrom: string;
  goal: string;
  privacy: boolean;
  comms: boolean;
  terms: boolean;
};

const DRAFT_KEY = "kds-admission-draft";
const MOBILE = /^[6-9]\d{9}$/;

const empty = (locale: "en" | "gu"): Data => ({
  locale,
  fullName: "",
  whatsapp: "",
  email: "",
  courseSlug: "",
  preferredTiming: "",
  preferredSchedule: "",
  demoSlot: "",
  ageBand: "",
  fatherName: "",
  guardianName: "",
  guardianPhone: "",
  referenceName: "",
  referencePhone: "",
  occupation: "",
  experience: "",
  area: "",
  heardFrom: "",
  goal: "",
  privacy: false,
  comms: false,
  terms: false
});

/** Focus targets for each error key (error summary + auto-focus). */
const FOCUS_ID: Record<string, string> = {
  fullName: "adm-fullName",
  whatsapp: "adm-whatsapp",
  courseSlug: "adm-course-legend",
  preferredTiming: "adm-timing-legend",
  preferredSchedule: "adm-schedule-legend",
  ageBand: "adm-ageBand",
  guardianName: "adm-guardianName",
  guardianPhone: "adm-guardianPhone",
  referencePhone: "adm-referencePhone",
  occupation: "adm-occupation",
  experience: "adm-experience",
  area: "adm-area",
  consent: "adm-privacy",
  terms: "adm-terms"
};

/**
 * Admission form (audit upgrades): context arrives from course/batch CTAs and
 * preselects step 2; retries are idempotent; validation errors get a summary
 * with focus management; every control is wired with aria-invalid and
 * aria-describedby; step changes are announced and focused.
 */
export function AdmissionForm({
  courses,
  context,
  termsVersion,
  normsHref
}: {
  courses: CourseOption[];
  context?: AdmissionContext;
  /** The admission-norms version this submission is recorded against. */
  termsVersion: number;
  /** Anchor to the full norms, rendered on the page rather than in this bundle. */
  normsHref: string;
}) {
  const t = useTranslations("admissionForm");
  const uiLocale = useLocale() as "en" | "gu";

  const [data, setData] = useState<Data>(() => empty(uiLocale));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [restored, setRestored] = useState(false);
  const [fromContext, setFromContext] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [done, setDone] = useState<{ reference: string; waUrl: string } | null>(null);

  const idemKey = useRef<string>("");
  const utm = useRef({ utmSource: "", utmCampaign: "" });
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);

  const validContextCourse =
    context?.course && courses.some((c) => c.slug === context.course) ? context.course : undefined;

  /* ---- restore draft, apply CTA context (context wins), capture utm ---- */
  useEffect(() => {
    let next = empty(uiLocale);
    let nextStep = 0;
    try {
      const p = new URLSearchParams(window.location.search);
      utm.current = {
        utmSource: p.get("utm_source") ?? "",
        utmCampaign: p.get("utm_campaign") ?? ""
      };
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { data: Data; step: number; idem?: string };
        if (saved?.data?.fullName || saved?.data?.courseSlug) {
          next = { ...next, ...saved.data };
          nextStep = Math.min(saved.step ?? 0, 3);
          setRestored(true);
        }
        if (saved?.idem) idemKey.current = saved.idem;
      }
    } catch {}
    if (!idemKey.current) idemKey.current = crypto.randomUUID();
    if (validContextCourse) {
      next = {
        ...next,
        courseSlug: validContextCourse,
        preferredTiming: context?.timing ?? next.preferredTiming
      };
      setFromContext(true);
    }
    setData(next);
    setStep(nextStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- persist draft (incl. idempotency key) ---- */
  useEffect(() => {
    if (done) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step, idem: idemKey.current }));
    } catch {}
  }, [data, step, done]);

  /* ---- focus the success heading when the form completes ---- */
  useEffect(() => {
    if (done) successHeading.current?.focus();
  }, [done]);

  const set = <K extends keyof Data>(key: K, value: Data[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!(key in e) && !(key === "privacy" || key === "comms" ? "consent" in e : false)) return e;
      const nextErrs = { ...e };
      delete nextErrs[key];
      if (key === "privacy" || key === "comms") delete nextErrs.consent;
      return nextErrs;
    });
  };

  const selectedCourse = courses.find((c) => c.slug === data.courseSlug);
  const selectedSchedule = selectedCourse?.scheduleOptions ?? [];
  const selectedDemoSlots = selectedCourse?.demoSlots ?? [];

  /**
   * `preferredTiming` predates the timetable and is still read by console
   * filters and by the course-page CTAs, so it keeps working — derived from the
   * chosen slot rather than asked a second time.
   */
  const timingFor = (scheduleKey: string): "" | "morning" | "evening" => {
    const slot = selectedSchedule.find((o) => o.key === scheduleKey);
    if (!slot) return "";
    return slot.partOfDay === "morning" || slot.partOfDay === "afternoon" ? "morning" : "evening";
  };

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    /* Course first, then who you are. The cheapest question goes first: a
       visitor will tell you what they want to learn before they will hand
       over a phone number, and asking in that order is what turns a form into
       a conversation. */
    if (s === 0) {
      if (!data.courseSlug) e.courseSlug = t("errors.required");
      /* A course with a published timetable asks for a real slot; one without
         still asks the old morning/evening question, because inventing slots
         for the other ten courses would publish an unconfirmed fact. */
      if (selectedSchedule.length > 0) {
        if (!data.preferredSchedule) e.preferredSchedule = t("errors.required");
      } else if (!data.preferredTiming) {
        e.preferredTiming = t("errors.required");
      }
    }
    if (s === 1) {
      if (data.fullName.trim().length < 2) e.fullName = t("errors.required");
      if (!MOBILE.test(cleanIndianMobile(data.whatsapp))) e.whatsapp = t("errors.phone");
      /* Owner decision, 2026-08-30: a parent/guardian contact on EVERY
         admission, not only for under-18s. */
      if (!MOBILE.test(cleanIndianMobile(data.guardianPhone))) {
        e.guardianPhone = t("errors.phone");
      } else if (cleanIndianMobile(data.guardianPhone) === cleanIndianMobile(data.whatsapp)) {
        e.guardianPhone = t("errors.guardianSame");
      }
    }
    if (s === 2) {
      if (!data.ageBand) e.ageBand = t("errors.required");
      if (data.ageBand === "under18" && data.guardianName.trim().length < 2) {
        e.guardianName = t("errors.required");
      }
      if (!data.occupation) e.occupation = t("errors.required");
      if (!data.experience) e.experience = t("errors.required");
      if (!data.area.trim()) e.area = t("errors.required");
      if (data.referencePhone.trim() && !MOBILE.test(cleanIndianMobile(data.referencePhone))) {
        e.referencePhone = t("errors.phone");
      }
      // heardFrom is optional (audit: attribution must not block admission)
    }
    if (s === 3) {
      if (!data.privacy || !data.comms) e.consent = t("errors.consent");
      if (!data.terms) e.terms = t("errors.terms");
    }
    return e;
  };

  const focusField = (key: string) => {
    const el = document.getElementById(FOCUS_ID[key] ?? "");
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /* Fired once, when the visitor commits to the form by leaving step 1.
     Mounting the page is not a start — arriving and bouncing is the case this
     event exists to distinguish. */
  const started = useRef(false);

  const go = (next: number) => {
    if (!started.current && next > 0) {
      started.current = true;
      track("demo_start", { course: data.courseSlug || undefined, locale: uiLocale });
    }
    setStep(next);
    setRestored(false);
    requestAnimationFrame(() => stepHeading.current?.focus());
  };

  const onNext = () => {
    const e = validate(step);
    setErrors(e);
    const keys = Object.keys(e);
    if (keys.length === 0) go(step + 1);
    else requestAnimationFrame(() => focusField(keys[0]));
  };

  const onSubmit = async () => {
    const e = validate(3);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => focusField(Object.keys(e)[0]));
      return;
    }
    setBusy(true);
    setServerError(false);
    try {
      const res = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          whatsapp: cleanIndianMobile(data.whatsapp),
          guardianPhone: cleanIndianMobile(data.guardianPhone),
          referencePhone: data.referencePhone ? cleanIndianMobile(data.referencePhone) : "",
          /* Derived, never asked twice: a course with a timetable answers the
             legacy morning/evening question from the slot the visitor picked. */
          preferredTiming: data.preferredSchedule
            ? timingFor(data.preferredSchedule)
            : data.preferredTiming,
          termsVersion,
          turnstileToken: token,
          idempotencyKey: idemKey.current,
          utmSource: utm.current.utmSource || context?.src || "",
          utmCampaign: utm.current.utmCampaign
        })
      });
      const out = (await res.json()) as { ok: boolean; reference?: string; waUrl?: string };
      if (!res.ok || !out.ok || !out.reference) throw new Error("submit failed");
      const waUrl = out.waUrl ?? waLink(t("success.waMessage", { ref: out.reference }));
      /* Funnel end. The course slug is an enumerable value from our own
         catalogue; nothing the visitor typed is included. */
      track("demo_complete", { course: data.courseSlug || undefined, locale: uiLocale });
      setDone({ reference: out.reference, waUrl });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
    } catch {
      setServerError(true);
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------- success -------------------------------- */
  if (done) {
    return (
      <div className="form-shell text-center">
        <span className="verdict-mark mx-auto" style={{ color: "var(--ok)", borderColor: "var(--ok)" }}>
          <Icon name="check" size={22} className="text-[var(--ok)]" strokeWidth={2} />
        </span>
        <h2 ref={successHeading} tabIndex={-1} className="t-h2 mt-2 outline-none">
          {t("success.title")}
        </h2>
        <p className="mt-2 t-meta">{t("success.refLabel")}</p>
        <p className="t-h4 cert-no font-bold text-[var(--brand-accent-strong)]">
          {done.reference}
        </p>
        <p className="t-meta mx-auto mt-2 max-w-prose">{t("success.body")}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <a href={done.waUrl} target="_blank" rel="noopener noreferrer" className="act act-primary">
            {t("success.waButton")}
          </a>
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="act act-secondary">
            {t("success.mapButton")}
          </a>
        </div>
        {/* Both notes stay. One is what happens next and the other is what the
            free demo actually is — neither is decoration, and neither may be
            collapsed to save height. */}
        <p className="mt-3 t-meta">{t("responseNote")}</p>
        <p className="mt-1 t-meta">{t("success.demoNote")}</p>
      </div>
    );
  }

  /* ------------------------------ field bits ------------------------------ */
  const stepNames = t.raw("steps") as string[];
  const chosenSlot = selectedSchedule.find((o) => o.key === data.preferredSchedule);
  const scheduleLabel = chosenSlot
    ? `${chosenSlot.startTime} – ${chosenSlot.endTime}`
    : data.preferredTiming === "morning"
      ? t("options.timingMorning")
      : data.preferredTiming === "evening"
        ? t("options.timingEvening")
        : "";
  const chosenDemo = selectedDemoSlots.find((o) => o.key === data.demoSlot);
  const demoLabel = chosenDemo ? `${chosenDemo.startTime} – ${chosenDemo.endTime}` : "";
  const errKeys = Object.keys(errors);
  const errId = (k: string) => `adm-${k}-err`;

  const err = (k: string) =>
    errors[k] ? (
      <p id={errId(k)} className="field-error">
        {errors[k]}
      </p>
    ) : null;

  const textField = (
    key: keyof Data,
    label: string,
    opts?: {
      placeholder?: string;
      type?: string;
      inputMode?: "numeric" | "tel" | "email";
      autoComplete?: string;
      /** What the phone's Enter key should say. */
      enterKeyHint?: "next" | "done";
    }
  ) => (
    <div>
      <label className="label" htmlFor={`adm-${key}`}>
        {label}
      </label>
      <input
        id={`adm-${key}`}
        type={opts?.type ?? "text"}
        className={cn("input", errors[key] && "input-error")}
        placeholder={opts?.placeholder}
        value={String(data[key])}
        onChange={(e) => set(key, e.target.value as never)}
        inputMode={opts?.inputMode}
        autoComplete={opts?.autoComplete}
        enterKeyHint={opts?.enterKeyHint}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? errId(key) : undefined}
      />
      {err(key)}
    </div>
  );

  const selectField = (
    key: keyof Data,
    label: string,
    options: Array<{ v: string; label: string }>
  ) => (
    <div>
      <label className="label" htmlFor={`adm-${key}`}>
        {label}
      </label>
      <select
        id={`adm-${key}`}
        className={cn("input", errors[key] && "input-error")}
        value={String(data[key])}
        onChange={(e) => set(key, e.target.value as never)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? errId(key) : undefined}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
      {err(key)}
    </div>
  );

  const contextCourse = courses.find((c) => c.slug === data.courseSlug);

  return (
    <div className="form-shell">
      {/* progress stitch */}
      <h2
        ref={stepHeading}
        tabIndex={-1}
        className="t-micro outline-none"
      >
        {t("stepLabel", { current: step + 1, total: 4 })} · {stepNames[step]}
      </h2>
      <p className="sr-only" aria-live="polite">
        {t("stepLabel", { current: step + 1, total: 4 })} {stepNames[step]}
      </p>
      <ThreadProgress
        steps={stepNames}
        current={step}
        label={t("stepLabel", { current: step + 1, total: 4 })}
        className="mt-2"
      />

      {fromContext && contextCourse && step === 1 ? (
        <p className="mt-2 flex flex-wrap items-center gap-2 rounded-lg on-cloth px-3 py-1.5 text-[0.8125rem] font-semibold">
          {t("contextApplying")}{" "}
          <span className="text-[var(--brand-accent-strong)]">
            {uiLocale === "gu" ? contextCourse.nameGu : contextCourse.nameEn}
          </span>
          <button
            type="button"
            onClick={() => go(0)}
            className="link-thread ml-auto t-micro"
          >
            {t("contextChange")}
          </button>
        </p>
      ) : null}

      {restored ? (
        <p className="form-note-box t-meta">
          ↩ {t("draftRestored")}
        </p>
      ) : null}

      {errKeys.length > 0 ? (
        <div
          role="alert"
          className="mt-2 rounded-lg border border-[var(--bad)] bg-[var(--brand-accent-soft)] p-3 t-meta"
        >
          <p className="font-bold text-[var(--bad)]">{t("errors.summaryTitle")}</p>
          <ul className="mt-2 space-y-1">
            {errKeys.map((k) => (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => focusField(k)}
                  className="link-thread font-semibold"
                >
                  {errors[k]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* The review step carries the consents, the admission-norms acceptance
          and every validation error. Motion level 0: nothing a visitor has to
          read carefully and get right should be moving while they read it. */}
      <div key={step} className={cn("mt-4 space-y-3", step < 3 && "step-in")}>
        {/* ---------------------- STEP 1 · WHAT YOU WANT ---------------------- */}
        {step === 0 ? (
          <>
            <fieldset aria-describedby={errors.courseSlug ? errId("courseSlug") : undefined}>
              <legend id="adm-course-legend" tabIndex={-1} className="label outline-none">
                {t("fields.course")}
              </legend>
              <div className="grid grid-cols-2 gap-1.5">
                {courses.map((c) => (
                  <label key={c.slug} className="choice-chip !justify-start">
                    <input
                      type="radio"
                      name="courseSlug"
                      className="sr-only"
                      checked={data.courseSlug === c.slug}
                      onChange={() => {
                        /* A slot key belongs to one course. Switching course
                           must drop it, or the form would submit a key the
                           new course does not have and the server would
                           reject a form that looked complete. */
                        setData((d) => ({
                          ...d,
                          courseSlug: c.slug,
                          preferredSchedule: "",
                          demoSlot: ""
                        }));
                        setErrors((e) => {
                          const next = { ...e };
                          delete next.courseSlug;
                          delete next.preferredSchedule;
                          return next;
                        });
                      }}
                    />
                    <span>{uiLocale === "gu" ? c.nameGu : c.nameEn}</span>
                  </label>
                ))}
              </div>
              {err("courseSlug")}
            </fieldset>
            {selectedSchedule.length > 0 ? (
              <fieldset
                aria-describedby={errors.preferredSchedule ? errId("preferredSchedule") : undefined}
              >
                <legend id="adm-schedule-legend" tabIndex={-1} className="label outline-none">
                  {t("fields.preferredSchedule")}
                </legend>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedSchedule.map((o) => (
                    <label key={o.key} className="choice-chip !justify-start">
                      <input
                        type="radio"
                        name="preferredSchedule"
                        className="sr-only"
                        checked={data.preferredSchedule === o.key}
                        onChange={() => set("preferredSchedule", o.key)}
                      />
                      <span>
                        {o.startTime} – {o.endTime}
                      </span>
                    </label>
                  ))}
                </div>
                {err("preferredSchedule")}
              </fieldset>
            ) : (
              <fieldset aria-describedby={errors.preferredTiming ? errId("preferredTiming") : undefined}>
                <legend id="adm-timing-legend" tabIndex={-1} className="label outline-none">
                  {t("fields.timing")}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { v: "morning", label: t("options.timingMorning") },
                      { v: "evening", label: t("options.timingEvening") }
                    ] as const
                  ).map((o) => (
                    <label key={o.v} className="choice-chip">
                      <input
                        type="radio"
                        name="preferredTiming"
                        className="sr-only"
                        checked={data.preferredTiming === o.v}
                        onChange={() => set("preferredTiming", o.v)}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
                {err("preferredTiming")}
              </fieldset>
            )}

            {/* A free-demo time is a PREFERENCE, not a booking. Karma keeps no
                per-date demo capacity, and a form that implied otherwise would
                promise a seat nobody had reserved. */}
            {selectedDemoSlots.length > 0 ? (
              <fieldset>
                <legend className="label">{t("fields.demoSlot")}</legend>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedDemoSlots.map((o) => (
                    <label key={o.key} className="choice-chip !justify-start">
                      <input
                        type="radio"
                        name="demoSlot"
                        className="sr-only"
                        checked={data.demoSlot === o.key}
                        onChange={() => set("demoSlot", o.key)}
                      />
                      <span>
                        {o.startTime} – {o.endTime}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="form-note mt-2">{t("fields.demoSlotHint")}</p>
              </fieldset>
            ) : null}
          </>
        ) : null}

        {/* ------------------------- STEP 2 · YOU ---------------------------- */}
        {step === 1 ? (
          <>
            <fieldset>
              <legend className="label">{t("fields.language")}</legend>
              <div className="flex gap-1.5">
                {(["gu", "en"] as const).map((l) => (
                  <label key={l} className="choice-chip">
                    <input
                      type="radio"
                      name="locale"
                      className="sr-only"
                      checked={data.locale === l}
                      onChange={() => set("locale", l)}
                    />
                    {l === "gu" ? "ગુજરાતી" : "English"}
                  </label>
                ))}
              </div>
            </fieldset>
            {textField("fullName", t("fields.fullName"), {
              placeholder: t("fields.fullNamePh"),
              autoComplete: "name",
              enterKeyHint: "next"
            })}
            {textField("whatsapp", t("fields.whatsapp"), {
              placeholder: t("fields.whatsappPh"),
              type: "tel",
              inputMode: "tel",
              autoComplete: "tel",
              enterKeyHint: "next"
            })}
            {textField("email", t("fields.email"), {
              type: "email",
              inputMode: "email",
              autoComplete: "email",
              enterKeyHint: "next"
            })}
            {/* Required for every applicant, not only under-18s (owner
                decision, 2026-08-30). The studio wants a second person it can
                reach about a student's course. */}
            <div className="form-callout">
              {textField("guardianPhone", t("fields.guardianPhone"), {
                type: "tel",
                inputMode: "tel",
                enterKeyHint: "done"
              })}
              <p className="form-note mt-2">{t("fields.guardianPhoneHint")}</p>
            </div>
          </>
        ) : null}

        {/* ---------------------- STEP 3 · CONTEXT ---------------------------- */}
        {step === 2 ? (
          <>
            {selectField("ageBand", t("fields.ageBand"), [
              { v: "under18", label: t("options.age1") },
              { v: "18-25", label: t("options.age2") },
              { v: "26-40", label: t("options.age3") },
              { v: "40plus", label: t("options.age4") }
            ])}
            {data.ageBand === "under18" ? (
              <div className="form-callout">
                {textField("guardianName", t("fields.guardianName"))}
              </div>
            ) : null}
            {textField("fatherName", t("fields.fatherName"))}
            {selectField("occupation", t("fields.occupation"), [
              { v: "student", label: t("options.occ1") },
              { v: "homemaker", label: t("options.occ2") },
              { v: "tailor", label: t("options.occ3") },
              { v: "working", label: t("options.occ4") },
              { v: "other", label: t("options.occ5") }
            ])}
            {selectField("experience", t("fields.experience"), [
              { v: "beginner", label: t("options.exp1") },
              { v: "hand", label: t("options.exp2") },
              { v: "operator", label: t("options.exp3") }
            ])}
            {textField("area", t("fields.area"), { placeholder: t("fields.areaPh") })}
            {/* Optional on purpose: nobody is asked to invent a reference. */}
            <div className="grid gap-2 sm:grid-cols-2">
              {textField("referenceName", t("fields.referenceName"))}
              {textField("referencePhone", t("fields.referencePhone"), {
                type: "tel",
                inputMode: "tel"
              })}
            </div>
            <p className="form-note -mt-2">{t("fields.referenceHint")}</p>
            {selectField("heardFrom", t("fields.heardFrom"), [
              { v: "instagram", label: t("options.heard1") },
              { v: "youtube", label: t("options.heard2") },
              { v: "friend", label: t("options.heard3") },
              { v: "google", label: t("options.heard4") },
              { v: "walkby", label: t("options.heard5") },
              { v: "other", label: t("options.heard6") }
            ])}
            <div>
              <label className="label" htmlFor="adm-goal">
                {t("fields.goal")}
              </label>
              <textarea
                id="adm-goal"
                rows={3}
                className="input"
                value={data.goal}
                onChange={(e) => set("goal", e.target.value)}
              />
            </div>
          </>
        ) : null}

        {/* --------------------- STEP 4 · REVIEW ------------------------------ */}
        {step === 3 ? (
          <>
            <h3 className="t-h4">{t("review.title")}</h3>
            <dl className="space-y-3 t-meta">
              {(
                [
                  [
                    t("fields.course"),
                    contextCourse?.[uiLocale === "gu" ? "nameGu" : "nameEn"] ?? "",
                    0
                  ],
                  [
                    data.preferredSchedule ? t("fields.preferredSchedule") : t("fields.timing"),
                    scheduleLabel,
                    0
                  ],
                  ...(demoLabel
                    ? ([[t("fields.demoSlot"), demoLabel, 0]] as Array<[string, string, number]>)
                    : []),
                  [t("fields.fullName"), data.fullName, 1],
                  [t("fields.whatsapp"), data.whatsapp, 1],
                  [t("fields.guardianPhone"), data.guardianPhone, 1],
                  [t("fields.area"), data.area, 2]
                ] as Array<[string, string, number]>
              ).map(([label, value, s]) => (
                <div
                  key={label}
                  className="review-row"
                >
                  <div>
                    <dt className="t-micro">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(s)}
                    className="link-thread t-micro"
                  >
                    {t("review.edit")}
                  </button>
                </div>
              ))}
            </dl>

            <div className="space-y-3" aria-describedby={errors.consent ? errId("consent") : undefined}>
              <label className="flex items-start gap-3 t-meta">
                <input
                  id="adm-privacy"
                  type="checkbox"
                  checked={data.privacy}
                  onChange={(e) => set("privacy", e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--brand-accent-strong)]"
                  aria-invalid={errors.consent ? true : undefined}
                />
                <span>{t("consents.privacy")}</span>
              </label>
              <label className="flex items-start gap-3 t-meta">
                <input
                  id="adm-comms"
                  type="checkbox"
                  checked={data.comms}
                  onChange={(e) => set("comms", e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--brand-accent-strong)]"
                  aria-invalid={errors.consent ? true : undefined}
                />
                <span>{t("consents.comms")}</span>
              </label>
              {err("consent")}
            </div>

            {/* The admission norms are a separate acceptance from the privacy
                and contact consents: they are the institute's own rules, they
                are versioned, and the version accepted is stored with the
                application. The full text is on the page rather than in this
                bundle — fifteen clauses in two languages is not a checkbox. */}
            <div aria-describedby={errors.terms ? errId("terms") : undefined}>
              <label className="flex items-start gap-3 t-meta">
                <input
                  id="adm-terms"
                  type="checkbox"
                  checked={data.terms}
                  onChange={(e) => set("terms", e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--brand-accent-strong)]"
                  aria-invalid={errors.terms ? true : undefined}
                />
                <span>
                  {t("consents.terms")}{" "}
                  <a className="link-thread font-semibold" href={normsHref}>
                    {t("consents.termsLink")}
                  </a>
                </span>
              </label>
              {err("terms")}
            </div>

            <TurnstileWidget onToken={setToken} />
            <p className="t-meta">{t("turnstileNote")}</p>
            <p className="t-meta">{t("responseNote")}</p>
            {serverError ? (
              <p role="alert" className="field-error">
                {t("errors.generic")}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {/* ------------------------------- nav --------------------------------
          Sticky on a phone. On step 3 the Next control sat roughly 1,630px
          from the top of the document — about two screens — so a visitor who
          had filled everything in still had to scroll to say so. Sticky, not
          fixed: it stays in flow, so it can never cover the last field, and it
          clears the Call/Directions bar through the same `--tabbar-h` that bar
          reserves for itself. */}
      <div className="form-nav mt-4 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => go(step - 1)} className="act-quiet">
            ← {t("buttons.back")}
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button type="button" onClick={onNext} className="act act-primary">
            {t("buttons.next")} <Icon name="arrow" size={16} className="arrow" />
          </button>
        ) : (
          <button type="button" onClick={onSubmit} disabled={busy} className="act act-primary">
            {busy ? t("buttons.submitting") : t("buttons.submit")}
          </button>
        )}
      </div>
    </div>
  );
}
