import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSkyGPT } from '../hooks/useSkyGPT'
import { NAV_ITEMS } from '../config/navItems'
import ChatMessage, { TypingIndicator } from '../components/skygpt/ChatMessage'
import ChatInput from '../components/skygpt/ChatInput'
import Suggestions from '../components/skygpt/Suggestions'

const item = NAV_ITEMS.find((n) => n.id === 'skygpt')

export default function SkyGPT() {
  const navigate = useNavigate()
  const { messages, isLoading, sendMessage, clearChat } = useSkyGPT()
  const bottomRef = useRef(null)
  const hasMessages = messages.length > 0

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ── Fixed Header ── */}
      <div
        style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid rgba(0,194,255,0.06)',
          background: 'rgba(5,13,26,0.95)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '12px' }}>
          <span>Dashboard</span>
          <span>›</span>
          <span style={{ color: item.color }}>SkyGPT Copilot</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Avatar */}
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #00C2FF22, #7C3AED22)', border: '1px solid rgba(0,194,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              💬
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: '20px', fontWeight: 800, color: '#E2E8F0', margin: 0 }}>
                  SkyGPT Copilot
                </h1>
                <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', letterSpacing: '0.06em' }}>
                  LIVE
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                Powered by Sarvam AI · Supports Hindi &amp; English
              </p>
            </div>
          </div>

          {/* Clear Chat */}
          {hasMessages && (
            <button
              onClick={clearChat}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#64748B', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F43F5E'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              🗑 Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Conversation ── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        style={{ flex: 1, overflowY: 'auto', padding: '8px 28px' }}
      >
        {!hasMessages ? (
          <Suggestions onSelect={sendMessage} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '16px', paddingBottom: '8px' }}>
            {messages.map((msg, i) => {
              const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1
              return (
                <ChatMessage
                  key={msg.id}
                  msg={msg}
                  isLast={isLastAssistant}
                  onNavigate={navigate}
                />
              )
            })}

            {/* Typing indicator */}
            {isLoading && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Fixed Input ── */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />

      {/* Global animation keyframes */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .skygpt-markdown p:last-child { margin-bottom: 0; }
      `}</style>
    </div>
  )
}
