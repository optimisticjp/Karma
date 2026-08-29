/**
 * The `redirectTo` handed to `inviteUserByEmail()`, in one place so the two
 * callers (the Team invite action and the owner bootstrap script) cannot drift
 * apart from each other or from the Supabase email template.
 *
 * Deliberately carries NO query string. The hosted **Invite user** template
 * appends the token fields itself:
 *
 *     {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite
 *
 * If `redirectTo` already contained `?next=...`, that template line would
 * produce a second `?` and silently break every invitation. Keeping the base
 * URL clean makes the separator unambiguous, and the callback defaults `next`
 * to `/admin/welcome` anyway, so nothing is lost.
 */
export function inviteRedirectTo(siteUrl?: string): string {
  const base = (siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  return `${base}/admin/auth/callback`;
}
