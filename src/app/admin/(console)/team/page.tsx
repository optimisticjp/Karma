import { requireOwner } from "@/lib/auth/guard";
import { PageHead } from "@/components/admin/PageHead";
import { getAdminT } from "@/lib/admin/i18n";
import { listConsoleStaff } from "@/lib/auth/staff";
import { adminClientConfigured } from "@/lib/supabase/admin";
import { dbConfigured } from "@/lib/db";
import {
  PERMISSION_GROUPS,
  PERMISSION_TEMPLATE_KEYS,
  templatePermissions
} from "@/lib/auth/permissions";
import { countAdminSeats, MAX_ADMIN_SEATS } from "@/lib/auth/seats";
import {
  EditPermissionsForm,
  InviteAdminForm,
  SetActiveForm,
  type PermissionGroupOption,
  type TeamLabels,
  type TemplateOption
} from "./TeamForms";

/**
 * Team — OWNER ONLY.
 *
 * `requireOwner()` is the control. An ordinary admin who types this URL is
 * redirected, and every server action behind the buttons re-checks the owner
 * role independently, so hiding the nav link is the least of what stops them.
 *
 * There is no delete button anywhere on this page. Accounts are deactivated,
 * never removed: admin history matters, and audit rows must keep pointing at a
 * real staff record.
 */
export default async function TeamPage() {
  const session = await requireOwner("/admin/team");
  const t = getAdminT(session.staff.adminLocale);

  if (!dbConfigured()) {
    return (
      <div className="max-w-[48rem]">
        <PageHead title={t("team.title")} context={t("team.lede")} />
        <p className="alert mt-6">{t("team.notConfigured")}</p>
      </div>
    );
  }

  const staff = await listConsoleStaff();
  const admins = staff.filter((s) => s.role === "admin");
  const owner = staff.find((s) => s.role === "owner");
  const seatsUsed = countAdminSeats(staff);
  const seatsFull = seatsUsed >= MAX_ADMIN_SEATS;

  const groups: PermissionGroupOption[] = PERMISSION_GROUPS.map((group) => ({
    key: group.key,
    title: t(`permissions.groups.${group.key}`),
    permissions: group.permissions.map((key) => ({
      key,
      label: t(`permissions.keys.${key}`)
    }))
  }));

  const templates: TemplateOption[] = PERMISSION_TEMPLATE_KEYS.map((key) => ({
    key,
    label: t(`team.templates.${key}`),
    permissions: templatePermissions(key)
  }));

  // Flat label bag: the client components stay dumb, the catalog stays server-side.
  const labels: TeamLabels = {
    invite: t("team.invite"),
    inviteTitle: t("team.inviteTitle"),
    inviteUnavailable: t("team.inviteUnavailable"),
    name: t("team.name"),
    email: t("team.email"),
    template: t("team.template"),
    templateHint: t("team.templateHint"),
    language: t("team.language"),
    permissions: t("team.permissions"),
    sendInvite: t("team.sendInvite"),
    sending: t("team.sending"),
    cancel: t("team.cancel"),
    save: t("team.save"),
    saving: t("team.saving"),
    deactivate: t("team.deactivate"),
    reactivate: t("team.reactivate"),
    seatsFull: t("team.errors.seatsFull"),
    "errors.denied": t("team.errors.denied"),
    "errors.invalidEmail": t("team.errors.invalidEmail"),
    "errors.invalidName": t("team.errors.invalidName"),
    "errors.invalidPermission": t("team.errors.invalidPermission"),
    "errors.duplicate": t("team.errors.duplicate"),
    "errors.seatsFull": t("team.errors.seatsFull"),
    "errors.ownerSelf": t("team.errors.ownerSelf"),
    "errors.notAdmin": t("team.errors.notAdmin"),
    "errors.inviteFailed": t("team.errors.inviteFailed"),
    "errors.generic": t("team.errors.generic"),
    "success.invited": t("team.success.invited", { email: "{email}" }),
    "success.permissions": t("team.success.permissions"),
    "success.deactivated": t("team.success.deactivated"),
    "success.reactivated": t("team.success.reactivated"),
    // Succeeded in Karma, but a Supabase-side step could not be confirmed.
    "warnings.reactivatedAuthPending": t("team.warnings.reactivatedAuthPending"),
    "warnings.deactivatedAuthPending": t("team.warnings.deactivatedAuthPending")
  };

  return (
    <div className="max-w-[64rem]">
      <PageHead title={t("team.title")} context={t("team.lede")} />

      <p className="form-note mt-4">
        {t("team.seatsUsed", { used: seatsUsed, total: MAX_ADMIN_SEATS })}
      </p>

      <div className="mt-4">
        <InviteAdminForm
          groups={groups}
          templates={templates}
          labels={labels}
          seatsFull={seatsFull}
          inviteUnavailable={!adminClientConfigured()}
        />
      </div>

      {/* ------------------------------ the team --------------------------- */}
      {/* One list, Owner first. The Owner used to be a 280px panel of its own
          above a heading and a second list, restating a role the page's own
          title already establishes; each admin was a 443px `panel` whose three
          facts, permission editor and activate button were all rendered open,
          so five admins were 2,215px before the operator reached anything.

          The Owner is a plain row because nothing on this page can act on it.
          Every admin is a disclosure: the row carries name, email, status and
          permission count — enough to answer "who has access to what" without
          opening anything — and the editor and the deactivate control live
          inside. There is still no delete affordance anywhere. */}
      <section className="mt-6" aria-labelledby="team-heading">
        <h2 id="team-heading" className="text-h4">{t("team.accounts")}</h2>

        <div className="data-list mt-3">
          {owner ? (
            <div className="data-row">
              <span className="data-row__title">{owner.name}</span>
              <span className="data-row__actions">
                <span className="chip status-active">{t("team.status.active")}</span>
              </span>
              <span className="data-row__meta">
                <span>{t("team.roles.owner")}</span>
                <span className="break-all">{owner.email}</span>
              </span>
            </div>
          ) : null}

          {admins.map((admin) => {
            const status = admin.active ? admin.status : "deactivated";
            return (
              <details key={admin.id}>
                <summary className="data-row">
                  <span className="data-row__title">{admin.name}</span>
                  <span className="data-row__actions">
                    <StatusPill
                      status={status}
                      labels={{
                        invited: t("team.status.invited"),
                        active: t("team.status.active"),
                        deactivated: t("team.status.deactivated")
                      }}
                    />
                  </span>
                  <span className="data-row__meta">
                    <span className="break-all">{admin.email}</span>
                    <span>
                      {admin.permissions.length === 0
                        ? t("team.noPermissions")
                        : t("team.permissionCount", { count: admin.permissions.length })}
                    </span>
                  </span>
                </summary>

                <div className="border-t border-line px-3 py-3 md:px-4">
                  <dl className="kv-grid">
                    <Fact
                      label={t("team.columns.invited")}
                      value={formatDate(admin.invitedAt, session.staff.adminLocale)}
                    />
                    <Fact
                      label={t("team.columns.lastSeen")}
                      value={
                        admin.lastSeenAt
                          ? formatDate(admin.lastSeenAt, session.staff.adminLocale)
                          : t("team.never")
                      }
                    />
                  </dl>

                  <div className="mt-4">
                    <EditPermissionsForm
                      staffId={admin.id}
                      initial={admin.permissions}
                      groups={groups}
                      labels={labels}
                    />
                  </div>

                  <div className="mt-4 border-t border-line pt-3">
                    <SetActiveForm staffId={admin.id} activate={!admin.active} labels={labels} />
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        {admins.length === 0 ? <p className="empty-state mt-3">{t("team.empty")}</p> : null}
        <p className="form-note mt-3">{t("team.ownerNote")}</p>
      </section>
    </div>
  );
}


function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="kv-label">{label}</dt>
      <dd className="mt-0.5 text-smallmeta">{value}</dd>
    </div>
  );
}

function StatusPill({
  status,
  labels
}: {
  status: "invited" | "active" | "deactivated";
  labels: Record<"invited" | "active" | "deactivated", string>;
}) {
  const tone =
    status === "active" ? "status-active" : status === "invited" ? "status-pending" : "status-off";
  return <span className={`chip ${tone}`}>{labels[status]}</span>;
}

/* The dates were formatted `en-IN` for both locales until 2026-08-31 — an
   English month abbreviation inside an otherwise Gujarati screen. */
function formatDate(value: Date | null, locale: "en" | "gu") {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
