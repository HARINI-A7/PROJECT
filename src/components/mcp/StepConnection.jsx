import { useState } from 'react'
import { T, inputStyle, labelStyle, cardStyle, StickyFooter } from './mcpStyles'
import { AIRPORTS, INTL_AIRPORTS, AIRLINES, CONNECTION_TYPES } from '../../hooks/useMissedConnectionPredictor'

function Field({ id, label, error, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '12px', color: T.rose, marginTop: '4px', marginBottom: 0 }}>⚠ {error}</p>}
    </div>
  )
}

function Sel({ value, onChange, options, placeholder, err }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...inputStyle, cursor: 'pointer', borderColor: err ? T.rose : T.borderNeutral }}
      onFocus={e => e.target.style.borderColor = T.rose}
      onBlur={e => e.target.style.borderColor = err ? T.rose : T.borderNeutral}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

/** Grouped select with 🇮🇳 Indian and 🌍 International optgroups */
function GroupedSel({ value, onChange, excludeCodes = [], placeholder, err }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...inputStyle, cursor: 'pointer', borderColor: err ? T.rose : T.borderNeutral }}
      onFocus={e => e.target.style.borderColor = T.rose}
      onBlur={e => e.target.style.borderColor = err ? T.rose : T.borderNeutral}
    >
      <option value="">{placeholder}</option>
      <optgroup label="🇮🇳 Indian Airports">
        {AIRPORTS
          .filter(a => !excludeCodes.includes(a.code))
          .map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
      </optgroup>
      <optgroup label="🌍 International Airports">
        {INTL_AIRPORTS
          .filter(a => !excludeCodes.includes(a.code))
          .map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
      </optgroup>
    </select>
  )
}

function TimeInput({ value, onChange, err }) {
  return (
    <input
      type="time"
      style={{ ...inputStyle, colorScheme: 'dark', borderColor: err ? T.rose : T.borderNeutral }}
      value={value}
      onChange={onChange}
      onFocus={e => e.target.style.borderColor = T.rose}
      onBlur={e => e.target.style.borderColor = err ? T.rose : T.borderNeutral}
    />
  )
}

/** Read-only mirrored airport field */
function ReadOnlyAirport({ value }) {
  const label = AIRPORTS.find(a => a.code === value)?.name || ''
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        ...inputStyle,
        cursor: 'not-allowed',
        color: T.textSub,
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(244,63,94,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}>
        <span>{value ? label : '—'}</span>
        <span style={{ fontSize: '10px', color: T.rose, fontWeight: 600, letterSpacing: '0.04em' }}>AUTO</span>
      </div>
      <p style={{ fontSize: '11px', color: T.textMuted, marginTop: '5px', marginBottom: 0 }}>
        🔗 Same as your transit airport
      </p>
    </div>
  )
}

export default function StepConnection({ connection, onChange, onNext }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!connection.originAirport) e.originAirport = 'Required'
    if (!connection.arrivalAirport) e.arrivalAirport = 'Required'
    if (!connection.arrivalTime) e.arrivalTime = 'Required'
    if (!connection.destinationAirport) e.destinationAirport = 'Required'
    if (!connection.boardingTime) e.boardingTime = 'Required'
    if (!connection.departureTime) e.departureTime = 'Required'
    if (!connection.connectionTypeId) e.connectionTypeId = 'Select a connection type'
    if (connection.originAirport && connection.arrivalAirport &&
        connection.originAirport === connection.arrivalAirport)
      e.originAirport = 'Origin and transit airport must be different'
    if (connection.arrivalAirport && connection.destinationAirport &&
        connection.arrivalAirport === connection.destinationAirport)
      e.destinationAirport = 'Destination must differ from transit airport'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const isValid =
    connection.originAirport &&
    connection.arrivalAirport &&
    connection.arrivalTime &&
    connection.destinationAirport &&
    connection.boardingTime &&
    connection.departureTime &&
    connection.connectionTypeId &&
    connection.originAirport !== connection.arrivalAirport &&
    connection.arrivalAirport !== connection.destinationAirport

  const airportOpts = AIRPORTS.map(a => ({ value: a.code, label: a.name }))
  const airlineOpts = AIRLINES.map(a => ({ value: a.id, label: `${a.name} (${a.code})` }))

  // When transit airport changes, auto-mirror it into connectingAirport
  const handleTransitChange = (code) => {
    onChange({ arrivalAirport: code, connectingAirport: code })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Arriving Flight ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <span style={{ fontSize: '20px' }}>🛬</span>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: T.text }}>Arriving Flight</div>
              <div style={{ fontSize: '12px', color: T.textMuted }}>Your inbound flight before the layover</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field id="arrivalAirline" label="Airline (Optional)">
              <Sel value={connection.arrivalAirline}
                onChange={e => onChange({ arrivalAirline: e.target.value })}
                options={airlineOpts} placeholder="Any airline" />
            </Field>
            <Field id="arrivalFlightNumber" label="Flight Number (Optional)">
              <input style={inputStyle} placeholder="e.g. 6E-204"
                value={connection.arrivalFlightNumber}
                onChange={e => onChange({ arrivalFlightNumber: e.target.value.toUpperCase() })}
                onFocus={e => e.target.style.borderColor = T.rose}
                onBlur={e => e.target.style.borderColor = T.borderNeutral} />
            </Field>

            {/* Origin airport — grouped Indian + International */}
            <Field id="originAirport" label="Origin Airport" error={errors.originAirport}>
              <GroupedSel value={connection.originAirport} err={errors.originAirport}
                onChange={e => onChange({ originAirport: e.target.value })}
                excludeCodes={connection.arrivalAirport ? [connection.arrivalAirport] : []}
                placeholder="Where are you flying from?" />
            </Field>

            {/* Transit airport */}
            <Field id="arrivalAirport" label="Transit Airport (Layover)" error={errors.arrivalAirport}>
              <Sel value={connection.arrivalAirport} err={errors.arrivalAirport}
                onChange={e => handleTransitChange(e.target.value)}
                options={airportOpts.filter(a => a.value !== connection.originAirport)}
                placeholder="Select transit airport" />
            </Field>

            <Field id="arrivalTime" label="Scheduled Arrival Time" error={errors.arrivalTime}>
              <TimeInput value={connection.arrivalTime} err={errors.arrivalTime}
                onChange={e => onChange({ arrivalTime: e.target.value })} />
            </Field>
          </div>
        </div>

        {/* ── Connection Type ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Connection Type
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {CONNECTION_TYPES.map(ct => {
              const sel = connection.connectionTypeId === ct.id
              return (
                <button key={ct.id} onClick={() => onChange({ connectionTypeId: ct.id })}
                  style={{
                    textAlign: 'left', cursor: 'pointer', padding: '12px 14px',
                    borderRadius: '10px', fontFamily: 'Inter, sans-serif',
                    background: sel ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.03)',
                    border: sel ? `2px solid ${T.rose}` : `1px solid ${T.borderNeutral}`,
                    transition: T.trans,
                    boxShadow: sel ? '0 0 14px rgba(244,63,94,0.2)' : 'none',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)' }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = T.borderNeutral }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{ct.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: sel ? T.rose : T.text }}>{ct.label}</div>
                  <div style={{ fontSize: '11px', color: T.textMuted, marginTop: '2px' }}>{ct.desc}</div>
                </button>
              )
            })}
          </div>
          {errors.connectionTypeId && <p style={{ fontSize: '12px', color: T.rose, marginTop: '8px' }}>⚠ {errors.connectionTypeId}</p>}
        </div>

        {/* ── Connecting Flight ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <span style={{ fontSize: '20px' }}>🛫</span>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: T.text }}>Connecting Flight</div>
              <div style={{ fontSize: '12px', color: T.textMuted }}>The flight you need to catch after your layover</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field id="connectingAirline" label="Airline (Optional)">
              <Sel value={connection.connectingAirline}
                onChange={e => onChange({ connectingAirline: e.target.value })}
                options={airlineOpts} placeholder="Any airline" />
            </Field>
            <Field id="connectingFlightNumber" label="Flight Number (Optional)">
              <input style={inputStyle} placeholder="e.g. AI-131"
                value={connection.connectingFlightNumber}
                onChange={e => onChange({ connectingFlightNumber: e.target.value.toUpperCase() })}
                onFocus={e => e.target.style.borderColor = T.rose}
                onBlur={e => e.target.style.borderColor = T.borderNeutral} />
            </Field>

            {/* Departure airport — read-only, mirrors transit */}
            <Field id="connectingAirport" label="Departure Airport">
              <ReadOnlyAirport value={connection.arrivalAirport} />
            </Field>

            {/* Destination airport — grouped Indian + International */}
            <Field id="destinationAirport" label="Destination Airport" error={errors.destinationAirport}>
              <GroupedSel value={connection.destinationAirport} err={errors.destinationAirport}
                onChange={e => onChange({ destinationAirport: e.target.value })}
                excludeCodes={connection.arrivalAirport ? [connection.arrivalAirport] : []}
                placeholder="Where are you flying to?" />
            </Field>

            <Field id="boardingTime" label="Boarding Opens" error={errors.boardingTime}>
              <TimeInput value={connection.boardingTime} err={errors.boardingTime}
                onChange={e => onChange({ boardingTime: e.target.value })} />
            </Field>
            <Field id="departureTime" label="Scheduled Departure" error={errors.departureTime}>
              <TimeInput value={connection.departureTime} err={errors.departureTime}
                onChange={e => onChange({ departureTime: e.target.value })} />
            </Field>
          </div>
        </div>

      </div>

      <StickyFooter
        onNext={() => { if (validate()) onNext() }}
        nextEnabled={Boolean(isValid)}
        nextLabel="→ Set Transit Profile"
        showBack={false}
      />
    </div>
  )
}
