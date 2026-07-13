/** Shared design tokens for Missed Connection Predictor */
export const T = {
  bg: 'rgba(9,20,36,0.85)',
  bgDark: '#02060F',
  border: 'rgba(244,63,94,0.12)',
  borderFocus: 'rgba(244,63,94,0.5)',
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
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${T.borderNeutral}`,
  borderRadius: T.radiusSm,
  color: T.text,
  fontSize: '14px',
  outline: 'none',
  transition: T.trans,
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
}

export const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: T.textSub,
  marginBottom: '6px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

export const cardStyle = {
  background: T.bg,
  border: `1px solid ${T.borderNeutral}`,
  borderRadius: T.radius,
  padding: '24px',
  backdropFilter: 'blur(12px)',
}

export const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '11px 24px', borderRadius: T.radiusSm,
  background: 'linear-gradient(135deg, #F43F5E, #FB7185)',
  color: '#fff', fontWeight: 700, fontSize: '14px',
  border: 'none', cursor: 'pointer', transition: T.trans,
  fontFamily: 'Inter, sans-serif',
}

export const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '11px 20px', borderRadius: T.radiusSm,
  background: 'rgba(255,255,255,0.04)', color: T.textSub,
  fontWeight: 600, fontSize: '14px',
  border: `1px solid ${T.borderNeutral}`,
  cursor: 'pointer', transition: T.trans,
  fontFamily: 'Inter, sans-serif',
}

export const StickyFooter = ({ onBack, onNext, nextLabel = 'Continue →', nextEnabled = true, isLoading = false, showBack = true }) => (
  <div style={{
    position: 'sticky', bottom: 0, zIndex: 10, marginTop: '0',
    padding: '14px 24px',
    background: 'rgba(5,13,26,0.97)', backdropFilter: 'blur(16px)',
    borderTop: '1px solid rgba(244,63,94,0.1)',
    display: 'flex', justifyContent: showBack ? 'space-between' : 'flex-end',
    alignItems: 'center', gap: '12px',
  }}>
    {showBack && (
      <button style={ghostBtn} onClick={onBack}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.borderNeutral}>
        ← Back
      </button>
    )}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {!nextEnabled && <span style={{ fontSize: '12px', color: T.textMuted }}>Complete required fields</span>}
      <button
        style={{ ...primaryBtn, opacity: nextEnabled && !isLoading ? 1 : 0.45, cursor: nextEnabled && !isLoading ? 'pointer' : 'not-allowed' }}
        onClick={nextEnabled && !isLoading ? onNext : undefined}
        disabled={!nextEnabled || isLoading}
      >
        {isLoading ? '⏳ Calculating...' : nextLabel}
      </button>
    </div>
  </div>
)
