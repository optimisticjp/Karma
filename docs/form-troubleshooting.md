# Public form troubleshooting

Both Admission and Services Brief use Cloudflare Turnstile before data is stored.

If `/api/health` reports Turnstile configured but a live public form returns a Turnstile/security error, verify the Cloudflare Turnstile widget's hostname allowlist. The public hostname being tested must be allowed. During Workers preview testing that includes the active `*.workers.dev` hostname; after a custom domain is active, allow that hostname too.

The client now refreshes expired/time-out challenges automatically. Services Brief also resets the challenge after a rejected token so a retry does not reuse a single-use token.

Database/storage errors remain server-side typed errors. Email delivery is best-effort and does not make a successfully stored enquiry fail.
