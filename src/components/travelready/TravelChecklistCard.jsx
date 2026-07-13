import React from 'react'
import { T, cardStyle } from './TRStyles'

export default function TravelChecklistCard({ checklist, countryRules, result }) {
  
  return (
    <div style={{ ...cardStyle, background: 'rgba(255,255,255,0.02)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: T.text }}>📋 Your Travel Checklist</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {result.warnings.map((w, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ 
                      fontSize: '16px', 
                      color: w.status === 'ready' ? T.emerald : T.textSub 
                  }}>
                      {w.status === 'ready' ? '✅' : '☐'}
                  </div>
                  <div style={{ fontSize: '14px', color: T.text, marginTop: '2px' }}>
                      <span style={{ fontWeight: 600 }}>{w.label}</span> — {w.explanation}
                  </div>
              </div>
          ))}
      </div>
    </div>
  )
}
