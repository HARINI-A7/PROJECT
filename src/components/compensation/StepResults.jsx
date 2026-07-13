import { useState } from 'react'
import { C, cardStyle, primaryBtn, ghostBtn } from './styles'
import { calculateConfidence } from '../../hooks/useCompensationAssistant'

// ── Document Progress Tracker ────────────────────────────────────────────────
function DocumentTracker({ documents, checkedDocs, toggleDoc }) {
  const total = documents.length
  const checked = documents.filter(d => checkedDocs[d.id]).length
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0
  const allDone = checked === total && total > 0
  const missing = documents.filter(d => !checkedDocs[d.id])

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          📁 Required Documents
        </div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: allDone ? C.emerald : C.amber }}>
          {checked} / {total} Ready
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '4px',
            width: `${pct}%`,
            background: allDone
              ? 'linear-gradient(90deg, #10B981, #06EDD8)'
              : 'linear-gradient(90deg, #F59E0B, #00C2FF)',
            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: allDone ? '0 0 8px rgba(16,185,129,0.4)' : '0 0 8px rgba(245,158,11,0.3)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '11px', color: C.textMuted }}>Documents Ready</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: allDone ? C.emerald : C.amber }}>{pct}%</span>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {documents.map(doc => (
          <div
            key={doc.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
              borderRadius: '10px', cursor: 'pointer',
              background: checkedDocs[doc.id] ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${checkedDocs[doc.id] ? 'rgba(16,185,129,0.3)' : C.border}`,
              transition: 'all 0.2s ease',
            }}
            onClick={() => toggleDoc(doc.id)}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
              border: `2px solid ${checkedDocs[doc.id] ? C.emerald : C.border}`,
              background: checkedDocs[doc.id] ? C.emerald : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: '#02060F', fontWeight: 700, transition: 'all 0.2s ease',
            }}>
              {checkedDocs[doc.id] ? '✓' : ''}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: checkedDocs[doc.id] ? C.emerald : C.text }}>
                {doc.name}
              </div>
              <div style={{ fontSize: '11px', color: C.textMuted }}>{doc.description}</div>
            </div>
            {doc.priority === 1 && !checkedDocs[doc.id] && (
              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', color: C.rose, fontWeight: 600, whiteSpace: 'nowrap' }}>
                REQUIRED
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Status / Missing docs */}
      {allDone ? (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🟢</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: C.emerald }}>Ready to Submit Claim</span>
        </div>
      ) : (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: C.amber, marginBottom: '6px' }}>
            ⚠ {missing.length} Document{missing.length > 1 ? 's' : ''} Remaining
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {missing.map(d => (
              <span key={d.id} style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#FCD34D' }}>
                • {d.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Confidence Indicator ─────────────────────────────────────────────────────
function ConfidenceCard({ disruptionDetails, analysisResult, checkedDocs, documents }) {
  const { score, conditions, metCount, total } = calculateConfidence(disruptionDetails, analysisResult, checkedDocs, documents)
  const color = score >= 75 ? C.emerald : score >= 50 ? C.amber : C.rose
  const label = score >= 75 ? 'High Confidence' : score >= 50 ? 'Moderate' : 'Low Confidence'

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          🎯 Claim Confidence
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80` }} />
          <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color }}>{score}%</span>
          <span style={{ fontSize: '12px', color: C.textMuted }}>{label}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{
          height: '100%', width: `${score}%`, borderRadius: '3px',
          background: score >= 75
            ? 'linear-gradient(90deg, #10B981, #06EDD8)'
            : score >= 50
              ? 'linear-gradient(90deg, #F59E0B, #00C2FF)'
              : 'linear-gradient(90deg, #F43F5E, #F59E0B)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {conditions.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: c.met ? C.emerald : C.rose, fontWeight: 700, width: '14px' }}>
              {c.met ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: '12px', color: C.textSub, flex: 1 }}>{c.label}</span>
            <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '10px', fontWeight: 600, background: c.met ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.08)', color: c.met ? C.emerald : C.rose, border: `1px solid ${c.met ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.2)'}` }}>
              {c.met ? 'Met' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '12px', fontSize: '11px', color: C.textMuted }}>
        {metCount} of {total} conditions met → {score}% confidence score
      </div>
    </div>
  )
}

// ── Why This Decision (compact) ──────────────────────────────────────────────
function DecisionCard({ decisionTrail, source }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '15px' }}>🧠</span>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 700, color: C.text, margin: 0 }}>
          Why this decision?
        </h3>
        <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', fontWeight: 600 }}>
          {source === 'neo4j' ? '⬡ Neo4j Graph' : '⚡ Offline Rules'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {decisionTrail.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: step.ok ? C.emerald : C.rose, flexShrink: 0, fontWeight: 700 }}>
              {step.ok ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: '12px', color: C.textSub, lineHeight: 1.5 }}>{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main StepResults ─────────────────────────────────────────────────────────
export default function StepResults({
  analysisResult,
  flightDetails,
  disruptionDetails,
  passengerDetails,
  checkedDocs,
  toggleDoc,
  complaintLetter,
  setComplaintLetter,
  isGeneratingLetter,
  generateComplaintLetter,
  downloadPDF,
  letterEditing,
  setLetterEditing,
  onReset,
  saveClaim,
}) {
  const { rule, documents, airsewa, airlineInfo, decisionTrail, source } = analysisResult
  const eligible = rule.eligible
  const totalCompensation = rule.estimatedAmount * (passengerDetails.passengerCount || 1)
  const [airsewaOpen, setAirsewaOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const statusColor = eligible ? C.emerald : C.rose
  const statusBg = eligible ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)'
  const statusBorder = eligible ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'

  const copyLetter = () => {
    navigator.clipboard.writeText(complaintLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const id = saveClaim(eligible ? 'Eligible' : 'Not Eligible')
    setSaveMsg(`Claim saved (${id})`)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Status Header */}
      <div style={{ ...cardStyle, border: `1px solid ${statusBorder}`, background: statusBg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', color: C.textMuted, marginBottom: '4px' }}>Eligibility Status</div>
            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: statusColor }}>
              {eligible ? '✓ Likely Eligible' : '✗ Not Eligible for Compensation'}
            </div>
            <div style={{ fontSize: '13px', color: C.textSub, marginTop: '4px' }}>{rule.description}</div>
          </div>
          <button
            style={{ ...ghostBtn, borderColor: 'rgba(255,255,255,0.1)' }}
            onClick={onReset}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            ↺ Start New Claim
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Compensation */}
        <div style={cardStyle}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            💰 Estimated Compensation
          </div>
          {rule.estimatedAmount > 0 ? (
            <>
              <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: C.cyan, lineHeight: 1.1 }}>
                ₹{totalCompensation.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '6px' }}>
                ₹{rule.estimatedAmount.toLocaleString('en-IN')} × {passengerDetails.passengerCount} passenger{passengerDetails.passengerCount > 1 ? 's' : ''}
              </div>
              <div style={{ marginTop: '12px', fontSize: '11px', color: C.textMuted, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                Based on {rule.regulationRef}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.6 }}>{rule.estimatedAmountNote}</div>
          )}
        </div>

        {/* Recommended Action */}
        <div style={cardStyle}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            🎯 Recommended Action
          </div>
          <div style={{ fontSize: '14px', color: C.text, fontWeight: 600, lineHeight: 1.6 }}>{rule.requiredAction}</div>
          {airlineInfo?.claimEmail && eligible && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '4px' }}>Contact airline at:</div>
              <a href={`mailto:${airlineInfo.claimEmail}`} style={{ fontSize: '12px', color: C.blue, textDecoration: 'none' }}>
                {airlineInfo.claimEmail}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Document Progress Tracker */}
      {documents?.length > 0 && (
        <DocumentTracker documents={documents} checkedDocs={checkedDocs} toggleDoc={toggleDoc} />
      )}

      {/* Confidence Indicator */}
      <ConfidenceCard
        disruptionDetails={disruptionDetails}
        analysisResult={analysisResult}
        checkedDocs={checkedDocs}
        documents={documents}
      />

      {/* Decision Explanation */}
      <DecisionCard decisionTrail={decisionTrail} source={source} />

      {/* AI Complaint Letter */}
      {eligible && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: C.text, margin: 0 }}>
                ✉ AI Complaint Letter
              </h3>
              <p style={{ fontSize: '12px', color: C.textMuted, margin: '4px 0 0' }}>
                Powered by Sarvam AI — professional DGCA complaint
              </p>
            </div>
            {!complaintLetter && (
              <button
                style={{ ...primaryBtn, opacity: isGeneratingLetter ? 0.7 : 1, cursor: isGeneratingLetter ? 'not-allowed' : 'pointer' }}
                onClick={generateComplaintLetter}
                disabled={isGeneratingLetter}
              >
                {isGeneratingLetter ? '⏳ Generating...' : '✨ Generate Letter'}
              </button>
            )}
          </div>

          {complaintLetter && (
            <>
              {letterEditing ? (
                <textarea
                  value={complaintLetter}
                  onChange={e => setComplaintLetter(e.target.value)}
                  style={{
                    width: '100%', minHeight: '300px', padding: '16px',
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.borderActive}`,
                    borderRadius: '10px', color: C.text, fontSize: '13px',
                    fontFamily: 'monospace', lineHeight: 1.7, resize: 'vertical',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              ) : (
                <pre style={{
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '16px',
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                  borderRadius: '10px', fontSize: '13px', color: C.textSub,
                  lineHeight: 1.7, fontFamily: 'monospace', margin: 0,
                  maxHeight: '300px', overflowY: 'auto',
                }}>
                  {complaintLetter}
                </pre>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <button style={ghostBtn} onClick={() => setLetterEditing(!letterEditing)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  {letterEditing ? '👁 Preview' : '✏ Edit'}
                </button>
                <button style={ghostBtn} onClick={copyLetter}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button style={primaryBtn} onClick={downloadPDF}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  ⬇ Download PDF
                </button>
                <button style={ghostBtn} onClick={generateComplaintLetter} disabled={isGeneratingLetter}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  ↺ Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* AirSewa */}
      {airsewa && (
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <button
            onClick={() => setAirsewaOpen(!airsewaOpen)}
            style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: C.text, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🏛</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>AirSewa Escalation Guide</div>
                <div style={{ fontSize: '12px', color: C.textMuted }}>Escalate via the official DGCA portal if airline ignores you for 30 days</div>
              </div>
            </div>
            <span style={{ fontSize: '16px', color: C.textMuted, transform: airsewaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>▾</span>
          </button>
          {airsewaOpen && (
            <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                {[
                  { label: 'Website', value: airsewa.website, link: airsewa.website },
                  { label: 'Resolution Timeline', value: airsewa.timeline },
                  { label: 'Process', value: airsewa.process },
                  { label: 'Documents Needed', value: 'Boarding pass, PNR, delay certificate, complaint copy' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{item.label}</div>
                    {item.link
                      ? <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: C.blue, textDecoration: 'none' }}>{item.value}</a>
                      : <div style={{ fontSize: '13px', color: C.textSub }}>{item.value}</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(0,194,255,0.06)', border: '1px solid rgba(0,194,255,0.15)', borderRadius: '10px', fontSize: '12px', color: C.textSub, lineHeight: 1.6 }}>
                💡 <strong style={{ color: C.text }}>Step-by-step:</strong> File with airline first → Wait 30 days → Escalate to AirSewa with all documents.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Next Actions Panel ── */}
      <div style={{ ...cardStyle, background: 'rgba(0,194,255,0.04)', border: '1px solid rgba(0,194,255,0.15)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
          ⚡ Next Actions
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {eligible && !complaintLetter && (
            <button style={primaryBtn} onClick={generateComplaintLetter} disabled={isGeneratingLetter}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              📄 Generate Complaint Letter
            </button>
          )}
          {complaintLetter && (
            <>
              <button style={primaryBtn} onClick={downloadPDF}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                📥 Download PDF
              </button>
              <button style={ghostBtn} onClick={copyLetter}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                {copied ? '✓ Copied' : '📋 Copy Letter'}
              </button>
            </>
          )}
          {airsewa && (
            <a href={airsewa.website} target="_blank" rel="noreferrer" style={{ ...ghostBtn, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              🏛 Open AirSewa
            </a>
          )}
          <button style={ghostBtn} onClick={handleSave}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            💾 Save Claim
          </button>
          <button style={{ ...ghostBtn, color: C.rose, borderColor: 'rgba(244,63,94,0.2)' }} onClick={onReset}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)'}>
            🔄 Start New Claim
          </button>
        </div>
        {saveMsg && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: C.emerald, fontWeight: 600 }}>✓ {saveMsg}</div>
        )}
      </div>
    </div>
  )
}
