import { useEffect, useState } from 'react'
import FeatureCard from '../components/ui/FeatureCard'
import { NAV_ITEMS } from '../config/navItems'

// ── Animated stats row ────────────────────────────────────────
const STATS = [
  { id: 'stat-flights', value: '1,247', label: 'Flights Tracked Today', color: '#00C2FF' },
  { id: 'stat-airports', value: '34', label: 'Indian Airports Monitored', color: '#06EDD8' },
  { id: 'stat-accuracy', value: '94.2%', label: 'AI Prediction Accuracy', color: '#7C3AED' },
  { id: 'stat-users', value: '12K+', label: 'Passengers Assisted', color: '#10B981' },
]

// ── Hero section ──────────────────────────────────────────────
function Hero() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        padding: '52px 40px 40px',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative radial */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0,194,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '30%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(6,237,216,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Live clock */}
      <div
        id="live-clock"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          borderRadius: '20px',
          background: 'rgba(0,194,255,0.06)',
          border: '1px solid rgba(0,194,255,0.15)',
          fontSize: '12px',
          color: '#00C2FF',
          fontWeight: 600,
          fontFamily: 'monospace',
          marginBottom: '28px',
          letterSpacing: '0.05em',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 6px #10B98180',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }}
        />
        {time}
      </div>

      {/* Main heading */}
      <h1
        id="hero-heading"
        style={{
          fontFamily: 'Space Grotesk, Inter, sans-serif',
          fontSize: 'clamp(36px, 5vw, 58px)',
          fontWeight: 800,
          margin: '0 0 12px',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        <span className="gradient-text">FlightPulse</span>
        <span
          style={{
            color: '#E2E8F0',
            marginLeft: '12px',
          }}
        >
          AI
        </span>
      </h1>

      {/* Tagline */}
      <p
        id="hero-tagline"
        style={{
          fontSize: '18px',
          color: '#64748B',
          margin: '0 0 8px',
          fontWeight: 400,
          letterSpacing: '0.01em',
        }}
      >
        India's Smartest Aviation Platform
      </p>

      <p
        style={{
          fontSize: '14px',
          color: '#334155',
          margin: 0,
          maxWidth: '500px',
          lineHeight: 1.6,
        }}
      >
        Real-time flight intelligence, AI-powered predictions, and passenger rights assistance — all in one platform built for Indian travellers.
      </p>

      {/* Stats row */}
      <div
        id="stats-row"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginTop: '36px',
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.id}
            id={stat.id}
            className="animate-fade-up"
            style={{
              padding: '16px 24px',
              borderRadius: '12px',
              background: 'rgba(9, 20, 36, 0.8)',
              border: '1px solid rgba(255,255,255,0.04)',
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
            }}
          >
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, Inter, sans-serif',
                color: stat.color,
                lineHeight: 1,
                marginBottom: '4px',
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Dashboard Page ────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Hero />

      {/* Section: Modules */}
      <div style={{ padding: '0 40px 60px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '3px',
              height: '20px',
              borderRadius: '2px',
              background: 'linear-gradient(to bottom, #00C2FF, #06EDD8)',
              boxShadow: '0 0 8px rgba(0,194,255,0.5)',
            }}
          />
          <h2
            id="modules-heading"
            style={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#CBD5E1',
              margin: 0,
            }}
          >
            Platform Modules
          </h2>
          <div
            style={{
              padding: '2px 10px',
              borderRadius: '20px',
              background: 'rgba(0,194,255,0.08)',
              border: '1px solid rgba(0,194,255,0.15)',
              fontSize: '11px',
              color: '#00C2FF',
              fontWeight: 600,
            }}
          >
            6 Active
          </div>
        </div>

        {/* Feature cards grid */}
        <div id="feature-cards-grid" className="feature-grid">
          {NAV_ITEMS.map((item, i) => (
            <FeatureCard
              key={item.id}
              item={item}
              animationDelay={`${0.05 + i * 0.08}s`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
