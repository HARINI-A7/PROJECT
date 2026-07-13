import React from 'react'
import { T, cardStyle } from './TRStyles'

export default function StepProcessing({ stages, completedStages }) {
  
  const percentage = Math.min(100, Math.round((completedStages / stages.length) * 100))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <style>{`
        @keyframes tr-pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes tr-spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ ...cardStyle, width: '100%', maxWidth: '480px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: T.text }}>Preparing Your Travel Report...</h2>
            <div style={{ fontSize: '13px', color: T.purple, fontWeight: 600 }}>Powered by Render Workflows</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stages.map((stage, i) => {
                const isCompleted = i < completedStages
                const isActive = i === completedStages
                const isPending = i > completedStages

                let color = T.textMuted
                let icon = '○'
                let animation = 'none'

                if (isCompleted) {
                    color = T.emerald
                    icon = '✓'
                } else if (isActive) {
                    color = T.purple
                    icon = '⟳'
                    animation = 'tr-spin 1.5s linear infinite'
                }

                return (
                    <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: isPending ? 0.4 : 1, transition: T.trans }}>
                        <div style={{ 
                            width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color, fontSize: '16px', fontWeight: 700, animation
                        }}>
                            {icon}
                        </div>
                        <div style={{ color: isActive ? T.text : color, fontSize: '15px', fontWeight: isActive ? 600 : 400 }}>
                            {stage.label}
                        </div>
                    </div>
                )
            })}
        </div>

        <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: T.textSub, marginBottom: '8px' }}>
                <span>Workflow Progress</span>
                <span>{percentage}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', background: T.purple, transition: T.trans }} />
            </div>
        </div>
      </div>
    </div>
  )
}
