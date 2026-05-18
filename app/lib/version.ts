// Injected at build time via NEXT_PUBLIC_APP_VERSION env var.
// Set by the deploy workflow from the git tag (e.g. "v1.0.0" or "v1.1.0-rc.1").
// Falls back to "dev" for local development builds.
export const APP_VERSION: string = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

export function isPrerelease(v: string = APP_VERSION): boolean {
  return /-(rc|beta|alpha)\./i.test(v);
}
