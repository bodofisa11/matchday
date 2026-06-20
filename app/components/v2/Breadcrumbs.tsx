import Link from "next/link";

export interface Crumb {
  label: string;
  /** Omit on the last (current) crumb so it renders as plain text. */
  href?: string;
}

/** Slash-separated trail (e.g. Football / Premier League / Manchester City). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="wf-center"
      style={{ gap: 8, flexWrap: "wrap", marginBottom: 16 }}
    >
      {items.map((c, i) => (
        <span key={i} className="wf-center" style={{ gap: 8 }}>
          {i > 0 && (
            <span className="wf-muted" aria-hidden>
              /
            </span>
          )}
          {c.href ? (
            <Link
              href={c.href}
              className="wf-mono-sm wf-muted"
              style={{ textDecoration: "none" }}
            >
              {c.label}
            </Link>
          ) : (
            <span className="wf-mono-sm" style={{ fontWeight: 600 }} aria-current="page">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
