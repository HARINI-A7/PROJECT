import React, { useState } from 'react'
import { T, cardStyle, StickyFooter, ghostBtn, primaryBtn } from './TRStyles'

export default function StepGuide({ countryRules, onNext, onBack }) {
  const [expandedCard, setExpandedCard] = useState(null)

  if (!countryRules) return null

  const cards = [
    {
      id: 'entry',
      icon: '🛂',
      title: 'Entry Requirements',
      badge: countryRules.entryRequirements.visa,
      content: () => (
        <ul style={{ paddingLeft: '20px', margin: 0, color: T.text, fontSize: '14px', lineHeight: '1.6' }}>
          <li><strong>Visa:</strong> {countryRules.entryRequirements.visa}</li>
          <li><strong>Passport Validity:</strong> {countryRules.entryRequirements.passportValidity}</li>
          <li><strong>Return Ticket:</strong> {countryRules.entryRequirements.returnTicket ? 'Required' : 'Not required'}</li>
          <li><strong>Required Docs:</strong> {countryRules.entryRequirements.documents.join(', ')}</li>
        </ul>
      ),
      source: countryRules.entryRequirements.source
    },
    {
      id: 'packing',
      icon: '🧳',
      title: 'Packing Rules',
      badge: `${countryRules.packingRules.prohibited.length} prohibited items`,
      content: () => (
        <div style={{ color: T.text, fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '8px' }}><strong>Prohibited:</strong> {countryRules.packingRules.prohibited.join(', ')}</div>
          <div style={{ marginBottom: '8px' }}><strong>Restricted:</strong> {countryRules.packingRules.restricted.join(', ')}</div>
          <div><strong>Declaration Required:</strong> {countryRules.packingRules.declarationRequired.join(', ')}</div>
        </div>
      ),
      source: countryRules.packingRules.source
    },
    {
      id: 'medicine',
      icon: '💊',
      title: 'Medicine Guidance',
      badge: countryRules.medicineGuidance.restricted.length > 0 ? '⚠ Restrictions' : '✅ Standard',
      content: () => (
        <div style={{ color: T.text, fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '8px' }}><strong>Prescription Rules:</strong> {countryRules.medicineGuidance.prescriptionRequired.join('; ')}</div>
          <div style={{ marginBottom: '8px' }}><strong>Restricted:</strong> {countryRules.medicineGuidance.restricted.join(', ')}</div>
          <div><strong>Limits:</strong> {countryRules.medicineGuidance.quantityLimits}</div>
        </div>
      ),
      source: countryRules.medicineGuidance.source
    },
    {
      id: 'electronics',
      icon: '🔋',
      title: 'Electronics',
      badge: countryRules.electronics.powerBank.split('(')[0].trim(),
      content: () => (
        <ul style={{ paddingLeft: '20px', margin: 0, color: T.text, fontSize: '14px', lineHeight: '1.6' }}>
          <li><strong>Power Bank:</strong> {countryRules.electronics.powerBank}</li>
          <li><strong>Lithium Battery:</strong> {countryRules.electronics.lithiumBattery}</li>
          <li><strong>Drone:</strong> {countryRules.electronics.drone}</li>
          <li><strong>E-Cigarette:</strong> {countryRules.electronics.eCigarette}</li>
        </ul>
      ),
      source: countryRules.electronics.source
    },
    {
      id: 'customs',
      icon: '💰',
      title: 'Customs',
      badge: `Limit: ${countryRules.customs.cashLimit.split('—')[0].trim()}`,
      content: () => (
        <ul style={{ paddingLeft: '20px', margin: 0, color: T.text, fontSize: '14px', lineHeight: '1.6' }}>
          <li><strong>Cash Limit:</strong> {countryRules.customs.cashLimit}</li>
          <li><strong>Alcohol:</strong> {countryRules.customs.alcohol}</li>
          <li><strong>Tobacco:</strong> {countryRules.customs.tobacco}</li>
          <li><strong>Duty Free:</strong> {countryRules.customs.dutyFree}</li>
        </ul>
      ),
      source: countryRules.customs.source
    },
    {
      id: 'notes',
      icon: '🚨',
      title: 'Important Notes',
      badge: `${countryRules.importantNotes.length} alerts`,
      content: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {countryRules.importantNotes.map((note, i) => {
            let bg = 'rgba(255,255,255,0.05)'
            let border = 'transparent'
            if (note.severity === 'critical') { bg = 'rgba(244,63,94,0.1)'; border = T.rose }
            else if (note.severity === 'warning') { bg = 'rgba(245,158,11,0.1)'; border = T.amber }
            return (
              <div key={i} style={{ padding: '12px', background: bg, borderLeft: `3px solid ${border}`, borderRadius: '4px', fontSize: '13px', color: T.text }}>
                {note.text} <span style={{ color: T.textMuted, fontSize: '11px', display: 'block', marginTop: '4px' }}>Source: {note.source}</span>
              </div>
            )
          })}
        </div>
      ),
      source: { name: 'FlightPulse Curated Travel Database', lastUpdated: '2026-06' }
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>Country Guide: {countryRules.name}</h2>
        <p style={{ margin: 0, color: T.textSub, fontSize: '14px' }}>Review the essential regulations before taking your readiness check.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {cards.map(c => {
          const isExpanded = expandedCard === c.id
          return (
            <div 
              key={c.id}
              onClick={() => setExpandedCard(isExpanded ? null : c.id)}
              style={{
                ...cardStyle,
                padding: '16px',
                cursor: 'pointer',
                border: isExpanded ? `1px solid ${T.purple}` : cardStyle.border,
                borderLeft: isExpanded ? `4px solid ${T.purple}` : undefined,
                transition: T.trans
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: isExpanded ? T.purple : T.text }}>{c.title}</div>
                  <div style={{ fontSize: '12px', color: T.textSub, marginTop: '2px' }}>{c.badge}</div>
                </div>
                <div style={{ color: T.textMuted }}>{isExpanded ? '▲' : '▼'}</div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${T.borderNeutral}`, cursor: 'default' }} onClick={e => e.stopPropagation()}>
                  {c.content()}
                  
                  <div style={{ marginTop: '16px', fontSize: '11px', color: T.textMuted, fontStyle: 'italic' }}>
                    Source: {c.source.name} • Last Updated: {c.source.lastUpdated}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <StickyFooter>
        <button style={ghostBtn} onClick={onBack}>← Back</button>
        <button style={primaryBtn} onClick={onNext}>Start Readiness Check →</button>
      </StickyFooter>
    </div>
  )
}
