export default function OverviewCards({ arrivals, departures, activeFlights, trafficLevel, trafficColor }) {
  const CARDS = [
    { label: 'Total Active Flights', value: activeFlights, icon: '✈️', color: '#7C3AED' },
    { label: 'Total Arrivals (6h)', value: arrivals, icon: '🛬', color: '#00C2FF' },
    { label: 'Total Departures (6h)', value: departures, icon: '🛫', color: '#06EDD8' },
    { label: 'Airport Traffic Level', value: trafficLevel, icon: '🚥', color: trafficColor, isText: true },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {CARDS.map((card, i) => (
        <div
          key={i}
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(9, 20, 36, 0.85)',
            border: '1px solid rgba(255,255,255,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${card.color}60, transparent)` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>{card.icon}</span>
            {card.label}
          </div>
          <div
            style={{
              fontSize: card.isText ? '20px' : '32px',
              fontWeight: 800,
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              color: card.color,
              lineHeight: 1.1,
              filter: `drop-shadow(0 0 8px ${card.color}40)`,
            }}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
