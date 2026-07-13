import { useEffect, useState } from 'react'
import { useCompensationAssistant, STEPS } from '../hooks/useCompensationAssistant'
import WizardProgress from '../components/compensation/WizardProgress'
import StepFlight from '../components/compensation/StepFlight'
import StepDisruption from '../components/compensation/StepDisruption'
import StepEligibility from '../components/compensation/StepEligibility'
import StepPassenger from '../components/compensation/StepPassenger'
import StepResults from '../components/compensation/StepResults'
import ClaimHistory from '../components/compensation/ClaimHistory'

const C = {
  text: '#E2E8F0',
  textMuted: '#64748B',
  blue: '#00C2FF',
  border: 'rgba(0,194,255,0.08)',
  emerald: '#10B981',
  amber: '#F59E0B',
}

export default function CompensationAssistant() {
  const assistant = useCompensationAssistant()
  const {
    step, nextStep, prevStep, reset,
    flightDetails, setFlightDetails,
    disruptionDetails, setDisruptionDetails,
    passengerDetails, setPassengerDetails,
    analysisResult, isAnalyzing, analysisError,
    runAnalysis,
    dbReady, initDb,
    checkedDocs, toggleDoc,
    complaintLetter, setComplaintLetter,
    isGeneratingLetter, generateComplaintLetter, downloadPDF,
    letterEditing, setLetterEditing,
    claimHistory, saveClaim, loadClaim, duplicateClaim, deleteClaim, updateClaimStatus,
    draftRestored, setDraftRestored,
  } = assistant

  const [activeTab, setActiveTab] = useState('wizard') // 'wizard' | 'history'
  const [draftMsg, setDraftMsg] = useState(false)

  // ── Init Neo4j on first load ──
  useEffect(() => { initDb() }, [initDb])

  // ── Show draft restore message ──
  useEffect(() => {
    if (draftRestored) {
      setDraftMsg(true)
      const t = setTimeout(() => { setDraftMsg(false); setDraftRestored(false) }, 4000)
      return () => clearTimeout(t)
    }
  }, [draftRestored, setDraftRestored])

  // ── Scroll to top on step change ──
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  const handleDisruptionNext = async () => { await runAnalysis() }

  const handleViewClaim = (claim) => {
    loadClaim(claim)
    setActiveTab('wizard')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px', boxSizing: 'border-box' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '12px' }}>
          <span>Dashboard</span><span>›</span>
          <span style={{ color: C.blue }}>Compensation Assistant</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,237,216,0.15))', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>⚖</div>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, color: C.text, margin: 0 }}>
                Compensation Assistant
              </h1>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: C.emerald, letterSpacing: '0.06em' }}>
                DGCA 2025
              </span>
            </div>
            <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>
              Know your rights · Calculate entitlement · Generate complaint letter · Powered by Neo4j Knowledge Graph
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
              {dbReady === null ? 'Connecting to Neo4j...' : dbReady ? 'Neo4j Connected' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Draft Restored Banner ── */}
      {draftMsg && (
        <div style={{
          marginBottom: '16px', padding: '10px 16px', borderRadius: '10px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          fontSize: '13px', color: C.emerald, display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fadeIn 0.3s ease',
        }}>
          ✓ Draft restored successfully. Continue from where you left off.
        </div>
      )}

      {/* ── Analysis Error ── */}
      {analysisError && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', fontSize: '13px', color: '#FDA4AF' }}>
          ⚠ {analysisError}
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
        {[
          { id: 'wizard', label: '⚙ New Claim' },
          { id: 'history', label: `📋 History${claimHistory.length > 0 ? ` (${claimHistory.length})` : ''}` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: activeTab === tab.id ? 'rgba(0,194,255,0.15)' : 'transparent',
              color: activeTab === tab.id ? C.blue : C.textMuted,
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 0 12px rgba(0,194,255,0.15)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Wizard Tab ── */}
      {activeTab === 'wizard' && (
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <WizardProgress currentStep={step} />

          {step === STEPS.FLIGHT && (
            <StepFlight
              flightDetails={flightDetails}
              onChange={patch => setFlightDetails(prev => ({ ...prev, ...patch }))}
              onNext={nextStep}
            />
          )}

          {step === STEPS.DISRUPTION && (
            <StepDisruption
              disruptionDetails={disruptionDetails}
              onChange={patch => setDisruptionDetails(prev => ({ ...prev, ...patch }))}
              onNext={handleDisruptionNext}
              onBack={prevStep}
              isAnalyzing={isAnalyzing}
            />
          )}

          {step === STEPS.ELIGIBILITY && analysisResult && (
            <StepEligibility
              analysisResult={analysisResult}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === STEPS.PASSENGER && (
            <StepPassenger
              passengerDetails={passengerDetails}
              onChange={patch => setPassengerDetails(prev => ({ ...prev, ...patch }))}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === STEPS.RESULTS && analysisResult && (
            <StepResults
              analysisResult={analysisResult}
              flightDetails={flightDetails}
              disruptionDetails={disruptionDetails}
              passengerDetails={passengerDetails}
              checkedDocs={checkedDocs}
              toggleDoc={toggleDoc}
              complaintLetter={complaintLetter}
              setComplaintLetter={setComplaintLetter}
              isGeneratingLetter={isGeneratingLetter}
              generateComplaintLetter={generateComplaintLetter}
              downloadPDF={downloadPDF}
              letterEditing={letterEditing}
              setLetterEditing={setLetterEditing}
              onReset={reset}
              saveClaim={saveClaim}
            />
          )}
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: C.text, margin: 0 }}>
                Claim History
              </h2>
              <p style={{ fontSize: '13px', color: C.textMuted, margin: '4px 0 0' }}>
                {claimHistory.length} saved claim{claimHistory.length !== 1 ? 's' : ''} · Persists across browser refreshes
              </p>
            </div>
            <button
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.2)', color: C.blue, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              onClick={() => setActiveTab('wizard')}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,194,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,194,255,0.1)'}
            >
              + New Claim
            </button>
          </div>

          <ClaimHistory
            claimHistory={claimHistory}
            onView={handleViewClaim}
            onDuplicate={(claim) => { duplicateClaim(claim); setActiveTab('wizard') }}
            onDelete={deleteClaim}
            onStatusChange={updateClaimStatus}
          />
        </div>
      )}

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
        select option { background: #091424; color: #E2E8F0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
