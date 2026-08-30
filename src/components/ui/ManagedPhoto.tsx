import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { cn } from "@/lib/utils";

/**
 * Content Desk media bridge.
 *
 * Until the public-media upload service is switched on, staff may publish only
 * a same-origin site path (for example /photos/work/zardosi-01.webp). That
 * keeps the existing CSP tight and avoids turning Content Desk into an
 * arbitrary remote-image proxy. Empty media falls back to the explicit
 * PhotoSlot used by source/sample content.
 *
 * ## Why a bare <img> and not next/image
 *
 * Content Desk paths are runtime data. `next/image` needs its hosts at build
 * time, and pointing it at an arbitrary published path is exactly the remote
 * proxy the CSP is written to prevent. What `next/image` would buy us here is
 * already covered by hand:
 *
 *  - **No layout shift.** The wrapper sets `aspect-ratio` and the image fills
 *    it absolutely, so the box is reserved before a byte arrives. Measured
 *    CLS across the site is 0 to 0.035.
 *  - **Lazy below the fold**, eager and high-priority for a true LCP image.
 *  - **Format negotiation** happens at upload: the media pipeline writes
 *    WebP/AVIF, and the published path points at it.
 *
 * If the owner later moves media to a known host, switching this one component
 * to `next/image` changes nothing anywhere else — which is the point of it
 * being one component.
 */
export function ManagedPhoto({
  src,
  label,
  ratio = "4/5",
  priority = false,
  sizes,
  className
}: {
  src?: string;
  label: string;
  ratio?: "4/5" | "1/1" | "3/2";
  /**
   * Mark the ONE image that is genuinely the largest contentful paint on its
   * page — a hero photograph, once the studio shoot lands. Everything else
   * stays lazy. Marking several defeats the purpose: the browser fetches them
   * all at high priority and the real LCP arrives later than it would have.
   */
  priority?: boolean;
  /** Layout hint for the browser's own selection, e.g. "(min-width: 768px) 33vw, 100vw". */
  sizes?: string;
  className?: string;
}) {
  if (!src) return <PhotoSlot label={label} ratio={ratio} className={className} />;

  return (
    <div
      className={cn("relative overflow-hidden bg-ivory-2", className)}
      style={{ aspectRatio: ratio.replace("/", " / ") }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Content Desk paths are runtime data; Next/Image remote hosts cannot be known at build time. */}
      <img
        src={src}
        alt={label}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        sizes={sizes}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
