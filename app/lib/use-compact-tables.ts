"use client";

import { useSyncExternalStore } from "react";

const CLASS = "compact-tables";
const STORAGE_KEY = "compact-tables";

function subscribe(cb: () => void) {
  if (typeof document === "undefined") return () => {};
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

function getSnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains(CLASS);
}

function getServerSnapshot(): boolean {
  return false;
}

export function useCompactTables(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setCompactTables(on: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(CLASS, on);
  try {
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {}
}

export function toggleCompactTables(): void {
  setCompactTables(!getSnapshot());
}
