const STEPS = ['Connection Details', 'Transit Profile', 'Results']

export default function MCPProgress({ currentStep }) {
  // Map internal steps (0,1,2,3) to display steps (0,1,2)
  const displayStep = currentStep >= 2 ? 2 : currentStep

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '28px' }}>
      {STEPS.map((label, i) => {
        const done = i < displayStep
        const active = i === displayStep
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
                background: done ? 'linear-gradient(135deg,#F43F5E,#FB7185)' : active ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.04)',
                border: done ? 'none' : active ? '2px solid #F43F5E' : '1px solid rgba(244,63,94,0.15)',
                color: done ? '#fff' : active ? '#F43F5E' : '#64748B',
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 0 16px rgba(244,63,94,0.3)' : 'none',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em',
                color: done ? '#FB7185' : active ? '#F43F5E' : '#64748B',
                whiteSpace: 'nowrap', textTransform: 'uppercase',
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 8px', marginBottom: '22px',
                background: done ? 'linear-gradient(90deg,#F43F5E,#FB7185)' : 'rgba(255,255,255,0.06)',
                borderRadius: '1px', transition: 'background 0.4s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
