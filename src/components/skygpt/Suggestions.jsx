import { SUGGESTIONS } from '../../api/sarvam'

const CARD_COLORS = [
  { bg: 'rgba(0,194,255,0.08)', border: 'rgba(0,194,255,0.2)', hover: 'rgba(0,194,255,0.15)' },
  { bg: 'rgba(6,237,216,0.08)', border: 'rgba(6,237,216,0.2)', hover: 'rgba(6,237,216,0.15)' },
  { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', hover: 'rgba(124,58,237,0.15)' },
  { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', hover: 'rgba(249,115,22,0.15)' },
  { bg: 'rgba(0,194,255,0.08)', border: 'rgba(0,194,255,0.2)', hover: 'rgba(0,194,255,0.15)' },
  { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', hover: 'rgba(16,185,129,0.15)' },
]

export default function Suggestions({ onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '32px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(0,194,255,0.4))' }}>✈️</div>
        <h2 style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: '24px', fontWeight: 800, color: '#E2E8F0', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          How can I help you today?
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
          Ask me anything about your flight, airport, or travel rights — in English or हिंदी
        </p>
      </div>

      {/* Suggestion cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '640px', width: '100%' }}>
        {SUGGESTIONS.map((q, i) => {
          const color = CARD_COLORS[i % CARD_COLORS.length]
          return (
            <button
              key={i}
              onClick={() => onSelect(q)}
              style={{
                padding: '16px 18px',
                borderRadius: '12px',
                background: color.bg,
                border: `1px solid ${color.border}`,
                color: '#CBD5E1',
                fontSize: '14px',
                fontWeight: 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                lineHeight: 1.4,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = color.hover
                e.currentTarget.style.color = '#E2E8F0'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 4px 16px ${color.border}`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = color.bg
                e.currentTarget.style.color = '#CBD5E1'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '16px', marginRight: '8px', verticalAlign: 'middle' }}>
                {i < 4 ? '💬' : '🇮🇳'}
              </span>
              {q}
            </button>
          )
        })}
      </div>
    </div>
  )
}
