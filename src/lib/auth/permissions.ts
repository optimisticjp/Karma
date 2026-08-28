/**
 * Karma Console permission model.
 *
 * Two rules govern everything in this file:
 *
 *  1. The OWNER bypasses this table entirely and always holds every
 *     permission. Owner privileges are never represented as grants, so they
 *     can never be partially revoked by editing rows.
 *  2. An ordinary ADMIN holds ONLY what has been granted. There is no implicit
 *     baseline, and no permission here can unlock team administration —
 *     inviting, deactivating or re-permissioning an account is owner-only and
 *     deliberately has no permission key at all (see docs/admin-architecture.md).
 *
 * Permission keys are constants validated by application code before they ever
 * reach the database; `staff_permissions.permission` is a plain varchar, so
 * this list is the only gate.
 */

export const PERMISSIONS = [
  "dashboard.view",
  "applications.view",
  "applications.manage",
  "students.view",
  "students.manage",
  "courses.view",
  "courses.manage",
  "batches.view",
  "batches.manage",
  "attendance.view",
  "attendance.manage",
  "design.view",
  "design.manage",
  "certificates.view",
  "certificates.manage",
  "content.view",
  "content.manage",
  "fees.view",
  "fees.manage",
  "reports.view",
  "audit.view",
  "exports.run",
  "settings.view"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const PERMISSION_SET: ReadonlySet<string> = new Set(PERMISSIONS);

/** Type guard used before any permission string touches the database. */
export function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && PERMISSION_SET.has(value);
}

/**
 * Filters an untrusted list down to known keys, rejecting the whole request if
 * anything is unrecognised. Silently dropping an unknown key would let a typo
 * quietly grant less than the owner intended, so this returns null instead.
 */
export function parsePermissions(values: unknown): Permission[] | null {
  if (!Array.isArray(values)) return null;
  const out: Permission[] = [];
  for (const v of values) {
    if (!isPermission(v)) return null;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

/* ------------------------------- grouping --------------------------------- */

/**
 * Display grouping for the permission editor. Order matters in the UI.
 * `as const` keeps the group keys as literals so `permissions.groups.<key>`
 * message lookups are checked at build time rather than assumed.
 */
export const PERMISSION_GROUPS = [
  { key: "overview", permissions: ["dashboard.view"] },
  { key: "admissions", permissions: ["applications.view", "applications.manage"] },
  { key: "students", permissions: ["students.view", "students.manage"] },
  {
    key: "teaching",
    permissions: [
      "courses.view",
      "courses.manage",
      "batches.view",
      "batches.manage",
      "attendance.view",
      "attendance.manage"
    ]
  },
  { key: "designLab", permissions: ["design.view", "design.manage"] },
  { key: "certificates", permissions: ["certificates.view", "certificates.manage"] },
  { key: "content", permissions: ["content.view", "content.manage"] },
  { key: "fees", permissions: ["fees.view", "fees.manage"] },
  {
    key: "insight",
    permissions: ["reports.view", "audit.view", "exports.run", "settings.view"]
  }
] as const satisfies ReadonlyArray<{ key: string; permissions: readonly Permission[] }>;

/* ------------------------------- templates -------------------------------- */

/**
 * Starting points, not roles. The owner picks one when inviting and then edits
 * individual permissions freely; nothing in the system remembers which template
 * was used, so a template can never quietly re-assert itself later.
 */
export const PERMISSION_TEMPLATES = {
  admissions: [
    "dashboard.view",
    "applications.view",
    "applications.manage",
    "students.view",
    "students.manage",
    "courses.view",
    "batches.view",
    "reports.view"
  ],
  academy: [
    "dashboard.view",
    "students.view",
    "students.manage",
    "courses.view",
    "courses.manage",
    "batches.view",
    "batches.manage",
    "attendance.view",
    "attendance.manage",
    "certificates.view",
    "certificates.manage",
    "reports.view"
  ],
  designLab: [
    "dashboard.view",
    "design.view",
    "design.manage",
    "reports.view"
  ],
  operations: [
    "dashboard.view",
    "applications.view",
    "applications.manage",
    "students.view",
    "students.manage",
    "batches.view",
    "batches.manage",
    "fees.view",
    "fees.manage",
    "reports.view",
    "exports.run"
  ],
  content: [
    "dashboard.view",
    "content.view",
    "content.manage",
    "courses.view",
    "courses.manage",
    "batches.view",
    "students.view"
  ],
  custom: []
} as const satisfies Record<string, readonly Permission[]>;

export type PermissionTemplate = keyof typeof PERMISSION_TEMPLATES;

export const PERMISSION_TEMPLATE_KEYS = Object.keys(
  PERMISSION_TEMPLATES
) as PermissionTemplate[];

export function isPermissionTemplate(value: unknown): value is PermissionTemplate {
  return typeof value === "string" && value in PERMISSION_TEMPLATES;
}

export function templatePermissions(template: PermissionTemplate): Permission[] {
  return [...PERMISSION_TEMPLATES[template]];
}
