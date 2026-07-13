import FlightCard from './FlightCard'

// ── Section (arrivals or departures) ─────────────────────────
function Section({ title, flights, type, liveStateMap, color, emptyMsg }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: color, boxShadow: `0 0 6px ${color}60` }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </span>
        <span
          style={{
            padding: '1px 8px',
            borderRadius: '10px',
            background: `${color}15`,
            border: `1px solid ${color}30`,
            fontSize: '11px',
            color,
            fontWeight: 600,
          }}
        >
          {flights.length}
        </span>
      </div>

      {/* Empty state */}
      {flights.length === 0 ? (
        <div
          style={{
            padding: '20px',
            borderRadius: '10px',
            background: 'rgba(9,20,36,0.4)',
            border: '1px dashed rgba(255,255,255,0.06)',
            textAlign: 'center',
            color: '#334155',
            fontSize: '13px',
          }}
        >
          {emptyMsg}
        </div>
      ) : (
        /* Scrollable list */
        <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
          {flights.map((f, i) => (
            <FlightCard
              key={`${f.callsign ?? 'unk'}-${i}`}
              flight={f}
              type={type}
              liveStateMap={liveStateMap}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * FlightList — renders Arrivals and Departures sections with FlightCard items.
 * Receives filtered arrays from FlightTracker so it remains purely presentational.
 */
export default function FlightList({ arrivals, departures, liveStateMap, searchQuery }) {
  const noData = arrivals.length === 0 && departures.length === 0

  if (noData && !searchQuery) {
    return (
      <div
        style={{
          padding: '32px',
          borderRadius: '12px',
          background: 'rgba(9,20,36,0.5)',
          border: '1px dashed rgba(0,194,255,0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛬</div>
        <div style={{ fontSize: '14px', color: '#475569', marginBottom: '6px' }}>No flight data available</div>
        <div style={{ fontSize: '12px', color: '#334155' }}>
          The OpenSky API may not have data for this airport in the last 2 hours.<br />
          Try a different airport or refresh later.
        </div>
      </div>
    )
  }

  return (
    <div>
      <Section
        title="Arrivals"
        flights={arrivals}
        type="arrival"
        liveStateMap={liveStateMap}
        color="#00C2FF"
        emptyMsg={searchQuery ? 'No arrivals match your search.' : 'No arrival data in the last 2 hours.'}
      />
      <Section
        title="Departures"
        flights={departures}
        type="departure"
        liveStateMap={liveStateMap}
        color="#06EDD8"
        emptyMsg={searchQuery ? 'No departures match your search.' : 'No departure data in the last 2 hours.'}
      />
    </div>
  )
}
