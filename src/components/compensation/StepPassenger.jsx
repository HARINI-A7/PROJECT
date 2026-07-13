import { useState } from 'react'
import { C, inputStyle, labelStyle, cardStyle } from './styles'
import { WizardFooter } from './StepFlight'

export default function StepPassenger({ passengerDetails, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!passengerDetails.name.trim()) e.name = 'Enter your name'
    if (!passengerDetails.email.trim() || !/\S+@\S+\.\S+/.test(passengerDetails.email)) e.email = 'Enter a valid email'
    if (!passengerDetails.phone.trim() || !/^[6-9]\d{9}$/.test(passengerDetails.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!passengerDetails.passengerCount || passengerDetails.passengerCount < 1) e.passengerCount = 'At least 1 passenger required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const isValid =
    passengerDetails.name.trim() &&
    /\S+@\S+\.\S+/.test(passengerDetails.email) &&
    /^[6-9]\d{9}$/.test(passengerDetails.phone.replace(/\s/g, '')) &&
    passengerDetails.passengerCount >= 1

  const handleNext = () => { if (validate()) onNext() }

  const field = (id, label, content) => (
    <div key={id}>
      <label style={labelStyle}>{label}</label>
      {content}
      {errors[id] && (
        <p style={{ fontSize: '12px', color: C.rose, marginTop: '4px', marginBottom: 0 }}>⚠ {errors[id]}</p>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: C.text, margin: 0 }}>
            👤 Passenger Details
          </h2>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '6px 0 0' }}>
            Used for your claim documents and complaint letter only. Nothing is submitted to any server.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {field('name', 'Full Name', (
            <input
              style={{ ...inputStyle, borderColor: errors.name ? C.rose : C.border }}
              placeholder="As on ID proof"
              value={passengerDetails.name}
              onChange={e => onChange({ name: e.target.value })}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = errors.name ? C.rose : C.border}
            />
          ))}

          {field('passengerCount', 'Number of Passengers', (
            <input
              type="number"
              style={{ ...inputStyle, borderColor: errors.passengerCount ? C.rose : C.border }}
              min={1} max={9}
              value={passengerDetails.passengerCount}
              onChange={e => onChange({ passengerCount: parseInt(e.target.value) || 1 })}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = errors.passengerCount ? C.rose : C.border}
            />
          ))}

          {field('email', 'Email Address', (
            <input
              type="email"
              style={{ ...inputStyle, borderColor: errors.email ? C.rose : C.border }}
              placeholder="For airline correspondence"
              value={passengerDetails.email}
              onChange={e => onChange({ email: e.target.value })}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = errors.email ? C.rose : C.border}
            />
          ))}

          {field('phone', 'Mobile Number', (
            <input
              type="tel"
              style={{ ...inputStyle, borderColor: errors.phone ? C.rose : C.border }}
              placeholder="10-digit mobile number"
              value={passengerDetails.phone}
              onChange={e => onChange({ phone: e.target.value })}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = errors.phone ? C.rose : C.border}
            />
          ))}
        </div>

        <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(0,194,255,0.05)', border: '1px solid rgba(0,194,255,0.12)', borderRadius: '10px' }}>
          <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>
            🔒 Your data is stored only in your browser and used solely for generating claim documents.
          </p>
        </div>
      </div>

      <WizardFooter
        onBack={onBack}
        onNext={handleNext}
        nextEnabled={Boolean(isValid)}
        nextLabel="→ View Full Results"
      />
    </div>
  )
}
