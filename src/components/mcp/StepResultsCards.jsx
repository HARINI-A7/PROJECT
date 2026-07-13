import React, { useState } from 'react'
import { T } from './mcpStyles'
import { toTimeStr } from '../../api/missedConnectionService'

// ── Shared Accordion Component ───────────────────────────────────────────────
export function Accordion({ title, preview, icon, badge, defaultExpanded = false, children }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  
  return (
    <div style={{ background: T.bg, border: `1px solid ${T.borderNeutral}`, borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(12px)', marginBottom: '16px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '20px 24px', background: 'transparent', border: 'none',
          display: 'flex', flexDirection: 'column', textAlign: 'left', cursor: 'pointer',
          outline: 'none', transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
          {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: T.text, margin: 0 }}>
            {title}
          </h3>
          {badge && (
            <span style={{ marginLeft: 'auto', marginRight: '10px', fontSize: '11px', padding: '2px 10px', borderRadius: '20px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', fontWeight: 600 }}>
              {badge}
            </span>
          )}
          <div style={{ marginLeft: badge ? 0 : 'auto', color: T.textMuted, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
            ▼
          </div>
        </div>
        {!expanded && preview && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: T.textSub, paddingLeft: icon ? '26px' : '0' }}>
            {preview}
          </div>
        )}
      </button>
      <div style={{
        display: 'grid',
        gridTemplateRows: expanded ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.3s ease-in-out'
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${T.borderNeutral}`, marginTop: '8px', paddingTop: '20px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const RISK_CONFIG = {
  low:      { color: T.emerald, bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: '🟢 Low Risk',      gradient: 'linear-gradient(135deg,#10B981,#06EDD8)' },
  moderate: { color: T.amber,   bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  label: '🟡 Moderate Risk', gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)' },
  high:     { color: T.rose,    bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.3)',   label: '🔴 High Risk',     gradient: 'linear-gradient(135deg,#F43F5E,#FB7185)' },
}

// ── Risk Hero Card ───────────────────────────────────────────────────────────
export function RiskHeroCard({ result }) {
  const { riskScore, riskCategory, onTime, slack, availableConnectionTime, totalTransitNeeded } = result
  const cfg = RISK_CONFIG[riskCategory]

  return (
    <div style={{
      borderRadius: '16px', padding: '28px', border: `1px solid ${cfg.border}`,
      background: cfg.bg, backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
    }}>
      {/* Score dial */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 8px' }}>
          <svg viewBox="0 0 36 36" style={{ width: '100px', height: '100px', transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={cfg.color} strokeWidth="3.5"
              strokeDasharray={`${riskScore} ${100 - riskScore}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: cfg.color }}>{riskScore}</span>
            <span style={{ fontSize: '10px', color: T.textMuted, fontWeight: 600 }}>/ 100</span>
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: '13px', color: cfg.color }}>{cfg.label}</div>
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ fontSize: '14px', color: T.text, marginBottom: '12px', fontWeight: 500 }}>
          {riskCategory === 'low' ? '🟢 You have enough time to comfortably make your connection.' : 
           riskCategory === 'moderate' ? '🟡 Your connection is tight. Proceed directly to your gate.' : 
           '🔴 You are unlikely to make this connection without assistance.'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Available Time',    value: `${availableConnectionTime} min`,                           color: slack >= 0 ? T.emerald : T.rose },
            { label: 'Estimated Transit',  value: `${totalTransitNeeded} min`,                               color: T.textSub },
            { label: 'Time Slack',         value: slack >= 0 ? `+${slack} min` : `${slack} min`,             color: slack >= 0 ? T.emerald : T.rose },
            { label: 'Boarding Closes',    value: toTimeStr(result.boardingMins),                            color: T.amber },
            { label: 'Gate Arrival',       value: toTimeStr(result.gateArrivalTime),                         color: T.text },
          ].map((item, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '10px', color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{item.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: item.color, fontFamily: 'Space Grotesk, sans-serif' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Transit Breakdown ────────────────────────────────────────────────────────
export function TransitBreakdown({ result }) {
  const { ruleBreakdown, personalAdjustments, personalExtra, passengerAdjustedTransit, availableConnectionTime } = result
  const BOARDING_BUFFER = 10

  return (
    <Accordion
      title="⏱ Transit Time Breakdown"
      preview={`Estimated Transit: ${passengerAdjustedTransit + BOARDING_BUFFER} min`}
    >

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ruleBreakdown.map((rule, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.borderNeutral}` }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              {getIcon(rule.id)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: T.text }}>{rule.label}</div>
              <div style={{ fontSize: '11px', color: T.textMuted }}>{rule.min}–{rule.max} min range</div>
            </div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: T.rose }}>
              ~{rule.estimatedMinutes} min
            </div>
          </div>
        ))}

        {/* Boarding buffer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🚪</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: T.amber }}>Boarding Gate Buffer</div>
            <div style={{ fontSize: '11px', color: T.textMuted }}>Minimum time needed at gate before boarding closes</div>
          </div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: T.amber }}>+{BOARDING_BUFFER} min</div>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', marginTop: '4px' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: T.text }}>Total Transit Needed</span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 800, color: T.rose }}>
            {passengerAdjustedTransit + BOARDING_BUFFER} min
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
          <span style={{ fontSize: '13px', color: T.textMuted }}>Available connection window</span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: availableConnectionTime >= passengerAdjustedTransit ? T.emerald : T.rose }}>
            {Math.max(0, availableConnectionTime)} min
          </span>
        </div>
      </div>
    </Accordion>
  )
}

// ── Visual Timeline ──────────────────────────────────────────────────────────
export function ConnectionTimeline({ result }) {
  const { timeline, gateArrivalTime } = result

  return (
    <Accordion
      title="📍 Personal Transit Timeline"
      preview={`Estimated Gate Arrival: ${toTimeStr(gateArrivalTime)}`}
    >
      <div style={{ position: 'relative', paddingLeft: '20px' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '10px', top: '12px', bottom: '12px', width: '2px', background: 'linear-gradient(to bottom, rgba(244,63,94,0.5), rgba(100,116,139,0.2))' }} />

        {timeline.map((item, i) => {
          const isArrival = item.type === 'arrival'
          const isDeadline = item.type === 'deadline'
          const isEvent = item.type === 'event'
          const gateArrivalAfterBoarding = isArrival && !item.onTime
          const dotColor = isDeadline ? T.amber : isArrival ? (item.onTime ? T.emerald : T.rose) : item.type === 'event' && item.label === 'Flight Lands' ? T.blue : T.textMuted

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: i < timeline.length - 1 ? '16px' : 0, position: 'relative' }}>
              {/* Dot */}
              <div style={{
                position: 'absolute', left: '-15px', top: '4px',
                width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                background: dotColor,
                boxShadow: `0 0 8px ${dotColor}80`,
                border: '2px solid rgba(5,13,26,1)',
              }} />

              <div style={{ flex: 1, paddingLeft: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{item.icon}</span>
                    <span style={{
                      fontSize: '13px', fontWeight: isArrival || isDeadline ? 700 : 600,
                      color: isDeadline ? T.amber : gateArrivalAfterBoarding ? T.rose : isArrival && item.onTime ? T.emerald : T.text,
                    }}>
                      {item.label}
                    </span>
                    {isArrival && (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, background: item.onTime ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', color: item.onTime ? T.emerald : T.rose, border: `1px solid ${item.onTime ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}` }}>
                        {item.onTime ? '✓ On Time' : '✗ Late'}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: T.textSub, fontFamily: 'Space Grotesk, monospace', whiteSpace: 'nowrap' }}>
                    {toTimeStr(item.time)}
                  </span>
                </div>
                {item.duration && (
                  <div style={{ fontSize: '11px', color: T.textMuted, marginTop: '2px', paddingLeft: '22px' }}>
                    ~{item.duration} min
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Accordion>
  )
}

// ── Personalized Factors ─────────────────────────────────────────────────────
export function PersonalizedFactors({ result }) {
  const { personalAdjustments } = result
  
  if (!personalAdjustments || personalAdjustments.length === 0) {
    return null
  }

  const activeLabels = personalAdjustments.map(adj => `${adj.icon} ${adj.label}`).join(', ')

  return (
    <Accordion
      title="👤 Personalized Transit Factors"
      preview={activeLabels}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {personalAdjustments.map((adj, i) => (
          <div key={`adj-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.borderNeutral}` }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,194,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              {adj.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: T.text }}>{adj.label}</div>
              <div style={{ fontSize: '11px', color: T.textMuted }}>{adj.reason}</div>
            </div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: adj.minutes > 0 ? '#FDA4AF' : T.emerald }}>
              {adj.minutes > 0 ? '+' : ''}{adj.minutes} min
            </div>
          </div>
        ))}
      </div>
    </Accordion>
  )
}

// ── Technical Details ────────────────────────────────────────────────────────
export function TechnicalDetails({ result }) {
  const { riskFactors, source } = result

  return (
    <Accordion
      title="⚙ Technical Details"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Source Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.borderNeutral}` }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: T.text }}>Rule Engine Source</div>
            <div style={{ fontSize: '11px', color: T.textMuted }}>Origin of transit calculation rules</div>
          </div>
          <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', fontWeight: 600 }}>
            {source === 'neo4j' ? '⬡ Neo4j AuraDB Graph' : '⚡ Offline Fallback Rules'}
          </span>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: T.text, marginBottom: '8px', paddingLeft: '4px' }}>Risk Score Calculation</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {riskFactors.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: f.risk ? 'rgba(244,63,94,0.06)' : 'rgba(16,185,129,0.06)', border: `1px solid ${f.risk ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)'}` }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: '13px', color: f.risk ? '#FDA4AF' : '#6EE7B7', lineHeight: 1.5 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Accordion>
  )
}

// ── Recommendations ──────────────────────────────────────────────────────────
export function Recommendations({ result }) {
  const { recommendations } = result
  const [showAll, setShowAll] = useState(false)
  const PRIORITY_CONFIG = {
    critical: { bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.3)',   label: 'CRITICAL', color: T.rose },
    high:     { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: 'HIGH',     color: T.amber },
    medium:   { bg: 'rgba(0,194,255,0.06)',  border: 'rgba(0,194,255,0.2)',   label: 'INFO',     color: T.blue },
    low:      { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', label: 'OK',       color: T.emerald },
  }

  const visibleRecs = showAll ? recommendations : recommendations.slice(0, 3)

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.borderNeutral}`, borderRadius: '14px', padding: '24px', backdropFilter: 'blur(12px)', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px' }}>🎯</span>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: T.text, margin: 0 }}>
          Top Actions
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visibleRecs.map((rec, i) => {
          const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{rec.icon}</span>
              <span style={{ fontSize: '13px', color: T.text, lineHeight: 1.6, flex: 1 }}>{rec.text}</span>
              <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: cfg.color, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {cfg.label}
              </span>
            </div>
          )
        })}
        {recommendations.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              marginTop: '8px', padding: '10px', background: 'transparent', border: `1px solid ${T.borderNeutral}`,
              borderRadius: '8px', color: T.text, cursor: 'pointer', fontWeight: 600, fontSize: '13px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {showAll ? 'Collapse Actions' : 'View All Recommendations'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Explainability Card ──────────────────────────────────────────────────────
export function ExplainabilityCard({ result }) {
  const { explanationFactors } = result

  // Create preview of active factors
  const activeFactors = explanationFactors
    .filter(f => f.value.includes('Yes'))
    .map(f => f.label)
    .slice(0, 4)
  const previewText = activeFactors.length > 0 ? `• ${activeFactors.join(' • ')}` : '• Normal Connection'

  return (
    <Accordion
      title="🧠 Why was this prediction made?"
      preview={previewText}
      badge="Explainable AI"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {explanationFactors.map((f, i) => {
          const isVerdict = f.label === 'Final Decision'
          return (
            <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: isVerdict ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isVerdict ? 'rgba(244,63,94,0.2)' : T.borderNeutral}`, gridColumn: isVerdict ? 'span 2' : 'span 1' }}>
              <div style={{ fontSize: '10px', color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{f.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: isVerdict ? T.rose : T.text, fontFamily: 'Space Grotesk, sans-serif' }}>{f.value}</div>
            </div>
          )
        })}
      </div>
    </Accordion>
  )
}

// ── Missed Connection Handoff ────────────────────────────────────────────────
export function MissedConnectionHandoff({ onOpenCompensation }) {
  return (
    <div style={{ padding: '20px 24px', borderRadius: '14px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: T.text, marginBottom: '4px' }}>
          ⚖ Missed your connection due to airline delay?
        </div>
        <div style={{ fontSize: '13px', color: T.textMuted }}>
          You may be entitled to compensation under DGCA 2025 rules.
        </div>
      </div>
      <button
        onClick={onOpenCompensation}
        style={{
          padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
          background: 'linear-gradient(135deg, #10B981, #06EDD8)',
          color: '#02060F', fontWeight: 700, fontSize: '13px',
          border: 'none', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Open Compensation Assistant →
      </button>
    </div>
  )
}

function getIcon(ruleId) {
  const m = { taxi_deplane: '🛬', walk_same_terminal: '🚶', walk_diff_terminal: '🚌', security_recheck: '🔍', immigration_clearance: '🛂', baggage_claim: '🧳', boarding_gate_buffer: '🚪' }
  return m[ruleId] || '→'
}
