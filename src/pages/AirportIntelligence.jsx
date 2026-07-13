import { useState } from 'react'
import ModulePage from '../components/layout/ModulePage'
import { NAV_ITEMS } from '../config/navItems'
import { INDIAN_AIRPORTS } from '../api/opensky'
import { useAirportIntelligence } from '../hooks/useAirportIntelligence'

import AirportSelector from '../components/flight-tracker/AirportSelector'
import ErrorBanner from '../components/flight-tracker/ErrorBanner'

import OverviewCards from '../components/airport-intelligence/OverviewCards'
import WeatherCard from '../components/airport-intelligence/WeatherCard'
import TrafficChart from '../components/airport-intelligence/TrafficChart'
import ActiveFlightsList from '../components/airport-intelligence/ActiveFlightsList'
import RecommendationCard from '../components/airport-intelligence/RecommendationCard'

const item = NAV_ITEMS.find((n) => n.id === 'airport-intelligence')

function LastUpdated({ timestamp, isCached }) {
  if (!timestamp) return null
  const time = timestamp.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', marginBottom: '18px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isCached ? '#F59E0B' : '#10B981', boxShadow: `0 0 6px ${isCached ? '#F59E0B80' : '#10B98180'}`, flexShrink: 0 }} />
      {isCached ? 'Showing cached data from' : 'Last updated:'} <span style={{ color: '#475569' }}>{time} IST</span>
      {!isCached && <span style={{ color: '#1E293B' }}>· Data cached for 5 mins</span>}
    </div>
  )
}

function RefreshButton({ onRefresh, cooldown, loading }) {
  const disabled = cooldown > 0 || loading
  return (
    <button
      onClick={onRefresh}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px',
        background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(6,237,216,0.12)',
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : 'rgba(6,237,216,0.3)'}`,
        color: disabled ? '#334155' : '#06EDD8', fontSize: '13px', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
      }}
    >
      <span style={{ fontSize: '15px', animation: loading ? 'spin 1s linear infinite' : 'none', display: 'inline-block' }}>↻</span>
      {cooldown > 0 ? `Wait ${cooldown}s` : loading ? 'Loading…' : 'Refresh'}
    </button>
  )
}

export default function AirportIntelligence() {
  const [selectedIcao, setSelectedIcao] = useState('')
  const [errorDismissed, setErrorDismissed] = useState(false)

  const {
    arrivals, departures, activeFlights, weather,
    trafficLevel, trafficColor, recommendation, chartData,
    loading, error, weatherError, lastUpdated, isCached, cooldownSecs, manualRefresh
  } = useAirportIntelligence(selectedIcao)

  const visibleError = error && !errorDismissed ? error : null

  function handleAirportChange(icao) {
    setSelectedIcao(icao)
    setErrorDismissed(false)
  }

  // Prepend a placeholder to airports for the selector
  // Reusing the flight-tracker AirportSelector which expects iata/icao for label formatting
  const airportOptions = [{ icao: '', name: 'Select an airport', iata: '...' }, ...INDIAN_AIRPORTS]

  return (
    <ModulePage item={item}>
      <div style={{ padding: '0 0 60px' }}>
        
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <AirportSelector airports={airportOptions} selected={selectedIcao} onChange={handleAirportChange} />
          {selectedIcao && <RefreshButton onRefresh={manualRefresh} cooldown={cooldownSecs} loading={loading} />}
        </div>

        {!selectedIcao && (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(9, 20, 36, 0.4)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
            <div style={{ fontSize: '16px', color: '#E2E8F0', fontWeight: 600, marginBottom: '8px' }}>Select an Airport</div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>Choose an airport from the dropdown above to view live intelligence data.</div>
          </div>
        )}

        {selectedIcao && (
          <div className="animate-fade-in">
            <LastUpdated timestamp={lastUpdated} isCached={isCached} />
            
            {visibleError && <ErrorBanner message={visibleError} onDismiss={() => setErrorDismissed(true)} />}

            {loading && !lastUpdated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ height: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ height: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'shimmer 1.5s infinite' }} />
                </div>
              </div>
            ) : (
              <>
                <OverviewCards 
                  arrivals={arrivals.length} 
                  departures={departures.length} 
                  activeFlights={activeFlights.length} 
                  trafficLevel={trafficLevel} 
                  trafficColor={trafficColor} 
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <WeatherCard weather={weather} error={weatherError} advisory={recommendation.advisory} />
                  <RecommendationCard rec={recommendation} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <TrafficChart data={chartData} />
                  <ActiveFlightsList flights={activeFlights} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </ModulePage>
  )
}
