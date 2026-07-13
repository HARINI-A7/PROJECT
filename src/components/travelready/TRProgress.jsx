import React from 'react'
import { T } from './TRStyles'

export default function TRProgress({ currentStep }) {
  const steps = ['Destination', 'Country Guide', 'Readiness Check', 'Results']
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
      {/* Background track line */}
      <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
      
      {/* Active track line */}
      <div style={{ 
          position: 'absolute', top: '14px', left: '14px', 
          width: `calc(${(Math.min(currentStep, 3) / 3) * 100}% - 28px)`, 
          height: '2px', background: T.emerald, zIndex: 1,
          transition: T.trans
      }} />

      {steps.map((label, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        
        let bgColor = 'rgba(255,255,255,0.1)'
        let borderColor = 'transparent'
        let color = T.textMuted
        
        if (isActive) {
            bgColor = T.purple
            borderColor = T.purple
            color = '#FFF'
        } else if (isCompleted) {
            bgColor = T.emerald
            borderColor = T.emerald
            color = '#FFF'
        }

        return (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '80px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: bgColor, border: `2px solid ${borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color,
              transition: T.trans,
              boxShadow: isActive ? `0 0 12px ${T.purple}` : 'none'
            }}>
              {isCompleted ? '✓' : (index + 1)}
            </div>
            <div style={{
                marginTop: '8px', fontSize: '11px', fontWeight: 600,
                color: isActive || isCompleted ? T.text : T.textSub,
                textAlign: 'center', whiteSpace: 'nowrap'
            }}>
                {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
