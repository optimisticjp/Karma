#!/usr/bin/env bash
#
# Re-sync .claude/skills/ (and the Spec Kit machinery in .specify/) from the
# upstream skill library.
#
#   Upstream: https://github.com/optimisticjp/claude-web-builder-skills
#   Docs:     docs/claude-skills.md
#
# This script REPLACES the local skill tree with upstream's. It does not commit,
# does not push, and touches nothing else in the repository. Review the diff
# yourself — that review is the point, and it is why this is a script you run
# deliberately rather than a scheduled job.
#
#   ./scripts/sync-claude-skills.sh              # sync from upstream main
#   ./scripts/sync-claude-skills.sh <ref>        # sync from a branch/tag/commit
#
# Two adaptations are re-applied every run, because upstream ships them broken
# and Karma cannot carry them as-is. Both are explained in docs/claude-skills.md:
#
#   1. .claude/skills/ui-ux-pro-max/{scripts,data} are dangling symlinks upstream
#      that resolve to src/ui-ux-pro-max/ — inside Karma's real application
#      source tree. They are dropped.
#   2. .specify/memory/constitution.md upstream is a generic "Web Builder
#      Template Constitution". Karma's own is kept instead; it points at
#      CLAUDE.md and docs/project-context.md.

set -euo pipefail

UPSTREAM="https://github.com/optimisticjp/claude-web-builder-skills.git"
REF="${1:-main}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [ ! -f package.json ] || ! grep -q '"karma-design-studio"' package.json; then
  echo "error: run this from the Karma repository." >&2
  exit 1
fi

if [ -n "$(git status --porcelain .claude .specify 2>/dev/null)" ]; then
  echo "error: .claude/ or .specify/ has uncommitted changes." >&2
  echo "       Commit or stash them first, so the sync diff is readable." >&2
  exit 1
fi

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

echo "Fetching $UPSTREAM @ $REF ..."
git clone --quiet --depth 1 --branch "$REF" "$UPSTREAM" "$work/src" 2>/dev/null \
  || {
    # --branch does not accept a raw commit sha; fall back to a full fetch.
    git clone --quiet "$UPSTREAM" "$work/src"
    git -C "$work/src" checkout --quiet "$REF"
  }

commit="$(git -C "$work/src" rev-parse HEAD)"
echo "Upstream commit: $commit"

if [ ! -d "$work/src/.claude/skills" ]; then
  echo "error: upstream has no .claude/skills directory." >&2
  exit 1
fi

# ---- skills -----------------------------------------------------------------
rm -rf .claude/skills
mkdir -p .claude
cp -a "$work/src/.claude/skills" .claude/skills

# Adaptation 1: drop the dangling symlinks that point into src/.
find .claude/skills -type l -print -delete

cat > .claude/skills/ui-ux-pro-max/UPSTREAM-NOTE.md <<'NOTE'
# Upstream note — `ui-ux-pro-max` is prose-only in this repository

This skill's `SKILL.md` refers to a Python helper (`scripts/search.py`) and a
local dataset (`data/`). **Neither exists here, and neither existed upstream.**

In the source repository (`optimisticjp/claude-web-builder-skills`) those two
paths were dangling symlinks pointing at `src/ui-ux-pro-max/{scripts,data}` — a
directory that has never existed in that repository's history. The skill has
therefore always shipped without its tooling.

Those symlinks were **not** carried into Karma, because here `src/` is the real
Next.js application: a broken link pointing into the app's own source tree is
misleading at best and, if something ever materialised it, would drop
unrelated files inside `src/`.

**What this means for you:** the guidance in `SKILL.md` is fully usable — read
it and apply it. Do not run the `python3 .../scripts/search.py` commands it
documents; they cannot work. Do not create `src/ui-ux-pro-max/` to satisfy
them.

This is the only adaptation made to any imported skill. See `docs/claude-skills.md`.
NOTE

# ---- Spec Kit machinery -----------------------------------------------------
# The ten speckit-* skills declare "Requires spec-kit project structure with
# .specify/". Adaptation 2: keep Karma's constitution, take everything else.
if [ -d "$work/src/.specify" ]; then
  karma_constitution=""
  if [ -f .specify/memory/constitution.md ]; then
    karma_constitution="$work/karma-constitution.md"
    cp .specify/memory/constitution.md "$karma_constitution"
  fi
  rm -rf .specify
  cp -a "$work/src/.specify" .specify
  rm -f .specify/memory/constitution.md
  mkdir -p .specify/memory
  if [ -n "$karma_constitution" ]; then
    cp "$karma_constitution" .specify/memory/constitution.md
  fi
fi

# ---- report -----------------------------------------------------------------
skills=$(find .claude/skills -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')
definitions=$(find .claude/skills -name SKILL.md | wc -l | tr -d ' ')

cat <<SUMMARY

Synced.
  upstream ref     $REF
  upstream commit  $commit
  skill directories $skills
  SKILL.md files    $definitions

Next:
  1. git status && git diff --stat            # read what actually changed
  2. Update the commit recorded in docs/claude-skills.md to $commit
  3. npm run typecheck && npm run lint && npm test && npm run build
  4. Commit on a branch and open a PR. Never sync straight onto main.
SUMMARY
