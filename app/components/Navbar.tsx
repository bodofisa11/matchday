"use client";

import { ThemeToggle } from "./ThemeToggle";

export type SportGroup = "today" | "football" | "f1" | "cricket" | "ufc";

const GROUP_LABELS: Record<SportGroup, string> = {
  today: "Today",
  football: "Football",
  f1: "Formula 1",
  cricket: "Cricket",
  ufc: "UFC",
};

interface NavbarProps {
  activeGroup: SportGroup;
  onGroupChange: (group: SportGroup) => void;
}

export function Navbar({ activeGroup, onGroupChange }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#" className="logo">
          <div className="logo-icon">SP</div>
          SPORTPULSE
        </a>
        <div className="sport-group-tabs">
          {(["today", "football", "f1", "cricket", "ufc"] as SportGroup[]).map((group) => (
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
        </div>
      </div>
    </nav>
  );
}
