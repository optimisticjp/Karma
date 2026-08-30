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

/* -------------------------------------------------------------------------- *
 * The queues behind "Today at Karma".
 *
 * A count tells an operator that seven things need attention. A queue tells
 * them which seven, so they can start on the first one without a second
 * navigation. That difference is the whole point of the screen, and it is why
 * this exists alongside `getDashboardCounts()` rather than replacing it — the
 * counts still head each queue.
 *
 * FREE-TIER DISCIPLINE
 * --------------------
 * Every list is capped, every query is gated on the caller's permission, and
 * nothing runs for a queue the operator cannot open. An admin with only
 * attendance rights costs one query, not five. The request-scoped pool holds a
 * single connection, so these await in sequence by design; that is cheaper
 * than parallel calls that would serialise anyway.
 *
 * WHAT A ROW MAY CARRY
 * --------------------
 * Only what an operator needs to decide whether to act now: a name, what it is
 * about, and when it is due. No phone numbers — a queue is scanned in public,
 * at a counter, and the number lives one tap away on the record itself.
 * -------------------------------------------------------------------------- */

export type EnquiryRow = {
  id: number;
  reference: string;
  fullName: string;
  courseSlug: string | null;
  createdAt: Date;
};

export type FollowUpRow = {
  id: number;
  reference: string;
  fullName: string;
  status: string;
  nextFollowUp: string;
};

export type BatchRow = {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  status: string;
  seats: number;
  seatsTaken: number;
};

export type BriefRow = {
  id: number;
  reference: string;
  name: string;
  status: string;
  deadline: string | null;
};

export type TodayQueues = {
  newApplications: EnquiryRow[];
  followUps: FollowUpRow[];
  batches: BatchRow[];
  briefs: BriefRow[];
};

const EMPTY_QUEUES: TodayQueues = {
  newApplications: [],
  followUps: [],
  batches: [],
  briefs: []
};

/** How many rows a queue shows before it defers to its own module. */
export const QUEUE_LIMIT = 5;

export async function getTodayQueues(want: {
  admissions: boolean;
  batches: boolean;
  design: boolean;
}): Promise<TodayQueues> {
  const db = getDb();
  if (!db) return EMPTY_QUEUES;

  const today = sql.raw(`(now() at time zone '${IST}')::date`);
  const queues: TodayQueues = { ...EMPTY_QUEUES };

  try {
    if (want.admissions) {
      const applications = await db.execute<{
        id: number;
        reference: string;
        full_name: string;
        course_slug: string | null;
        created_at: string;
      }>(sql`
        select id, reference, full_name, course_slug, created_at
        from applications
        where status = 'new'
        order by created_at desc
        limit ${QUEUE_LIMIT}
      `);
      queues.newApplications = applications.rows.map((r) => ({
        id: Number(r.id),
        reference: r.reference,
        fullName: r.full_name,
        courseSlug: r.course_slug,
        createdAt: new Date(r.created_at)
      }));

      const followUps = await db.execute<{
        id: number;
        reference: string;
        full_name: string;
        status: string;
        next_follow_up: string;
      }>(sql`
        select id, reference, full_name, status, next_follow_up
        from applications
        where next_follow_up is not null
          and next_follow_up <= ${today}
          and status not in ('enrolled', 'not_proceeding', 'closed')
        order by next_follow_up asc
        limit ${QUEUE_LIMIT}
      `);
      queues.followUps = followUps.rows.map((r) => ({
        id: Number(r.id),
        reference: r.reference,
        fullName: r.full_name,
        status: r.status,
        nextFollowUp: r.next_follow_up
      }));
    }

    if (want.batches) {
      const batches = await db.execute<{
        id: number;
        label: string;
        start_time: string;
        end_time: string;
        status: string;
        seats: number;
        seats_taken: number;
      }>(sql`
        select id, label, start_time, end_time, status, seats, seats_taken
        from batches
        where archived_at is null
          and start_date <= ${today}
          and (end_date is null or end_date >= ${today})
          and status in ('open', 'full', 'started')
        order by start_time asc
        limit ${QUEUE_LIMIT + 1}
      `);
      queues.batches = batches.rows.map((r) => ({
        id: Number(r.id),
        label: r.label,
        startTime: r.start_time,
        endTime: r.end_time,
        status: r.status,
        seats: Number(r.seats),
        seatsTaken: Number(r.seats_taken)
      }));
    }

    if (want.design) {
      const briefs = await db.execute<{
        id: number;
        reference: string;
        name: string;
        status: string;
        deadline: string | null;
      }>(sql`
        select id, reference, name, status, deadline
        from service_enquiries
        where status not in ('delivered', 'closed')
        order by (deadline is null), deadline asc, created_at asc
        limit ${QUEUE_LIMIT}
      `);
      queues.briefs = briefs.rows.map((r) => ({
        id: Number(r.id),
        reference: r.reference,
        name: r.name,
        status: r.status,
        deadline: r.deadline
      }));
    }

    return queues;
  } catch (e) {
    console.error("[dashboard] queues failed", e);
    return EMPTY_QUEUES;
  }
}
