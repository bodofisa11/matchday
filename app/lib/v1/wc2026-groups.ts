import type { GroupLetter } from "@/app/lib/v1/predictions-types";

/**
 * Provisional WC2026 group draw (illustrative — real draw is Dec 2025).
 * 12 groups × 4 teams = 48 nations. Top 2 of each + 8 best 3rds → R32.
 * Each team identified by 3-letter FIFA code (matches TEAM_CODE_MAP).
 *
 * Update this file once FIFA publishes the official draw.
 */
export const WC2026_GROUPS: Record<GroupLetter, { code: string; name: string }[]> = {
  A: [
    { code: "MEX", name: "Mexico" },
    { code: "CRO", name: "Croatia" },
    { code: "ECU", name: "Ecuador" },
    { code: "JOR", name: "Jordan" },
  ],
  B: [
    { code: "CAN", name: "Canada" },
    { code: "BEL", name: "Belgium" },
    { code: "SCO", name: "Scotland" },
    { code: "CPV", name: "Cape Verde" },
  ],
  C: [
    { code: "USA", name: "USA" },
    { code: "POR", name: "Portugal" },
    { code: "AUS", name: "Australia" },
    { code: "HAI", name: "Haiti" },
  ],
  D: [
    { code: "ARG", name: "Argentina" },
    { code: "GER", name: "Germany" },
    { code: "PAR", name: "Paraguay" },
    { code: "RSA", name: "South Africa" },
  ],
  E: [
    { code: "ESP", name: "Spain" },
    { code: "COL", name: "Colombia" },
    { code: "EGY", name: "Egypt" },
    { code: "UZB", name: "Uzbekistan" },
  ],
  F: [
    { code: "FRA", name: "France" },
    { code: "URU", name: "Uruguay" },
    { code: "NOR", name: "Norway" },
    { code: "TUN", name: "Tunisia" },
  ],
  G: [
    { code: "BRA", name: "Brazil" },
    { code: "NED", name: "Netherlands" },
    { code: "JPN", name: "Japan" },
    { code: "CIV", name: "Ivory Coast" },
  ],
  H: [
    { code: "ENG", name: "England" },
    { code: "SUI", name: "Switzerland" },
    { code: "KOR", name: "South Korea" },
    { code: "PAN", name: "Panama" },
  ],
  I: [
    { code: "ITA", name: "Italy" },
    { code: "MAR", name: "Morocco" },
    { code: "SEN", name: "Senegal" },
    { code: "NZL", name: "New Zealand" },
  ],
  J: [
    { code: "TUR", name: "Türkiye" },
    { code: "IRN", name: "Iran" },
    { code: "GHA", name: "Ghana" },
    { code: "CUW", name: "Curaçao" },
  ],
  K: [
    { code: "DEN", name: "Denmark" },
    { code: "AUT", name: "Austria" },
    { code: "ALG", name: "Algeria" },
    { code: "QAT", name: "Qatar" },
  ],
  L: [
    { code: "POL", name: "Poland" },
    { code: "CZE", name: "Czechia" },
    { code: "KSA", name: "Saudi Arabia" },
    { code: "BIH", name: "Bosnia and Herzegovina" },
  ],
};

export const GROUP_LETTERS: GroupLetter[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

/** Flat list of all 48 team codes — used by semifinalist picker. */
export const WC2026_TEAMS: { code: string; name: string; group: GroupLetter }[] =
  GROUP_LETTERS.flatMap((g) =>
    WC2026_GROUPS[g].map((t) => ({ ...t, group: g }))
  );

export function teamNameByCode(code: string): string {
  return WC2026_TEAMS.find((t) => t.code === code)?.name ?? code;
}
