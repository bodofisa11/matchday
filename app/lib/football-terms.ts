// Standard football abbreviations and term mappings.
// Position codes follow common broadcast/scouting conventions.
// Country codes follow FIFA / IOC 3-letter codes.

export type PositionGroup = "Goalkeeper" | "Defense" | "Midfield" | "Attack" | "Other";

// Order used for display.
export const POSITION_GROUP_ORDER: PositionGroup[] = [
  "Goalkeeper",
  "Defense",
  "Midfield",
  "Attack",
];

// Map raw position string (football-data.org variants) → short code.
// Returns null if no specific match (caller may fall back to original string).
export function shortPosition(pos: string | null | undefined): string | null {
  if (!pos) return null;
  const p = pos.toLowerCase().trim();

  // Goalkeeper
  if (p.includes("keeper")) return "GK";

  // Wing-Backs (check before plain Back)
  if (p.includes("left wing-back") || p.includes("left wing back")) return "LWB";
  if (p.includes("right wing-back") || p.includes("right wing back")) return "RWB";

  // Full-Backs
  if (p.includes("left-back") || p.includes("left back")) return "LB";
  if (p.includes("right-back") || p.includes("right back")) return "RB";

  // Centre-Back
  if (
    p.includes("centre-back") ||
    p.includes("center-back") ||
    p.includes("centre back") ||
    p.includes("center back") ||
    p === "defence" ||
    p === "defender"
  ) return "CB";

  // Midfield variants
  if (p.includes("defensive midfield")) return "CDM";
  if (p.includes("attacking midfield")) return "CAM";
  if (p.includes("central midfield")) return "CM";
  if (p.includes("left midfield")) return "LM";
  if (p.includes("right midfield")) return "RM";
  if (p === "midfield" || p === "midfielder") return "CM";

  // Wingers / Forwards
  if (p.includes("left winger") || p === "left wing") return "LW";
  if (p.includes("right winger") || p === "right wing") return "RW";
  if (p.includes("second striker")) return "SS";
  if (p.includes("centre-forward") || p.includes("center-forward") || p.includes("centre forward") || p.includes("center forward")) return "CF";
  if (p.includes("striker")) return "ST";
  if (p === "forward" || p === "attacker" || p === "offence" || p === "attack") return "ST";

  return null;
}

export function positionGroup(pos: string | null | undefined): PositionGroup {
  if (!pos) return "Other";
  const p = pos.toLowerCase();
  if (p.includes("keeper")) return "Goalkeeper";
  if (p.includes("back") || p.includes("defence") || p.includes("defender")) return "Defense";
  if (p.includes("midfield")) return "Midfield";
  if (
    p.includes("forward") ||
    p.includes("offence") ||
    p.includes("wing") ||
    p.includes("striker") ||
    p.includes("attack")
  ) return "Attack";
  return "Other";
}

// Country / Nation → FIFA / IOC 3-letter code.
// Covers all FIFA member associations relevant for top-tier club + WC squads.
const COUNTRY_CODE: Record<string, string> = {
  // Europe
  "albania": "ALB",
  "andorra": "AND",
  "armenia": "ARM",
  "austria": "AUT",
  "azerbaijan": "AZE",
  "belarus": "BLR",
  "belgium": "BEL",
  "bosnia and herzegovina": "BIH",
  "bosnia-herzegovina": "BIH",
  "bulgaria": "BUL",
  "croatia": "CRO",
  "cyprus": "CYP",
  "czech republic": "CZE",
  "czechia": "CZE",
  "denmark": "DEN",
  "england": "ENG",
  "estonia": "EST",
  "faroe islands": "FRO",
  "finland": "FIN",
  "france": "FRA",
  "georgia": "GEO",
  "germany": "GER",
  "gibraltar": "GIB",
  "greece": "GRE",
  "hungary": "HUN",
  "iceland": "ISL",
  "ireland": "IRL",
  "republic of ireland": "IRL",
  "israel": "ISR",
  "italy": "ITA",
  "kazakhstan": "KAZ",
  "kosovo": "KOS",
  "latvia": "LVA",
  "liechtenstein": "LIE",
  "lithuania": "LTU",
  "luxembourg": "LUX",
  "malta": "MLT",
  "moldova": "MDA",
  "montenegro": "MNE",
  "netherlands": "NED",
  "north macedonia": "MKD",
  "macedonia": "MKD",
  "northern ireland": "NIR",
  "norway": "NOR",
  "poland": "POL",
  "portugal": "POR",
  "romania": "ROU",
  "russia": "RUS",
  "san marino": "SMR",
  "scotland": "SCO",
  "serbia": "SRB",
  "slovakia": "SVK",
  "slovenia": "SVN",
  "spain": "ESP",
  "sweden": "SWE",
  "switzerland": "SUI",
  "turkey": "TUR",
  "türkiye": "TUR",
  "turkiye": "TUR",
  "ukraine": "UKR",
  "wales": "WAL",

  // South America
  "argentina": "ARG",
  "bolivia": "BOL",
  "brazil": "BRA",
  "chile": "CHI",
  "colombia": "COL",
  "ecuador": "ECU",
  "paraguay": "PAR",
  "peru": "PER",
  "uruguay": "URU",
  "venezuela": "VEN",

  // North/Central America + Caribbean
  "antigua and barbuda": "ATG",
  "bahamas": "BAH",
  "barbados": "BRB",
  "belize": "BLZ",
  "bermuda": "BER",
  "canada": "CAN",
  "costa rica": "CRC",
  "cuba": "CUB",
  "curacao": "CUW",
  "curaçao": "CUW",
  "dominica": "DMA",
  "dominican republic": "DOM",
  "el salvador": "SLV",
  "grenada": "GRN",
  "guatemala": "GUA",
  "guyana": "GUY",
  "haiti": "HAI",
  "honduras": "HON",
  "jamaica": "JAM",
  "mexico": "MEX",
  "nicaragua": "NCA",
  "panama": "PAN",
  "saint kitts and nevis": "SKN",
  "saint lucia": "LCA",
  "saint vincent and the grenadines": "VIN",
  "suriname": "SUR",
  "trinidad and tobago": "TRI",
  "united states": "USA",
  "usa": "USA",
  "united states of america": "USA",

  // Africa
  "algeria": "ALG",
  "angola": "ANG",
  "benin": "BEN",
  "botswana": "BOT",
  "burkina faso": "BFA",
  "burundi": "BDI",
  "cameroon": "CMR",
  "cape verde": "CPV",
  "central african republic": "CTA",
  "chad": "CHA",
  "comoros": "COM",
  "congo": "CGO",
  "dr congo": "COD",
  "democratic republic of the congo": "COD",
  "djibouti": "DJI",
  "egypt": "EGY",
  "equatorial guinea": "EQG",
  "eritrea": "ERI",
  "eswatini": "SWZ",
  "ethiopia": "ETH",
  "gabon": "GAB",
  "gambia": "GAM",
  "ghana": "GHA",
  "guinea": "GUI",
  "guinea-bissau": "GNB",
  "ivory coast": "CIV",
  "côte d'ivoire": "CIV",
  "cote d'ivoire": "CIV",
  "kenya": "KEN",
  "lesotho": "LES",
  "liberia": "LBR",
  "libya": "LBY",
  "madagascar": "MAD",
  "malawi": "MWI",
  "mali": "MLI",
  "mauritania": "MTN",
  "mauritius": "MRI",
  "morocco": "MAR",
  "mozambique": "MOZ",
  "namibia": "NAM",
  "niger": "NIG",
  "nigeria": "NGA",
  "rwanda": "RWA",
  "sao tome and principe": "STP",
  "senegal": "SEN",
  "seychelles": "SEY",
  "sierra leone": "SLE",
  "somalia": "SOM",
  "south africa": "RSA",
  "south sudan": "SSD",
  "sudan": "SDN",
  "tanzania": "TAN",
  "togo": "TOG",
  "tunisia": "TUN",
  "uganda": "UGA",
  "zambia": "ZAM",
  "zimbabwe": "ZIM",

  // Asia
  "afghanistan": "AFG",
  "bahrain": "BHR",
  "bangladesh": "BAN",
  "bhutan": "BHU",
  "brunei": "BRU",
  "cambodia": "CAM",
  "china": "CHN",
  "china pr": "CHN",
  "hong kong": "HKG",
  "india": "IND",
  "indonesia": "IDN",
  "iran": "IRN",
  "iraq": "IRQ",
  "japan": "JPN",
  "jordan": "JOR",
  "kuwait": "KUW",
  "kyrgyzstan": "KGZ",
  "laos": "LAO",
  "lebanon": "LBN",
  "macau": "MAC",
  "malaysia": "MAS",
  "maldives": "MDV",
  "mongolia": "MNG",
  "myanmar": "MYA",
  "nepal": "NEP",
  "north korea": "PRK",
  "korea dpr": "PRK",
  "oman": "OMA",
  "pakistan": "PAK",
  "palestine": "PLE",
  "philippines": "PHI",
  "qatar": "QAT",
  "saudi arabia": "KSA",
  "singapore": "SGP",
  "south korea": "KOR",
  "korea republic": "KOR",
  "sri lanka": "SRI",
  "syria": "SYR",
  "taiwan": "TPE",
  "chinese taipei": "TPE",
  "tajikistan": "TJK",
  "thailand": "THA",
  "timor-leste": "TLS",
  "turkmenistan": "TKM",
  "united arab emirates": "UAE",
  "uzbekistan": "UZB",
  "vietnam": "VIE",
  "yemen": "YEM",

  // Oceania
  "australia": "AUS",
  "fiji": "FIJ",
  "new caledonia": "NCL",
  "new zealand": "NZL",
  "papua new guinea": "PNG",
  "samoa": "SAM",
  "solomon islands": "SOL",
  "tahiti": "TAH",
  "tonga": "TGA",
  "vanuatu": "VAN",
};

export function countryCode(name: string | null | undefined): string | null {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  if (COUNTRY_CODE[key]) return COUNTRY_CODE[key];
  // Already a 3-letter code?
  if (/^[A-Z]{3}$/.test(name.trim())) return name.trim();
  return null;
}

// Display helper — returns code if known, else original name.
export function countryDisplay(name: string | null | undefined): string {
  if (!name) return "—";
  return countryCode(name) ?? name;
}
