// ── Coming Soon Badge ─────────────────────────────────────────
// Displays a stylised badge on module placeholder pages
// ─────────────────────────────────────────────────────────────

export default function ComingSoonBadge() {
  return (
    <div
      id="coming-soon-badge"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px 48px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(249, 115, 22, 0.04) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        marginTop: '40px',
      }}
    >
      <div style={{ fontSize: '48px' }}>🚧</div>

      <div className="coming-soon-badge">
        <span>⚡</span>
        Coming Soon
      </div>

      <div
        style={{
          fontSize: '14px',
          color: '#475569',
          textAlign: 'center',
          maxWidth: '320px',
          lineHeight: 1.6,
        }}
      >
        This module is under active development. Real functionality will be integrated step by step.
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px',
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i < 1 ? '#F59E0B' : 'rgba(245, 158, 11, 0.2)',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: '11px', color: '#374151' }}>1 / 5 steps complete</div>
    </div>
  )
}
