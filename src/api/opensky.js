// ──────────────────────────────────────────────────────────────
// OpenSky Network API — Service Layer
// All requests route through the Vite dev-server proxy at
// /api/opensky, which handles OAuth2 token exchange server-side.
// ──────────────────────────────────────────────────────────────

const BASE = '/api/opensky'

// Indian airspace bounding box for state filtering
export const INDIA_BBOX = { lamin: 6.4, lamax: 37.1, lomin: 68.1, lomax: 97.4 }

// ── Major Indian Airports ─────────────────────────────────────
export const INDIAN_AIRPORTS = [
  { icao: 'VABB', iata: 'BOM', name: 'Mumbai',    fullName: 'Chhatrapati Shivaji Maharaj Intl', lat: 19.0896, lon: 72.8656 },
  { icao: 'VIDP', iata: 'DEL', name: 'Delhi',     fullName: 'Indira Gandhi International',       lat: 28.5562, lon: 77.1000 },
  { icao: 'VOBL', iata: 'BLR', name: 'Bengaluru', fullName: 'Kempegowda International',          lat: 13.1986, lon: 77.7066 },
  { icao: 'VOMM', iata: 'MAA', name: 'Chennai',   fullName: 'Chennai International',             lat: 12.9941, lon: 80.1709 },
  { icao: 'VOHS', iata: 'HYD', name: 'Hyderabad', fullName: 'Rajiv Gandhi International',        lat: 17.2313, lon: 78.4298 },
  { icao: 'VECC', iata: 'CCU', name: 'Kolkata',   fullName: 'Netaji Subhas Chandra Bose Intl',  lat: 22.6520, lon: 88.4463 },
]

// ── Timestamp helpers ─────────────────────────────────────────
/** Returns a rolling 2-hour window in Unix epoch seconds */
export function getTimeWindow() {
  const end = Math.floor(Date.now() / 1000)
  return { begin: end - 21600, end }
}

// ── State vector parser ───────────────────────────────────────
// OpenSky states/all returns arrays — map positional indices to names
function parseStateVector(sv) {
  return {
    icao24:       sv[0],
    callsign:     (sv[1] || '').trim(),
    originCountry: sv[2],
    timePosition: sv[3],
    lastContact:  sv[4],
    longitude:    sv[5],   // degrees
    latitude:     sv[6],   // degrees
    baroAltitude: sv[7],   // metres
    onGround:     sv[8],
    velocity:     sv[9],   // m/s
    heading:      sv[10],  // degrees clockwise from north
    verticalRate: sv[11],  // m/s
    geoAltitude:  sv[13],  // metres
    squawk:       sv[14],
  }
}

// ── Core fetch wrapper ────────────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`${BASE}/${path}`)

  if (res.status === 401) throw new Error('AUTH_FAILED')
  if (res.status === 429) throw new Error('RATE_LIMITED')
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`)

  const text = await res.text()
  if (!text || text.trim() === 'null' || text.trim() === '') return null
  return JSON.parse(text)
}

// ── Public API functions ──────────────────────────────────────

/**
 * Fetch arrivals for the given airport ICAO in the specified time window.
 * @returns {Promise<FlightRecord[]>}
 */
export async function fetchArrivals(icao, begin, end) {
  const data = await apiFetch(`flights/arrival?airport=${icao}&begin=${begin}&end=${end}`)
  return Array.isArray(data) ? data : []
}

/**
 * Fetch departures for the given airport ICAO in the specified time window.
 * @returns {Promise<FlightRecord[]>}
 */
export async function fetchDepartures(icao, begin, end) {
  const data = await apiFetch(`flights/departure?airport=${icao}&begin=${begin}&end=${end}`)
  return Array.isArray(data) ? data : []
}

/**
 * Fetch all live aircraft states within India's bounding box.
 * Filters out aircraft with no position data.
 * @returns {Promise<StateVector[]>}
 */
export async function fetchLiveStates() {
  const { lamin, lamax, lomin, lomax } = INDIA_BBOX
  const data = await apiFetch(
    `states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`
  )
  if (!data || !Array.isArray(data.states)) return []
  return data.states
    .map(parseStateVector)
    .filter(s => s.latitude != null && s.longitude != null)
}
