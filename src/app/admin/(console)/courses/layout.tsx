import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";

export default async function CoursesLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin("/admin/courses");

  return (
    <>
      {session.role === "owner" ? (
        <div className="mb-5 flex justify-end">
          <Link href="/admin/courses/import" className="btn btn-secondary">
            {session.staff.adminLocale === "gu"
              ? "Verified catalogue import કરો"
              : "Import verified catalogue"}
          </Link>
        </div>
      ) : null}
      {children}
    </>
  );
}
