/**
 * 60-player shortlist for the Top Scorer pick. User can also enter a
 * free-text "Other" name. Sorted by perceived likelihood, no official source.
 */
export interface ScorerCandidate {
  name: string;
  team: string; // 3-letter FIFA code
  club: string;
}

export const TOP_SCORER_CANDIDATES: ScorerCandidate[] = [
  { name: "Kylian Mbappé", team: "FRA", club: "Real Madrid" },
  { name: "Erling Haaland", team: "NOR", club: "Manchester City" },
  { name: "Lionel Messi", team: "ARG", club: "Inter Miami" },
  { name: "Vinícius Júnior", team: "BRA", club: "Real Madrid" },
  { name: "Harry Kane", team: "ENG", club: "Bayern Munich" },
  { name: "Lautaro Martínez", team: "ARG", club: "Inter Milan" },
  { name: "Julián Álvarez", team: "ARG", club: "Atlético Madrid" },
  { name: "Cristiano Ronaldo", team: "POR", club: "Al-Nassr" },
  { name: "Bukayo Saka", team: "ENG", club: "Arsenal" },
  { name: "Jude Bellingham", team: "ENG", club: "Real Madrid" },
  { name: "Rodrygo", team: "BRA", club: "Real Madrid" },
  { name: "Raphinha", team: "BRA", club: "Barcelona" },
  { name: "Phil Foden", team: "ENG", club: "Manchester City" },
  { name: "Cole Palmer", team: "ENG", club: "Chelsea" },
  { name: "Lamine Yamal", team: "ESP", club: "Barcelona" },
  { name: "Nico Williams", team: "ESP", club: "Athletic Club" },
  { name: "Álvaro Morata", team: "ESP", club: "Galatasaray" },
  { name: "Mikel Oyarzabal", team: "ESP", club: "Real Sociedad" },
  { name: "Ousmane Dembélé", team: "FRA", club: "Paris Saint-Germain" },
  { name: "Antoine Griezmann", team: "FRA", club: "Atlético Madrid" },
  { name: "Marcus Thuram", team: "FRA", club: "Inter Milan" },
  { name: "Florian Wirtz", team: "GER", club: "Bayer Leverkusen" },
  { name: "Kai Havertz", team: "GER", club: "Arsenal" },
  { name: "Niclas Füllkrug", team: "GER", club: "West Ham" },
  { name: "Jamal Musiala", team: "GER", club: "Bayern Munich" },
  { name: "Memphis Depay", team: "NED", club: "Corinthians" },
  { name: "Cody Gakpo", team: "NED", club: "Liverpool" },
  { name: "Donyell Malen", team: "NED", club: "Aston Villa" },
  { name: "Bruno Fernandes", team: "POR", club: "Manchester United" },
  { name: "Rafael Leão", team: "POR", club: "AC Milan" },
  { name: "Bernardo Silva", team: "POR", club: "Manchester City" },
  { name: "João Félix", team: "POR", club: "Chelsea" },
  { name: "Kvicha Kvaratskhelia", team: "GEO", club: "Paris Saint-Germain" },
  { name: "Dušan Vlahović", team: "SRB", club: "Juventus" },
  { name: "Aleksandar Mitrović", team: "SRB", club: "Al-Hilal" },
  { name: "Romelu Lukaku", team: "BEL", club: "Napoli" },
  { name: "Kevin De Bruyne", team: "BEL", club: "Napoli" },
  { name: "Christian Pulisic", team: "USA", club: "AC Milan" },
  { name: "Folarin Balogun", team: "USA", club: "Monaco" },
  { name: "Timothy Weah", team: "USA", club: "Juventus" },
  { name: "Alphonso Davies", team: "CAN", club: "Real Madrid" },
  { name: "Jonathan David", team: "CAN", club: "Juventus" },
  { name: "Raúl Jiménez", team: "MEX", club: "Fulham" },
  { name: "Santiago Giménez", team: "MEX", club: "AC Milan" },
  { name: "Edson Álvarez", team: "MEX", club: "Fenerbahçe" },
  { name: "Darwin Núñez", team: "URU", club: "Al-Hilal" },
  { name: "Federico Valverde", team: "URU", club: "Real Madrid" },
  { name: "Luis Díaz", team: "COL", club: "Bayern Munich" },
  { name: "James Rodríguez", team: "COL", club: "Club León" },
  { name: "Mohammed Kudus", team: "GHA", club: "Tottenham" },
  { name: "Victor Osimhen", team: "NGA", club: "Galatasaray" },
  { name: "Mohamed Salah", team: "EGY", club: "Liverpool" },
  { name: "Sadio Mané", team: "SEN", club: "Al-Nassr" },
  { name: "Achraf Hakimi", team: "MAR", club: "Paris Saint-Germain" },
  { name: "Hakim Ziyech", team: "MAR", club: "Al-Duhail" },
  { name: "Hwang Hee-chan", team: "KOR", club: "Wolves" },
  { name: "Son Heung-min", team: "KOR", club: "Los Angeles FC" },
  { name: "Takumi Minamino", team: "JPN", club: "Monaco" },
  { name: "Kaoru Mitoma", team: "JPN", club: "Brighton" },
  { name: "Mehdi Taremi", team: "IRN", club: "Inter Milan" },
];

export const OTHER_SCORER_VALUE = "__other__";
