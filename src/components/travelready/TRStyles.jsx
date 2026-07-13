// ──────────────────────────────────────────────────────────────
// TravelReady AI — Design Tokens
// Reuses FlightPulse dark aviation theme
// ──────────────────────────────────────────────────────────────

export const T = {
  bg: 'rgba(9,20,36,0.85)',
  bgDark: '#02060F',
  bgCard: 'rgba(9,20,36,0.92)',
  border: 'rgba(124,58,237,0.12)',
  borderFocus: 'rgba(124,58,237,0.5)',
  borderNeutral: 'rgba(0,194,255,0.12)',
  text: '#E2E8F0',
  textMuted: '#64748B',
  textSub: '#94A3B8',
  rose: '#F43F5E',
  blue: '#00C2FF',
  cyan: '#06EDD8',
  emerald: '#10B981',
  amber: '#F59E0B',
  purple: '#7C3AED',
  radius: '14px',
  radiusSm: '10px',
  trans: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
}

export const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: T.radiusSm,
  border: `1px solid ${T.borderNeutral}`,
  background: 'rgba(255,255,255,0.04)',
  color: T.text,
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: T.trans,
  boxSizing: 'border-box',
}

export const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: T.textSub,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

export const cardStyle = {
  background: T.bg,
  border: `1px solid ${T.borderNeutral}`,
  borderRadius: T.radius,
  padding: '24px',
  backdropFilter: 'blur(12px)',
}

export const primaryBtn = {
  padding: '12px 24px',
  borderRadius: T.radiusSm,
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
  color: '#FFF',
  fontWeight: 700,
  fontSize: '14px',
  border: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: T.trans,
  whiteSpace: 'nowrap',
}

export const ghostBtn = {
  padding: '12px 24px',
  borderRadius: T.radiusSm,
  cursor: 'pointer',
  background: 'transparent',
  color: T.textSub,
  fontWeight: 600,
  fontSize: '14px',
  border: `1px solid ${T.borderNeutral}`,
  fontFamily: 'Inter, sans-serif',
  transition: T.trans,
  whiteSpace: 'nowrap',
}

export function StickyFooter({ children }) {
  return (
    <div style={{
      position: 'sticky', bottom: 0,
      padding: '16px 0', marginTop: '24px',
      background: 'linear-gradient(to top, rgba(2,6,15,0.95) 60%, transparent)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      zIndex: 10,
    }}>
      {children}
    </div>
  )
}

export const READINESS_TIERS = [
  { min: 80, label: '🟢 Travel Ready',    color: T.emerald, verdict: 'You are well-prepared for your trip.' },
  { min: 60, label: '🟡 Almost Ready',    color: T.amber,   verdict: 'Minor improvements needed before departure.' },
  { min: 40, label: '🟠 Needs Attention', color: '#F97316', verdict: 'Several items require your attention before travel.' },
  { min: 0,  label: '🔴 Action Required', color: T.rose,    verdict: 'Critical preparation needed. Address the issues below.' },
]

export function getReadinessTier(score) {
  return READINESS_TIERS.find(t => score >= t.min) || READINESS_TIERS[READINESS_TIERS.length - 1]
}
