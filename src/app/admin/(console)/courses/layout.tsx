import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/guard";

/**
 * The owner-only "Import verified catalogue" button used to sit here. Removed
 * on the owner's request (2026-08-30) — the catalogue is settled, so a bulk
 * import button on every courses screen is a hazard rather than a shortcut.
 *
 * The route itself is untouched and still owner-guarded, so restoring the
 * button is a few lines. This layout keeps `requireAdmin` even though both
 * child pages guard themselves: hidden navigation is never the security
 * boundary (CLAUDE.md #8), and the guard is what actually gates the segment.
 */
export default async function CoursesLayout({ children }: { children: ReactNode }) {
  await requireAdmin("/admin/courses");
  return <>{children}</>;
}
