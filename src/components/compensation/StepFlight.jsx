import { useState } from 'react'
import { C, inputStyle, labelStyle, cardStyle, primaryBtn, ghostBtn } from './styles'
import { AIRLINES, AIRPORTS } from '../../hooks/useCompensationAssistant'

export default function StepFlight({ flightDetails, onChange, onNext }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!flightDetails.airlineId) e.airlineId = 'Select an airline'
    if (!flightDetails.flightNumber.trim()) e.flightNumber = 'Enter flight number'
    if (!flightDetails.date) e.date = 'Select travel date'
    if (!flightDetails.origin) e.origin = 'Select origin airport'
    if (!flightDetails.destination) e.destination = 'Select destination airport'
    if (flightDetails.origin && flightDetails.origin === flightDetails.destination)
      e.destination = 'Origin and destination must differ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate()) onNext() }

  const isValid =
    flightDetails.airlineId &&
    flightDetails.flightNumber.trim() &&
    flightDetails.date &&
    flightDetails.origin &&
    flightDetails.destination &&
    flightDetails.origin !== flightDetails.destination

  const field = (id, label, content) => (
    <div key={id}>
      <label style={labelStyle}>{label}</label>
      {content}
      {errors[id] && (
        <p style={{ fontSize: '12px', color: C.rose, marginTop: '4px', marginBottom: 0 }}>⚠ {errors[id]}</p>
      )}
    </div>
  )

  const sel = (id, value, opts, placeholder, onChangeFn) => (
    <select
      value={value}
      onChange={onChangeFn}
      style={{ ...inputStyle, cursor: 'pointer', borderColor: errors[id] ? C.rose : C.border }}
      onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.outline = 'none' }}
      onBlur={e => e.target.style.borderColor = errors[id] ? C.rose : C.border}
    >
      <option value="">{placeholder}</option>
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: C.text, margin: 0 }}>
            ✈ Flight Details
          </h2>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '6px 0 0' }}>
            Tell us about your flight so we can identify applicable DGCA rules.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {field('airlineId', 'Airline', sel(
            'airlineId', flightDetails.airlineId,
            AIRLINES.map(a => ({ value: a.id, label: `${a.name} (${a.code})` })),
            'Select airline',
            e => onChange({ airlineId: e.target.value, airline: AIRLINES.find(a => a.id === e.target.value)?.name || '' })
          ))}

          {field('flightNumber', 'Flight Number', (
            <input
              style={{ ...inputStyle, borderColor: errors.flightNumber ? C.rose : C.border }}
              placeholder="e.g. 6E-204"
              value={flightDetails.flightNumber}
              onChange={e => onChange({ flightNumber: e.target.value.toUpperCase() })}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = errors.flightNumber ? C.rose : C.border}
            />
          ))}

          {field('date', 'Date of Travel', (
            <input
              type="date"
              style={{ ...inputStyle, colorScheme: 'dark', borderColor: errors.date ? C.rose : C.border }}
              value={flightDetails.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => onChange({ date: e.target.value })}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = errors.date ? C.rose : C.border}
            />
          ))}

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              style={{ ...ghostBtn, width: '100%', justifyContent: 'center', opacity: 0.45, cursor: 'not-allowed' }}
              disabled
              title="Import from Flight Tracker — coming in next update"
            >
              🔗 Import from Flight Tracker
            </button>
          </div>

          {field('origin', 'Origin Airport', sel(
            'origin', flightDetails.origin,
            AIRPORTS.map(a => ({ value: a.code, label: a.name })),
            'Select origin',
            e => onChange({ origin: e.target.value })
          ))}

          {field('destination', 'Destination Airport', sel(
            'destination', flightDetails.destination,
            AIRPORTS.filter(a => a.code !== flightDetails.origin).map(a => ({ value: a.code, label: a.name })),
            'Select destination',
            e => onChange({ destination: e.target.value })
          ))}
        </div>
      </div>

      {/* ── Sticky Footer ── */}
      <WizardFooter
        onNext={handleNext}
        nextEnabled={Boolean(isValid)}
        nextLabel="Continue → Disruption Details"
        showBack={false}
      />
    </div>
  )
}

export function WizardFooter({ onBack, onNext, nextEnabled = true, nextLabel = 'Continue →', isLoading = false, showBack = true }) {
  return (
    <div style={{
      position: 'sticky', bottom: 0, zIndex: 10,
      marginTop: '0',
      padding: '14px 24px',
      background: 'rgba(5,13,26,0.97)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(0,194,255,0.1)',
      display: 'flex',
      justifyContent: showBack ? 'space-between' : 'flex-end',
      alignItems: 'center',
      gap: '12px',
    }}>
      {showBack && (
        <button
          style={ghostBtn}
          onClick={onBack}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.12)'}
        >
          ← Back
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!nextEnabled && (
          <span style={{ fontSize: '12px', color: '#64748B' }}>Complete required fields to continue</span>
        )}
        <button
          style={{
            ...primaryBtn,
            opacity: nextEnabled && !isLoading ? 1 : 0.45,
            cursor: nextEnabled && !isLoading ? 'pointer' : 'not-allowed',
            filter: nextEnabled ? 'none' : 'grayscale(0.3)',
          }}
          onClick={nextEnabled && !isLoading ? onNext : undefined}
          disabled={!nextEnabled || isLoading}
        >
          {isLoading ? '⏳ Analyzing...' : nextLabel}
        </button>
      </div>
    </div>
  )
}
