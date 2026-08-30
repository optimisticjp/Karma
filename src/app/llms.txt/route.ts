import { courses, coursesByFamily } from "@/content/courses";
import { EMCAD_DAHAO, KARMA_SOFTWARE, TRAINING_CENTRE_LINE_EN } from "@/content/course-operations";
import { site } from "@/lib/site";

/**
 * /llms.txt — a plain-language brief for crawlers and AI assistants.
 *
 * This used to be `public/llms.txt`, a static file that hard-coded
 * `karmadesignstudio.in` (a domain that is NOT connected) and advertised eight
 * courses when the catalogue has been eleven since 2026-08-29. Both problems
 * came from the same cause: it was the one public surface that did not derive
 * from `NEXT_PUBLIC_SITE_URL` and the course catalogue. It is now generated, so
 * a course added to `src/content/courses.ts` and the domain cutover both reach
 * it without anybody remembering to.
 *
 * Verified facts only. The three-month duration and the fee plan belong to
 * EMCAD DAHAO Embroidery Designing alone; no other course states either.
 */
export const dynamic = "force-static";

function body(): string {
  const catalogue = coursesByFamily.map((c) => `- ${c.nameEn} (${site.url}/en/courses/${c.slug})`);
  const teach = EMCAD_DAHAO.operations.curriculum.map((line) => line.en).join(", ");
  const balance = EMCAD_DAHAO.fees.feeTotal - EMCAD_DAHAO.fees.feeAdmission;
  const inr = (n: number) => `INR ${n.toLocaleString("en-IN")}`;

  return `# ${site.legalName}, Surat

Embroidery training institute and B2B embroidery design lab in Mota Varachha,
Surat, Gujarat (India). Also known as: ${TRAINING_CENTRE_LINE_EN}.
Bilingual website: English (/en) and Gujarati (/gu).

Two things happen here:
1. Training: live-machine embroidery courses, plus ${KARMA_SOFTWARE} embroidery
   design software. Karma teaches ${KARMA_SOFTWARE} and no other digitising
   package. A free demo is the first step; evening batches run till 10:30 pm.
   There is NO online payment anywhere on this site; fees are handled in person.
2. Design services (B2B): embroidery design development, digitising, sampling,
   custom patches and production job work for garment businesses.

Courses (${courses.length}):
${catalogue.join("\n")}

EMCAD DAHAO Embroidery Designing — the facts the institute publishes:
- Duration: ${EMCAD_DAHAO.durationMonths} months
- Software: ${KARMA_SOFTWARE} only
- Free demo: ${EMCAD_DAHAO.operations.demo?.days} days, ${EMCAD_DAHAO.operations.demo?.hours} hours a session
- Batch timings: ${EMCAD_DAHAO.operations.scheduleOptions
    .map((s) => `${s.startTime}-${s.endTime}`)
    .join(", ")}
- Fees: ${inr(EMCAD_DAHAO.fees.feeTotal)} total, ${inr(EMCAD_DAHAO.fees.feeAdmission)} at admission,
  ${inr(balance)} balance within one month of joining. Paid in person, not online.
- Taught: ${teach}
- Practical: 100% live practical machine training, sample making, device
  connection and setting, machine troubleshooting, production knowledge.

Durations and fees for the other courses are not published; ask the studio.

Key pages:
- ${site.url}/en/courses
- ${site.url}/en/admissions
- ${site.url}/en/admission (application form)
- ${site.url}/en/services (design brief for businesses)
- ${site.url}/en/notes (technical notes from the production floor)
- ${site.url}/en/verify (certificate verification)
- ${site.url}/en/contact

Contact: WhatsApp ${site.phoneDisplay} · Call for a demo ${site.callPhoneDisplay} · ${site.email}
`;
}

export function GET() {
  return new Response(body(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
