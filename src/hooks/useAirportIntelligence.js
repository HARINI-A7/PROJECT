import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchArrivals, fetchDepartures, fetchLiveStates, getTimeWindow, INDIAN_AIRPORTS } from '../api/opensky'
import { fetchWeather } from '../api/weather'
import { generateTravelRecommendation } from '../utils/recommendationEngine'

const COOLDOWN_MS = 300_000 // 5 minutes cache validity
const REFRESH_COOLDOWN_MS = 30_000 // 30 seconds manual refresh cooldown

const globalCache = new Map()

export function useAirportIntelligence(airportIcao) {
  const [arrivals, setArrivals] = useState([])
  const [departures, setDepartures] = useState([])
  const [activeFlights, setActiveFlights] = useState([])
  const [weather, setWeather] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [weatherError, setWeatherError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isCached, setIsCached] = useState(false)
  const [cooldownSecs, setCooldownSecs] = useState(0)

  const fetchingRef = useRef(false)
  const cooldownTimer = useRef(null)
  const cooldownEnd = useRef(0)

  const getErrorMessage = (err) => {
    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) return 'No internet connection detected.'
    if (err.message === 'AUTH_FAILED') return 'Authentication failed. Check OpenSky credentials.'
    if (err.message === 'RATE_LIMITED') return 'Rate limit reached. Retrying later.'
    if (err.message.startsWith('API_ERROR_5')) return 'OpenSky servers unavailable. Try again later.'
    return 'Unable to retrieve airport information.'
  }

  const doFetch = useCallback(async (force = false) => {
    if (!airportIcao || fetchingRef.current) return

    const now = Date.now()
    const cached = globalCache.get(airportIcao)

    if (!force && cached && (now - cached.timestamp < COOLDOWN_MS)) {
      setArrivals(cached.arrivals)
      setDepartures(cached.departures)
      setActiveFlights(cached.activeFlights)
      setWeather(cached.weather)
      setWeatherError(cached.weatherError)
      setLastUpdated(new Date(cached.timestamp))
      setIsCached(true)
      return
    }

    fetchingRef.current = true
    setLoading(true)
    setError(null)
    setWeatherError(null)
    setIsCached(false)

    try {
      const airport = INDIAN_AIRPORTS.find(a => a.icao === airportIcao)
      const { begin, end } = getTimeWindow()

      // Fetch Weather independently (does not throw)
      let wData = null
      let wErr = null
      try {
        wData = await fetchWeather(airport.lat, airport.lon)
      } catch (e) {
        wErr = 'Weather information is currently unavailable.'
      }

      // Fetch Flight Data independently (does not throw)
      let arrs = []
      let deps = []
      let nearbyStates = []
      let flightErr = null

      try {
        const [aData, dData, allStates] = await Promise.all([
          fetchArrivals(airportIcao, begin, end),
          fetchDepartures(airportIcao, begin, end),
          fetchLiveStates()
        ])
        arrs = aData
        deps = dData
        nearbyStates = allStates.filter(s => {
          return Math.abs(s.latitude - airport.lat) < 1.5 && Math.abs(s.longitude - airport.lon) < 1.5
        })
      } catch (e) {
        flightErr = e
      }

      // If flight data failed but we have cache, merge the old flight data with the new weather
      if (flightErr) {
        setError(getErrorMessage(flightErr))
        if (cached) {
          arrs = cached.arrivals
          deps = cached.departures
          nearbyStates = cached.activeFlights
          setIsCached(true)
        }
      }

      const newData = {
        arrivals: arrs,
        departures: deps,
        activeFlights: nearbyStates,
        weather: wData,
        weatherError: wErr,
        timestamp: Date.now()
      }

      globalCache.set(airportIcao, newData)

      setArrivals(arrs)
      setDepartures(deps)
      setActiveFlights(nearbyStates)
      setWeather(wData)
      setWeatherError(wErr)
      setLastUpdated(new Date(newData.timestamp))

    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [airportIcao])

  useEffect(() => {
    if (airportIcao) doFetch(false)
  }, [airportIcao, doFetch])

  const manualRefresh = useCallback(() => {
    if (Date.now() < cooldownEnd.current) return
    cooldownEnd.current = Date.now() + REFRESH_COOLDOWN_MS
    doFetch(true)

    clearInterval(cooldownTimer.current)
    setCooldownSecs(REFRESH_COOLDOWN_MS / 1000)
    cooldownTimer.current = setInterval(() => {
      const rem = Math.ceil((cooldownEnd.current - Date.now()) / 1000)
      if (rem <= 0) {
        clearInterval(cooldownTimer.current)
        setCooldownSecs(0)
      } else {
        setCooldownSecs(rem)
      }
    }, 1000)
  }, [doFetch])

  useEffect(() => () => clearInterval(cooldownTimer.current), [])

  // Derived calculations
  const totalFlights = arrivals.length + departures.length + activeFlights.length
  let trafficLevel = '🟢 Low Traffic'
  let trafficColor = '#10B981'
  if (totalFlights > 150) { trafficLevel = '🔴 Heavy Traffic'; trafficColor = '#F43F5E' }
  else if (totalFlights > 60) { trafficLevel = '🟡 Moderate Traffic'; trafficColor = '#F59E0B' }

  // Use Centralized Recommendation Engine
  const recommendation = generateTravelRecommendation(
    loading ? null : totalFlights, 
    weather
  )

  // Hourly chart data (group arrivals and departures by hour)
  const chartData = []
  if (!loading && arrivals && departures) {
    const hoursMap = {}
    const { begin } = getTimeWindow()
    // Group last 6 hours
    for (let i = 0; i < 6; i++) {
      const h = new Date((begin + i * 3600) * 1000).getHours()
      hoursMap[h] = { time: `${h}:00`, Arrivals: 0, Departures: 0, sortKey: begin + i * 3600 }
    }
    
    arrivals.forEach(a => {
      if (a.firstSeen) {
        const h = new Date(a.firstSeen * 1000).getHours()
        if (hoursMap[h]) hoursMap[h].Arrivals++
      }
    })
    departures.forEach(d => {
      if (d.firstSeen) {
        const h = new Date(d.firstSeen * 1000).getHours()
        if (hoursMap[h]) hoursMap[h].Departures++
      }
    })

    // Sort chronologically
    chartData.push(...Object.values(hoursMap).sort((a, b) => a.sortKey - b.sortKey))
  }

  return {
    arrivals,
    departures,
    activeFlights,
    weather,
    trafficLevel,
    trafficColor,
    recommendation,
    chartData,
    loading,
    error,
    weatherError,
    lastUpdated,
    isCached,
    cooldownSecs,
    manualRefresh
  }
}
