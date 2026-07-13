import React from 'react'
import { T, cardStyle } from './TRStyles'

export default function ReadinessBreakdownCard({ result }) {
  
  return (
    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.borderNeutral}`, background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: T.text }}>Readiness Breakdown</h3>
        </div>
        
        <div>
            {result.warnings.map((w, idx) => {
                
                let bg = 'transparent'
                let icon = ''
                let iconColor = ''

                if (w.status === 'ready') {
                    bg = 'rgba(16,185,129,0.05)'
                    icon = '✅'
                    iconColor = T.emerald
                } else if (w.status === 'warning') {
                    bg = 'rgba(245,158,11,0.08)'
                    icon = '⚠'
                    iconColor = T.amber
                } else {
                    bg = 'rgba(244,63,94,0.08)'
                    icon = '❌'
                    iconColor = T.rose
                }

                return (
                    <div key={idx} style={{ 
                        padding: '16px 24px', 
                        borderBottom: idx < result.warnings.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                        background: bg,
                        display: 'flex', gap: '16px', alignItems: 'flex-start'
                    }}>
                        <div style={{ fontSize: '18px' }}>{icon}</div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: T.text, marginBottom: '4px' }}>
                                {w.label}
                            </div>
                            <div style={{ fontSize: '13px', color: T.textSub, lineHeight: 1.5 }}>
                                {w.explanation}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  )
}
