import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

/**
 * Figures for "Today at Karma".
 *
 * Every number here is counted from a table the current schema actually has.
 * Nothing is estimated, projected or padded — if the database is not connected
 * the dashboard says so rather than showing a plausible-looking zero, and no
 * metric exists for a module that has not shipped (CLAUDE.md #2).
 *
 * One round trip: the request-scoped pool holds a single connection
 * (`max: 1`), so five parallel counts would serialise anyway. A single
 * scalar-subquery SELECT is both faster and easier to reason about.
 *
 * Dates are pinned to Asia/Kolkata: "today" means today in Surat, not in UTC.
 */

export type DashboardCounts = {
  newApplications: number;
  followUpsDue: number;
  applicationsThisWeek: number;
  runningBatches: number;
  upcomingBatches: number;
  newBriefs: number;
  openBriefs: number;
};

export type DashboardResult =
  | { available: true; counts: DashboardCounts }
  | { available: false; counts: null };

const IST = "Asia/Kolkata";

export async function getDashboardCounts(): Promise<DashboardResult> {
  const db = getDb();
  if (!db) return { available: false, counts: null };

  try {
    const today = sql.raw(`(now() at time zone '${IST}')::date`);

    const rows = await db.execute<{
      new_applications: string;
      follow_ups_due: string;
      applications_this_week: string;
      running_batches: string;
      upcoming_batches: string;
      new_briefs: string;
      open_briefs: string;
    }>(sql`
      select
        (select count(*) from applications where status = 'new')                       as new_applications,
        (select count(*) from applications
          where next_follow_up is not null
            and next_follow_up <= ${today}
            and status not in ('enrolled', 'not_proceeding', 'closed'))                as follow_ups_due,
        (select count(*) from applications
          where created_at >= now() - interval '7 days')                               as applications_this_week,
        (select count(*) from batches
          where start_date <= ${today}
            and (end_date is null or end_date >= ${today})
            and status in ('open', 'full', 'started'))                                 as running_batches,
        (select count(*) from batches
          where start_date > ${today} and status = 'open')                             as upcoming_batches,
        (select count(*) from service_enquiries where status = 'new')                  as new_briefs,
        (select count(*) from service_enquiries
          where status not in ('delivered', 'closed'))                                 as open_briefs
    `);

    const r = rows.rows[0];
    if (!r) return { available: false, counts: null };

    const n = (v: string | number | null | undefined) => Number(v ?? 0);
    return {
      available: true,
      counts: {
        newApplications: n(r.new_applications),
        followUpsDue: n(r.follow_ups_due),
        applicationsThisWeek: n(r.applications_this_week),
        runningBatches: n(r.running_batches),
        upcomingBatches: n(r.upcoming_batches),
        newBriefs: n(r.new_briefs),
        openBriefs: n(r.open_briefs)
      }
    };
  } catch (e) {
    console.error("[dashboard] counts failed", e);
    return { available: false, counts: null };
  }
}

export type ActivityRow = {
  id: number;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: Date;
};

/**
 * The most recent audit entries. Only real recorded events — an empty list
 * renders an empty state, never a sample.
 */
export async function getRecentActivity(limit = 6): Promise<ActivityRow[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db.execute<ActivityRow>(sql`
      select id, action, entity, entity_id as "entityId", created_at as "createdAt"
        from audit_logs
       order by created_at desc
       limit ${limit}
    `);
    return rows.rows;
  } catch (e) {
    console.error("[dashboard] activity failed", e);
    return [];
  }
}
