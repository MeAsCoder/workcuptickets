// Fetches and normalizes the official-style World Cup 2026 schedule from the
// open-source openfootball dataset. No Prisma here, so it can be tested alone.

const SOURCE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

// Host city -> stadium, display city, ISO country code (16 venues).
const VENUES = {
  'Mexico City': { stadium: 'Estadio Banorte', city: 'Mexico City', cc: 'MX' },
  'Guadalajara (Zapopan)': { stadium: 'Estadio Guadalajara', city: 'Guadalajara', cc: 'MX' },
  'Monterrey (Guadalupe)': { stadium: 'Estadio Monterrey', city: 'Monterrey', cc: 'MX' },
  Toronto: { stadium: 'BMO Field', city: 'Toronto', cc: 'CA' },
  Vancouver: { stadium: 'BC Place', city: 'Vancouver', cc: 'CA' },
  Atlanta: { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', cc: 'US' },
  'Boston (Foxborough)': { stadium: 'Gillette Stadium', city: 'Foxborough', cc: 'US' },
  'Dallas (Arlington)': { stadium: 'AT&T Stadium', city: 'Arlington', cc: 'US' },
  Houston: { stadium: 'NRG Stadium', city: 'Houston', cc: 'US' },
  'Kansas City': { stadium: 'Arrowhead Stadium', city: 'Kansas City', cc: 'US' },
  'Los Angeles (Inglewood)': { stadium: 'SoFi Stadium', city: 'Inglewood', cc: 'US' },
  'Miami (Miami Gardens)': { stadium: 'Hard Rock Stadium', city: 'Miami Gardens', cc: 'US' },
  'New York/New Jersey (East Rutherford)': { stadium: 'MetLife Stadium', city: 'East Rutherford', cc: 'US' },
  Philadelphia: { stadium: 'Lincoln Financial Field', city: 'Philadelphia', cc: 'US' },
  'San Francisco Bay Area (Santa Clara)': { stadium: "Levi's Stadium", city: 'Santa Clara', cc: 'US' },
  Seattle: { stadium: 'Lumen Field', city: 'Seattle', cc: 'US' },
}

// Team name -> ISO 3166-1 alpha-2 (used to build flag emoji).
const TEAM_ISO = {
  Mexico: 'MX', Canada: 'CA', USA: 'US', 'United States': 'US',
  'South Africa': 'ZA', 'South Korea': 'KR', 'Korea Republic': 'KR',
  Qatar: 'QA', Switzerland: 'CH', Brazil: 'BR', Morocco: 'MA', Haiti: 'HT',
  Paraguay: 'PY', Australia: 'AU', Germany: 'DE', 'Curaçao': 'CW', Curacao: 'CW',
  'Ivory Coast': 'CI', "Côte d'Ivoire": 'CI', Ecuador: 'EC', Netherlands: 'NL',
  Japan: 'JP', Tunisia: 'TN', Argentina: 'AR', France: 'FR', Spain: 'ES',
  Portugal: 'PT', Croatia: 'HR', Belgium: 'BE', Italy: 'IT', Uruguay: 'UY',
  Colombia: 'CO', Senegal: 'SN', Ghana: 'GH', Nigeria: 'NG', Cameroon: 'CM',
  Egypt: 'EG', Algeria: 'DZ', Iran: 'IR', 'Saudi Arabia': 'SA', Jordan: 'JO',
  Uzbekistan: 'UZ', Iraq: 'IQ', 'United Arab Emirates': 'AE', 'New Zealand': 'NZ',
  Panama: 'PA', 'Costa Rica': 'CR', Honduras: 'HN', Jamaica: 'JM', 'Cape Verde': 'CV',
  Norway: 'NO', Denmark: 'DK', Austria: 'AT', Poland: 'PL', 'Czech Republic': 'CZ',
  Czechia: 'CZ', Turkey: 'TR', 'Türkiye': 'TR', Ukraine: 'UA', Sweden: 'SE',
  Greece: 'GR', Serbia: 'RS', Slovenia: 'SI', Slovakia: 'SK', Hungary: 'HU',
  Romania: 'RO', Bolivia: 'BO', Peru: 'PE', Chile: 'CL', Venezuela: 'VE',
  'DR Congo': 'CD', 'Democratic Republic of the Congo': 'CD', Angola: 'AO',
  Mali: 'ML', 'Burkina Faso': 'BF', Gabon: 'GA', Benin: 'BJ', Madagascar: 'MG',
  Tanzania: 'TZ', Zambia: 'ZM', Uganda: 'UG', Namibia: 'NA', Mauritania: 'MR',
  Gambia: 'GM', Togo: 'TG', Comoros: 'KM', Mozambique: 'MZ', Bahrain: 'BH',
  Oman: 'OM', Kuwait: 'KW', Lebanon: 'LB', Palestine: 'PS', India: 'IN',
  Indonesia: 'ID', Thailand: 'TH', Vietnam: 'VN', China: 'CN', 'China PR': 'CN',
  'New Caledonia': 'NC', Suriname: 'SR', Guatemala: 'GT', 'El Salvador': 'SV',
  Nicaragua: 'NI', 'Trinidad and Tobago': 'TT', 'Bosnia and Herzegovina': 'BA',
  Albania: 'AL', 'North Macedonia': 'MK', Georgia: 'GE', Kosovo: 'XK',
  Finland: 'FI', Iceland: 'IS', 'Republic of Ireland': 'IE', Ireland: 'IE',
  Israel: 'IL', Russia: 'RU', Montenegro: 'ME', Cyprus: 'CY', Luxembourg: 'LU',
}

// Subdivisions / specials that have their own flag emoji.
const SPECIAL_FLAGS = {
  England: '🏴\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
  Scotland: '🏴\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
  Wales: '🏴\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}',
}

function isoToFlag(cc) {
  return cc
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

export function flagFor(team) {
  if (!team) return '🏳️'
  if (SPECIAL_FLAGS[team]) return SPECIAL_FLAGS[team]
  const iso = TEAM_ISO[team]
  if (iso) return isoToFlag(iso)
  return '🏳️' // unresolved placeholder (e.g. "UEFA Path D winner")
}

// Tidy up placeholder team labels from the dataset.
export function cleanTeam(name) {
  if (!name) return 'TBD'
  let n = String(name).trim()
  let m
  if ((m = n.match(/^W(\d+)$/i))) return `Winner M${m[1]}`
  if ((m = n.match(/^L(\d+)$/i))) return `Loser M${m[1]}`
  if ((m = n.match(/^1([A-L])$/i))) return `Group ${m[1].toUpperCase()} Winner`
  if ((m = n.match(/^2([A-L])$/i))) return `Group ${m[1].toUpperCase()} Runner-up`
  if ((m = n.match(/^3([A-L/]+)$/i))) return `3rd Group ${m[1].toUpperCase()}`
  return n
    .replace(/\bwinner\b/i, 'Winner')
    .replace(/\brunner-?up\b/i, 'Runner-up')
}

// Map an openfootball "round" to a friendly stage label + pricing tier.
export function roundInfo(round = '') {
  const r = round.toLowerCase()
  if (r.startsWith('matchday') || r.includes('group')) return { label: 'Group Stage', tier: 1 }
  if (r.includes('round of 32')) return { label: 'Round of 32', tier: 1.8 }
  if (r.includes('round of 16')) return { label: 'Round of 16', tier: 2.5 }
  if (r.includes('quarter')) return { label: 'Quarter-final', tier: 3.6 }
  if (r.includes('semi')) return { label: 'Semi-final', tier: 6 }
  if (r.includes('third') || r.includes('3rd')) return { label: 'Third-place', tier: 3.2 }
  if (r.includes('final')) return { label: 'Final', tier: 11 }
  return { label: round || 'Group Stage', tier: 1.2 }
}

// Deterministic, plausible-looking resale prices per match.
function pricesFor(tier, num) {
  const jitter = 0.85 + ((num * 37) % 30) / 100 // 0.85..1.14, stable per match
  const r = (n) => Math.round((n / 5)) * 5
  return {
    c1: r(320 * tier * jitter),
    c2: r(175 * tier * jitter),
    c3: r(95 * tier * jitter),
  }
}

// "13:00 UTC-6" + "2026-06-11" -> Date
function parseKickoff(date, time) {
  const m = (time || '').match(/(\d{1,2}):(\d{2})\s*UTC([+-]?\d{1,2})?/)
  if (!m) return new Date(`${date}T18:00:00Z`)
  const hh = m[1].padStart(2, '0')
  const mm = m[2]
  const off = parseInt(m[3] ?? '0', 10)
  const sign = off < 0 ? '-' : '+'
  const oh = String(Math.abs(off)).padStart(2, '0')
  return new Date(`${date}T${hh}:${mm}:00${sign}${oh}:00`)
}

const CATS = [
  { name: 'Category 1', accent: 'lime', rows: ['A', 'B', 'C'], perRow: 12, key: 'c1' },
  { name: 'Category 2', accent: 'pitch', rows: ['D', 'E', 'F', 'G'], perRow: 12, key: 'c2' },
  { name: 'Category 3', accent: 'clay', rows: ['H', 'J', 'K', 'L'], perRow: 12, key: 'c3' },
]

export function normalizeMatch(raw, index) {
  const venue = VENUES[raw.ground] || { stadium: raw.ground || 'TBD', city: raw.ground || 'TBD', cc: '' }
  const { label: stage, tier } = roundInfo(raw.round)
  const num = index + 1
  const prices = pricesFor(tier, num)
  const home = cleanTeam(raw.team1)
  const away = cleanTeam(raw.team2)
  return {
    num,
    homeTeam: home,
    awayTeam: away,
    homeFlag: flagFor(raw.team1),
    awayFlag: flagFor(raw.team2),
    stage,
    group: raw.group || null,
    stadium: venue.stadium,
    city: venue.city,
    countryCode: venue.cc,
    date: parseKickoff(raw.date, raw.time),
    cats: CATS.map((c) => ({ name: c.name, accent: c.accent, rows: c.rows, perRow: c.perRow, price: prices[c.key] })),
  }
}

// Small offline fallback so seeding still works without network.
const FALLBACK = {
  matches: [
    { round: 'Matchday 1', date: '2026-06-11', time: '13:00 UTC-6', team1: 'Mexico', team2: 'South Africa', group: 'Group A', ground: 'Mexico City' },
    { round: 'Matchday 2', date: '2026-06-12', time: '18:00 UTC-7', team1: 'USA', team2: 'Paraguay', group: 'Group D', ground: 'Los Angeles (Inglewood)' },
    { round: 'Matchday 3', date: '2026-06-13', time: '18:00 UTC-4', team1: 'Brazil', team2: 'Morocco', group: 'Group C', ground: 'New York/New Jersey (East Rutherford)' },
    { round: 'Matchday 4', date: '2026-06-14', time: '15:00 UTC-5', team1: 'Netherlands', team2: 'Japan', group: 'Group F', ground: 'Dallas (Arlington)' },
    { round: 'Matchday 2', date: '2026-06-12', time: '15:00 UTC-4', team1: 'Canada', team2: 'Switzerland', group: 'Group B', ground: 'Toronto' },
    { round: 'Matchday 4', date: '2026-06-14', time: '12:00 UTC-5', team1: 'Germany', team2: 'Ecuador', group: 'Group E', ground: 'Houston' },
  ],
}

export async function fetchWorldCupMatches() {
  let data
  try {
    const res = await fetch(SOURCE_URL, { headers: { 'User-Agent': 'touchline26-seed' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    data = await res.json()
    console.log(`Fetched ${data.matches?.length ?? 0} matches from openfootball.`)
  } catch (err) {
    console.warn(`Could not fetch live schedule (${err.message}). Using offline fallback.`)
    data = FALLBACK
  }
  const matches = (data.matches || []).map((m, i) => normalizeMatch(m, i))
  return matches
}
