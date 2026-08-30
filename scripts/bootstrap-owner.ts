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
 *   - otherwise: invites the address through Supabase Auth Admin, and links
 *     ONLY the auth user that invitation created
 *
 * THE ONE RULE THIS SCRIPT EXISTS TO PROTECT
 * ------------------------------------------
 * Owner is the highest-privilege identity in the system, so Karma never adopts
 * a pre-existing Supabase auth user as Owner. If `inviteUserByEmail` fails for
 * any reason — including "a user with this email already exists" — this script
 * fails closed and tells the operator to go and look. It does NOT search the
 * user list for a matching address and link whatever it finds: a stale, test,
 * or attacker-created account with the right email would then become Owner.
 *
 * It never sets a password, never prints a secret, never prints the invitation
 * link, and never guesses an email address. The owner's own address is printed
 * masked, because the operator typed it and needs to recognise it.
 */
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import * as schema from "../src/lib/db/schema";
import { inviteRedirectTo } from "../src/lib/supabase/invite-redirect";
import { decideOwnerBootstrap } from "../src/lib/admin/bootstrap";
import { persistInvitedAdmin } from "../src/lib/admin/invite-persistence";

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

  const masked = maskEmail(ownerEmail);
  console.log(`Karma owner bootstrap${DRY_RUN ? " (dry run)" : ""}`);
  console.log(`  owner: ${ownerName} <${masked}>`);

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const db = drizzle(pool, { schema });

  try {
    const activeOwners = await db
      .select({
        id: schema.staff.id,
        email: schema.staff.email,
        status: schema.staff.status
      })
      .from(schema.staff)
      .where(and(eq(schema.staff.role, "owner"), eq(schema.staff.active, true)));

    const decision = decideOwnerBootstrap(activeOwners, ownerEmail);

    if (decision.action === "already-owner") {
      console.log("✓ This owner already exists. Nothing to do.");
      console.log(`  staff id: ${decision.staffId}, lifecycle: ${decision.status}`);
      if (decision.status === "invited") {
        console.log("  The invitation has not been accepted yet. If the email was");
        console.log("  lost, re-send it from Supabase → Authentication → Users.");
      }
      return;
    }

    if (decision.action === "refuse") {
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
    // password from the emailed link. Karma Console is password-only, so that
    // is the whole of onboarding. This script never generates or transmits a
    // password.
    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(ownerEmail, {
      redirectTo: inviteRedirectTo(),
      data: { name: ownerName }
    });

    // FAIL CLOSED. An error here most often means an auth user with this
    // address already exists — and that is precisely the case where adopting it
    // would be dangerous. The operator decides, not the script.
    if (error || !data?.user?.id) {
      fail(
        `A Supabase Auth user already exists for ${masked}, or the invitation ` +
          `could not be created (status ${error?.status ?? "unknown"}). Karma will ` +
          "NOT automatically grant Owner access to an existing Auth identity. " +
          "Open Supabase → Authentication → Users, inspect that account, remove " +
          "or resolve it if it is unexpected, then run this script again."
      );
    }

    // From here on the ONLY identity this script will ever link is the one this
    // invitation just created.
    const newAuthUserId = data.user.id;

    const outcome = await persistInvitedAdmin(newAuthUserId, {
      // Staff row + audit row in ONE transaction: an owner that is not recorded
      // is worse than no owner.
      persist: async () => {
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
              authUserId: newAuthUserId,
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
      },
      hasStaffForAuthUser: async (id) => {
        const rows = await db
          .select({ id: schema.staff.id })
          .from(schema.staff)
          .where(eq(schema.staff.authUserId, id))
          .limit(1);
        return rows.length > 0;
      },
      deleteAuthUser: async (id) => {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
        if (deleteError) {
          console.error(`  cleanup failed (status ${deleteError.status ?? "unknown"})`);
          return false;
        }
        return true;
      }
    });

    if (outcome.status === "rolled-back") {
      fail(
        "The Karma owner record could not be saved, so the Supabase auth user " +
          "created for this attempt was removed again. Nothing was left behind: " +
          "fix the database problem and run this script again."
      );
    }

    if (outcome.status === "orphan-requires-recovery") {
      console.error("");
      console.error("✖ MANUAL RECOVERY REQUIRED");
      console.error("");
      console.error("  The Karma owner record could not be saved, and the Supabase auth");
      console.error(`  user created for ${masked} could not be removed automatically.`);
      console.error("  Karma has NO owner, and an unlinked auth user now exists.");
      console.error("");
      console.error("  To recover:");
      console.error("    1. Supabase → Authentication → Users, find that address.");
      console.error("    2. Confirm Karma does not reference it:");
      console.error("         select id from staff where auth_user_id = '<uuid>';");
      console.error("       It must return no rows. If it returns one, STOP — the");
      console.error("       account is real; do not delete it.");
      console.error("    3. Delete that user in Supabase.");
      console.error("    4. Fix the database problem, then run this script again.");
      console.error("");
      console.error("  Full procedure: docs/admin-architecture.md → orphaned invitation");
      console.error("  recovery.");
      process.exit(1);
    }

    console.log("");
    console.log("Next steps for the owner:");
    console.log("  1. Open the invitation email and follow the link.");
    console.log("  2. Set a password (12+ characters).");
    console.log("  3. Karma Console opens. Invite the first admin from /admin/team.");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  // Never print the raw error object: connection strings and keys travel in
  // pg/supabase error metadata.
  console.error("✖ Bootstrap failed:", e instanceof Error ? e.message : "unknown error");
  process.exit(1);
});
