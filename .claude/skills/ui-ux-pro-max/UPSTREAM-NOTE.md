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
