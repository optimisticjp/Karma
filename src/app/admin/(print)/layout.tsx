import "./print.css";
import { requireAdmin } from "@/lib/auth/guard";

/**
 * The A4 print shell.
 *
 * A separate route group from `(console)` on purpose: a printable sheet must
 * not inherit the navigation rail, the sticky header or the console's ivory
 * page. Printing an operational screen produces a page with a nav column down
 * one side, buttons that do nothing on paper, and a table cut in half at the
 * page break — which is exactly what the owner asked not to have.
 *
 * Authorization is unchanged. `requireAdmin` runs here as it does for the
 * console, and every sheet re-checks the specific permission its data needs:
 * a fee receipt is not readable by someone who cannot see fees just because
 * they can reach a print route.
 */
export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <div className="sheet-root" lang={session.staff.adminLocale}>{children}</div>;
}
