import { getTeamCodeFromDB } from "@/app/lib/team-codes-cache";

/**
 * Static fallback map: team name → 3-letter code.
 * Preferred source of truth is `football_team_details.tla` in the DB,
 * loaded via `loadTeamCodes()` and queried through `getTeamCodeFromDB()`.
 * This map is only consulted when the DB cache misses (cache not yet
 * loaded, team missing, or non-football competitions like IPL).
 */
export const TEAM_CODE_MAP: Record<string, string> = {
  // EPL
  Arsenal: "ARS", "Aston Villa": "AVL", Bournemouth: "BOU", Brentford: "BRE",
  Brighton: "BHA", "Brighton & Hove Albion": "BHA", Chelsea: "CHE",
  "Crystal Palace": "CRY", Everton: "EVE", Fulham: "FUL",
  "Ipswich Town": "IPS", Ipswich: "IPS",
  "Leicester City": "LEI", Leicester: "LEI", Liverpool: "LIV",
  "Manchester City": "MCI", "Manchester United": "MUN",
  "Newcastle United": "NEW", Newcastle: "NEW",
  "Nottingham Forest": "NFO", Southampton: "SOU", Sunderland: "SUN",
  "Tottenham Hotspur": "TOT", Tottenham: "TOT",
  "West Ham United": "WHU", "West Ham": "WHU",
  "Wolverhampton Wanderers": "WOL", Wolverhampton: "WOL", Wolves: "WOL",
  Burnley: "BUR", "Leeds United": "LEE", Leeds: "LEE",
  // La Liga
  "Real Madrid": "RMA", Barcelona: "FCB", "FC Barcelona": "FCB",
  "Atletico Madrid": "ATM", "Atlético Madrid": "ATM",
  "Athletic Club": "ATH", "Athletic Bilbao": "ATH",
  "Real Sociedad": "RSO", Villarreal: "VIL", "Real Betis": "BET",
  Sevilla: "SEV", Valencia: "VAL", "Celta Vigo": "CEL",
  "Rayo Vallecano": "RAY", Getafe: "GET", Girona: "GIR", Osasuna: "OSA",
  "Deportivo Alavés": "ALA", "Deportivo Alaves": "ALA", "Alavés": "ALA", Alaves: "ALA",
  "Deportivo La Coruña": "DEP", "Deportivo La Coruna": "DEP",
  Elche: "ELC", Levante: "LEV",
  Espanyol: "ESP", "Las Palmas": "LPA", Mallorca: "MLL",
  "Leganés": "LEG", Leganes: "LEG", "Real Valladolid": "VLL", Valladolid: "VLL",
  "Real Oviedo": "OVI", Oviedo: "OVI",
  // Bundesliga
  "Bayern Munich": "BAY", "Borussia Dortmund": "BVB", "RB Leipzig": "RBL",
  "Bayer Leverkusen": "B04", "Eintracht Frankfurt": "SGE",
  "SC Freiburg": "SCF", Freiburg: "SCF", "Werder Bremen": "SVW",
  "VfB Stuttgart": "VFB", Stuttgart: "VFB",
  "TSG Hoffenheim": "TSG", Hoffenheim: "TSG",
  "VfL Wolfsburg": "WOB", Wolfsburg: "WOB",
  "Borussia Mönchengladbach": "BMG", "Borussia Monchengladbach": "BMG",
  "Union Berlin": "UNB", "FSV Mainz 05": "M05", Mainz: "M05",
  "FC Augsburg": "FCA", Augsburg: "FCA",
  "FC Heidenheim": "HDH", "1. FC Heidenheim": "HDH", Heidenheim: "HDH",
  "FC St. Pauli": "STP", "St. Pauli": "STP",
  "VfL Bochum": "BOC", Bochum: "BOC",
  "Holstein Kiel": "KIE", "1. FC Holstein Kiel": "KIE",
  "Hamburger SV": "HSV", Hamburg: "HSV",
  "1. FC Köln": "KOE", "FC Köln": "KOE", "FC Koln": "KOE", Köln: "KOE", Cologne: "KOE",
  // Serie A
  "Inter Milan": "INT", Napoli: "NAP", Juventus: "JUV", "AC Milan": "ACM",
  Atalanta: "ATA", Lazio: "LAZ", Roma: "ROM", "AS Roma": "ROM",
  Fiorentina: "FIO", Bologna: "BOL", Torino: "TOR", Udinese: "UDI",
  Genoa: "GEN", Cagliari: "CAG", "Hellas Verona": "VER", Verona: "VER",
  Lecce: "LEC", Parma: "PAR", Empoli: "EMP", Monza: "MON",
  Como: "COM", Venezia: "VEN",
  Cremonese: "CRE", "US Cremonese": "CRE",
  Pisa: "PIS", "Pisa Sporting Club": "PIS",
  Sassuolo: "SAS", "US Sassuolo Calcio": "SAS",
  // Ligue 1
  "Paris Saint-Germain": "PSG", PSG: "PSG", Marseille: "MAR",
  "Olympique de Marseille": "MAR", Monaco: "ASM", "AS Monaco": "ASM",
  Lille: "LIL", Lyon: "LYO", "Olympique Lyonnais": "LYO",
  Nice: "NIC", "OGC Nice": "NIC", Lens: "LEN", "RC Lens": "LEN",
  Strasbourg: "STR", Rennes: "REN", "Stade Rennais": "REN",
  Nantes: "NAN", "FC Nantes": "NAN", Montpellier: "MHC",
  Toulouse: "TFC", Reims: "SDR", "Le Havre": "HAC",
  Brest: "SB2", "Stade Brestois": "SB2", Angers: "ANG",
  Auxerre: "AJA", "Saint-Etienne": "STE", "Saint-Étienne": "STE",
  Metz: "FCM", "FC Metz": "FCM", Clermont: "CFF",
  Lorient: "FCL", "FC Lorient": "FCL",
  "Paris FC": "PFC",
  // World Cup — FIFA national-team codes
  Argentina: "ARG", Brazil: "BRA", Chile: "CHI", Croatia: "CRO",
  England: "ENG", France: "FRA", Germany: "GER", Japan: "JPN",
  Mexico: "MEX", Morocco: "MAR", Netherlands: "NED",
  Norway: "NOR", Portugal: "POR", Scotland: "SCO", Senegal: "SEN",
  "South Korea": "KOR", "Korea Republic": "KOR", Spain: "ESP",
  Turkey: "TUR", Türkiye: "TUR", USA: "USA", "United States": "USA",
  Algeria: "ALG", Australia: "AUS", Austria: "AUT", Belgium: "BEL",
  "Bosnia and Herzegovina": "BIH", "Bosnia-Herzegovina": "BIH",
  "Bosnia & Herzegovina": "BIH", Bosnia: "BIH",
  Canada: "CAN", Colombia: "COL",
  "DR Congo": "COD", "Congo DR": "COD", "Democratic Republic of Congo": "COD",
  Curacao: "CUW", Curaçao: "CUW",
  Czechia: "CZE", "Czech Republic": "CZE",
  Ecuador: "ECU", Egypt: "EGY", Ghana: "GHA", Haiti: "HAI",
  Iran: "IRN", "IR Iran": "IRN", Iraq: "IRQ", Jordan: "JOR",
  "New Zealand": "NZL", Panama: "PAN", Paraguay: "PAR", Qatar: "QAT",
  "South Africa": "RSA", Sweden: "SWE", Switzerland: "SUI",
  Uruguay: "URU", Uzbekistan: "UZB",
  "Saudi Arabia": "KSA", Tunisia: "TUN",
  "Ivory Coast": "CIV", "Côte d'Ivoire": "CIV", "Cote d'Ivoire": "CIV",
  "Cape Verde": "CPV", "Cabo Verde": "CPV", "Cape Verde Islands": "CPV",
  // ISL — Indian Super League
  "Mohun Bagan Super Giant": "MBSG", "East Bengal FC": "EBFC", "East Bengal": "EBFC",
  "Kerala Blasters FC": "KBFC", "Kerala Blasters": "KBFC",
  "FC Goa": "FCG", "Mumbai City FC": "MCFC", "Mumbai City": "MCFC",
  "Bengaluru FC": "BFC", Bengaluru: "BFC",
  "Jamshedpur FC": "JFC", Jamshedpur: "JFC",
  "NorthEast United FC": "NEUFC", "NorthEast United": "NEUFC",
  "Odisha FC": "OFC", Odisha: "OFC",
  "Punjab FC": "PFC", Punjab: "PFC",
  "Mohammedan SC": "MSC",
  "Chennaiyin FC": "CFC", Chennaiyin: "CFC",
  "Inter Kashi": "IK",
  // IPL
  "Chennai Super Kings": "CSK", "Mumbai Indians": "MI",
  "Royal Challengers Bengaluru": "RCB", "Royal Challengers Bangalore": "RCB",
  "Kolkata Knight Riders": "KKR", "Sunrisers Hyderabad": "SRH",
  "Rajasthan Royals": "RR", "Delhi Capitals": "DC",
  "Punjab Kings": "PBKS", "Gujarat Titans": "GT",
  "Lucknow Super Giants": "LSG",
};

export const TEAM_COLORS: Record<string, string> = {
  // EPL
  LIV: "#c8102e", ARS: "#ef0107", MCI: "#6cabdd", TOT: "#132257",
  CHE: "#034694", AVL: "#670e36", NEW: "#241f20", BHA: "#274488",
  NFO: "#d71920", WOL: "#FDB913", WHU: "#7A263A", BRE: "#e30613",
  FUL: "#000000", CRY: "#1B458F", BOU: "#da291c", MUN: "#da291c",
  EVE: "#003399", IPS: "#003399", LEI: "#003090", SOU: "#d71920",
  SUN: "#eb172b", BUR: "#6c1d45", LEE: "#ffcd00",
  // La Liga
  FCB: "#004d98", RMA: "#e8e8e8", ATM: "#cb3524", RSO: "#005ea5",
  VIL: "#fde047", BET: "#005ba1", ATH: "#cc1a1a", SEV: "#d71920",
  GIR: "#c8102e", OSA: "#034694", CEL: "#7ab2e8", RAY: "#e30613",
  MLL: "#d71920", LPA: "#ffd700", GET: "#035AA6", LEG: "#004b8d",
  VAL: "#f5a623", ALA: "#004b8d", ESP: "#0067b1", VLL: "#7b2d8e",
  ELC: "#0c5cc4", DEP: "#005baa", OVI: "#0a3a85",
  // Bundesliga
  BAY: "#dc0000", BVB: "#fde047", B04: "#e30613", RBL: "#004b8d",
  WOB: "#1e5128", VFB: "#e1000f", SGE: "#e30613", SCF: "#cc0000",
  UNB: "#cc0000", BMG: "#000000", SVW: "#009739", TSG: "#1961AC",
  FCA: "#ba3733", M05: "#c3212f", HDH: "#CC0000", KIE: "#004a9f",
  BOC: "#005ca9", STP: "#9e3124",
  // Serie A
  INT: "#1d428a", NAP: "#1a78cf", JUV: "#000000", ACM: "#ac1b2f",
  LAZ: "#87ceeb", FIO: "#7b2d8e", ATA: "#1d3f8e", ROM: "#8B0000",
  TOR: "#8B0000", BOL: "#1d428a", UDI: "#000000", GEN: "#cc0000",
  CAG: "#cc0000", EMP: "#005ca9", MON: "#e30613", VER: "#ffdd00",
  PAR: "#f5c518", COM: "#0055a4", VEN: "#1d428a", LEC: "#f5a623",
  // Ligue 1
  PSG: "#004170", ASM: "#ce1126",
  LIL: "#cc0000", LYO: "#0055a4", NIC: "#cc0000", LEN: "#ffcd00",
  REN: "#cc0000", NAN: "#ffd700", MHC: "#0055a4", TFC: "#5e1a8b",
  SDR: "#cc0000", HAC: "#0055a4", SB2: "#cc0000", ANG: "#000000",
  AJA: "#0055a4", STE: "#009739", FCM: "#7c1c2c", CFF: "#0055a4",
  // IPL
  CSK: "#FCCA06", MI: "#004BA0", RCB: "#EC1C24", KKR: "#3A225D",
  GT: "#1C4480", RR: "#EA1A85", SRH: "#F7A721", DC: "#00008B",
  PBKS: "#AA4545", LSG: "#A72056",
};

export const F1_TEAM_COLORS: Record<string, string> = {
  McLaren: "#ff8700", Mercedes: "#00d2be",
  "Red Bull Racing": "#3671C6", "Red Bull": "#3671C6",
  Ferrari: "#dc0000", Haas: "#B6BABD", Williams: "#37BEDD",
  "Aston Martin": "#358C75", "Racing Bulls": "#6692FF", RB: "#6692FF",
  Alpine: "#2293D1", Sauber: "#52E252", "Kick Sauber": "#52E252",
  Cadillac: "#cccccc",
};

export function teamCode(name: string, competitionShort?: string): string {
  return (
    getTeamCodeFromDB(name, competitionShort) ??
    TEAM_CODE_MAP[name] ??
    name.substring(0, 3).toUpperCase()
  );
}

export function teamColor(code: string): string {
  return TEAM_COLORS[code] ?? "#666666";
}

export function formatFixtureDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${days[date.getDay()]}, ${d} ${months[m - 1]}`;
}

export function formatGD(gd: number): string {
  return gd > 0 ? `+${gd}` : String(gd);
}

export function todayStr(): string {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}
