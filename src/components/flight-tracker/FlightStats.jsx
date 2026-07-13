/**
 * FlightStats — summary stat cards at the top of the Flight Tracker.
 * Shows totals for arrivals, departures, and airborne count from live states.
 */
export default function FlightStats({ arrivals, departures, liveStates, loading }) {
  const airborne = liveStates.filter(s => !s.onGround).length

  const CARDS = [
    { id: 'stat-arrivals',   icon: '↓', label: 'Total Arrivals',       value: arrivals.length,   color: '#00C2FF' },
    { id: 'stat-departures', icon: '↑', label: 'Total Departures',     value: departures.length, color: '#06EDD8' },
    { id: 'stat-airborne',   icon: '✈', label: 'Live Aircraft Airborne', value: airborne,          color: '#7C3AED' },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
        marginBottom: '20px',
      }}
    >
      {CARDS.map(card => (
        <div
          key={card.id}
          id={card.id}
          style={{
            padding: '18px 20px',
            borderRadius: '12px',
            background: 'rgba(9, 20, 36, 0.85)',
            border: '1px solid rgba(255,255,255,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Accent top line */}
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${card.color}60, transparent)` }} />

          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: card.color }}>{card.icon}</span>
            {card.label}
          </div>

          <div
            style={{
              fontSize: '30px',
              fontWeight: 800,
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              color: card.color,
              lineHeight: 1,
              filter: `drop-shadow(0 0 8px ${card.color}40)`,
            }}
          >
            {loading && card.value === 0 ? '—' : card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
