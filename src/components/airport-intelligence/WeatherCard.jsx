export default function WeatherCard({ weather, error, advisory }) {
  if (error) {
    return (
      <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', height: '100%' }}>
        <div style={{ color: '#FDA4AF', fontSize: '14px' }}>⚠️ {error}</div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(9, 20, 36, 0.85)', border: '1px solid rgba(255,255,255,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '14px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px', fontWeight: 700 }}>Live Weather</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', lineHeight: 1, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }}>{weather.emoji}</div>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#E2E8F0', fontFamily: 'Space Grotesk, sans-serif' }}>{weather.temperature}°C</div>
          <div style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500 }}>{weather.condition}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>WIND SPEED</div>
          <div style={{ fontSize: '14px', color: '#E2E8F0', fontWeight: 600 }}>{weather.windSpeed} km/h</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>WIND DIR</div>
          <div style={{ fontSize: '14px', color: '#E2E8F0', fontWeight: 600 }}>{weather.windDirection}°</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>VISIBILITY</div>
          <div style={{ fontSize: '14px', color: '#E2E8F0', fontWeight: 600 }}>{weather.visibility}</div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '8px', background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.2)', color: '#00C2FF', fontSize: '13px', lineHeight: 1.5 }}>
        <strong>AI Advisory:</strong> {advisory}
      </div>
    </div>
  )
}
