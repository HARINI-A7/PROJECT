export default function RecommendationCard({ rec }) {
  if (!rec) return null
  
  return (
    <div style={{ padding: '24px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(9, 20, 36, 0.8) 100%)', border: '1px solid rgba(124, 58, 237, 0.3)', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -20, fontSize: '120px', opacity: 0.05 }}>🤖</div>
      
      <h3 style={{ fontSize: '14px', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>✨</span> AI Travel Recommendation
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {/* Status */}
        <div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
          <div style={{ fontSize: '16px', color: rec.statusColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {rec.icon && <span>{rec.icon}</span>}
            {rec.riskLevel}
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation</div>
          <div style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.5 }}>
            {rec.recommendation}
          </div>
        </div>

        {/* Recommended Arrival */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px', borderLeft: `3px solid ${rec.statusColor}` }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Arrival</div>
          <div style={{ fontSize: '15px', color: '#E2E8F0', fontWeight: 600 }}>{rec.arrivalTime}</div>
        </div>

        {/* Reason */}
        <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</div>
          <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5, fontStyle: 'italic' }}>
            "{rec.reason}"
          </div>
        </div>
      </div>
    </div>
  )
}
