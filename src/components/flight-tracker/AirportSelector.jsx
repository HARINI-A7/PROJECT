/**
 * AirportSelector — styled native <select> for the 6 major Indian airports.
 * Changing selection triggers parent's onChange, which resets all flight data.
 */
export default function AirportSelector({ airports, selected, onChange }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: '12px', fontSize: '15px', pointerEvents: 'none' }}>🏢</span>
      <select
        id="airport-selector"
        value={selected}
        onChange={e => onChange(e.target.value)}
        aria-label="Select airport"
        style={{
          padding: '9px 40px 9px 36px',
          borderRadius: '8px',
          background: 'rgba(9, 20, 36, 0.9)',
          border: '1px solid rgba(0, 194, 255, 0.25)',
          color: '#E2E8F0',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          minWidth: '220px',
          // Custom chevron via background-image
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2300C2FF'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
      >
        {airports.map(a => (
          <option key={a.icao} value={a.icao} style={{ background: '#050D1A' }}>
            {a.name} ({a.iata}) · {a.icao}
          </option>
        ))}
      </select>
    </div>
  )
}
