import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

const ratios: Record<string, string> = {
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  free: "h-full w-full"
};

/**
 * Honest placeholder for photography (no-ghost-content rule). NEVER swap in
 * stock: each slot names its shot on the studio shoot list
 * (docs/content-checklist.md). Editorial slots pass rounded-none via
 * className (spec: 0px radius for editorial images, 12-16px for cards).
 */
export function PhotoSlot({
  label,
  ratio = "3/2",
  className
}: {
  label: string;
  ratio?: keyof typeof ratios;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "bg-grid flex items-center justify-center overflow-hidden rounded-xl border border-line bg-ivory-2 p-6 text-center",
        ratios[ratio],
        className
      )}
    >
      <p className="flex max-w-xs flex-col items-center gap-2 text-smallmeta text-stone">
        <Icon name="camera" size={22} className="text-stone/70" />
        <span>{label}</span>
      </p>
    </div>
  );
}
