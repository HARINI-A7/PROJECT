import { useState } from 'react'
import { C, cardStyle, primaryBtn, ghostBtn } from './styles'

const STATUS_STYLES = {
  Draft:      { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', color: '#94A3B8' },
  Eligible:   { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.3)', color: '#10B981' },
  'Not Eligible': { bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.25)', color: '#F43F5E' },
  Submitted:  { bg: 'rgba(0,194,255,0.1)',    border: 'rgba(0,194,255,0.3)', color: '#00C2FF' },
  Escalated:  { bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)', color: '#F59E0B' },
  Closed:     { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)', color: '#6EE7B7' },
}

const STATUSES = ['Draft', 'Eligible', 'Submitted', 'Escalated', 'Closed']

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Draft
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {status}
    </span>
  )
}

function ClaimCard({ claim, onView, onDuplicate, onDelete, onStatusChange }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const { flightDetails, disruptionDetails, analysisResult } = claim
  const rule = analysisResult?.rule
  const date = new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const disruption = disruptionDetails.type === 'delay'
    ? `Delay ${disruptionDetails.delayRange?.replace('_', '–')}h`
    : disruptionDetails.type === 'cancellation' ? 'Cancellation' : 'Denied Boarding'
  const comp = rule?.estimatedAmount > 0
    ? `₹${(rule.estimatedAmount * (claim.passengerDetails?.passengerCount || 1)).toLocaleString('en-IN')}`
    : rule?.estimatedAmountNote || '—'

  return (
    <div style={{
      ...cardStyle,
      transition: 'all 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.12)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: C.blue, fontWeight: 700 }}>{claim.id}</span>
            <StatusBadge status={claim.status} />
          </div>
          <div style={{ fontSize: '11px', color: C.textMuted }}>Created {date}</div>
        </div>
        {/* Status change dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={{ ...ghostBtn, padding: '5px 10px', fontSize: '11px' }}
            onClick={() => setStatusOpen(!statusOpen)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            ▾ Status
          </button>
          {statusOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '36px', zIndex: 20,
              background: '#091424', border: `1px solid ${C.border}`,
              borderRadius: '10px', overflow: 'hidden', minWidth: '140px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(claim.id, s); setStatusOpen(false) }}
                  style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: s === claim.status ? 'rgba(0,194,255,0.08)' : 'transparent', border: 'none', color: s === claim.status ? C.blue : C.textSub, fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,194,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = s === claim.status ? 'rgba(0,194,255,0.08)' : 'transparent'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flight & disruption info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Airline', value: flightDetails.airline || '—' },
          { label: 'Flight', value: flightDetails.flightNumber || '—' },
          { label: 'Route', value: flightDetails.origin && flightDetails.destination ? `${flightDetails.origin} → ${flightDetails.destination}` : '—' },
          { label: 'Disruption', value: disruption },
          { label: 'Compensation', value: comp },
          { label: 'Date', value: flightDetails.date || '—' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>{item.label}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          style={primaryBtn}
          onClick={() => onView(claim)}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          📂 View Claim
        </button>
        <button
          style={ghostBtn}
          onClick={() => onDuplicate(claim)}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          ⧉ Duplicate
        </button>
        {!confirmDelete ? (
          <button
            style={{ ...ghostBtn, color: C.rose, borderColor: 'rgba(244,63,94,0.2)', marginLeft: 'auto' }}
            onClick={() => setConfirmDelete(true)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)'}
          >
            🗑 Delete
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '12px', color: C.rose }}>Confirm delete?</span>
            <button
              style={{ ...ghostBtn, color: C.rose, borderColor: 'rgba(244,63,94,0.4)', padding: '7px 12px' }}
              onClick={() => onDelete(claim.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Yes, Delete
            </button>
            <button
              style={{ ...ghostBtn, padding: '7px 12px' }}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClaimHistory({ claimHistory, onView, onDuplicate, onDelete, onStatusChange }) {
  if (!claimHistory.length) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>📋</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: C.textSub, marginBottom: '6px' }}>No claims yet</div>
        <div style={{ fontSize: '13px', color: C.textMuted }}>Complete the wizard to create your first claim. It will appear here automatically.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {claimHistory.map(claim => (
        <ClaimCard
          key={claim.id}
          claim={claim}
          onView={onView}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
