/**
 * ErrorBanner — displayed at the top of the module when API calls fail.
 * Never crashes the page; dismissible by the user.
 */
export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div
      id="error-banner"
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '10px',
        background: 'rgba(244, 63, 94, 0.08)',
        border: '1px solid rgba(244, 63, 94, 0.25)',
        marginBottom: '20px',
      }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#FDA4AF', marginBottom: '2px' }}>
          Data Unavailable
        </div>
        <div style={{ fontSize: '12px', color: '#9F1239', lineHeight: 1.5 }}>
          {message}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: 'none',
            border: 'none',
            color: '#9F1239',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
