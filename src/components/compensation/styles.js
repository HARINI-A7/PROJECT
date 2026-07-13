/** Shared design tokens for Compensation Assistant components */
export const C = {
  bg: 'rgba(9,20,36,0.85)',
  bgDark: '#02060F',
  border: 'rgba(0,194,255,0.12)',
  borderHover: 'rgba(0,194,255,0.35)',
  borderActive: 'rgba(0,194,255,0.5)',
  text: '#E2E8F0',
  textMuted: '#64748B',
  textSub: '#94A3B8',
  blue: '#00C2FF',
  cyan: '#06EDD8',
  emerald: '#10B981',
  rose: '#F43F5E',
  amber: '#F59E0B',
  purple: '#7C3AED',
  radius: '14px',
  radiusSm: '10px',
  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
}

export const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${C.border}`,
  borderRadius: C.radiusSm,
  color: C.text,
  fontSize: '14px',
  outline: 'none',
  transition: C.transition,
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
}

export const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: C.textSub,
  marginBottom: '6px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

export const cardStyle = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: C.radius,
  padding: '24px',
  backdropFilter: 'blur(12px)',
}

export const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '11px 24px',
  borderRadius: C.radiusSm,
  background: 'linear-gradient(135deg, #00C2FF, #06EDD8)',
  color: '#02060F',
  fontWeight: 700,
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
  transition: C.transition,
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.02em',
}

export const ghostBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '11px 20px',
  borderRadius: C.radiusSm,
  background: 'rgba(255,255,255,0.04)',
  color: C.textSub,
  fontWeight: 600,
  fontSize: '14px',
  border: `1px solid ${C.border}`,
  cursor: 'pointer',
  transition: C.transition,
  fontFamily: 'Inter, sans-serif',
}
