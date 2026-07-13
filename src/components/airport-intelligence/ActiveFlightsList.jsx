export default function ActiveFlightsList({ flights }) {
  return (
    <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(9, 20, 36, 0.85)', border: '1px solid rgba(255,255,255,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '14px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', fontWeight: 700 }}>
        Active Flights Nearby <span style={{ color: '#00C2FF' }}>({flights.length})</span>
      </h3>
      
      {flights.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '13px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          No active aircraft detected within immediate vicinity.
        </div>
      ) : (
        <div style={{ overflowY: 'auto', flex: 1, maxHeight: '350px', paddingRight: '4px' }}>
          {flights.map((f, i) => (
            <div key={`${f.icao24}-${i}`} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px', fontFamily: 'Space Grotesk, monospace' }}>{f.callsign || f.icao24}</div>
                <div style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'flex', gap: '12px' }}>
                  <span>Alt: {f.baroAltitude ? Math.round(f.baroAltitude) + 'm' : '—'}</span>
                  <span>Spd: {f.velocity ? Math.round(f.velocity * 3.6) + 'km/h' : '—'}</span>
                  <span>Hdg: {f.heading ? Math.round(f.heading) + '°' : '—'}</span>
                </div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: f.onGround ? 'rgba(71,85,105,0.2)' : 'rgba(16,185,129,0.2)', color: f.onGround ? '#94A3B8' : '#10B981' }}>
                {f.onGround ? 'Unknown' : 'Airborne'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
