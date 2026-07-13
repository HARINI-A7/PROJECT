import { C, cardStyle } from './styles'
import { WizardFooter } from './StepFlight'

export default function StepEligibility({ analysisResult, onNext, onBack }) {
  const { rule, decisionTrail, airlineInfo, source } = analysisResult
  const eligible = rule.eligible

  const statusColor = eligible ? C.emerald : C.rose
  const statusBg = eligible ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)'
  const statusBorder = eligible ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {source === 'fallback' && (
          <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '12px', color: C.amber, display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠ Neo4j database unavailable — showing results from offline DGCA rules
          </div>
        )}

        {/* Eligibility Status */}
        <div style={{ ...cardStyle, border: `1px solid ${statusBorder}`, background: statusBg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: statusBg, border: `2px solid ${statusColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
              {eligible ? '✓' : '✗'}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: statusColor }}>
                {eligible ? 'Likely Eligible' : 'Not Eligible for Compensation'}
              </div>
              <div style={{ fontSize: '13px', color: C.textSub, marginTop: '4px' }}>
                {rule.estimatedAmount > 0 ? `Estimated: ${rule.estimatedAmountNote}` : rule.estimatedAmountNote}
              </div>
            </div>
          </div>
        </div>

        {/* Why This Decision */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px' }}>🧠</span>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: C.text, margin: 0 }}>
              Why this decision?
            </h3>
            <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', fontWeight: 600 }}>
              {source === 'neo4j' ? '⬡ Neo4j Graph' : '⚡ Offline Rules'}
            </span>
          </div>

          {/* Visual trail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {decisionTrail.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                  background: step.ok ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                  border: `1px solid ${step.ok ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', color: step.ok ? C.emerald : C.rose, fontWeight: 700,
                }}>
                  {step.ok ? '✓' : '✗'}
                </div>
                <span style={{ fontSize: '13px', color: step.ok ? C.textSub : '#FDA4AF', lineHeight: 1.6 }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* Arrow pointing to verdict */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '2px', height: '20px', background: `linear-gradient(to bottom, ${statusColor}, transparent)` }} />
            <div style={{
              padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 700,
              background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor,
            }}>
              ↓ {eligible ? 'Likely Eligible' : 'Not Eligible'}
            </div>
          </div>
        </div>

        {/* Rule Details */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>
            📋 Applicable Rule
          </h3>
          <p style={{ fontSize: '13px', color: C.textSub, margin: '0 0 10px', lineHeight: 1.6 }}>
            {rule.description}
          </p>
          <div style={{ fontSize: '11px', color: C.textMuted, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${C.blue}` }}>
            {rule.regulationRef}
          </div>
          {eligible && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: C.emerald, marginBottom: '4px' }}>Recommended Action</div>
              <div style={{ fontSize: '13px', color: C.textSub }}>{rule.requiredAction}</div>
            </div>
          )}
        </div>
      </div>

      <WizardFooter
        onBack={onBack}
        onNext={onNext}
        nextEnabled={true}
        nextLabel="→ Enter Passenger Details"
      />
    </div>
  )
}
