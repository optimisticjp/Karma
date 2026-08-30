import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { QUEUE_LIMIT } from "../src/lib/admin/dashboard";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

const adminFiles = [
  ...walk("src/app/admin").filter((f) => f.endsWith(".tsx")),
  ...walk("src/components/admin").filter((f) => f.endsWith(".tsx"))
];
const today = read("src/app/admin/(console)/page.tsx");
const dashboard = read("src/lib/admin/dashboard.ts");
const queue = read("src/components/admin/Queue.tsx");
const css = read("src/app/machine-lab.css");

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * The console does not copy the public site
 * ------------------------------------------------------------------ */

describe("admin visual restrictions", () => {
  it("imports none of the public site's decorative components", () => {
    /* The console expresses the brand through operational logic, not
       decoration: no hero, no textile ground, no technique animation
       competing with the work. */
    const banned = [
      "TechniqueSignature",
      "TechniquePlate",
      "MaterialWall",
      "ManifestPhoto",
      "ProductionRail",
      "machine-light",
      "lab-glass"
    ];
    for (const file of adminFiles) {
      const source = stripComments(read(file));
      for (const name of banned) {
        expect(source, `${file} / ${name}`).not.toContain(name);
      }
    }
  });

  it("puts no page-level texture or aurora on a console screen", () => {
    for (const file of adminFiles) {
      const source = stripComments(read(file));
      for (const cls of ["tx-cotton", "tx-weave", "tx-satin", "tx-laser", "band-machine"]) {
        expect(source, `${file} / ${cls}`).not.toContain(cls);
      }
    }
  });

  it("adds no chart library", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
    for (const lib of ["recharts", "chart.js", "victory", "nivo", "@nivo/core", "apexcharts"]) {
      expect(Object.keys(pkg.dependencies), lib).not.toContain(lib);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Today at Karma is a work desk
 * ------------------------------------------------------------------ */

describe("Today at Karma", () => {
  it("shows queues rather than a wall of metric cards", () => {
    expect(today).toContain("Queue");
    expect(today).toContain("QueueRow");
    expect(today).not.toContain("<Metric");
  });

  it("heads each queue with its count instead of dropping the number", () => {
    expect(queue).toContain("queue-count");
    expect(today).toContain("count={c.newApplications}");
    expect(today).toContain("count={c.followUpsDue}");
    expect(today).toContain("count={c.runningBatches}");
    expect(today).toContain("count={c.openBriefs}");
  });

  it("queries only the queues the operator can actually open", () => {
    /* Free-tier discipline: an admin with attendance rights alone costs one
       round trip, not five. */
    expect(today).toContain("getTodayQueues({ admissions: canAdmissions");
    expect(dashboard).toContain("if (want.admissions)");
    expect(dashboard).toContain("if (want.batches)");
    expect(dashboard).toContain("if (want.design)");
  });

  it("caps every queue", () => {
    expect(QUEUE_LIMIT).toBeLessThanOrEqual(8);
    expect((dashboard.match(/limit \$\{QUEUE_LIMIT/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it("links a queue row only to a route that exists", () => {
    /* There are no per-record console routes yet — /admin/admissions is one
       list of <details> rows, not /admin/admissions/[id] — and a queue full
       of 404s would be worse than the metric cards it replaced. */
    const hrefs = [
      ...today.matchAll(/href="(\/admin[^"]*)"/g),
      ...today.matchAll(/href=\{`(\/admin[^`#]*)/g)
    ].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(3);
    for (const href of hrefs) {
      const segment = href.split("#")[0].replace(/^\/admin\/?/, "").replace(/\/$/, "");
      const path = segment
        ? `src/app/admin/(console)/${segment}/page.tsx`
        : "src/app/admin/(console)/page.tsx";
      expect(() => read(path), href).not.toThrow();
    }
    /* A record id may only appear as a FRAGMENT. An id in the path would be a
       per-record route, and there are none. */
    expect(today).not.toMatch(/href=\{`\/admin\/[a-z]+\/\$\{/);
  });

  it("puts no phone number in a queue row", () => {
    /* A queue is scanned in public, at a counter. The number lives one tap
       away on the record itself. */
    expect(stripComments(queue)).not.toContain("phone");
    expect(dashboard).not.toContain("whatsapp,");
    expect(dashboard.slice(dashboard.indexOf("getTodayQueues"))).not.toContain("guardian_phone");
  });

  it("is bilingual, including every queue label", () => {
    for (const cat of [en, gu]) {
      for (const key of [
        "queueNewApplications",
        "queueFollowUps",
        "queueBatches",
        "queueBriefs",
        "queueEmptyApplications",
        "queueMore",
        "workDesk"
      ]) {
        expect(cat.admin.today[key], key).toBeTruthy();
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * Density, touch size and status
 * ------------------------------------------------------------------ */

describe("the console row system", () => {
  it("keeps a 44px hit area inside a visually tight row", () => {
    const block = css.slice(css.indexOf(".queue-link {"), css.indexOf(".queue-row-body {"));
    expect(block).toContain("min-height: 2.75rem");
  });

  it("never states a status by colour alone", () => {
    /* A dot is scannable down a column; the word is what makes it
       accessible. Both, always. */
    expect(queue).toContain("status-dot");
    expect(queue).toContain("{status}");
    const block = css.slice(css.indexOf(".status-light {"));
    expect(block).toContain("text-transform: uppercase");
  });

  it("neutralises the status label for Gujarati", () => {
    const block = css.slice(css.indexOf(".status-light {"));
    expect(block).toContain(":lang(gu) .status-light");
    const guBlock = block.slice(block.indexOf(":lang(gu) .status-light"));
    expect(guBlock).toContain("text-transform: none");
    expect(guBlock).toContain("letter-spacing: 0");
  });

  it("respects the safe area at the bottom of a console screen", () => {
    expect(css).toContain("env(safe-area-inset-bottom)");
  });
});

/* ------------------------------------------------------------------ *
 * Nothing about authorization moved
 * ------------------------------------------------------------------ */

describe("authorization is untouched", () => {
  it("still guards the page server-side", () => {
    expect(today).toContain('requireAdmin("/admin")');
    expect(today).toContain("hasPermission(session.staff");
  });

  it("still treats navigation as UX rather than as security", () => {
    const shell = read("src/components/admin/ConsoleShell.tsx");
    expect(shell).toContain("re-checks authorization server-side");
  });
});
