import { C } from './styles'

const STEP_LABELS = ['Flight Details', 'Disruption', 'Eligibility', 'Passenger Info', 'Results']

export default function WizardProgress({ currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '32px' }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
            {/* Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
                background: done ? 'linear-gradient(135deg,#00C2FF,#06EDD8)' : active ? 'rgba(0,194,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: done ? 'none' : active ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                color: done ? '#02060F' : active ? C.blue : C.textMuted,
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 0 16px rgba(0,194,255,0.3)' : 'none',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em',
                color: done ? C.cyan : active ? C.blue : C.textMuted,
                whiteSpace: 'nowrap', textTransform: 'uppercase',
              }}>
                {label}
              </span>
            </div>
            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 8px',
                marginBottom: '22px',
                background: done
                  ? 'linear-gradient(90deg,#00C2FF,#06EDD8)'
                  : 'rgba(255,255,255,0.06)',
                borderRadius: '1px',
                transition: 'background 0.4s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
