import { useState, useRef, useEffect } from 'react'

const MAX_LENGTH = 500
const COUNTER_THRESHOLD = 400

export default function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize the textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const remaining = MAX_LENGTH - value.length
  const showCounter = value.length >= COUNTER_THRESHOLD

  return (
    <div
      style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(0,194,255,0.08)',
        background: 'rgba(5,13,26,0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          background: 'rgba(9,20,36,0.9)',
          border: `1px solid ${isLoading ? 'rgba(255,255,255,0.06)' : 'rgba(0,194,255,0.2)'}`,
          borderRadius: '14px',
          padding: '12px 14px',
          transition: 'border-color 0.2s ease',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => {
            if (e.target.value.length <= MAX_LENGTH) {
              setValue(e.target.value)
            }
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask me anything about your flight... या हिंदी में पूछें"
          aria-label="Message to SkyGPT"
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: isLoading ? '#475569' : '#E2E8F0',
            fontSize: '14px',
            lineHeight: 1.6,
            resize: 'none',
            fontFamily: 'Inter, sans-serif',
            minHeight: '24px',
            maxHeight: '160px',
            overflowY: 'auto',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {showCounter && (
            <span style={{ fontSize: '11px', color: remaining < 50 ? '#F43F5E' : '#64748B', fontVariantNumeric: 'tabular-nums' }}>
              {remaining}
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={isLoading || !value.trim()}
            aria-label="Send message"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: (isLoading || !value.trim()) ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #00C2FF, #7C3AED)',
              border: 'none',
              color: (isLoading || !value.trim()) ? '#334155' : '#fff',
              fontSize: '16px',
              cursor: (isLoading || !value.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: (isLoading || !value.trim()) ? 'none' : '0 0 12px rgba(0,194,255,0.3)',
            }}
          >
            {isLoading ? (
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            ) : '↑'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#1E293B', textAlign: 'center', margin: '8px 0 0' }}>
        Enter to send · Shift+Enter for new line · Powered by Sarvam AI
      </p>
    </div>
  )
}
