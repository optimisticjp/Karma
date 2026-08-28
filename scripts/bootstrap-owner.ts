/**
 * Creates the FIRST owner account. There is no other way to make one, and
 * deliberately no public path to it.
 *
 *   npm run admin:bootstrap -- --dry-run     # check, change nothing
 *   npm run admin:bootstrap                  # invite and link the owner
 *
 * Requires, in the environment (a .env file is read automatically):
 *   DATABASE_URL                 direct Supabase Postgres — NOT Hyperdrive
 *   NEXT_PUBLIC_SUPABASE_URL     the Supabase project URL
 *   SUPABASE_SECRET_KEY          privileged key, used for one invite call
 *   INITIAL_OWNER_EMAIL          the owner's email address
 *   INITIAL_OWNER_NAME           optional display name
 *   NEXT_PUBLIC_SITE_URL         optional; used for the invite redirect
 *
 * Behaviour, in order:
 *   - refuses if any required variable is missing
 *   - if THIS email is already the owner → exits 0, changes nothing (idempotent)
 *   - if a DIFFERENT owner exists        → REFUSES and exits 1
 *   - otherwise: invites the address through Supabase Auth Admin, inserts the
 *     staff row with role=owner, and writes one audit entry
 *
 * It never sets a password, never prints a secret, never prints the invitation
 * link, and never guesses an email address.
 */
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as schema from "../src/lib/db/schema";
import { inviteRedirectTo } from "../src/lib/supabase/invite-redirect";

const DRY_RUN = process.argv.includes("--dry-run");

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) fail(`${name} is not set. See docs/admin-architecture.md → manual setup.`);
  return value;
}

/** Masks an address in output: enough to recognise, not enough to harvest. */
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const head = user.slice(0, 2);
  return `${head}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

async function main() {
  const databaseUrl = required("DATABASE_URL");
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const secretKey = required("SUPABASE_SECRET_KEY");
  const ownerEmail = required("INITIAL_OWNER_EMAIL").trim().toLowerCase();
  const ownerName = (process.env.INITIAL_OWNER_NAME ?? "Studio owner").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    fail("INITIAL_OWNER_EMAIL is not a valid email address.");
  }
  if (ownerName.length < 2 || ownerName.length > 120) {
    fail("INITIAL_OWNER_NAME must be between 2 and 120 characters.");
  }

  console.log(`Karma owner bootstrap${DRY_RUN ? " (dry run)" : ""}`);
  console.log(`  owner: ${ownerName} <${maskEmail(ownerEmail)}>`);

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const db = drizzle(pool, { schema });

  try {
    const owners = await db
      .select({
        id: schema.staff.id,
        email: schema.staff.email,
        active: schema.staff.active,
        status: schema.staff.status
      })
      .from(schema.staff)
      .where(and(eq(schema.staff.role, "owner"), eq(schema.staff.active, true)));

    if (owners.length > 0) {
      const existing = owners[0];
      if ((existing.email ?? "").toLowerCase() === ownerEmail) {
        console.log("✓ This owner already exists. Nothing to do.");
        console.log(`  status: ${existing.status}`);
        return;
      }
      fail(
        "A DIFFERENT active owner already exists. Karma allows exactly one. " +
          "Transferring ownership is a supervised procedure, not a script — see " +
          "docs/admin-architecture.md → ownership transfer."
      );
    }

    if (DRY_RUN) {
      console.log("✓ Dry run: no owner exists, and this address would be invited.");
      console.log("  Re-run without --dry-run to send the invitation.");
      return;
    }

    // Supabase Auth owns the credential. We invite; the owner sets their own
    // password from the emailed link and then enrols an authenticator. This
    // script never generates or transmits a password.
    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(ownerEmail, {
      redirectTo: inviteRedirectTo(),
      data: { name: ownerName }
    });

    let authUserId = data?.user?.id ?? null;

    if (error || !authUserId) {
      // Re-running after a partial failure is normal: the auth user may already
      // exist from an earlier attempt. Find it rather than failing outright.
      console.warn(`  invite returned an error (${error?.status ?? "unknown"}); looking for an existing auth user…`);
      authUserId = await findAuthUserId(supabase, ownerEmail);
      if (!authUserId) {
        fail(
          "Could not invite or find the Supabase auth user. Check that email " +
            "sign-in is enabled and the redirect URL is allow-listed."
        );
      }
      console.log("  found an existing Supabase auth user; linking it.");
    }

    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.staff)
        .values({
          name: ownerName,
          email: ownerEmail,
          role: "owner",
          status: "invited",
          active: true,
          adminLocale: "en",
          authUserId,
          invitedAt: new Date()
        })
        .returning({ id: schema.staff.id });

      const staffId = inserted[0].id;

      await tx.insert(schema.auditLogs).values({
        actor: "system",
        action: "admin.owner.bootstrapped",
        entity: "staff",
        entityId: String(staffId),
        oldValue: null,
        // Names, roles and an email — never a token, link, key or password.
        newValue: { name: ownerName, email: ownerEmail, role: "owner" },
        reason: "initial owner bootstrap script"
      });

      console.log(`✓ Owner staff record created (id ${staffId}).`);
    });

    console.log("");
    console.log("Next steps for the owner:");
    console.log("  1. Open the invitation email and follow the link.");
    console.log("  2. Set a password (12+ characters).");
    console.log("  3. Scan the authenticator QR code and enter the six-digit code.");
    console.log("  4. Karma Console opens. Invite the first admin from /admin/team.");
  } finally {
    await pool.end();
  }
}

/** Looks up an existing auth user by email, paging until found. */
async function findAuthUserId(
  supabase: SupabaseClient,
  email: string
): Promise<string | null> {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

main().catch((e) => {
  // Never print the raw error object: connection strings and keys travel in
  // pg/supabase error metadata.
  console.error("✖ Bootstrap failed:", e instanceof Error ? e.message : "unknown error");
  process.exit(1);
});
