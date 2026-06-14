"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORTS } from "@/app/lib/v2/types";
import { useCompactTables, toggleCompactTables } from "@/app/lib/use-compact-tables";

type Dot = null | "foot" | "f1" | "crk";

const TABS: { href: string; label: string; dot: Dot }[] = [
  { href: "/", label: "Home", dot: null },
  ...SPORTS.map((s) => ({ href: `/${s.slug}`, label: s.label, dot: s.dot as Dot })),
  { href: "/world-cup", label: "FIFA World Cup", dot: "foot" },
  { href: "/predictions", label: "Predict", dot: null },
  { href: "/ufc", label: "UFC", dot: null },
];

/** First path segment, "" for the root home route. */
function firstSeg(path: string): string {
  return path.split("/").filter(Boolean)[0] ?? "";
}

export function Navbar({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  const pathname = usePathname() || "/";
  const seg = firstSeg(pathname);
  const [open, setOpen] = useState(false);
  const compact = useCompactTables();

  function isOn(href: string) {
    return seg === firstSeg(href);
  }

  // ESC closes menu
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="wf-nav">
      <Link href="/" className="wf-logo">
        MATCHDAY
      </Link>

      <div className="wf-tabs">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={`wf-tab${isOn(t.href) ? " on" : ""}`}>
            {t.dot && <span className={`wf-dot ${t.dot}`} />}
            {t.label}
          </Link>
        ))}
      </div>

      <div className="wf-navicons">
        <button
          type="button"
          className={`wf-ico${compact ? " on" : ""}`}
          onClick={toggleCompactTables}
          aria-label="Toggle compact tables"
          aria-pressed={compact}
          title="Compact tables"
        >
          ▤
        </button>
        <button
          type="button"
          className="wf-ico"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {dark ? "☀" : "◑"}
        </button>
        <span className="wf-ico round" aria-hidden />
      </div>

      {/* Mobile burger + dropdown (hidden on desktop via CSS) */}
      <button
        type="button"
        className="wf-burger"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? "✕" : "≡"}
      </button>
      {open && (
        <>
          <div className="wf-nav-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <div className="wf-nav-menu" role="menu">
            <div className="wf-nav-menu-tabs">
              {TABS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`wf-nav-menu-tab${isOn(t.href) ? " on" : ""}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {t.dot && <span className={`wf-dot ${t.dot}`} />}
                  {t.label}
                </Link>
              ))}
            </div>
            <div className="wf-nav-menu-actions">
              <button
                type="button"
                className="wf-nav-menu-action"
                onClick={toggleCompactTables}
                aria-label="Toggle compact tables"
              >
                <span>▤</span> {compact ? "Comfortable tables" : "Compact tables"}
              </button>
              <button
                type="button"
                className="wf-nav-menu-action"
                onClick={onToggleTheme}
                aria-label="Toggle theme"
              >
                <span>{dark ? "☀" : "◑"}</span> {dark ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
