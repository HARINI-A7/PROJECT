import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/navItems'

// ── FlightPulse AI Logo Mark ──────────────────────────────────
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      <path
        d="M8 20L14 10L16 16L20 12L24 20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="20" r="2" fill="#06EDD8" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0369A1" />
          <stop offset="1" stopColor="#0C4A6E" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Sidebar Component ─────────────────────────────────────────
export default function Sidebar() {
  return (
    <aside
      id="sidebar"
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #050D1A 0%, #02060F 100%)',
        borderRight: '1px solid rgba(0, 194, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 50,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(0, 194, 255, 0.06)',
        }}
      >
        <NavLink
          to="/"
          id="nav-home"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
        >
          <LogoMark />
          <div>
            <div
              style={{
                fontFamily: 'Space Grotesk, Inter, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                background: 'linear-gradient(135deg, #00C2FF, #06EDD8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.2,
              }}
            >
              FlightPulse
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#475569',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              AI Platform
            </div>
          </div>
        </NavLink>
      </div>

      {/* Navigation label */}
      <div
        style={{
          padding: '20px 20px 8px',
          fontSize: '10px',
          fontWeight: 600,
          color: '#334155',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Modules
      </div>

      {/* Nav items */}
      <nav style={{ padding: '0 10px', flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            id={`nav-${item.id}`}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            style={{ marginBottom: '4px', display: 'flex' }}
          >
            <span className="nav-icon">{item.emoji}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom info */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(0, 194, 255, 0.06)',
          marginBottom: '36px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: '#1E293B',
            fontWeight: 500,
          }}
        >
          India Aviation Intelligence
        </div>
        <div
          style={{
            fontSize: '10px',
            color: '#0F172A',
            marginTop: '2px',
          }}
        >
          v1.0 — Beta
        </div>
      </div>
    </aside>
  )
}
