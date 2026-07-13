import React from 'react'
import { T, cardStyle } from './TRStyles'

export default function AISummaryCard({ aiSummary, isLoading }) {
  
  return (
    <div style={{ ...cardStyle, borderTop: `4px solid ${T.purple}` }}>
      <style>{`
        @keyframes tr-shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .tr-skeleton {
          animation: tr-shimmer 2s infinite linear;
          background: linear-gradient(to right, rgba(255,255,255,0.05) 4%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.05) 36%);
          background-size: 1000px 100%;
          border-radius: 4px;
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: T.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🤖</span> AI Travel Summary
          </h3>
          <div style={{ fontSize: '11px', color: T.purple, background: 'rgba(124,58,237,0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Powered by Sarvam AI
          </div>
      </div>

      {isLoading ? (
          <div>
              <div style={{ fontSize: '14px', color: T.purple, marginBottom: '16px', fontWeight: 600 }}>
                  🤖 Generating your personalized travel advice...
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="tr-skeleton" style={{ height: '16px', width: '100%' }} />
                  <div className="tr-skeleton" style={{ height: '16px', width: '90%' }} />
                  <div className="tr-skeleton" style={{ height: '16px', width: '95%' }} />
              </div>
          </div>
      ) : aiSummary ? (
          <div style={{ 
              fontSize: '14px', color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap'
          }}>
              {aiSummary}
          </div>
      ) : (
          <div style={{ fontSize: '14px', color: T.textSub, fontStyle: 'italic' }}>
              AI summary unavailable. Showing rule-based assessment above.
          </div>
      )}
    </div>
  )
}
