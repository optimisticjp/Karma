# Public and Console UX policy

Owner decisions implemented 2026-09-01:

- Public and Console language choice is English/Gujarati and uses the compact `EN।ગુજ` mark.
- The public primary menu has an explicit Home destination.
- Active, public, unarchived courses created in Karma Console are part of the public catalogue and Book Demo choices even when no long-form editorial source entry exists yet.
- Console-only courses use conservative public fallback copy rather than invented curriculum, outcomes or production claims.
- Course fee amounts are staff operational records. Public pages do not publish fee amounts; the current fee and changing commercial terms are confirmed at the studio.
- Course fee, payment schedule and admission-norm version remain editable and prominent in Console.
- Social reach/reputation sits directly below the homepage hero as an early trust signal.
- Book Demo choice state uses the Karma vermilion accent plus a check mark, so selection is not dependent on subtle colour change alone.
- Admission norms are visible on the admission page without a disclosure click.
- Public form Turnstile tokens auto-refresh when expired/timed out and brief retries reset the challenge after a security rejection.

Cloudflare remains the production edge. A deployed Turnstile widget must allow every production hostname used by the public site, including a Workers preview hostname while that hostname is used for testing.
