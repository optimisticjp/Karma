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
  for (const key of ["mfa", "mfaOn", "mfaOff", "assurance", "assuranceAal2", "assuranceAal1", "mfaNote"]) delete admin.account[key];
  saveJson(path, data);
}

function edit(path, fn) {
  const before = fs.readFileSync(path, "utf8");
  fs.writeFileSync(path, fn(before));
}

function between(text, start, end, replacement) {
  const a = text.indexOf(start);
  if (a < 0) return text;
  const b = text.indexOf(end, a + start.length);
  if (b < 0) return text;
  return text.slice(0, a) + replacement + text.slice(b);
}

edit("docs/admin-architecture.md", (input) => {
  let text = input
    .replace("│  password+TOTP │", "│ email+password │")
    .replace("browser, **auth flows only** (TOTP enrol/verify)", "browser, **auth flows only** (sign-in/session refresh)")
    .replace("Transactional email → Resend.", "Auth/invitation email → Supabase custom SMTP.")
    .replace("authorizeAction({ ownerOnly: true })      owner + active + AAL2", "authorizeAction({ ownerOnly: true })      owner + active")
    .replace("/admin/mfa/setup       enrols an authenticator   ← forced, no way past\nKarma Console                                     ← only at AAL2, only when active", "/admin                         Karma Console ← password-authenticated, active, permission-checked")
    .replace("### Acceptance is a transaction, and it gates MFA", "### Acceptance is a transaction")
    .replace("It does not continue to MFA, because the staff row is the authority: until the", "It does not continue into the console, because the staff row is the authority: until the")
    .replace("| Login, MFA setup, MFA challenge, invite acceptance | shipped |", "| Login + invite acceptance (password-only) | shipped |")
    .replace("src/app/admin/(auth)/…         login, MFA, welcome, no-access", "src/app/admin/(auth)/…         login, welcome, no-access");

  text = between(
    text,
    "1. a verified Supabase user",
    "Guards, all in `src/lib/auth/guard.ts`",
    "1. a verified Supabase user\n2. a linked `staff` record\n3. `staff.active === true` (and not lifecycle `deactivated`)\n4. a console role (owner or admin)\n5. **lifecycle `status === \"active\"`** — an `invited` account is still onboarding\n6. the permission the operation requires\n\nAll six matter. A valid Supabase user without a staff row gets nothing. A deactivated admin holding an old session is rejected on their next request because `staff.active` is read server-side every time. An invited account is sent to `/admin/welcome` and reaches no console data.\n\n"
  );

  text = between(
    text,
    "`requireInvitedConsoleUser()` is the **one** guard",
    "A server action must not redirect",
    "`requireInvitedConsoleUser()` is the narrow onboarding guard. It still demands a verified Supabase user, a **linked** staff record, `active`, a console role and lifecycle `invited`. An unlinked or deactivated account cannot onboard, and an already accepted account is sent onward instead of being allowed to set a password again.\n\n"
  );

  const mfaHeading = text.indexOf("## 8. MFA");
  if (mfaHeading >= 0) {
    const invitation = text.indexOf("## 9. Invitation flow", mfaHeading);
    if (invitation >= 0) {
      text = text.slice(0, mfaHeading) + "## 8. Password-only sign-in\n\nKarma Console deliberately uses invite-only email + password sign-in. Supabase assurance-level fields remain compatibility metadata in the auth layer, but they do not gate access. The controls are verified identity, linked/active staff lifecycle, owner/admin role, explicit permissions, invitation-only account creation, seat limits, database RLS lockdown and audit logging.\n\nThere are no MFA setup/challenge routes and no authenticator recovery workflow.\n\n---\n\n" + text.slice(invitation);
    }
  }
  return text;
});

edit("docs/security.md", (input) => {
  let text = input
    .replace(/Staff auth is Supabase Auth with \*\*mandatory TOTP MFA\*\*, invitation-only\s+accounts and app-layer authorization on every console page and server\s+action\./, "Staff auth is Supabase Auth with **invite-only email/password sign-in** and app-layer authorization on every console page and server action.")
    .replace(/\*\*MFA is mandatory\*\*[\s\S]*?implemented unsafely\./, "**Password-only sign-in is the product policy.** Supabase Auth verifies the password; Karma's staff lifecycle, role and explicit permissions remain the authorization controls. There is no authenticator enrollment/challenge or MFA recovery flow in Karma Console.")
    .replace("accounts require the owner role at AAL2, checked inside each server action", "accounts require the owner role, checked inside each server action")
    .replace("- MFA recovery: a supervised owner-initiated factor reset, with audit.\n", "");
  text = between(
    text,
    "**Acceptance is transactional and gates MFA.**",
    "**Invitations are a token-hash flow, not PKCE.**",
    "**Acceptance is transactional.** The `invited → active` transition, `accepted_at` and the `admin.accepted` audit row commit together or not at all. If they fail, onboarding stops with a generic retryable error; retries are idempotent and write no duplicate audit row.\n\n"
  );
  return text;
});

edit("docs/phase-prompts.md", (text) => text
  .replace("Cloudflare Hyperdrive, Supabase Auth with mandatory TOTP MFA, the", "Cloudflare Hyperdrive, invite-only Supabase email/password Auth, the")
  .replace("a Resend outage can never lose a notification", "an email-provider outage can never lose a notification"));

edit("src/lib/auth/guard.ts", (text) => text
  .replace("/** Any console account (owner or admin), MFA satisfied. */", "/** Any active console account (owner or admin), password-authenticated. */")
  .replace("      // land on MFA setup, MFA challenge or the console itself.", "      // land on the ordinary console/access destination."));

edit("next.config.ts", (text) => text
  .replace("//     client (@supabase/ssr) calls /auth/v1/user and /auth/v1/factors from", "//     client (@supabase/ssr) calls Supabase Auth endpoints from")
  .replace("//     the page, so without it sign-in and TOTP enrolment are blocked.", "//     the page, so without it staff sign-in/session refresh is blocked."));

edit("src/lib/admin/content-copy.ts", (text) => text
  .replaceAll("Photo path / HTTPS URL", "Site photo path")
  .replaceAll("Use a site path such as /photos/work/example.webp or an HTTPS image URL. Upload tooling will move to Cloudflare later.", "Use a deployed site path such as /photos/work/example.webp. Keep this item as Draft until the photo exists; upload tooling comes later.")
  .replaceAll("real photo path or HTTPS image URL", "real site photo path")
  .replaceAll("/photos/work/example.webp જેવી site path અથવા HTTPS image URL નાખો. Upload tooling પછી Cloudflare પર જશે.", "/photos/work/example.webp જેવી deployed site path નાખો. Photo તૈયાર ન હોય ત્યાં સુધી Draft રાખો; upload tooling પછી આવશે.")
  .replaceAll("real photo path અથવા HTTPS image URL", "real site photo path"));
