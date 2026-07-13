import React from 'react'
import { T, cardStyle, primaryBtn, ghostBtn } from './TRStyles'

export default function ExportActionsCard({ downloadPDF, shareLinks }) {
  
  return (
    <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      
      <button style={{ ...primaryBtn, flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={downloadPDF}>
          <span>📄</span> Download Travel Checklist
      </button>
      
      <a href={shareLinks.email} style={{ ...ghostBtn, flex: '1 1 150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
          <span>📧</span> Email Checklist
      </a>
      
      <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" style={{ ...ghostBtn, flex: '1 1 150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', background: 'rgba(37, 211, 102, 0.1)', borderColor: 'rgba(37, 211, 102, 0.3)', color: '#25D366' }}>
          <span>📱</span> Share via WhatsApp
      </a>
      
    </div>
  )
}
