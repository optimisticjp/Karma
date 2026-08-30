# Karma Design Studio — Constitution

**Version:** 1.0.0 · **Scope:** the `optimisticjp/Karma` repository only.

This file exists for one reason: the Spec Kit skills (`/speckit-plan`,
`/speckit-analyze`, and friends) read `.specify/memory/constitution.md` to fill
their **Constitution Check** gate. Without this file they would either find
nothing, or — worse — find the generic "Web Builder Template Constitution" that
ships with the skill source repository, whose principles were written for a
blank Next.js starter and are not Karma's.

**This is a pointer, not a second rulebook.** Karma's governing rules are
written once, in code and in two documents, and nowhere else:

| Source | What it governs |
| --- | --- |
| **`/CLAUDE.md`** | The working contract: non-negotiables, product rules, quality gates, what never to undo. |
| **`/docs/project-context.md`** | The durable project memory: architecture, infrastructure, decisions and their reasons, deferred work, verified vs unverified facts. |
| **The code on `main`** | The final authority. Where a document and the code disagree, the code is right and the document is stale — fix the document. |

## How to run a Constitution Check on Karma

Read `/CLAUDE.md` and the relevant sections of `/docs/project-context.md`, then
check the plan against them. Treat the numbered non-negotiables in `CLAUDE.md`
and the "Decisions that must not be undone" section of `docs/project-context.md`
as the gates. A plan that violates one does not proceed on a documented
exception — it goes back to the owner.

## Amendment

These principles are not amended here. They are amended by changing
`/CLAUDE.md` and `/docs/project-context.md` — and, where the rule is enforced by
code or a test, by changing that too. Amending a rule in one place and not the
others is how the documentation started lying in the first place.
