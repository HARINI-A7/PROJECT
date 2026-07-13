// ── Status derivation ─────────────────────────────────────────
function getStatus(flight, liveStateMap, type) {
  const cs = flight.callsign?.trim()
  if (cs && liveStateMap.has(cs)) return { label: 'In Flight', color: '#00C2FF', bg: 'rgba(0,194,255,0.1)' }
  if (type === 'arrival'   && flight.lastSeen)  return { label: 'Landed',   color: '#10B981', bg: 'rgba(16,185,129,0.1)' }
  if (type === 'departure' && flight.lastSeen)  return { label: 'Departed', color: '#06EDD8', bg: 'rgba(6,237,216,0.1)' }
  return { label: 'Unknown', color: '#475569', bg: 'rgba(71,85,105,0.1)' }
}

// ── Time formatting ───────────────────────────────────────────
function fmt(unix) {
  if (!unix) return '—'
  return new Date(unix * 1000).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' IST'
}

/**
 * FlightCard — displays a single flight record (arrival or departure).
 * Status is derived from liveStateMap (O(1) lookup) and flight timestamps.
 */
export default function FlightCard({ flight, type, liveStateMap }) {
  const cs     = flight.callsign?.trim() || 'Unknown'
  const status = getStatus(flight, liveStateMap, type)

  return (
    <div
      id={`flight-card-${cs}-${type}`}
      style={{
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'rgba(9, 20, 36, 0.7)',
        border: '1px solid rgba(255,255,255,0.04)',
        marginBottom: '8px',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(0,194,255,0.18)'
        e.currentTarget.style.background  = 'rgba(9,20,36,0.9)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.background  = 'rgba(9,20,36,0.7)'
      }}
    >
      {/* Top row: callsign + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span
          style={{
            fontFamily: 'Space Grotesk, monospace',
            fontWeight: 700,
            fontSize: '14px',
            color: '#E2E8F0',
            letterSpacing: '0.03em',
          }}
        >
          {cs}
        </span>
        <span
          style={{
            padding: '2px 9px',
            borderRadius: '12px',
            background: status.bg,
            border: `1px solid ${status.color}40`,
            fontSize: '11px',
            color: status.color,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Bottom row: timestamps */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: '#475569' }}>
        <span title="First seen">🕐 {fmt(flight.firstSeen)}</span>
        <span title="Last seen"> 🕓 {fmt(flight.lastSeen)}</span>
        {flight.estDepartureAirport && (
          <span title="Origin">📍 {flight.estDepartureAirport}</span>
        )}
      </div>
    </div>
  )
}
