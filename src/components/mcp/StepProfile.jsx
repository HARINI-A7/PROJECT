import { T, cardStyle, StickyFooter } from './mcpStyles'

const WALKING_SPEEDS = [
  { id: 'slow',   icon: '🐢', label: 'Slow',   desc: 'I walk slowly or need extra time' },
  { id: 'normal', icon: '🚶', label: 'Normal', desc: 'Average walking pace' },
  { id: 'fast',   icon: '🏃', label: 'Fast',   desc: 'I move quickly and know airports' },
]

const DELAY_OPTIONS = [0, 10, 20, 30, 45, 60]

const TOGGLES = [
  { id: 'hasBaggage',        icon: '🧳', label: 'Checked Baggage',      desc: 'Need to collect baggage at carousel' },
  { id: 'withChildren',      icon: '👨‍👧', label: 'Travelling with Children', desc: 'With children under 12' },
  { id: 'seniorCitizen',     icon: '👴', label: 'Senior Citizen',        desc: 'Age 60 or above' },
  { id: 'wheelchair',        icon: '♿', label: 'Mobility Assistance',   desc: 'Wheelchair or special assistance needed' },
  { id: 'frequentTraveller', icon: '⭐', label: 'Frequent Traveller',    desc: 'Know this airport well — saves time' },
  { id: 'firstVisit',        icon: '🗺', label: 'First Visit',           desc: 'Never been to this airport before' },
]

function SpeedCard({ option, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'center', cursor: 'pointer', flex: 1,
        padding: '16px 10px', borderRadius: '12px', fontFamily: 'Inter, sans-serif',
        background: selected ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.03)',
        border: selected ? `2px solid ${T.rose}` : `1px solid ${T.borderNeutral}`,
        transition: T.trans,
        boxShadow: selected ? '0 0 16px rgba(244,63,94,0.2)' : 'none',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = T.borderNeutral }}
    >
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{option.icon}</div>
      <div style={{ fontWeight: 700, fontSize: '14px', color: selected ? T.rose : T.text }}>{option.label}</div>
      <div style={{ fontSize: '11px', color: T.textMuted, marginTop: '4px', lineHeight: 1.4 }}>{option.desc}</div>
    </button>
  )
}

function Toggle({ item, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
        borderRadius: '10px', cursor: 'pointer',
        background: checked ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${checked ? 'rgba(244,63,94,0.3)' : T.borderNeutral}`,
        transition: T.trans,
      }}
      onMouseEnter={e => { if (!checked) e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = checked ? 'rgba(244,63,94,0.3)' : T.borderNeutral }}
    >
      {/* Custom checkbox */}
      <div style={{
        width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
        border: `2px solid ${checked ? T.rose : T.borderNeutral}`,
        background: checked ? T.rose : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', color: '#fff', fontWeight: 700, transition: 'all 0.2s ease',
      }}>
        {checked ? '✓' : ''}
      </div>
      <span style={{ fontSize: '16px' }}>{item.icon}</span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: checked ? T.rose : T.text }}>{item.label}</div>
        <div style={{ fontSize: '11px', color: T.textMuted }}>{item.desc}</div>
      </div>
    </div>
  )
}

export default function StepProfile({ profile, onChange, onNext, onBack, onCalculate, isCalculating }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Walking Speed */}
        <div style={cardStyle}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: T.text, marginBottom: '4px' }}>
              🚶 Walking Speed
            </div>
            <div style={{ fontSize: '13px', color: T.textMuted }}>
              This adjusts your estimated transit time through the airport.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {WALKING_SPEEDS.map(s => (
              <SpeedCard key={s.id} option={s} selected={profile.walkingSpeed === s.id}
                onClick={() => onChange({ walkingSpeed: s.id })} />
            ))}
          </div>
        </div>

        {/* Estimated Arrival Delay */}
        <div style={cardStyle}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: T.text, marginBottom: '4px' }}>
              ⏱ Expected Arrival Delay
            </div>
            <div style={{ fontSize: '13px', color: T.textMuted }}>
              Is your inbound flight delayed? This reduces your available connection time.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DELAY_OPTIONS.map(d => {
              const sel = profile.arrivalDelayMin === d
              return (
                <button key={d} onClick={() => onChange({ arrivalDelayMin: d })}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600,
                    background: sel ? T.rose : 'rgba(255,255,255,0.04)',
                    color: sel ? '#fff' : T.textSub,
                    border: sel ? `1px solid ${T.rose}` : `1px solid ${T.borderNeutral}`,
                    transition: T.trans,
                  }}>
                  {d === 0 ? 'On Time' : `+${d} min`}
                </button>
              )
            })}
          </div>
        </div>

        {/* Passenger Options */}
        <div style={cardStyle}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: T.text, marginBottom: '4px' }}>
              👤 Passenger Profile
            </div>
            <div style={{ fontSize: '13px', color: T.textMuted }}>
              Select all that apply — each option adjusts your transit estimate.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TOGGLES.map(t => (
              <Toggle key={t.id} item={t} checked={profile[t.id]}
                onChange={v => onChange({ [t.id]: v })} />
            ))}
          </div>
        </div>

        {/* Fitness App Placeholder */}
        <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '28px', opacity: 0.7 }}>📱</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#A78BFA', marginBottom: '3px' }}>
              Coming Soon — Fitness App Integration
            </div>
            <div style={{ fontSize: '12px', color: T.textMuted }}>
              Future versions can personalize walking speed using Google Fit, Apple Health, or Samsung Health data for even more accurate predictions.
            </div>
          </div>
        </div>

      </div>

      <StickyFooter
        onBack={onBack}
        onNext={onCalculate}
        nextLabel="🔍 Predict My Connection"
        nextEnabled={true}
        isLoading={isCalculating}
      />
    </div>
  )
}
