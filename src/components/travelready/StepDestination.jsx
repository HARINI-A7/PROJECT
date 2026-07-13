import React from 'react'
import { T, cardStyle, inputStyle, labelStyle, StickyFooter, primaryBtn } from './TRStyles'
import { DESTINATIONS } from '../../data/countryRulesData'

export default function StepDestination({ destinationCode, onChange, onNext }) {
  
  const asiaPacific = DESTINATIONS.filter(d => d.region === 'asia')
  const europe = DESTINATIONS.filter(d => d.region === 'europe')
  const americas = DESTINATIONS.filter(d => d.region === 'americas')

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
         <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>✈️ TravelReady AI</h1>
         <p style={{ color: T.textSub, margin: 0, fontSize: '15px' }}>Your AI-powered international travel readiness assistant.</p>
      </div>

      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Origin</label>
          <div style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', color: T.textSub, cursor: 'not-allowed' }}>
            🇮🇳 India
          </div>
        </div>

        <div>
          <label style={labelStyle}>Destination</label>
          <select 
            style={{ ...inputStyle, backgroundColor: destinationCode ? T.bgCard : 'rgba(255,255,255,0.04)' }}
            value={destinationCode}
            onChange={e => onChange(e.target.value)}
          >
            <option value="" style={{ background: T.bgCard, color: T.textSub }}>Select a destination...</option>
            <optgroup label="🌏 Asia Pacific" style={{ background: T.bgCard, color: T.purple, fontWeight: 700 }}>
              {asiaPacific.map(d => <option key={d.code} value={d.code} style={{ background: T.bgCard, color: T.text }}>{d.flag} {d.name}</option>)}
            </optgroup>
            <optgroup label="🌍 Europe" style={{ background: T.bgCard, color: T.purple, fontWeight: 700 }}>
              {europe.map(d => <option key={d.code} value={d.code} style={{ background: T.bgCard, color: T.text }}>{d.flag} {d.name}</option>)}
            </optgroup>
            <optgroup label="🌎 Americas" style={{ background: T.bgCard, color: T.purple, fontWeight: 700 }}>
              {americas.map(d => <option key={d.code} value={d.code} style={{ background: T.bgCard, color: T.text }}>{d.flag} {d.name}</option>)}
            </optgroup>
          </select>
          <div style={{ marginTop: '8px', fontSize: '12px', color: T.textMuted }}>
             Currently supports the most popular international destinations for Indian travellers.
          </div>
        </div>
      </div>

      <StickyFooter>
        <div/> {/* empty spacer for flex-between */}
        <button 
           style={{ ...primaryBtn, opacity: destinationCode ? 1 : 0.5, pointerEvents: destinationCode ? 'auto' : 'none' }}
           onClick={onNext}
        >
          Continue to Country Guide →
        </button>
      </StickyFooter>
    </div>
  )
}
