import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── Aircraft SVG icon factory ─────────────────────────────────
// Uses DivIcon to avoid Leaflet's default marker image path issues in Vite.
// Rotates the SVG by the aircraft's true_track (heading) value.
function createAircraftIcon(heading = 0, onGround = false) {
  const color = onGround ? '#10B981' : '#00C2FF'
  return L.divIcon({
    html: `
      <div style="
        width:24px; height:24px;
        display:flex; align-items:center; justify-content:center;
        transform:rotate(${heading}deg);
        filter:drop-shadow(0 0 4px ${color}90);
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>`,
    className: '',
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
    popupAnchor:[0, -14],
  })
}

// Airport marker (building emoji inside DivIcon)
function createAirportIcon() {
  return L.divIcon({
    html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 0 4px rgba(0,194,255,0.5))">🏢</div>`,
    className: '',
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
  })
}

// ── MapController ─────────────────────────────────────────────
// Smoothly flies the map to the selected airport whenever it changes
function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 9, { duration: 1.0 })
  }, [center, map])
  return null
}

// ── Popup content ─────────────────────────────────────────────
function AircraftPopup({ s }) {
  const alt  = s.baroAltitude != null ? `${Math.round(s.baroAltitude)} m` : '—'
  const spd  = s.velocity      != null ? `${Math.round(s.velocity * 3.6)} km/h` : '—'
  const hdg  = s.heading       != null ? `${Math.round(s.heading)}°` : '—'
  const vr   = s.verticalRate  != null ? `${s.verticalRate > 0 ? '+' : ''}${Math.round(s.verticalRate)} m/s` : '—'

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', minWidth: '160px' }}>
      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: '#0EA5E9' }}>
        {s.callsign || s.icao24}
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        {[
          ['Altitude',      alt],
          ['Speed',         spd],
          ['Heading',       hdg],
          ['Vertical Rate', vr],
          ['On Ground',     s.onGround ? 'Yes' : 'No'],
          ['ICAO24',        s.icao24],
        ].map(([label, val]) => (
          <tr key={label}>
            <td style={{ color: '#64748B', paddingRight: '8px', paddingBottom: '2px' }}>{label}</td>
            <td style={{ fontWeight: 600 }}>{val}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

/**
 * FlightMap — React Leaflet map showing:
 *   • Airport marker for the selected airport
 *   • Aircraft markers for live states matched to this airport's flights
 *
 * Aircraft whose callsign has no matching flight record are NOT rendered.
 * Missing aircraft for existing flights are silently omitted (no error).
 */
export default function FlightMap({ airport, liveStates }) {
  const center = useMemo(
    () => (airport ? [airport.lat, airport.lon] : [20.5937, 78.9629]),
    [airport]
  )

  // Filter: only aircraft with valid position (liveStates already filtered
  // by callsign match in the hook; here we just guard against null coords)
  const visibleAircraft = useMemo(
    () => liveStates.filter(s => s.latitude != null && s.longitude != null),
    [liveStates]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Map legend bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '10px 10px 0 0',
          background: 'rgba(5,13,26,0.95)',
          border: '1px solid rgba(0,194,255,0.1)',
          borderBottom: 'none',
          fontSize: '12px',
        }}
      >
        <span style={{ color: '#475569' }}>Live Map · OpenStreetMap</span>
        <span style={{ color: visibleAircraft.length > 0 ? '#00C2FF' : '#334155', fontWeight: 600 }}>
          {visibleAircraft.length > 0
            ? `✈ ${visibleAircraft.length} aircraft`
            : 'No matched aircraft in airspace'}
        </span>
      </div>

      {/* Map container */}
      <div style={{ flex: 1, borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid rgba(0,194,255,0.1)' }}>
        <MapContainer
          center={center}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
          zoomControl
        >
          {/* Dark-friendly tile layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Fly to airport when selection changes */}
          <MapController center={center} />

          {/* Airport marker */}
          {airport && (
            <Marker position={[airport.lat, airport.lon]} icon={createAirportIcon()}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                    {airport.name} ({airport.iata})
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{airport.fullName}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>ICAO: {airport.icao}</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Aircraft markers */}
          {visibleAircraft.map(s => (
            <Marker
              key={s.icao24}
              position={[s.latitude, s.longitude]}
              icon={createAircraftIcon(s.heading, s.onGround)}
            >
              <Popup maxWidth={220}>
                <AircraftPopup s={s} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
