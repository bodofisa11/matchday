"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORTS } from "@/app/lib/v2/types";

const TABS = [
  { href: "/", label: "Home", dot: null as null | "foot" | "f1" | "crk" },
  ...SPORTS.map((s) => ({ href: `/${s.slug}`, label: s.label, dot: s.dot })),
];

export function Navbar({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  const pathname = usePathname() || "/";
  const seg = "/" + (pathname.split("/").filter(Boolean)[0] ?? "");

  function isOn(href: string) {
    if (href === "/") return seg === "/";
    return seg === href;
  }

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
  );
}
