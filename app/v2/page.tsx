"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Bare /v2 has no content — bounce to the v2 home overview.
// router.replace respects basePath (/matchday in prod), so the redirect
// resolves correctly on GitHub Pages.
export default function V2Index() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/v2/home");
  }, [router]);
  return null;
}
