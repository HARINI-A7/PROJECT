// ── Status Bar ────────────────────────────────────────────────
// Fixed bottom bar showing live platform status indicators
// ─────────────────────────────────────────────────────────────

const STATUSES = [
  { id: 'live-data', dot: true, color: '#10B981', label: 'Live Data: Active' },
  { id: 'opensky-api', dot: true, color: '#00C2FF', label: 'OpenSky API: Connected' },
  { id: 'ai-engine', dot: true, color: '#7C3AED', label: 'AI Engine: Ready' },
  { id: 'sarvam', dot: true, color: '#F59E0B', label: 'SkyGPT: Standby' },
]

export default function StatusBar({ sidebarWidth = 240 }) {
  return (
    <div
      id="status-bar"
      className="status-bar"
      style={{ left: sidebarWidth }}
    >
      {STATUSES.map((s) => (
        <div
          key={s.id}
          id={s.id}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span
            className="status-dot animate-pulse-dot"
            style={{ background: s.color, boxShadow: `0 0 8px ${s.color}80` }}
          />
          <span style={{ color: '#475569', fontSize: '11px' }}>{s.label}</span>
        </div>
      ))}

      <div style={{ marginLeft: 'auto', color: '#1E293B', fontSize: '11px' }}>
        {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      </div>
    </div>
  )
}
