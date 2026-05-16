"use client";

import { useEffect, useState } from "react";
import { isTeamCodesLoaded, loadTeamCodes } from "./team-codes-cache";

/**
 * Loads the DB-backed team code cache once per session and triggers a
 * re-render in the caller when the load completes. Safe to call from
 * any client component — subsequent invocations are no-ops.
 */
export function useTeamCodes(): boolean {
  const [ready, setReady] = useState<boolean>(isTeamCodesLoaded());

  useEffect(() => {
    if (isTeamCodesLoaded()) return;
    let cancelled = false;
    loadTeamCodes().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
