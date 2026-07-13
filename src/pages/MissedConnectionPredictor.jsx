import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMissedConnectionPredictor, MCP_STEPS } from '../hooks/useMissedConnectionPredictor'
import MCPProgress from '../components/mcp/MCPProgress'
import StepConnection from '../components/mcp/StepConnection'
import StepProfile from '../components/mcp/StepProfile'
import { CalculatingSkeleton } from '../components/mcp/CalculatingSkeleton'
import {
  RiskHeroCard,
  TransitBreakdown,
  ConnectionTimeline,
  Recommendations,
  ExplainabilityCard,
  PersonalizedFactors,
  TechnicalDetails,
  MissedConnectionHandoff,
} from '../components/mcp/StepResultsCards'
import { ghostBtn, primaryBtn } from '../components/mcp/mcpStyles'

const C = {
  text: '#E2E8F0',
  textMuted: '#64748B',
  rose: '#F43F5E',
  blue: '#00C2FF',
  border: 'rgba(0,194,255,0.08)',
  emerald: '#10B981',
  amber: '#F59E0B',
}

export default function MissedConnectionPredictor() {
  const navigate = useNavigate()
  const {
    step, nextStep, prevStep, reset,
    connection, setConnection,
    profile, setProfile,
    result,
    isCalculating, error,
    calculate,
    dbReady, initDb,
    draftRestored, setDraftRestored,
  } = useMissedConnectionPredictor()

  // ── Init DB ──
  useEffect(() => { initDb() }, [initDb])

  // ── Scroll to top on step change ──
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  // ── Auto-dismiss draft message ──
  useEffect(() => {
    if (draftRestored) {
      const t = setTimeout(() => setDraftRestored(false), 4000)
      return () => clearTimeout(t)
    }
  }, [draftRestored, setDraftRestored])

  const handleOpenCompensation = () => {
    navigate('/compensation')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px', boxSizing: 'border-box' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '12px' }}>
          <span>Dashboard</span><span>›</span>
          <span style={{ color: C.rose }}>Missed Connection Predictor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(251,113,133,0.15))', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                🔗
              </div>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, color: C.text, margin: 0 }}>
                Missed Connection Predictor
              </h1>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: C.rose, letterSpacing: '0.06em' }}>
                LIVE
              </span>
            </div>
            <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>
              Airport transit intelligence · Neo4j knowledge graph · Explainable predictions
            </p>
          </div>

          {/* DB status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '11px' }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: dbReady === null ? '#64748B' : dbReady ? C.emerald : C.amber,
              boxShadow: dbReady === null ? 'none' : dbReady ? '0 0 6px rgba(16,185,129,0.6)' : '0 0 6px rgba(245,158,11,0.5)',
            }} />
            <span style={{ color: '#64748B' }}>
              {dbReady === null ? 'Connecting to Neo4j...' : dbReady ? 'Graph Connected' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Draft Restored Banner ── */}
      {draftRestored && (
        <div style={{ marginBottom: '16px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '13px', color: C.emerald, display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.3s ease' }}>
          ✓ Draft restored successfully. Continue from where you left off.
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', fontSize: '13px', color: '#FDA4AF' }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Wizard ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <MCPProgress currentStep={step} />

        {step === MCP_STEPS.CONNECTION && (
          <StepConnection connection={connection} onChange={setConnection} onNext={nextStep} />
        )}

        {step === MCP_STEPS.PROFILE && (
          <StepProfile
            profile={profile}
            onChange={setProfile}
            onBack={prevStep}
            onCalculate={calculate}
            isCalculating={isCalculating}
          />
        )}

        {step === MCP_STEPS.CALCULATING && (
          <CalculatingSkeleton />
        )}

        {step === MCP_STEPS.RESULTS && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Section 1: Hero Summary */}
            <RiskHeroCard result={result} />
            
            {/* Section 2: Top Actions */}
            <Recommendations result={result} />

            {/* Section 3: Why This Result? */}
            <ExplainabilityCard result={result} />

            {/* Section 4: Transit Time Breakdown */}
            <TransitBreakdown result={result} />

            {/* Section 5: Personal Transit Timeline */}
            <ConnectionTimeline result={result} />

            {/* Section 6: Personalized Transit Factors */}
            <PersonalizedFactors result={result} />

            {/* Section 7: Technical Details */}
            <TechnicalDetails result={result} />

            {/* Section 8: Compensation */}
            <MissedConnectionHandoff onOpenCompensation={handleOpenCompensation} />

            {/* Action panel */}
            <div style={{ padding: '20px 24px', borderRadius: '14px', background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>Actions:</span>
              <button
                style={primaryBtn}
                onClick={reset}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                🔄 New Prediction
              </button>
              <button
                style={{ ...ghostBtn, borderColor: 'rgba(244,63,94,0.2)' }}
                onClick={() => { prevStep(); prevStep() }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)'}
              >
                ← Edit Inputs
              </button>
              <button
                style={{ ...ghostBtn, borderColor: 'rgba(16,185,129,0.2)', color: C.emerald }}
                onClick={handleOpenCompensation}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'}
              >
                ⚖ Compensation Assistant
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
        select option { background: #091424; color: #E2E8F0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
