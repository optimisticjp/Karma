import { signOutAction } from "@/lib/admin/signout-action";

/**
 * Sign out as a POST, not a link: a GET that destroys a session can be
 * triggered by any image tag on any page. A form action carries Next.js's own
 * action-id protection, which is what makes this CSRF-safe.
 */
export function SignOutLink({
  label,
  className = "stitch-link text-smallmeta font-semibold"
}: {
  label: string;
  className?: string;
}) {
  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
