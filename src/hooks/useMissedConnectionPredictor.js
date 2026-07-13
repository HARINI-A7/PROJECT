import { useState, useCallback, useEffect, useRef } from 'react'
import { predictConnection } from '../api/missedConnectionService'
import { seedAirportGraphIfEmpty } from '../api/missedConnectionSeed'

export const MCP_STEPS = {
  CONNECTION: 0,
  PROFILE: 1,
  CALCULATING: 2,
  RESULTS: 3,
}

const LS_DRAFT_KEY = 'flightpulse_mcp_draft_v4'

export const AIRPORTS = [
  { code: 'DEL', name: 'Delhi (DEL)' },
  { code: 'BOM', name: 'Mumbai (BOM)' },
  { code: 'BLR', name: 'Bengaluru (BLR)' },
  { code: 'MAA', name: 'Chennai (MAA)' },
  { code: 'HYD', name: 'Hyderabad (HYD)' },
  { code: 'CCU', name: 'Kolkata (CCU)' },
  { code: 'COK', name: 'Kochi (COK)' },
  { code: 'GOI', name: 'Goa (GOI)' },
  { code: 'AMD', name: 'Ahmedabad (AMD)' },
  { code: 'PNQ', name: 'Pune (PNQ)' },
]

export const INTL_AIRPORTS = [
  { code: 'DXB', name: 'Dubai (DXB)' },
  { code: 'LHR', name: 'London Heathrow (LHR)' },
  { code: 'SIN', name: 'Singapore Changi (SIN)' },
  { code: 'JFK', name: 'New York JFK (JFK)' },
  { code: 'BKK', name: 'Bangkok Suvarnabhumi (BKK)' },
  { code: 'KUL', name: 'Kuala Lumpur (KUL)' },
  { code: 'AUH', name: 'Abu Dhabi (AUH)' },
  { code: 'DOH', name: 'Doha (DOH)' },
  { code: 'FRA', name: 'Frankfurt (FRA)' },
  { code: 'CDG', name: 'Paris CDG (CDG)' },
  { code: 'YYZ', name: 'Toronto Pearson (YYZ)' },
  { code: 'SYD', name: 'Sydney (SYD)' },
  { code: 'NRT', name: 'Tokyo Narita (NRT)' },
  { code: 'HKG', name: 'Hong Kong (HKG)' },
]

export const AIRLINES = [
  { id: 'indigo', name: 'IndiGo', code: '6E' },
  { id: 'air_india', name: 'Air India', code: 'AI' },
  { id: 'spicejet', name: 'SpiceJet', code: 'SG' },
  { id: 'vistara', name: 'Vistara', code: 'UK' },
  { id: 'akasa', name: 'Akasa Air', code: 'QP' },
  { id: 'emirates', name: 'Emirates', code: 'EK' },
  { id: 'qatar', name: 'Qatar Airways', code: 'QR' },
  { id: 'etihad', name: 'Etihad Airways', code: 'EY' },
  { id: 'singapore', name: 'Singapore Airlines', code: 'SQ' },
]

export const CONNECTION_TYPES = [
  { id: 'dom_dom',  label: 'Domestic → Domestic',      icon: '🏠→🏠', desc: 'Both flights within India' },
  { id: 'dom_intl', label: 'Domestic → International', icon: '🏠→🌍', desc: 'Arriving domestic, departing international' },
  { id: 'intl_dom', label: 'International → Domestic', icon: '🌍→🏠', desc: 'Arriving international, departing domestic' },
  { id: 'intl_intl',label: 'International → International', icon: '🌍→🌍', desc: 'Transit between two international flights' },
]

const initialConnection = {
  arrivalAirline: '',
  arrivalFlightNumber: '',
  originAirport: '',        // where passenger is flying FROM before layover
  arrivalAirport: '',       // transit / layover airport
  arrivalTime: '10:00',
  connectingAirline: '',
  connectingFlightNumber: '',
  connectingAirport: '',    // mirrors arrivalAirport automatically
  destinationAirport: '',   // where passenger is flying TO after layover
  boardingTime: '12:00',
  departureTime: '12:30',
  connectionTypeId: '',
}

const initialProfile = {
  walkingSpeed: 'normal',       // slow | normal | fast
  hasBaggage: false,            // checked baggage
  withChildren: false,
  seniorCitizen: false,
  wheelchair: false,
  frequentTraveller: false,
  firstVisit: false,
  arrivalDelayMin: 0,           // estimated delay
}

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(LS_DRAFT_KEY) || 'null') } catch { return null }
}
function saveDraft(data) {
  try { localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(data)) } catch {}
}
function clearDraft() {
  try { localStorage.removeItem(LS_DRAFT_KEY) } catch {}
}

export function useMissedConnectionPredictor() {
  const [step, setStep] = useState(MCP_STEPS.CONNECTION)
  const [connection, setConnection] = useState(initialConnection)
  const [profile, setProfile] = useState(initialProfile)
  const [result, setResult] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState(null)
  const [dbReady, setDbReady] = useState(null)
  const [draftRestored, setDraftRestored] = useState(false)
  const skipSave = useRef(false)

  // ── Restore draft on mount ──
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      skipSave.current = true
      setStep(Math.min(draft.step ?? MCP_STEPS.CONNECTION, MCP_STEPS.RESULTS))
      setConnection(draft.connection || initialConnection)
      setProfile(draft.profile || initialProfile)
      setResult(draft.result || null)
      setDraftRestored(true)
      setTimeout(() => { skipSave.current = false }, 100)
    }
  }, [])

  // ── Auto-save draft ──
  useEffect(() => {
    if (skipSave.current) return
    saveDraft({ step, connection, profile, result })
  }, [step, connection, profile, result])

  // ── Seed graph ──
  const initDb = useCallback(async () => {
    try {
      await seedAirportGraphIfEmpty()
      setDbReady(true)
    } catch {
      setDbReady(false)
    }
  }, [])

  const nextStep = useCallback(() => setStep(s => s + 1), [])
  const prevStep = useCallback(() => setStep(s => Math.max(0, s - 1)), [])

  const reset = useCallback(() => {
    skipSave.current = true
    setStep(MCP_STEPS.CONNECTION)
    setConnection(initialConnection)
    setProfile(initialProfile)
    setResult(null)
    setError(null)
    setDraftRestored(false)
    clearDraft()
    setTimeout(() => { skipSave.current = false }, 100)
  }, [])

  const calculate = useCallback(async () => {
    setIsCalculating(true)
    setError(null)
    setStep(MCP_STEPS.CALCULATING)
    try {
      const res = await predictConnection({
        connectionTypeId: connection.connectionTypeId,
        airportCode: connection.arrivalAirport || connection.connectingAirport || 'DEL',
        arrivalTime: connection.arrivalTime,
        boardingTime: connection.boardingTime,
        departureTime: connection.departureTime,
        walkingSpeed: profile.walkingSpeed,
        passengerProfile: profile,
        arrivalDelayMin: profile.arrivalDelayMin,
      })
      setResult(res)
      setStep(MCP_STEPS.RESULTS)
    } catch (err) {
      setError('Prediction failed. Please try again.')
      setStep(MCP_STEPS.PROFILE)
      console.error('[MCP] Calculate failed:', err)
    } finally {
      setIsCalculating(false)
    }
  }, [connection, profile])

  return {
    step, nextStep, prevStep, reset,
    connection, setConnection: (patch) => setConnection(p => ({ ...p, ...patch })),
    profile, setProfile: (patch) => setProfile(p => ({ ...p, ...patch })),
    result,
    isCalculating, error,
    calculate,
    dbReady, initDb,
    draftRestored, setDraftRestored,
  }
}
