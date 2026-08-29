import fs from "node:fs";

function saveJson(path, data) {
  fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

for (const locale of ["en", "gu"]) {
  const path = `messages/${locale}.json`;
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  const admin = data.admin;
  delete admin.mfa;
  delete admin.today?.moduleLater;
  if (locale === "en") {
    admin.welcome.lede = "Your invitation is confirmed. Choose a password to finish setting up your Karma Console account.";
    admin.account.lede = "Your sign-in, console language and access.";
  } else {
    admin.welcome.lede = "તમારું invitation confirm થઈ ગયું. Karma Console account પૂરું set up કરવા તમારો password પસંદ કરો.";
    admin.account.lede = "તમારું sign-in, console language અને access.";
  }
  for (const key of ["mfa", "mfaOn", "mfaOff", "assurance", "assuranceAal2", "assuranceAal1", "mfaNote"]) {
    delete admin.account[key];
  }
  saveJson(path, data);
}

function edit(path, transforms) {
  let text = fs.readFileSync(path, "utf8");
  for (const [pattern, replacement] of transforms) text = text.replace(pattern, replacement);
  fs.writeFileSync(path, text);
}

edit("docs/phase-prompts.md", [
  ["Cloudflare Hyperdrive, Supabase Auth with mandatory TOTP MFA, the", "Cloudflare Hyperdrive, invite-only Supabase email/password Auth, the"],
  [/\*\*Auth security prerequisites — DONE in the Phase 2 foundation\*\*[\s\S]*?\n\n\*\*Carry into the next phases\*\*/, `**Auth security prerequisites — DONE in the Phase 2 foundation**\nSupabase Auth owns credential hashing; login runs as a Server Action with per-IP and per-email rate limiting and one generic error; session cookies are managed by \`@supabase/ssr\`; Karma Console is password-only; every server action re-checks session, staff lifecycle, role and permission; admin bundles never load from public pages; team mutations write \`audit_logs\`. Still open: audit entries for login success/failure.\n\n**Carry into the next phases**`]
]);

edit("docs/security.md", [
  [/Staff auth is Supabase Auth with \*\*mandatory TOTP MFA\*\*, invitation-only\n  accounts and app-layer authorization on every console page and server\n  action\./, "Staff auth is Supabase Auth with **invite-only email/password sign-in** and app-layer authorization on every console page and server action."],
  [/\*\*The access decision\*\*[\s\S]*?rejected on their very next request\./, `**The access decision** (\`src/lib/auth/access.ts\`, pure and unit-tested) requires: verified user → linked staff record → \`active\` → console role → lifecycle **\`status === "active"\`** → the required permission. Karma Console is password-only; assurance level is not an access gate. A deactivated admin holding an old session is rejected on their very next request.`],
  [/\*\*An invited account is not a console account\.\*\*[\s\S]*?again\./, `**An invited account is not a console account.** A pending invitation is stored \`active: true\` because it reserves one of the five seats. An \`invited\` row reaches \`/admin/welcome\` and nothing else. \`requireInvitedConsoleUser()\` still demands a verified Supabase user, linked staff record, active account, console role and lifecycle \`invited\`. An unlinked or deactivated account cannot onboard, and an already accepted account cannot set its password again.`],
  [/\*\*Acceptance is transactional and gates MFA\.\*\*[\s\S]*?duplicate\n audit row\./, `**Acceptance is transactional.** The \`invited → active\` transition, \`accepted_at\` and the \`admin.accepted\` audit row commit together or not at all. If they fail, onboarding stops with a generic retryable error; retries are idempotent and write no duplicate audit row.`],
  [/\*\*MFA is mandatory\*\*[\s\S]*?implemented unsafely\./, `**Password-only sign-in is the product policy.** Supabase Auth verifies the password; Karma's staff lifecycle, role and explicit permissions remain the authorization controls. There is no authenticator enrollment/challenge or MFA recovery flow in Karma Console.`],
  ["accounts require the owner role at AAL2, checked inside each server action", "accounts require the owner role, checked inside each server action"],
  ["Audit\nrows never carry a password, TOTP secret, token, key, credential or invitation", "Audit\nrows never carry a password, token, key, credential or invitation"],
  ["- MFA recovery: a supervised owner-initiated factor reset, with audit.\n", ""]
]);

edit("docs/admin-architecture.md", [
  ["│  password+TOTP │", "│ email+password │"],
  ["browser, **auth flows only** (TOTP enrol/verify)", "browser, **auth flows only** (sign-in/session refresh)"],
  [/\| `invited` \| \*\*yes\*\* — reserved from the moment the invite is sent \| `\/admin\/welcome` \(set a password\), then MFA enrolment \| any console page or server action, \*\*even at AAL2\*\* \|/, "| `invited` | **yes** — reserved from the moment the invite is sent | `/admin/welcome` (set a password) | any console page or server action |"],
  [/\| `active` \| yes \| the console, subject to AAL2 and permissions \| — \|/, "| `active` | yes | the console, subject to permissions | — |"],
  [/\| `deactivated` \| no — the seat is freed \| nothing at all \| onboarding, MFA screens, the console \|/, "| `deactivated` | no — the seat is freed | nothing at all | onboarding/auth screens, the console |"],
  ["without it, an invited\naccount that reached AAL2 would be indistinguishable from an accepted one", "without it, an invited account would be indistinguishable from an accepted one"],
  ["server action, onboarding and MFA screens alike.", "server action and onboarding/auth screens alike."],
  [/1\. a verified Supabase user[\s\S]*?Nor is a dead account walked through enrolling an authenticator\n it will never use\./, `1. a verified Supabase user\n2. a linked \`staff\` record\n3. \`staff.active === true\` (and not lifecycle \`deactivated\`)\n4. a console role (owner or admin)\n5. **lifecycle \`status === "active"\`** — an \`invited\` account is still onboarding\n6. the permission the operation requires\n\nAll six matter. A valid Supabase user without a staff row gets nothing. A deactivated admin holding an old session is rejected on their next request because \`staff.active\` is read server-side every time. An invited account is sent to \`/admin/welcome\` and reaches no console data.`],
  [/## 8\. MFA[\s\S]*?---\n\n## 9\. Invitation flow/, `## 8. Password-only sign-in\n\nKarma Console deliberately uses invite-only email + password sign-in. Supabase assurance-level fields remain compatibility metadata in the auth layer, but they do not gate console access. The security controls are the verified Supabase identity, linked/active staff lifecycle, owner/admin role, explicit permission checks, invitation-only account creation, seat limits, database RLS lockdown and audit logging.\n\nThere are no MFA setup/challenge routes and no authenticator recovery workflow.\n\n---\n\n## 9. Invitation flow`],
  ["### Acceptance is a transaction, and it gates MFA", "### Acceptance is a transaction"],
  ["It does not continue to MFA, because the staff row is the authority: until the", "It does not continue into the console, because the staff row is the authority: until the"],
  ["| Login, MFA setup, MFA challenge, invite acceptance | shipped |", "| Login + invite acceptance (password-only) | shipped |"],
  ["src/app/admin/(auth)/…         login, MFA, welcome, no-access", "src/app/admin/(auth)/…         login, welcome, no-access"]
]);

edit("src/lib/auth/guard.ts", [
  ["/** Any console account (owner or admin), MFA satisfied. */", "/** Any active console account (owner or admin), password-authenticated. */"],
  [" * The ONE console guard that runs below AAL2, for invitation acceptance.\n *\n * A person cannot enrol an authenticator before they have the password that\n * gets them a session, so requiring AAL2 at /admin/welcome would deadlock\n * every invitation. Everything else is still required, and is checked here\n * rather than assumed:", " * The narrow onboarding guard for invitation acceptance. Everything needed\n * before an invited account may set its password is checked here:"],
  [" * So an unlinked Supabase user cannot use the onboarding flow, a deactivated\n * account cannot, and an account that has already accepted is sent onward to\n * MFA or the console instead of being allowed to set a password again.", " * So an unlinked Supabase user cannot use onboarding, a deactivated account\n * cannot, and an account that already accepted is sent to the console instead\n * of being allowed to set a password again."],
  ["      // land on MFA setup, MFA challenge or the console itself.", "      // land on the ordinary console/access destination."]
]);

edit("next.config.ts", [
  ["//     client (@supabase/ssr) calls /auth/v1/user and /auth/v1/factors from", "//     client (@supabase/ssr) calls Supabase Auth endpoints from"],
  ["//     the page, so without it sign-in and TOTP enrolment are blocked.", "//     the page, so without it staff sign-in/session refresh is blocked."]
]);
