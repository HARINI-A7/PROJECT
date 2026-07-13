import ComingSoonBadge from '../ui/ComingSoonBadge'

// ── Module Page Template ──────────────────────────────────────
// Reusable wrapper for all module placeholder pages
// Props: item (from NAV_ITEMS), features (array of strings)
// ─────────────────────────────────────────────────────────────

export default function ModulePage({ item, features = [], futureDemo = null, children }) {
  return (
    <div className="module-page animate-fade-in">
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#334155',
          marginBottom: '32px',
        }}
      >
        <span>Dashboard</span>
        <span>›</span>
        <span style={{ color: item.color }}>{item.label}</span>
      </div>

      {/* Page header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          {/* Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: item.colorBg,
              border: `1px solid ${item.colorBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: `0 0 24px ${item.color}20`,
              flexShrink: 0,
            }}
          >
            {item.emoji}
          </div>

          <div style={{ flex: 1 }}>
            {/* Module label */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: item.color,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Module
            </div>

            <h1
              id={`page-title-${item.id}`}
              style={{
                fontFamily: 'Space Grotesk, Inter, sans-serif',
                fontSize: '32px',
                fontWeight: 800,
                color: '#E2E8F0',
                margin: '0 0 10px',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              {item.label}
            </h1>

            <p
              style={{
                fontSize: '15px',
                color: '#64748B',
                margin: '0 0 16px',
                lineHeight: 1.6,
                maxWidth: '560px',
              }}
            >
              {item.description}
            </p>

            {/* API source badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '20px',
                background: item.colorBg,
                border: `1px solid ${item.colorBorder}`,
                fontSize: '12px',
                color: item.color,
                fontWeight: 600,
              }}
            >
              🔌 Powered by {item.apiSource}
            </div>
          </div>
        </div>
      </div>

      {/* Planned features */}
      {features.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: '#475569',
              margin: '0 0 16px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Planned Features
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(9, 20, 36, 0.6)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '13px',
                  color: '#64748B',
                }}
              >
                <span style={{ color: item.color, fontSize: '16px' }}>◇</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Demo */}
      {futureDemo && (
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: '#475569',
              margin: '0 0 16px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Future Demo Experience
          </h2>
          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(9, 20, 36, 0.8) 0%, rgba(13, 27, 46, 0.6) 100%)',
              border: `1px solid ${item.colorBorder}`,
              boxShadow: `0 4px 20px ${item.color}10`,
            }}
          >
            <div style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px', fontWeight: 500 }}>
              {futureDemo.description}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              {futureDemo.points.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#94A3B8',
                  }}
                >
                  <span style={{ color: item.color }}>✓</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon badge (only if no children) */}
      {!children && <ComingSoonBadge />}

      {/* Main Feature Content */}
      {children}
    </div>
  )
}
