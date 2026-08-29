import type { ReactNode } from "react";

/**
 * Shared first viewport for public interior pages.
 *
 * The left side answers "where am I / what is this / why should I care".
 * The optional right rail is reserved for decision-making facts or context,
 * never decorative filler. This keeps interior pages consistent without making
 * their content identical.
 */
export function PageIntro({
  eyebrow,
  title,
  lede,
  actions,
  aside,
  className = ""
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`page-intro ${className}`.trim()}>
      <div className="container-site page-intro-grid">
        <div className="page-intro-copy">
          {eyebrow ? <div className="eyebrow u-eyebrow-gap">{eyebrow}</div> : null}
          <h1 className="page-intro-title">{title}</h1>
          {lede ? <div className="page-intro-lede">{lede}</div> : null}
          {actions ? <div className="page-intro-actions">{actions}</div> : null}
        </div>
        {aside ? <aside className="page-intro-aside">{aside}</aside> : null}
      </div>
    </section>
  );
}
