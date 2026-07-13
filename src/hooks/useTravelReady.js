import { useState, useCallback, useEffect } from 'react'
import { getCountryRules, initCountryRules } from '../api/countryRulesService'
import { executeTravelReadyWorkflow, WORKFLOW_STAGES } from '../api/travelReadyWorkflow'
import { DESTINATIONS } from '../data/countryRulesData'

export function useTravelReady() {
  const [step, setStep] = useState(0) // 0: Dest, 1: Guide, 2: Checklist, 3: Processing, 4: Results
  const [destinationCode, setDestinationCode] = useState('')
  const [countryRules, setCountryRules] = useState(null)
  
  const [checklist, setChecklist] = useState({
    passportValid: false,
    visaApproved: false,
    travelInsurance: false,
    immigrationDocs: false,
    carryingMedicine: false,
    hasPrescription: false,
    carryingPowerBank: false,
    powerBankLocation: '',
    carryingFood: false,
    carryingDrone: false,
    cashAboveLimit: false
  })
  
  const [completedStages, setCompletedStages] = useState(0)
  const [readinessResult, setReadinessResult] = useState(null)
  const [aiSummary, setAiSummary] = useState('')
  const [isAISummaryLoading, setIsAISummaryLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    initCountryRules()
  }, [])
  
  const handleDestinationChange = async (code) => {
    setDestinationCode(code)
    if (code) {
      setIsLoading(true)
      try {
        const { rules } = await getCountryRules(code)
        setCountryRules(rules)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    } else {
        setCountryRules(null)
    }
  }
  
  const updateChecklist = (key, value) => {
    setChecklist(prev => ({ ...prev, [key]: value }))
  }
  
  const nextStep = () => setStep(s => Math.min(4, s + 1))
  const prevStep = () => setStep(s => Math.max(0, s - 1))
  const goToStep = (s) => setStep(s)
  
  const runWorkflow = async () => {
    setStep(3) // Processing
    setCompletedStages(0)
    setIsAISummaryLoading(true)
    
    const destObj = DESTINATIONS.find(d => d.code === destinationCode)
    
    try {
        const result = await executeTravelReadyWorkflow(
            { destination: destObj, checklist, countryRules },
            (stageIndex, stageId) => {
                setCompletedStages(stageIndex)
                if (stageId === 'ai_summary') {
                    setIsAISummaryLoading(false)
                }
            }
        )
        setReadinessResult(result)
        setAiSummary(result.aiSummary)
        setStep(4) // Results
    } catch (err) {
        console.error("Workflow error", err)
        // Fallback UI or error handling
        setStep(2)
    }
  }
  
  const restart = () => {
      setStep(0)
      setDestinationCode('')
      setCountryRules(null)
      setChecklist({
        passportValid: false, visaApproved: false, travelInsurance: false,
        immigrationDocs: false, carryingMedicine: false, hasPrescription: false,
        carryingPowerBank: false, powerBankLocation: '', carryingFood: false,
        carryingDrone: false, cashAboveLimit: false
      })
      setReadinessResult(null)
      setAiSummary('')
  }
  
  const downloadPDF = async () => {
    // Dynamically import jsPDF (assuming it's installed)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.setFontSize(20)
      doc.text(`TravelReady Checklist: ${countryRules.name}`, 20, 20)
      
      doc.setFontSize(14)
      doc.text(`Score: ${readinessResult.score}/100 - ${readinessResult.tier.label}`, 20, 30)
      
      doc.setFontSize(12)
      let y = 40
      readinessResult.warnings.forEach(w => {
          doc.text(`${w.status === 'ready' ? '[X]' : '[ ]'} ${w.label}: ${w.explanation}`, 20, y)
          y += 10
      })
      
      doc.text('AI Advice:', 20, y + 10)
      const splitText = doc.splitTextToSize(aiSummary, 170)
      doc.text(splitText, 20, y + 20)
      
      doc.save(`TravelReady_${destinationCode}.pdf`)
    } catch (err) {
      console.error('Error generating PDF', err)
      alert('Could not generate PDF. Please ensure jsPDF is installed.')
    }
  }
  
  const shareLinks = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`My TravelReady score for ${countryRules?.name} is ${readinessResult?.score}/100! ✈️`)}`,
      email: `mailto:?subject=TravelReady Checklist for ${countryRules?.name}&body=${encodeURIComponent(`Here is my readiness summary...`)}`
  }
  
  const destination = DESTINATIONS.find(d => d.code === destinationCode)

  return {
    step, nextStep, prevStep, goToStep, restart,
    destinationCode, destination, handleDestinationChange,
    countryRules, isLoading,
    checklist, updateChecklist,
    runWorkflow, workflowStages: WORKFLOW_STAGES, completedStages,
    readinessResult, aiSummary, isAISummaryLoading,
    downloadPDF, shareLinks
  }
}
