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
 */
export function ManagedPhoto({
  src,
  label,
  ratio = "4/5",
  className
}: {
  src?: string;
  label: string;
  ratio?: "4/5" | "1/1" | "3/2";
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
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
