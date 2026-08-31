import { coursesByFamily, families } from "@/content/courses";
import { EMCAD_DAHAO, KARMA_SOFTWARE } from "@/content/course-operations";
import {
  googleRating,
  partners,
  reviews,
  socialChannels,
  stats,
  stories,
  testimonials
} from "@/content/proof";
import { photosInGroup } from "@/content/photo-manifest";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { HoopWindow, NeedlePoint, ThreadLine, ThreadProgress } from "@/components/kds/marks";
import { MachineFrame, PhotoFrame } from "@/components/kds/Frame";
import {
  FeaturedReview,
  MicroProof,
  RatingBlock,
  ReviewRail,
  SocialProof,
  StoryJourney,
  TrustedByRail
} from "@/components/kds/proof";

/**
 * THE VISUAL QUALITY GATE.
 *
 * The rebuild plan's Phase 1 will not proceed until a representative surface
 * proves the new system, rendered at 390 / 768 / 1440, answers three
 * questions:
 *
 *   Does this look like the old Karma site recoloured?
 *   Does this look like a generic AI landing page?
 *   Does this feel specifically like embroidery, machine production and Karma?
 *
 * So this page is not a swatch dump. It is composed the way a real page is
 * composed — an asymmetric hero, sections that each use a DIFFERENT shape, a
 * horizontal sample rail, a bento proof wall, a schedule board — because a
 * system can only be judged in composition. A grid of isolated components
 * always looks fine and tells you nothing.
 *
 * It renders on the new system ALONE: this route's layout loads `globals.css`
 * and `thread-machine-proof.css` and neither of the two older public
 * stylesheets. Anything that only looks right on a public page is borrowing
 * from the old system, and this is where that becomes visible.
 *
 * Not indexed, not in the sitemap, not linked from the site. It stays as the
 * reference the next session reads instead of guessing.
 */

const SAMPLE_BATCHES = [
  { course: "EMCAD DAHAO Embroidery Designing", starts: "Mon 8 Sep", time: "10:00 – 12:00", state: "open" as const },
  { course: "Zardosi Machine Embroidery", starts: "Wed 10 Sep", time: "16:00 – 18:00", state: "filling" as const },
  { course: "Sequence (Sequins) Work", starts: "Mon 15 Sep", time: "19:00 – 21:00", state: "full" as const }
];

function Section({
  n,
  title,
  note,
  ground = "canvas",
  children
}: {
  n: string;
  title: string;
  note: string;
  ground?: "canvas" | "paper" | "cloth" | "mist";
  children: React.ReactNode;
}) {
  return (
    <section className={`band on-${ground}`}>
      <div className="wrap">
        <header className="mb-7 max-w-prose">
          <p className="t-micro">{n}</p>
          <h2 className="t-h2 mt-1.5">{title}</h2>
          <p className="t-lede mt-2.5">{note}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

export default function DesignSystemPage() {
  const work = photosInGroup("work");

  return (
    <main>
      {/* ---------------------------------------------------------------- *
       * 01 — the hero composition
       *
       * Asymmetric, 55/45, with the three hero photo slots as ONE scene
       * rather than three stacked boxes: a large finished result with the
       * screen and the machine inset against it, connected by a thread. That
       * is the brand thesis as a picture, and it is the composition the real
       * homepage inherits.
       * ---------------------------------------------------------------- */}
      <section className="band-hero on-canvas glow-screen">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <p className="t-micro">Commercial embroidery training · Mota Varachha, Surat</p>
              <h1 className="t-h1-hero mt-3">From screen to stitch.</h1>
              <p className="t-lede mt-4 max-w-[46ch]">
                Design on screen. Prove it on the machine. Eleven techniques and{" "}
                {KARMA_SOFTWARE} design software, taught on live production machines.
              </p>

              <ThreadLine draw className="my-6 w-28" />

              <dl className="grid max-w-md grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ["Software", KARMA_SOFTWARE],
                  ["Taught", "Live machine practical"],
                  ["Where", "Mota Varachha, Surat"],
                  ["Free demo", `${EMCAD_DAHAO.operations.demo?.days} days · ${KARMA_SOFTWARE}`]
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="t-micro">{k}</dt>
                    <dd className="t-h4 mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* The material, in the first viewport.
                  Four swatches at thumbnail scale say "eleven techniques,
                  and they are physically different from each other" faster
                  than a sentence can, and they stop the hero reading as a
                  clean training company that could teach anything. */}
              <ul className="hero-swatches" role="list">
                {["zardosi-machine-embroidery", "sequence-work", "tufting", "emcad-embroidery-design"].map(
                  (slug) => (
                    <li key={slug}>
                      <StitchSwatch slug={slug} />
                    </li>
                  )
                )}
                <li className="t-micro self-center">+7 more</li>
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="act act-primary">
                  Book free demo <span aria-hidden="true" className="arrow">→</span>
                </span>
                <span className="act act-secondary">Explore courses</span>
              </div>
            </div>

            {/* ONE SCENE, not three rectangles.
                The finished piece leads at full width because it is the thing
                being promised; the screen and the machine sit under it as the
                two steps that produced it, and a thread runs down the column
                through a needle point at each stage. That connection is the
                brand idea drawn literally, and it is the reason this is a
                composition rather than a grid of placeholders. */}
            <div className="hero-scene min-w-0">
              <span aria-hidden="true" className="hero-scene-thread">
                <ThreadLine vertical draw />
              </span>

              <figure className="hero-stage hero-stage--lead">
                <figcaption className="hero-stage-tag">
                  <NeedlePoint state="done" />
                  <span className="t-micro">03 proof</span>
                </figcaption>
                <PhotoFrame id="H3_FINISHED_PIECE" scale="feature" />
              </figure>

              <div className="hero-stage-pair">
                <figure className="hero-stage">
                  <figcaption className="hero-stage-tag">
                    <NeedlePoint state="done" />
                    <span className="t-micro">01 screen</span>
                  </figcaption>
                  <PhotoFrame id="H1_EMCAD_SCREEN" scale="thumb" register="machine" />
                </figure>
                <figure className="hero-stage">
                  <figcaption className="hero-stage-tag">
                    <NeedlePoint state="done" />
                    <span className="t-micro">02 machine</span>
                  </figcaption>
                  <PhotoFrame id="H2_MACHINE_STITCHING" scale="thumb" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * 02 — type
       * ---------------------------------------------------------------- */}
      <Section
        n="01 / type"
        ground="paper"
        title="One family, used with conviction"
        note="Manrope throughout. Every size below is a clamp computed between the plan's mobile target at 390px and its desktop target at 1440px — so these are the plan's numbers, not numbers that resemble them."
      >
        <div className="space-y-3">
          <p className="t-display">88 / 44</p>
          <p className="t-h1-hero">Hero heading — 62 / 36</p>
          <p className="t-h1">Page heading — 50 / 31</p>
          <p className="t-h2">Section heading — 37 / 25</p>
          <p className="t-h3">Subsection — 25 / 19.5</p>
          <p className="t-h4">Small heading — 20 / 17</p>
          <p className="t-lede max-w-prose">
            The lede carries the sentence that decides whether the rest is read — 21 / 17.
          </p>
          <p className="t-body max-w-prose">
            Body copy, 17 / 16, at 1.6 line height. Long enough to read, short
            enough to scan, and never set wider than the prose measure.
          </p>
          <p className="t-meta">Metadata and captions — 14.5 / 13.5</p>
          <p className="t-micro">Technical label — 12.5 / 12, and deliberately rare</p>
          <p className="t-editorial t-h3">An editorial interruption, used once a page at most</p>
          <div className="mt-5" lang="gu">
            <p className="t-h2">ગુજરાતી — સ્ક્રીનથી સ્ટિચ સુધી</p>
            <p className="t-body mt-1.5 max-w-prose">
              ગુજરાતી ક્યારેય uppercase કે letterspaced થતું નથી, અને એની line height
              વધારે છે — કારણ કે એના marks લીટીની ઉપર અને નીચે બેસે છે.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 03 — surfaces and the two registers
       * ---------------------------------------------------------------- */}
      <Section
        n="02 / surfaces"
        ground="cloth"
        title="Warm cloth, cool machine"
        note="Two material registers, not one palette. Anything about the screen, the file or the process sits on the cool ground; anything about the finished textile sits on the warm one. A visitor learns the difference without being told it."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Paper", "s-paper", "Forms, sheets, media mats"],
            ["Canvas", "s-canvas", "The main ground"],
            ["Cloth", "s-cloth", "Work, samples, people"],
            ["Mist", "s-mist", "EMCAD, files, process"],
            ["Mist deep", "s-mist-deep", "An inset machine panel"]
          ].map(([name, token, use]) => (
            <div key={token} className="border" style={{ borderColor: "var(--line)" }}>
              <div className="h-16" style={{ backgroundColor: `var(--${token})` }} />
              <div className="p-3">
                <p className="t-h4">{name}</p>
                <p className="t-meta mt-0.5">{use}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            ["Accent", "brand-accent", "Thread, marks, fills"],
            ["Accent strong", "brand-accent-strong", "Actions, accent text"],
            ["Accent soft", "brand-accent-soft", "Selected, wash"],
            ["Ink", "ink", "Headings, body, linework"]
          ].map(([name, token, use]) => (
            <div key={token} className="border p-3" style={{ borderColor: "var(--line)" }}>
              <div className="mb-2 h-8" style={{ backgroundColor: `var(--${token})` }} />
              <p className="t-h4">{name}</p>
              <p className="t-meta">{use}</p>
            </div>
          ))}
        </div>
        <p className="t-meta mt-4 max-w-prose">
          Four variables carry every chromatic decision on the site. A future
          Karma logo in blue, green, gold or black changes those four and
          nothing else — all four alternates were contrast-checked before this
          palette was written.
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 04 — the marks
       * ---------------------------------------------------------------- */}
      <Section
        n="03 / grammar"
        title="Marks that come from the machine"
        note="A running stitch, a needle point, a hoop, a registration corner. Each has one job, and none of them is applied to every heading — that is how a signature becomes wallpaper."
      >
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="t-h4">Thread line</p>
            <p className="t-meta mb-4 mt-1">9 on, 6 off. The one repeated mark.</p>
            <ThreadLine className="w-full" />
            <ThreadLine tone="ink" className="mt-3 w-full" />
          </div>
          <div>
            <p className="t-h4">Needle point</p>
            <p className="t-meta mb-4 mt-1">Done, current, still to come.</p>
            <p className="flex items-center gap-4">
              <NeedlePoint state="done" />
              <NeedlePoint state="now" />
              <NeedlePoint state="todo" />
            </p>
            <div className="mt-6">
              <ThreadProgress
                label="Example form"
                steps={["Course", "Details", "Terms", "Done"]}
                current={1}
              />
            </div>
          </div>
          <div>
            <p className="t-h4">Hoop window</p>
            <p className="t-meta mb-4 mt-1">A round crop, once per page at most.</p>
            <HoopWindow className="block w-32">
              <span className="photo-wait flex h-full w-full items-end p-2">
                <span className="t-micro">T1</span>
              </span>
            </HoopWindow>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 05 — the sample book
       * ---------------------------------------------------------------- */}
      <Section
        n="04 / sample book"
        ground="paper"
        title="Eleven techniques, as swatches"
        note="A visitor choosing between zardosi and sequence work is choosing a material. So the catalogue is a book of cut samples — filled, edge to edge, running off all four sides — rather than a grid of product cards. Flick it."
      >
        <ul className="strip" role="list">
          {coursesByFamily.map((c) => (
            <li key={c.slug}>
              <StitchSwatch slug={c.slug} />
              <p className="t-h4 mt-2.5 leading-snug">{c.nameEn}</p>
              <p className="t-micro mt-1">{families[c.family].nameEn}</p>
            </li>
          ))}
        </ul>
        <p className="t-meta mt-5 max-w-prose">
          EMCAD is the odd one out on purpose: it is the one technique that
          happens on a screen, so its swatch sits on the cool register with a
          CAD grid behind it. That single difference is the whole thesis in one
          tile.
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 06 — media
       * ---------------------------------------------------------------- */}
      <Section
        n="05 / media"
        ground="mist"
        title="Thirty-two frames, waiting"
        note="None of the real photographs exist yet. Every frame below reserves the exact aspect ratio from the shoot manifest, so when a file lands it drops in with no layout shift at all. A placeholder previews the intended crop; it never borrows someone else's photograph."
      >
        <div className="bento">
          {/* Glass earns its place here and nowhere else on this page: a
              caption that has to sit ON a photograph without a solid slab
              hiding the part of the image it is captioning. The blur is a
              progressive enhancement — the fallback is an opaque mat, so the
              text is readable either way. */}
          <div className="bento-wide bento-tall relative">
            <PhotoFrame id="F1_STUDIO_FLOOR_WIDE" scale="lead" />
            <p className="glass absolute bottom-3 left-3 px-2.5 py-1.5">
              <span className="t-micro">F1 · studio floor, wide</span>
            </p>
          </div>
          {work.slice(0, 4).map((slot) => (
            <PhotoFrame key={slot.id} id={slot.id} scale="thumb" />
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MachineFrame ratio="4 / 3" className="glow-screen">
            <span className="photo-wait flex h-full w-full items-end">
              <span className="t-micro">machine frame · registration corner</span>
            </span>
          </MachineFrame>
          <PhotoFrame id="C8_EMCAD_STATION" scale="feature" register="machine" />
          <PhotoFrame id="T1_MAIN_TRAINER" scale="feature" />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 07 — the course row
       * ---------------------------------------------------------------- */}
      <Section
        n="06 / catalogue"
        title="A course, as a decision"
        note="The swatch leads, the name and what the technique physically produces follow, and a duration appears only where the studio has confirmed one. Today that is EMCAD DAHAO and nothing else — the other ten must not inherit a number by standing next to it."
      >
        <ul className="board" role="list">
          {coursesByFamily.slice(0, 4).map((c) => (
            <li key={c.slug} className="board-row">
              <span className="flex min-w-0 items-center gap-3">
                <StitchSwatch slug={c.slug} className="w-12 flex-none" />
                <span className="min-w-0">
                  <span className="t-h4 block">{c.nameEn}</span>
                  <span className="t-meta block truncate">{c.production.producesEn}</span>
                </span>
              </span>
              <span className="t-micro">{families[c.family].nameEn}</span>
              <span className="t-meta">
                {c.slug === "emcad-embroidery-design" ? `${EMCAD_DAHAO.durationMonths} months` : "—"}
              </span>
              <span className="act-quiet">
                Details <span aria-hidden="true" className="arrow">→</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 08 — the batch board
       * ---------------------------------------------------------------- */}
      <Section
        n="07 / batch board"
        ground="cloth"
        title="The schedule, as a production board"
        note="Real rows or nothing. Every field is optional because the data contract says so: a row with no recorded trainer renders no trainer rather than an invented one, and there is no fabricated weekend batch anywhere in this system."
      >
        <ul className="board" role="list">
          {SAMPLE_BATCHES.map((b) => (
            <li key={b.course} className="board-row">
              <span className="t-h4">{b.course}</span>
              <span className="t-meta numeric">
                {b.starts} · {b.time}
              </span>
              <span className="t-meta inline-flex items-center gap-1.5">
                <NeedlePoint state={b.state === "full" ? "todo" : "now"} />
                {b.state === "open" ? "Open" : b.state === "filling" ? "Filling" : "Full"}
              </span>
              <span className="act-quiet">
                Book demo <span aria-hidden="true" className="arrow">→</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="t-meta mt-4">
          Status carries a word as well as a mark — never colour alone.
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 09 — proof, in five shapes
       * ---------------------------------------------------------------- */}
      <Section
        n="08 / proof"
        ground="paper"
        title="Five shapes, because proof is five things"
        note="A featured quote, a swipeable rail, a rating, a journey and a one-line micro proof. None of them shares a card component. Everything below is sample or studio-supplied preview content and says so — and none of it can reach structured data."
      >
        <FeaturedReview item={testimonials[0]} locale="en" />

        <div className="mt-10">
          <p className="t-micro mb-3">Review rail</p>
          <ReviewRail items={reviews} locale="en" label="What people say" />
        </div>

        <div className="mt-10 split">
          <div>
            <p className="t-micro mb-3">A journey</p>
            <StoryJourney
              item={stories[0]}
              locale="en"
              labels={{ before: "Before", learned: "Learned", now: "Now" }}
            />
          </div>
          <div>
            <p className="t-micro mb-3">Rating</p>
            <RatingBlock item={googleRating} caption="as reported by the studio" />
            <p className="t-meta mt-3 max-w-prose">
              No review count is shown, and no rating schema is emitted. An
              AggregateRating needs a count, and the figure circulating online is
              an aggregate nobody has been able to verify.
            </p>
            <div className="mt-6">
              <p className="t-micro mb-3">Micro proof</p>
              <MicroProof
                quote="They showed me it was the file, not the machine."
                author="Hitesh V."
                status="sample"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 10 — trust
       * ---------------------------------------------------------------- */}
      <Section
        n="09 / trust"
        title="Labels, figures and the studio's own numbers"
        note="A trusted-by strip drawn as stitched garment labels rather than grey wordmarks, and follower counts set as typography rather than loaded as a third-party widget. The partner names are fictional placeholders for the preview and are marked."
      >
        <TrustedByRail items={partners} locale="en" label="Work sent to us by" />

        <div className="mt-9">
          <SocialProof
            items={socialChannels}
            label="Social"
            followCta="Follow the machine floor"
          />
        </div>

        <dl className="mt-9 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.id}>
              <dt className="t-display numeric leading-none">{s.value}</dt>
              <dd className="t-meta mt-1">{s.labelEn}</dd>
            </div>
          ))}
        </dl>
        <p className="t-meta mt-3">
          These three are verified operational facts, so they carry no marker.
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 11 — actions
       * ---------------------------------------------------------------- */}
      <Section
        n="10 / actions"
        ground="mist"
        title="One decision per context"
        note="Square-cornered rather than pill-shaped, so the controls read as machine controls rather than app chrome. The primary action uses the deeper accent, which carries white at 5.98:1 — the brighter thread red does not, and is for marks."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="act act-primary">
            Book free demo <span aria-hidden="true" className="arrow">→</span>
          </span>
          <span className="act act-secondary">Explore courses</span>
          <span className="act-quiet">
            See all batches <span aria-hidden="true" className="arrow">→</span>
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="chip is-on">All 11</span>
          {Object.entries(families).map(([key, f]) => (
            <span key={key} className="chip">
              {f.nameEn}
            </span>
          ))}
        </div>
        <p className="t-body mt-6 max-w-prose">
          An inline{" "}
          <a href="#top" className="link-thread">
            link inside prose
          </a>{" "}
          is underlined with the same running stitch as everything else, so one
          mark keeps meaning one thing.
        </p>
      </Section>

      <footer className="band-tight on-canvas">
        <div className="wrap">
          <ThreadLine className="mb-5 w-full" />
          <p className="t-meta max-w-prose">
            THREAD / MACHINE / PROOF — the public design system for Karma Design
            Studio &amp; Classes. Internal reference, not indexed and not linked
            from the site. Source: <code>src/app/thread-machine-proof.css</code>.
          </p>
        </div>
      </footer>
    </main>
  );
}
