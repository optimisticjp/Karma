# The imported Claude skill library

`.claude/skills/` in this repository is a **vendored copy** of a shared skill
library. It is not Karma's own work, it is not part of the application, and it
ships nothing to the Worker. It exists so that a Claude Code session opened
directly on this repository has the same toolbox available as one opened on the
template it came from — without anyone having to copy files between repos by
hand.

| | |
| --- | --- |
| **Source repository** | [`optimisticjp/claude-web-builder-skills`](https://github.com/optimisticjp/claude-web-builder-skills) |
| **Source branch** | `main` |
| **Source commit** | `ceb9b0a449f619f37542c0f1acc1c94f986e7b6d` |
| **Imported on** | 2026-08-30 |
| **Destination** | `.claude/skills/` (plus `.specify/`, see below) |
| **Skills imported** | **322** — 322 directories, 322 `SKILL.md` definitions, 2 111 files, ~37 MB |
| **Full per-skill inventory** | [`docs/claude-skills-inventory.md`](./claude-skills-inventory.md) — the upstream `INSTALL_REPORT.md`, copied verbatim |

The 322 come from twelve upstream sources:

| Source | Skills |
| --- | ---: |
| UI/UX Pro Max | 7 |
| Blader Humanizer | 1 |
| Frontend Design (Anthropic) | 1 |
| Claude SEO | 25 |
| Marketing Skills | 44 |
| OWASP Security | 1 |
| TDD Guard | 1 |
| Context Engineering Kit | 67 |
| Claude Scientific Skills | 147 |
| Claude Mem | 17 |
| GitHub Spec Kit (pinned `v0.12.9`) | 10 |
| shadcn/ui (official) | 1 |

---

## How a future Claude session should use them

**Selectively.** 322 skills is a library, not a checklist. The failure mode this
section exists to prevent is a session that opens `/seo`, `/cro`, `/humanizer`,
`/frontend-design` and `/owasp-security` on a one-line copy fix, produces five
skill-shaped preambles, and changes one word.

The order that works:

1. **Understand the task first.** Read `CLAUDE.md`, then
   `docs/project-context.md`, then the code you are about to touch.
2. **Ask whether a skill materially helps.** Most Karma work — a copy fix, a
   console field, a doc correction — does not need one.
3. **Invoke only the ones that do**, by name: `/owasp-security` before shipping
   a new public endpoint, `/write-tests` when a contract needs covering,
   `/humanizer` on English marketing copy.
4. **Karma's rules outrank the skill's.** Every skill was written for a generic
   project. Where a skill's advice collides with `CLAUDE.md`, the non-negotiables
   in `CLAUDE.md` win, every time, without needing a justification.

That last point is the important one, so here it is concretely. Skills in this
library will, in good faith, tell you to do things that are wrong for Karma:

| A skill may suggest | Karma's answer |
| --- | --- |
| Install shadcn/ui components, run `npx shadcn add …` | No. Karma has its own design system ("Screen to Stitch"). There is no `components.json` here, deliberately. See `docs/design-system.md`. |
| Add a charting or admin-component library | No. `CLAUDE.md` §11 — the Worker has a size budget. |
| Add an analytics provider, a consent banner, a tag manager | No. `src/lib/analytics.ts` is a deliberate no-network, no-PII abstraction. |
| Add a payment/checkout flow to a pricing page | Never. `CLAUDE.md` §3. |
| Publish `aggregateRating`, reviews, durations or opening hours for SEO | Never, while they are unverified. `CLAUDE.md` §2, `docs/content-checklist.md`. |
| Upgrade to Next.js 16 to match the template | No. Karma is on Next 15.5 with OpenNext and Hyperdrive; the template's version is irrelevant here. |
| `npm install` whatever the skill mentions | Only when Karma actually needs it for real work in front of you. A skill mentioning a package is not a reason to add a dependency. |

**Do not edit an imported skill definition** to make it agree with Karma. The
next sync would overwrite the edit, and the disagreement is not a bug — it is
two documents written for two different projects. Record the Karma-specific
rule in `CLAUDE.md` or `docs/project-context.md`, where it survives.

---

## What was, and was not, imported

The source repository is *also* a generic Next.js 16 starter template. Karma is
a real application. **Only the skill library came across.**

Imported:

- `.claude/skills/` — every skill directory, `SKILL.md`, and the scripts,
  assets, templates and reference files inside them, with executable bits and
  directory structure intact.
- `.specify/` — the Spec Kit scripts, templates, workflows and integration
  manifests. The ten `speckit-*` skills declare
  *"Requires spec-kit project structure with `.specify/` directory"* and invoke
  `.specify/scripts/bash/*` directly, so without this they are decorative.
- `INSTALL_REPORT.md` → `docs/claude-skills-inventory.md`, as provenance.

Deliberately **not** imported — importing any of these would have damaged the
application:

`src/` · `package.json` · `package-lock.json` · `next.config.ts` ·
`postcss.config.mjs` · `eslint.config.mjs` · `tsconfig.json` ·
`components.json` · `21ST_DEV_GUIDE.md` · the starter `README.md` · the starter
`CLAUDE.md` · the starter's design tokens and UI components · `skills-lock.json`
· `.agents/` (a mirror of the shadcn skill for a different agent runtime).

No dependency was added to `package.json`. No application file was changed to
accommodate a skill.

### The two adaptations

Everything else is byte-identical to upstream. Two things could not be:

**1. `ui-ux-pro-max` lost two dangling symlinks.** Upstream,
`.claude/skills/ui-ux-pro-max/scripts` and `…/data` are symlinks to
`src/ui-ux-pro-max/{scripts,data}` — a directory that has never existed in that
repository's history, so they are broken there too. In Karma, `src/` is the real
application source tree, and a broken link pointing into it is misleading at
best. They were dropped and replaced with
`.claude/skills/ui-ux-pro-max/UPSTREAM-NOTE.md`, which explains the situation to
whoever reads the skill next. The skill's guidance is unaffected; only its
(already missing) Python tooling is.

**2. `.specify/memory/constitution.md` is Karma's, not the template's.**
Upstream ships a "Web Builder Template Constitution" that opens by claiming it
*"applies to every project created from this GitHub template"* and *"supersedes
ad-hoc preferences expressed only in chat."* Left in place, `/speckit-plan`
would have run its Constitution Check against a generic starter's principles
instead of Karma's. It was replaced with a short pointer document that sends the
check to `CLAUDE.md` and `docs/project-context.md`.

---

## Caveats worth knowing before you invoke something

These come from upstream and are not Karma bugs.

- **Skills needing an external service.** `/mem-search`, `/knowledge-agent`,
  `/smart-explore`, `/pathfinder` (Claude Mem) need a Docker container and an
  MCP server. **Do not set one up for Karma.** This repository is the durable
  memory: `CLAUDE.md` + `docs/project-context.md` are designed to be sufficient
  with no plugin, no daemon and no external service running.
- **`/tdd-guard`** needs a per-project npm install (`tdd-guard-vitest` or
  equivalent). Karma has not installed it. Karma tests with plain Vitest
  (`npm test`); that is the gate CI enforces.
- **API-key SEO skills.** `/seo-dataforseo` and `/seo-google` need external API
  credentials. None are configured, and none should be added to this repo's
  environment for a skill's benefit.
- **`/shadcn`** is installed and functional as a skill, but Karma has no
  `components.json` and does not use shadcn/ui. Read it if you want; do not
  `init` it here.
- **The 147 scientific skills** (`scanpy`, `rdkit`, `qiskit`, `pytorch-lightning`,
  bioinformatics, quantum, …) are irrelevant to an embroidery-studio website.
  They are present because the library is imported whole. Ignore them.
- **Spec Kit** is available end to end
  (`constitution → specify → clarify → plan → checklist → tasks → analyze →
  implement → converge`) and is worth it for a genuinely new subsystem. It is
  overkill for the copy fix, doc correction and single-field work that most
  Karma sessions actually are.

## Repository impact

Adding the library costs the repo ~37 MB and ~2 100 files. Worth knowing:

- **Nothing here reaches the Worker.** The bundle is built from `src/` and
  `package.json`; `.claude/` and `.specify/` are not inputs to
  `@opennextjs/cloudflare build`, are not in `public/`, and do not count against
  the Worker size budget (`CLAUDE.md` §11).
- Cloudflare's Git integration clones the repository on every build, so builds
  fetch a little more. Not enough to matter.
- **Two config files had to change**, and they are the only application files
  the import touched. ESLint's default scan reached `.claude/skills/`, where
  vendored CommonJS helpers and one file that does not parse as modern JS
  produced 16 errors and failed `npm run lint`. `.claude/**` and `.specify/**`
  are now in the ESLint `ignores`, and in `tsconfig.json`'s `exclude` as well —
  the imported tree is Markdown, Python and shell today, but `tsconfig.json`
  includes `**/*.ts`, so a future sync that brings a TypeScript file would
  otherwise break `npm run typecheck`. Karma's own source and scripts are still
  fully linted and typechecked.
- `npm ci`, `test` and `build` are untouched; no dependency was added.

---

## Syncing from upstream later

```bash
./scripts/sync-claude-skills.sh            # from upstream main
./scripts/sync-claude-skills.sh <ref>      # from a branch, tag or commit
```

The script clones upstream, replaces `.claude/skills/` and `.specify/`
wholesale, re-applies both adaptations above, and prints the commit it synced.
It refuses to run if `.claude/` or `.specify/` has uncommitted changes, so the
resulting diff is always readable.

It deliberately does **not** commit, push, or run on a schedule. A sync pulls
several thousand files of instructions that future sessions will act on, and
that is a thing a person should look at. The steps after running it:

1. `git diff --stat` — read what changed. New skills are fine; a skill that
   disappeared upstream is worth a moment's thought.
2. Update the **Source commit** in the table at the top of this file.
3. `npm run typecheck && npm run lint && npm test && npm run build`.
4. Commit on a branch, open a PR, merge when CI and Cloudflare are green.

Never sync straight onto `main`.

---

## Related

- [`CLAUDE.md`](../CLAUDE.md) — the working contract for every session here.
- [`docs/project-context.md`](./project-context.md) — the durable project memory.
- [`docs/claude-skills-inventory.md`](./claude-skills-inventory.md) — the full
  upstream per-skill inventory.
