"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export type SportGroup = "today" | "football" | "f1" | "cricket" | "ufc";

const GROUP_LABELS: Record<SportGroup, string> = {
  today: "Today",
  football: "Football",
  f1: "Formula 1",
  cricket: "Cricket",
  ufc: "UFC",
};

const GROUPS: SportGroup[] = ["today", "football", "f1", "cricket", "ufc"];

interface NavbarProps {
  activeGroup: SportGroup;
  onGroupChange: (group: SportGroup) => void;
}

export function Navbar({ activeGroup, onGroupChange }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    onGroupChange(group);
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#" className="logo">
          <div className="logo-icon">M</div>
          MATCHDAY
        </a>

        <div className="sport-group-tabs">
          {GROUPS.map((group) => (
            <button
              key={group}
              className={`sport-group-tab${activeGroup === group ? " active" : ""}${group === "today" ? " today-tab" : ""}`}
              onClick={() => onGroupChange(group)}
            >
              {GROUP_LABELS[group]}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-live">
            <span className="live-dot" />
            LIVE
          </div>
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
                {GROUPS.map((group) => (
                  <button
                    key={group}
                    role="menuitem"
                    className={`nav-menu-item${activeGroup === group ? " active" : ""}`}
                    onClick={() => handleSelect(group)}
                  >
                    {GROUP_LABELS[group]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
