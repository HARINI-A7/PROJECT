import { useState, useMemo } from 'react'
import { useFlightData } from '../hooks/useFlightData'
import { INDIAN_AIRPORTS } from '../api/opensky'
import AirportSelector    from '../components/flight-tracker/AirportSelector'
import FlightStats        from '../components/flight-tracker/FlightStats'
import FlightSearch       from '../components/flight-tracker/FlightSearch'
import FlightList         from '../components/flight-tracker/FlightList'
import FlightMap          from '../components/flight-tracker/FlightMap'
import ErrorBanner        from '../components/flight-tracker/ErrorBanner'
import LoadingSkeleton    from '../components/flight-tracker/LoadingSkeleton'

// ── Refresh Button ────────────────────────────────────────────
function RefreshButton({ onRefresh, cooldown, loading }) {
  const disabled = cooldown > 0 || loading
  return (
    <button
      id="refresh-btn"
      onClick={onRefresh}
      disabled={disabled}
      aria-label={disabled ? `Refresh available in ${cooldown}s` : 'Refresh flight data'}
      title={disabled && cooldown > 0 ? `Manual refresh available in ${cooldown}s` : 'Refresh flight data'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '9px 16px',
        borderRadius: '8px',
        background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(0,194,255,0.12)',
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : 'rgba(0,194,255,0.3)'}`,
        color: disabled ? '#334155' : '#00C2FF',
        fontSize: '13px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          fontSize: '15px',
          display: 'inline-block',
          animation: loading ? 'spin 1s linear infinite' : 'none',
        }}
      >
        ↻
      </span>
      {cooldown > 0 ? `Wait ${cooldown}s` : loading ? 'Loading…' : 'Refresh'}
    </button>
  )
}

// ── Last Updated indicator ────────────────────────────────────
function LastUpdated({ timestamp, isCached }) {
  if (!timestamp) return null
  const time = timestamp.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', marginBottom: '18px' }}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isCached ? '#F59E0B' : '#10B981',
          boxShadow: `0 0 6px ${isCached ? '#F59E0B80' : '#10B98180'}`,
          flexShrink: 0,
        }}
      />
      {isCached ? 'Showing cached data from' : 'Last updated:'} <span style={{ color: '#475569' }}>{time} IST</span>
      {!isCached && <span style={{ color: '#1E293B' }}>· Data cached for 5 mins</span>}
    </div>
  )
}

// ── Main FlightTracker Page ───────────────────────────────────
export default function FlightTracker() {
  const [selectedIcao, setSelectedIcao] = useState(INDIAN_AIRPORTS[0].icao)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [errorDismissed, setErrorDismissed] = useState(false)

  const {
    arrivals,
    departures,
    liveStates,
    loading,
    error,
    lastUpdated,
    cooldownSecs,
    isCached,
    manualRefresh,
  } = useFlightData(selectedIcao)

  const selectedAirport = INDIAN_AIRPORTS.find(a => a.icao === selectedIcao)

  // Build callsign → state map for O(1) status lookups in FlightCard
  const liveStateMap = useMemo(() => {
    const m = new Map()
    liveStates.forEach(s => { if (s.callsign) m.set(s.callsign, s) })
    return m
  }, [liveStates])

  // Local search filter — no API calls
  const filteredArrivals = useMemo(() => {
    if (!searchQuery.trim()) return arrivals
    const q = searchQuery.trim().toLowerCase()
    return arrivals.filter(f => f.callsign?.toLowerCase().includes(q))
  }, [arrivals, searchQuery])

  const filteredDepartures = useMemo(() => {
    if (!searchQuery.trim()) return departures
    const q = searchQuery.trim().toLowerCase()
    return departures.filter(f => f.callsign?.toLowerCase().includes(q))
  }, [departures, searchQuery])

  // Reset error dismissal when a new error appears
  const visibleError = error && !errorDismissed ? error : null

  function handleAirportChange(icao) {
    setSelectedIcao(icao)
    setSearchQuery('')
    setErrorDismissed(false)
  }

  const isInitialLoad = loading && arrivals.length === 0

  return (
    <div style={{ padding: '28px 32px 60px', minHeight: '100vh' }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '20px' }}>
        <span>Dashboard</span>
        <span>›</span>
        <span style={{ color: '#00C2FF' }}>Flight Tracker</span>
      </div>

      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '22px',
          flexWrap: 'wrap',
          paddingBottom: '22px',
          borderBottom: '1px solid rgba(0,194,255,0.06)',
        }}
      >
        {/* Title */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#00C2FF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Module · Live
          </div>
          <h1
            id="page-title-flight-tracker"
            style={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: '28px',
              fontWeight: 800,
              color: '#E2E8F0',
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}
          >
            🛫 Flight Tracker
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
            Track domestic and international flights in real time. Data via OpenSky Network.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <AirportSelector
            airports={INDIAN_AIRPORTS}
            selected={selectedIcao}
            onChange={handleAirportChange}
          />
          <RefreshButton
            onRefresh={manualRefresh}
            cooldown={cooldownSecs}
            loading={loading}
          />
        </div>
      </div>

      {/* ── Last Updated ── */}
      <LastUpdated timestamp={lastUpdated} isCached={isCached} />

      {/* ── Error Banner ── */}
      {visibleError && (
        <ErrorBanner
          message={visibleError}
          onDismiss={() => setErrorDismissed(true)}
        />
      )}

      {/* ── Stats Cards ── */}
      <FlightStats
        arrivals={arrivals}
        departures={departures}
        liveStates={liveStates}
        loading={loading}
      />

      {/* ── Main Content ── */}
      {isInitialLoad ? (
        <LoadingSkeleton />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: '20px',
            marginTop: '4px',
          }}
        >
          {/* Left — Flight list */}
          <div>
            <FlightSearch query={searchQuery} onChange={setSearchQuery} />
            <FlightList
              arrivals={filteredArrivals}
              departures={filteredDepartures}
              liveStateMap={liveStateMap}
              searchQuery={searchQuery}
            />
          </div>

          {/* Right — Live map (sticky so it stays in view while scrolling list) */}
          <div style={{ position: 'sticky', top: '16px', height: 'calc(100vh - 240px)', minHeight: '440px' }}>
            <FlightMap
              airport={selectedAirport}
              liveStates={liveStates}
            />
          </div>
        </div>
      )}

      {/* Spin animation for refresh button */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
