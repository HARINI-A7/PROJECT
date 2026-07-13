import { Link } from 'react-router-dom'

// ── Feature Card ──────────────────────────────────────────────
// Used on the Dashboard to showcase each module
// Props: item (from NAV_ITEMS config), animationDelay (string)
// ─────────────────────────────────────────────────────────────

export default function FeatureCard({ item, animationDelay = '0s' }) {
  return (
    <Link
      to={item.path}
      id={`feature-card-${item.id}`}
      className="feature-card"
      style={{
        animationDelay,
        opacity: 0,
        animation: `fade-up 0.5s ease-out ${animationDelay} forwards`,
        textDecoration: 'none',
        display: 'block',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
          opacity: 0.5,
        }}
      />

      {/* Icon */}
      <div
        className="feature-card-icon"
        style={{
          background: item.colorBg,
          border: `1px solid ${item.colorBorder}`,
          boxShadow: `0 0 16px ${item.color}20`,
        }}
      >
        <span style={{ fontSize: '22px' }}>{item.emoji}</span>
      </div>

      {/* Content */}
      <div
        style={{
          fontFamily: 'Space Grotesk, Inter, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          color: '#E2E8F0',
          marginBottom: '8px',
        }}
      >
        {item.label}
      </div>

      <div
        style={{
          fontSize: '13px',
          color: '#64748B',
          lineHeight: 1.5,
          marginBottom: '16px',
        }}
      >
        {item.shortDesc}
      </div>

      {/* API badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11px',
          color: '#475569',
          fontWeight: 500,
        }}
      >
        <span style={{ color: item.color }}>⬡</span>
        {item.apiSource}
      </div>

      {/* Arrow indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: item.colorBg,
          border: `1px solid ${item.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: item.color,
          transition: 'transform 0.25s ease',
        }}
      >
        →
      </div>
    </Link>
  )
}
