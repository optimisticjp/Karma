import { NextRequest, NextResponse } from "next/server";
import { getUpcomingBatches } from "@/lib/db/queries";

/** Read-only upcoming batches for client widgets; cacheable for 5 minutes. */
export async function GET(req: NextRequest) {
  const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "3");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 12) : 3;
  const courseSlug = req.nextUrl.searchParams.get("course") ?? undefined;
  const result = await getUpcomingBatches({ limit, courseSlug });
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
  });
}
