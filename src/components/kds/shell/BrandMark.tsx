import { Link } from "@/i18n/navigation";
import { brandLogo } from "@/lib/brand";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The brand, in the header and the footer.
 *
 * Renders the owner's logo when one exists and a wordmark when one does not.
 * The contract, and why each rule is there, is in `src/lib/brand.ts`.
 *
 * THE FALLBACK IS A MARK, NOT A PLACEHOLDER
 * -----------------------------------------
 * "Karma" is set in the display face at full weight and "Design Studio"
 * follows it lighter and muted, so the eye reads one word first — which is how
 * people say the name. A needle point sits before it: the smallest possible
 * piece of the site's own grammar, and the one thing that keeps the wordmark
 * from being any studio's wordmark.
 *
 * It is deliberately good enough to ship. A visibly temporary logo teaches
 * visitors that the business is provisional.
 */
export function BrandMark({
  className,
  /** The footer sets its own scale; the header uses the default. */
  size = "header",
  /** `false` renders the mark without wrapping it in a link to home. */
  asLink = true
}: {
  className?: string;
  size?: "header" | "footer";
  asLink?: boolean;
}) {
  const inner = brandLogo ? (
    /* eslint-disable-next-line @next/next/no-img-element -- next/image
       optimisation is not configured (see docs/project-context.md §38); a
       plain img with explicit intrinsic dimensions reserves the same space
       and ships no loader. */
    <img
      src={brandLogo.src}
      width={brandLogo.width}
      height={brandLogo.height}
      alt={site.legalName}
      className="brand-logo"
    />
  ) : (
    <span className="brand-word">
      <span aria-hidden="true" className="needle brand-needle" />
      <span className="brand-name">Karma</span>{" "}
      <span className="brand-tail">Design Studio</span>
    </span>
  );

  const classes = cn("brand", size === "footer" && "brand-lg", className);

  if (!asLink) return <span className={classes}>{inner}</span>;

  return (
    <Link href="/" className={classes} aria-label={`${site.legalName}: home`}>
      {inner}
    </Link>
  );
}
