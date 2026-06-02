"use client";

import Link from "next/link";
import { APP_VERSION } from "@/app/lib/version";
import { SPORTS } from "@/app/lib/v2/types";

const RESOURCE_LINKS = [
  { label: "GitHub", href: "https://github.com/bodofisa11/matchday", external: true },
  { label: "Releases", href: "https://github.com/bodofisa11/matchday/releases", external: true },
  { label: "Issues", href: "https://github.com/bodofisa11/matchday/issues", external: true },
];

const ABOUT_LINKS = [
  { label: "About", href: "#" },
  { label: "Data sources", href: "#" },
  { label: "Privacy", href: "#" },
];

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56C20.21 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="wf-footer">
      <div className="wf-footer-top">
        <div className="wf-footer-brand">
          <Link href="/v2/home" className="wf-footer-logo">
            MATCHDAY
          </Link>
          <p className="wf-footer-tag">
            Live scores, standings, and fixtures.<br />
            Football · Formula 1 · Cricket.
          </p>
          <div className="wf-footer-social">
            <a
              href="https://github.com/bodofisa11/matchday"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="wf-footer-social-btn"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>

        <div className="wf-footer-cols">
          <div className="wf-footer-col">
            <span className="wf-eyebrow">Sports</span>
            <ul>
              {SPORTS.map((s) => (
                <li key={s.slug}>
                  <Link href={`/v2/${s.slug}`}>
                    <span className={`wf-dot ${s.dot}`} />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="wf-footer-col">
            <span className="wf-eyebrow">Resources</span>
            <ul>
              {RESOURCE_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="wf-footer-col">
            <span className="wf-eyebrow">About</span>
            <ul>
              {ABOUT_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="wf-footer-bottom">
        <span className="wf-footer-copy">© {year} MATCHDAY</span>
        <span className="wf-footer-bullet" aria-hidden>·</span>
        <span className="wf-footer-meta">Data refreshed daily</span>
        <span className="wf-footer-bullet" aria-hidden>·</span>
        <span className="wf-footer-version">{APP_VERSION}</span>
      </div>
    </footer>
  );
}
