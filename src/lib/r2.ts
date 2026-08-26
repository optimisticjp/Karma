/**
 * R2 access via the native Workers binding (BRIEF_FILES in wrangler.jsonc).
 * Confidential B2B design files: private bucket, no public URLs; downloads
 * happen through authenticated admin routes in Phase 2 (signed access).
 */
type R2BucketLike = {
  put: (
    key: string,
    value: ArrayBuffer | ReadableStream,
    opts?: { httpMetadata?: { contentType?: string } }
  ) => Promise<unknown>;
};

export async function getBriefBucket(): Promise<R2BucketLike | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    const env = ctx.env as Record<string, unknown>;
    const bucket = env["BRIEF_FILES"] as R2BucketLike | undefined;
    return bucket ?? null;
  } catch {
    return null; // not running on Workers / binding not configured yet
  }
}
