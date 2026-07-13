import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchArrivals, fetchDepartures, fetchLiveStates, getTimeWindow } from '../api/opensky'

const COOLDOWN_MS = 300_000 // 5 minutes

// Global cache outside the hook to persist across remounts.
// Key: airportIcao -> Value: { arrivals, departures, liveStates, timestamp }
const globalCache = new Map()

export function useFlightData(airportIcao) {
  const [arrivals,    setArrivals]    = useState([])
  const [departures,  setDepartures]  = useState([])
  const [liveStates,  setLiveStates]  = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [cooldownSecs, setCooldownSecs] = useState(0)
  const [isCached,    setIsCached]    = useState(false)

  const fetchingRef  = useRef(false)
  const cooldownTimer = useRef(null)
  const cooldownEnd  = useRef(0)

  // Map errors strictly as requested
  const getErrorMessage = (err) => {
    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
      return 'No internet connection detected.'
    }
    if (err.message === 'AUTH_FAILED') {
      return 'Authentication failed. Check OpenSky credentials.'
    }
    if (err.message === 'RATE_LIMITED') {
      return 'Rate limit reached. Retrying in 5 minutes.'
    }
    if (err.message.startsWith('API_ERROR_5')) {
      return 'OpenSky servers unavailable. Try again later.'
    }
    return `Could not reach the OpenSky API. Showing last known data. (${err.message})`
  }

  const doFetch = useCallback(async (force = false) => {
    if (!airportIcao || fetchingRef.current) return

    const now = Date.now()
    const cached = globalCache.get(airportIcao)

    // Serve from cache if valid and not forcing a manual refresh
    if (!force && cached && (now - cached.timestamp < COOLDOWN_MS)) {
      setArrivals(cached.arrivals)
      setDepartures(cached.departures)
      setLiveStates(cached.liveStates)
      setLastUpdated(new Date(cached.timestamp))
      setIsCached(true)
      return
    }

    fetchingRef.current = true
    setLoading(true)
    setError(null)
    setIsCached(false)

    try {
      const { begin, end } = getTimeWindow()

      const [arrs, deps] = await Promise.all([
        fetchArrivals(airportIcao, begin, end),
        fetchDepartures(airportIcao, begin, end),
      ])

      const callsigns = new Set([
        ...arrs.map(f => f.callsign?.trim()).filter(Boolean),
        ...deps.map(f => f.callsign?.trim()).filter(Boolean),
      ])

      const allStates = await fetchLiveStates()
      const relevant  = callsigns.size > 0
        ? allStates.filter(s => callsigns.has(s.callsign))
        : []

      const newData = {
        arrivals: arrs,
        departures: deps,
        liveStates: relevant,
        timestamp: Date.now()
      }
      
      globalCache.set(airportIcao, newData)

      setArrivals(arrs)
      setDepartures(deps)
      setLiveStates(relevant)
      setLastUpdated(new Date(newData.timestamp))
    } catch (err) {
      setError(getErrorMessage(err))
      if (cached) {
        // Restore cached data on error so UI stays useful
        setArrivals(cached.arrivals)
        setDepartures(cached.departures)
        setLiveStates(cached.liveStates)
        setLastUpdated(new Date(cached.timestamp))
        setIsCached(true)
      } else {
        setArrivals([])
        setDepartures([])
        setLiveStates([])
        setLastUpdated(null)
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [airportIcao])

  // Fetch when airport changes (will use cache if valid)
  useEffect(() => {
    doFetch(false)
  }, [doFetch])

  // Manual refresh with cooldown logic
  const manualRefresh = useCallback(() => {
    if (Date.now() < cooldownEnd.current) return
    cooldownEnd.current = Date.now() + COOLDOWN_MS
    doFetch(true)

    clearInterval(cooldownTimer.current)
    setCooldownSecs(COOLDOWN_MS / 1000)
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

  useEffect(() => () => {
    clearInterval(cooldownTimer.current)
  }, [])

  return { arrivals, departures, liveStates, loading, error, lastUpdated, cooldownSecs, isCached, manualRefresh }
}
