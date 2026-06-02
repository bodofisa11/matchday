"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORTS } from "@/app/lib/v2/types";

const TABS = [
  { href: "/v2/home", label: "Home", dot: null as null | "foot" | "f1" | "crk" },
  ...SPORTS.map((s) => ({ href: `/v2/${s.slug}`, label: s.label, dot: s.dot })),
];

export function Navbar({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  const pathname = usePathname() || "/v2/home";
  const seg = pathname.split("/").filter(Boolean)[1] ?? "home";
  const [open, setOpen] = useState(false);

  function isOn(href: string) {
    const target = href.split("/").filter(Boolean)[1] ?? "home";
    return seg === target;
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
    <>
      <nav className="wf-nav">
        <Link href="/v2/home" className="wf-logo">
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
          <button type="button" className="wf-ico" aria-label="Search">
            ⌕
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
      </nav>

      {/* Mobile floating menu — hidden on desktop via CSS */}
      <button
        type="button"
        className="wf-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? "✕" : "≡"}
      </button>
      {open && (
        <>
          <div className="wf-fab-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <div className="wf-fab-menu" role="menu">
            <Link href="/v2/home" className="wf-fab-logo" onClick={() => setOpen(false)}>
              MATCHDAY
            </Link>
            <div className="wf-fab-tabs">
              {TABS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`wf-fab-tab${isOn(t.href) ? " on" : ""}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {t.dot && <span className={`wf-dot ${t.dot}`} />}
                  {t.label}
                </Link>
              ))}
            </div>
            <div className="wf-fab-actions">
              <button type="button" className="wf-fab-action" aria-label="Search">
                <span>⌕</span> Search
              </button>
              <button
                type="button"
                className="wf-fab-action"
                onClick={() => {
                  onToggleTheme();
                }}
                aria-label="Toggle theme"
              >
                <span>{dark ? "☀" : "◑"}</span> {dark ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
