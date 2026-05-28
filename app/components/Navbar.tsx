"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { CompactTablesToggle } from "./CompactTablesToggle";
import { APP_VERSION, isPrerelease } from "../lib/version";

export type SportGroup = "today" | "football" | "f1" | "cricket" | "ufc" | "wc26";

const GROUP_LABELS: Record<SportGroup, string> = {
  today: "Today",
  football: "Football",
  f1: "Formula 1",
  cricket: "Cricket",
  ufc: "UFC",
  wc26: "WC26",
};

const GROUPS: SportGroup[] = ["today", "football", "f1", "cricket", "ufc", "wc26"];

// Groups other than wc26 live on the home page. Click navigates to /?group=<id>.
function groupHref(group: SportGroup): string {
  if (group === "wc26") return "/wc26";
  if (group === "today") return "/";
  return `/?group=${group}`;
}

interface NavbarProps {
  // Provided only when rendered inside the home route. When set, in-route group
  // switching uses the setter instead of a Link navigation so state is preserved.
  activeGroup?: SportGroup;
  onGroupChange?: (group: SportGroup) => void;
}

export function Navbar({ activeGroup, onGroupChange }: NavbarProps) {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const onHome = pathname === "/" || pathname === "";
  const onWc26 = pathname.startsWith("/wc26");
  // On /wc26 the active group is wc26 regardless of any prop. On home use the prop.
  const resolvedActive: SportGroup | null = onWc26
    ? "wc26"
    : (activeGroup ?? null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function handleSelect(group: SportGroup) {
    setMenuOpen(false);
    // In-route group switch only works on home for non-wc26 groups.
    if (onHome && group !== "wc26" && onGroupChange) {
      onGroupChange(group);
    }
  }

  function renderTab(group: SportGroup, isMenu: boolean) {
    const isActive = resolvedActive === group;
    const className = isMenu
      ? `nav-menu-item${isActive ? " active" : ""}`
      : `sport-group-tab${isActive ? " active" : ""}${group === "today" ? " today-tab" : ""}`;
    const label = GROUP_LABELS[group];

    // Use a button (state switch) when on home and group is home-bound.
    if (onHome && group !== "wc26" && onGroupChange) {
      return (
        <button
          key={group}
          className={className}
          role={isMenu ? "menuitem" : undefined}
          onClick={() => handleSelect(group)}
        >
          {label}
        </button>
      );
    }

    // Otherwise navigate via Link.
    return (
      <Link
        key={group}
        href={groupHref(group)}
        className={className}
        role={isMenu ? "menuitem" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">M</div>
          MATCHDAY
        </Link>

        <div className="sport-group-tabs">
          {GROUPS.map((group) => renderTab(group, false))}
        </div>

        <div className="nav-right">
          <span
            className="version-chip"
            title={isPrerelease() ? "Pre-release / test build" : "Production release"}
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "0.18rem 0.5rem",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              color: isPrerelease() ? "#f59e0b" : "var(--text-muted)",
              background: "transparent",
              fontFamily: "var(--font-jetbrains-mono)",
            }}
          >
            {APP_VERSION}
          </span>
          <div className="nav-live">
            <span className="live-dot" />
            LIVE
          </div>
          <CompactTablesToggle />
          <ThemeToggle />
          <div className="nav-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="icon-btn nav-menu-btn"
              aria-label="Open sport menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            {menuOpen && (
              <div className="nav-menu-dropdown" role="menu">
                {GROUPS.map((group) => renderTab(group, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
