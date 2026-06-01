"use client";

import { useState } from "react";
import { teamLogoUrl } from "@/app/lib/v1/image-utils";

interface TeamLogoProps {
  code: string;
  sport: "football" | "f1" | "cricket";
  leagueCode?: string;
  /** Fallback background color for the text badge. */
  color?: string;
  /** Size in pixels (width and height). */
  size?: number;
  className?: string;
}

/**
 * Displays a team logo from Supabase Storage, with graceful fallback
 * to a colored text badge if the image fails to load.
 */
export function TeamLogo({
  code,
  sport,
  leagueCode,
  color,
  size = 28,
  className,
}: TeamLogoProps) {
  const url = teamLogoUrl(sport, code, leagueCode);
  const [imgFailed, setImgFailed] = useState(false);

  const showImg = url && !imgFailed;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showImg ? (
        <img
          src={url}
          alt={`${code} logo`}
          width={size}
          height={size}
          loading="lazy"
          style={{ objectFit: "contain", borderRadius: 4 }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="team-badge"
          style={{
            background: color ?? "#666",
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            fontSize: size * 0.35,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {code}
        </div>
      )}
    </div>
  );
}
