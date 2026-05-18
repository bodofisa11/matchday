// FIA-standard 3-letter codes for F1 drivers and constructors.
// Drivers: official broadcast / timing screen abbreviations.
// Constructors: common short forms used by F1 timing and TV graphics.

export const F1_DRIVER_CODES: Record<string, string> = {
  // 2025/2026 grid + recent veterans
  "Max Verstappen": "VER",
  "Sergio Pérez": "PER",
  "Sergio Perez": "PER",
  "Lewis Hamilton": "HAM",
  "George Russell": "RUS",
  "Charles Leclerc": "LEC",
  "Carlos Sainz": "SAI",
  "Carlos Sainz Jr.": "SAI",
  "Lando Norris": "NOR",
  "Oscar Piastri": "PIA",
  "Fernando Alonso": "ALO",
  "Lance Stroll": "STR",
  "Pierre Gasly": "GAS",
  "Esteban Ocon": "OCO",
  "Yuki Tsunoda": "TSU",
  "Daniel Ricciardo": "RIC",
  "Liam Lawson": "LAW",
  "Alex Albon": "ALB",
  "Alexander Albon": "ALB",
  "Logan Sargeant": "SAR",
  "Franco Colapinto": "COL",
  "Nico Hülkenberg": "HUL",
  "Nico Hulkenberg": "HUL",
  "Kevin Magnussen": "MAG",
  "Oliver Bearman": "BEA",
  "Valtteri Bottas": "BOT",
  "Zhou Guanyu": "ZHO",
  "Guanyu Zhou": "ZHO",
  "Andrea Kimi Antonelli": "ANT",
  "Kimi Antonelli": "ANT",
  "Jack Doohan": "DOO",
  "Gabriel Bortoleto": "BOR",
  "Isack Hadjar": "HAD",
};

export const F1_CONSTRUCTOR_CODES: Record<string, string> = {
  "Red Bull": "RBR",
  "Red Bull Racing": "RBR",
  "Mercedes": "MER",
  "Ferrari": "FER",
  "McLaren": "MCL",
  "Aston Martin": "AST",
  "Alpine": "ALP",
  "Alpine F1 Team": "ALP",
  "Williams": "WIL",
  "RB": "VRB",
  "RB F1 Team": "VRB",
  "Racing Bulls": "VRB",
  "Visa Cash App RB": "VRB",
  "Sauber": "KCK",
  "Kick Sauber": "KCK",
  "Stake F1 Team Kick Sauber": "KCK",
  "Haas": "HAA",
  "Haas F1 Team": "HAA",
  "Audi": "AUD",
  "Cadillac": "CAD",
};

function fallback(name: string): string {
  const cleaned = name.replace(/[^A-Za-z]/g, "");
  return cleaned.slice(0, 3).toUpperCase() || "—";
}

export function driverCode(name: string): string {
  return F1_DRIVER_CODES[name] ?? fallback(name.split(" ").slice(-1)[0]);
}

export function constructorCode(name: string): string {
  return F1_CONSTRUCTOR_CODES[name] ?? fallback(name);
}
