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
        <p className="alert mt-8">{t("team.notConfigured")}</p>
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

      <p className="form-note mt-6">
        {t("team.seatsUsed", { used: seatsUsed, total: MAX_ADMIN_SEATS })}
      </p>

      <div className="mt-6">
        <InviteAdminForm
          groups={groups}
          templates={templates}
          labels={labels}
          seatsFull={seatsFull}
          inviteUnavailable={!adminClientConfigured()}
        />
      </div>

      {/* -------------------------------- owner ---------------------------- */}
      {owner ? (
        <section className="panel mt-10">
          <div className="panel-head">
            <h2 className="text-h4">{t("team.roles.owner")}</h2>
            <span className="status status-active">{t("team.status.active")}</span>
          </div>
          <div className="panel-body">
            <p className="text-smallmeta font-semibold">{owner.name}</p>
            <p className="form-note">{owner.email}</p>
            <p className="form-note mt-3">{t("team.ownerNote")}</p>
          </div>
        </section>
      ) : null}

      {/* -------------------------------- admins --------------------------- */}
      <section className="mt-10" aria-labelledby="admins-heading">
        <h2 id="admins-heading" className="text-h4">
          {t("team.roles.admin")}
        </h2>

        {admins.length === 0 ? (
          <p className="empty-state mt-4">{t("team.empty")}</p>
        ) : (
          <div className="mt-4 grid gap-6">
            {admins.map((admin) => (
              <article key={admin.id} className="panel">
                <div className="panel-head flex-wrap">
                  <div>
                    <h3 className="text-h4">{admin.name}</h3>
                    <p className="form-note">{admin.email}</p>
                  </div>
                  <StatusPill
                    status={admin.active ? admin.status : "deactivated"}
                    labels={{
                      invited: t("team.status.invited"),
                      active: t("team.status.active"),
                      deactivated: t("team.status.deactivated")
                    }}
                  />
                </div>

                <div className="panel-body grid gap-5">
                  <dl className="grid gap-3 sm:grid-cols-3">
                    <Fact label={t("team.columns.invited")} value={formatDate(admin.invitedAt)} />
                    <Fact
                      label={t("team.columns.lastSeen")}
                      value={admin.lastSeenAt ? formatDate(admin.lastSeenAt) : t("team.never")}
                    />
                    <Fact
                      label={t("team.columns.permissions")}
                      value={
                        admin.permissions.length === 0
                          ? t("team.noPermissions")
                          : t("team.permissionCount", { count: admin.permissions.length })
                      }
                    />
                  </dl>

                  <details>
                    <summary className="cursor-pointer text-smallmeta font-semibold">
                      {t("team.permissions")}
                    </summary>
                    <div className="mt-4">
                      <EditPermissionsForm
                        staffId={admin.id}
                        initial={admin.permissions}
                        groups={groups}
                        labels={labels}
                      />
                    </div>
                  </details>

                  <SetActiveForm staffId={admin.id} activate={!admin.active} labels={labels} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="microlabel">{label}</dt>
      <dd className="mt-1 text-smallmeta">{value}</dd>
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
  return <span className={`status ${tone}`}>{labels[status]}</span>;
}

function formatDate(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
