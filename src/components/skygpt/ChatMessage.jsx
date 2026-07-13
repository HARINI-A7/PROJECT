import ReactMarkdown from 'react-markdown'
import { useState } from 'react'

// Typing Indicator shown while API is in flight
export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '8px 0', animation: 'fadeIn 0.2s ease' }}>
      {/* Avatar */}
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #00C2FF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, boxShadow: '0 0 12px rgba(0,194,255,0.3)' }}>
        ✈
      </div>
      <div style={{ padding: '14px 18px', borderRadius: '0 14px 14px 14px', background: 'rgba(9,20,36,0.9)', border: '1px solid rgba(0,194,255,0.12)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '13px', color: '#64748B', marginRight: '8px' }}>SkyGPT is thinking…</span>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C2FF', animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out` }} />
        ))}
      </div>
    </div>
  )
}

// Quick action buttons after each AI reply
function QuickActions({ onNavigate }) {
  const actions = [
    { label: '✈️ Track Flight', path: '/flight-tracker' },
    { label: '🏢 Airport Intel', path: '/airport-intelligence' },
    { label: '⚖️ Compensation', path: '/compensation-assistant' },
  ]
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
      {actions.map(a => (
        <button
          key={a.path}
          onClick={() => onNavigate && onNavigate(a.path)}
          style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', color: '#64748B', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#00C2FF'; e.currentTarget.style.borderColor = 'rgba(0,194,255,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}

function formatTime(date) {
  if (!date) return ''
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
}

export default function ChatMessage({ msg, isLast, onNavigate }) {
  const [copied, setCopied] = useState(false)

  const copyText = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── User message ──
  if (msg.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 0', animation: 'slideInRight 0.2s ease' }}>
        <div style={{ maxWidth: '70%' }}>
          <div style={{ padding: '12px 18px', borderRadius: '14px 0 14px 14px', background: 'linear-gradient(135deg, rgba(0,194,255,0.25), rgba(124,58,237,0.25))', border: '1px solid rgba(0,194,255,0.25)', color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6, wordBreak: 'break-word' }}>
            {msg.content}
          </div>
          <div style={{ fontSize: '11px', color: '#334155', textAlign: 'right', marginTop: '4px' }}>
            {formatTime(msg.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  // ── Error message ──
  if (msg.role === 'error') {
    return (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '4px 0' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
          ⚠️
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '0 12px 12px 12px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#FDA4AF', fontSize: '14px', lineHeight: 1.5 }}>
          {msg.content}
        </div>
      </div>
    )
  }

  // ── Assistant message ──
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '4px 0', animation: 'slideInLeft 0.2s ease' }}>
      {/* AI Avatar */}
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #00C2FF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, boxShadow: '0 0 12px rgba(0,194,255,0.3)' }}>
        ✈
      </div>

      <div style={{ flex: 1, maxWidth: 'calc(100% - 44px)' }}>
        {/* Message header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#00C2FF' }}>SkyGPT</span>
          <span style={{ fontSize: '11px', color: '#334155' }}>{formatTime(msg.timestamp)}</span>
        </div>

        {/* Markdown content */}
        <div style={{ padding: '16px 18px', borderRadius: '0 14px 14px 14px', background: 'rgba(9,20,36,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            style={{
              color: '#CBD5E1',
              fontSize: '14px',
              lineHeight: 1.7,
            }}
            className="skygpt-markdown"
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ margin: '0 0 10px' }}>{children}</p>,
                ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: '4px', color: '#CBD5E1' }}>{children}</li>,
                strong: ({ children }) => <strong style={{ color: '#E2E8F0', fontWeight: 700 }}>{children}</strong>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#00C2FF', textDecoration: 'underline' }}>{children}</a>,
                table: ({ children }) => <table style={{ borderCollapse: 'collapse', width: '100%', margin: '12px 0', fontSize: '13px' }}>{children}</table>,
                th: ({ children }) => <th style={{ padding: '8px 12px', background: 'rgba(0,194,255,0.1)', borderBottom: '1px solid rgba(0,194,255,0.2)', textAlign: 'left', color: '#00C2FF', fontWeight: 600 }}>{children}</th>,
                td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#CBD5E1' }}>{children}</td>,
                code: ({ children }) => <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', color: '#06EDD8' }}>{children}</code>,
                blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid rgba(0,194,255,0.4)', paddingLeft: '12px', margin: '10px 0', color: '#94A3B8', fontStyle: 'italic' }}>{children}</blockquote>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={copyText}
            title="Copy response"
            style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: copied ? '#10B981' : '#475569', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}
          >
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        </div>

        {/* Quick action pills after last AI message */}
        {isLast && <QuickActions onNavigate={onNavigate} />}
      </div>
    </div>
  )
}
