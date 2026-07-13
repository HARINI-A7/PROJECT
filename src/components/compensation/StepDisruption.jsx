import { useState } from 'react'
import { C, cardStyle } from './styles'
import { WizardFooter } from './StepFlight'

const DISRUPTION_TYPES = [
  { id: 'delay', icon: '⏱', label: 'Flight Delay', desc: 'Your flight departed late' },
  { id: 'cancellation', icon: '✕', label: 'Cancellation', desc: 'Your flight was cancelled' },
  { id: 'denied_boarding', icon: '🚫', label: 'Denied Boarding', desc: 'You were not allowed to board' },
]

const DELAY_RANGES = [
  { id: '3_5', label: '3–5 Hours', desc: 'Meal voucher entitlement' },
  { id: '5_8', label: '5–8 Hours', desc: '₹2,000 compensation' },
  { id: '8_plus', label: '8+ Hours / Overnight', desc: '₹5,000 + hotel accommodation' },
]

const CAUSES = [
  { id: 'airline', label: 'Airline Operations', desc: 'Technical issue, crew, overbooking' },
  { id: 'weather', label: 'Weather', desc: 'Bad weather conditions' },
  { id: 'atc', label: 'ATC / Air Traffic Control', desc: 'ATC restrictions or congestion' },
  { id: 'security', label: 'Security', desc: 'Security incident or threat' },
  { id: 'unknown', label: 'Unknown / Not Informed', desc: 'Airline did not provide a reason' },
]

function OptionCard({ selected, onClick, icon, label, desc }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left', cursor: 'pointer', width: '100%',
        padding: '14px 16px', borderRadius: '10px',
        background: selected ? 'rgba(0,194,255,0.1)' : 'rgba(255,255,255,0.03)',
        border: selected ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
        color: C.text, transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif',
        boxShadow: selected ? '0 0 16px rgba(0,194,255,0.15)' : 'none',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = C.border }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: selected ? C.blue : C.text }}>{label}</div>
          {desc && <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px' }}>{desc}</div>}
        </div>
        {selected && (
          <div style={{ marginLeft: 'auto', width: '18px', height: '18px', borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#02060F', fontWeight: 700 }}>✓</div>
        )}
      </div>
    </button>
  )
}

export default function StepDisruption({ disruptionDetails, onChange, onNext, onBack, isAnalyzing }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!disruptionDetails.type) e.type = 'Select a disruption type'
    if (disruptionDetails.type === 'delay' && !disruptionDetails.delayRange) e.delayRange = 'Select a delay range'
    if (!disruptionDetails.cause) e.cause = 'Select a cause'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const isValid =
    disruptionDetails.type &&
    (disruptionDetails.type !== 'delay' || disruptionDetails.delayRange) &&
    disruptionDetails.cause

  const handleNext = () => { if (validate()) onNext() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: C.text, margin: 0 }}>
            ⚡ Disruption Details
          </h2>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '6px 0 0' }}>
            Describe what happened. This determines which DGCA rules apply.
          </p>
        </div>

        {/* Disruption Type */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Type of Disruption
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DISRUPTION_TYPES.map(t => (
              <OptionCard key={t.id} selected={disruptionDetails.type === t.id}
                onClick={() => onChange({ type: t.id, delayRange: '' })}
                icon={t.icon} label={t.label} desc={t.desc} />
            ))}
          </div>
          {errors.type && <p style={{ fontSize: '12px', color: C.rose, marginTop: '8px' }}>⚠ {errors.type}</p>}
        </div>

        {/* Delay Range */}
        {disruptionDetails.type === 'delay' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              How Long Was the Delay?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DELAY_RANGES.map(r => (
                <OptionCard key={r.id} selected={disruptionDetails.delayRange === r.id}
                  onClick={() => onChange({ delayRange: r.id })} label={r.label} desc={r.desc} />
              ))}
            </div>
            {errors.delayRange && <p style={{ fontSize: '12px', color: C.rose, marginTop: '8px' }}>⚠ {errors.delayRange}</p>}
          </div>
        )}

        {/* Cause */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            What Caused the Disruption?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {CAUSES.map(c => (
              <OptionCard key={c.id} selected={disruptionDetails.cause === c.id}
                onClick={() => onChange({ cause: c.id })} label={c.label} desc={c.desc} />
            ))}
          </div>
          {errors.cause && <p style={{ fontSize: '12px', color: C.rose, marginTop: '8px' }}>⚠ {errors.cause}</p>}
        </div>
      </div>

      <WizardFooter
        onBack={onBack}
        onNext={handleNext}
        nextEnabled={Boolean(isValid)}
        nextLabel="→ Check Eligibility"
        isLoading={isAnalyzing}
      />
    </div>
  )
}
