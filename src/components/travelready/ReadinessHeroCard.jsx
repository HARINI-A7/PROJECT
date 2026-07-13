import React from 'react'
import { T } from './TRStyles'

export default function ReadinessHeroCard({ result }) {
  const { score, tier, prepTime } = result

  // SVG Dial calculation
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(9,20,36,0.92) 0%, ${tier.color}15 100%)`,
      border: `1px solid ${tier.color}50`,
      borderRadius: '16px',
      padding: '28px',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      backdropFilter: 'blur(12px)',
      flexWrap: 'wrap'
    }}>
      
      {/* Dial */}
      <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0, margin: '0 auto' }}>
        <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          {/* Foreground circle */}
          <circle 
            cx="50" cy="50" r={radius} fill="none" 
            stroke={tier.color} strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: T.text, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '11px', color: T.textSub, fontWeight: 600, marginTop: '2px' }}>/ 100</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: tier.color, marginBottom: '8px' }}>
          {tier.label}
        </div>
        <div style={{ fontSize: '16px', color: T.text, marginBottom: '20px', lineHeight: 1.5 }}>
          {tier.verdict}
        </div>
        
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: T.textSub, fontWeight: 600, marginBottom: '4px' }}>
            Estimated Time to Become Travel Ready
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: T.text }}>
            {prepTime}
          </div>
        </div>
      </div>

    </div>
  )
}
