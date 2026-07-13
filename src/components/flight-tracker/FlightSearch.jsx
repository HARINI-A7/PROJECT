/**
 * FlightSearch — instant local filter input.
 * Filters happen in FlightTracker via useMemo, no API calls made.
 */
export default function FlightSearch({ query, onChange }) {
  return (
    <div style={{ position: 'relative', marginBottom: '14px' }}>
      <span
        style={{
          position: 'absolute',
          left: '11px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '13px',
          color: '#475569',
          pointerEvents: 'none',
        }}
      >
        🔍
      </span>
      <input
        id="flight-search"
        type="text"
        value={query}
        onChange={e => onChange(e.target.value)}
        placeholder="Search callsign or flight number…"
        aria-label="Search flights"
        style={{
          width: '100%',
          padding: '9px 12px 9px 34px',
          borderRadius: '8px',
          background: 'rgba(9, 20, 36, 0.85)',
          border: '1px solid rgba(0, 194, 255, 0.15)',
          color: '#E2E8F0',
          fontSize: '13px',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(0,194,255,0.4)')}
        onBlur={e  => (e.target.style.borderColor = 'rgba(0,194,255,0.15)')}
      />
      {query && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
