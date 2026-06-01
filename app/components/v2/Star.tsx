"use client";

import { useSyncExternalStore, useCallback } from "react";

const KEY = "favorites:fixtures";
const listeners = new Set<() => void>();

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

let cache: Set<string> | null = null;
function snapshot(): Set<string> {
  if (cache === null) cache = read();
  return cache;
}

function emit() {
  cache = read();
  listeners.forEach((l) => l());
}

function toggle(id: string) {
  const set = read();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function Star({ id }: { id: string }) {
  const favorites = useSyncExternalStore(subscribe, snapshot, () => snapshot());
  const on = favorites.has(id);
  const onClick = useCallback(() => toggle(id), [id]);
  return (
    <button
      type="button"
      className={`wf-star${on ? " on" : ""}`}
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
