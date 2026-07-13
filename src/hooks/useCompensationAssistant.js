import { useState, useCallback, useEffect, useRef } from 'react'
import { analyzeCompensation } from '../api/compensationService'
import { seedIfEmpty } from '../api/neo4jSeed'
import { fetchSarvamCompletion } from '../api/sarvam'
import { jsPDF } from 'jspdf'

export const STEPS = {
  FLIGHT: 0,
  DISRUPTION: 1,
  ELIGIBILITY: 2,
  PASSENGER: 3,
  RESULTS: 4,
}

export const AIRLINES = [
  { id: 'indigo', name: 'IndiGo', code: '6E' },
  { id: 'air_india', name: 'Air India', code: 'AI' },
  { id: 'spicejet', name: 'SpiceJet', code: 'SG' },
  { id: 'vistara', name: 'Vistara', code: 'UK' },
  { id: 'akasa', name: 'Akasa Air', code: 'QP' },
]

export const AIRPORTS = [
  { code: 'BOM', name: 'Mumbai (BOM)', city: 'Mumbai' },
  { code: 'DEL', name: 'Delhi (DEL)', city: 'Delhi' },
  { code: 'BLR', name: 'Bengaluru (BLR)', city: 'Bengaluru' },
  { code: 'MAA', name: 'Chennai (MAA)', city: 'Chennai' },
  { code: 'HYD', name: 'Hyderabad (HYD)', city: 'Hyderabad' },
  { code: 'CCU', name: 'Kolkata (CCU)', city: 'Kolkata' },
  { code: 'COK', name: 'Kochi (COK)', city: 'Kochi' },
  { code: 'PNQ', name: 'Pune (PNQ)', city: 'Pune' },
  { code: 'AMD', name: 'Ahmedabad (AMD)', city: 'Ahmedabad' },
  { code: 'GOI', name: 'Goa (GOI)', city: 'Goa' },
]

const LS_DRAFT_KEY = 'flightpulse_comp_draft'
const LS_HISTORY_KEY = 'flightpulse_comp_history'

const initialFlightDetails = {
  airlineId: '',
  airline: '',
  flightNumber: '',
  date: new Date().toISOString().split('T')[0],
  origin: '',
  destination: '',
}

const initialDisruptionDetails = {
  type: '',
  delayRange: '',
  cause: '',
}

const initialPassengerDetails = {
  name: '',
  email: '',
  phone: '',
  passengerCount: 1,
}

// ── Confidence calculation ──────────────────────────────────────────────────
export function calculateConfidence(disruptionDetails, analysisResult, checkedDocs, documents) {
  const conditions = []

  const isAirline = disruptionDetails.cause === 'airline' || disruptionDetails.cause === 'unknown'
  conditions.push({ label: 'Airline responsible', met: isAirline })

  const hasType = Boolean(disruptionDetails.type)
  conditions.push({ label: 'Delay/disruption category identified', met: hasType })

  const totalDocs = documents?.length || 0
  const checkedCount = documents?.filter(d => checkedDocs[d.id]).length || 0
  const docsReady = totalDocs > 0 && checkedCount === totalDocs
  conditions.push({ label: 'Required documents available', met: docsReady })

  const ruleFound = Boolean(analysisResult?.rule?.id)
  conditions.push({ label: 'Matching compensation rule found', met: ruleFound })

  const metCount = conditions.filter(c => c.met).length
  const score = Math.round((metCount / conditions.length) * 100)

  return { score, conditions, metCount, total: conditions.length }
}

// ── Claim history helpers ───────────────────────────────────────────────────
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(history))
  } catch {}
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(LS_DRAFT_KEY) || 'null')
  } catch {
    return null
  }
}

function saveDraft(data) {
  try {
    localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(data))
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(LS_DRAFT_KEY)
  } catch {}
}

function genClaimId() {
  return `CLM-${Date.now().toString(36).toUpperCase()}`
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useCompensationAssistant() {
  const [step, setStep] = useState(STEPS.FLIGHT)
  const [flightDetails, setFlightDetails] = useState(initialFlightDetails)
  const [disruptionDetails, setDisruptionDetails] = useState(initialDisruptionDetails)
  const [passengerDetails, setPassengerDetails] = useState(initialPassengerDetails)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [dbReady, setDbReady] = useState(null)
  const [checkedDocs, setCheckedDocs] = useState({})
  const [complaintLetter, setComplaintLetter] = useState('')
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false)
  const [letterEditing, setLetterEditing] = useState(false)
  const [claimHistory, setClaimHistory] = useState(loadHistory)
  const [draftRestored, setDraftRestored] = useState(false)
  const [activeClaimId, setActiveClaimId] = useState(null)
  const skipDraftSave = useRef(false)

  // ── Restore draft on mount ──
  useEffect(() => {
    const draft = loadDraft()
    if (draft && draft.step != null) {
      skipDraftSave.current = true
      setStep(draft.step)
      setFlightDetails(draft.flightDetails || initialFlightDetails)
      setDisruptionDetails(draft.disruptionDetails || initialDisruptionDetails)
      setPassengerDetails(draft.passengerDetails || initialPassengerDetails)
      setAnalysisResult(draft.analysisResult || null)
      setCheckedDocs(draft.checkedDocs || {})
      setComplaintLetter(draft.complaintLetter || '')
      setActiveClaimId(draft.activeClaimId || null)
      setDraftRestored(true)
      setTimeout(() => { skipDraftSave.current = false }, 100)
    }
  }, [])

  // ── Auto-save draft on every change ──
  useEffect(() => {
    if (skipDraftSave.current) return
    const draft = {
      step, flightDetails, disruptionDetails, passengerDetails,
      analysisResult, checkedDocs, complaintLetter, activeClaimId,
    }
    saveDraft(draft)
  }, [step, flightDetails, disruptionDetails, passengerDetails, analysisResult, checkedDocs, complaintLetter, activeClaimId])

  // ── DB seed on page load ──
  const initDb = useCallback(async () => {
    try {
      await seedIfEmpty()
      setDbReady(true)
    } catch (err) {
      console.warn('[CompensationAssistant] Neo4j unavailable, fallback mode:', err.message)
      setDbReady(false)
    }
  }, [])

  // ── Step navigation ──
  const goToStep = useCallback((s) => setStep(s), [])
  const nextStep = useCallback(() => setStep(s => s + 1), [])
  const prevStep = useCallback(() => setStep(s => Math.max(0, s - 1)), [])

  const reset = useCallback(() => {
    skipDraftSave.current = true
    setStep(STEPS.FLIGHT)
    setFlightDetails(initialFlightDetails)
    setDisruptionDetails(initialDisruptionDetails)
    setPassengerDetails(initialPassengerDetails)
    setAnalysisResult(null)
    setAnalysisError(null)
    setCheckedDocs({})
    setComplaintLetter('')
    setActiveClaimId(null)
    setDraftRestored(false)
    clearDraft()
    setTimeout(() => { skipDraftSave.current = false }, 100)
  }, [])

  // ── Run eligibility analysis (Step 2 → 3) ──
  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      const result = await analyzeCompensation(flightDetails, disruptionDetails)
      setAnalysisResult(result)
      setStep(STEPS.ELIGIBILITY)
    } catch (err) {
      setAnalysisError('Could not determine eligibility. Please try again.')
      console.error('[CompensationAssistant] Analysis failed:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [flightDetails, disruptionDetails])

  // ── Toggle document checkbox ──
  const toggleDoc = useCallback((docId) => {
    setCheckedDocs(prev => ({ ...prev, [docId]: !prev[docId] }))
  }, [])

  // ── Save claim to history ──
  const saveClaim = useCallback((status = 'Draft') => {
    const id = activeClaimId || genClaimId()
    const claim = {
      id,
      createdAt: new Date().toISOString(),
      status,
      flightDetails,
      disruptionDetails,
      passengerDetails,
      analysisResult,
      checkedDocs,
      complaintLetter,
    }
    setClaimHistory(prev => {
      const filtered = prev.filter(c => c.id !== id)
      const next = [claim, ...filtered]
      saveHistory(next)
      return next
    })
    setActiveClaimId(id)
    return id
  }, [activeClaimId, flightDetails, disruptionDetails, passengerDetails, analysisResult, checkedDocs, complaintLetter])

  // ── Load claim from history ──
  const loadClaim = useCallback((claim) => {
    skipDraftSave.current = true
    setFlightDetails(claim.flightDetails)
    setDisruptionDetails(claim.disruptionDetails)
    setPassengerDetails(claim.passengerDetails)
    setAnalysisResult(claim.analysisResult)
    setCheckedDocs(claim.checkedDocs || {})
    setComplaintLetter(claim.complaintLetter || '')
    setActiveClaimId(claim.id)
    setStep(STEPS.RESULTS)
    setDraftRestored(false)
    setTimeout(() => { skipDraftSave.current = false }, 100)
  }, [])

  // ── Duplicate claim ──
  const duplicateClaim = useCallback((claim) => {
    skipDraftSave.current = true
    setFlightDetails(claim.flightDetails)
    setDisruptionDetails(claim.disruptionDetails)
    setPassengerDetails(claim.passengerDetails)
    setAnalysisResult(claim.analysisResult)
    setCheckedDocs(claim.checkedDocs || {})
    setComplaintLetter('')
    setActiveClaimId(null) // new claim
    setStep(STEPS.RESULTS)
    setTimeout(() => { skipDraftSave.current = false }, 100)
  }, [])

  // ── Delete claim from history ──
  const deleteClaim = useCallback((claimId) => {
    setClaimHistory(prev => {
      const next = prev.filter(c => c.id !== claimId)
      saveHistory(next)
      return next
    })
    if (activeClaimId === claimId) {
      reset()
    }
  }, [activeClaimId, reset])

  // ── Update claim status ──
  const updateClaimStatus = useCallback((claimId, status) => {
    setClaimHistory(prev => {
      const next = prev.map(c => c.id === claimId ? { ...c, status } : c)
      saveHistory(next)
      return next
    })
  }, [])

  // ── Generate complaint letter via Sarvam AI ──
  const generateComplaintLetter = useCallback(async () => {
    setIsGeneratingLetter(true)
    const { rule, airlineInfo } = analysisResult
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    const prompt = `Generate a professional, formal airline compensation complaint letter in English.

Passenger Name: ${passengerDetails.name || 'Passenger'}
Flight Number: ${flightDetails.airline} ${flightDetails.flightNumber}
Date of Travel: ${flightDetails.date}
Route: ${flightDetails.origin} to ${flightDetails.destination}
Disruption: ${disruptionDetails.type === 'delay' ? `Flight delay of ${disruptionDetails.delayRange.replace('_', '-')} hours` : disruptionDetails.type === 'cancellation' ? 'Flight cancellation' : 'Denied boarding'}
Cause: ${disruptionDetails.cause}
Compensation Requested: ${rule.estimatedAmountNote}
Regulation: ${rule.regulationRef}

The letter should:
- Be addressed to "The Nodal Officer, ${airlineInfo?.name || flightDetails.airline}"
- Use formal tone
- Reference DGCA regulations
- Clearly state the compensation amount requested
- Request a response within 30 days
- Include space for signature

Output ONLY the letter text, no explanation.`

    try {
      const messages = [
        { role: 'system', content: 'You are a formal legal letter writer specializing in Indian aviation passenger rights. Respond ONLY in English.' },
        { role: 'user', content: prompt },
      ]
      const letter = await fetchSarvamCompletion(messages)
      setComplaintLetter(letter)
    } catch {
      setComplaintLetter(`${today}

The Nodal Officer
${airlineInfo?.name || flightDetails.airline}

Subject: Compensation Claim for Flight Disruption — Flight ${flightDetails.airline} ${flightDetails.flightNumber} on ${flightDetails.date}

Dear Sir/Madam,

I, ${passengerDetails.name || '[Your Name]'}, write to formally claim compensation for the disruption experienced on Flight ${flightDetails.airline} ${flightDetails.flightNumber} travelling from ${flightDetails.origin} to ${flightDetails.destination} on ${flightDetails.date}.

The flight was ${disruptionDetails.type === 'delay' ? `delayed by ${disruptionDetails.delayRange.replace('_', '-')} hours` : disruptionDetails.type === 'cancellation' ? 'cancelled' : 'subject to denied boarding'}, which constitutes a disruption under DGCA CAR Section 3, Series M, Part IV.

In accordance with the DGCA Passenger Rights regulations (2025 Update), I hereby claim the following entitlement:
${rule.estimatedAmountNote}

I request you to process this claim and respond within 30 days. Failure to respond may compel me to escalate this matter to the AirSewa grievance portal (airsewa.gov.in).

Yours sincerely,
${passengerDetails.name || '[Your Name]'}
Email: ${passengerDetails.email || '[Your Email]'}
Phone: ${passengerDetails.phone || '[Your Phone]'}`)
    } finally {
      setIsGeneratingLetter(false)
    }
  }, [analysisResult, flightDetails, disruptionDetails, passengerDetails])

  // ── Download complaint as PDF ──
  const downloadPDF = useCallback(() => {
    const doc = new jsPDF()
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2
    const lineHeight = 7

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)

    const lines = doc.splitTextToSize(complaintLetter, maxWidth)
    let y = margin

    lines.forEach(line => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    })

    const fileName = `complaint_${flightDetails.flightNumber || 'flight'}_${flightDetails.date}.pdf`
    doc.save(fileName)
  }, [complaintLetter, flightDetails])

  return {
    step, goToStep, nextStep, prevStep, reset,
    flightDetails, setFlightDetails,
    disruptionDetails, setDisruptionDetails,
    passengerDetails, setPassengerDetails,
    analysisResult,
    isAnalyzing, analysisError,
    runAnalysis,
    dbReady, initDb,
    checkedDocs, toggleDoc,
    complaintLetter, setComplaintLetter,
    isGeneratingLetter,
    generateComplaintLetter,
    downloadPDF,
    letterEditing, setLetterEditing,
    claimHistory,
    saveClaim,
    loadClaim,
    duplicateClaim,
    deleteClaim,
    updateClaimStatus,
    draftRestored, setDraftRestored,
    activeClaimId,
  }
}
