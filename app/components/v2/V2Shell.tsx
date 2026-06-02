"use client";

import { useSyncExternalStore } from "react";
import { Navbar } from "./Navbar";
import { LiveBar } from "./LiveBar";

const THEME_KEY = "wf-theme";
const listeners = new Set<() => void>();

function readDark(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function toggleTheme() {
  const next = !readDark();
  try {
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** Root wrapper for every v2 page: applies the `.v2` scope + theme class,
 *  renders the persistent Navbar + LiveBar, and centers content. */
export function V2Shell({ children }: { children: React.ReactNode }) {
  const dark = useSyncExternalStore(subscribe, readDark, () => false);

  return (
    <div className={`v2${dark ? " wf-dark" : ""}`}>
      <div className="wf-shell">
        <Navbar dark={dark} onToggleTheme={toggleTheme} />
        <LiveBar />
        {children}
      </div>
    </div>
  );
}
