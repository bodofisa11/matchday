"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORTS } from "@/app/lib/v2/types";

const TABS = [
  { href: "/v2/home", label: "Home", dot: null as null | "foot" | "f1" | "crk" },
  ...SPORTS.map((s) => ({ href: `/v2/${s.slug}`, label: s.label, dot: s.dot })),
];

export function Navbar({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  const pathname = usePathname() || "/v2/home";
  // pathname is /v2/<seg>/...; the tab key is the segment after "v2".
  const seg = pathname.split("/").filter(Boolean)[1] ?? "home";

  function isOn(href: string) {
    const target = href.split("/").filter(Boolean)[1] ?? "home";
    return seg === target;
  }

  return (
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
  );
}
